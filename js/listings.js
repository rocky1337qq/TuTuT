var currentPhoto = {};

function showApartments() {
    var grid = document.getElementById('listingsGrid');
    var noResults = document.getElementById('noResults');
    var checkin = document.getElementById('checkinInput').value;
    var checkout = document.getElementById('checkoutInput').value;
    
    grid.innerHTML = '';
    var count = 0;
    
    for (var i = 0; i < apartments.length; i++) {
        var apt = apartments[i];
        
        if (!isCurrentlyAvailable(apt, checkin)) continue;
        
        if (checkin && checkout) {
            if (isDateBooked(apt.id, checkin, checkout)) continue;
        }
        
        count++;
        currentPhoto[apt.id] = 0;
        
        var thumbsHtml = '';
        var thumbCount = Math.min(apt.photos.length, 3);
        for (var t = 0; t < thumbCount; t++) {
            thumbsHtml += '<img class="thumb ' + (t === 0 ? 'active' : '') + '" ' +
                'src="' + apt.photos[t] + '" ' +
                'data-apt="' + apt.id + '" ' +
                'data-index="' + t + '">';
        }
        
        var morePhotos = '';
        if (apt.photos.length > 3) {
            morePhotos = '<div class="more-photos">+' + (apt.photos.length - 3) + '</div>';
        }
        
        var link = 'card.html?id=' + apt.id;
        if (checkin) link += '&checkin=' + checkin;
        if (checkout) link += '&checkout=' + checkout;
        
        var tags = '<div class="tags">' +
            '<span class="tag">' + apt.rooms + ' ' + getRoomsText(apt.rooms) + '</span>' +
            '<span class="tag">' + apt.area + ' м2</span>' +
            '<span class="tag">' + apt.floor + ' эт.</span>' +
            '</div>';
        
        var card = '<div class="listing-card" onclick="window.location.href=\'' + link + '\'">';
        card += '<div class="listing-gallery">';
        card += '<img class="main-photo" id="main' + apt.id + '" src="' + apt.photos[0] + '" alt="">';
        card += '<div class="slider-btns">';
        card += '<button class="slider-btn" data-dir="-1" data-apt="' + apt.id + '">&lt;</button>';
        card += '<button class="slider-btn" data-dir="1" data-apt="' + apt.id + '">&gt;</button>';
        card += '</div>';
        card += morePhotos;
        card += '<div class="thumbnails">' + thumbsHtml + '</div>';
        card += '</div>';
        card += '<div class="listing-info">';
        card += '<h3>' + apt.name + '</h3>';
        card += '<div class="price">' + apt.price + ' руб <span>/ сутки</span></div>';
        card += '<p class="address">' + apt.city + ', ' + apt.address + '</p>';
        card += '<p class="desc">' + apt.description + '</p>';
        card += tags;
        card += '</div></div>';
        
        grid.innerHTML += card;
    }
    
    noResults.style.display = count == 0 ? 'block' : 'none';
    
    document.querySelectorAll('.listing-gallery .slider-btn').forEach(function(btn) {
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var aptId = parseInt(this.dataset.apt);
            var dir = parseInt(this.dataset.dir);
            slidePhoto(aptId, dir);
        });
    });
    
    document.querySelectorAll('.listing-gallery .thumb').forEach(function(thumb) {
        thumb.addEventListener('click', function(e) {
            e.stopPropagation();
            var aptId = parseInt(this.dataset.apt);
            var index = parseInt(this.dataset.index);
            setPhoto(aptId, index);
        });
    });
}

function setPhoto(aptId, index) {
    var apt = apartments.find(function(a) { return a.id === aptId; });
    if (!apt) return;
    
    currentPhoto[aptId] = index;
    document.getElementById('main' + aptId).src = apt.photos[index];
    
    var gallery = document.getElementById('main' + aptId).closest('.listing-gallery');
    gallery.querySelectorAll('.thumb').forEach(function(th, ti) {
        th.classList.toggle('active', ti === index);
    });
}

function slidePhoto(aptId, dir) {
    var apt = apartments.find(function(a) { return a.id === aptId; });
    if (!apt) return;
    
    currentPhoto[aptId] += dir;
    if (currentPhoto[aptId] < 0) currentPhoto[aptId] = apt.photos.length - 1;
    if (currentPhoto[aptId] >= apt.photos.length) currentPhoto[aptId] = 0;
    
    setPhoto(aptId, currentPhoto[aptId]);
}