<?php

// include helpers 
require_once 'helpers.php';

// start session 
startSession();

// get user type from session 
$userType = getSessionVariable('user_type');

// check if user type is set 
if (!empty($userType)) {
    sendJsonResponse(['type' => $userType]);
} else {
    sendErrorResponse(403, ['error' => 'User type not available']);
}
