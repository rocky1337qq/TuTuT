// Вспомогательные утилиты для дат и форматирования

function getUrlParameter(name) {
  var url = window.location.search.substring(1);
  var params = url.split('&');
  for (var i = 0; i < params.length; i++) {
    var param = params[i].split('=');
    if (param[0] === name) return decodeURIComponent(param[1] || '');
  }
  return null;
}

function formatDate(dateStr, fullYear) {
  if (!dateStr) return '';
  var date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;

  var monthsShort = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
  var monthsFull = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];

  if (fullYear) {
    return date.getDate() + ' ' + monthsFull[date.getMonth()] + ' ' + date.getFullYear();
  }
  return date.getDate() + ' ' + monthsShort[date.getMonth()];
}

function getRoomsText(rooms) {
  var n = parseInt(rooms, 10);
  if (n >= 11 && n <= 14) return 'комнат';
  var last = n % 10;
  if (last === 1) return 'комната';
  if (last >= 2 && last <= 4) return 'комнаты';
  return 'комнат';
}

function formatPrice(price) {
  return Number(price).toLocaleString('ru-RU');
}

function calculateNights(checkin, checkout) {
  if (!checkin || !checkout) return 0;
  var start = new Date(checkin);
  var end = new Date(checkout);
  var diff = end.getTime() - start.getTime();
  if (isNaN(diff) || diff <= 0) return 0;
  return Math.round(diff / (1000 * 60 * 60 * 24));
}
