// Личный кабинет пользователя

async function loadProfile() {
  var user = API.getUser();
  var token = API.getToken();

  // Редирект для неавторизованных пользователей
  if (!user || !token) {
    alert('Личный кабинет доступен только авторизованным пользователям');
    window.location.href = 'index.html';
    return;
  }

  // Обновляем аватарку первой буквой имени
  var firstLetter = (user.name ? user.name.charAt(0) : user.email.charAt(0)).toUpperCase();
  var avatarElem = document.getElementById('profileAvatar');
  if (avatarElem) avatarElem.textContent = firstLetter;

  var nameElem = document.getElementById('profileName');
  if (nameElem) nameElem.textContent = user.name || 'Пользователь';

  var emailElem = document.getElementById('profileEmail');
  if (emailElem) emailElem.textContent = user.email || '';

  var editName = document.getElementById('editName');
  if (editName) editName.value = user.name || '';

  var editEmail = document.getElementById('editEmail');
  if (editEmail) {
    editEmail.value = user.email || '';
    editEmail.disabled = true; // Email менять нельзя
  }

  var editPhone = document.getElementById('editPhone');
  if (editPhone) editPhone.value = user.phone || '';

  var roleBadge = document.getElementById('profileRoleBadge');
  if (roleBadge) {
    roleBadge.textContent = user.role === 'admin' ? '👑 Администратор' : 'Гость';
    roleBadge.style.display = 'inline-block';
  }
}

async function showBookings() {
  var container = document.getElementById('bookingsList');
  var noBookings = document.getElementById('noBookings');
  if (!container) return;

  container.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Загрузка ваших бронирований...</p>';

  try {
    var bookings = await API.get('/bookings/my');

    if (!bookings || bookings.length === 0) {
      container.innerHTML = '';
      if (noBookings) noBookings.style.display = 'block';
      return;
    }

    if (noBookings) noBookings.style.display = 'none';

    var html = '';
    bookings.forEach(function(b) {
      var statusClass = 'pending';
      var statusText = 'Ожидает подтверждения';
      if (b.status === 'confirmed') {
        statusClass = 'confirmed';
        statusText = 'Подтверждено';
      } else if (b.status === 'cancelled') {
        statusClass = 'cancelled';
        statusText = 'Отменено';
      }

      var checkinStr = b.checkin ? formatDate(b.checkin, true) : '—';
      var checkoutStr = b.checkout ? formatDate(b.checkout, true) : '—';
      var photo = b.photo_url || 'images/tusovka.jpg';

      var cancelButton = b.status !== 'cancelled'
        ? '<button class="btn btn-outline" style="padding: 6px 12px; font-size: 13px; color: #dc3545; border-color: #dc3545;" onclick="cancelBooking(' + b.id + ')">Отменить</button>'
        : '';

      html +=
        '<div class="booking-item" style="display: flex; gap: 16px; align-items: center; padding: 16px; background: var(--bg-secondary); border-radius: 8px; margin-bottom: 12px; border: 1px solid var(--border); flex-wrap: wrap;">' +
          '<img src="' + escapeHtml(photo) + '" alt="" style="width: 100px; height: 75px; object-fit: cover; border-radius: 6px;">' +
          '<div class="info" style="flex: 1; min-width: 200px;">' +
            '<div class="apt-name" style="font-weight: 600; font-size: 16px; margin-bottom: 4px;">' + escapeHtml(b.apartment_name) + '</div>' +
            '<div style="font-size: 13px; color: var(--text-secondary); margin-bottom: 4px;">' + escapeHtml(b.apartment_address) + '</div>' +
            '<div class="apt-dates" style="font-size: 14px; color: var(--accent);">' + checkinStr + ' — ' + checkoutStr + '</div>' +
          '</div>' +
          '<div class="right" style="text-align: right; min-width: 150px;">' +
            '<span class="status ' + statusClass + '" style="display: inline-block; padding: 4px 10px; border-radius: 4px; font-size: 12px; font-weight: 600; margin-bottom: 6px;">' + statusText + '</span>' +
            '<div class="price" style="font-weight: 700; font-size: 16px; margin-bottom: 8px;">' + formatPrice(b.total_price) + ' руб</div>' +
            cancelButton +
          '</div>' +
        '</div>';
    });

    container.innerHTML = html;
  } catch (err) {
    container.innerHTML = '<p style="color: #dc3545; text-align: center;">Ошибка загрузки бронирований: ' + escapeHtml(err.message) + '</p>';
  }
}

async function cancelBooking(id) {
  if (!confirm('Вы действительно хотите отменить данное бронирование?')) return;

  try {
    await API.put('/bookings/' + id + '/cancel', {});
    alert('Бронирование отменено');
    showBookings();
  } catch (err) {
    alert(err.message || 'Ошибка при отмене бронирования');
  }
}

// Сохранение изменений профиля
var profileForm = document.getElementById('profileForm');
if (profileForm) {
  profileForm.onsubmit = async function(e) {
    e.preventDefault();
    var name = document.getElementById('editName').value.trim();
    var phone = document.getElementById('editPhone') ? document.getElementById('editPhone').value.trim() : '';

    if (!name) {
      alert('Имя не может быть пустым');
      return;
    }

    try {
      var res = await API.put('/auth/profile', { name: name, phone: phone });
      API.setUser(res.user);
      if (res.token) API.setToken(res.token);

      checkAuth();
      loadProfile();
      alert('Профиль успешно обновлён!');
    } catch (err) {
      alert(err.message || 'Ошибка обновления профиля');
    }
  };
}
