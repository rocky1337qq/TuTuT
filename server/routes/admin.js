const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

// Все маршруты в этом файле требуют права администратора
router.use(auth, admin);

// Статистика для дашборда: GET /api/admin/stats
router.get('/stats', async (req, res) => {
  try {
    const [[{ totalApartments }]] = await pool.query('SELECT COUNT(*) AS totalApartments FROM apartments');
    const [[{ totalUsers }]] = await pool.query('SELECT COUNT(*) AS totalUsers FROM users');
    const [[{ totalBookings }]] = await pool.query('SELECT COUNT(*) AS totalBookings FROM bookings');
    const [[{ totalRevenue }]] = await pool.query("SELECT COALESCE(SUM(total_price), 0) AS totalRevenue FROM bookings WHERE status = 'confirmed'");

    res.json({
      totalApartments,
      totalUsers,
      totalBookings,
      totalRevenue
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ error: 'Ошибка сервера при получении статистики' });
  }
});

// Список всех квартир: GET /api/admin/apartments
router.get('/apartments', async (req, res) => {
  try {
    const [apartments] = await pool.query('SELECT * FROM apartments ORDER BY id DESC');

    const [photos] = await pool.query('SELECT apartment_id, url FROM photos ORDER BY sort_order ASC');
    const [amenities] = await pool.query(`
      SELECT aa.apartment_id, am.name 
      FROM apartment_amenities aa
      JOIN amenities am ON aa.amenity_id = am.id
      ORDER BY am.id ASC
    `);

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

    const result = apartments.map(apt => ({
      ...apt,
      photos: photosMap[apt.id] || [],
      amenities: amenitiesMap[apt.id] || []
    }));

    res.json(result);
  } catch (err) {
    console.error('Admin get apartments error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Создание квартиры: POST /api/admin/apartments
router.post('/apartments', async (req, res) => {
  try {
    const { name, city, address, coords, price, description, rooms, area, floor, photos, amenities } = req.body;

    if (!name || !address || !price) {
      return res.status(400).json({ error: 'Заполните обязательные поля: название, адрес, цена' });
    }

    const [result] = await pool.query(`
      INSERT INTO apartments (name, city, address, coords, price, description, rooms, area, floor)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      name.trim(),
      city ? city.trim() : 'Оренбург',
      address.trim(),
      coords ? coords.trim() : '51.831664,55.171192',
      Number(price),
      description ? description.trim() : '',
      Number(rooms) || 1,
      Number(area) || 30,
      Number(floor) || 1
    ]);

    const aptId = result.insertId;

    // Сохраняем фото
    if (Array.isArray(photos) && photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        const url = photos[i].trim();
        if (url) {
          await pool.query('INSERT INTO photos (apartment_id, url, sort_order) VALUES (?, ?, ?)', [aptId, url, i]);
        }
      }
    }

    // Сохраняем удобства
    if (Array.isArray(amenities) && amenities.length > 0) {
      for (const amenityName of amenities) {
        if (!amenityName || !amenityName.trim()) continue;
        const [existing] = await pool.query('SELECT id FROM amenities WHERE name = ?', [amenityName.trim()]);
        let amId;
        if (existing.length > 0) {
          amId = existing[0].id;
        } else {
          const [ins] = await pool.query('INSERT INTO amenities (name) VALUES (?)', [amenityName.trim()]);
          amId = ins.insertId;
        }
        await pool.query('INSERT IGNORE INTO apartment_amenities (apartment_id, amenity_id) VALUES (?, ?)', [aptId, amId]);
      }
    }

    res.status(201).json({ message: 'Квартира успешно добавлена', id: aptId });
  } catch (err) {
    console.error('Admin create apartment error:', err);
    res.status(500).json({ error: 'Ошибка сервера при создании квартиры' });
  }
});

// Редактирование квартиры: PUT /api/admin/apartments/:id
router.put('/apartments/:id', async (req, res) => {
  try {
    const aptId = Number(req.params.id);
    const { name, city, address, coords, price, description, rooms, area, floor, photos, amenities } = req.body;

    await pool.query(`
      UPDATE apartments 
      SET name = ?, city = ?, address = ?, coords = ?, price = ?, description = ?, rooms = ?, area = ?, floor = ?
      WHERE id = ?
    `, [
      name.trim(),
      city ? city.trim() : 'Оренбург',
      address.trim(),
      coords ? coords.trim() : '51.831664,55.171192',
      Number(price),
      description ? description.trim() : '',
      Number(rooms) || 1,
      Number(area) || 30,
      Number(floor) || 1,
      aptId
    ]);

    // Обновляем фото если переданы
    if (Array.isArray(photos)) {
      await pool.query('DELETE FROM photos WHERE apartment_id = ?', [aptId]);
      for (let i = 0; i < photos.length; i++) {
        const url = photos[i].trim();
        if (url) {
          await pool.query('INSERT INTO photos (apartment_id, url, sort_order) VALUES (?, ?, ?)', [aptId, url, i]);
        }
      }
    }

    // Обновляем удобства если переданы
    if (Array.isArray(amenities)) {
      await pool.query('DELETE FROM apartment_amenities WHERE apartment_id = ?', [aptId]);
      for (const amenityName of amenities) {
        if (!amenityName || !amenityName.trim()) continue;
        const [existing] = await pool.query('SELECT id FROM amenities WHERE name = ?', [amenityName.trim()]);
        let amId;
        if (existing.length > 0) {
          amId = existing[0].id;
        } else {
          const [ins] = await pool.query('INSERT INTO amenities (name) VALUES (?)', [amenityName.trim()]);
          amId = ins.insertId;
        }
        await pool.query('INSERT IGNORE INTO apartment_amenities (apartment_id, amenity_id) VALUES (?, ?)', [aptId, amId]);
      }
    }

    res.json({ message: 'Квартира успешно обновлена' });
  } catch (err) {
    console.error('Admin update apartment error:', err);
    res.status(500).json({ error: 'Ошибка сервера при обновлении квартиры' });
  }
});

// Удаление квартиры: DELETE /api/admin/apartments/:id
router.delete('/apartments/:id', async (req, res) => {
  try {
    const aptId = Number(req.params.id);
    await pool.query('DELETE FROM apartments WHERE id = ?', [aptId]);
    res.json({ message: 'Квартира успешно удалена' });
  } catch (err) {
    console.error('Admin delete apartment error:', err);
    res.status(500).json({ error: 'Ошибка сервера при удалении квартиры' });
  }
});

// Все бронирования: GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
  try {
    const [bookings] = await pool.query(`
      SELECT 
        b.id, b.apartment_id, b.user_id, b.guest_name, b.guest_phone,
        b.checkin, b.checkout, b.total_price, b.comment, b.status, b.created_at,
        a.name AS apartment_name, a.address AS apartment_address,
        u.email AS user_email
      FROM bookings b
      JOIN apartments a ON b.apartment_id = a.id
      JOIN users u ON b.user_id = u.id
      ORDER BY b.created_at DESC
    `);
    res.json(bookings);
  } catch (err) {
    console.error('Admin get bookings error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Изменение статуса бронирования: PUT /api/admin/bookings/:id
router.put('/bookings/:id', async (req, res) => {
  try {
    const bookingId = Number(req.params.id);
    const { status } = req.body;

    if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Некорректный статус' });
    }

    await pool.query('UPDATE bookings SET status = ? WHERE id = ?', [status, bookingId]);
    res.json({ message: 'Статус бронирования успешно изменён' });
  } catch (err) {
    console.error('Admin update booking error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Все пользователи: GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT id, name, email, phone, role, created_at,
        (SELECT COUNT(*) FROM bookings WHERE user_id = users.id) AS bookings_count,
        (SELECT COUNT(*) FROM reviews WHERE user_id = users.id) AS reviews_count
      FROM users
      ORDER BY id ASC
    `);
    res.json(users);
  } catch (err) {
    console.error('Admin get users error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Смена роли пользователя: PUT /api/admin/users/:id/role
router.put('/users/:id/role', async (req, res) => {
  try {
    const userId = Number(req.params.id);
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Некорректная роль' });
    }

    // Запретить снимать роль с самого себя
    if (userId === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'Вы не можете лишить себя прав администратора' });
    }

    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    res.json({ message: 'Роль пользователя успешно изменена' });
  } catch (err) {
    console.error('Admin change role error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Все отзывы для модерации: GET /api/admin/reviews
router.get('/reviews', async (req, res) => {
  try {
    const [reviews] = await pool.query(`
      SELECT 
        r.id, r.rating, r.comment, r.created_at,
        u.name AS user_name, u.email AS user_email,
        a.name AS apartment_name, a.id AS apartment_id
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      JOIN apartments a ON r.apartment_id = a.id
      ORDER BY r.created_at DESC
    `);
    res.json(reviews);
  } catch (err) {
    console.error('Admin get reviews error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Удаление отзыва (модерация): DELETE /api/admin/reviews/:id
router.delete('/reviews/:id', async (req, res) => {
  try {
    const reviewId = Number(req.params.id);
    await pool.query('DELETE FROM reviews WHERE id = ?', [reviewId]);
    res.json({ message: 'Отзыв успешно удалён' });
  } catch (err) {
    console.error('Admin delete review error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Справочник всех удобств: GET /api/admin/amenities
router.get('/amenities', async (req, res) => {
  try {
    const [amenities] = await pool.query('SELECT * FROM amenities ORDER BY name ASC');
    res.json(amenities);
  } catch (err) {
    console.error('Admin get amenities error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
