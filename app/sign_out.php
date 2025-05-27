<?php
    require_once 'helpers.php';
    startSession();
    // Clear session variables
    destroySession();
    // Redirect to login page
    redirectTo('../index.html');
    exit;
?>