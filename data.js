var apartments = [
    {
        id: 1,
        name: "Новая квартира около города еды",
        city: "Оренбург",
        address: "Автомобилистов улица, 15",
        coords: "51.831664,55.171192",
        price: 2800,
        description: "Квартира Люкс- комфортно и уютно как в пятизвёздочном отеле.",
        rooms: 1,
        area: 37,
        floor: 17,
        amenities: ["Отдельная кухня", "Лифт", "1 ванная комната", "Телевизор", "Кондиционер"],
        photos: [
            "images/id1_photo1.jpg",
            "images/id1_photo2.jpg",
            "images/id1_photo3.jpg",
            "images/id1_photo4.jpg",
            "images/id1_photo5.jpg",
            "images/id1_photo6.jpg",
            "images/id1_photo7.jpg",
            "images/id1_photo8.jpg"
        ],
        bookedDates: []
    },
    {
        id: 2,
        name: "Евродвушка на Победе.",
        city: "Оренбург",
        address: "Проспект Победы, 159",
        coords: "51.818750,55.142590",
        price: 2200,
        description: "Гостям и жителям Оренбурга мы рады предложить снять посуточно уютную, просторную двухкомнатную квартиру, расположенную в новом элитном доме. Квартира совместила в себе: просторные комнаты, удобная планировка и современный ремонт. Апартаменты расположены в районе с развитой инфраструктурой. В шаговой доступности расположены аптеки, банки, магазины, ресторан, парк 50 лет ВЛКСМ, автобусная остановка, торговые комплексы. В квартире имеется очень просторная кухня-гостинная, со всем необходимым: холодильник, электрический чайник, электрическая плита, микроволновая печь, вся необходимая посуда, обеденный стол, угловой раскладной диван. Просторная лоджия из спальни . В ванной комнате установлена современная стиральная машина, раковина. В спальне имеется комфортная двуспальная кровать. В апартаментах имеется 32'' дюймовый телевизор, бесплатный Wi-Fi, цифровое телевидение, утюг, кондиционер. НАЛИЧНЫЙ И БЕЗНАЛИЧНЫЙ РАСЧЕТ. ПОЛНЫЙ ПАКЕТ ОТЧЕТНЫХ ДОКУМЕНТОВ (чеки с QR-кодом, онлайн касса).",
        rooms: 2,
        area: 55,
        floor: 14,
        amenities: ["1 двуспальная кровать", "1 совмещённая ванная", "Wi-Fi"],
        photos: [
            "images/id2_photo1.jpg",
            "images/id2_photo2.jpg",
            "images/id2_photo3.jpg",
            "images/id2_photo4.jpg",
            "images/id2_photo5.jpg",
            "images/id2_photo6.jpg"
        ],
        bookedDates: []
    },
    {
        id: 3,
        name: "Квартира на Пролетарской.",
        city: "Оренбург",
        address: "Пролетарская улица, 298",
        coords: "55.0968,51.7651",
        price: 4500,
        description: "В квартире имеется просторная кухня, со всем необходимым: холодильник, электрический чайник, злектроплита, микроволновая печь, посуда, большой обеденный стол, утепленная лоджия из кухни. В ванной комнате установлена современная стиральная машина, раковина, фен. В гостиной комнате имеется комфортная большая двуспальная кровать с ортопедическим матрасом и диван. В апартаментах имеется большой 42'' дюймовый телевизор, Wi-Fi, цифровое телевидение, утюг, гладильная доска, сушка для белья, большой шкаф для одежды. Более подробную информацию вы можете уточнить по контактному номеру или в мессенджеры. Действуют скидки постоянным клиентам. Заехать в апартаменты вы можете в любое время дня и ночи. Ранний заезд и поздний выезд обговаривается заранее.",
        rooms: 1,
        area: 40,
        floor: 16,
        amenities: ["Wi-Fi", "Кухня", "Стиральная машина", "Телевизор", "Кондиционер", "Парковка"],
        photos: [
            "images/id3_photo1.jpg",
            "images/id3_photo2.jpg",
            "images/id3_photo3.jpg",
            "images/id3_photo4.jpg",
            "images/id3_photo5.jpg",
            "images/id3_photo6.jpg",
            "images/id3_photo7.jpg"
        ],
        bookedDates: []
    },
    {
        id: 4,
        name: "Большая 4-местная студия с кухней рядом с аквапарком",
        city: "Оренбург",
        address: "улица Поляничко, 11/5",
        coords: "55.0968,51.7651",
        price: 1990,
        description: "Чистая квартира в спальном районе, в 5 минутах расположен аквапарк, термальный комплекс, рестораны, кафе. Хорошая транспортная развязка.",
        rooms: 1,
        area: 30,
        floor: 14,
        amenities: ["Wi-Fi", "Парковка", "1 совмещённая ванная", "Кухня-гостинная", "Балкон"],
        photos: [
            "images/id4_photo1.jpg",
            "images/id4_photo2.jpg",
            "images/id4_photo3.jpg",
            "images/id4_photo4.jpg",
            "images/id4_photo5.jpg",
            "images/id4_photo6.jpg",
            "images/id4_photo7.jpg"
        ],
        bookedDates: []
    },
    {
        id: 5,
        name: "Уютная квартира в центре города",
        city: "Оренбург",
        address: "улица Лукиана Попова, 103",
        coords: "55.0968,51.7651",
        price: 2330,
        description: "Квартира располагает телевизором с плоским экраном и кабельными каналами, кондиционером, гостиной, полностью оборудованной кухней с микроволновой печью, гостиной зоной и ванной комнатой с ванной..",
        rooms: 2,
        area: 65,
        floor: 16,
        amenities: ["Wi-Fi", "Кондиционер", "ЖК-телевизор", "Бытовая техника", "Средства для личной гигиены "],
        photos: [
            "images/id5_photo1.jpg",
            "images/id5_photo2.jpg",
            "images/id5_photo3.jpg",
            "images/id5_photo4.jpg",
            "images/id5_photo5.jpg",
            "images/id5_photo6.jpg",
            "images/id5_photo7.jpg"
        ],
        bookedDates: []
    },
    {
        id: 6,
        name: "Квартира с удобным расположением на 3 человека",
        city: "Оренбург",
        address: "Пролетарская улица, 296",
        coords: "55.0968,51.7651",
        price: 2990,
        description: "Уважаемые гости, добро пожаловать в студию с дизайнерским ремонтом в новом ЖК Березовые аллеи В шаговой доступности расположен СК Олимпийский, Центр дзюдо, ТЦ Гулливер, 10 мин на автомобиле до Термоленда.Рядом с домом множество ресторанов, кафе, магазинов.",
        rooms: 1,
        area: 26,
        floor: 2,
        amenities: ["Wi-Fi", "Парковка", "Двуспальная кровать и кресло-кровать"],
        photos: [
            "images/id6_photo1.jpg",
            "images/id6_photo2.jpg",
            "images/id6_photo3.jpg",
            "images/id6_photo4.jpg",
            "images/id6_photo5.jpg",
        ],
        bookedDates: []
    },
    {
        id: 7,
        name: "1к кв 4 гостя от Квартерры рядом с железнодорожной больницей",
        city: "Оренбург",
        address: "Пролетарская улица, 288/2",
        coords: "55.0968,51.7651",
        price: 2500,
        description: "Идеальная локация! Уютная квартира для 4-х гостей от КварТерры!",
        rooms: 1,
        area: 47,
        floor: 1,
        amenities: ["Wi-Fi", "Кухня", "Стиральная машина", "Телевизор", "Кондиционер"],
        photos: [
            "images/id7_photo1.jpg",
            "images/id7_photo2.jpg",
            "images/id7_photo3.jpg",
            "images/id7_photo4.jpg",
            "images/id7_photo5.jpg",
            "images/id7_photo6.jpg"
        ],
        bookedDates: []
    },
    {
        id: 8,
        name: "Студия рядом с Областной детской больницей и Аквапарком",
        city: "Оренбург",
        address: "Транспортная улица, 16/1",
        coords: "55.0968,51.7651",
        price: 1440,
        description: "Идеальная локация! Уютная студия для 3-х гостей",
        rooms: 1,
        area: 27,
        floor: 4,
        amenities: ["Wi-Fi", "Кухня", "Стиральная машина", "Телевизор", "Рабочее место"],
        photos: [
            "images/id8_photo1.jpg",
            "images/id8_photo2.jpg",
            "images/id8_photo3.jpg",
            "images/id8_photo4.jpg",
            "images/id8_photo5.jpg",
            "images/id8_photo6.jpg"
        ],
        bookedDates: []
    },
    {
        id: 9,
        name: "Квартира от собственника",
        city: "Оренбург",
        address: "улица Маргелова, 5",
        coords: "55.0968,51.7651",
        price: 2400,
        description: "Сдам квартиру на сутки в ЖК Ботанический сад. Квартира в новом доме после ремонта.",
        rooms: 1,
        area: 38,
        floor: 4,
        amenities: ["Wi-Fi", "Кухня", "Холодильник", "Телевизор", "Балкон"],
        photos: [
            "images/id9_photo1.jpg",
            "images/id9_photo2.jpg",
            "images/id9_photo3.jpg",
            "images/id9_photo4.jpg",
            "images/id9_photo5.jpg",
            "images/id9_photo6.jpg"
        ],
        bookedDates: []
    },
    {
        id: 10,
        name: "Двушка с красивом видом у города еды",
        city: "Оренбург",
        address: "Северный проезд, 23",
        coords: "55.0968,51.7651",
        price: 2500,
        description: "Чистая квартира с двумя комнатами и красивым видом из окна. В пяти минутах ходьбы уютный Город еды с кафе, ресторанами и живой музыкой. Удобная транспортная развязка для поездок в любую часть города. В 10 минутах езды - аквапарк и термальный комплекс, широкий спектр мед. учреждений. ",
        rooms: 2,
        area: 40,
        floor: 10,
        amenities: ["Wi-Fi", "Кухня", "Телевизор", "Парковка"],
        photos: [
            "images/id10_photo1.jpg",
            "images/id10_photo2.jpg",
            "images/id10_photo3.jpg",
            "images/id10_photo4.jpg",
            "images/id10_photo5.jpg",
            "images/id10_photo6.jpg"
        ],
        bookedDates: []
    }
];

