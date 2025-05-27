<?php

function sendJsonResponse($data) {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode($data);
    exit;
}

function sendErrorResponse($statusCode, $errorData) {
    http_response_code($statusCode);
    sendJsonResponse($errorData);
}

function sanitizeInput($data) {
    return htmlspecialchars(strip_tags(trim($data)));
}

function isValidJson($json) {
    json_decode($json);
    return (json_last_error() === JSON_ERROR_NONE);
}

function readJsonFile($filePath) {
    if (!is_file($filePath)) {
        sendErrorResponse(404, ['error' => 'File not found']);
    }

    $jsonContent = @file_get_contents($filePath);
    if ($jsonContent === false) {
        sendErrorResponse(500, ['error' => 'Failed to read file']);
    }

    if (!isValidJson($jsonContent)) {
        sendErrorResponse(500, ['error' => 'Invalid JSON format']);
    }

    return json_decode($jsonContent, true);
}

function writeJsonFile($filePath, $data) {
    $jsonContent = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if ($jsonContent === false) {
        sendErrorResponse(500, ['error' => 'Failed to encode data to JSON']);
    }

    if (file_put_contents($filePath, $jsonContent) === false) {
        sendErrorResponse(500, ['error' => 'Failed to write to file']);
    }
}

function validateUserInput($input, $rules) {
    $errors = [];
    foreach ($rules as $field => $rule) {
        if (isset($input[$field])) {
            $value = sanitizeInput($input[$field]);
            if ($rule === 'required' && empty($value)) {
                $errors[$field] = "$field is required.";
            }
            // Add more validation rules as needed
        } else {
            $errors[$field] = "$field is missing.";
        }
    }
    return $errors;
}

function redirectTo($url) {
    header("Location: $url");
    exit;
}

function getBaseUrl() {
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off') ? "https://" : "http://";
    $host = $_SERVER['HTTP_HOST'];
    $scriptDir = dirname(dirname($_SERVER['SCRIPT_NAME']));
    return rtrim($protocol . $host . $scriptDir, '/') . '/';
}


function checkRequestMethod($method) {
    if ($_SERVER['REQUEST_METHOD'] !== strtoupper($method)) {
        sendErrorResponse(405, ['error' => 'Method Not Allowed']);
    }
}

function isRequestMethod($method) {
    return $_SERVER['REQUEST_METHOD'] === strtoupper($method);
}

function startSession() {
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
}

function isAuthenticated() {
    return isset($_SESSION['user_name']) && isset($_SESSION['user_type']);
}

function destroySession() {
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_unset();
        session_destroy();
    }
}

function setSessionVariable($key, $value) {
    $_SESSION[$key] = $value;
}

function getSessionVariable($key) {
    return isset($_SESSION[$key]) ? $_SESSION[$key] : null;
}

function checkSessionVariable($key) {
    return isset($_SESSION[$key]);
}

function clearSessionVariable($key) {
    if (isset($_SESSION[$key])) {
        unset($_SESSION[$key]);
    }
}

function setMessage($key, $message) {
    if(!checkSessionVariable($key)) {
        setSessionVariable($key, $message);
    } 
}

function getMessage($key) {
    $message = getSessionVariable($key);
    clearSessionVariable($key);
    return $message;
}

function hasMessage($key) {
    return checkSessionVariable($key);
}

