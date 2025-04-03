<?php
session_start();
if ($_SERVER['REQUEST_METHOD'] !== 'POST' || $_SESSION['role'] !== 'student') {
    header('Location: ../index.html');
    exit;
}

$question_id = (int)$_POST['question_id'];

// Update questions.json
$questions = json_decode(file_get_contents('../data/questions.json'), true);
foreach ($questions as &$q) {
    if ($q['id'] === $question_id) {
        $q['priority']++;
        break;
    }
}
file_put_contents('../data/questions.json', json_encode($questions, JSON_PRETTY_PRINT));

header('Location: ../view_unanswered.html?success=voted');
exit;
?>