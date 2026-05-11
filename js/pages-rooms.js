// Mejaaa — Rooms & Tables Pages
Pages.rooms = function(c) {
  const rooms = Store.getRooms();
  c.innerHTML = `
    <div class="page-header">
      <div><div class="page-title">Rooms & Floors</div><div class="page-subtitle">Manage your restaurant areas</div></div>
      <button class="btn btn-primary" onclick="Pages.roomModal()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Room</button>
    </div>
    <div class="card"><div class="data-table-wrap"><table class="data-table"><thead><tr>
      <th>Name</th><th>Type</th><th>Floor</th><th>Tables</th><th>Status</th><th>Created</th><th style="width:100px">Actions</th>
    </tr></thead><tbody>
      ${rooms.length ? rooms.map(r => {
        const tc = Store.getTablesByRoom(r.id).length;
        return `<tr>
          <td><strong>${r.name}</strong><br><span style="font-size:11px;color:var(--text-muted)">${r.description||''}</span></td>
          <td><span style="text-transform:capitalize">${r.type}</span></td>
          <td>${r.floor_number}</td>
          <td>${tc} tables</td>
          <td>${App.badge(r.status)}</td>
          <td style="font-size:12px;color:var(--text-muted)">${App.fmtDate(r.created_at)}</td>
          <td><div style="display:flex;gap:4px">
            <button class="btn btn-ghost btn-sm btn-icon" onclick="Pages.roomModal('${r.id}')" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
            <button class="btn btn-ghost btn-sm btn-icon" onclick="Pages.deleteRoom('${r.id}')" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
          </div></td>
        </tr>`;
      }).join('') : '<tr><td colspan="7"><div class="empty-state"><h3>No rooms yet</h3><p>Create your first room to get started</p></div></td></tr>'}
    </tbody></table></div></div>`;
};

Pages.roomModal = function(id) {
  const r = id ? Store.getRoom(id) : null;
  const title = r ? 'Edit Room' : 'Create Room';
  const body = `
    <div class="form-group"><label class="form-label">Room Name *</label><input class="form-input" id="rm-name" value="${r?r.name:''}" placeholder="e.g. Main Hall"></div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Type</label><select class="form-select" id="rm-type">
        ${['indoor','outdoor','vip','bar','private','other'].map(t=>`<option value="${t}" ${r&&r.type===t?'selected':''}>${t}</option>`).join('')}
      </select></div>
      <div class="form-group"><label class="form-label">Floor Number</label><input class="form-input" id="rm-floor" type="number" value="${r?r.floor_number:1}" min="1"></div>
    </div>
    <div class="form-group"><label class="form-label">Status</label><select class="form-select" id="rm-status">
      ${['active','inactive','maintenance'].map(s=>`<option value="${s}" ${r&&r.status===s?'selected':''}>${s}</option>`).join('')}
    </select></div>
    <div class="form-group"><label class="form-label">Description</label><textarea class="form-textarea" id="rm-desc" placeholder="Optional description">${r?r.description:''}</textarea></div>`;
  const footer = `<button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="Pages.saveRoom('${id||''}')">Save</button>`;
  App.openModal(title, body, footer);
};

Pages.saveRoom = function(id) {
  const name = document.getElementById('rm-name').value.trim();
  if (!name) { App.toast('Room name is required', 'error'); return; }
  const data = { name, type: document.getElementById('rm-type').value, floor_number: parseInt(document.getElementById('rm-floor').value)||1, status: document.getElementById('rm-status').value, description: document.getElementById('rm-desc').value.trim() };
  if (id) Store.updateRoom(id, data); else Store.createRoom(data);
  App.closeModal(); App.toast(id ? 'Room updated' : 'Room created'); App.render();
};

Pages.deleteRoom = function(id) {
  App.confirm('Are you sure you want to delete this room?', () => {
    const result = Store.deleteRoom(id);
    if (result && result.error) { App.toast(result.error, 'error'); return; }
    App.toast('Room deleted'); App.render();
  });
};

