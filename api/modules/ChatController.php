<?php
require_once '../config/db.php';
require_once 'Response.php';

class ChatController {
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
            default:
                Response::json(['error' => 'Method Not Allowed'], 405);
        }
    }

    private function index() {
        $user1 = $_GET['user1'] ?? null;
        $user2 = $_GET['user2'] ?? null;
        if (!$user1 || !$user2) Response::json([]);
        $stmt = $this->db->prepare("SELECT * FROM chat_messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY created_at ASC LIMIT 200");
        $stmt->execute([$user1, $user2, $user2, $user1]);
        Response::json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function store() {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->db->prepare("INSERT INTO chat_messages (sender_id, receiver_id, message) VALUES (?, ?, ?)");
        $stmt->execute([$data['sender_id'], $data['receiver_id'], $data['message']]);
        Response::json(['success' => true]);
    }
}
