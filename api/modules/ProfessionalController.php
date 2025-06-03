<?php
require_once '../config/db.php';
require_once 'Response.php';

class ProfessionalController {
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
        $stmt = $this->db->prepare("
            SELECT p.*, 
                pl.latitude, pl.longitude, pl.address, pl.is_available, 
                GROUP_CONCAT(ps.skill_name) as skills
            FROM professionals p
            LEFT JOIN (
                SELECT t1.* FROM professional_locations t1
                INNER JOIN (
                    SELECT professional_id, MAX(last_updated) as max_updated
                    FROM professional_locations
                    GROUP BY professional_id
                ) t2 ON t1.professional_id = t2.professional_id AND t1.last_updated = t2.max_updated
            ) pl ON pl.professional_id = p.id
            LEFT JOIN professional_skills ps ON ps.professional_id = p.id
            GROUP BY p.id
        ");
        $stmt->execute();
        Response::json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function show($id) {
        $stmt = $this->db->prepare("
            SELECT p.*, 
                pl.latitude, pl.longitude, pl.address, pl.is_available, 
                GROUP_CONCAT(ps.skill_name) as skills
            FROM professionals p
            LEFT JOIN professional_locations pl ON pl.professional_id = p.id
            LEFT JOIN professional_skills ps ON ps.professional_id = p.id
            WHERE p.id = ?
            GROUP BY p.id
        ");
        $stmt->execute([$id]);
        $pro = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($pro) Response::json($pro);
        else Response::json(['error' => 'Professional not found'], 404);
    }

    private function store() {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->db->prepare("INSERT INTO professionals (user_id, service_type, description, location, membership_type, is_verified) VALUES (?, ?, ?, ?, ?, ?)");
        $membership = isset($data['membership_type']) ? $data['membership_type'] : 'free';
        $is_verified = isset($data['is_verified']) ? $data['is_verified'] : 0;
        $stmt->execute([
            $data['user_id'],
            $data['service_type'],
            $data['description'],
            $data['location'],
            $membership,
            $is_verified
        ]);
        $proId = $this->db->lastInsertId();
        if (isset($data['latitude']) && isset($data['longitude'])) {
            $locStmt = $this->db->prepare("INSERT INTO professional_locations (professional_id, latitude, longitude, address) VALUES (?, ?, ?, ?)");
            $locStmt->execute([$proId, $data['latitude'], $data['longitude'], $data['location']]);
        }
        if (isset($data['skills']) && is_array($data['skills'])) {
            foreach ($data['skills'] as $skill) {
                $skillStmt = $this->db->prepare("INSERT INTO professional_skills (professional_id, skill_name) VALUES (?, ?)");
                $skillStmt->execute([$proId, $skill]);
            }
        }
        Response::json(['success' => true, 'id' => $proId]);
    }

    private function update($id) {
        $data = json_decode(file_get_contents('php://input'), true);
        $stmt = $this->db->prepare("UPDATE professionals SET service_type = ?, description = ?, location = ?, rating = ?, profile_image = ?, is_verified = ?, membership_type = ?, verified_enabled = ?, membership_expiry = ? WHERE id = ?");
        $stmt->execute([
            $data['service_type'],
            $data['description'],
            $data['location'],
            $data['rating'],
            $data['profile_image'],
            $data['is_verified'],
            $data['membership_type'],
            isset($data['verified_enabled']) ? $data['verified_enabled'] : 1,
            isset($data['membership_expiry']) ? $data['membership_expiry'] : null,
            $id
        ]);
        if (isset($data['latitude']) && isset($data['longitude'])) {
            $locStmt = $this->db->prepare("INSERT INTO professional_locations (professional_id, latitude, longitude, address) VALUES (?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE latitude=VALUES(latitude), longitude=VALUES(longitude), address=VALUES(address)");
            $locStmt->execute([$id, $data['latitude'], $data['longitude'], $data['location']]);
        }
        if (isset($data['skills']) && is_array($data['skills'])) {
            $delStmt = $this->db->prepare("DELETE FROM professional_skills WHERE professional_id = ?");
            $delStmt->execute([$id]);
            foreach ($data['skills'] as $skill) {
                $skillStmt = $this->db->prepare("INSERT INTO professional_skills (professional_id, skill_name) VALUES (?, ?)");
                $skillStmt->execute([$id, $skill]);
            }
        }
        Response::json(['success' => true]);
    }

    private function destroy($id) {
        $stmt = $this->db->prepare("DELETE FROM professionals WHERE id = ?");
        $stmt->execute([$id]);
        $delLoc = $this->db->prepare("DELETE FROM professional_locations WHERE professional_id = ?");
        $delLoc->execute([$id]);
        $delSkills = $this->db->prepare("DELETE FROM professional_skills WHERE professional_id = ?");
        $delSkills->execute([$id]);
        Response::json(['success' => true]);
    }
}
