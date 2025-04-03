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
$unanswered = array_filter($questions, fn($q) => $q['module'] === $module && !in_array($q['id'], $answered_ids));
usort($unanswered, fn($a, $b) => $b['priority'] <=> $a['priority']);

header('Content-Type: application/json');
echo json_encode($unanswered);
?>