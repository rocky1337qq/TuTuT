const express = require('express');
const router = express.Router();
const pool = require('../config/db');

// Получение списка квартир с фильтрацией: GET /api/apartments
router.get('/', async (req, res) => {
  try {
    const { checkin, checkout, rooms, minPrice, maxPrice, onlyAvailable } = req.query;

    const params = [];
    let availabilitySelect = '1 AS is_available';

    if (checkin && checkout) {
      availabilitySelect = `
        CASE WHEN EXISTS (
          SELECT 1 FROM bookings b 
          WHERE b.apartment_id = a.id 
            AND b.status != 'cancelled' 
            AND b.checkin < ? 
            AND b.checkout > ?
        ) THEN 0 ELSE 1 END AS is_available
      `;
      params.push(checkout, checkin);
    }

    let query = `
      SELECT 
        a.id, a.name, a.city, a.address, a.coords, a.price, a.description,
        a.rooms, a.area, a.floor, a.created_at,
        ${availabilitySelect},
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
        COUNT(DISTINCT r.id) AS reviews_count
      FROM apartments a
      LEFT JOIN reviews r ON a.id = r.apartment_id
      WHERE 1=1
    `;

    if (rooms) {
      query += ` AND a.rooms = ?`;
      params.push(Number(rooms));
    }

    if (minPrice) {
      query += ` AND a.price >= ?`;
      params.push(Number(minPrice));
    }

    if (maxPrice) {
      query += ` AND a.price <= ?`;
      params.push(Number(maxPrice));
    }

    query += ` GROUP BY a.id`;

    // Если запрошены строго только доступные
    if (checkin && checkout && onlyAvailable === 'true') {
      query += ` HAVING is_available = 1`;
    }

    // Сортировка: свободные сначала, затем по ID
    if (checkin && checkout) {
      query += ` ORDER BY is_available DESC, a.id ASC`;
    } else {
      query += ` ORDER BY a.id ASC`;
    }

    const [apartments] = await pool.query(query, params);

    // Загружаем фотографии для всех квартир
    const [photos] = await pool.query(
      'SELECT apartment_id, url FROM photos ORDER BY apartment_id ASC, sort_order ASC'
    );

    // Загружаем удобства
    const [amenities] = await pool.query(`
      SELECT aa.apartment_id, am.name 
      FROM apartment_amenities aa
      JOIN amenities am ON aa.amenity_id = am.id
      ORDER BY aa.apartment_id ASC, am.id ASC
    `);

    // Загружаем занятые диапазоны дат (активные бронирования)
    const [activeBookings] = await pool.query(
      "SELECT apartment_id, checkin, checkout FROM bookings WHERE status != 'cancelled' AND checkout >= CURDATE()"
    );

    // Группируем фото, удобства и даты по apartment_id
    const photosMap = {};
    photos.forEach(p => {
      if (!photosMap[p.apartment_id]) photosMap[p.apartment_id] = [];
      photosMap[p.apartment_id].push(p.url);
    });

    const amenitiesMap = {};
    amenities.forEach(a => {
      if (!amenitiesMap[a.apartment_id]) amenitiesMap[a.apartment_id] = [];
      amenitiesMap[a.apartment_id].push(a.name);
    });

    const bookingsMap = {};
    activeBookings.forEach(b => {
      if (!bookingsMap[b.apartment_id]) bookingsMap[b.apartment_id] = [];
      bookingsMap[b.apartment_id].push({ checkin: b.checkin, checkout: b.checkout });
    });

    const result = apartments.map(apt => ({
      ...apt,
      is_available: apt.is_available === 1 || apt.is_available === true,
      photos: photosMap[apt.id] || [],
      amenities: amenitiesMap[apt.id] || [],
      bookedDates: bookingsMap[apt.id] || []
    }));

    res.json(result);
  } catch (err) {
    console.error('Get apartments error:', err);
    res.status(500).json({ error: 'Ошибка сервера при загрузке квартир' });
  }
});

// Получение одной квартиры по ID: GET /api/apartments/:id
router.get('/:id', async (req, res) => {
  try {
    const aptId = Number(req.params.id);

    const [rows] = await pool.query(`
      SELECT 
        a.id, a.name, a.city, a.address, a.coords, a.price, a.description,
        a.rooms, a.area, a.floor, a.created_at,
        COALESCE(ROUND(AVG(r.rating), 1), 0) AS avg_rating,
        COUNT(DISTINCT r.id) AS reviews_count
      FROM apartments a
      LEFT JOIN reviews r ON a.id = r.apartment_id
      WHERE a.id = ?
      GROUP BY a.id
    `, [aptId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Квартира не найдена' });
    }

    const apt = rows[0];

    // Фотографии
    const [photos] = await pool.query(
      'SELECT url FROM photos WHERE apartment_id = ? ORDER BY sort_order ASC',
      [aptId]
    );

    // Удобства
    const [amenities] = await pool.query(`
      SELECT am.name 
      FROM apartment_amenities aa
      JOIN amenities am ON aa.amenity_id = am.id
      WHERE aa.apartment_id = ?
      ORDER BY am.id ASC
    `, [aptId]);

    // Отзывы
    const [reviews] = await pool.query(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name, u.id AS user_id
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.apartment_id = ?
      ORDER BY r.created_at DESC
    `, [aptId]);

    // Занятые даты
    const [bookings] = await pool.query(
      "SELECT checkin, checkout FROM bookings WHERE apartment_id = ? AND status != 'cancelled' ORDER BY checkin ASC",
      [aptId]
    );

    res.json({
      ...apt,
      photos: photos.map(p => p.url),
      amenities: amenities.map(a => a.name),
      reviews,
      bookedDates: bookings
    });
  } catch (err) {
    console.error('Get apartment error:', err);
    res.status(500).json({ error: 'Ошибка сервера при получении данных квартиры' });
  }
});

module.exports = router;
