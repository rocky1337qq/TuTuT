// Скрипт панели администратора

document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  checkAuth();

  var user = API.getUser();
  var token = API.getToken();

  // Защита доступа: только администраторы
  if (!user || !token || user.role !== 'admin') {
    alert('Доступ запрещён! Раздел предназначен только для администраторов сайта.');
    window.location.href = 'index.html';
    return;
  }

  loadStats();
  loadAdminApartments();
});

function switchAdminTab(tab) {
  document.querySelectorAll('.admin-nav-tab').forEach(function(b) { b.classList.remove('active'); });
  document.querySelectorAll('.admin-tab-content').forEach(function(c) { c.classList.remove('active'); });

  var activeBtn = Array.from(document.querySelectorAll('.admin-nav-tab')).find(function(b) {
    return b.textContent.toLowerCase().includes(tab);
  });
  if (activeBtn) activeBtn.classList.add('active');

  var tabContent = document.getElementById('tab-' + tab);
  if (tabContent) tabContent.classList.add('active');

  if (tab === 'apartments') loadAdminApartments();
  if (tab === 'bookings') loadAdminBookings();
  if (tab === 'users') loadAdminUsers();
  if (tab === 'reviews') loadAdminReviews();
}

// Загрузка статистики дашборда
async function loadStats() {
  try {
    var stats = await API.get('/admin/stats');
    document.getElementById('statApartments').textContent = stats.totalApartments || 0;
    document.getElementById('statUsers').textContent = stats.totalUsers || 0;
    document.getElementById('statBookings').textContent = stats.totalBookings || 0;
    document.getElementById('statRevenue').textContent = formatPrice(stats.totalRevenue || 0) + ' руб';
  } catch (err) {
    console.error('Stats load error:', err);
  }
}

// 1. Управление квартирами
var cachedApartments = [];

