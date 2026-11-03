// Модуль бронирования (интеграция с проверкой доступности дат)

function openBooking() {
  var user = API.getUser();
  var token = API.getToken();

  if (!user || !token) {
    alert('Пожалуйста, выполните вход в учетную запись для бронирования объекта');
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

  // Считываем выбранные даты из инпутов карточки или URL
  var checkinVal = (document.getElementById('checkinInput') && document.getElementById('checkinInput').value) || getUrlParameter('checkin') || '';
  var checkoutVal = (document.getElementById('checkoutInput') && document.getElementById('checkoutInput').value) || getUrlParameter('checkout') || '';

  if (!checkinVal || !checkoutVal) {
    alert('Пожалуйста, выберите даты заезда и выезда в блоке бронирования');
    return;
  }

  // Проверка на пересечение с занятыми датами
  if (window.currentApartment && window.currentApartment.bookedDates) {
    for (var i = 0; i < window.currentApartment.bookedDates.length; i++) {
      var b = window.currentApartment.bookedDates[i];
      if (checkinVal < b.checkout && checkoutVal > b.checkin) {
        alert('Выбранные даты (' + formatDate(checkinVal, true) + ' — ' + formatDate(checkoutVal, true) + ') уже заняты другим гостем. Пожалуйста, выберите свободный период.');
        return;
      }
    }
  }

  var infoDiv = document.getElementById('bookingInfo');
  if (infoDiv && window.currentApartment) {
    var nights = calculateNights(checkinVal, checkoutVal);
    var nightsText = nights + ' ' + (nights === 1 ? 'сутки' : 'суток');
    var totalCost = formatPrice(nights * window.currentApartment.price) + ' ₽';

    infoDiv.innerHTML =
      '<div style="background: var(--bg-secondary); padding: 16px; border-radius: 12px; margin-bottom: 18px; border: 1px solid var(--border); font-size: 14px;">' +
        '<div style="font-weight: 700; font-size: 15px; margin-bottom: 4px; color: var(--text);">' + escapeHtml(window.currentApartment.name) + '</div>' +
        '<div style="color: var(--text-secondary); font-size: 13px;">' + escapeHtml(window.currentApartment.address) + '</div>' +
        '<hr style="margin: 12px 0; border: none; border-top: 1px solid var(--border);">' +
        '<div style="display: flex; justify-content: space-between; margin-bottom: 6px;">' +
          '<span>Заезд: <b>' + formatDate(checkinVal, true) + '</b></span>' +
          '<span>Выезд: <b>' + formatDate(checkoutVal, true) + '</b></span>' +
        '</div>' +
        '<div style="display: flex; justify-content: space-between; font-weight: 700; margin-top: 8px; color: var(--accent); font-size: 15px;">' +
          '<span>Период: ' + nightsText + '</span>' +
          '<span>К оплате: ' + totalCost + '</span>' +
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
      alert('Данные объекта не загружены');
      return;
    }

    var checkinVal = (document.getElementById('checkinInput') && document.getElementById('checkinInput').value) || getUrlParameter('checkin') || '';
    var checkoutVal = (document.getElementById('checkoutInput') && document.getElementById('checkoutInput').value) || getUrlParameter('checkout') || '';

    if (!checkinVal || !checkoutVal) {
      alert('Пожалуйста, выберите даты бронирования');
      return;
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

      alert(response.message + '\nСумма бронирования: ' + formatPrice(response.booking.total_price) + ' ₽');
      closeBooking();
      bookingForm.reset();

      if (confirm('Перейти в личный кабинет для просмотра бронирования?')) {
        window.location.href = 'profile.html?tab=bookings';
      } else {
        window.location.reload();
      }
    } catch (err) {
      alert('Ошибка при бронировании: ' + err.message);
    } finally {
      submitBtn.textContent = 'Подтвердить бронирование';
      submitBtn.disabled = false;
    }
  };
}
