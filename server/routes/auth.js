const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');
const auth = require('../middleware/auth');

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'super_secret_coursework_jwt_key_2026';
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    },
    secret,
    { expiresIn: '7d' }
  );
}

// Регистрация: POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Пожалуйста, заполните имя, email и пароль' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Пароль должен содержать не менее 6 символов' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();

    // Проверяем, существует ли пользователь
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [cleanEmail]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'Пользователь с таким email уже зарегистрирован' });
    }

    // Хэширование пароля (bcrypt с salt 10)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const [result] = await pool.query(
      'INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)',
      [cleanName, cleanEmail, hashedPassword, phone || null, 'user']
    );

    const newUser = {
      id: result.insertId,
      name: cleanName,
      email: cleanEmail,
      phone: phone || null,
      role: 'user'
    };

    const token = generateToken(newUser);

    res.status(201).json({
      message: 'Регистрация прошла успешно',
      token,
      user: newUser
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Ошибка сервера при регистрации' });
  }
});

// Авторизация: POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Введите email и пароль' });
    }

    const cleanEmail = email.trim().toLowerCase();

    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [cleanEmail]);
    if (rows.length === 0) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const user = rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Неверный email или пароль' });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    };

    const token = generateToken(userData);

    res.json({
      message: 'Вход выполнен успешно',
      token,
      user: userData
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Ошибка сервера при входе' });
  }
});

// Текущий пользователь: GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Пользователь не найден' });
    }

    res.json({ user: rows[0] });
  } catch (err) {
    console.error('Get me error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

// Обновление профиля: PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ error: 'Имя не может быть пустым' });
    }

    await pool.query(
      'UPDATE users SET name = ?, phone = ? WHERE id = ?',
      [name.trim(), phone || null, req.user.id]
    );

    const [rows] = await pool.query(
      'SELECT id, name, email, phone, role FROM users WHERE id = ?',
      [req.user.id]
    );

    const updatedUser = rows[0];
    const token = generateToken(updatedUser);

    res.json({
      message: 'Профиль успешно обновлён',
      user: updatedUser,
      token
    });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ error: 'Ошибка сервера' });
  }
});

module.exports = router;
