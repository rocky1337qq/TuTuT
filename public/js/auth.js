// Модуль аутентификации (JWT + REST API)

function checkAuth() {
  var user = API.getUser();
  var token = API.getToken();
  var authDiv = document.getElementById('authButtons');

  if (!authDiv) return;

  if (user && token) {
    var displayName = user.name || user.email || 'Пользователь';
    var firstLetter = (user.name ? user.name.charAt(0) : user.email.charAt(0)).toUpperCase();
    var shortName = user.name ? user.name.split(' ')[0] : user.email.split('@')[0];

    var adminLink = user.role === 'admin'
      ? '<a href="admin.html" class="admin-link" style="color: #2e7d32; font-weight: 600;">👑 Админ-панель</a>'
      : '';

    authDiv.innerHTML =
      '<div class="user-menu">' +
        '<button class="user-btn" onclick="toggleUserMenu()">' +
          '<span class="avatar">' + escapeHtml(firstLetter) + '</span>' +
          escapeHtml(shortName) +
        '</button>' +
        '<div class="user-dropdown" id="userDropdown">' +
          '<div class="dropdown-header">' +
            '<strong>' + escapeHtml(displayName) + '</strong>' +
            '<small>' + (user.role === 'admin' ? 'Администратор' : 'Гость') + '</small>' +
          '</div>' +
          adminLink +
          '<a href="profile.html">Личный кабинет</a>' +
          '<a href="#" class="logout" onclick="logout(event)">Выйти</a>' +
        '</div>' +
      '</div>';
  } else {
    authDiv.innerHTML = '<button class="btn" onclick="openModal(\'loginModal\')">Вход</button>';
  }
}

function toggleUserMenu() {
  var menu = document.getElementById('userDropdown');
  if (menu) menu.classList.toggle('active');
}

document.addEventListener('click', function(e) {
  var d = document.getElementById('userDropdown');
  var b = document.querySelector('.user-btn');
  if (d && b && !b.contains(e.target) && !d.contains(e.target)) {
    d.classList.remove('active');
  }
});

function openModal(id) {
  var modal = document.getElementById(id);
  if (modal) modal.classList.add('active');
}

function closeModal(id) {
  var modal = document.getElementById(id);
  if (modal) modal.classList.remove('active');
}

document.querySelectorAll('.modal').forEach(function(m) {
  m.addEventListener('click', function(e) {
    if (e.target === m) m.classList.remove('active');
  });
});

// Форма входа
var loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.onsubmit = async function(e) {
    e.preventDefault();
    var email = document.getElementById('loginEmail').value.trim();
    var password = document.getElementById('loginPassword').value;
    var submitBtn = this.querySelector('button[type="submit"]');

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Вход...';

      var data = await API.post('/auth/login', { email: email, password: password });
      API.setToken(data.token);
      API.setUser(data.user);

      closeModal('loginModal');
      checkAuth();
      this.reset();

      // Если пользователь вошёл на странице профиля или админки, перезагружаем
      if (window.location.pathname.endsWith('profile.html') && window.loadProfile) {
        window.loadProfile();
        if (window.showBookings) window.showBookings();
      }
    } catch (err) {
      alert(err.message || 'Ошибка входа');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Войти';
    }
  };
}

// Форма регистрации
var registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.onsubmit = async function(e) {
    e.preventDefault();
    var name = document.getElementById('regName').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var password = document.getElementById('regPassword').value;
    var submitBtn = this.querySelector('button[type="submit"]');

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Регистрация...';

      var data = await API.post('/auth/register', {
        name: name,
        email: email,
        password: password
      });

      API.setToken(data.token);
      API.setUser(data.user);

      closeModal('registerModal');
      checkAuth();
      this.reset();
      alert('Регистрация прошла успешно! Добро пожаловать, ' + data.user.name);
    } catch (err) {
      alert(err.message || 'Ошибка при регистрации');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Зарегистрироваться';
    }
  };
}

function logout(e) {
  if (e && e.preventDefault) e.preventDefault();

  if (confirm('Вы действительно хотите выйти из аккаунта?')) {
    API.clearAuth();
    checkAuth();

    // Если находимся в защищённых разделах — редирект на главную
    var path = window.location.pathname;
    if (path.endsWith('profile.html') || path.endsWith('admin.html')) {
      window.location.href = 'index.html';
    }
  }
}
