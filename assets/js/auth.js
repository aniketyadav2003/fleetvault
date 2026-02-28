document.addEventListener('DOMContentLoaded', () => {
    // Auth Tab Toggles
    const btnLoginTab = document.getElementById('btn-login-tab');
    const btnSignupTab = document.getElementById('btn-signup-tab');
    const loginForm = document.getElementById('login-form');
    const signupForm = document.getElementById('signup-form');

    btnLoginTab.addEventListener('click', () => {
        btnLoginTab.classList.add('active');
        btnSignupTab.classList.remove('active');
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
    });

    btnSignupTab.addEventListener('click', () => {
        btnSignupTab.classList.add('active');
        btnLoginTab.classList.remove('active');
        signupForm.style.display = 'block';
        loginForm.style.display = 'none';
    });

    // Handle Login AJAX
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        formData.append('action', 'login');

        try {
            const response = await fetch('api/auth_api.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.status === 'success') {
                showToast(data.message, 'success');
                setTimeout(() => window.location.href = 'dashboard', 1000);
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('Something went wrong. Please try again.', 'error');
        }
    });

    // Handle Signup AJAX
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(signupForm);
        formData.append('action', 'signup');

        try {
            const response = await fetch('api/auth_api.php', {
                method: 'POST',
                body: formData
            });
            const data = await response.json();

            if (data.status === 'success') {
                showToast(data.message, 'success');
                setTimeout(() => window.location.reload(), 1500);
            } else {
                showToast(data.message, 'error');
            }
        } catch (error) {
            showToast('Something went wrong. Please try again.', 'error');
        }
    });
});

// Utility: Toast Notification
function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;

    // Simple color styles for toast types
    if (type === 'success') toast.style.backgroundColor = '#00c851';
    if (type === 'error') toast.style.backgroundColor = '#ff4444';

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.5s ease forwards';
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}
