var currentImg = 0;

function prevPhoto() {
    if (!apt || !apt.photos || apt.photos.length === 0) return;
    currentImg--;
    if (currentImg < 0) currentImg = apt.photos.length - 1;
    document.getElementById('mainPhoto').src = apt.photos[currentImg];
    updateThumbs();
}

function nextPhoto() {
    if (!apt || !apt.photos || apt.photos.length === 0) return;
    currentImg++;
    if (currentImg >= apt.photos.length) currentImg = 0;
    document.getElementById('mainPhoto').src = apt.photos[currentImg];
    updateThumbs();
}

function updateThumbs() {
    var thumbs = document.querySelectorAll('.thumb');
    thumbs.forEach(function(thumb, index) {
        thumb.classList.toggle('active', index === currentImg);
    });
}

function setMainPhoto(index) {
    currentImg = index;
    document.getElementById('mainPhoto').src = apt.photos[currentImg];
    updateThumbs();
}

function openPhotoModal(index) {
    if (!apt || !apt.photos || apt.photos.length === 0) return;
    currentImg = index !== undefined ? index : currentImg;
    document.getElementById('photoModalImg').src = apt.photos[currentImg];
    document.getElementById('photoModal').classList.add('active');
    updatePhotoCounter();
}

function closePhotoModal() {
    document.getElementById('photoModal').classList.remove('active');
}

function prevPhotoModal() {
    if (!apt || !apt.photos || apt.photos.length === 0) return;
    currentImg--;
    if (currentImg < 0) currentImg = apt.photos.length - 1;
    document.getElementById('photoModalImg').src = apt.photos[currentImg];
    updatePhotoCounter();
}

function nextPhotoModal() {
    if (!apt || !apt.photos || apt.photos.length === 0) return;
    currentImg++;
    if (currentImg >= apt.photos.length) currentImg = 0;
    document.getElementById('photoModalImg').src = apt.photos[currentImg];
    updatePhotoCounter();
}

function updatePhotoCounter() {
    document.getElementById('photoModalCounter').textContent = (currentImg + 1) + ' / ' + apt.photos.length;
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('photoModalClose').onclick = closePhotoModal;
    document.getElementById('photoModalPrev').onclick = prevPhotoModal;
    document.getElementById('photoModalNext').onclick = nextPhotoModal;
    document.getElementById('photoModal').onclick = function (e) {
        if (e.target === this) closePhotoModal();
    };
});