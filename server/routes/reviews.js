const express = require('express');
const router = express.Router();
const pool = require('../config/db');
const auth = require('../middleware/auth');

// Отзывы квартиры: GET /api/reviews/apartment/:id
router.get('/apartment/:id', async (req, res) => {
  try {
    const aptId = Number(req.params.id);
    const [reviews] = await pool.query(`
      SELECT r.id, r.rating, r.comment, r.created_at, u.name AS user_name, u.id AS user_id
      FROM reviews r
      JOIN users u ON r.user_id = u.id
      WHERE r.apartment_id = ?
      ORDER BY r.created_at DESC
    `, [aptId]);

    res.json(reviews);
  } catch (err) {
    console.error('Get reviews error:', err);
    res.status(500).json({ error: 'Ошибка сервера при получении отзывов' });
  }
});

// Добавить отзыв: POST /api/reviews
router.post('/', auth, async (req, res) => {
  try {
    const { apartment_id, rating, comment } = req.body;

    if (!apartment_id || !rating || !comment || !comment.trim()) {
      return res.status(400).json({ error: 'Пожалуйста, заполните оценку и текст отзыва' });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({ error: 'Оценка должна быть числом от 1 до 5' });
    }

    const [apts] = await pool.query('SELECT id FROM apartments WHERE id = ?', [Number(apartment_id)]);
    if (apts.length === 0) {
      return res.status(404).json({ error: 'Квартира не найдена' });
    }

    const [result] = await pool.query(`
      INSERT INTO reviews (apartment_id, user_id, rating, comment)
      VALUES (?, ?, ?, ?)
    `, [Number(apartment_id), req.user.id, numRating, comment.trim()]);

    const newReview = {
      id: result.insertId,
      apartment_id: Number(apartment_id),
      user_id: req.user.id,
      user_name: req.user.name,
      rating: numRating,
      comment: comment.trim(),
      created_at: new Date().toISOString()
    };

    res.status(201).json({
      message: 'Отзыв успешно добавлен!',
      review: newReview
    });
  } catch (err) {
    console.error('Post review error:', err);
    res.status(500).json({ error: 'Ошибка сервера при сохранении отзыва' });
  }
});

module.exports = router;
