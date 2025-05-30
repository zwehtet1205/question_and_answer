<?php 

// include helpers 
require_once 'helpers.php';

// start session 
startSession();

// send json response 
sendJsonResponse(['is_authenticated' => isAuthenticated(), "redirect_url" => isAuthenticated() ? getBaseUrl().'dashboard.html' : getBaseUrl().'index.html']);

exit;

