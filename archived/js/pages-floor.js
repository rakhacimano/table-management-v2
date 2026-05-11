// Mejaaa — Floor Plan Page
Pages.floorplan = function(c) {
  const rooms = Store.getRooms();
  const selRoom = Pages._fpRoom || (rooms[0] ? rooms[0].id : '');
  Pages._fpRoom = selRoom;
  const tables = selRoom ? Store.getTablesByRoom(selRoom) : [];
  const room = Store.getRoom(selRoom);
  const cW = room ? room.layout_width : 800;
  const cH = room ? room.layout_height : 500;

  const role = Store.getCurrentPersona().id;
  const isAdmin = ['owner', 'admin', 'manager'].includes(role);
  const isCustomer = role === 'customer';

  c.innerHTML = `
    <div class="page-header">
      <div>
        <div class="page-title">${isCustomer ? 'Selamat datang di Mejaaa' : 'Denah Lantai'}</div>
        <div class="page-subtitle">${isCustomer ? 'Pilih ruangan dan klik meja yang tersedia untuk memesan.' : 'Tata letak visual meja ' + (isAdmin ? '— seret meja untuk mengubah posisi' : '')}</div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        ${isAdmin ? `<button class="btn btn-secondary btn-sm" onclick="Pages.tableModal()"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Tambah Meja</button>` : ''}
        ${isCustomer ? `<div class="dropdown-container" style="position:relative;z-index:100"><button class="btn btn-ghost btn-sm" onclick="App.togglePersonaDropdown(event)">Ganti Peran (Demo)</button><div class="dropdown-menu" style="width:200px;right:0;left:auto;top:calc(100% + 4px);bottom:auto;text-align:left;"></div></div>` : ''}
      </div>
    </div>
    <div class="card floor-plan-container">
      <div class="floor-plan-toolbar">
        <span style="font-size:12px;font-weight:600;color:var(--text-secondary);margin-right:8px">Ruangan:</span>
        ${rooms.map(r => `<button class="btn btn-sm ${r.id===selRoom?'btn-primary':'btn-secondary'}" onclick="Pages._fpRoom='${r.id}';App.render()">${r.name}</button>`).join('')}
        <span style="flex:1"></span>
        <span style="font-size:11px;color:var(--text-muted)">${tables.length} meja</span>
      </div>
      <div class="floor-plan-canvas" id="fp-canvas" style="width:${cW}px;height:${cH}px;min-width:100%">
        ${tables.map(t => {
          const w = t.width || 80, h = t.height || 80;
          return `<div class="floor-table" data-id="${t.id}" data-shape="${t.shape}" data-status="${t.status}"
            style="left:${t.x_position}px;top:${t.y_position}px;width:${w}px;height:${h}px"
            onmousedown="${isAdmin ? `Pages.fpDragStart(event,'${t.id}')` : ''}" onclick="Pages.fpSelect('${t.id}')">
            <span class="table-code">${t.code}</span>
            <span class="table-chairs">${t.chair_count} kursi</span>
          </div>`;
        }).join('')}
        <div class="table-detail-panel" id="fp-detail"></div>
      </div>
      <div class="status-legend">
        <div class="legend-item"><div class="legend-dot" style="background:var(--status-available)"></div>Tersedia</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--status-occupied)"></div>Terisi</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--status-reserved)"></div>Dipesan</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--status-cleaning)"></div>Dibersihkan</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--status-blocked)"></div>Diblokir</div>
        <div class="legend-item"><div class="legend-dot" style="background:var(--status-out)"></div>Rusak</div>
      </div>
    </div>`;
};

Pages._fpRoom = null;
Pages._dragging = null;
Pages._dragOffset = { x: 0, y: 0 };

Pages.fpDragStart = function(e, id) {
  if (e.button !== 0) return;
  e.preventDefault();
  const el = e.currentTarget;
  const canvas = document.getElementById('fp-canvas');
  const rect = canvas.getBoundingClientRect();
  Pages._dragging = { id, el };
  Pages._dragOffset = { x: e.clientX - el.offsetLeft - rect.left + canvas.scrollLeft, y: e.clientY - el.offsetTop - rect.top + canvas.scrollTop };
  el.classList.add('dragging');

  const onMove = (ev) => {
    const r = canvas.getBoundingClientRect();
    let x = ev.clientX - r.left + canvas.scrollLeft - Pages._dragOffset.x;
    let y = ev.clientY - r.top + canvas.scrollTop - Pages._dragOffset.y;
    x = Math.max(0, Math.min(x, canvas.scrollWidth - el.offsetWidth));
    y = Math.max(0, Math.min(y, canvas.scrollHeight - el.offsetHeight));
    // Snap to 10px grid
    x = Math.round(x / 10) * 10;
    y = Math.round(y / 10) * 10;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
  };
  const onUp = () => {
    el.classList.remove('dragging');
    const x = parseInt(el.style.left);
    const y = parseInt(el.style.top);
    Store.updateTablePosition(id, x, y);
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    Pages._dragging = null;
  };
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
};

