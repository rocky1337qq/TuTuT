function checkAuth() {
    var user = localStorage.getItem('user');
    var authDiv = document.getElementById('authButtons');
    
    if (user) {
        user = JSON.parse(user);
        var fl = user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase();
        var sn = user.name ? user.name.split(' ')[0] : user.email.split('@')[0];
        authDiv.innerHTML = 
            '<div class="user-menu">' +
                '<button class="user-btn" onclick="toggleUserMenu()">' +
                    '<span class="avatar">' + fl + '</span>' +
                    sn +
                '</button>' +
                '<div class="user-dropdown" id="userDropdown">' +
                    '<a href="profile.html">Личный кабинет</a>' +
                    '<a href="#" class="logout" onclick="logout()">Выйти</a>' +
                '</div>' +
            '</div>';
    } else {
        authDiv.innerHTML = '<button class="btn" onclick="openModal(\'loginModal\')">Вход</button>';
    }
}

function toggleUserMenu() {
    document.getElementById('userDropdown').classList.toggle('active');
}

document.addEventListener('click', function(e) {
    var d = document.getElementById('userDropdown');
    var b = document.querySelector('.user-btn');
    if (d && b && !b.contains(e.target) && !d.contains(e.target)) {
        d.classList.remove('active');
    }
});

function openModal(id) { 
    document.getElementById(id).classList.add('active'); 
}

function closeModal(id) { 
    document.getElementById(id).classList.remove('active'); 
}

document.querySelectorAll('.modal').forEach(function(m) {
    m.addEventListener('click', function(e) {
        if (e.target === m) m.classList.remove('active');
    });
});

document.getElementById('loginForm').onsubmit = function(e) {
    e.preventDefault();
    var email = document.getElementById('loginEmail').value.trim();
    var user = { email: email, name: email.split('@')[0] };
    localStorage.setItem('user', JSON.stringify(user));
    closeModal('loginModal');
    checkAuth();
    this.reset();
};

document.getElementById('registerForm').onsubmit = function(e) {
    e.preventDefault();
    var name = document.getElementById('regName').value.trim();
    var email = document.getElementById('regEmail').value.trim();
    var user = { email: email, name: name };
    localStorage.setItem('user', JSON.stringify(user));
    closeModal('registerModal');
    checkAuth();
    this.reset();
    alert('Регистрация прошла успешно!');
};

function logout() {
    localStorage.removeItem('user');
    checkAuth();
}