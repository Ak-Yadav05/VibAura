import { isAuthenticated, getCurrentUser, logout } from '../auth/authService.js';

export function initAuthUI() {
    updateHeader();
}

function updateHeader() {
    const userProfiles = document.querySelectorAll('.user-profile');

    if (isAuthenticated()) {
        const user = getCurrentUser();
        // Show user avatar and setup click listener for logout
        userProfiles.forEach(profile => {
            // Use a placeholder or real avatar if available
            profile.innerHTML = `
            <img src="https://ui-avatars.com/api/?name=${user.email}&background=2563EB&color=fff" alt="User Avatar" style="cursor: pointer;" title="Click to Logout" />
        `;
            profile.addEventListener('click', () => {
                if (confirm("Are you sure you want to logout?")) {
                    logout();
                }
            });
        });
    } else {
        // Show Login/Signup buttons
        userProfiles.forEach(profile => {
            profile.innerHTML = `
        <a href="#/login" style="text-decoration: none; color: inherit; font-size: 0.9rem; font-weight: 600; padding: 0.5rem 1rem; border: 1px solid currentColor; border-radius: 20px;">
          Login
        </a>
      `;
            // Clear any click listeners by cloning (simple trick, or just remove listener if stored)
            const newEl = profile.cloneNode(true);
            profile.parentNode.replaceChild(newEl, profile);
        });
    }
}
