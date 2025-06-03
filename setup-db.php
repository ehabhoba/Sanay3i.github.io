<?php
require_once 'config/db.php';

function importSQL($filename) {
    $db = (new Database())->connect();
    
    if (!$db) {
        die("Database connection failed\n");
    }

    echo "Importing $filename...\n";
    $sql = file_get_contents($filename);
    
    try {
        $db->exec($sql);
        echo "Successfully imported $filename\n";
    } catch (PDOException $e) {
        echo "Error importing $filename: " . $e->getMessage() . "\n";
    }
}

// Import files in order
importSQL(__DIR__ . '/database/schema.sql');
importSQL(__DIR__ . '/database/init.sql');
importSQL(__DIR__ . '/database/migrations.sql');
importSQL(__DIR__ . '/database/updates.sql');

echo "Database setup complete!\n";
