# FleetVault 

A modern, high-performance cloud storage web application built with PHP, MySQL, and Vanilla JS. FleetVault features a clean, sharp, minimal interface inspired by Google Drive, optimized for personal and/or multi-user file management.

## ✨ Features

- **Secure Authentication**: Robust Sign Up and Login with password hashing (BCrypt).
- **File Management**: Upload, Download, Rename, and Delete files/folders.
- **Smart Organization**: Dedicated "My Vault", "Starred", and "Trash" navigation.
- **Dynamic Previews**: Fullscreen, in-page previews for Images, Videos, and PDFs.
- **Modern UI/UX**:
    - Grid and List toggle views.
    - Drag-and-Drop upload support.
    - Real-time upload progress widget.
    - Professional Clean URLs (hiding .php extensions).
- **Responsive Design**: Fluid layout optimized for Desktop, Tablet, and Mobile.
- **Storage Metrics**: Real-time storage usage tracking and quota management.

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript, Google Fonts & Icons.
- **Backend**: PHP 8.x.
- **Database**: MySQL.
- **Server Configuration**: Apache (.htaccess for clean URLs).

---

## 🚀 Installation Guide

Follow these steps to set up FleetVault on your local machine using XAMPP:

### 1. Prerequisites
- **XAMPP** (or any LAMP/WAMP stack with PHP 8.0+ and MySQL).
- **Apache Rewrite Module** enabled (usually enabled by default in XAMPP).

### 2. Clone/Copy Project
Move the `fleetvault` folder to your server's root directory:
- For XAMPP Windows: `C:\xampp\htdocs\fleetvault`

### 3. Database Setup
1. Open **phpMyAdmin** (`http://localhost/phpmyadmin`).
2. Create a new database named `fleetvault`.
3. Select the `fleetvault` database and click the **Import** tab.
4. Choose the `database.sql` file located in the project root and click **Go**.

### 4. Configuration
Ensure your database credentials are correct in `config/db.php`:
```php
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'fleetvault');
```

### 5. Storage Permissions
The application automatically creates a `storage/` directory in the root. Ensure this directory is writable:
- On Linux: `chmod -R 777 storage/`
- On Windows/XAMPP: permissions are usually handled correctly by default.

---

## 📂 Project Structure

- `/api`: Backend PHP endpoints for files and authentication.
- `/assets`: Frontend assets (CSS, JS, Fonts).
- `/config`: Database connection configuration.
- `/includes`: Core PHP functions for business logic.
- `/storage`: Encrypted/Hidden storage for uploaded user files.

## 📄 License
This project is for educational purposes. Feel free to modify and adapt it for your needs.

---

*Made with ❤️ by Aniket*
