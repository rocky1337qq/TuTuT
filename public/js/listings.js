// Отображение и фильтрация каталога квартир

var currentPhoto = {};
var apartmentsList = [];

async function showApartments() {
  var grid = document.getElementById('listingsGrid');
  var noResults = document.getElementById('noResults');
  var checkin = document.getElementById('checkinInput') ? document.getElementById('checkinInput').value : '';
  var checkout = document.getElementById('checkoutInput') ? document.getElementById('checkoutInput').value : '';
  var onlyAvailCheckbox = document.getElementById('onlyAvailableCheckbox');
  var onlyAvailable = onlyAvailCheckbox ? onlyAvailCheckbox.checked : false;
  var onlyAvailableWrapper = document.getElementById('onlyAvailableWrapper');
  var resetBtn = document.getElementById('resetDatesBtn');
  var countElem = document.getElementById('resultsCount');

  if (!grid) return;

  grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--text-secondary);"><span style="display:inline-block; font-size:15px; font-weight:600;">Загрузка актуальных предложений...</span></div>';

  var queryParams = [];
  if (checkin) queryParams.push('checkin=' + encodeURIComponent(checkin));
  if (checkout) queryParams.push('checkout=' + encodeURIComponent(checkout));
  if (checkin && checkout && onlyAvailable) queryParams.push('onlyAvailable=true');
  var queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';

  // Отображение кнопки сброса и переключателя "Только свободные"
  if (checkin && checkout) {
    if (onlyAvailableWrapper) onlyAvailableWrapper.style.display = 'inline-flex';
    if (resetBtn) resetBtn.style.display = 'inline-block';
  } else {
    if (onlyAvailableWrapper) onlyAvailableWrapper.style.display = 'none';
    if (resetBtn) resetBtn.style.display = 'none';
  }

  try {
    apartmentsList = await API.get('/apartments' + queryString);
    renderApartmentsGrid(apartmentsList, checkin, checkout);

    if (countElem) {
      var total = apartmentsList.length;
      if (checkin && checkout) {
        var freeCount = apartmentsList.filter(function(a) { return a.is_available; }).length;
        countElem.textContent = 'Найдено ' + total + ' вариантов (' + freeCount + ' свободно на ваши даты)';
      } else {
        countElem.textContent = 'Найдено ' + total + ' объектов в Оренбурге';
      }
    }
  } catch (err) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc2626;">Ошибка загрузки каталога: ' + escapeHtml(err.message) + '</div>';
  }
}

