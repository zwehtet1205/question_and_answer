<?php
// Path to the module.json file
$moduleFilePath = '../data/modules.json';

// Check if the file exists
if (!file_exists($moduleFilePath)) {
    http_response_code(404);
    echo json_encode(['error' => 'module.json file not found']);
    exit;
}

// Read the contents of the module.json file
$moduleData = file_get_contents($moduleFilePath);

// Decode the JSON data
$modules = json_decode($moduleData, true);

// Check if the JSON is valid
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid JSON in module.json']);
    exit;
}

// Return the modules as a JSON response
header('Content-Type: application/json');
echo json_encode($modules);