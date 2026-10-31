// Модуль отзывов (просмотр и добавление)

async function loadReviews(apartmentId) {
  var container = document.getElementById('reviewsList');
  if (!container) return;

  container.innerHTML = '<p style="color: var(--text-secondary);">Загрузка отзывов...</p>';

  try {
    var reviews = await API.get('/reviews/apartment/' + apartmentId);
    renderReviews(reviews);
  } catch (err) {
    container.innerHTML = '<p style="color: #dc3545;">Ошибка загрузки отзывов</p>';
  }
}

function renderReviews(reviews) {
  var container = document.getElementById('reviewsList');
  var countBadge = document.getElementById('reviewsCount');
  if (!container) return;

  if (countBadge) countBadge.textContent = reviews ? reviews.length : 0;

  if (!reviews || reviews.length === 0) {
    container.innerHTML = '<div style="padding: 20px; text-align: center; color: var(--text-secondary); background: var(--bg-secondary); border-radius: 8px;">Отзывов пока нет. Будьте первым, кто оставит отзыв!</div>';
    return;
  }

  var html = '';
  reviews.forEach(function(r) {
    var stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
    var dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString('ru-RU') : '';

    html +=
      '<div class="review-card" style="padding: 16px; margin-bottom: 12px; background: var(--bg-secondary); border-radius: 8px; border: 1px solid var(--border);">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">' +
          '<div>' +
            '<strong style="font-size: 15px;">' + escapeHtml(r.user_name || 'Гость') + '</strong>' +
            '<span style="color: #ffc107; font-size: 16px; margin-left: 8px;">' + stars + '</span>' +
          '</div>' +
          '<small style="color: var(--text-secondary);">' + dateStr + '</small>' +
        '</div>' +
        '<p style="margin: 0; line-height: 1.5; color: var(--text);">' + escapeHtml(r.comment) + '</p>' +
      '</div>';
  });

  container.innerHTML = html;
}

function initReviewForm(apartmentId) {
  var form = document.getElementById('addReviewForm');
  var authNotice = document.getElementById('reviewAuthNotice');
  if (!form) return;

  var user = API.getUser();
  var token = API.getToken();

  if (!user || !token) {
    form.style.display = 'none';
    if (authNotice) {
      authNotice.style.display = 'block';
      authNotice.innerHTML = '<p>Чтобы оставить отзыв, пожалуйста, <a href="#" onclick="event.preventDefault(); openModal(\'loginModal\');">войдите в аккаунт</a>.</p>';
    }
    return;
  }

  if (authNotice) authNotice.style.display = 'none';
  form.style.display = 'block';

  form.onsubmit = async function(e) {
    e.preventDefault();
    var rating = document.getElementById('reviewRating').value;
    var comment = document.getElementById('reviewComment').value.trim();
    var submitBtn = form.querySelector('button[type="submit"]');

    if (!comment) {
      alert('Пожалуйста, напишите текст отзыва');
      return;
    }

    try {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Отправка...';

      await API.post('/reviews', {
        apartment_id: apartmentId,
        rating: Number(rating),
        comment: comment
      });

      alert('Спасибо за ваш отзыв!');
      form.reset();
      loadReviews(apartmentId);
    } catch (err) {
      alert(err.message || 'Ошибка при отправке отзыва');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Оставить отзыв';
    }
  };
}
