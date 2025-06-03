<?php
require_once '../config/db.php';
require_once 'Response.php';

class ServiceController {
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
            default:
                Response::json(['error' => 'Method Not Allowed'], 405);
        }
    }

    private function index() {
        $stmt = $this->db->prepare("SELECT * FROM services");
        $stmt->execute();
        Response::json($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    private function show($id) {
        $stmt = $this->db->prepare("SELECT * FROM services WHERE id = ?");
        $stmt->execute([$id]);
        $service = $stmt->fetch(PDO::FETCH_ASSOC);
        if ($service) Response::json($service);
        else Response::json(['error' => 'Service not found'], 404);
    }
}
