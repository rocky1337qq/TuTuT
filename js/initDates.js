function initDates() {
    var months = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 
                 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];
    var daysInMonth = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    
    for (var m = 0; m < 12; m++) {
        for (var d = 1; d <= daysInMonth[m]; d++) {
            var date = '2026-' + String(m + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
            var label = d + ' ' + months[m] + ' 2026';
            
            var opt1 = document.createElement('option');
            opt1.value = date;
            opt1.text = label;
            document.getElementById('checkinSelect').appendChild(opt1);
            
            var opt2 = document.createElement('option');
            opt2.value = date;
            opt2.text = label;
            document.getElementById('checkoutSelect').appendChild(opt2);
        }
    }
    
    if (document.getElementById('searchForm')) {
        document.getElementById('searchForm').onsubmit = function(e) {
            e.preventDefault();
            var city = document.getElementById('citySelect').value;
            var checkin = document.getElementById('checkinSelect').value;
            var checkout = document.getElementById('checkoutSelect').value;
            
            var url = 'search.html?city=' + encodeURIComponent(city);
            if (checkin) url += '&checkin=' + checkin;
            if (checkout) url += '&checkout=' + checkout;
            
            window.location.href = url;
        };
    }
}