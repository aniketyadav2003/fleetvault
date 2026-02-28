<?php
require_once __DIR__ . '/includes/auth_functions.php';
if (!is_logged_in()) {
    header("Location: login");
    exit();
}
$username = $_SESSION['username'];
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - FleetVault</title>
    <!-- Google Fonts & Icons -->
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/dashboard.css">
</head>

<body class="dashboard-page">
    <!-- Top Navigation -->
    <header class="header">
        <div class="header-left">
            <h1 class="logo small">Fleet<span>Vault</span></h1>
        </div>
        <div class="header-middle">
            <div class="search-bar">
                <span class="material-symbols-outlined">search</span>
                <input type="text" placeholder="Search in FleetVault">
            </div>
        </div>
        <div class="header-right">
            <div class="user-profile">
                <div class="avatar">
                    <?php echo strtoupper(substr($username, 0, 1)); ?>
                </div>
                <span class="username">
                    <?php echo $username; ?>
                </span>
                <button id="btn-logout" class="icon-btn">
                    <span class="material-symbols-outlined">logout</span>
                </button>
            </div>
        </div>
    </header>

    <div class="main-wrapper">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="new-action">
                <button id="btn-new" class="btn-fab">
                    <span class="material-symbols-outlined">add</span>
                    <span>New</span>
                </button>
                <div id="new-menu" class="dropdown-menu hidden">
                    <button id="btn-upload"><span class="material-symbols-outlined">upload_file</span> File
                        upload</button>
                    <button id="btn-create-folder"><span class="material-symbols-outlined">create_new_folder</span> New
                        folder</button>
                </div>
            </div>

            <nav class="side-nav">
                <a href="#" class="nav-item active" id="nav-vault">
                    <span class="material-symbols-outlined">cloud</span>
                    <span>My Vault</span>
                </a>
                <a href="#" class="nav-item" id="nav-starred">
                    <span class="material-symbols-outlined">star</span>
                    <span>Starred</span>
                </a>
                <a href="#" class="nav-item" id="nav-trash">
                    <span class="material-symbols-outlined">delete</span>
                    <span>Trash</span>
                </a>
            </nav>

            <div class="storage-info">
                <div class="storage-label">
                    <span class="material-symbols-outlined">cloud_circle</span>
                    <span>Storage (8% full)</span>
                </div>
                <div class="progress-bar">
                    <div class="progress" style="width: 8%"></div>
                </div>
                <p class="storage-meta">8.2 MB of 100 MB used</p>
            </div>
        </aside>

        <!-- Main Content Area -->
        <main class="content">
            <div class="content-header">
                <div class="breadcrumbs">
                    <span class="breadcrumb-item active" data-id="root">My Vault</span>
                </div>
                <div class="view-toggles">
                    <button id="view-list" class="icon-btn active"><span
                            class="material-symbols-outlined">list</span></button>
                    <button id="view-grid" class="icon-btn"><span
                            class="material-symbols-outlined">grid_view</span></button>
                </div>
            </div>

            <div id="file-manager" class="file-list-view">
                <!-- Drop area for drag and drop -->
                <div id="drop-zone" class="drop-zone hidden">
                    <span class="material-symbols-outlined">upload_file</span>
                    <p>Drop files to upload to My Vault</p>
                </div>

                <div class="file-table-header">
                    <div class="col col-name">Name</div>
                    <div class="col col-owner">Owner</div>
                    <div class="col col-modified">Last modified</div>
                    <div class="col col-size">File size</div>
                    <div class="col col-actions"></div>
                </div>

                <div id="file-items-container" class="file-items">
                    <!-- Items populated by JS -->
                </div>
            </div>
        </main>
    </div>

    <!-- Modals -->
    <div id="modal-preview" class="modal-fullscreen hidden">
        <div class="preview-overlay"></div>
        <div class="preview-content">
            <div class="preview-header">
                <span class="preview-filename">File Name</span>
                <button id="close-preview" class="icon-btn white"><span
                        class="material-symbols-outlined">close</span></button>
            </div>
            <div class="preview-body">
                <!-- Content injected by JS -->
            </div>
        </div>
    </div>

    <div id="modal-folder" class="modal hidden">
        <div class="modal-content">
            <h3>New folder</h3>
            <input type="text" id="folder-name" placeholder="Untitled folder">
            <div class="modal-actions">
                <button class="btn-flat" id="close-folder-modal">Cancel</button>
                <button class="btn-flat primary" id="confirm-create-folder">Create</button>
            </div>
        </div>
    </div>

    <!-- Hidden File Input -->
    <input type="file" id="file-input" multiple style="display: none;">

    <!-- Toast container -->
    <div id="toast-container"></div>

    <script src="assets/js/dashboard.js"></script>
</body>

</html>