<?php
require_once '../config/db.php';
require_once 'Response.php';

class SupportTicketController {
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
        $where = [];
        $params = [];
        if (isset($_GET['user_id'])) {
            $where[] = 'user_id = ?';
            $params[] = $_GET['user_id'];
        }
        $sql = "SELECT * FROM support_tickets";
        if ($where) $sql .= " WHERE " . implode(' AND ', $where);
        $sql .= " ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        Response::json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function show($id) {
        $stmt = $this->db->prepare("SELECT * FROM support_tickets WHERE id = ?");
        $stmt->execute([$id]);
        $ticket = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($ticket) Response::json($ticket);
        else Response::json(['error' => 'Ticket not found'], 404);
    }

    private function store() {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->db->prepare("INSERT INTO support_tickets (user_id, subject, message) VALUES (?, ?, ?)");
        $stmt->execute([
            $data['user_id'],
            $data['subject'],
            $data['message']
        ]);
        Response::json(['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    private function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $fields = [];
        $params = [];
        foreach (['status', 'admin_reply'] as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        if ($fields) {
            $params[] = $id;
            $sql = "UPDATE support_tickets SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
        }
        Response::json(['success' => true]);
    }

    private function destroy($id) {
        $stmt = $this->db->prepare("DELETE FROM support_tickets WHERE id = ?");
        $stmt->execute([$id]);
        Response::json(['success' => true]);
    }
}
