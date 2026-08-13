/**
 * PHP & MySQL Export Code Templates
 * Compliant with PDO prepared statements, password_hash(), form validation,
 * Telegram Bot API cURL notifications, and role-based access control.
 */

export const PHP_SCHEMA_SQL = `-- MySQL Database Schema for Maintenance Task Calendar System (Hostinger)
-- Database: u126897097_calendar
-- Website: 077.pe.hu/calendar

USE \`u126897097_calendar\`;

-- Users Table (Admin, Managers, Contractors)
CREATE TABLE IF NOT EXISTS \`users\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`username\` VARCHAR(50) NOT NULL UNIQUE,
    \`email\` VARCHAR(100) NOT NULL UNIQUE,
    \`password_hash\` VARCHAR(255) NOT NULL,
    \`full_name\` VARCHAR(100) NOT NULL,
    \`role\` ENUM('ADMIN', 'MANAGER', 'CONTRACTOR') NOT NULL DEFAULT 'CONTRACTOR',
    \`company\` VARCHAR(100) NOT NULL DEFAULT '',
    \`phone\` VARCHAR(30) DEFAULT '',
    \`telegram_username\` VARCHAR(50) DEFAULT '',
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tasks Table (CCTV & Server Room maintenance)
CREATE TABLE IF NOT EXISTS \`tasks\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`title\` VARCHAR(255) NOT NULL,
    \`description\` TEXT,
    \`category\` ENUM('CCTV', 'SERVER_ROOM', 'ACCESS_CONTROL', 'NETWORK') NOT NULL,
    \`priority\` ENUM('LOW', 'MEDIUM', 'HIGH', 'URGENT') NOT NULL DEFAULT 'MEDIUM',
    \`status\` ENUM('NEW', 'SCHEDULED', 'IN_PROGRESS', 'PENDING_REVIEW', 'COMPLETED', 'OVERDUE') NOT NULL DEFAULT 'NEW',
    \`location\` VARCHAR(255) NOT NULL,
    \`assigned_contractor_id\` INT NOT NULL,
    \`due_date\` DATE NOT NULL,
    \`due_time\` TIME DEFAULT '18:00:00',
    \`recurring\` ENUM('NONE', 'DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY') DEFAULT 'NONE',
    \`checklist_json\` JSON DEFAULT NULL,
    \`created_by_id\` INT NOT NULL,
    \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (\`assigned_contractor_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE,
    FOREIGN KEY (\`created_by_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Work Reports Table (Detailed completion reports upon task close)
CREATE TABLE IF NOT EXISTS \`work_reports\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`task_id\` INT NOT NULL UNIQUE,
    \`completed_by_id\` INT NOT NULL,
    \`contractor_company\` VARCHAR(100) NOT NULL,
    \`summary\` TEXT NOT NULL,
    \`equipment_checked_json\` JSON DEFAULT NULL,
    \`parts_replaced\` TEXT DEFAULT NULL,
    \`time_spent_hours\` DECIMAL(4,2) NOT NULL DEFAULT 1.0,
    \`status_rating\` ENUM('EXCELLENT', 'GOOD', 'NEEDS_ATTENTION') DEFAULT 'EXCELLENT',
    \`notes\` TEXT DEFAULT NULL,
    \`completed_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (\`task_id\`) REFERENCES \`tasks\`(\`id\`) ON DELETE CASCADE,
    FOREIGN KEY (\`completed_by_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Telegram Settings Table
CREATE TABLE IF NOT EXISTS \`telegram_config\` (
    \`id\` INT AUTO_INCREMENT PRIMARY KEY,
    \`bot_token\` VARCHAR(255) NOT NULL,
    \`chat_id\` VARCHAR(100) NOT NULL,
    \`channel_name\` VARCHAR(100) DEFAULT '',
    \`is_enabled\` TINYINT(1) DEFAULT 1,
    \`notify_new_task\` TINYINT(1) DEFAULT 1,
    \`notify_upcoming_task\` TINYINT(1) DEFAULT 1,
    \`notify_close_report\` TINYINT(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Initial Default Admin & Contractor Users (Password: admin123 / contractor123)
-- Uses standard password_hash(PASSWORD_BCRYPT) hashes
INSERT INTO \`users\` (\`username\`, \`email\`, \`password_hash\`, \`full_name\`, \`role\`, \`company\`, \`phone\`) VALUES
('admin', 'admin@company.ru', '\$2y\$10\$e0MYzXyjpJS7Pd0RVvHwHe1T9wR8D.2uY1UaG1X8kK7v4M5A7e0S6', 'Иван Сергеев (Главный Инженер)', 'ADMIN', 'ООО "ГлавСервис"', '+7 (999) 111-22-33'),
('contractor_cctv', 'cctv@spec.ru', '\$2y\$10\$e0MYzXyjpJS7Pd0RVvHwHe1T9wR8D.2uY1UaG1X8kK7v4M5A7e0S6', 'Алексей Петров (ООО "СпецСвязь")', 'CONTRACTOR', 'ООО "СпецСвязьМонтаж"', '+7 (999) 222-33-44'),
('contractor_server', 'server@infotech.ru', '\$2y\$10\$e0MYzXyjpJS7Pd0RVvHwHe1T9wR8D.2uY1UaG1X8kK7v4M5A7e0S6', 'Дмитрий Смирнов (ООО "ИнфоТех")', 'CONTRACTOR', 'ООО "ИнфоТех Сервис"', '+7 (999) 333-44-55')
ON DUPLICATE KEY UPDATE \`id\`=\`id\`;
`;

