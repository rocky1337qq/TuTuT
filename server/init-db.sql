-- База данных сервиса аренды квартир «ТуТуТ» (Оренбург)
-- Курсовой проект

CREATE DATABASE IF NOT EXISTS `tutut` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `tutut`;

SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `apartment_amenities`;
DROP TABLE IF EXISTS `amenities`;
DROP TABLE IF EXISTS `photos`;
DROP TABLE IF EXISTS `apartments`;
DROP TABLE IF EXISTS `users`;
SET FOREIGN_KEY_CHECKS = 1;

-- 1. Таблица пользователей (с разделением ролей user / admin)
CREATE TABLE `users` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `email` VARCHAR(191) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `phone` VARCHAR(30) DEFAULT NULL,
    `role` ENUM('user', 'admin') NOT NULL DEFAULT 'user',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Таблица квартир
CREATE TABLE `apartments` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(255) NOT NULL,
    `city` VARCHAR(100) NOT NULL DEFAULT 'Оренбург',
    `address` VARCHAR(255) NOT NULL,
    `coords` VARCHAR(50) NOT NULL,
    `price` INT NOT NULL,
    `description` TEXT NOT NULL,
    `rooms` INT NOT NULL DEFAULT 1,
    `area` INT NOT NULL DEFAULT 30,
    `floor` INT NOT NULL DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Таблица фотографий квартир (связь 1:N)
CREATE TABLE `photos` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `apartment_id` INT NOT NULL,
    `url` VARCHAR(255) NOT NULL,
    `sort_order` INT NOT NULL DEFAULT 0,
    CONSTRAINT `fk_photos_apartment` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Справочник удобств
CREATE TABLE `amenities` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Связующая таблица квартир и удобств (связь M:N)
CREATE TABLE `apartment_amenities` (
    `apartment_id` INT NOT NULL,
    `amenity_id` INT NOT NULL,
    PRIMARY KEY (`apartment_id`, `amenity_id`),
    CONSTRAINT `fk_aa_apartment` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_aa_amenity` FOREIGN KEY (`amenity_id`) REFERENCES `amenities` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Таблица бронирований
CREATE TABLE `bookings` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `apartment_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `guest_name` VARCHAR(100) NOT NULL,
    `guest_phone` VARCHAR(30) NOT NULL,
    `checkin` DATE NOT NULL,
    `checkout` DATE NOT NULL,
    `total_price` INT NOT NULL,
    `comment` TEXT DEFAULT NULL,
    `status` ENUM('pending', 'confirmed', 'cancelled') NOT NULL DEFAULT 'pending',
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_bookings_apartment` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_bookings_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Таблица отзывов
CREATE TABLE `reviews` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `apartment_id` INT NOT NULL,
    `user_id` INT NOT NULL,
    `rating` TINYINT NOT NULL CHECK (`rating` BETWEEN 1 AND 5),
    `comment` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reviews_apartment` FOREIGN KEY (`apartment_id`) REFERENCES `apartments` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- НАЧАЛЬНЫЕ ДАННЫЕ
-- =========================================================

-- Пользователи (пароли: admin123 и user123)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `phone`, `role`) VALUES
(1, 'Администратор', 'admin@tutut.ru', '$2a$10$nMoT.R6wWW9qoSLlXq83X.oX7jgJi82tf6jQy1bayZaa4148DIidq', '+7 (900) 000-00-01', 'admin'),
(2, 'Иван Петров', 'ivan@mail.ru', '$2a$10$cambysf6ajDID41b4SAOlOCPAUHY5GBIMoxY4zI8wzxW3I1axKDmi', '+7 (912) 345-67-89', 'user');

