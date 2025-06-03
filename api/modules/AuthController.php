<?php
require_once '../config/db.php';
require_once 'Response.php';

class AuthController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->connect();
    }

    public function handle($method) {
        if ($method === 'POST') {
            $data = json_decode(file_get_contents('php://input'), true);
            $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ? LIMIT 1");
            $stmt->execute([$data['email']]);
            $user = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($user && password_verify($data['password'], $user['password'])) {
                unset($user['password']);
                // لا ترجع أي بيانات حساسة أخرى
                Response::json(['success' => true, 'user' => $user, 'type' => $user['type']]);
            } else {
                Response::json(['error' => 'Invalid credentials'], 401);
            }
        } else {
            Response::json(['error' => 'Method Not Allowed'], 405);
        }
    }
}
