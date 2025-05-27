<?php

session_start();

require_once 'helpers.php';

$userType = getSessionVariable('user_type');

if (!empty($userType)) {
    sendJsonResponse(['role' => $userType]);
} else {
    sendErrorResponse(403, ['error' => 'User role not available']);
}
