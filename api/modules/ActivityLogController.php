<?php
require_once '../config/db.php';
require_once 'Response.php';

class ActivityLogController {
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
        $where = [];
        $params = [];
        if (isset($_GET['user_id'])) {
            $where[] = 'user_id = ?';
            $params[] = $_GET['user_id'];
        }
        $sql = "SELECT * FROM activity_logs";
        if ($where) $sql .= " WHERE " . implode(' AND ', $where);
        $sql .= " ORDER BY created_at DESC LIMIT 200";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        Response::json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function store() {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->db->prepare("INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['user_id'] ?? null,
            $data['action'] ?? '',
            $data['details'] ?? ''
        ]);
        Response::json(['success' => true]);
    }
}
