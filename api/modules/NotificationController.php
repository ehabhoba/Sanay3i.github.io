<?php
require_once '../config/db.php';
require_once 'Response.php';

class NotificationController {
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
                if (isset($_GET['mark-all-read'])) $this->markAllRead();
                else $this->store();
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
        $where = [];
        $params = [];
        if (isset($_GET['user_id'])) {
            $where[] = 'user_id = ?';
            $params[] = $_GET['user_id'];
        }
        $sql = "SELECT * FROM notifications";
        if ($where) $sql .= " WHERE " . implode(' AND ', $where);
        $sql .= " ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        Response::json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function show($id) {
        $stmt = $this->db->prepare("SELECT * FROM notifications WHERE id = ?");
        $stmt->execute([$id]);
        $notif = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($notif) Response::json($notif);
        else Response::json(['error' => 'Notification not found'], 404);
    }

    private function store() {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->db->prepare("INSERT INTO notifications (user_id, message, type) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['user_id'],
            $data['message'],
            $data['type'] ?? null
        ]);
        Response::json(['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    private function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->db->prepare("UPDATE notifications SET is_read = ? WHERE id = ?");
        $stmt->execute([
            isset($data['is_read']) ? $data['is_read'] : 1,
            $id
        ]);
        Response::json(['success' => true]);
    }

    public function markAllRead() {
        $data = json_decode(file_get_contents('php://input'), true);
        $user_id = $data['user_id'];
        $stmt = $this->db->prepare("UPDATE notifications SET is_read = 1 WHERE user_id = ?");
        $stmt->execute([$user_id]);
        Response::json(['success' => true]);
    }

    private function destroy($id) {
        $stmt = $this->db->prepare("DELETE FROM notifications WHERE id = ?");
        $stmt->execute([$id]);
        Response::json(['success' => true]);
    }
}
