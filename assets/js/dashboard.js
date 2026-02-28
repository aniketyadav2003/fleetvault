document.addEventListener('DOMContentLoaded', () => {
    let currentFolderId = 'root';
    let viewMode = 'list'; // list or grid
    let currentTab = 'vault'; // vault, starred, trash

    // UI Elements
    const fileManager = document.getElementById('file-manager');
    const fileItemsContainer = document.getElementById('file-items-container');
    const btnNew = document.getElementById('btn-new');
    const newMenu = document.getElementById('new-menu');
    const btnUpload = document.getElementById('btn-upload');
    const fileInput = document.getElementById('file-input');
    const btnCreateFolder = document.getElementById('btn-create-folder');
    const modalPreview = document.getElementById('modal-preview');
    const closePreviewBtn = document.getElementById('close-preview');
    const previewBody = modalPreview.querySelector('.preview-body');
    const previewFilename = modalPreview.querySelector('.preview-filename');
    const previewOverlay = modalPreview.querySelector('.preview-overlay');
    const modalFolder = document.getElementById('modal-folder');
    const closeFolderModal = document.getElementById('close-folder-modal');
    const confirmCreateFolder = document.getElementById('confirm-create-folder');
    const folderNameInput = document.getElementById('folder-name');
    const dropZone = document.getElementById('drop-zone');
    const viewListBtn = document.getElementById('view-list');
    const viewGridBtn = document.getElementById('view-grid');
    const btnLogout = document.getElementById('btn-logout');

    const navVault = document.getElementById('nav-vault');
    const navStarred = document.getElementById('nav-starred');
    const navTrash = document.getElementById('nav-trash');

    // Sidebar Navigation
    const switchTab = (tab) => {
        currentTab = tab;
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        if (tab === 'vault') navVault.classList.add('active');
        if (tab === 'starred') navStarred.classList.add('active');
        if (tab === 'trash') navTrash.classList.add('active');

        // Reset breadcrumbs
        const crumbs = document.querySelector('.breadcrumbs');
        crumbs.innerHTML = '<span class="breadcrumb-item active" data-id="root">My Vault</span>';
        if (tab === 'starred') crumbs.firstChild.textContent = 'Starred';
        if (tab === 'trash') crumbs.firstChild.textContent = 'Trash';

        crumbs.firstChild.onclick = () => {
            currentFolderId = 'root';
            while (crumbs.children.length > 1) crumbs.lastChild.remove();
            loadFiles('root');
        };

        currentFolderId = 'root';
        loadFiles('root');
    };

    navVault.onclick = (e) => { e.preventDefault(); switchTab('vault'); };
    navStarred.onclick = (e) => { e.preventDefault(); switchTab('starred'); };
    navTrash.onclick = (e) => { e.preventDefault(); switchTab('trash'); };

    // Preview Modal Events
    closePreviewBtn.onclick = () => modalPreview.classList.add('hidden');
    previewOverlay.onclick = () => modalPreview.classList.add('hidden');

    // Load initial data
    loadFiles(currentFolderId);
    loadStorageInfo();

    // Toggle View Modes
    viewListBtn.addEventListener('click', () => {
        viewMode = 'list';
        viewListBtn.classList.add('active');
        viewGridBtn.classList.remove('active');
        fileManager.classList.remove('grid');
        fileItemsContainer.classList.remove('grid');
        loadFiles(currentFolderId);
    });

    viewGridBtn.addEventListener('click', () => {
        viewMode = 'grid';
        viewGridBtn.classList.add('active');
        viewListBtn.classList.remove('active');
        fileManager.classList.add('grid');
        fileItemsContainer.classList.add('grid');
        loadFiles(currentFolderId);
    });

    // Logout
    btnLogout.addEventListener('click', async () => {
        const response = await fetch('api/files_api.php?action=logout');
        window.location.href = 'login';
    });

    // New Menu Toggle
    btnNew.addEventListener('click', (e) => {
        e.stopPropagation();
        newMenu.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        newMenu.classList.add('hidden');
    });

    const searchInput = document.querySelector('.search-bar input');

    // Search Filtering
    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        const items = document.querySelectorAll('.file-item');
        items.forEach(item => {
            const name = item.querySelector('.col-name span:last-child').textContent.toLowerCase();
            item.style.display = name.includes(query) ? 'flex' : 'none';
        });
    });

    // Upload Logic
    btnUpload.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', () => handleFiles(fileInput.files));

    // Drag and Drop
    window.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (currentTab === 'vault') dropZone.classList.remove('hidden');
    });

    dropZone.addEventListener('dragleave', () => dropZone.classList.add('hidden'));
    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.add('hidden');
        handleFiles(e.dataTransfer.files);
    });

    // Folder Creation
    btnCreateFolder.addEventListener('click', () => {
        modalFolder.classList.remove('hidden');
        folderNameInput.focus();
    });

    closeFolderModal.addEventListener('click', () => modalFolder.classList.add('hidden'));

    confirmCreateFolder.addEventListener('click', async () => {
        const folderName = folderNameInput.value.trim() || 'Untitled folder';
        const formData = new FormData();
        formData.append('action', 'create_folder');
        formData.append('name', folderName);
        formData.append('parent_id', currentFolderId);

        const response = await fetch('api/files_api.php', { method: 'POST', body: formData });
        const data = await response.json();

        if (data.status === 'success') {
            showToast(data.message, 'success');
            modalFolder.classList.add('hidden');
            folderNameInput.value = '';
            loadFiles(currentFolderId);
        }
    });

    // Core Functions
    async function loadFiles(folderId) {
        fileItemsContainer.innerHTML = '<div class="loading">Loading files...</div>';
        try {
            const response = await fetch(`api/files_api.php?action=list&folder_id=${folderId}&tab=${currentTab}`);
            const data = await response.json();

            if (data.status === 'success') {
                renderItems(data.data);
                loadStorageInfo();
            }
        } catch (error) {
            console.error(error);
            showToast('Failed to load files', 'error');
        }
    }

    function renderItems(data) {
        fileItemsContainer.innerHTML = '';
        if (!data) return;

        const allItems = [...data.folders, ...data.files];

        if (allItems.length === 0) {
            fileItemsContainer.innerHTML = `
                <div class="empty-state">
                    <span class="material-symbols-outlined" style="font-size: 4rem; color: #e8eaed;">cloud_off</span>
                    <p>No files or folders here yet.</p>
                </div>`;
            return;
        }

        allItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'file-item';
            div.dataset.id = item.id;
            div.dataset.type = item.type;

            const starIcon = item.is_starred == 1 ? 'star_filled' : 'star';
            const starClass = item.is_starred == 1 ? 'starred' : '';

            if (viewMode === 'list') {
                div.innerHTML = `
                    <div class="col col-name">
                        <span class="material-symbols-outlined star-btn ${starClass}">${starIcon}</span>
                        <span class="material-symbols-outlined icon ${item.type}">
                            ${item.type === 'folder' ? 'folder' : 'draft'}
                        </span>
                        <span>${item.name}</span>
                    </div>
                    <div class="col col-owner">Me</div>
                    <div class="col col-modified">${formatDate(item.created_at)}</div>
                    <div class="col col-size">${item.type === 'file' ? formatSize(item.size) : '--'}</div>
                    <div class="col col-actions">
                        ${currentTab === 'trash' ? `
                            <button class="icon-btn restore-btn" title="Restore"><span class="material-symbols-outlined">restore</span></button>
                            <button class="icon-btn delete-btn permanently" title="Delete permanently"><span class="material-symbols-outlined">delete_forever</span></button>
                        ` : `
                            <button class="icon-btn trash-btn" title="Move to trash"><span class="material-symbols-outlined">delete</span></button>
                        `}
                    </div>
                `;
            } else {
                const isImage = item.type === 'file' && (item.file_type && (item.file_type.startsWith('image/') || item.name.match(/\.(jpg|jpeg|png|gif|webp)$/i)));
                const url = `api/files_api.php?action=view&id=${item.id}`;

                div.innerHTML = `
                    <div class="col col-name">
                        <div style="display: flex; align-items: center; gap: 8px; flex: 1; overflow: hidden;">
                            <span class="material-symbols-outlined star-btn ${starClass}" style="font-size: 1.1rem; cursor: pointer;">${starIcon}</span>
                            <span class="material-symbols-outlined icon ${item.type}" style="font-size: 1.2rem; color: ${item.type === 'folder' ? '#fbbc04' : '#4285f4'}">
                                ${item.type === 'folder' ? 'folder' : 'image'}
                            </span>
                            <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.name}</span>
                        </div>
                        <div class="grid-actions" style="display: flex; align-items: center; gap: 4px;">
                            ${currentTab === 'trash' ? `
                                <button class="icon-btn restore-btn" style="color: #4285f4"><span class="material-symbols-outlined" style="font-size: 1.2rem;">restore</span></button>
                                <button class="icon-btn delete-btn permanently" style="color: #ea4335"><span class="material-symbols-outlined" style="font-size: 1.2rem;">delete_forever</span></button>
                            ` : `
                                <button class="icon-btn trash-btn" style="color: #ea4335"><span class="material-symbols-outlined" style="font-size: 1.2rem;">delete</span></button>
                            `}
                        </div>
                    </div>
                    <div class="preview-thumb">
                        ${isImage ? `<img src="${url}" class="thumb-img" onerror="this.src='assets/img/placeholder.png'; this.onerror=null;">` : `<span class="material-symbols-outlined">${item.type === 'folder' ? 'folder' : 'draft'}</span>`}
                    </div>
                `;
            }

            // Star toggle
            div.querySelector('.star-btn').onclick = (e) => {
                e.stopPropagation();
                toggleStarUI(item.id, item.type);
            };

            // Interactions
            if (item.type === 'folder' && currentTab !== 'trash') {
                div.addEventListener('dblclick', () => {
                    currentFolderId = item.id;
                    updateBreadcrumbs(item.name, item.id);
                    loadFiles(currentFolderId);
                });
            } else if (item.type === 'file' && currentTab !== 'trash') {
                div.addEventListener('dblclick', () => previewFile(item));
            }

            // Delete / Trash / Restore
            if (div.querySelector('.trash-btn')) {
                div.querySelector('.trash-btn').onclick = (e) => {
                    e.stopPropagation();
                    toggleTrash(item.id, item.type, 1);
                };
            }
            if (div.querySelector('.restore-btn')) {
                div.querySelector('.restore-btn').onclick = (e) => {
                    e.stopPropagation();
                    toggleTrash(item.id, item.type, 0);
                };
            }
            if (div.querySelector('.permanently')) {
                div.querySelector('.permanently').onclick = (e) => {
                    e.stopPropagation();
                    if (confirm('Permanently delete this item? This cannot be undone.')) {
                        deleteItem(item.id, item.type);
                    }
                };
            }

            fileItemsContainer.appendChild(div);
        });
    }

    async function toggleStarUI(id, type) {
        const formData = new FormData();
        formData.append('action', 'star');
        formData.append('id', id);
        formData.append('type', type);
        await fetch('api/files_api.php', { method: 'POST', body: formData });
        loadFiles(currentFolderId);
    }

    async function toggleTrash(id, type, status) {
        const formData = new FormData();
        formData.append('action', 'toggle_trash');
        formData.append('id', id);
        formData.append('type', type);
        formData.append('status', status);
        const response = await fetch('api/files_api.php', { method: 'POST', body: formData });
        const data = await response.json();
        showToast(data.message, 'success');
        loadFiles(currentFolderId);
    }

    async function deleteItem(id, type) {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('id', id);
        formData.append('type', type);
        const response = await fetch('api/files_api.php', { method: 'POST', body: formData });
        const data = await response.json();
        if (data.status === 'success') {
            showToast(data.message, 'success');
            loadFiles(currentFolderId);
            loadStorageInfo();
        }
    }

    async function loadStorageInfo() {
        try {
            const response = await fetch('api/files_api.php?action=storage');
            const data = await response.json();
            if (data.status === 'success') {
                const storageBar = document.querySelector('.storage-info .progress');
                const storageLabel = document.querySelector('.storage-info .storage-label span:last-child');
                const storageMeta = document.querySelector('.storage-info .storage-meta');
                if (storageBar) storageBar.style.width = `${data.percent}%`;
                if (storageLabel) storageLabel.textContent = `Storage (${data.percent}% full)`;
                if (storageMeta) storageMeta.textContent = `${formatSize(data.used)} of ${formatSize(data.limit)} used`;
            }
        } catch (error) { }
    }

    // Helpers
    function formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    function previewFile(item) {
        modalPreview.classList.remove('hidden');
        previewFilename.textContent = item.name;
        previewBody.innerHTML = '<div class="loading">Loading preview...</div>';
        const url = `api/files_api.php?action=view&id=${item.id}`;
        let content = '';
        if (item.file_type && item.file_type.startsWith('image/')) {
            content = `<img src="${url}" alt="${item.name}">`;
        } else if (item.file_type && item.file_type.startsWith('video/')) {
            content = `<video src="${url}" controls autoplay></video>`;
        } else if (item.file_type === 'application/pdf') {
            content = `<iframe src="${url}"></iframe>`;
        } else {
            content = `<div class="no-preview"><span class="material-symbols-outlined" style="font-size: 5rem; color: white;">draft</span><p style="color: white; margin-top: 20px;">No preview available.</p><a href="${url}" download="${item.name}" class="btn-primary" style="display:inline-block;width:auto;padding:12px 24px;margin-top:20px;text-decoration:none;">Download</a></div>`;
        }
        previewBody.innerHTML = content;
    }

    function updateBreadcrumbs(name, id) {
        const crumbs = document.querySelector('.breadcrumbs');
        const span = document.createElement('span');
        span.className = 'breadcrumb-item';
        span.textContent = ` > ${name}`;
        span.dataset.id = id;
        span.style.cursor = 'pointer';
        span.onclick = () => {
            currentFolderId = id;
            while (span.nextSibling) span.nextSibling.remove();
            loadFiles(id);
        };
        crumbs.appendChild(span);
    }

    async function handleFiles(files) {
        const widget = createUploadWidget(files.length);
        const list = widget.querySelector('.upload-items-list');
        const statusBar = widget.querySelector('.widget-status-bar span');
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const itemElement = document.createElement('div');
            itemElement.className = 'upload-item-status';
            itemElement.innerHTML = `<span class="material-symbols-outlined">draft</span><span class="file-name">${file.name}</span><div class="progress-ring-container"><svg class="progress-ring" width="24" height="24"><circle class="progress-ring__circle" stroke="#4285f4" stroke-width="2" fill="transparent" r="8" cx="12" cy="12"/></svg><span class="material-symbols-outlined check-icon hidden">check_circle</span></div>`;
            list.appendChild(itemElement);
            const circle = itemElement.querySelector('.progress-ring__circle');
            const radius = circle.r.baseVal.value;
            const circumference = radius * 2 * Math.PI;
            circle.style.strokeDasharray = `${circumference} ${circumference}`;
            circle.style.strokeDashoffset = circumference;
            const formData = new FormData();
            formData.append('action', 'upload');
            formData.append('file', file);
            formData.append('folder_id', currentFolderId);
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'api/files_api.php', true);
            const uploadPromise = new Promise((resolve) => {
                xhr.upload.onprogress = (e) => {
                    if (e.lengthComputable) {
                        const percent = (e.loaded / e.total) * 100;
                        circle.style.strokeDashoffset = circumference - (percent / 100 * circumference);
                        statusBar.textContent = `Uploading ${i + 1} of ${files.length}...`;
                    }
                };
                xhr.onload = () => {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.status === 'success') {
                            circle.parentElement.classList.add('hidden');
                            itemElement.querySelector('.check-icon').classList.remove('hidden');
                            resolve(true);
                        } else { resolve(false); }
                    } catch (e) { resolve(false); }
                };
                xhr.send(formData);
            });
            await uploadPromise;
        }
        statusBar.textContent = 'Uploads complete';
        loadFiles(currentFolderId);
        setTimeout(() => { if (widget) widget.classList.add('minimized'); }, 3000);
    }

    function createUploadWidget(count) {
        let widget = document.getElementById('upload-widget');
        if (!widget) {
            widget = document.createElement('div');
            widget.id = 'upload-widget';
            widget.className = 'upload-widget';
            widget.innerHTML = `<div class="upload-widget-header"><span class="widget-title">Uploading ${count} items</span><div class="widget-controls"><span class="material-symbols-outlined btn-toggle">keyboard_arrow_down</span><span class="material-symbols-outlined btn-close-widget">close</span></div></div><div class="upload-widget-body"><div class="widget-status-bar"><span>Starting...</span></div><div class="upload-items-list"></div></div>`;
            document.body.appendChild(widget);
            widget.querySelector('.btn-toggle').onclick = () => widget.classList.toggle('minimized');
            widget.querySelector('.btn-close-widget').onclick = () => widget.remove();
        } else {
            widget.classList.remove('minimized');
            widget.querySelector('.widget-title').textContent = `Uploading ${count} items`;
        }
        return widget;
    }
});

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    if (type === 'success') toast.style.backgroundColor = '#00c851';
    if (type === 'error') toast.style.backgroundColor = '#ff4444';
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
