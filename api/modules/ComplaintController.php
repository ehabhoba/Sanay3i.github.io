<?php
class ComplaintController {
    private $db;
    
    public function __construct() {
        $this->db = (new Database())->connect();
    }

    public function handle($method, $id = null) {
        switch ($method) {
            case 'POST':
                $this->fileComplaint();
                break;
            case 'GET':
                $this->getComplaints();
                break;
        }
    }

    private function fileComplaint() {
        $data = json_decode(file_get_contents('php://input'), true);
        
        // التحقق من عدد الشكاوى خلال الشهر
        $stmt = $this->db->prepare("
            SELECT COUNT(*) as complaint_count 
            FROM complaints 
            WHERE reported_user_id = ? 
            AND created_at >= DATE_SUB(NOW(), INTERVAL 1 MONTH)
        ");
        $stmt->execute([$data['reported_user_id']]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);

        if ($result['complaint_count'] >= 3) {
            // حظر المستخدم تلقائياً
            $this->banUser($data['reported_user_id'], 'تجاوز الحد المسموح من الشكاوى');
            Response::json(['message' => 'تم حظر المستخدم تلقائياً لتجاوز عدد الشكاوى المسموح']);
            return;
        }

        // تسجيل الشكوى
        $stmt = $this->db->prepare("
            INSERT INTO complaints (user_id, reported_user_id, order_id, complaint_text)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([
            $data['user_id'],
            $data['reported_user_id'],
            $data['order_id'],
            $data['complaint_text']
        ]);

        Response::json(['success' => true]);
    }

    private function banUser($userId, $reason) {
        $stmt = $this->db->prepare("
            INSERT INTO user_bans (user_id, reason, is_permanent, admin_id)
            VALUES (?, ?, true, 1)
        ");
        $stmt->execute([$userId, $reason]);
    }
}