-- Квартиры (все реальные координаты в Оренбурге)
INSERT INTO `apartments` (`id`, `name`, `city`, `address`, `coords`, `price`, `description`, `rooms`, `area`, `floor`) VALUES
(1, 'Новая квартира около города еды', 'Оренбург', 'Автомобилистов улица, 15', '51.831664,55.171192', 2800, 'Квартира Люкс- комфортно и уютно как в пятизвёздочном отеле. Рядом торговые центры и Город еды.', 1, 37, 17),
(2, 'Евродвушка на Победе.', 'Оренбург', 'Проспект Победы, 159', '51.818750,55.142590', 2200, 'Гостям и жителям Оренбурга мы рады предложить снять посуточно уютную, просторную двухкомнатную квартиру, расположенную в новом элитном доме. Квартира совместила в себе: просторные комнаты, удобная планировка и современный ремонт. Апартаменты расположены в районе с развитой инфраструктурой. В шаговой доступности аптеки, банки, магазины, ресторан, парк 50 лет ВЛКСМ.', 2, 55, 14),
(3, 'Квартира на Пролетарской.', 'Оренбург', 'Пролетарская улица, 298', '51.802145,55.122410', 4500, 'В квартире имеется просторная кухня, со всем необходимым: холодильник, электрический чайник, электроплита, микроволновая печь, посуда, большой обеденный стол. В ванной комнате установлена современная стиральная машина, раковина, фен. В гостиной — комфортная большая двуспальная кровать с ортопедическим матрасом.', 1, 40, 16),
(4, 'Большая 4-местная студия с кухней рядом с аквапарком', 'Оренбург', 'улица Поляничко, 11/5', '51.834520,55.163230', 1990, 'Чистая квартира в спальном районе, в 5 минутах расположен аквапарк, термальный комплекс, рестораны, кафе. Хорошая транспортная развязка.', 1, 30, 14),
(5, 'Уютная квартира в центре города', 'Оренбург', 'улица Лукиана Попова, 103', '51.773510,55.111820', 2330, 'Квартира располагает телевизором с плоским экраном и кабельными каналами, кондиционером, гостиной, полностью оборудованной кухней с микроволновой печью, гостиной зоной и ванной комнатой.', 2, 65, 16),
(6, 'Квартира с удобным расположением на 3 человека', 'Оренбург', 'Пролетарская улица, 296', '51.801640,55.122110', 2990, 'Уважаемые гости, добро пожаловать в студию с дизайнерским ремонтом в новом ЖК Березовые аллеи. В шаговой доступности расположен СК Олимпийский, Центр дзюдо, ТЦ Гулливер, 10 мин на автомобиле до Термоленда.', 1, 26, 2),
(7, '1к кв 4 гостя от Квартерры рядом с железнодорожной больницей', 'Оренбург', 'Пролетарская улица, 288/2', '51.799510,55.121540', 2500, 'Идеальная локация! Уютная квартира для 4-х гостей от КварТерры! Чистое бельё, вся необходимая техника и посуда.', 1, 47, 1),
(8, 'Студия рядом с Областной детской больницей и Аквапарком', 'Оренбург', 'Транспортная улица, 16/1', '51.821430,55.167810', 1440, 'Идеальная локация! Уютная студия для 3-х гостей. Современный ремонт, чистота, комфортная кровать и быстрый интернет.', 1, 27, 4),
(9, 'Квартира от собственника', 'Оренбург', 'улица Маргелова, 5', '51.805520,55.176210', 2400, 'Сдам квартиру на сутки в ЖК Ботанический сад. Квартира в новом доме после ремонта, отличный вид из окна.', 1, 38, 4),
(10, 'Двушка с красивым видом у города еды', 'Оренбург', 'Северный проезд, 23', '51.829010,55.155020', 2500, 'Чистая квартира с двумя комнатами и красивым видом из окна. В пяти минутах ходьбы уютный Город еды с кафе, ресторанами и живой музыкой. Удобная транспортная развязка для поездок в любую часть города.', 2, 40, 10);

-- Фотографии (только существующие файлы в images/)
INSERT INTO `photos` (`apartment_id`, `url`, `sort_order`) VALUES
(1, 'images/id1_photo1.jpg', 0),
(1, 'images/id1_photo2.jpg', 1),
(1, 'images/id1_photo3.jpg', 2),
(1, 'images/id1_photo4.jpg', 3),
(1, 'images/id1_photo5.jpg', 4),
(1, 'images/id1_photo6.jpg', 5),
(1, 'images/id1_photo7.jpg', 6),
(1, 'images/id1_photo8.jpg', 7),

(2, 'images/id2_photo1.jpg', 0),
(2, 'images/id2_photo2.jpg', 1),
(2, 'images/id2_photo3.jpg', 2),
(2, 'images/id2_photo4.jpg', 3),
(2, 'images/id2_photo5.jpg', 4),
(2, 'images/id2_photo6.jpg', 5),

(3, 'images/id3_photo1.jpg', 0),
(3, 'images/id3_photo2.jpg', 1),
(3, 'images/id3_photo3.jpg', 2),
(3, 'images/id3_photo4.jpg', 3),
(3, 'images/id3_photo5.jpg', 4),
(3, 'images/id3_photo6.jpg', 5),
(3, 'images/id3_photo7.jpg', 6),

(4, 'images/id4_photo1.jpg', 0),
(4, 'images/id4_photo2.jpg', 1),
(4, 'images/id4_photo3.jpg', 2),
(4, 'images/id4_photo4.jpg', 3),
(4, 'images/id4_photo5.jpg', 4),
(4, 'images/id4_photo6.jpg', 5),

