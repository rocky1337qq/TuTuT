function getUrlParameter(name) {
    var url = window.location.search.substring(1);
    var params = url.split('&');
    for (var i = 0; i < params.length; i++) {
        var param = params[i].split('=');
        if (param[0] === name) return decodeURIComponent(param[1] || '');
    }
    return null;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    var parts = dateStr.split('-');
    var months = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек'];
    return parseInt(parts[2]) + ' ' + months[parseInt(parts[1]) - 1];
}

function getRoomsText(rooms) {
    if (rooms === 1) return 'комната';
    if (rooms >= 2 && rooms <= 4) return 'комнаты';
    return 'комнат';
}