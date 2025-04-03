<?php
session_start();
if ($_SESSION['role'] !== 'student') {
    header('Location: ../index.html');
    exit;
}

$module = $_GET['module'] ?? '';
$questions = json_decode(file_get_contents('../data/questions.json'), true) ?: [];
$answers = json_decode(file_get_contents('../data/answers.json'), true) ?: [];
$answered_ids = array_column($answers, 'question_id');
$answered = array_filter($questions, fn($q) => $q['module'] === $module && in_array($q['id'], $answered_ids));

// Attach answers to questions
$results = [];
foreach ($answered as $q) {
    $q_answers = array_filter($answers, fn($a) => $a['question_id'] == $q['id']);
    $results[] = ['question' => $q, 'answers' => array_values($q_answers)];
}

header('Content-Type: application/json');
echo json_encode($results);
?>