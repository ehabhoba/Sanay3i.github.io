<?php
require_once 'config/config.php';

// التحقق من قاعدة البيانات
try {
    $db = new PDO(
        "mysql:host={$config['db']['host']};dbname={$config['db']['dbname']};charset={$config['db']['charset']}",
        $config['db']['username'],
        $config['db']['password']
    );
    echo "✓ تم الاتصال بقاعدة البيانات بنجاح\n";
} catch (PDOException $e) {
    die("× فشل الاتصال بقاعدة البيانات: " . $e->getMessage() . "\nيرجى مراجعة إعدادات قاعدة البيانات في config/config.php\n");
}

// التحقق من Redis
try {
    $redis = new Redis();
    $redis->connect('127.0.0.1', 6379);
    echo "✓ تم الاتصال بـ Redis بنجاح\n";
} catch (Exception $e) {
    die("× فشل الاتصال بـ Redis: " . $e->getMessage() . "\nتأكد من تشغيل خدمة Redis على السيرفر\n");
}

// التحقق من WebSocket (فحص الاتصال عبر fsockopen)
$wsHost = parse_url($config['app']['socket_url'], PHP_URL_HOST) ?: 'localhost';
$wsPort = parse_url($config['app']['socket_url'], PHP_URL_PORT) ?: 3000;
$wsConn = @fsockopen($wsHost, $wsPort, $errno, $errstr, 2);
if ($wsConn) {
    echo "✓ تم الاتصال بـ WebSocket ($wsHost:$wsPort) بنجاح\n";
    fclose($wsConn);
} else {
    echo "× فشل الاتصال بـ WebSocket ($wsHost:$wsPort): $errstr\n";
    echo "  - تأكد من تشغيل خادم WebSocket (node websocket-server.js)\n";
}

// التحقق من مجلد التحميلات وصلاحياته
$uploadDir = __DIR__ . '/uploads';
if (!file_exists($uploadDir)) {
    if (mkdir($uploadDir, 0777, true)) {
        echo "✓ تم إنشاء مجلد التحميلات بنجاح\n";
    } else {
        die("× فشل إنشاء مجلد التحميلات\nتأكد من صلاحيات الكتابة في مجلد المشروع\n");
    }
}
if (is_writable($uploadDir)) {
    echo "✓ مجلد التحميلات قابل للكتابة\n";
} else {
    echo "× مجلد التحميلات غير قابل للكتابة. الرجاء ضبط الصلاحيات إلى 0777\n";
    echo "  - نفذ الأمر: chmod -R 0777 uploads\n";
}

// فحص وجود ملف .htaccess
$htaccess = __DIR__ . '/.htaccess';
if (file_exists($htaccess)) {
    echo "✓ ملف .htaccess موجود\n";
} else {
    echo "× ملف .htaccess غير موجود. الرجاء إضافته لتحسين الأمان وإعادة كتابة الروابط\n";
    echo "  - يمكنك نسخ ملف .htaccess من المستودع أو الوثائق\n";
}

echo "\nالمنصة جاهزة للعمل!\n";
