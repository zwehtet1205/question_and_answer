<?php

// include helper 
require_once 'helpers.php';

// get modules from json file 
$modules = readJsonFile('../data/module_data.json');

// send json response
sendJsonResponse($modules);