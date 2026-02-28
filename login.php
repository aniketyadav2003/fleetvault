<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header("Location: dashboard");
    exit();
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FleetVault - Secure Cloud Storage</title>
    <!-- Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="assets/css/style.css">
</head>

<body class="auth-page">
    <div class="auth-container">
        <div class="auth-header">
            <h1 class="logo">Fleet<span>Vault</span></h1>
            <p class="subtitle">Secure, fast, and minimal cloud storage.</p>
        </div>

        <div class="auth-card">
            <!-- Auth Toggle Tabs -->
            <div class="auth-tabs">
                <button id="btn-login-tab" class="active">Login</button>
                <button id="btn-signup-tab">Sign Up</button>
            </div>

            <!-- Login Form -->
            <form id="login-form">
                <div class="form-group">
                    <label for="login-username">Username or Email</label>
                    <input type="text" id="login-username" name="username_email" placeholder="Enter username or email"
                        required>
                </div>
                <div class="form-group">
                    <label for="login-password">Password</label>
                    <input type="password" id="login-password" name="password" placeholder="Enter password" required>
                </div>
                <button type="submit" class="btn-primary">Login</button>
            </form>

            <!-- Signup Form (Hidden by default) -->
            <form id="signup-form" style="display: none;">
                <div class="form-group">
                    <label for="signup-username">Username</label>
                    <input type="text" id="signup-username" name="username" placeholder="Choose a username" required>
                </div>
                <div class="form-group">
                    <label for="signup-email">Email Address</label>
                    <input type="email" id="signup-email" name="email" placeholder="Your email address" required>
                </div>
                <div class="form-group">
                    <label for="signup-password">Password</label>
                    <input type="password" id="signup-password" name="password" placeholder="Create a strong password"
                        required>
                </div>
                <button type="submit" class="btn-primary">Create Account</button>
            </form>
        </div>
    </div>

    <!-- Toast notification container -->
    <div id="toast-container"></div>

    <script src="assets/js/auth.js"></script>
</body>

</html>