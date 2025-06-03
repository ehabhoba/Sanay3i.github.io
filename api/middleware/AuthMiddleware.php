<?php
class AuthMiddleware {
    public static function authenticate() {
        $headers = getallheaders();
        $token = isset($headers['Authorization']) ? str_replace('Bearer ', '', $headers['Authorization']) : null;
        
        if (!$token) {
            http_response_code(401);
            echo json_encode(['error' => 'Unauthorized']);
            exit;
        }

        try {
            // تحقق من صحة التوكن (يمكنك استخدام JWT أو أي طريقة أخرى)
            $user = self::validateToken($token);
            return $user;
        } catch (Exception $e) {
            http_response_code(401);
            echo json_encode(['error' => $e->getMessage()]);
            exit;
        }
    }

    public static function checkRole($allowedRoles) {
        $user = self::authenticate();
        if (!in_array($user->type, $allowedRoles)) {
            http_response_code(403);
            echo json_encode(['error' => 'Forbidden']);
            exit;
        }
        return $user;
    }

    private static function validateToken($token) {
        // قم بتنفيذ منطق التحقق من صحة التوكن هنا
        // مثال بسيط: افحص إذا كان التوكن موجود في قاعدة البيانات
        $db = (new Database())->connect();
        $stmt = $db->prepare("SELECT * FROM users WHERE auth_token = ?");
        $stmt->execute([$token]);
        $user = $stmt->fetch(PDO::FETCH_OBJ);
        
        if (!$user) {
            throw new Exception('Invalid token');
        }
        
        return $user;
    }
}
