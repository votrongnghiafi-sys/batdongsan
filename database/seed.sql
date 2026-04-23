SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;
USE `bds_multisite`;

TRUNCATE TABLE `leads`;
TRUNCATE TABLE `site_sections`;
TRUNCATE TABLE `property_images`;
TRUNCATE TABLE `properties`;
TRUNCATE TABLE `projects`;
TRUNCATE TABLE `sites`;

SET FOREIGN_KEY_CHECKS = 1;

-- Site 1: Duana Riverside
INSERT INTO `sites` (`site_key`, `name`, `domain`, `logo_url`, `primary_color`, `secondary_color`, `phone`, `email`)
VALUES ('duana', 'Dự Án Duana Riverside', 'duana.batdongsanuytin.com', '/uploads/duana/logo.png', '#0A84FF', '#30D158', '0909 123 456', 'info@duana.vn');

INSERT INTO `projects` (`site_id`, `name`, `location`, `description`, `hero_image`, `hero_tagline`, `status`)
VALUES (1, 'Duana Riverside Villa', 'Quận 2, TP. Hồ Chí Minh',
  'Khu biệt thự ven sông đẳng cấp với thiết kế hiện đại, không gian sống xanh và tiện ích 5 sao.',
  '/uploads/duana/hero.jpg', 'Nơi cuộc sống thượng lưu bắt đầu', 'selling');

INSERT INTO `properties` (`project_id`, `title`, `price`, `area`, `bedrooms`, `bathrooms`, `floor`, `direction`, `description`, `lat`, `lng`, `is_featured`, `status`) VALUES
(1, 'Biệt thự A01 - Ven sông', 15500000000, 320.5, 5, 4, 'Trệt + 2 lầu', 'Đông Nam', 'Biệt thự view trực diện sông Sài Gòn, hồ bơi riêng và sân vườn rộng.', 10.7870, 106.7470, 1, 'available'),
(1, 'Biệt thự A02 - Hồ bơi riêng', 12800000000, 280.0, 4, 3, 'Trệt + 2 lầu', 'Tây Nam', 'Biệt thự góc 2 mặt tiền, hồ bơi infinity riêng, gần clubhouse.', 10.7872, 106.7472, 1, 'available'),
(1, 'Biệt thự B01 - Sân vườn', 9200000000, 220.0, 4, 3, 'Trệt + 1 lầu', 'Nam', 'Biệt thự sân vườn phong cách tropical, không gian mở kết nối thiên nhiên.', 10.7875, 106.7468, 0, 'available'),
(1, 'Biệt thự B02 - Corner', 10500000000, 250.0, 4, 3, 'Trệt + 2 lầu', 'Đông', 'Biệt thự góc 2 mặt tiền, tầm nhìn panorama ra khu công viên trung tâm.', 10.7878, 106.7465, 0, 'available'),
(1, 'Biệt thự C01 - Sky Garden', 18000000000, 380.0, 5, 5, 'Trệt + 3 lầu', 'Đông Nam', 'Penthouse villa cao cấp nhất dự án, sân thượng sky garden view 360 độ.', 10.7868, 106.7475, 1, 'reserved'),
(1, 'Biệt thự C02 - Premium', 14200000000, 300.0, 5, 4, 'Trệt + 2 lầu', 'Bắc', 'Premium villa nội thất hoàn thiện cao cấp, smart home tích hợp.', 10.7865, 106.7478, 0, 'available');

INSERT INTO `site_sections` (`site_id`, `section_key`, `content`, `sort_order`) VALUES
(1, 'hero', '{"title":"Duana Riverside Villa","subtitle":"Nơi cuộc sống thượng lưu bắt đầu","backgroundImage":"/uploads/duana/hero.jpg","ctaText":"Đăng ký tư vấn","ctaPhone":"0909 123 456"}', 1),
(1, 'about', '{"title":"Về dự án","description":"Duana Riverside là khu biệt thự ven sông cao cấp tại Quận 2, TP.HCM. Với quy mô 12 hecta, dự án mang đến 120 căn biệt thự sang trọng được bao bọc bởi không gian xanh mát và tiện ích đẳng cấp 5 sao.","highlights":["Vị trí vàng Quận 2","120 biệt thự sang trọng","Tiện ích 5 sao","Pháp lý minh bạch"]}', 2),
(1, 'gallery', '{"title":"Thư viện hình ảnh","images":["/uploads/duana/gallery-1.jpg","/uploads/duana/gallery-2.jpg","/uploads/duana/gallery-3.jpg","/uploads/duana/gallery-4.jpg","/uploads/duana/gallery-5.jpg","/uploads/duana/gallery-6.jpg"]}', 3),
(1, 'amenities', '{"title":"Tiện ích nổi bật","items":[{"icon":"pool","name":"Hồ bơi Infinity","description":"Hồ bơi tràn bờ dài 50m view sông"},{"icon":"gym","name":"Phòng Gym","description":"Trang bị thiết bị hiện đại Technogym"},{"icon":"park","name":"Công viên xanh","description":"3 hecta công viên cây xanh ven sông"},{"icon":"security","name":"An ninh 24/7","description":"Hệ thống an ninh đa lớp, camera AI"},{"icon":"school","name":"Trường học quốc tế","description":"Liên cấp quốc tế trong khu compound"},{"icon":"hospital","name":"Y tế cao cấp","description":"Phòng khám đa khoa tiêu chuẩn quốc tế"}]}', 4),
(1, 'location', '{"title":"Vị trí đắc địa","description":"Tọa lạc ngay trung tâm Quận 2, kết nối thuận tiện đến mọi tiện ích.","mapCenter":{"lat":10.787,"lng":106.747},"nearby":[{"name":"Trung tâm TP","distance":"15 phút"},{"name":"Sân bay Tân Sơn Nhất","distance":"25 phút"},{"name":"Metro Bến Thành","distance":"10 phút"},{"name":"Trường quốc tế BIS","distance":"5 phút"}]}', 5),
(1, 'contact', '{"title":"Liên hệ tư vấn","subtitle":"Để lại thông tin, chuyên viên sẽ liên hệ bạn trong 30 phút","phone":"0909 123 456","email":"info@duana.vn","address":"Đường Nguyễn Thị Định, Quận 2, TP.HCM","workingHours":"8:00 - 20:00 (T2 - CN)"}', 6);

