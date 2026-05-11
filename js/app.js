// Mejaaa — Core App Framework + Dashboard
const App = {
  currentPage: 'dashboard',
  navigate(page) {
    const role = Store.getCurrentPersona().id;
    const permissions = {
      owner: ['dashboard','rooms','tables','floorplan','bookings','audit','settings'],
      admin: ['dashboard','rooms','tables','floorplan','bookings','audit','settings'],
      manager: ['dashboard','rooms','tables','floorplan','bookings','audit','settings'],
      host: ['dashboard','floorplan','bookings'],
      waiter: ['dashboard','floorplan'],
      cleaner: ['floorplan'],
      customer: ['floorplan']
    };
    const allowed = permissions[role] || permissions.customer;
    
    if (page && !allowed.includes(page)) {
      page = allowed[0];
    }
    this.currentPage = page || allowed[0];

    document.querySelectorAll('.nav-item').forEach(el => {
      const p = el.dataset.page;
      el.style.display = allowed.includes(p) ? 'flex' : 'none';
      el.classList.toggle('active', p === this.currentPage);
    });

    const titles = { dashboard:'Dashboard', rooms:'Rooms', tables:'Tables', floorplan:'Floor Plan', bookings:'Bookings', audit:'Audit Trail', settings:'Settings', customer_booking:'Book a Table' };
    document.getElementById('topbar-title').textContent = titles[this.currentPage] || this.currentPage;
    const btn = document.getElementById('topbar-action');
    btn.style.display = 'none';

    // Hide sidebar for customer mode
    const sidebar = document.getElementById('sidebar');
    const searchBar = document.querySelector('.search-bar');
    if (sidebar) sidebar.style.display = role === 'customer' ? 'none' : 'flex';
    if (searchBar) searchBar.style.display = role === 'customer' ? 'none' : 'block';

    this.render();
  },
  render() {
    const c = document.getElementById('page-content');
    const pages = { dashboard: Pages.dashboard, rooms: Pages.rooms, tables: Pages.tables, floorplan: Pages.floorplan, bookings: Pages.bookings, audit: Pages.audit, settings: Pages.settings, customer_booking: Pages.customer_booking };
    if (pages[this.currentPage]) pages[this.currentPage](c);
    else c.innerHTML = '<div class="empty-state"><h3>Page not found</h3></div>';
    this.updateBadges();
  },
  updateBadges() {
    const s = Store.getStats();
    const b = document.getElementById('booking-badge');
    if (b) b.textContent = s.todayBookings > 0 ? s.todayBookings : '';
  },
  // Modal
  openModal(title, bodyHtml, footerHtml) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHtml;
    document.getElementById('modal-footer').innerHTML = footerHtml;
    document.getElementById('modal-overlay').classList.add('open');
  },
  closeModal(e) {
    if (e && e.target !== e.currentTarget) return;
    document.getElementById('modal-overlay').classList.remove('open');
  },
  // Toast
  toast(msg, type = 'success') {
    const c = document.getElementById('toast-container');
    const t = document.createElement('div');
    t.className = `toast toast-${type}`;
    t.innerHTML = `<span>${msg}</span>`;
    c.appendChild(t);
    setTimeout(() => { t.style.opacity = '0'; setTimeout(() => t.remove(), 300); }, 3000);
  },
  // Confirm
  confirm(msg, onYes) {
    const d = document.createElement('div');
    d.className = 'confirm-overlay';
    d.innerHTML = `<div class="confirm-box"><div class="confirm-title">Confirm Action</div><div class="confirm-msg">${msg}</div><div class="confirm-actions"><button class="btn btn-secondary" onclick="this.closest('.confirm-overlay').remove()">Cancel</button><button class="btn btn-danger" id="confirm-yes">Delete</button></div></div>`;
    document.body.appendChild(d);
    d.querySelector('#confirm-yes').onclick = () => { d.remove(); onYes(); };
  },
  // Helpers
  badge(status) { return `<span class="badge badge-${status}">${status.replace(/_/g, ' ')}</span>`; },
  fmtDate(iso) { if (!iso) return '-'; try { return new Date(iso).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }); } catch { return iso; } },
  fmtTime(iso) { if (!iso) return '-'; try { return new Date(iso).toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit' }); } catch { return iso; } },
  fmtDateTime(iso) { if (!iso) return '-'; try { const d = new Date(iso); return d.toLocaleDateString('en-GB',{day:'2-digit',month:'short'}) + ' ' + d.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'}); } catch { return iso; } },
  roomName(id) { const r = Store.getRoom(id); return r ? r.name : '-'; },
  roomOpts(selected) { return Store.getRooms().map(r => `<option value="${r.id}" ${r.id===selected?'selected':''}>${r.name}</option>`).join(''); },
  
  // Persona Management
  renderPersona() {
    const p = Store.getCurrentPersona();
    document.getElementById('current-avatar').textContent = p.initials;
    document.getElementById('current-user-name').textContent = p.name;
    document.getElementById('current-user-role').textContent = p.role;
  },
  togglePersonaDropdown(e) {
    e.stopPropagation();
    const container = e.currentTarget.closest('.dropdown-container') || e.currentTarget.parentElement;
    const menu = container.querySelector('.dropdown-menu');
    
    // Close other open menus
    document.querySelectorAll('.dropdown-menu.open').forEach(m => {
      if (m !== menu) m.classList.remove('open');
    });

    if (menu) {
      menu.classList.toggle('open');
      if (menu.classList.contains('open')) {
        const current = Store.getCurrentPersona();
        menu.innerHTML = Store.PERSONAS.map(p => `
          <div class="dropdown-item ${p.id === current.id ? 'active' : ''}" onclick="App.switchPersona('${p.id}')">
            <div>
              <div style="font-weight:600">${p.name}</div>
              <div style="font-size:11px;color:var(--text-muted)">${p.role}</div>
            </div>
            ${p.id === current.id ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>' : ''}
          </div>
        `).join('');
      }
    }
  },
  switchPersona(id) {
    Store.setPersona(id);
    this.renderPersona();
    document.querySelectorAll('.dropdown-menu').forEach(m => m.classList.remove('open'));
    this.toast(`Switched to ${Store.getCurrentPersona().role}`);
    this.navigate(this.currentPage); // Re-evaluate permissions and render
  },

  init() { 
    this.renderPersona();
    document.addEventListener('click', (e) => {
      const menu = document.getElementById('persona-dropdown');
      if (menu && menu.classList.contains('open') && !e.target.closest('.dropdown-container')) {
        menu.classList.remove('open');
      }
    });
    this.navigate('dashboard'); 
  }
};

// ============================================================
// Pages
// ============================================================
const Pages = {};

// ---- DASHBOARD ----
Pages.dashboard = function(c) {
  const s = Store.getStats();
  const logs = Store.getAuditLogs().slice(0, 8);
  const bookings = Store.getBookings().filter(b => b.booking_date === new Date().toISOString().split('T')[0]);
  c.innerHTML = `
    <div class="page-header"><div><div class="page-title">Dashboard</div><div class="page-subtitle">Real-time overview of your restaurant</div></div></div>
    <div class="stat-grid">
      ${statCard('green','Total Tables',s.totalTables,gridIcon)}
      ${statCard('green','Available',s.available,checkIcon)}
      ${statCard('red','Occupied',s.occupied,usersIcon)}
      ${statCard('blue','Reserved',s.reserved,clockIcon)}
      ${statCard('yellow','Cleaning',s.cleaning,sparkleIcon)}
      ${statCard('gray','Blocked',s.blocked,lockIcon)}
      ${statCard('purple','Today Bookings',s.todayBookings,calIcon)}
      ${statCard('blue','Upcoming',s.upcomingBookings,arrowIcon)}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <div class="card"><div class="card-header"><span class="card-title">Today's Bookings</span></div><div class="card-body" style="padding:0">
        ${bookings.length ? `<table class="data-table"><thead><tr><th>Code</th><th>Customer</th><th>Party</th><th>Time</th><th>Status</th></tr></thead><tbody>${bookings.map(b=>`<tr><td style="font-weight:600;font-size:12px">${b.booking_code}</td><td>${b.customer_name}</td><td>${b.party_size}</td><td>${b.start_time||'-'}</td><td>${App.badge(b.status)}</td></tr>`).join('')}</tbody></table>` : '<div class="empty-state"><p>No bookings today</p></div>'}
      </div></div>
      <div class="card"><div class="card-header"><span class="card-title">Recent Activity</span></div><div class="card-body">
        ${logs.length ? `<div class="activity-feed">${logs.map(l=>`<div class="activity-item"><div class="activity-icon" style="background:#F4F4F5"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52525B" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div><div class="activity-text"><strong>${l.actor_name}</strong> ${l.action.replace(/_/g,' ').toLowerCase()} <strong>${l.entity_type}</strong></div><div class="activity-time">${App.fmtDateTime(l.created_at)}</div></div></div>`).join('')}</div>` : '<div class="empty-state"><p>No activity yet</p></div>'}
      </div></div>
    </div>`;
};
const gridIcon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>';
const checkIcon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>';
const usersIcon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>';
const clockIcon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>';
const sparkleIcon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3v18M3 12h18"/></svg>';
const lockIcon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
const calIcon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>';
const arrowIcon='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>';
function statCard(color, label, value, icon) {
  return `<div class="stat-card"><div class="stat-icon ${color}">${icon}</div><div class="stat-label">${label}</div><div class="stat-value">${value}</div></div>`;
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', () => App.init());
