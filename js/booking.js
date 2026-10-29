function openBooking() {
    if (!localStorage.getItem('user')) {
        openModal('loginModal');
        return;
    }
    document.getElementById('bookingModal').classList.add('active');
}

function closeBooking() {
    document.getElementById('bookingModal').classList.remove('active');
}

document.getElementById('bookBtn').onclick = openBooking;

document.getElementById('bookingForm').onsubmit = function(e) {
    e.preventDefault();
    
    var name = document.getElementById('bookName').value.trim();
    var phone = document.getElementById('bookPhone').value.trim();
    var msg = document.getElementById('bookMessage').value.trim();
    var btn = document.getElementById('submitBtn');
    
    btn.textContent = 'Отправка...';
    btn.disabled = true;
    
    var dates = (checkin ? formatDate(checkin) : '-') + ' - ' + (checkout ? formatDate(checkout) : '-');
    
    var formData = new FormData();
    formData.append('entry.1231042751', name);
    formData.append('entry.494659845', phone);
    formData.append('entry.11918675', apt.name);
    formData.append('entry.1586451118', apt.address);
    formData.append('entry.1179230385', dates);
    
    fetch('https://docs.google.com/forms/d/e/1FAIpQLScoeJg24kaXMcmq8cGKFeohb1JmgnibxuHJBDLTdmKSoSdvgg/formResponse', {
        method: 'POST',
        mode: 'no-cors',
        body: formData
    })
    .then(function() {
        var user = JSON.parse(localStorage.getItem('user') || '{}');
        var key = 'bookings_' + (user.email || 'default');
        var bookings = JSON.parse(localStorage.getItem(key) || '[]');
        bookings.unshift({
            aptId: apt.id,
            aptName: apt.name,
            address: apt.address,
            price: apt.price,
            checkin: checkin,
            checkout: checkout,
            date: new Date().toISOString(),
            status: 'pending'
        });
        localStorage.setItem(key, JSON.stringify(bookings));
        alert('Заявка отправлена!');
        closeBooking();
        document.getElementById('bookingForm').reset();
    })
    .catch(function() {
        alert('Ошибка отправки. Попробуйте ещё раз.');
    });
    
    btn.textContent = 'Отправить';
    btn.disabled = false;
}