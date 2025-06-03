<?php
return [
    'db' => [
        'host' => 'localhost',
        'dbname' => 'sanai3y_db',
        'username' => 'sanai3y_user', 
        'password' => 'sanai3y_password_2024', // Changed password
        'charset' => 'utf8mb4'
    ],
    'app' => [
        'url' => 'http://localhost:8000',
        'debug' => true,
        'timezone' => 'Africa/Cairo',
        'socket_url' => 'ws://localhost:3000'
    ],
    'security' => [
        'jwt_secret' => 'your_secret_key',
        'jwt_expiry' => 86400, // 24 hours
        'rate_limit' => 100 // requests per hour
    ]
];
