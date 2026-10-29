function showBookings() {
    var container = document.getElementById('bookingsList');
    var user = JSON.parse(localStorage.getItem('user') || 'null');
    
    if (!user) {
        container.innerHTML = '<div class="empty-state"><p>Войдите, чтобы увидеть бронирования</p></div>';
        return;
    }

    var key = 'bookings_' + (user.email || 'default');
    var bookings = JSON.parse(localStorage.getItem(key) || '[]');

    if (bookings.length === 0) {
        document.getElementById('noBookings').style.display = 'block';
        return;
    }
    
    var html = '';
    for (var i = 0; i < bookings.length; i++) {
        var b = bookings[i];
        var statusClass = b.status === 'confirmed' ? 'confirmed' : 'pending';
        var statusText = b.status === 'confirmed' ? 'Подтверждено' : 'Ожидание';
        
        html += '<div class="booking-item">';
        html += '<div class="info">';
        html += '<div class="apt-name">' + b.aptName + '</div>';
        html += '<div class="apt-dates">' + (b.checkin ? formatDate(b.checkin) : '-') + ' — ' + (b.checkout ? formatDate(b.checkout) : '-') + '</div>';
        html += '</div>';
        html += '<div class="right">';
        html += '<span class="status ' + statusClass + '">' + statusText + '</span>';
        html += '<div class="price">' + b.price + ' руб / сутки</div>';
        html += '</div>';
        html += '</div>';
    }
    
    container.innerHTML = html;
}