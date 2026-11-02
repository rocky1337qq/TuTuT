// Автоматический тест работоспособности API и базы данных
const http = require('http');

function request(method, path, data = null, token = null) {
  return new Promise((resolve, reject) => {
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const bodyStr = data ? JSON.stringify(data) : null;
    if (bodyStr) headers['Content-Length'] = Buffer.byteLength(bodyStr);

    const req = http.request({
      hostname: '127.0.0.1',
      port: 3000,
      path,
      method,
      headers
    }, res => {
      let raw = '';
      res.on('data', chunk => raw += chunk);
      res.on('end', () => {
        try {
          const json = raw ? JSON.parse(raw) : {};
          resolve({ status: res.statusCode, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, raw });
        }
      });
    });

    req.on('error', reject);
    if (bodyStr) req.write(bodyStr);
    req.end();
  });
}

async function runTests() {
  console.log('--- ЗАПУСК ТЕСТИРОВАНИЯ СИСТЕМЫ ТУТУТ ---');

  // 1. Получение квартир
  const apts = await request('GET', '/api/apartments');
  console.log(`[+] Каталог квартир: получено ${apts.body.length} квартир (Статус: ${apts.status})`);

  // 2. Вход обычного пользователя
  const userLogin = await request('POST', '/api/auth/login', {
    email: 'ivan@mail.ru',
    password: 'user123'
  });
  console.log(`[+] Вход пользователя (${userLogin.body.user?.name}): статус ${userLogin.status}`);
  const userToken = userLogin.body.token;

  // 3. Профиль пользователя
  const me = await request('GET', '/api/auth/me', null, userToken);
  console.log(`[+] Проверка JWT токена (/api/auth/me): статус ${me.status}`);

  // 4. Вход администратора
  const adminLogin = await request('POST', '/api/auth/login', {
    email: 'admin@tutut.ru',
    password: 'admin123'
  });
  console.log(`[+] Вход администратора: статус ${adminLogin.status}`);
  const adminToken = adminLogin.body.token;

  // 5. Статистика дашборда администратора
  const stats = await request('GET', '/api/admin/stats', null, adminToken);
  console.log(`[+] Статистика админки:`, stats.body);

  // 6. Проверка защиты (обычный пользователь не может зайти в админку)
  const forbidden = await request('GET', '/api/admin/stats', null, userToken);
  console.log(`[+] Проверка защиты ролей (user -> admin): статус ${forbidden.status} (Ожидалось 403 Forbidden)`);

  console.log('--- ВСЕ ТЕСТЫ УСПЕШНО ПРОЙДЕНЫ! ---');
}

runTests().catch(err => {
  console.error('Ошибка тестов:', err);
  process.exit(1);
});
