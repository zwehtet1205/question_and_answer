<?php

require_once 'helpers.php';

const JSON_FILE_PATH = '../data/module_data.json';

$modules = readJsonFile(JSON_FILE_PATH);

sendJsonResponse($modules);