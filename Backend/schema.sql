CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  email VARCHAR(190) NOT NULL UNIQUE,
  phone VARCHAR(30) NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(30) NOT NULL DEFAULT 'CUSTOMER',
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS events (
  event_id INT AUTO_INCREMENT PRIMARY KEY,
  event_name VARCHAR(120) NOT NULL,
  description TEXT NULL,
  approx_package DECIMAL(12,2) NOT NULL DEFAULT 0,
  min_people INT NOT NULL DEFAULT 1,
  max_people INT NOT NULL DEFAULT 999999,
  image TEXT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_manager_profiles (
  manager_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL UNIQUE,
  business_name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  experience DECIMAL(5,2) NOT NULL DEFAULT 0,
  location VARCHAR(160) NULL,
  rating DECIMAL(3,2) NOT NULL DEFAULT 0,
  details_url VARCHAR(500) NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_manager_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS services (
  service_id INT AUTO_INCREMENT PRIMARY KEY,
  manager_id INT NOT NULL,
  service_name VARCHAR(160) NOT NULL,
  description TEXT NULL,
  base_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  is_customizable TINYINT(1) NOT NULL DEFAULT 0,
  customization_details TEXT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_service_manager FOREIGN KEY (manager_id) REFERENCES event_manager_profiles(manager_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS event_requirements (
  requirement_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  event_id INT NOT NULL,
  requirement_title VARCHAR(200) NOT NULL,
  event_date DATE NOT NULL,
  event_end_date DATE NULL,
  guest_count INT NOT NULL,
  location VARCHAR(200) NULL,
  description TEXT NULL,
  special_requirements TEXT NULL,
  budget DECIMAL(12,2) NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_req_customer FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_req_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS proposals (
  proposal_id INT AUTO_INCREMENT PRIMARY KEY,
  requirement_id INT NOT NULL,
  manager_id INT NOT NULL,
  package_name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  price DECIMAL(12,2) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_requirement_manager_status (requirement_id, manager_id, status),
  CONSTRAINT fk_prop_requirement FOREIGN KEY (requirement_id) REFERENCES event_requirements(requirement_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_prop_manager FOREIGN KEY (manager_id) REFERENCES event_manager_profiles(manager_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS bookings (
  booking_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  manager_id INT NOT NULL,
  proposal_id INT NULL,
  event_id INT NOT NULL,
  event_name VARCHAR(160) NULL,
  event_date DATE NOT NULL,
  event_end_date DATE NULL,
  guest_count INT NOT NULL,
  location VARCHAR(200) NULL,
  estimated_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  final_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  selected_services JSON NULL,
  service_customizations JSON NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'PENDING',
  cancellation_reason TEXT NULL,
  completed_at DATETIME NULL,
  cancelled_at DATETIME NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_booking_customer FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_booking_manager FOREIGN KEY (manager_id) REFERENCES event_manager_profiles(manager_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_booking_proposal FOREIGN KEY (proposal_id) REFERENCES proposals(proposal_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_booking_event FOREIGN KEY (event_id) REFERENCES events(event_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS guests (
  guest_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  name VARCHAR(160) NOT NULL,
  phone VARCHAR(30) NULL,
  email VARCHAR(190) NULL,
  guest_type VARCHAR(30) NOT NULL DEFAULT 'ADULT',
  rsvp_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  special_requirements TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_guest_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tasks (
  task_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  task_name VARCHAR(200) NOT NULL,
  description TEXT NULL,
  start_date DATE NULL,
  due_date DATE NULL,
  assigned_to INT NULL,
  priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
  status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
  created_by INT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_task_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_task_assigned FOREIGN KEY (assigned_to) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_task_creator FOREIGN KEY (created_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payments (
  payment_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  customer_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  payment_type VARCHAR(40) NOT NULL,
  payment_method VARCHAR(40) NOT NULL,
  transaction_id VARCHAR(190) NULL UNIQUE,
  status VARCHAR(30) NOT NULL DEFAULT 'SUCCESS',
  payment_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_payment_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_payment_customer FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS refunds (
  refund_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL,
  payment_id INT NOT NULL,
  customer_id INT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  reason TEXT NOT NULL,
  requested_by INT NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'REQUESTED',
  approved_by INT NULL,
  refund_transaction_id VARCHAR(190) NULL,
  notes TEXT NULL,
  requested_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  processed_at TIMESTAMP NULL,
  CONSTRAINT fk_refund_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_refund_payment FOREIGN KEY (payment_id) REFERENCES payments(payment_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_refund_customer FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_refund_requester FOREIGN KEY (requested_by) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_refund_approver FOREIGN KEY (approved_by) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS support_tickets (
  ticket_id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  booking_id INT NULL,
  subject VARCHAR(200) NOT NULL,
  description TEXT NULL,
  priority VARCHAR(30) NOT NULL DEFAULT 'MEDIUM',
  status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
  assigned_admin INT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_ticket_customer FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_ticket_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_ticket_admin FOREIGN KEY (assigned_admin) REFERENCES users(user_id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ticket_messages (
  message_id INT AUTO_INCREMENT PRIMARY KEY,
  ticket_id INT NOT NULL,
  sender_id INT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_message_ticket FOREIGN KEY (ticket_id) REFERENCES support_tickets(ticket_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_message_sender FOREIGN KEY (sender_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  subscriber_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(190) NOT NULL UNIQUE,
  subscribed_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS feedback (
  feedback_id INT AUTO_INCREMENT PRIMARY KEY,
  booking_id INT NOT NULL UNIQUE,
  customer_id INT NOT NULL,
  manager_id INT NOT NULL,
  rating INT NOT NULL,
  comment TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_feedback_booking FOREIGN KEY (booking_id) REFERENCES bookings(booking_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_feedback_customer FOREIGN KEY (customer_id) REFERENCES users(user_id) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT fk_feedback_manager FOREIGN KEY (manager_id) REFERENCES event_manager_profiles(manager_id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB;

INSERT INTO events (event_name, description, approx_package, min_people, max_people, status)
SELECT seed.event_name, seed.description, seed.approx_package, seed.min_people, seed.max_people, seed.status
FROM (
  SELECT 'Wedding' AS event_name, 'Premium Indian wedding planning and coordination.' AS description, 200000 AS approx_package, 50 AS min_people, 1000 AS max_people, 'ACTIVE' AS status
  UNION ALL SELECT 'Birthday Party', 'Creative birthday planning for intimate and large celebrations.', 50000, 10, 300, 'ACTIVE'
  UNION ALL SELECT 'Engagement Ceremony', 'Elegant engagement ceremonies and family celebrations.', 80000, 20, 500, 'ACTIVE'
  UNION ALL SELECT 'Corporate Event', 'Professional conferences, launches and corporate gatherings.', 150000, 20, 2000, 'ACTIVE'
  UNION ALL SELECT 'Anniversary', 'Milestone anniversary celebrations and family gatherings.', 90000, 20, 500, 'ACTIVE'
  UNION ALL SELECT 'Baby Shower', 'Warm, family-friendly baby shower planning and coordination.', 60000, 10, 250, 'ACTIVE'
  UNION ALL SELECT 'Reception', 'Reception planning, decor, dining and guest coordination.', 120000, 20, 800, 'ACTIVE'
  UNION ALL SELECT 'College Fest', 'Large student festivals, cultural programmes and campus events.', 250000, 100, 10000, 'ACTIVE'
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM events LIMIT 1);

INSERT INTO users (name, email, phone, password_hash, role, status)
SELECT 'EventFlow Admin', 'admin@eventflow.com', '+91 9000000001', '$2b$10$wFMkdgJUZbo/6BItADCCxuu3PPoRJba4L2345UO5I70g6aeS0N67C', 'ADMIN', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='admin@eventflow.com');

INSERT INTO users (name, email, phone, password_hash, role, status)
SELECT 'Demo Manager', 'manager@eventflow.com', '+91 9000000002', '$2b$10$fZMDKwTTeSegdive8wboX.A7Q0h54SIYboS8vKyuBeNBVkbBrhBsi', 'EVENT_MANAGER', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='manager@eventflow.com');

INSERT INTO users (name, email, phone, password_hash, role, status)
SELECT 'Demo Customer', 'customer@eventflow.com', '+91 9000000003', '$2b$10$E.kiwZRLW9b2ZWjoPjLPgO45o6EKH5YrUT90kyQtkCVKgaWzI/h8O', 'CUSTOMER', 'ACTIVE'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email='customer@eventflow.com');

INSERT INTO event_manager_profiles (user_id, business_name, description, experience, location, rating, status)
SELECT u.user_id, 'Demo Events Studio', 'Demo manager account for end-to-end testing.', 5, 'Mumbai, Maharashtra', 4.8, 'ACTIVE'
FROM users u
WHERE u.email='manager@eventflow.com'
  AND NOT EXISTS (SELECT 1 FROM event_manager_profiles WHERE user_id=u.user_id);

INSERT INTO services (manager_id, service_name, description, base_price, is_customizable, customization_details, status)
SELECT emp.manager_id, 'Decoration', 'Stage, floral decoration and venue styling.', 40000, 1, 'Floral colors and stage layout can be customized.', 'AVAILABLE'
FROM event_manager_profiles emp
JOIN users u ON u.user_id=emp.user_id
WHERE u.email='manager@eventflow.com'
  AND NOT EXISTS (SELECT 1 FROM services WHERE manager_id=emp.manager_id);
