<?php

// include helpers 
require_once 'helpers.php';

// start session 
startSession();

// get and clean input
$module = isset($_GET['module']) ? sanitizeInput($_GET['module']) : '';
$status = isset($_GET['status']) ? sanitizeInput($_GET['status']) : '';

// get data 
$questions = readJsonFile('../data/questions.json');
$answers = readJsonFile('../data/answers.json');

// get answered question IDs
$answeredIds = array_column($answers, 'question_id');

// filter questions
$filtered = array_filter($questions, function ($q) use ($module, $status, $answeredIds) {
    
    // filter with module 
    $matchModule = $module ? $q['module'] === $module : true;

    // filter with status 
    $matchStatus = true;
    if ($status === 'answered') {
        $matchStatus = in_array($q['id'], $answeredIds);
    } elseif ($status === 'unanswered') {
        $matchStatus = !in_array($q['id'], $answeredIds);
    }

    return $matchModule && $matchStatus;
});


foreach ($filtered as &$q) {
    // count votes 
    $q['votes'] = getVotes($q['id']);

    // check if answered or not
    $q['answered'] = in_array($q['id'], $answeredIds);
}
unset($q);

// sort questions by votes
usort($filtered, function ($a, $b) {
    return $b['votes'] <=> $a['votes'];
});

// get total questions 
$total_questions = count($filtered);

// get total answered questions 
$total_answered_questions = count(array_filter($filtered, function($q) use($answeredIds){
    return in_array($q['id'],$answeredIds);
}));

// get total unanswered questions 
$total_unanswered_questions = $total_questions - $total_answered_questions;

// send json response 
sendJsonResponse([
    'questions' => $filtered,
    'total_questions' => $total_questions,
    'total_answered_questions' => $total_answered_questions,
    'total_unanswered_questions' => $total_unanswered_questions
]);
