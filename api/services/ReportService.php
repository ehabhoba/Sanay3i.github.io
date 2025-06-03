<?php
class ReportService {
    private $db;

    public function __construct() {
        $this->db = (new Database())->connect();
    }

    public function getProfessionalStats($proId) {
        $stmt = $this->db->prepare("
            SELECT 
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_orders,
                COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
                AVG(CASE WHEN status = 'completed' THEN response_time END) as avg_response_time,
                AVG(rating) as average_rating
            FROM orders 
            WHERE professional_id = ?
        ");
        $stmt->execute([$proId]);
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function getMonthlyRevenue($proId) {
        $stmt = $this->db->prepare("
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as total_orders,
                SUM(amount) as revenue
            FROM payments
            WHERE professional_id = ?
            GROUP BY month
            ORDER BY month DESC
            LIMIT 12
        ");
        $stmt->execute([$proId]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
}
