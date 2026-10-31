// Модуль оформления бронирования через API

function openBooking() {
  var user = API.getUser();
  var token = API.getToken();

  if (!user || !token) {
    alert('Пожалуйста, войдите в аккаунт или зарегистрируйтесь для бронирования квартиры');
    openModal('loginModal');
    return;
  }

  var bookingModal = document.getElementById('bookingModal');
  if (!bookingModal) return;

  // Автозаполнение данных пользователя
  var nameInput = document.getElementById('bookName');
  var phoneInput = document.getElementById('bookPhone');
  if (nameInput && user.name) nameInput.value = user.name;
  if (phoneInput && user.phone) phoneInput.value = user.phone;

  // Расчёт стоимости и периода
  var checkinVal = getUrlParameter('checkin') || '';
  var checkoutVal = getUrlParameter('checkout') || '';
  var infoDiv = document.getElementById('bookingInfo');

  if (infoDiv && window.currentApartment) {
    var nights = calculateNights(checkinVal, checkoutVal);
    var nightsText = nights > 0 ? nights + ' суток' : 'уточняется';
    var totalCost = nights > 0 ? formatPrice(nights * window.currentApartment.price) + ' руб' : 'рассчитывается';

    infoDiv.innerHTML =
      '<div style="background: var(--bg-secondary, #f8f9fa); padding: 14px; border-radius: 8px; margin-bottom: 16px; border: 1px solid var(--border); font-size: 14px;">' +
        '<div style="font-weight: 600; margin-bottom: 6px;">' + escapeHtml(window.currentApartment.name) + '</div>' +
        '<div style="color: var(--text-secondary);">' + escapeHtml(window.currentApartment.address) + '</div>' +
        '<hr style="margin: 8px 0; border: none; border-top: 1px solid var(--border);">' +
        '<div style="display: flex; justify-content: space-between; margin-bottom: 4px;">' +
          '<span>Заезд: <b>' + (checkinVal ? formatDate(checkinVal, true) : 'не выбрано') + '</b></span>' +
          '<span>Выезд: <b>' + (checkoutVal ? formatDate(checkoutVal, true) : 'не выбрано') + '</b></span>' +
        '</div>' +
        '<div style="display: flex; justify-content: space-between; font-weight: 600; margin-top: 6px; color: var(--accent);">' +
          '<span>Длительность: ' + nightsText + '</span>' +
          '<span>Итого: ' + totalCost + '</span>' +
        '</div>' +
      '</div>';
  }

  bookingModal.classList.add('active');
}

function closeBooking() {
  var bookingModal = document.getElementById('bookingModal');
  if (bookingModal) bookingModal.classList.remove('active');
}

var bookBtn = document.getElementById('bookBtn');
if (bookBtn) {
  bookBtn.onclick = openBooking;
}

var bookingForm = document.getElementById('bookingForm');
if (bookingForm) {
  bookingForm.onsubmit = async function(e) {
    e.preventDefault();

    if (!window.currentApartment) {
      alert('Данные квартиры не загружены');
      return;
    }

    var checkinVal = getUrlParameter('checkin');
    var checkoutVal = getUrlParameter('checkout');

    if (!checkinVal || !checkoutVal) {
      var customCheckin = prompt('Укажите дату заезда (ГГГГ-ММ-ДД):', '2026-11-10');
      var customCheckout = prompt('Укажите дату выезда (ГГГГ-ММ-ДД):', '2026-11-13');
      if (!customCheckin || !customCheckout) {
        alert('Даты бронирования обязательны!');
        return;
      }
      checkinVal = customCheckin;
      checkoutVal = customCheckout;
    }

    var name = document.getElementById('bookName').value.trim();
    var phone = document.getElementById('bookPhone').value.trim();
    var comment = document.getElementById('bookMessage') ? document.getElementById('bookMessage').value.trim() : '';
    var submitBtn = document.getElementById('submitBtn');

    try {
      submitBtn.textContent = 'Оформление...';
      submitBtn.disabled = true;

      var response = await API.post('/bookings', {
        apartment_id: window.currentApartment.id,
        checkin: checkinVal,
        checkout: checkoutVal,
        guest_name: name,
        guest_phone: phone,
        comment: comment
      });

      alert('🎉 ' + response.message + '\nИтого к оплате: ' + formatPrice(response.booking.total_price) + ' руб.');
      closeBooking();
      bookingForm.reset();

      if (confirm('Перейти в личный кабинет для просмотра бронирования?')) {
        window.location.href = 'profile.html?tab=bookings';
      }
    } catch (err) {
      alert('Ошибка при бронировании: ' + err.message);
    } finally {
      // Кнопка разблокируется ТОЛЬКО после завершения запроса
      submitBtn.textContent = 'Отправить заявку';
      submitBtn.disabled = false;
    }
  };
}
