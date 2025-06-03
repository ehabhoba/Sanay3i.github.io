<?php
class FileService {
    private $allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    private $maxSize = 2 * 1024 * 1024; // 2MB
    private $uploadDir = '../uploads/';

    public function __construct() {
        if (!file_exists($this->uploadDir)) {
            mkdir($this->uploadDir, 0777, true);
        }
    }

    public function upload($file) {
        if (!isset($file['type']) || !in_array($file['type'], $this->allowedTypes)) {
            throw new Exception('نوع الملف غير مسموح');
        }

        if ($file['size'] > $this->maxSize) {
            throw new Exception('حجم الملف أكبر من المسموح (2 ميجا)');
        }

        $ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $forbidden = ['php', 'exe', 'sh', 'bat', 'js', 'html', 'htm'];
        if (in_array($ext, $forbidden)) {
            throw new Exception('امتداد الملف غير مسموح');
        }

        $fileName = uniqid() . '_' . time() . '.' . $ext;
        $fileName = preg_replace('/[^a-zA-Z0-9_.-]/', '', $fileName);
        $targetPath = $this->uploadDir . $fileName;

        if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
            throw new Exception('فشل رفع الملف');
        }

        return [
            'path' => '/uploads/' . $fileName,
            'name' => $fileName,
            'size' => $file['size'],
            'type' => $file['type']
        ];
    }

    public function delete($fileName) {
        $filePath = $this->uploadDir . basename($fileName);
        if (file_exists($filePath)) {
            unlink($filePath);
            return true;
        }
        return false;
    }
}
