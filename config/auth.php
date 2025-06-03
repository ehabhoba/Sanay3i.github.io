<?php
class Auth {
    private $db;
    
    public function __construct($db) {
        $this->db = $db;
    }
    
    public function login($email, $password) {
        $stmt = $this->db->prepare("SELECT * FROM users WHERE email = ?");
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        
        if ($user && password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            return $user;
        }
        return false;
    }
    
    public function register($data) {
        $stmt = $this->db->prepare(
            "INSERT INTO users (name, email, password, phone, type) 
             VALUES (?, ?, ?, ?, ?)"
        );
        
        $hashedPassword = password_hash($data['password'], PASSWORD_DEFAULT);
        
        return $stmt->execute([
            $data['name'],
            $data['email'],
            $hashedPassword,
            $data['phone'],
            $data['type']
        ]);
    }
    
    public function isLoggedIn() {
        return isset($_SESSION['user_id']);
    }
}