function renderApartmentsGrid(apartments, checkin, checkout) {
  var grid = document.getElementById('listingsGrid');
  var noResults = document.getElementById('noResults');

  grid.innerHTML = '';

  if (!apartments || apartments.length === 0) {
    if (noResults) noResults.style.display = 'block';
    return;
  }

  if (noResults) noResults.style.display = 'none';

  apartments.forEach(function(apt) {
    currentPhoto[apt.id] = 0;
    var photos = apt.photos && apt.photos.length > 0 ? apt.photos : ['images/tusovka.jpg'];

    var thumbsHtml = '';
    var thumbCount = Math.min(photos.length, 3);
    for (var t = 0; t < thumbCount; t++) {
      thumbsHtml += '<img class="thumb ' + (t === 0 ? 'active' : '') + '" ' +
        'src="' + escapeHtml(photos[t]) + '" ' +
        'data-apt="' + apt.id + '" ' +
        'data-index="' + t + '">';
    }

    var morePhotos = '';
    if (photos.length > 3) {
      morePhotos = '<div class="more-photos">+' + (photos.length - 3) + '</div>';
    }

    var link = 'card.html?id=' + apt.id;
    if (checkin) link += '&checkin=' + encodeURIComponent(checkin);
    if (checkout) link += '&checkout=' + encodeURIComponent(checkout);

    var tags = '<div class="tags">' +
      '<span class="tag">' + apt.rooms + ' ' + getRoomsText(apt.rooms) + '</span>' +
      '<span class="tag">' + apt.area + ' м²</span>' +
      '<span class="tag">' + apt.floor + ' этаж</span>' +
      '</div>';

    // Рейтинг со звездой и количеством отзывов
    var ratingHtml = '';
    if (Number(apt.avg_rating) > 0) {
      ratingHtml = '<span style="display: inline-flex; align-items: center; gap: 4px; font-weight: 700; font-size: 13px; color: #b45309; background: rgba(245, 158, 11, 0.12); padding: 2px 7px; border-radius: 4px; margin-left: 8px;">' +
        '<svg width="12" height="12" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' +
        apt.avg_rating + ' (' + apt.reviews_count + ')' +
        '</span>';
    }

    // Статус доступности квартиры на выбранные даты
    var statusBadge = '';
    if (checkin && checkout) {
      if (apt.is_available) {
        statusBadge = '<div class="badge-status available"><span class="status-dot"></span>Свободна на ваши даты</div>';
      } else {
        statusBadge = '<div class="badge-status busy"><span class="status-dot"></span>Занята на выбранные даты</div>';
      }
    } else {
      statusBadge = '<div class="badge-status available"><span class="status-dot"></span>Свободна для бронирования</div>';
    }

    var verifiedBadge = '<span class="badge-verified"><svg width="11" height="11" viewBox="0 0 24 24" fill="#0A7C3E"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>Проверено</span>';

    var card = document.createElement('div');
    card.className = 'listing-card' + (!apt.is_available && checkin && checkout ? ' listing-card-busy' : '');
    card.onclick = function() {
      window.location.href = link;
    };

    card.innerHTML =
      '<div class="listing-gallery">' +
        '<img class="main-photo" id="main' + apt.id + '" src="' + escapeHtml(photos[0]) + '" alt="' + escapeHtml(apt.name) + '">' +
        '<div class="slider-btns">' +
          '<button class="slider-btn" data-dir="-1" data-apt="' + apt.id + '">&lt;</button>' +
          '<button class="slider-btn" data-dir="1" data-apt="' + apt.id + '">&gt;</button>' +
        '</div>' +
        morePhotos +
        '<div class="thumbnails">' + thumbsHtml + '</div>' +
      '</div>' +
      '<div class="listing-info">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">' +
          statusBadge +
          verifiedBadge +
        '</div>' +
        '<h3 style="display: flex; align-items: center; flex-wrap: wrap;">' + escapeHtml(apt.name) + ratingHtml + '</h3>' +
        '<div class="price">' + formatPrice(apt.price) + ' ₽ <span>/ сутки</span></div>' +
        '<p class="address">' + escapeHtml(apt.city) + ', ' + escapeHtml(apt.address) + '</p>' +
        '<p class="desc">' + escapeHtml(apt.description) + '</p>' +
        tags +
      '</div>';

    grid.appendChild(card);
  });

  // Обработчики кнопок слайдера внутри карточек
  grid.querySelectorAll('.slider-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.stopPropagation();
      var aptId = parseInt(this.dataset.apt, 10);
      var dir = parseInt(this.dataset.dir, 10);
      slidePhoto(aptId, dir);
    });
  });

  grid.querySelectorAll('.thumb').forEach(function(thumb) {
    thumb.addEventListener('click', function(e) {
      e.stopPropagation();
      var aptId = parseInt(this.dataset.apt, 10);
      var index = parseInt(this.dataset.index, 10);
      setPhoto(aptId, index);
    });
  });
}

function slidePhoto(aptId, dir) {
  var apt = apartmentsList.find(function(a) { return a.id === aptId; });
  if (!apt || !apt.photos || apt.photos.length === 0) return;

  var current = currentPhoto[aptId] || 0;
  var next = (current + dir + apt.photos.length) % apt.photos.length;
  setPhoto(aptId, next);
}

function setPhoto(aptId, index) {
  var apt = apartmentsList.find(function(a) { return a.id === aptId; });
  if (!apt || !apt.photos || !apt.photos[index]) return;

  currentPhoto[aptId] = index;
  var mainImg = document.getElementById('main' + aptId);
  if (mainImg) mainImg.src = apt.photos[index];

  if (mainImg) {
    var gallery = mainImg.closest('.listing-gallery');
    if (gallery) {
      gallery.querySelectorAll('.thumb').forEach(function(th, ti) {
        th.classList.toggle('active', ti === index);
      });
    }
  }
}
