function initMap() {
    if (!apt || !apt.coords) return;
    var parts = apt.coords.split(',');
    var ll = parts[1] + ',' + parts[0];
    document.getElementById('mapImage').src = 'https://static-maps.yandex.ru/1.x/?ll=' + ll + '&z=14&l=map&pt=' + ll + ',pm2rdm';
}