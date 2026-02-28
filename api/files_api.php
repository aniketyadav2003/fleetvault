<?php
require_once __DIR__ . '/../includes/auth_functions.php';
require_once __DIR__ . '/../includes/file_functions.php';

if (!is_logged_in()) {
    header('Content-Type: application/json');
    echo json_encode(["status" => "error", "message" => "Unauthorized"]);
    exit();
}

$user_id = $_SESSION['user_id'];
$username = $_SESSION['username'];
$action = $_POST['action'] ?? $_GET['action'] ?? '';

// Only send JSON headers for non-view actions
$json_actions = ['list', 'upload', 'create_folder', 'delete', 'rename', 'storage', 'star', 'toggle_trash', 'logout'];
if (in_array($action, $json_actions)) {
    header('Content-Type: application/json');
}

switch ($action) {
    case 'list':
        $folder_id = $_GET['folder_id'] ?? null;
        $tab = $_GET['tab'] ?? 'vault';
        if ($folder_id == 'root')
            $folder_id = null;
        $items = list_files($user_id, $folder_id, $tab);
        echo json_encode(["status" => "success", "data" => $items]);
        break;

    case 'upload':
        if (!isset($_FILES['file'])) {
            echo json_encode(["status" => "error", "message" => "No file uploaded"]);
            break;
        }
        $folder_id = $_POST['folder_id'] ?? null;
        if ($folder_id == 'root')
            $folder_id = null;

        $success = upload_file($user_id, $username, $_FILES['file'], $folder_id);
        echo json_encode(["status" => $success ? "success" : "error", "message" => $success ? "File uploaded" : "Upload failed"]);
        break;

    case 'create_folder':
        $name = $_POST['name'] ?? 'New Folder';
        $parent_id = $_POST['parent_id'] ?? null;
        if ($parent_id == 'root')
            $parent_id = null;

        $success = create_folder($user_id, $name, $parent_id);
        echo json_encode(["status" => $success ? "success" : "error", "message" => $success ? "Folder created" : "Failed to create folder"]);
        break;

    case 'star':
        $id = $_POST['id'];
        $type = $_POST['type'];
        $success = toggle_star($user_id, $type, $id);
        echo json_encode(["status" => $success ? "success" : "error", "message" => "Operation completed"]);
        break;

    case 'toggle_trash':
        $id = $_POST['id'];
        $type = $_POST['type'];
        $status = $_POST['status'] ?? 1;
        $success = toggle_trash($user_id, $type, $id, $status);
        echo json_encode(["status" => $success ? "success" : "error", "message" => $status == 1 ? "Moved to trash" : "Item restored"]);
        break;

    case 'delete':
        $id = $_POST['id'];
        $type = $_POST['type'];
        $success = delete_item($user_id, $type, $id);
        echo json_encode(["status" => $success ? "success" : "error", "message" => $success ? "Permanently deleted" : "Failed to delete item"]);
        break;

    case 'rename':
        $id = $_POST['id'];
        $type = $_POST['type'];
        $new_name = $_POST['name'];
        $success = rename_item($user_id, $type, $id, $new_name);
        echo json_encode(["status" => $success ? "success" : "error", "message" => $success ? "Item renamed" : "Failed to rename item"]);
        break;

    case 'view':
        $id = $_GET['id'] ?? null;
        global $conn;
        $stmt = $conn->prepare("SELECT file_path, original_name, file_type FROM files WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $id, $user_id);
        $stmt->execute();
        $file = $stmt->get_result()->fetch_assoc();

        if ($file && file_exists($file['file_path'])) {
            header("Content-Type: " . $file['file_type']);
            header("Content-Disposition: inline; filename=\"" . $file['original_name'] . "\"");
            readfile($file['file_path']);
            exit();
        } else {
            die("File not found.");
        }
        break;

    case 'storage':
        $used = get_storage_usage($user_id);
        $limit = 100 * 1024 * 1024; // 100MB limit for now
        echo json_encode([
            "status" => "success",
            "used" => $used,
            "limit" => $limit,
            "percent" => $limit > 0 ? round(($used / $limit) * 100, 2) : 0
        ]);
        break;

    case 'logout':
        logout();
        echo json_encode(["status" => "success"]);
        break;
}
?>