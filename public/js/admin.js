// Панель управления администратора

document.addEventListener('DOMContentLoaded', function() {
  initTheme();
  checkAuth();

  var user = API.getUser();
  var token = API.getToken();

  // Защита доступа: только администраторы
  if (!user || !token || user.role !== 'admin') {
    alert('Доступ запрещен. Раздел предназначен исключительно для администраторов сервиса.');
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
    return b.getAttribute('onclick') && b.getAttribute('onclick').includes(tab);
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
    document.getElementById('statRevenue').textContent = formatPrice(stats.totalRevenue || 0) + ' ₽';
  } catch (err) {
    console.error('Stats load error:', err);
  }
}

// 1. Управление объектами недвижимости
var cachedApartments = [];

async function loadAdminApartments() {
  var tbody = document.getElementById('adminApartmentsList');
  if (!tbody) return;

  try {
    cachedApartments = await API.get('/admin/apartments');
    if (cachedApartments.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 30px;">Объекты не найдены</td></tr>';
      return;
    }

    var html = '';
    cachedApartments.forEach(function(apt) {
      var photo = apt.photos && apt.photos.length > 0 ? apt.photos[0] : 'images/tusovka.jpg';
      html +=
        '<tr>' +
          '<td><span style="font-weight: 600; color: var(--text-secondary);">#' + apt.id + '</span></td>' +
          '<td><img src="' + escapeHtml(photo) + '" alt="" style="width: 52px; height: 38px; object-fit: cover; border-radius: 6px; border: 1px solid var(--border);"></td>' +
          '<td><strong style="color: var(--text);">' + escapeHtml(apt.name) + '</strong></td>' +
          '<td style="color: var(--text-secondary);">' + escapeHtml(apt.address) + '</td>' +
          '<td>' + apt.rooms + ' ' + getRoomsText(apt.rooms) + '</td>' +
          '<td><strong style="color: var(--accent);">' + formatPrice(apt.price) + ' ₽</strong></td>' +
          '<td>' +
            '<button class="btn-action btn-action-outline" onclick="editApartment(' + apt.id + ')">Изменить</button> ' +
            '<button class="btn-action btn-action-danger" onclick="deleteApartment(' + apt.id + ')">Удалить</button>' +
          '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" style="color: #dc2626; text-align: center;">Ошибка загрузки: ' + escapeHtml(err.message) + '</td></tr>';
  }
}

function openApartmentModal(apt) {
  var form = document.getElementById('apartmentForm');
  form.reset();

  if (apt) {
    document.getElementById('aptModalTitle').textContent = 'Редактировать объект #' + apt.id;
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
    document.getElementById('aptModalTitle').textContent = 'Добавить новый объект';
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
  if (!confirm('Подтвердите удаление объекта #' + id + '. Все связанные заявки и отзывы будут удалены.')) return;

  try {
    await API.delete('/admin/apartments/' + id);
    loadStats();
    loadAdminApartments();
  } catch (err) {
    alert(err.message || 'Ошибка при удалении');
  }
}

// Сохранение объекта
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
    } else {
      await API.post('/admin/apartments', payload);
    }
    closeModal('aptModal');
    loadStats();
    loadAdminApartments();
  } catch (err) {
    alert(err.message || 'Ошибка сохранения данных');
  }
};

// 2. Управление бронированиями
async function loadAdminBookings() {
  var tbody = document.getElementById('adminBookingsList');
  if (!tbody) return;

  try {
    var bookings = await API.get('/admin/bookings');
    if (bookings.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 30px;">Заявки на бронирование отсутствуют</td></tr>';
      return;
    }

    var html = '';
    bookings.forEach(function(b) {
      var statusClass = 'badge-pending';
      var statusText = 'Ожидает решения';
      if (b.status === 'confirmed') { statusClass = 'badge-confirmed'; statusText = 'Подтверждено'; }
      if (b.status === 'cancelled') { statusClass = 'badge-cancelled'; statusText = 'Отменено'; }

      var dates = (b.checkin ? formatDate(b.checkin, true) : '') + ' — ' + (b.checkout ? formatDate(b.checkout, true) : '');

      var actions = '';
      if (b.status === 'pending') {
        actions += '<button class="btn-action btn-action-primary" onclick="changeBookingStatus(' + b.id + ', \'confirmed\')">Подтвердить</button> ';
        actions += '<button class="btn-action btn-action-danger" onclick="changeBookingStatus(' + b.id + ', \'cancelled\')">Отклонить</button>';
      } else if (b.status === 'confirmed') {
        actions += '<button class="btn-action btn-action-danger" onclick="changeBookingStatus(' + b.id + ', \'cancelled\')">Отменить бронь</button>';
      } else {
        actions += '<span style="color: var(--text-muted); font-size: 12px;">Архив</span>';
      }

      html +=
        '<tr>' +
          '<td><span style="font-weight: 600; color: var(--text-secondary);">#' + b.id + '</span></td>' +
          '<td><strong>' + escapeHtml(b.apartment_name) + '</strong></td>' +
          '<td>' + escapeHtml(b.guest_name) + '<br><small style="color: var(--text-secondary);">' + escapeHtml(b.user_email) + '</small></td>' +
          '<td>' + escapeHtml(b.guest_phone) + '</td>' +
          '<td>' + dates + '</td>' +
          '<td><strong>' + formatPrice(b.total_price) + ' ₽</strong></td>' +
          '<td><span class="badge ' + statusClass + '">' + statusText + '</span></td>' +
          '<td>' + actions + '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="8" style="color: #dc2626; text-align: center;">Ошибка загрузки: ' + escapeHtml(err.message) + '</td></tr>';
  }
}

async function changeBookingStatus(id, newStatus) {
  try {
    await API.put('/admin/bookings/' + id, { status: newStatus });
    loadStats();
    loadAdminBookings();
  } catch (err) {
    alert(err.message || 'Ошибка обновления статуса заявки');
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
        var btnText = u.role === 'admin' ? 'Снять права админа' : 'Назначить админом';
        toggleBtn = '<button class="btn-action btn-action-outline" onclick="changeUserRole(' + u.id + ', \'' + newRole + '\')">' + btnText + '</button>';
      } else {
        toggleBtn = '<small style="color: var(--text-muted); font-weight: 600;">Текущий профиль</small>';
      }

      html +=
        '<tr>' +
          '<td><span style="font-weight: 600; color: var(--text-secondary);">#' + u.id + '</span></td>' +
          '<td><strong style="color: var(--text);">' + escapeHtml(u.name) + '</strong></td>' +
          '<td>' + escapeHtml(u.email) + '</td>' +
          '<td>' + escapeHtml(u.phone || '—') + '</td>' +
          '<td>' + u.bookings_count + '</td>' +
          '<td>' + roleBadge + '</td>' +
          '<td>' + toggleBtn + '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" style="color: #dc2626; text-align: center;">Ошибка загрузки пользователей</td></tr>';
  }
}

async function changeUserRole(id, role) {
  var roleText = role === 'admin' ? 'Администратор' : 'Пользователь';
  if (!confirm('Подтвердите изменение роли пользователя на: ' + roleText)) return;

  try {
    await API.put('/admin/users/' + id, { role: role });
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
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-secondary); padding: 30px;">Отзывы пока не оставлены</td></tr>';
      return;
    }

    var html = '';
    reviews.forEach(function(r) {
      var dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString('ru-RU') : '';
      var ratingBadge = '<span style="display: inline-flex; align-items: center; gap: 4px; font-weight: 700; color: #b45309; background: rgba(245, 158, 11, 0.12); padding: 2px 8px; border-radius: 4px;">' +
        '<svg width="13" height="13" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
        r.rating + ' / 5</span>';

      html +=
        '<tr>' +
          '<td><span style="font-weight: 600; color: var(--text-secondary);">#' + r.id + '</span></td>' +
          '<td><strong>' + escapeHtml(r.apartment_name) + '</strong></td>' +
          '<td>' + escapeHtml(r.user_name) + '<br><small style="color: var(--text-secondary);">' + escapeHtml(r.user_email) + '</small></td>' +
          '<td>' + ratingBadge + '</td>' +
          '<td style="max-width: 320px; line-height: 1.4;">' + escapeHtml(r.comment) + '</td>' +
          '<td style="color: var(--text-secondary);">' + dateStr + '</td>' +
          '<td>' +
            '<button class="btn-action btn-action-danger" onclick="deleteReview(' + r.id + ')">Удалить</button>' +
          '</td>' +
        '</tr>';
    });
    tbody.innerHTML = html;
  } catch (err) {
    tbody.innerHTML = '<tr><td colspan="7" style="color: #dc2626; text-align: center;">Ошибка загрузки отзывов</td></tr>';
  }
}

async function deleteReview(id) {
  if (!confirm('Подтвердите удаление отзыва #' + id)) return;

  try {
    await API.delete('/admin/reviews/' + id);
    loadAdminReviews();
  } catch (err) {
    alert(err.message || 'Ошибка при удалении отзыва');
  }
}