Pages.fpSelect = function(id) {
  if (Pages._dragging) return;
  const t = Store.getTable(id);
  if (!t) return;
  document.querySelectorAll('.floor-table').forEach(el => el.classList.remove('selected'));
  const el = document.querySelector(`.floor-table[data-id="${id}"]`);
  if (el) el.classList.add('selected');

  const role = Store.getCurrentPersona().id;
  const isAdmin = ['owner', 'admin', 'manager'].includes(role);
  const isCleaner = role === 'cleaner';
  const isCustomer = role === 'customer';

  if (isCustomer) {
    if (t.status === 'available') {
      Pages.customerBookingModal(id);
    } else {
      App.toast('Meja ini sedang tidak tersedia.', 'error');
    }
    return;
  }

  const panel = document.getElementById('fp-detail');
  const booking = Store.getBookings().find(b => b.assigned_table_id === id && !['cancelled','completed','no_show'].includes(b.status));
  panel.innerHTML = `
    <div class="detail-header">
      <strong style="font-size:15px">${t.code}</strong>
      <button class="modal-close" onclick="document.getElementById('fp-detail').classList.remove('open');document.querySelectorAll('.floor-table').forEach(e=>e.classList.remove('selected'))">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="detail-body">
      <div class="detail-row"><span class="detail-label">Ruangan</span><span class="detail-value">${App.roomName(t.room_id)}</span></div>
      <div class="detail-row"><span class="detail-label">Bentuk</span><span class="detail-value" style="text-transform:capitalize">${t.shape}</span></div>
      <div class="detail-row"><span class="detail-label">Kursi</span><span class="detail-value">${t.chair_count}</span></div>
      <div class="detail-row"><span class="detail-label">Kapasitas</span><span class="detail-value">${t.capacity_min}-${t.capacity_max}</span></div>
      <div class="detail-row"><span class="detail-label">Status</span><span class="detail-value">${App.badge(t.status)}</span></div>
      ${booking ? `<div style="margin-top:12px;padding:10px;background:var(--bg-tertiary);border-radius:var(--radius-sm)">
        <div style="font-size:11px;font-weight:600;color:var(--text-muted);margin-bottom:6px">RESERVASI SAAT INI</div>
        <div style="font-size:13px;font-weight:600">${booking.customer_name}</div>
        <div style="font-size:12px;color:var(--text-secondary)">${booking.party_size} tamu · ${booking.start_time}</div>
      </div>` : ''}
      ${t.notes ? `<div style="margin-top:8px;font-size:12px;color:var(--text-muted)">Catatan: ${t.notes}</div>` : ''}
    </div>
    <div class="detail-actions">
      <label class="form-label" style="margin-bottom:4px">Ubah Status</label>
      <select class="form-select" onchange="Pages.fpChangeStatus('${t.id}',this.value)" style="font-size:12px" ${isCleaner && t.status !== 'cleaning' ? 'disabled' : ''}>
        ${['available','occupied','reserved','cleaning','blocked','out_of_service'].map(s=>{const smap={available:'Tersedia',occupied:'Terisi',reserved:'Dipesan',cleaning:'Dibersihkan',blocked:'Diblokir',out_of_service:'Rusak'};return `<option value="${s}" ${t.status===s?'selected':''} ${isCleaner && s !== 'available' && s !== 'cleaning' ? 'disabled' : ''}>${smap[s]||s}</option>`;}).join('')}
      </select>
      ${isAdmin ? `<button class="btn btn-secondary btn-sm" onclick="Pages.tableModal('${t.id}')" style="margin-top:4px">Edit Meja</button>` : ''}
    </div>`;
  panel.classList.add('open');
};

Pages.fpChangeStatus = function(id, status) {
  Store.updateTable(id, { status });
  const smap={available:'Tersedia',occupied:'Terisi',reserved:'Dipesan',cleaning:'Dibersihkan',blocked:'Diblokir',out_of_service:'Rusak'};
  App.toast(`Status → ${smap[status]||status}`);
  App.render();
};
