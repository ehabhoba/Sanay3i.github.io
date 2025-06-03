<?php
require_once '../config/db.php';
require_once 'Response.php';

class UserController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->connect();
    }

    public function handle($method, $id = null) {
        switch ($method) {
            case 'GET':
                if ($id) $this->show($id);
                else $this->index();
                break;
            case 'POST':
                $this->store();
                break;
            case 'PUT':
                if ($id) $this->update($id);
                break;
            case 'DELETE':
                if ($id) $this->destroy($id);
                break;
            default:
                Response::json(['error' => 'Method Not Allowed'], 405);
        }
    }

    private function index() {
        $stmt = $this->db->prepare("SELECT id, name, email, phone, type, membership_type, ai_usage_count, ai_enabled, membership_expiry, created_at FROM users");
        $stmt->execute();
        $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
        // لا ترجع كلمة المرور أو أي بيانات حساسة
        Response::json($users);
    }

    private function show($id) {
        $stmt = $this->db->prepare("SELECT id, name, email, phone, type, membership_type, ai_usage_count, ai_enabled, membership_expiry FROM users WHERE id = ?");
        $stmt->execute([$id]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($user) Response::json($user);
        else Response::json(['error' => 'User not found'], 404);
    }

    private function store() {
        $data = json_decode(file_get_contents('php://input'), true);
        if (!$data['name'] || !$data['email'] || !$data['password'] || !$data['type']) {
            Response::json(['error' => 'Missing fields'], 400);
        }
        $stmt = $this->db->prepare("SELECT id FROM users WHERE email = ?");
        $stmt->execute([$data['email']]);
        if ($stmt->fetch()) {
            Response::json(['error' => 'Email already exists'], 409);
        }
        $hashed = password_hash($data['password'], PASSWORD_DEFAULT);
        $phone = isset($data['phone']) ? $data['phone'] : null;
        $membership = isset($data['membership_type']) ? $data['membership_type'] : 'free';
        $stmt = $this->db->prepare("INSERT INTO users (name, email, password, phone, type, membership_type) VALUES (?, ?, ?, ?, ?, ?)");
        $stmt->execute([$data['name'], $data['email'], $hashed, $phone, $data['type'], $membership]);
        Response::json(['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    private function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->db->prepare("UPDATE users SET name = ?, email = ?, phone = ?, type = ?, membership_type = ?, ai_usage_count = ?, ai_enabled = ?, membership_expiry = ? WHERE id = ?");
        $stmt->execute([
            $data['name'],
            $data['email'],
            $data['phone'],
            $data['type'],
            $data['membership_type'],
            $data['ai_usage_count'],
            isset($data['ai_enabled']) ? $data['ai_enabled'] : 1,
            isset($data['membership_expiry']) ? $data['membership_expiry'] : null,
            $id
        ]);
        // تحديث التفضيلات إذا وجدت
        if (isset($data['preferences'])) {
            $prefs = json_encode($data['preferences']);
            $prefStmt = $this->db->prepare("INSERT INTO user_preferences (user_id, preferred_services, preferred_locations, price_range, availability_preferences)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE preferred_services=VALUES(preferred_services), preferred_locations=VALUES(preferred_locations), price_range=VALUES(price_range), availability_preferences=VALUES(availability_preferences)");
            $prefStmt->execute([
                $id,
                isset($data['preferences']['services']) ? json_encode($data['preferences']['services']) : null,
                isset($data['preferences']['locations']) ? json_encode($data['preferences']['locations']) : null,
                isset($data['preferences']['price_range']) ? $data['preferences']['price_range'] : null,
                isset($data['preferences']['availability']) ? json_encode($data['preferences']['availability']) : null
            ]);
        }
        Response::json(['success' => true]);
    }

    private function destroy($id) {
        $stmt = $this->db->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        Response::json(['success' => true]);
    }
}
?>
