<?php
require_once '../config/db.php';
require_once 'Response.php';

class OrderController {
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
        // دعم الفلاتر: client_id, professional_id
        $where = [];
        $params = [];
        if (isset($_GET['client_id'])) {
            $where[] = 'client_id = ?';
            $params[] = $_GET['client_id'];
        }
        if (isset($_GET['professional_id'])) {
            $where[] = 'professional_id = ?';
            $params[] = $_GET['professional_id'];
        }
        $sql = "SELECT * FROM orders";
        if ($where) $sql .= " WHERE " . implode(' AND ', $where);
        $sql .= " ORDER BY created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        Response::json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function show($id) {
        $stmt = $this->db->prepare("SELECT * FROM orders WHERE id = ?");
        $stmt->execute([$id]);
        $order = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($order) Response::json($order);
        else Response::json(['error' => 'Order not found'], 404);
    }

    private function store() {
        $data = json_decode(file_get_contents('php://input'), true);
        // الحقول المطلوبة: client_id, professional_id, professional_name, service_name, description, address, phone
        $stmt = $this->db->prepare("INSERT INTO orders (client_id, professional_id, professional_name, service_name, description, address, phone, status, status_ar) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $status = isset($data['status']) ? $data['status'] : 'pending';
        $status_ar = [
            'pending' => 'قيد الانتظار',
            'accepted' => 'تم القبول',
            'on-the-way' => 'في الطريق',
            'completed' => 'مكتمل',
            'cancelled' => 'ملغي'
        ][$status] ?? $status;
        $stmt->execute([
            $data['client_id'] ?? null,
            $data['professional_id'] ?? null,
            $data['professional_name'] ?? '',
            $data['service_name'] ?? '',
            $data['description'] ?? '',
            $data['address'] ?? '',
            $data['phone'] ?? '',
            $status,
            $status_ar
        ]);
        Response::json(['success' => true, 'id' => $this->db->lastInsertId()]);
    }

    private function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        // تحديث الحقول المسموحة فقط
        $fields = [];
        $params = [];
        foreach (['status', 'status_ar', 'professional_id', 'professional_name', 'service_name', 'description', 'address', 'phone'] as $field) {
            if (isset($data[$field])) {
                $fields[] = "$field = ?";
                $params[] = $data[$field];
            }
        }
        if ($fields) {
            $params[] = $id;
            $sql = "UPDATE orders SET " . implode(', ', $fields) . " WHERE id = ?";
            $stmt = $this->db->prepare($sql);
            $stmt->execute($params);
        }
        Response::json(['success' => true]);
    }

    public function updateStatus($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $status = $data['status'] ?? null;
        $status_ar = [
            'pending' => 'قيد الانتظار',
            'accepted' => 'تم القبول',
            'on-the-way' => 'في الطريق',
            'completed' => 'مكتمل',
            'cancelled' => 'ملغي'
        ][$status] ?? $status;
        $stmt = $this->db->prepare("UPDATE orders SET status = ?, status_ar = ? WHERE id = ?");
        $stmt->execute([$status, $status_ar, $id]);
        Response::json(['success' => true]);
    }

    public function confirmOrder($id, $type) {
        $data = json_decode(file_get_contents('php://input'), true);
        $field = $type . '_confirmed';
        
        $stmt = $this->db->prepare("
            INSERT INTO order_confirmations (order_id, {$field})
            VALUES (?, true)
            ON DUPLICATE KEY UPDATE {$field} = true
        ");
        $stmt->execute([$id]);

        // التحقق من تأكيد الطرفين
        $stmt = $this->db->prepare("
            SELECT client_confirmed, professional_confirmed 
            FROM order_confirmations 
            WHERE order_id = ?
        ");
        $stmt->execute([$id]);
        $confirmation = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($confirmation['client_confirmed'] && $confirmation['professional_confirmed']) {
            // تحديث حالة الطلب
            $this->updateStatus($id);
        }

        Response::json(['success' => true]);
    }

    private function destroy($id) {
        $stmt = $this->db->prepare("DELETE FROM orders WHERE id = ?");
        $stmt->execute([$id]);
        Response::json(['success' => true]);
    }
}