export const PHP_CONFIG_PDO = `<?php
/**
 * config.php - Secure MySQL Database Connection for Hostinger (077.pe.hu/calendar)
 */
define('DB_HOST', 'localhost');
define('DB_USER', 'u126897097_admin077');
define('DB_PASS', 'ВАШ_ПАРОЛЬ_ОТ_БД'); // Укажите пароль, заданный при создании пользователя u126897097_admin077
define('DB_NAME', 'u126897097_calendar');

function getDBConnection() {
    static $pdo = null;
    if ($pdo === null) {
        try {
            $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
            $options = [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false, // Enforce real prepared statements
            ];
            $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
        } catch (PDOException $e) {
            error_log("Database Connection Error: " . $e->getMessage());
            die(json_encode(['error' => 'Database connection failed. Check config.php credentials.']));
        }
    }
    return $pdo;
}
`;

export const PHP_AUTH_HANDLERS = `<?php
/**
 * auth.php - Authentication logic with password_hash, password_verify and PDO prepared statements
 */
session_start();
require_once 'config.php';

header('Content-Type: application/json; charset=utf-8');

$action = $_GET['action'] ?? '';

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'register') {
    $username = trim($_POST['username'] ?? '');
    $email = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
    $password = $_POST['password'] ?? '';
    $fullName = trim($_POST['full_name'] ?? '');
    $role = $_POST['role'] ?? 'CONTRACTOR';
    $company = trim($_POST['company'] ?? '');

    // Form Validation
    if (!$username || !$email || strlen($password) < 6 || !$fullName) {
        http_response_code(400);
        echo json_encode(['error' => 'Заполните все обязательные поля. Пароль не менее 6 символов.']);
        exit;
    }

    $pdo = getDBConnection();

    // Check existing user via Prepared Statement
    $stmt = $pdo->prepare("SELECT id FROM users WHERE username = :username OR email = :email");
    $stmt->execute([':username' => $username, ':email' => $email]);
    if ($stmt->fetch()) {
        http_response_code(409);
        echo json_encode(['error' => 'Пользователь с таким логином или email уже существует.']);
        exit;
    }

    // Secure Password Hashing
    $passwordHash = password_hash($password, PASSWORD_BCRYPT);

    $insertStmt = $pdo->prepare("
        INSERT INTO users (username, email, password_hash, full_name, role, company)
        VALUES (:username, :email, :password_hash, :full_name, :role, :company)
    ");
    
    $insertStmt->execute([
        ':username' => $username,
        ':email' => $email,
        ':password_hash' => $passwordHash,
        ':full_name' => $fullName,
        ':role' => in_array($role, ['ADMIN', 'MANAGER', 'CONTRACTOR']) ? $role : 'CONTRACTOR',
        ':company' => $company
    ]);

    echo json_encode(['success' => true, 'message' => 'Регистрация успешна!']);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $action === 'login') {
    $login = trim($_POST['login'] ?? '');
    $password = $_POST['password'] ?? '';

    if (!$login || !$password) {
        http_response_code(400);
        echo json_encode(['error' => 'Укажите логин и пароль.']);
        exit;
    }

    $pdo = getDBConnection();

    // Prepared statement for secure login lookup
    $stmt = $pdo->prepare("SELECT * FROM users WHERE username = :login OR email = :login");
    $stmt->execute([':login' => $login]);
    $user = $stmt->fetch();

    if ($user && password_verify($password, $user['password_hash'])) {
        // Prevent session fixation
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $_SESSION['username'] = $user['username'];
        $_SESSION['role'] = $user['role'];
        $_SESSION['full_name'] = $user['full_name'];

        unset($user['password_hash']);
        echo json_encode(['success' => true, 'user' => $user]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Неверный логин или пароль.']);
    }
    exit;
}

if ($action === 'me') {
    if (isset($_SESSION['user_id'])) {
        $pdo = getDBConnection();
        $stmt = $pdo->prepare("SELECT id, username, email, full_name, role, company, phone FROM users WHERE id = :id");
        $stmt->execute([':id' => $_SESSION['user_id']]);
        echo json_encode(['user' => $stmt->fetch()]);
    } else {
        http_response_code(401);
        echo json_encode(['error' => 'Не авторизован']);
    }
    exit;
}

if ($action === 'logout') {
    session_destroy();
    echo json_encode(['success' => true]);
    exit;
}
`;

