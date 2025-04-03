<?php
session_start();
if ($_SESSION['role'] !== 'staff') {
    header('Location: ../index.html');
    exit;
}

$module = $_GET['module'] ?? '';
$questions = json_decode(file_get_contents('../data/questions.json'), true) ?: [];
$filtered_questions = array_filter($questions, fn($q) => $q['module'] === $module);
usort($filtered_questions, fn($a, $b) => $b['priority'] <=> $a['priority']);

header('Content-Type: application/json');
echo json_encode($filtered_questions);
?>