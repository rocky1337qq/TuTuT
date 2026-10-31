// Отображение и фильтрация каталога квартир с бэкенда

var currentPhoto = {};
var apartmentsList = [];

async function showApartments() {
  var grid = document.getElementById('listingsGrid');
  var noResults = document.getElementById('noResults');
  var checkin = document.getElementById('checkinInput') ? document.getElementById('checkinInput').value : '';
  var checkout = document.getElementById('checkoutInput') ? document.getElementById('checkoutInput').value : '';

  if (!grid) return;

  grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--text-secondary);">Загрузка квартир...</div>';

  var queryParams = [];
  if (checkin) queryParams.push('checkin=' + encodeURIComponent(checkin));
  if (checkout) queryParams.push('checkout=' + encodeURIComponent(checkout));
  var queryString = queryParams.length > 0 ? '?' + queryParams.join('&') : '';

  try {
    apartmentsList = await API.get('/apartments' + queryString);
    renderApartmentsGrid(apartmentsList, checkin, checkout);
  } catch (err) {
    grid.innerHTML = '<div style="grid-column: 1/-1; text-align: center; padding: 40px; color: #dc3545;">Ошибка загрузки квартир: ' + escapeHtml(err.message) + '</div>';
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
      '<span class="tag">' + apt.floor + ' эт.</span>' +
      '</div>';

    var ratingHtml = '';
    if (Number(apt.avg_rating) > 0) {
      ratingHtml = '<span class="listing-rating" style="display: inline-flex; align-items: center; gap: 4px; background: #fff3cd; color: #856404; padding: 2px 8px; border-radius: 6px; font-weight: 600; font-size: 13px; margin-left: 8px;">★ ' + apt.avg_rating + ' (' + apt.reviews_count + ')</span>';
    }

    var card = document.createElement('div');
    card.className = 'listing-card';
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
        '<h3>' + escapeHtml(apt.name) + ratingHtml + '</h3>' +
        '<div class="price">' + formatPrice(apt.price) + ' руб <span>/ сутки</span></div>' +
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

// При изменении дат фильтра автоматически обновляем список
document.addEventListener('DOMContentLoaded', function() {
  var checkinInput = document.getElementById('checkinInput');
  var checkoutInput = document.getElementById('checkoutInput');

  if (checkinInput && checkoutInput) {
    checkinInput.addEventListener('change', function() {
      if (checkinInput.value && checkoutInput.value && checkinInput.value >= checkoutInput.value) {
        alert('Дата выезда должна быть позже даты заезда');
        return;
      }
      showApartments();
    });

    checkoutInput.addEventListener('change', function() {
      if (checkinInput.value && checkoutInput.value && checkinInput.value >= checkoutInput.value) {
        alert('Дата выезда должна быть позже даты заезда');
        return;
      }
      showApartments();
    });
  }
});
