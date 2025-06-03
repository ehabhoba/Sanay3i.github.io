<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

require_once '../config/db.php';
require_once 'modules/Response.php';

// Add rate limiting
function checkRateLimit($ip, $endpoint, $limit = 100) {
    global $db;
    $db->query("DELETE FROM rate_limits WHERE window_start < DATE_SUB(NOW(), INTERVAL 1 HOUR)");
    
    $stmt = $db->prepare("INSERT INTO rate_limits (ip_address, endpoint) VALUES (?, ?)
                         ON DUPLICATE KEY UPDATE requests = requests + 1");
    $stmt->execute([$ip, $endpoint]);
    
    $stmt = $db->prepare("SELECT requests FROM rate_limits WHERE ip_address = ? AND endpoint = ?");
    $stmt->execute([$ip, $endpoint]);
    $requests = $stmt->fetchColumn();
    
    return $requests <= $limit;
}

// Add request validation
function validateRequest() {
    if (!checkRateLimit($_SERVER['REMOTE_ADDR'], $_SERVER['REQUEST_URI'])) {
        Response::json(['error' => 'Rate limit exceeded'], 429);
        exit;
    }
}

// Add before any route handling
validateRequest();

// Dynamic routing
$method = $_SERVER['REQUEST_METHOD'];
$path = isset($_GET['route']) ? $_GET['route'] : '';
$segments = explode('/', trim($path, '/'));

$resource = $segments[0] ?? '';
$id = $segments[1] ?? null;

switch ($resource) {
    case 'users':
        require_once 'modules/UserController.php';
        $controller = new UserController();
        $controller->handle($method, $id);
        break;
    case 'professionals':
        require_once 'modules/ProfessionalController.php';
        $controller = new ProfessionalController();
        $controller->handle($method, $id);
        break;
    case 'orders':
        require_once 'modules/OrderController.php';
        $controller = new OrderController();
        if (isset($segments[2]) && $segments[2] === 'status') {
            $controller->updateStatus($id);
        } else {
            $controller->handle($method, $id);
        }
        break;
    case 'services':
        require_once 'modules/ServiceController.php';
        $controller = new ServiceController();
        $controller->handle($method, $id);
        break;
    case 'auth':
        require_once 'modules/AuthController.php';
        $controller = new AuthController();
        $controller->handle($method);
        break;
    case 'professional-locations':
        require_once 'modules/ProfessionalLocationController.php';
        $controller = new ProfessionalLocationController();
        $controller->handle($method, $id);
        break;
    case 'professional-skills':
        require_once 'modules/ProfessionalSkillController.php';
        $controller = new ProfessionalSkillController();
        $controller->handle($method, $id);
        break;
    case 'user-preferences':
        require_once 'modules/UserPreferenceController.php';
        $controller = new UserPreferenceController();
        $controller->handle($method, $id);
        break;
    case 'notifications':
        require_once 'modules/NotificationController.php';
        $controller = new NotificationController();
        $controller->handle($method, $id);
        break;
    case 'support-tickets':
        require_once 'modules/SupportTicketController.php';
        $controller = new SupportTicketController();
        $controller->handle($method, $id);
        break;
    case 'chat':
        require_once 'modules/ChatController.php';
        $controller = new ChatController();
        $controller->handle($method, $id);
        break;
    case 'activity-logs':
        require_once 'modules/ActivityLogController.php';
        $controller = new ActivityLogController();
        $controller->handle($method, $id);
        break;
    default:
        Response::json(['error' => 'Not Found'], 404);
}
