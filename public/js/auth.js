/**
 * DineFlow — Auth Module
 * Handles login state, navigation, and role-based UI
 */

function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

function getToken() {
  return localStorage.getItem('token');
}

function isLoggedIn() {
  return !!getToken();
}

function getUserRole() {
  const user = getUser();
  return user ? user.role : null;
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login.html';
}

/**
 * Require authentication — redirect to login if not authenticated
 */
function requireAuth(allowedRoles = null) {
  if (!isLoggedIn()) {
    window.location.href = '/login.html';
    return false;
  }
  if (allowedRoles && !allowedRoles.includes(getUserRole())) {
    showToast('Access denied. Insufficient permissions.', 'error');
    window.location.href = '/';
    return false;
  }
  return true;
}

/**
 * Update navigation based on login state and role
 */
function updateNav() {
  const navLinks = document.getElementById('navLinks');
  const authButtons = document.getElementById('authButtons');
  const userMenu = document.getElementById('userMenu');
  if (!navLinks) return;

  const user = getUser();
  const role = getUserRole();

  // Common links for everyone
  let links = '';

  if (!isLoggedIn()) {
    links = `
      <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
      <li class="nav-item"><a class="nav-link" href="menu.html">Menu</a></li>
    `;
    if (authButtons) authButtons.classList.remove('d-none');
    if (userMenu) userMenu.classList.add('d-none');
  } else {
    if (authButtons) authButtons.classList.add('d-none');
    if (userMenu) userMenu.classList.remove('d-none');
    if (document.getElementById('userName')) document.getElementById('userName').textContent = user.name;
    if (document.getElementById('userRole')) document.getElementById('userRole').textContent = role.charAt(0).toUpperCase() + role.slice(1);

    if (role === 'customer') {
      links = `
        <li class="nav-item"><a class="nav-link" href="/">Home</a></li>
        <li class="nav-item"><a class="nav-link" href="menu.html">Menu</a></li>
        <li class="nav-item"><a class="nav-link" href="reservation.html">Reservations</a></li>
        <li class="nav-item"><a class="nav-link" href="orders.html">Orders</a></li>
      `;
    } else if (role === 'kitchen') {
      links = `
        <li class="nav-item"><a class="nav-link" href="kitchen.html">Kitchen Queue</a></li>
      `;
    } else if (role === 'admin' || role === 'manager') {
      links = `
        <li class="nav-item"><a class="nav-link" href="dashboard.html">Dashboard</a></li>
        <li class="nav-item"><a class="nav-link" href="menu.html">Menu</a></li>
        <li class="nav-item"><a class="nav-link" href="orders.html">Orders</a></li>
        <li class="nav-item"><a class="nav-link" href="kitchen.html">Kitchen</a></li>
      `;
    }
  }

  navLinks.innerHTML = links;

  // Highlight active link
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  navLinks.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPage || (currentPage === '' && link.getAttribute('href') === '/')) {
      link.classList.add('active');
    }
  });
}

// Initialize nav on every page
document.addEventListener('DOMContentLoaded', updateNav);
