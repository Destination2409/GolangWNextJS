-- Local development seed data. Runs once, right after 01_schema.sql.
--
-- Test accounts (local only, never use these anywhere else):
--   admin@gonext.local / gonext-489385c0   permission_id = 2 (can manage products)
--   user@gonext.local  / gonext-489385c0   permission_id = 1 (regular member)

SET NAMES utf8mb4;

INSERT INTO users (email, password, prefix, first_name, last_name, gender, status, permission_id, created_at, updated_at) VALUES
('admin@gonext.local', '$2a$10$u9pnmA.t.RymSBJnbE1WauQE80HD4G6rzWXmVIVO9xLXm5iSQcsBG', NULL, 'Admin', 'GoNext', NULL, 'active', 2, NOW(3), NOW(3)),
('user@gonext.local',  '$2a$10$u9pnmA.t.RymSBJnbE1WauQE80HD4G6rzWXmVIVO9xLXm5iSQcsBG', NULL, 'Demo',  'User',   NULL, 'active', 1, NOW(3), NOW(3));

INSERT INTO genders (id, name) VALUES (1, 'Unisex'), (2, 'Men'), (3, 'Women');

INSERT INTO categories (id, name) VALUES
(1, 'ระบบเสียง'), (2, 'อุปกรณ์สวมใส่'), (3, 'เกมมิ่งเกียร์'), (4, 'เทคแวร์');

INSERT INTO sub_categories (id, category_id, name) VALUES
(1, 1, 'หูฟัง'), (2, 1, 'ลำโพง'),
(3, 2, 'นาฬิกาอัจฉริยะ'), (4, 2, 'แว่น AR'),
(5, 3, 'คีย์บอร์ด'), (6, 3, 'เมาส์'),
(7, 4, 'เสื้อผ้า'), (8, 4, 'รองเท้า'), (9, 4, 'กระเป๋า');

-- The storefront shows the product type as each product's tagline
INSERT INTO product_types (id, sub_category_id, name) VALUES
(1, 1, 'หูฟังตัดเสียงรบกวนพร้อมไฟนีออน'),
(2, 1, 'หูฟังไร้สายพร้อมเคสวงแหวนแสง'),
(3, 2, 'ลำโพงพกพาไฟ RGB'),
(4, 3, 'สมาร์ทวอทช์หน้าจอโฮโลกราฟิก'),
(5, 4, 'แว่น AR เลนส์รอบทิศ'),
(6, 5, 'คีย์บอร์ดแมคคานิคอล RGB ใส'),
(7, 6, 'เมาส์เกมมิ่งเปลือกใส'),
(8, 7, 'แจ็คเก็ตกันน้ำแถบสะท้อนแสง'),
(9, 8, 'รองเท้าพื้นเรืองแสง'),
(10, 9, 'กระเป๋าเป้เทคแวร์ 24L');

INSERT INTO colours (id, name) VALUES
(1, 'Graphite'), (2, 'Neon Cyan'), (3, 'Synth Pink'), (4, 'Black'), (5, 'White');

INSERT INTO usages (id, name) VALUES (1, 'ใช้งานทั่วไป'), (2, 'เกมมิ่ง'), (3, 'กีฬา'), (4, 'เดินทาง');