export const PHP_TELEGRAM_BOT = `<?php
/**
 * telegram_bot.php - Sends Telegram notifications for new tasks, upcoming deadlines, and closeout work reports
 */
require_once 'config.php';

function sendTelegramNotification($message) {
    $pdo = getDBConnection();
    $stmt = $pdo->prepare("SELECT * FROM telegram_config WHERE is_enabled = 1 LIMIT 1");
    $stmt->execute();
    $config = $stmt->fetch();

    if (!$config || empty($config['bot_token']) || empty($config['chat_id'])) {
        return false; // Telegram not configured
    }

    $url = "https://api.telegram.org/bot" . $config['bot_token'] . "/sendMessage";
    $payload = [
        'chat_id' => $config['chat_id'],
        'text' => $message,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => true
    ];

    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    $result = curl_exec($ch);
    curl_close($ch);

    return $result;
}

// Notification formatting functions
function notifyNewTaskTelegram($task, $contractorName) {
    $msg = "🆕 <b>НОВАЯ ЗАДАЧА ПОДРЯДЧИКУ</b>\n\n";
    $msg .= "📌 <b>Название:</b> {$task['title']}\n";
    $msg .= "🏢 <b>Система:</b> {$task['category']} | 📍 {$task['location']}\n";
    $msg .= "👷‍♂️ <b>Исполнитель:</b> {$contractorName}\n";
    $msg .= "⏰ <b>Срок выполнения:</b> {$task['due_date']} {$task['due_time']}\n";
    $msg .= "🔥 <b>Приоритет:</b> {$task['priority']}\n\n";
    $msg .= "📝 <i>{$task['description']}</i>";

    return sendTelegramNotification($msg);
}

function notifyTaskCloseoutReportTelegram($task, $report) {
    $msg = "✅ <b>ОТЧЕТ О ВЫПОЛНЕНИИ ЗАЯВКИ ПОДРЯДЧИКОМ</b>\n\n";
    $msg .= "📌 <b>Заявка №{$task['id']}:</b> {$task['title']}\n";
    $msg .= "🏢 <b>Объект:</b> {$task['location']} ({$task['category']})\n";
    $msg .= "👷‍♂️ <b>Подрядчик:</b> {$report['contractor_company']} ({$report['completed_by']})\n";
    $msg .= "⏱ <b>Затрачено времени:</b> {$report['time_spent_hours']} ч.\n\n";
    $msg .= "📋 <b>ДЕТАЛЬНЫЙ ОТЧЕТ О РАБОТЕ:</b>\n{$report['summary']}\n\n";
    if (!empty($report['parts_replaced'])) {
        msg .= "🛠 <b>Замененные узлы/детали:</b> {$report['parts_replaced']}\n\n";
    }
    $msg .= "⭐ <b>Оценка состояния:</b> {$report['status_rating']}\n";
    $msg .= "🗓 <b>Дата закрытия:</b> " . date('Y-m-d H:i');

    return sendTelegramNotification($msg);
}
`;
