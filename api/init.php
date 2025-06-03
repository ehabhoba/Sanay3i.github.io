<?php
session_start();
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

include_once '../config/db.php';
include_once '../config/auth.php';

function response($data, $status = 200) {
    http_response_code($status);
    echo json_encode($data);
    exit;
}
