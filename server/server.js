const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const apartmentRoutes = require('./routes/apartments');
const bookingRoutes = require('./routes/bookings');
const reviewRoutes = require('./routes/reviews');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Раздача статических файлов фронтенда
app.use(express.static(path.join(__dirname, '../public')));

// API маршруты
app.use('/api/auth', authRoutes);
app.use('/api/apartments', apartmentRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin', adminRoutes);

// 404 для неизвестных API эндпоинтов
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API эндпоинт не найден' });
});

// Глобальная обработка ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Внутренняя ошибка сервера' });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 Сервер «ТуТуТ» запущен на порту ${PORT}`);
  console.log(`🌐 Сайт доступен: http://localhost:${PORT}`);
  console.log(`👑 Админ-панель:  http://localhost:${PORT}/admin.html`);
  console.log(`=========================================`);
});
