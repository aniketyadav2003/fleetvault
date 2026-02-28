<?php
require_once __DIR__ . '/../includes/auth_functions.php';

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $action = $_POST['action'] ?? '';

    if ($action === 'login') {
        $username_email = $_POST['username_email'] ?? '';
        $password = $_POST['password'] ?? '';

        $response = login($username_email, $password);
        echo json_encode($response);
        exit();
    }

    if ($action === 'signup') {
        $username = trim($_POST['username'] ?? '');
        $email = trim($_POST['email'] ?? '');
        $password = $_POST['password'] ?? '';

        // Simple server-side validation
        if (empty($username) || empty($email) || strlen($password) < 6) {
            echo json_encode(["status" => "error", "message" => "Please provide all details. Password must be at least 6 characters."]);
            exit();
        }

        $response = signup($username, $email, $password);
        echo json_encode($response);
        exit();
    }
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request method."]);
}
?>