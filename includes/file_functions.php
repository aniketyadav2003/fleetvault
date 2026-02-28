<?php
require_once __DIR__ . '/../config/db.php';

function get_user_root($username)
{
    $path = STORAGE_ROOT . $username . '/';
    if (!file_exists($path))
        mkdir($path, 0777, true);
    return $path;
}

function list_files($user_id, $folder_id = null, $tab = 'vault')
{
    global $conn;

    // Normalize folder_id
    if ($folder_id === 'root' || empty($folder_id)) {
        $folder_id = null;
    }

    $tab_condition = "is_trashed = 0";
    if ($tab === 'trash') {
        $tab_condition = "is_trashed = 1";
    } elseif ($tab === 'starred') {
        $tab_condition = "is_starred = 1 AND is_trashed = 0";
    }

    // Get Folders
    if ($tab === 'vault') {
        $stmt = $conn->prepare("SELECT id, name, created_at, is_starred, is_trashed FROM folders WHERE user_id = ? AND $tab_condition " . (is_null($folder_id) ? "AND parent_id IS NULL" : "AND parent_id = ?"));
        if (!is_null($folder_id)) {
            $stmt->bind_param("ii", $user_id, $folder_id);
        } else {
            $stmt->bind_param("i", $user_id);
        }
    } else {
        $stmt = $conn->prepare("SELECT id, name, created_at, is_starred, is_trashed FROM folders WHERE user_id = ? AND $tab_condition");
        $stmt->bind_param("i", $user_id);
    }
    $stmt->execute();
    $folders = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    // Get Files
    if ($tab === 'vault') {
        $stmt = $conn->prepare("SELECT id, original_name as name, size, file_type, uploaded_at as created_at, is_starred, is_trashed FROM files WHERE user_id = ? AND $tab_condition " . (is_null($folder_id) ? "AND folder_id IS NULL" : "AND folder_id = ?"));
        if (!is_null($folder_id)) {
            $stmt->bind_param("ii", $user_id, $folder_id);
        } else {
            $stmt->bind_param("i", $user_id);
        }
    } else {
        $stmt = $conn->prepare("SELECT id, original_name as name, size, file_type, uploaded_at as created_at, is_starred, is_trashed FROM files WHERE user_id = ? AND $tab_condition");
        $stmt->bind_param("i", $user_id);
    }
    $stmt->execute();
    $files = $stmt->get_result()->fetch_all(MYSQLI_ASSOC);

    return [
        "folders" => array_map(function ($f) {
            $f['type'] = 'folder';
            return $f;
        }, $folders),
        "files" => array_map(function ($f) {
            $f['type'] = 'file';
            return $f;
        }, $files)
    ];
}

function create_folder($user_id, $name, $parent_id = null)
{
    global $conn;
    if ($parent_id === 'root' || empty($parent_id)) {
        $parent_id = null;
    }
    $stmt = $conn->prepare("INSERT INTO folders (user_id, name, parent_id) VALUES (?, ?, ?)");
    $stmt->bind_param("isi", $user_id, $name, $parent_id);
    return $stmt->execute();
}

function upload_file($user_id, $username, $file, $folder_id = null)
{
    global $conn;
    $original_name = basename($file['name']);
    $file_type = $file['type'];
    $file_size = $file['size'];
    $extension = pathinfo($original_name, PATHINFO_EXTENSION);
    $unique_name = md5(time() . $original_name) . '.' . $extension;
    $upload_path = get_user_root($username) . $unique_name;

    if (move_uploaded_file($file['tmp_name'], $upload_path)) {
        if ($folder_id === 'root' || empty($folder_id)) {
            $folder_id = null;
        }
        $stmt = $conn->prepare("INSERT INTO files (user_id, folder_id, filename, original_name, size, file_type, file_path) VALUES (?, ?, ?, ?, ?, ?, ?)");
        $stmt->bind_param("iississ", $user_id, $folder_id, $unique_name, $original_name, $file_size, $file_type, $upload_path);
        return $stmt->execute();
    }
    return false;
}

function toggle_trash($user_id, $type, $id, $status = 1)
{
    global $conn;
    $table = ($type === 'file') ? 'files' : 'folders';
    $stmt = $conn->prepare("UPDATE $table SET is_trashed = ? WHERE id = ? AND user_id = ?");
    $stmt->bind_param("iii", $status, $id, $user_id);
    return $stmt->execute();
}

function toggle_star($user_id, $type, $id)
{
    global $conn;
    $table = ($type === 'file') ? 'files' : 'folders';
    $stmt = $conn->prepare("UPDATE $table SET is_starred = NOT is_starred WHERE id = ? AND user_id = ?");
    $stmt->bind_param("ii", $id, $user_id);
    return $stmt->execute();
}

function delete_item($user_id, $type, $id)
{
    global $conn;
    if ($type === 'file') {
        $stmt = $conn->prepare("SELECT file_path FROM files WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $id, $user_id);
        $stmt->execute();
        $result = $stmt->get_result();
        if ($file = $result->fetch_assoc()) {
            if (file_exists($file['file_path']))
                unlink($file['file_path']);
            $stmt = $conn->prepare("DELETE FROM files WHERE id = ? AND user_id = ?");
            $stmt->bind_param("ii", $id, $user_id);
            return $stmt->execute();
        }
    } else {
        $stmt = $conn->prepare("DELETE FROM folders WHERE id = ? AND user_id = ?");
        $stmt->bind_param("ii", $id, $user_id);
        return $stmt->execute();
    }
    return false;
}

function rename_item($user_id, $type, $id, $new_name)
{
    global $conn;
    $table = ($type === 'file') ? 'files' : 'folders';
    $field = ($type === 'file') ? 'original_name' : 'name';
    $stmt = $conn->prepare("UPDATE $table SET $field = ? WHERE id = ? AND user_id = ?");
    $stmt->bind_param("sii", $new_name, $id, $user_id);
    return $stmt->execute();
}

function get_storage_usage($user_id)
{
    global $conn;
    $stmt = $conn->prepare("SELECT SUM(size) as total_size FROM files WHERE user_id = ?");
    $stmt->bind_param("i", $user_id);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    return (int) ($result['total_size'] ?? 0);
}