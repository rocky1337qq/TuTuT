function initDates() {
  var checkinSelect = document.getElementById('checkinSelect');
  var checkoutSelect = document.getElementById('checkoutSelect');
  if (!checkinSelect || !checkoutSelect) return;

  var months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
  var year = new Date().getFullYear();

  for (var m = 0; m < 12; m++) {
    var daysInMonth = new Date(year, m + 1, 0).getDate();
    for (var d = 1; d <= daysInMonth; d++) {
      var date = year + '-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      var label = d + ' ' + months[m] + ' ' + year;

      var opt1 = document.createElement('option');
      opt1.value = date;
      opt1.text = label;
      checkinSelect.appendChild(opt1);

      var opt2 = document.createElement('option');
      opt2.value = date;
      opt2.text = label;
      checkoutSelect.appendChild(opt2);
    }
  }

  var searchForm = document.getElementById('searchForm');
  if (searchForm) {
    searchForm.onsubmit = function(e) {
      e.preventDefault();
      var city = document.getElementById('citySelect') ? document.getElementById('citySelect').value : 'Оренбург';
      var checkin = checkinSelect.value;
      var checkout = checkoutSelect.value;

      if (checkin && checkout && checkin >= checkout) {
        alert('Дата выезда должна быть позже даты заезда');
        return;
      }

      var url = 'search.html?city=' + encodeURIComponent(city);
      if (checkin) url += '&checkin=' + encodeURIComponent(checkin);
      if (checkout) url += '&checkout=' + encodeURIComponent(checkout);

      window.location.href = url;
    };
  }
}