(5, 'images/id5_photo1.jpg', 0),
(5, 'images/id5_photo2.jpg', 1),
(5, 'images/id5_photo3.jpg', 2),
(5, 'images/id5_photo4.jpg', 3),
(5, 'images/id5_photo5.jpg', 4),
(5, 'images/id5_photo6.jpg', 5),

(6, 'images/id6_photo1.jpg', 0),
(6, 'images/id6_photo2.jpg', 1),
(6, 'images/id6_photo3.jpg', 2),
(6, 'images/id6_photo4.jpg', 3),
(6, 'images/id6_photo5.jpg', 4),

(7, 'images/id7_photo1.jpg', 0),
(7, 'images/id7_photo2.jpg', 1),
(7, 'images/id7_photo3.jpg', 2),
(7, 'images/id7_photo4.jpg', 3),
(7, 'images/id7_photo5.jpg', 4),
(7, 'images/id7_photo6.jpg', 5),

(8, 'images/id8_photo1.jpg', 0),
(8, 'images/id8_photo2.jpg', 1),
(8, 'images/id8_photo3.jpg', 2),
(8, 'images/id8_photo4.jpg', 3),
(8, 'images/id8_photo5.jpg', 4),
(8, 'images/id8_photo6.jpg', 5),

(9, 'images/id9_photo1.jpg', 0),
(9, 'images/id9_photo2.jpg', 1),
(9, 'images/id9_photo3.jpg', 2),
(9, 'images/id9_photo4.jpg', 3),
(9, 'images/id9_photo5.jpg', 4),
(9, 'images/id9_photo6.jpg', 5),

(10, 'images/id10_photo1.jpg', 0),
(10, 'images/id10_photo2.jpg', 1),
(10, 'images/id10_photo3.jpg', 2),
(10, 'images/id10_photo4.jpg', 3),
(10, 'images/id10_photo5.jpg', 4),
(10, 'images/id10_photo6.jpg', 5);

-- Удобства
INSERT INTO `amenities` (`id`, `name`) VALUES
(1, 'Wi-Fi'),
(2, 'Кондиционер'),
(3, 'Телевизор'),
(4, 'Кухня'),
(5, 'Стиральная машина'),
(6, 'Парковка'),
(7, 'Балкон'),
(8, 'Лифт'),
(9, 'Отдельная кухня'),
(10, '1 ванная комната'),
(11, '1 двуспальная кровать'),
(12, '1 совмещённая ванная'),
(13, 'Кухня-гостинная'),
(14, 'Бытовая техника'),
(15, 'Средства личной гигиены'),
(16, 'Двуспальная кровать и кресло-кровать'),
(17, 'Рабочее место'),
(18, 'Холодильник');

-- Связь квартир с удобствами
INSERT INTO `apartment_amenities` (`apartment_id`, `amenity_id`) VALUES
(1, 9), (1, 8), (1, 10), (1, 3), (1, 2),
(2, 11), (2, 12), (2, 1),
(3, 1), (3, 4), (3, 5), (3, 3), (3, 2), (3, 6),
(4, 1), (4, 6), (4, 12), (4, 13), (4, 7),
(5, 1), (5, 2), (5, 3), (5, 14), (5, 15),
(6, 1), (6, 6), (6, 16),
(7, 1), (7, 4), (7, 5), (7, 3), (7, 2),
(8, 1), (8, 4), (8, 5), (8, 3), (8, 17),
(9, 1), (9, 4), (9, 18), (9, 3), (9, 7),
(10, 1), (10, 4), (10, 3), (10, 6);

-- Тестовые бронирования
INSERT INTO `bookings` (`id`, `apartment_id`, `user_id`, `guest_name`, `guest_phone`, `checkin`, `checkout`, `total_price`, `comment`, `status`) VALUES
(1, 1, 2, 'Иван Петров', '+7 (912) 345-67-89', '2026-11-05', '2026-11-08', 8400, 'Буду с чемоданом, нужен поздний заезд', 'confirmed'),
(2, 4, 2, 'Иван Петров', '+7 (912) 345-67-89', '2026-11-12', '2026-11-15', 5970, 'Семья с ребенком', 'pending');

-- Тестовые отзывы
INSERT INTO `reviews` (`id`, `apartment_id`, `user_id`, `rating`, `comment`, `created_at`) VALUES
(1, 1, 2, 5, 'Отличная квартира, чистая, свежий ремонт, всё необходимое есть. Очень удобно рядом с Городом еды!', '2026-10-20 12:00:00'),
(2, 2, 2, 5, 'Прекрасное место, уютно, тихий район. Быстро заселились, всё супер!', '2026-10-22 15:30:00'),
(3, 3, 2, 4, 'Хорошая квартира, красивый вид из окна, быстрый интернет. Рекомендую.', '2026-10-25 18:45:00');
