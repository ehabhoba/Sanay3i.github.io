<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

$uploadDir = '../uploads/';
if (!file_exists($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (isset($_FILES['image'])) {
    $file = $_FILES['image'];
    $allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $maxSize = 2 * 1024 * 1024; // 2MB

    $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
    $forbidden = ['php', 'exe', 'sh', 'bat', 'js', 'html', 'htm'];
    if (!in_array($file['type'], $allowed) || !in_array($ext, ['jpg','jpeg','png','gif','webp']) || in_array($ext, $forbidden)) {
        http_response_code(400);
        echo json_encode(['error' => 'نوع الملف غير مسموح']);
        exit;
    }
    if ($file['size'] > $maxSize) {
        http_response_code(400);
        echo json_encode(['error' => 'حجم الملف أكبر من المسموح (2 ميجا)']);
        exit;
    }
    $fileName = uniqid() . '_' . time() . '.' . $ext;
    $targetPath = $uploadDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $targetPath)) {
        echo json_encode([
            'status' => 'success',
            'path' => '/uploads/' . $fileName
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to upload file']);
    }
}