-- Images live in NextJSwGO/public/images (served by Next.js)
INSERT INTO products (external_id, gender_id, category_id, sub_category_id, product_type_id, colour_id, usage_id, title, description, image, image_url, price, compare_at_price, stock, status, created_at, updated_at) VALUES
('NS-AUD-001', 1, 1, 1, 1, 2, 1, 'NOVA-X Headphones', 'หูฟังครอบหูไร้สายรุ่นเรือธง ระบบตัดเสียงรบกวนแบบไฮบริด แบตเตอรี่ใช้งานได้ยาวนาน 60 ชั่วโมง พร้อมแถบไฟนีออนที่ปรับสีได้ผ่านแอป', 'hero.png', '/images/hero.png', 8990.00, 10990.00, 32, 'active', NOW(3) - INTERVAL 40 DAY, NOW(3)),
('NS-WEA-001', 1, 2, 3, 4, 1, 3, 'PULSE Watch', 'นาฬิกาอัจฉริยะตัวเรือนไทเทเนียม หน้าจอ AMOLED สว่างพิเศษ ติดตามสุขภาพครบ 24 ชม. กันน้ำลึก 50 เมตร', 'p-watch.png', '/images/p-watch.png', 12490.00, NULL, 18, 'active', NOW(3) - INTERVAL 3 DAY, NOW(3)),
('NS-GEA-001', 1, 3, 5, 6, 4, 2, 'GRID-75 Keyboard', 'คีย์บอร์ดขนาด 75% เฟรมอะลูมิเนียม คีย์แคปโปร่งแสง สวิตช์ Hot-swap พร้อมไฟ RGB ใต้แผงที่ตอบสนองต่อการพิมพ์', 'p-keyboard.png', '/images/p-keyboard.png', 5490.00, 6290.00, 54, 'active', NOW(3) - INTERVAL 30 DAY, NOW(3)),
('NS-APP-001', 1, 4, 7, 8, 4, 4, 'SHELL Techwear Jacket', 'แจ็คเก็ตเทคแวร์ผ้ากันน้ำ 3 ชั้น ระบายอากาศได้ดี มีแถบสะท้อนแสงรอบตัวเพื่อความปลอดภัยยามค่ำคืน', 'p-jacket.png', '/images/p-jacket.png', 4290.00, NULL, 9, 'active', NOW(3) - INTERVAL 25 DAY, NOW(3)),
('NS-APP-002', 1, 4, 8, 9, 5, 3, 'VOLT Runner', 'รองเท้าวิ่งผ้าถักน้ำหนักเบา พื้นโฟมคืนตัวสูงพร้อมไฟเรืองแสงรอบพื้น ใส่สบายทั้งวัน', 'p-sneaker.png', '/images/p-sneaker.png', 3890.00, 4590.00, 41, 'active', NOW(3) - INTERVAL 20 DAY, NOW(3)),
('NS-WEA-002', 1, 2, 4, 5, 2, 1, 'HALO AR Visor', 'แว่นความเป็นจริงเสริมพร้อมเลนส์โค้งรอบใบหน้า แสดงการแจ้งเตือน นำทาง และแปลภาษาแบบเรียลไทม์', 'p-visor.png', '/images/p-visor.png', 18900.00, NULL, 4, 'active', NOW(3) - INTERVAL 2 DAY, NOW(3)),
('NS-APP-003', 1, 4, 9, 10, 4, 4, 'CARGO Backpack', 'กระเป๋าเป้กันน้ำความจุ 24 ลิตร ช่องใส่แล็ปท็อป 16 นิ้ว สายรัดแบบโมดูลาร์และแถบสะท้อนแสง', 'p-backpack.png', '/images/p-backpack.png', 2990.00, NULL, 27, 'active', NOW(3) - INTERVAL 18 DAY, NOW(3)),
('NS-GEA-002', 1, 3, 6, 7, 5, 2, 'ION Mouse', 'เมาส์ไร้สายน้ำหนักเบาเพียง 58 กรัม เซนเซอร์ 26K DPI แบตเตอรี่ 90 ชั่วโมง พร้อมไฟแถบภายใน', 'p-mouse.png', '/images/p-mouse.png', 2490.00, NULL, 73, 'active', NOW(3) - INTERVAL 15 DAY, NOW(3)),
('NS-AUD-002', 1, 1, 1, 2, 3, 1, 'ORBIT Buds', 'หูฟัง True Wireless เสียงคมชัด ตัดเสียงรบกวน เคสชาร์จพร้อมวงแหวนไฟบอกสถานะแบตเตอรี่', 'p-earbuds.png', '/images/p-earbuds.png', 3290.00, 3990.00, 0, 'active', NOW(3) - INTERVAL 12 DAY, NOW(3)),
-- Draft product: visible in the backend only
('NS-AUD-003', 1, 1, 2, 3, 1, 1, 'BEAM Mini Speaker', 'ลำโพงบลูทูธขนาดพกพา เสียงรอบทิศทาง 360 องศา พร้อมวงแหวนไฟ RGB ที่เต้นตามจังหวะเพลง', NULL, NULL, 1990.00, NULL, 0, 'inactive', NOW(3) - INTERVAL 1 DAY, NOW(3));