// ---- TABLES ----
Pages.tables = function(c) {
  const tables = Store.getTables();
  const rooms = Store.getRooms();
  c.innerHTML = `
    <div class="page-header">
      <div><div class="page-title">Tables</div><div class="page-subtitle">Manage all dining tables</div></div>
      <div style="display:flex;gap:8px">
        <select class="form-select" id="tbl-filter-room" onchange="Pages.filterTables()" style="width:160px;padding:6px 10px;font-size:12px">
          <option value="">All Rooms</option>${rooms.map(r=>`<option value="${r.id}">${r.name}</option>`).join('')}
        </select>
        <select class="form-select" id="tbl-filter-status" onchange="Pages.filterTables()" style="width:140px;padding:6px 10px;font-size:12px">
          <option value="">All Status</option>${['available','occupied','reserved','cleaning','blocked','out_of_service'].map(s=>`<option value="${s}">${s.replace(/_/g,' ')}</option>`).join('')}
        </select>
        <button class="btn btn-primary" onclick="Pages.tableModal()"><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> Add Table</button>
      </div>
    </div>
    <div class="card"><div class="data-table-wrap"><table class="data-table"><thead><tr>
      <th>Code</th><th>Room</th><th>Shape</th><th>Chairs</th><th>Capacity</th><th>Status</th><th>Notes</th><th style="width:120px">Actions</th>
    </tr></thead><tbody id="tables-tbody">
      ${Pages._renderTableRows(tables)}
    </tbody></table></div></div>`;
};

Pages._renderTableRows = function(tables) {
  if (!tables.length) return '<tr><td colspan="8"><div class="empty-state"><h3>No tables found</h3></div></td></tr>';
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
        ${['available','occupied','reserved','cleaning','blocked','out_of_service'].map(s=>`<option value="${s}" ${t.status===s?'selected':''}>${s.replace(/_/g,' ')}</option>`).join('')}
      </select>
      <button class="btn btn-ghost btn-sm btn-icon" onclick="Pages.tableModal('${t.id}')" title="Edit"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg></button>
      <button class="btn btn-ghost btn-sm btn-icon" onclick="Pages.deleteTable('${t.id}')" title="Delete"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg></button>
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
  App.toast(`Table status → ${status.replace(/_/g,' ')}`);
};

Pages.tableModal = function(id) {
  const t = id ? Store.getTable(id) : null;
  const title = t ? 'Edit Table' : 'Create Table';
  const body = `
    <div class="form-row">
      <div class="form-group"><label class="form-label">Table Code *</label><input class="form-input" id="tb-code" value="${t?t.code:''}" placeholder="e.g. A01"></div>
      <div class="form-group"><label class="form-label">Room *</label><select class="form-select" id="tb-room">${App.roomOpts(t?t.room_id:'')}</select></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Shape</label><select class="form-select" id="tb-shape">
        ${['square','round','rectangle','oval','booth'].map(s=>`<option value="${s}" ${t&&t.shape===s?'selected':''}>${s}</option>`).join('')}
      </select></div>
      <div class="form-group"><label class="form-label">Chairs</label><input class="form-input" id="tb-chairs" type="number" value="${t?t.chair_count:4}" min="1"></div>
    </div>
    <div class="form-row">
      <div class="form-group"><label class="form-label">Min Capacity</label><input class="form-input" id="tb-capmin" type="number" value="${t?t.capacity_min:2}" min="1"></div>
      <div class="form-group"><label class="form-label">Max Capacity</label><input class="form-input" id="tb-capmax" type="number" value="${t?t.capacity_max:4}" min="1"></div>
    </div>
    <div class="form-group"><label class="form-label">Notes</label><textarea class="form-textarea" id="tb-notes" placeholder="Internal notes">${t?t.notes:''}</textarea></div>`;
  const footer = `<button class="btn btn-secondary" onclick="App.closeModal()">Cancel</button><button class="btn btn-primary" onclick="Pages.saveTable('${id||''}')">Save</button>`;
  App.openModal(title, body, footer);
};

Pages.saveTable = function(id) {
  const code = document.getElementById('tb-code').value.trim();
  const room_id = document.getElementById('tb-room').value;
  if (!code || !room_id) { App.toast('Code and room are required', 'error'); return; }
  const data = { code, name: code, room_id, shape: document.getElementById('tb-shape').value, chair_count: parseInt(document.getElementById('tb-chairs').value)||4, capacity_min: parseInt(document.getElementById('tb-capmin').value)||2, capacity_max: parseInt(document.getElementById('tb-capmax').value)||4, notes: document.getElementById('tb-notes').value.trim() };
  if (id) Store.updateTable(id, data); else Store.createTable(data);
  App.closeModal(); App.toast(id ? 'Table updated' : 'Table created'); App.render();
};

Pages.deleteTable = function(id) {
  App.confirm('Are you sure you want to delete this table?', () => {
    const result = Store.deleteTable(id);
    if (result && result.error) { App.toast(result.error, 'error'); return; }
    App.toast('Table deleted'); App.render();
  });
};
