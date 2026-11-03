// Модуль отзывов и оценок

function renderStarsSvg(rating) {
  var s = '<span style="display:inline-flex; align-items:center; gap:2px; vertical-align: middle;">';
  for (var i = 1; i <= 5; i++) {
    var fill = i <= rating ? '#f59e0b' : '#cbd5e1';
    s += '<svg width="14" height="14" viewBox="0 0 24 24" fill="' + fill + '" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
  }
  s += '</span>';
  return s;
}

async function loadReviews(apartmentId) {
  var container = document.getElementById('reviewsList');
  if (!container) return;

  container.innerHTML = '<p style="color: var(--text-secondary); padding: 10px 0;">Загрузка отзывов...</p>';

  try {
    var reviews = await API.get('/reviews/apartment/' + apartmentId);
    renderReviews(reviews);
  } catch (err) {
    container.innerHTML = '<p style="color: #dc2626;">Ошибка загрузки отзывов</p>';
  }
}

function renderReviews(reviews) {
  var container = document.getElementById('reviewsList');
  var countBadge = document.getElementById('reviewsCount');
  if (!container) return;

  if (countBadge) countBadge.textContent = reviews ? reviews.length : 0;

  if (!reviews || reviews.length === 0) {
    container.innerHTML = '<div style="padding: 24px; text-align: center; color: var(--text-secondary); background: var(--bg-secondary); border-radius: 12px; font-size: 14px;">Отзывов пока нет. Оставьте первый отзыв после проживания.</div>';
    return;
  }

  var html = '';
  reviews.forEach(function(r) {
    var dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString('ru-RU') : '';

    html +=
      '<div class="review-card" style="padding: 18px 20px; margin-bottom: 14px; background: var(--bg-card); border-radius: 12px; border: 1px solid var(--border); box-shadow: var(--shadow-sm);">' +
        '<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">' +
          '<div style="display: flex; align-items: center; gap: 10px;">' +
            '<strong style="font-size: 14.5px; color: var(--text);">' + escapeHtml(r.user_name || 'Гость') + '</strong>' +
            renderStarsSvg(r.rating) +
          '</div>' +
          '<small style="color: var(--text-muted); font-size: 12px;">' + dateStr + '</small>' +
        '</div>' +
        '<p style="margin: 0; line-height: 1.55; color: var(--text); font-size: 14px;">' + escapeHtml(r.comment) + '</p>' +
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
      authNotice.innerHTML = '<p style="font-size: 14px;">Чтобы оставить отзыв, пожалуйста, <a href="#" onclick="event.preventDefault(); openModal(\'loginModal\');" style="font-weight: 600; text-decoration: underline;">войдите в учетную запись</a>.</p>';
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

      alert('Спасибо! Ваш отзыв успешно сохранен.');
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
