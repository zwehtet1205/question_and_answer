<?php

    // include helpers
    require_once 'helpers.php';

    // start session 
    startSession();
    
    // destroy session 
    destroySession();

    // send json response
    sendJsonResponse([
        'success' => true,
    ])
?>