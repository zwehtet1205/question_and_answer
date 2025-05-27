<?php 

require_once 'helpers.php';

startSession();
sendJsonResponse(['is_authenticated' => isAuthenticated(), "redirect_url" => isAuthenticated() ? getBaseUrl().'dashboard.html' : getBaseUrl().'index.html']);

exit;

