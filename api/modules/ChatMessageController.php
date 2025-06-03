<?php
require_once '../config/db.php';
require_once 'Response.php';

class ChatMessageController {
    private $db;
    public function __construct() {
        $this->db = (new Database())->connect();
    }

    public function handle($method, $id = null) {
        switch ($method) {
            case 'GET':
                $this->index();
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
        $where = [];
        $params = [];
        if (isset($_GET['sender_id'])) {
            $where[] = 'sender_id = ?';
            $params[] = $_GET['sender_id'];
        }
        if (isset($_GET['receiver_id'])) {
            $where[] = 'receiver_id = ?';
            $params[] = $_GET['receiver_id'];
        }
        $sql = "SELECT * FROM chat_messages";
        if ($where) $sql .= " WHERE " . implode(' AND ', $where);
        $sql .= " ORDER BY created_at ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        Response::json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function store() {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->db->prepare("INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['sender_id'],
            $data['receiver_id'],
            $data['message']
        ]);
        Response::json(['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    private function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->db->prepare("UPDATE chat_messages SET is_read = ? WHERE id = ?");
        $stmt->execute([
            isset($data['is_read']) ? $data['is_read'] : 1,
            $id
        ]);
        Response::json(['success' => true]);
    }

    private function destroy($id) {
        $stmt = $this->db->prepare("DELETE FROM chat_messages WHERE id = ?");
        $stmt->execute([$id]);
        Response::json(['success' => true]);
    }
}
