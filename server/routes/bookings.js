const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// Создание бронирования: POST /api/bookings
router.post('/', auth, async (req, res) => {
  try {
    const { apartment_id, checkin, checkout, guest_name, guest_phone, comment } = req.body;

    if (!apartment_id || !checkin || !checkout || !guest_name || !guest_phone) {
      return res.status(400).json({ error: 'Пожалуйста, заполните все обязательные поля' });
    }

    const checkinDate = new Date(checkin);
    const checkoutDate = new Date(checkout);

    if (isNaN(checkinDate.getTime()) || isNaN(checkoutDate.getTime())) {
      return res.status(400).json({ error: 'Некорректный формат дат' });
    }

    if (checkinDate >= checkoutDate) {
      return res.status(400).json({ error: 'Дата выезда должна быть позже даты заезда' });
    }

    // Проверяем существование квартиры
    const [apts] = await pool.query('SELECT id, name, price FROM apartments WHERE id = ?', [Number(apartment_id)]);
    if (apts.length === 0) {
      return res.status(404).json({ error: 'Квартира не найдена' });
    }
    const apt = apts[0];

    // Проверяем пересечение дат с уже существующими бронированиями
    const [conflicts] = await pool.query(`
      SELECT id FROM bookings 
      WHERE apartment_id = ? 
        AND status != 'cancelled'
        AND checkin < ? 
        AND checkout > ?
    `, [apt.id, checkout, checkin]);

    if (conflicts.length > 0) {
      return res.status(400).json({ error: 'Выбранные даты уже заняты другим гостем' });
    }

    // Расчёт количества суток и итоговой стоимости
    const diffTime = checkoutDate.getTime() - checkinDate.getTime();
    const nights = Math.max(1, Math.round(diffTime / (1000 * 60 * 60 * 24)));
    const totalPrice = nights * apt.price;

    const [result] = await pool.query(`
      INSERT INTO bookings (apartment_id, user_id, guest_name, guest_phone, checkin, checkout, total_price, comment, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')
    `, [
      apt.id,
      req.user.id,
      guest_name.trim(),
      guest_phone.trim(),
      checkin,
      checkout,
      totalPrice,
      comment ? comment.trim() : null
    ]);

    const newBooking = {
      id: result.insertId,
      apartment_id: apt.id,
      apartment_name: apt.name,
      user_id: req.user.id,
      guest_name: guest_name.trim(),
      guest_phone: guest_phone.trim(),
      checkin,
      checkout,
      nights,
      total_price: totalPrice,
      status: 'pending'
    };

    res.status(201).json({
      message: 'Заявка на бронирование успешно оформлена!',
      booking: newBooking
    });
  } catch (err) {
    console.error('Create booking error:', err);
    res.status(500).json({ error: 'Ошибка сервера при создании бронирования' });
  }
});

// Мои бронирования: GET /api/bookings/my
router.get('/my', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        b.id, b.apartment_id, b.checkin, b.checkout, b.total_price, b.status, b.comment, b.created_at,
        a.name AS apartment_name, a.address AS apartment_address, a.price AS apartment_price,
        (SELECT url FROM photos WHERE apartment_id = a.id ORDER BY sort_order ASC LIMIT 1) AS photo_url
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      WHERE b.user_id = ?
      ORDER BY b.created_at DESC
    `, [req.user.id]);

    res.json(rows);
  } catch (err) {
    console.error('Get my bookings error:', err);
    res.status(500).json({ error: 'Ошибка сервера при получении бронирований' });
  }
});

// Отмена бронирования пользователем: PUT /api/bookings/:id/cancel
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    const bookingId = Number(req.params.id);

    // Проверяем принадлежность бронирования
    const [rows] = await pool.query('SELECT * FROM bookings WHERE id = ?', [bookingId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Бронирование не найдено' });
    }

    const booking = rows[0];
    if (booking.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Нет прав на отмену этого бронирования' });
    }

    await pool.query("UPDATE bookings SET status = 'cancelled' WHERE id = ?", [bookingId]);

    res.json({ message: 'Бронирование успешно отменено' });
  } catch (err) {
    console.error('Cancel booking error:', err);
    res.status(500).json({ error: 'Ошибка сервера при отмене бронирования' });
  }
});

module.exports = router;
