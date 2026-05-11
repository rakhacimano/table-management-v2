// Mejaaa — Rooms & Tables Pages
Pages.rooms = function(c) {
  const rooms = Store.getRooms();
  c.innerHTML = `
    <div class="page-header">
      <div><div class="page-title">Ruangan & Lantai</div><div class="page-subtitle">Kelola area restoran Anda</div></div>
      <button class="btn btn-primary" onclick="Pages.roomModal()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Tambah Ruangan</button>
    </div>
    <div class="card"><div class="data-table-wrap"><table class="data-table"><thead><tr>
      <th>Nama</th><th>Tipe</th><th>Lantai</th><th>Meja</th><th>Status</th><th>Dibuat</th><th style="width:100px">Aksi</th>
    </tr></thead><tbody>
      ${rooms.length ? rooms.map(r => {
        const tc = Store.getTablesByRoom(r.id).length;
        return `<tr>
          <td><strong>${r.name}</strong><br><span style="font-size:11px;color:var(--text-muted)">${r.description||''}</span></td>
          <td><span style="text-transform:capitalize">${r.type}</span></td>
          <td>${r.floor_number}</td>
          <td>${tc} meja</td>
          <td>${App.badge(r.status)}</td>
          <td style="font-size:12px;color:var(--text-muted)">${App.fmtDate(r.created_at)}</td>
          <td><div style="display:flex;gap:4px">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="Pages.roomModal('${r.id}')" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="Pages.deleteRoom('${r.id}')" title="Hapus"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div></td>
        </tr>`;
      }).join('') : '<tr><td colspan="7"><div class="empty-state"><h3>Belum ada ruangan</h3><p>Buat ruangan pertama Anda untuk memulai</p></div></td></tr>'}
    </tbody></table></div></div>`;
};

Pages.roomModal = function(id) {
  const r = id ? Store.getRoom(id) : null;
  const title = r ? 'Edit Ruangan' : 'Buat Ruangan';
  const body = `
    <div class="form-group"><label class="form-label">Nama Ruangan *</label><input class="form-input" id="rm-name" value="${r?r.name:''}" placeholder="cth. Aula Utama"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Tipe</label><select class="form-select" id="rm-type">
        ${['indoor','outdoor','vip','bar','private','other'].map(t=>`<option value="${t}" ${r&&r.type===t?'selected':''}>${t}</option>`).join('')}
      </select></div>
      <div class="form-group"><label class="form-label">Lantai</label><input class="form-input" id="rm-floor" type="number" value="${r?r.floor_number:1}" min="1"></div>
    </div>
    <div class="form-group"><label class="form-label">Status</label><select class="form-select" id="rm-status">
      ${['active','inactive','maintenance'].map(s=>`<option value="${s}" ${r&&r.status===s?'selected':''}>${s}</option>`).join('')}
    </select></div>
    <div class="form-group"><label class="form-label">Deskripsi</label><textarea class="form-textarea" id="rm-desc" placeholder="Deskripsi opsional">${r?r.description:''}</textarea></div>`;
  const footer = `<button class="btn btn-secondary" onclick="App.closeModal()">Batal</button><button class="btn btn-primary" onclick="Pages.saveRoom('${id||''}')">Simpan</button>`;
  App.openModal(title, body, footer);
};

Pages.saveRoom = function(id) {
  const name = document.getElementById('rm-name').value.trim();
  if (!name) { App.toast('Nama ruangan wajib diisi', 'error'); return; }
  const data = { name, type: document.getElementById('rm-type').value, floor_number: parseInt(document.getElementById('rm-floor').value)||1, status: document.getElementById('rm-status').value, description: document.getElementById('rm-desc').value.trim() };
  if (id) Store.updateRoom(id, data); else Store.createRoom(data);
  App.closeModal(); App.toast(id ? 'Ruangan diperbarui' : 'Ruangan dibuat'); App.render();
};

Pages.deleteRoom = function(id) {
  App.confirm('Apakah Anda yakin ingin menghapus ruangan ini?', () => {
    const result = Store.deleteRoom(id);
    if (result && result.error) { App.toast(result.error, 'error'); return; }
    App.toast('Ruangan dihapus'); App.render();
  });
};

// ---- TABLES ----
Pages.tables = function(c) {
  const tables = Store.getTables();
  const rooms = Store.getRooms();
  c.innerHTML = `
    <div class="page-header">
      <div><div class="page-title">Meja</div><div class="page-subtitle">Kelola semua meja makan</div></div>
      <div style="display:flex;gap:8px">
        <select class="form-select" id="tbl-filter-room" onchange="Pages.filterTables()" style="width:160px;padding:6px 10px;font-size:12px">
          <option value="">Semua Ruangan</option>${rooms.map(r=>`<option value="${r.id}">${r.name}</option>`).join('')}
        </select>
        <select class="form-select" id="tbl-filter-status" onchange="Pages.filterTables()" style="width:140px;padding:6px 10px;font-size:12px">
          <option value="">Semua Status</option>${['available','occupied','reserved','cleaning','blocked','out_of_service'].map(s=>{const smap={available:'Tersedia',occupied:'Terisi',reserved:'Dipesan',cleaning:'Dibersihkan',blocked:'Diblokir',out_of_service:'Rusak'};return `<option value="${s}">${smap[s]||s}</option>`;}).join('')}
        </select>
        <button class="btn btn-primary" onclick="Pages.tableModal()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Tambah Meja</button>
      </div>
    </div>
    <div class="card"><div class="data-table-wrap"><table class="data-table"><thead><tr>
      <th>Kode</th><th>Ruangan</th><th>Bentuk</th><th>Kursi</th><th>Kapasitas</th><th>Status</th><th>Catatan</th><th style="width:120px">Aksi</th>
    </tr></thead><tbody id="tables-tbody">
      ${Pages._renderTableRows(tables)}
    </tbody></table></div></div>`;
};

