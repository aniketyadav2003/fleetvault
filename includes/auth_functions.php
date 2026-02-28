<?php
session_start();
require_once __DIR__ . '/../config/db.php';

// Signup logic
function signup($username, $email, $password)
{
    global $conn;

    // Check if user exists
    $stmt = $conn->prepare("SELECT id FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $username, $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        return ["status" => "error", "message" => "Username or Email already exists."];
    }

    // Hash password
    $hashed_password = password_hash($password, PASSWORD_BCRYPT);

    // Insert new user
    $stmt = $conn->prepare("INSERT INTO users (username, email, password) VALUES (?, ?, ?)");
    $stmt->bind_param("sss", $username, $email, $hashed_password);

    if ($stmt->execute()) {
        $user_id = $conn->insert_id;

        // Create dedicated storage folder
        $user_folder = STORAGE_ROOT . '/' . $username;
        if (!file_exists($user_folder)) {
            mkdir($user_folder, 0777, true);
        }

        return ["status" => "success", "message" => "Registration successful! You can now login."];
    } else {
        return ["status" => "error", "message" => "Failed to create account."];
    }
}

// Login logic
function login($username_email, $password)
{
    global $conn;

    // Check if user exists by username or email
    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ? OR email = ?");
    $stmt->bind_param("ss", $username_email, $username_email);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            return ["status" => "success", "message" => "Login successful!"];
        }
    }

    return ["status" => "error", "message" => "Invalid credentials."];
}

// Session check
function is_logged_in()
{
    return isset($_SESSION['user_id']);
}

// Logout logic
function logout()
{
    session_unset();
    session_destroy();
    header("Location: login");
    exit();
}
?>