-- Site 2: Sunrise City
INSERT INTO `sites` (`site_key`, `name`, `domain`, `logo_url`, `primary_color`, `secondary_color`, `phone`, `email`)
VALUES ('sunrise', 'Sunrise City Apartments', 'sunrise.batdongsanuytin.com', '/uploads/sunrise/logo.png', '#FF6B35', '#FFD23F', '0912 456 789', 'hello@sunrise-city.vn');

INSERT INTO `projects` (`site_id`, `name`, `location`, `description`, `hero_image`, `hero_tagline`, `status`)
VALUES (2, 'Sunrise City Central', 'Quận 7, TP. Hồ Chí Minh',
  'Căn hộ cao cấp tại trung tâm Quận 7 với tầm nhìn panorama toàn thành phố.',
  '/uploads/sunrise/hero.jpg', 'Đón bình minh từ tầm cao', 'selling');

INSERT INTO `properties` (`project_id`, `title`, `price`, `area`, `bedrooms`, `bathrooms`, `floor`, `direction`, `description`, `lat`, `lng`, `is_featured`, `status`) VALUES
(2, 'Căn hộ 1PN - Studio Plus', 2800000000, 52.0, 1, 1, 'Tầng 15', 'Đông', 'Studio plus thiết kế mở, phù hợp cho người trẻ.', 10.7295, 106.7217, 0, 'available'),
(2, 'Căn hộ 2PN - City View', 4500000000, 78.0, 2, 2, 'Tầng 22', 'Đông Nam', 'Căn 2PN view thành phố, layout thông minh.', 10.7297, 106.7219, 1, 'available'),
(2, 'Căn hộ 3PN - River View', 6200000000, 105.0, 3, 2, 'Tầng 28', 'Nam', 'Căn góc 3PN hướng sông, ban công rộng.', 10.7299, 106.7221, 1, 'available'),
(2, 'Penthouse Duplex', 12000000000, 200.0, 4, 3, 'Tầng 35-36', 'Đông Nam', 'Penthouse duplex 2 tầng, hồ bơi trên không.', 10.7301, 106.7223, 1, 'reserved'),
(2, 'Căn hộ 2PN - Garden View', 4200000000, 75.0, 2, 2, 'Tầng 8', 'Tây', 'Căn 2PN tầng thấp, view vườn nội khu yên tĩnh.', 10.7293, 106.7215, 0, 'available');

INSERT INTO `site_sections` (`site_id`, `section_key`, `content`, `sort_order`) VALUES
(2, 'hero', '{"title":"Sunrise City Central","subtitle":"Đón bình minh từ tầm cao","backgroundImage":"/uploads/sunrise/hero.jpg","ctaText":"Nhận bảng giá","ctaPhone":"0912 456 789"}', 1),
(2, 'about', '{"title":"Giới thiệu dự án","description":"Sunrise City Central tọa lạc tại trung tâm Quận 7 — khu đô thị sầm uất nhất phía Nam Sài Gòn. Với 3 tòa tháp cao 40 tầng, 1.200 căn hộ, dự án mang đến cuộc sống resort ngay giữa lòng thành phố.","highlights":["View panorama 360","1.200 căn hộ cao cấp","Tiện ích resort tầng thượng","Gần Phú Mỹ Hưng"]}', 2),
(2, 'gallery', '{"title":"Hình ảnh dự án","images":["/uploads/sunrise/gallery-1.jpg","/uploads/sunrise/gallery-2.jpg","/uploads/sunrise/gallery-3.jpg","/uploads/sunrise/gallery-4.jpg"]}', 3),
(2, 'amenities', '{"title":"Tiện ích đẳng cấp","items":[{"icon":"pool","name":"Sky Pool","description":"Hồ bơi trên không tầng 40 view toàn thành phố"},{"icon":"gym","name":"Fitness Center","description":"Phòng gym hiện đại 500m2"},{"icon":"park","name":"Sky Garden","description":"Vườn trên không 2.000m2 xanh mát"},{"icon":"shopping","name":"Commercial Center","description":"TTTM 5 tầng tích hợp ngay podium"},{"icon":"playground","name":"Kids Zone","description":"Khu vui chơi trẻ em trong nhà và ngoài trời"},{"icon":"cafe","name":"Lounge Bar","description":"Sky lounge bar tầng thượng sang trọng"}]}', 4),
(2, 'location', '{"title":"Vị trí chiến lược","description":"Quận 7 — Khu đô thị kiểu mẫu phía Nam Sài Gòn.","mapCenter":{"lat":10.7295,"lng":106.7217},"nearby":[{"name":"Phú Mỹ Hưng","distance":"5 phút"},{"name":"Trung tâm Q.1","distance":"20 phút"},{"name":"Sân bay TSN","distance":"30 phút"},{"name":"ĐH RMIT","distance":"10 phút"}]}', 5),
(2, 'contact', '{"title":"Đăng ký nhận thông tin","subtitle":"Hotline tư vấn 24/7","phone":"0912 456 789","email":"hello@sunrise-city.vn","address":"Đại lộ Nguyễn Văn Linh, Quận 7, TP.HCM","workingHours":"8:00 - 21:00 (T2 - CN)"}', 6);