Pages._renderTableRows = function(tables) {
  if (!tables.length) return '<tr><td colspan="8"><div class="empty-state"><h3>Tidak ada meja</h3></div></td></tr>';
  return tables.map(t => `<tr data-room="${t.room_id}" data-status="${t.status}">
    <td><strong>${t.code}</strong></td>
    <td>${App.roomName(t.room_id)}</td>
    <td style="text-transform:capitalize">${t.shape}</td>
    <td>${t.chair_count}</td>
    <td>${t.capacity_min}-${t.capacity_max}</td>
    <td>${App.badge(t.status)}</td>
    <td style="font-size:12px;color:var(--text-muted);max-width:120px;overflow:hidden;text-overflow:ellipsis">${t.notes||'-'}</td>
    <td><div style="display:flex;gap:4px">
      <select class="form-select" style="padding:4px 6px;font-size:11px;width:90px" onchange="Pages.quickStatus('${t.id}',this.value)">
        ${['available','occupied','reserved','cleaning','blocked','out_of_service'].map(s=>{const smap={available:'Tersedia',occupied:'Terisi',reserved:'Dipesan',cleaning:'Dibersihkan',blocked:'Diblokir',out_of_service:'Rusak'};return `<option value="${s}" ${t.status===s?'selected':''}>${smap[s]||s}</option>`;}).join('')}
      </select>
      <button class="btn btn-ghost btn-sm btn-icon" onclick="Pages.tableModal('${t.id}')" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      <button class="btn btn-ghost btn-sm btn-icon" onclick="Pages.deleteTable('${t.id}')" title="Hapus"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
    </div></td>
  </tr>`).join('');
};

Pages.filterTables = function() {
  const room = document.getElementById('tbl-filter-room').value;
  const status = document.getElementById('tbl-filter-status').value;
  let tables = Store.getTables();
  if (room) tables = tables.filter(t => t.room_id === room);
  if (status) tables = tables.filter(t => t.status === status);
  document.getElementById('tables-tbody').innerHTML = Pages._renderTableRows(tables);
};

Pages.quickStatus = function(id, status) {
  Store.updateTable(id, { status });
  const smap={available:'Tersedia',occupied:'Terisi',reserved:'Dipesan',cleaning:'Dibersihkan',blocked:'Diblokir',out_of_service:'Rusak'};
  App.toast(`Status meja → ${smap[status]||status}`);
};

Pages.tableModal = function(id) {
  const t = id ? Store.getTable(id) : null;
  const title = t ? 'Edit Meja' : 'Buat Meja';
  const body = `
    <div class="form-row">
      <div class="form-group"><label class="form-label">Kode Meja *</label><input class="form-input" id="tb-code" value="${t?t.code:''}" placeholder="cth. A01"></div>
      <div class="form-group"><label class="form-label">Ruangan *</label><select class="form-select" id="tb-room">${App.roomOpts(t?t.room_id:'')}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Bentuk</label><select class="form-select" id="tb-shape">
        ${['square','round','rectangle','oval','booth'].map(s=>`<option value="${s}" ${t&&t.shape===s?'selected':''}>${s}</option>`).join('')}
      </select></div>
      <div class="form-group"><label class="form-label">Kursi</label><input class="form-input" id="tb-chairs" type="number" value="${t?t.chair_count:4}" min="1"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Kap. Min</label><input class="form-input" id="tb-capmin" type="number" value="${t?t.capacity_min:2}" min="1"></div>
      <div class="form-group"><label class="form-label">Kap. Maks</label><input class="form-input" id="tb-capmax" type="number" value="${t?t.capacity_max:4}" min="1"></div>
    </div>
    <div class="form-group"><label class="form-label">Catatan</label><textarea class="form-textarea" id="tb-notes" placeholder="Catatan internal">${t?t.notes:''}</textarea></div>`;
  const footer = `<button class="btn btn-secondary" onclick="App.closeModal()">Batal</button><button class="btn btn-primary" onclick="Pages.saveTable('${id||''}')">Simpan</button>`;
  App.openModal(title, body, footer);
};

Pages.saveTable = function(id) {
  const code = document.getElementById('tb-code').value.trim();
  const room_id = document.getElementById('tb-room').value;
  if (!code || !room_id) { App.toast('Kode dan ruangan wajib diisi', 'error'); return; }
  const data = { code, name: code, room_id, shape: document.getElementById('tb-shape').value, chair_count: parseInt(document.getElementById('tb-chairs').value)||4, capacity_min: parseInt(document.getElementById('tb-capmin').value)||2, capacity_max: parseInt(document.getElementById('tb-capmax').value)||4, notes: document.getElementById('tb-notes').value.trim() };
  if (id) Store.updateTable(id, data); else Store.createTable(data);
  App.closeModal(); App.toast(id ? 'Meja diperbarui' : 'Meja dibuat'); App.render();
};

Pages.deleteTable = function(id) {
  App.confirm('Apakah Anda yakin ingin menghapus meja ini?', () => {
    const result = Store.deleteTable(id);
    if (result && result.error) { App.toast(result.error, 'error'); return; }
    App.toast('Meja dihapus'); App.render();
  });
};