async function loadAdminApartments() {
  var tbody = document.getElementById('adminApartmentsList');
  if (!tbody) return;

  try {
    cachedApartments = await API.get('/admin/apartments');
    if (cachedApartments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Квартир пока нет</td></tr>';
      return;
    }

    var html = '';
    cachedApartments.forEach(function(apt) {
      var photo = apt.photos && apt.photos.length > 0 ? apt.photos[0] : 'images/tusovka.jpg';
      html +=
        '<tr>' +
          '<td>' + apt.id + '</td>' +
          '<td><img src="' + escapeHtml(photo) + '" alt="" style="width: 50px; height: 35px; object-fit: cover; border-radius: 4px;"></td>' +
          '<td><strong>' + escapeHtml(apt.name) + '</strong></td>' +
          '<td>' + escapeHtml(apt.address) + '</td>' +
          '<td>' + apt.rooms + ' комн.</td>' +
          '<td><strong>' + formatPrice(apt.price) + ' руб</strong></td>' +
          '<td>' +
            '<button class="btn btn-sm" onclick="editApartment(' + apt.id + ')">Редакт.</button>' +
            '<button class="btn btn-sm btn-outline" style="color: #dc3545; border-color: #dc3545;" onclick="deleteApartment(' + apt.id + ')">Удалить</button>' +
          '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" style="color: #dc3545; text-align: center;">Ошибка загрузки: ' + escapeHtml(err.message) + '</td></tr>';
  }
}

function openApartmentModal(apt) {
  var form = document.getElementById('apartmentForm');
  form.reset();

  if (apt) {
    document.getElementById('aptModalTitle').textContent = 'Редактировать квартиру #' + apt.id;
    document.getElementById('formAptId').value = apt.id;
    document.getElementById('aptFormName').value = apt.name || '';
    document.getElementById('aptFormAddress').value = apt.address || '';
    document.getElementById('aptFormCoords').value = apt.coords || '';
    document.getElementById('aptFormPrice').value = apt.price || '';
    document.getElementById('aptFormRooms').value = apt.rooms || 1;
    document.getElementById('aptFormArea').value = apt.area || 30;
    document.getElementById('aptFormFloor').value = apt.floor || 1;
    document.getElementById('aptFormDesc').value = apt.description || '';
    document.getElementById('aptFormPhotos').value = (apt.photos || []).join(', ');
    document.getElementById('aptFormAmenities').value = (apt.amenities || []).join(', ');
  } else {
    document.getElementById('aptModalTitle').textContent = 'Добавить новую квартиру';
    document.getElementById('formAptId').value = '';
    document.getElementById('aptFormCoords').value = '51.831664,55.171192';
  }

  openModal('aptModal');
}

function editApartment(id) {
  var apt = cachedApartments.find(function(a) { return a.id === id; });
  if (apt) openApartmentModal(apt);
}

async function deleteApartment(id) {
  if (!confirm('Вы уверены, что хотите удалить квартиру #' + id + '? Все связанные бронирования и отзывы также будут удалены!')) return;

  try {
    await API.delete('/admin/apartments/' + id);
    alert('Квартира успешно удалена');
    loadStats();
    loadAdminApartments();
  } catch (err) {
    alert(err.message || 'Ошибка удаления');
  }
}

// Форма добавления/редактирования квартиры
document.getElementById('apartmentForm').onsubmit = async function(e) {
  e.preventDefault();
  var id = document.getElementById('formAptId').value;
  var name = document.getElementById('aptFormName').value.trim();
  var address = document.getElementById('aptFormAddress').value.trim();
  var coords = document.getElementById('aptFormCoords').value.trim();
  var price = Number(document.getElementById('aptFormPrice').value);
  var rooms = Number(document.getElementById('aptFormRooms').value);
  var area = Number(document.getElementById('aptFormArea').value);
  var floor = Number(document.getElementById('aptFormFloor').value);
  var desc = document.getElementById('aptFormDesc').value.trim();

  var photosRaw = document.getElementById('aptFormPhotos').value;
  var photos = photosRaw.split(/[\n,]/).map(function(s) { return s.trim(); }).filter(Boolean);

  var amenitiesRaw = document.getElementById('aptFormAmenities').value;
  var amenities = amenitiesRaw.split(',').map(function(s) { return s.trim(); }).filter(Boolean);

  var payload = {
    name: name,
    address: address,
    coords: coords,
    price: price,
    rooms: rooms,
    area: area,
    floor: floor,
    description: desc,
    photos: photos,
    amenities: amenities
  };

  try {
    if (id) {
      await API.put('/admin/apartments/' + id, payload);
      alert('Квартира успешно обновлена!');
    } else {
      await API.post('/admin/apartments', payload);
      alert('Квартира успешно добавлена!');
    }
    closeModal('aptModal');
    loadStats();
    loadAdminApartments();
  } catch (err) {
    alert(err.message || 'Ошибка сохранения квартиры');
  }
};

// 2. Управление бронированиями
async function loadAdminBookings() {
  var tbody = document.getElementById('adminBookingsList');
  if (!tbody) return;

  try {
    var bookings = await API.get('/admin/bookings');
    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center;">Бронирований пока нет</td></tr>';
      return;
    }

    var html = '';
    bookings.forEach(function(b) {
      var statusClass = 'badge-pending';
      var statusText = 'Ожидание';
      if (b.status === 'confirmed') { statusClass = 'badge-confirmed'; statusText = 'Подтверждено'; }
      if (b.status === 'cancelled') { statusClass = 'badge-cancelled'; statusText = 'Отменено'; }

      var dates = (b.checkin ? formatDate(b.checkin) : '') + ' — ' + (b.checkout ? formatDate(b.checkout) : '');

      var actions = '';
      if (b.status === 'pending') {
        actions += '<button class="btn btn-sm" style="background: #28a745;" onclick="changeBookingStatus(' + b.id + ', \'confirmed\')">✓ Подтвердить</button>';
        actions += '<button class="btn btn-sm btn-outline" style="color: #dc3545; border-color: #dc3545;" onclick="changeBookingStatus(' + b.id + ', \'cancelled\')">✕ Отклонить</button>';
      } else if (b.status === 'confirmed') {
        actions += '<button class="btn btn-sm btn-outline" style="color: #dc3545; border-color: #dc3545;" onclick="changeBookingStatus(' + b.id + ', \'cancelled\')">Отменить</button>';
      } else {
        actions += '<span style="color: var(--text-secondary); font-size: 12px;">Архив</span>';
      }

      html +=
        '<tr>' +
          '<td>' + b.id + '</td>' +
          '<td><strong>' + escapeHtml(b.apartment_name) + '</strong></td>' +
          '<td>' + escapeHtml(b.guest_name) + '<br><small style="color: var(--text-secondary);">' + escapeHtml(b.user_email) + '</small></td>' +
          '<td>' + escapeHtml(b.guest_phone) + '</td>' +
          '<td>' + dates + '</td>' +
          '<td><strong>' + formatPrice(b.total_price) + ' руб</strong></td>' +
          '<td><span class="badge ' + statusClass + '">' + statusText + '</span></td>' +
          '<td>' + actions + '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="8" style="color: #dc3545; text-align: center;">Ошибка загрузки: ' + escapeHtml(err.message) + '</td></tr>';
  }
}

async function changeBookingStatus(id, newStatus) {
  try {
    await API.put('/admin/bookings/' + id, { status: newStatus });
    loadStats();
    loadAdminBookings();
  } catch (err) {
    alert(err.message || 'Ошибка обновления статуса');
  }
}

// 3. Управление пользователями
async function loadAdminUsers() {
  var tbody = document.getElementById('adminUsersList');
  if (!tbody) return;

  try {
    var users = await API.get('/admin/users');
    var currentUser = API.getUser();
    var html = '';

    users.forEach(function(u) {
      var roleBadge = u.role === 'admin'
        ? '<span class="badge badge-admin">Администратор</span>'
        : '<span class="badge badge-user">Пользователь</span>';

      var toggleBtn = '';
      if (u.id !== currentUser.id) {
        var newRole = u.role === 'admin' ? 'user' : 'admin';
        var btnText = u.role === 'admin' ? 'Снять админа' : 'Сделать админом';
        toggleBtn = '<button class="btn btn-sm btn-outline" onclick="changeUserRole(' + u.id + ', \'' + newRole + '\')">' + btnText + '</button>';
      } else {
        toggleBtn = '<small style="color: var(--text-secondary);">Вы</small>';
      }

      html +=
        '<tr>' +
          '<td>' + u.id + '</td>' +
          '<td><strong>' + escapeHtml(u.name) + '</strong></td>' +
          '<td>' + escapeHtml(u.email) + '</td>' +
          '<td>' + escapeHtml(u.phone || '—') + '</td>' +
          '<td>' + u.bookings_count + '</td>' +
          '<td>' + roleBadge + '</td>' +
          '<td>' + toggleBtn + '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" style="color: #dc3545; text-align: center;">Ошибка загрузки пользователей</td></tr>';
  }
}

async function changeUserRole(id, role) {
  if (!confirm('Вы уверены, что хотите изменить роль пользователя на ' + role + '?')) return;

  try {
    await API.put('/admin/users/' + id + '/role', { role: role });
    loadAdminUsers();
  } catch (err) {
    alert(err.message || 'Ошибка изменения роли');
  }
}

// 4. Модерация отзывов
async function loadAdminReviews() {
  var tbody = document.getElementById('adminReviewsList');
  if (!tbody) return;

  try {
    var reviews = await API.get('/admin/reviews');
    if (reviews.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Отзывов пока нет</td></tr>';
      return;
    }

    var html = '';
    reviews.forEach(function(r) {
      var stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      var dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString('ru-RU') : '';

      html +=
        '<tr>' +
          '<td>' + r.id + '</td>' +
          '<td><strong>' + escapeHtml(r.apartment_name) + '</strong></td>' +
          '<td>' + escapeHtml(r.user_name) + '<br><small style="color: var(--text-secondary);">' + escapeHtml(r.user_email) + '</small></td>' +
          '<td><span style="color: #ffc107;">' + stars + '</span></td>' +
          '<td style="max-width: 300px;">' + escapeHtml(r.comment) + '</td>' +
          '<td>' + dateStr + '</td>' +
          '<td>' +
            '<button class="btn btn-sm btn-outline" style="color: #dc3545; border-color: #dc3545;" onclick="deleteReview(' + r.id + ')">Удалить</button>' +
          '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" style="color: #dc3545; text-align: center;">Ошибка загрузки отзывов</td></tr>';
  }
}

async function deleteReview(id) {
  if (!confirm('Удалить данный отзыв?')) return;

  try {
    await API.delete('/admin/reviews/' + id);
    alert('Отзыв удалён');
    loadAdminReviews();
  } catch (err) {
    alert(err.message || 'Ошибка удаления отзыва');
  }
}