function getApartmentById(id) {
    for (var i = 0; i < apartments.length; i++) {
        if (apartments[i].id == parseInt(id)) {
            return apartments[i];
        }
    }
    return null;
}

function isDateBooked(aptId, checkIn, checkOut) {
    var apt = getApartmentById(aptId);
    if (!apt || !checkIn || !checkOut) return false;
    
    var start = new Date(checkIn);
    var end = new Date(checkOut);
    
    for (var d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
        var dateStr = d.getFullYear() + '-' + 
            String(d.getMonth() + 1).padStart(2, '0') + '-' + 
            String(d.getDate()).padStart(2, '0');
        
        for (var j = 0; j < apt.bookedDates.length; j++) {
            if (apt.bookedDates[j] == dateStr) {
                return true;
            }
        }
    }
    return false;
}

function getUrlParameter(name) {
    var params = window.location.search.substring(1).split('&');
    for (var i = 0; i < params.length; i++) {
        var pair = params[i].split('=');
        if (pair[0] == name) {
            return decodeURIComponent(pair[1]);
        }
    }
    return null;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    var date = new Date(dateStr);
    var months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 
                  'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
    return date.getDate() + ' ' + months[date.getMonth()] + ' ' + date.getFullYear();
}

function getRoomsText(n) {
    if (n >= 11 && n <= 14) return 'комнат';
    var last = n % 10;
    if (last == 1) return 'комната';
    if (last >= 2 && last <= 4) return 'комнаты';
    return 'комнат';
}

function isCurrentlyAvailable(apt, checkinDate) {
    var isEven = apt.id % 2 === 0;
    
    if (!checkinDate) {
        return true;
    }
    
    var date = new Date(checkinDate);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    
    if (isEven) {
        return (month >= 1 && month < 6) || (month === 6 && day === 1);
    } else {
        return (month > 6) || (month === 6 && day >= 2);
    }
}
