// ============================================================
// Mejaaa Store — LocalStorage Data Persistence Layer
// ============================================================
const Store = {
  KEYS: { rooms: 'mejaaa_rooms', tables: 'mejaaa_tables', bookings: 'mejaaa_bookings', audit: 'mejaaa_audit' },

  uuid() {
    return crypto.randomUUID ? crypto.randomUUID() :
      'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = Math.random() * 16 | 0;
        return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
      });
  },
  now() { return new Date().toISOString(); },

  _getAll(key) { try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; } },
  _save(key, data) { localStorage.setItem(key, JSON.stringify(data)); },
  _getById(key, id) { return this._getAll(key).find(i => i.id === id); },

  // ---- PERSONAS ----
  PERSONAS: [
    { id: 'owner', name: 'Pemilik Restoran', role: 'Pemilik', initials: 'PR' },
    { id: 'admin', name: 'Admin Sistem', role: 'Admin', initials: 'AS' },
    { id: 'manager', name: 'Manajer Lantai', role: 'Manajer', initials: 'ML' },
    { id: 'host', name: 'Resepsionis', role: 'Resepsionis', initials: 'RS' },
    { id: 'waiter', name: 'Staf Pelayanan', role: 'Pelayan', initials: 'SP' },
    { id: 'cleaner', name: 'Staf Kebersihan', role: 'Pembersih', initials: 'SK' },
    { id: 'customer', name: 'Tamu', role: 'Pelanggan', initials: 'TM' }
  ],
  getCurrentPersona() {
    const id = localStorage.getItem('mejaaa_persona') || 'admin';
    return this.PERSONAS.find(p => p.id === id) || this.PERSONAS[1];
  },
  setPersona(id) {
    localStorage.setItem('mejaaa_persona', id);
    const p = this.getCurrentPersona();
    this.logAudit('USER_ROLE_CHANGED', 'user', 'self', null, { role: id }, p.name);
  },


  // ---- ROOMS ----
  getRooms() { return this._getAll(this.KEYS.rooms).filter(r => !r._deleted); },
  getRoom(id) { return this._getById(this.KEYS.rooms, id); },
  createRoom(d) {
    const items = this._getAll(this.KEYS.rooms);
    const item = { id: this.uuid(), name: d.name, description: d.description || '', floor_number: d.floor_number || 1, type: d.type || 'indoor', status: d.status || 'active', layout_width: d.layout_width || 800, layout_height: d.layout_height || 600, created_at: this.now(), updated_at: this.now() };
    items.push(item); this._save(this.KEYS.rooms, items);
    this.logAudit('ROOM_CREATED', 'room', item.id, null, item);
    return item;
  },
  updateRoom(id, d) {
    const items = this._getAll(this.KEYS.rooms);
    const idx = items.findIndex(i => i.id === id); if (idx === -1) return null;
    const old = { ...items[idx] };
    Object.assign(items[idx], d, { updated_at: this.now() });
    this._save(this.KEYS.rooms, items);
    this.logAudit('ROOM_UPDATED', 'room', id, old, items[idx]);
    return items[idx];
  },
  deleteRoom(id) {
    const tables = this.getTables().filter(t => t.room_id === id);
    if (tables.length > 0) return { error: 'Cannot delete room with existing tables. Remove tables first.' };
    const items = this._getAll(this.KEYS.rooms);
    const item = items.find(i => i.id === id);
    this._save(this.KEYS.rooms, items.filter(i => i.id !== id));
    if (item) this.logAudit('ROOM_DELETED', 'room', id, item, null);
    return item;
  },

  // ---- TABLES ----
  getTables() { return this._getAll(this.KEYS.tables).filter(t => !t._deleted); },
  getTable(id) { return this._getById(this.KEYS.tables, id); },
  getTablesByRoom(roomId) { return this.getTables().filter(t => t.room_id === roomId); },
  createTable(d) {
    const items = this._getAll(this.KEYS.tables);
    const item = { id: this.uuid(), room_id: d.room_id, code: d.code, name: d.name || d.code, shape: d.shape || 'square', capacity_min: parseInt(d.capacity_min) || 2, capacity_max: parseInt(d.capacity_max) || 4, chair_count: parseInt(d.chair_count) || 4, status: 'available', x_position: d.x_position || 80 + Math.random() * 300, y_position: d.y_position || 80 + Math.random() * 200, width: d.width || 80, height: d.height || 80, rotation: d.rotation || 0, is_active: true, notes: d.notes || '', created_at: this.now(), updated_at: this.now() };
    items.push(item); this._save(this.KEYS.tables, items);
    this.logAudit('TABLE_CREATED', 'table', item.id, null, item);
    return item;
  },
  updateTable(id, d) {
    const items = this._getAll(this.KEYS.tables);
    const idx = items.findIndex(i => i.id === id); if (idx === -1) return null;
    const old = { ...items[idx] };
    Object.assign(items[idx], d, { updated_at: this.now() });
    this._save(this.KEYS.tables, items);
    const action = d.status && d.status !== old.status ? 'TABLE_STATUS_CHANGED' : 'TABLE_UPDATED';
    this.logAudit(action, 'table', id, old, items[idx]);
    return items[idx];
  },
  updateTablePosition(id, x, y) {
    const items = this._getAll(this.KEYS.tables);
    const idx = items.findIndex(i => i.id === id); if (idx === -1) return;
    const old = { x: items[idx].x_position, y: items[idx].y_position };
    items[idx].x_position = x; items[idx].y_position = y; items[idx].updated_at = this.now();
    this._save(this.KEYS.tables, items);
    this.logAudit('TABLE_MOVED', 'table', id, old, { x, y });
  },
  deleteTable(id) {
    const bk = this.getBookings().filter(b => b.assigned_table_id === id && !['cancelled','completed','no_show'].includes(b.status));
    if (bk.length > 0) return { error: 'Cannot delete table with active bookings.' };
    const items = this._getAll(this.KEYS.tables);
    const item = items.find(i => i.id === id);
    this._save(this.KEYS.tables, items.filter(i => i.id !== id));
    if (item) this.logAudit('TABLE_DELETED', 'table', id, item, null);
    return item;
  },

  // ---- BOOKINGS ----
  getBookings() { return this._getAll(this.KEYS.bookings).filter(b => !b._deleted); },
  getBooking(id) { return this._getById(this.KEYS.bookings, id); },
  createBooking(d) {
    const items = this._getAll(this.KEYS.bookings);
    const code = 'BK-' + Date.now().toString(36).toUpperCase();
    const item = { id: this.uuid(), booking_code: code, customer_name: d.customer_name, customer_phone: d.customer_phone || '', party_size: parseInt(d.party_size) || 2, booking_date: d.booking_date, start_time: d.start_time, end_time: d.end_time || '', duration_minutes: parseInt(d.duration_minutes) || 90, status: d.status || 'confirmed', channel: d.channel || 'admin', assigned_table_id: d.assigned_table_id || null, room_preference: d.room_preference || '', special_request: d.special_request || '', internal_notes: d.internal_notes || '', created_at: this.now(), updated_at: this.now() };
    items.push(item); this._save(this.KEYS.bookings, items);
    this.logAudit('BOOKING_CREATED', 'booking', item.id, null, item);
    // If table assigned, mark as reserved
    if (item.assigned_table_id) {
      this.updateTable(item.assigned_table_id, { status: 'reserved' });
    }
    return item;
  },
  updateBooking(id, d) {
    const items = this._getAll(this.KEYS.bookings);
    const idx = items.findIndex(i => i.id === id); if (idx === -1) return null;
    const old = { ...items[idx] };
    Object.assign(items[idx], d, { updated_at: this.now() });
    this._save(this.KEYS.bookings, items);
    const statusActions = { confirmed: 'BOOKING_CONFIRMED', checked_in: 'BOOKING_CHECKED_IN', seated: 'BOOKING_SEATED', completed: 'BOOKING_COMPLETED', cancelled: 'BOOKING_CANCELLED', no_show: 'BOOKING_NO_SHOW' };
    this.logAudit(statusActions[d.status] || 'BOOKING_UPDATED', 'booking', id, old, items[idx]);
    return items[idx];
  },

  // ---- AUDIT ----
  getAuditLogs() { return this._getAll(this.KEYS.audit); },
  logAudit(action, entityType, entityId, oldVal, newVal, actor = 'Admin') {
    const logs = this._getAll(this.KEYS.audit);
    logs.unshift({ id: this.uuid(), actor_name: actor, action, entity_type: entityType, entity_id: entityId, old_value: oldVal, new_value: newVal, channel: 'admin_dashboard', created_at: this.now() });
    if (logs.length > 500) logs.length = 500;
    this._save(this.KEYS.audit, logs);
  },

  // ---- STATS ----
  getStats() {
    const tables = this.getTables(), bookings = this.getBookings(), rooms = this.getRooms();
    const today = new Date().toISOString().split('T')[0];
    return {
      totalTables: tables.length, totalRooms: rooms.length,
      available: tables.filter(t => t.status === 'available').length,
      occupied: tables.filter(t => t.status === 'occupied').length,
      reserved: tables.filter(t => t.status === 'reserved').length,
      cleaning: tables.filter(t => t.status === 'cleaning').length,
      blocked: tables.filter(t => t.status === 'blocked').length,
      todayBookings: bookings.filter(b => b.booking_date === today).length,
      upcomingBookings: bookings.filter(b => b.booking_date > today && b.status === 'confirmed').length,
      totalBookings: bookings.length,
      noShows: bookings.filter(b => b.status === 'no_show').length,
    };
  },

  // ---- SEED ----
  seed() {
    if (this._getAll(this.KEYS.rooms).length > 0) return;
    const r1 = this.uuid(), r2 = this.uuid(), r3 = this.uuid(), r4 = this.uuid();
    const rooms = [
      { id: r1, name: 'Main Hall', description: 'Primary dining area', floor_number: 1, type: 'indoor', status: 'active', layout_width: 800, layout_height: 500, created_at: this.now(), updated_at: this.now() },
      { id: r2, name: 'VIP Room', description: 'Private VIP dining', floor_number: 1, type: 'vip', status: 'active', layout_width: 600, layout_height: 400, created_at: this.now(), updated_at: this.now() },
      { id: r3, name: 'Outdoor Terrace', description: 'Al fresco dining', floor_number: 1, type: 'outdoor', status: 'active', layout_width: 700, layout_height: 450, created_at: this.now(), updated_at: this.now() },
      { id: r4, name: 'Bar Area', description: 'Casual bar seating', floor_number: 1, type: 'bar', status: 'active', layout_width: 500, layout_height: 350, created_at: this.now(), updated_at: this.now() },
    ];
    this._save(this.KEYS.rooms, rooms);

    const today = new Date().toISOString().split('T')[0];
    const tables = [
      { id: this.uuid(), room_id: r1, code: 'A01', name: 'Table A01', shape: 'square', capacity_min: 2, capacity_max: 4, chair_count: 4, status: 'available', x_position: 60, y_position: 60, width: 80, height: 80, rotation: 0, is_active: true, notes: '', created_at: this.now(), updated_at: this.now() },
      { id: this.uuid(), room_id: r1, code: 'A02', name: 'Table A02', shape: 'square', capacity_min: 2, capacity_max: 4, chair_count: 4, status: 'occupied', x_position: 200, y_position: 60, width: 80, height: 80, rotation: 0, is_active: true, notes: '', created_at: this.now(), updated_at: this.now() },
      { id: this.uuid(), room_id: r1, code: 'A03', name: 'Table A03', shape: 'round', capacity_min: 4, capacity_max: 6, chair_count: 6, status: 'available', x_position: 340, y_position: 60, width: 90, height: 90, rotation: 0, is_active: true, notes: '', created_at: this.now(), updated_at: this.now() },
      { id: this.uuid(), room_id: r1, code: 'A04', name: 'Table A04', shape: 'rectangle', capacity_min: 4, capacity_max: 8, chair_count: 8, status: 'reserved', x_position: 60, y_position: 220, width: 160, height: 80, rotation: 0, is_active: true, notes: '', created_at: this.now(), updated_at: this.now() },
      { id: this.uuid(), room_id: r1, code: 'A05', name: 'Table A05', shape: 'round', capacity_min: 2, capacity_max: 2, chair_count: 2, status: 'cleaning', x_position: 340, y_position: 230, width: 70, height: 70, rotation: 0, is_active: true, notes: '', created_at: this.now(), updated_at: this.now() },
      { id: this.uuid(), room_id: r1, code: 'A06', name: 'Table A06', shape: 'square', capacity_min: 2, capacity_max: 4, chair_count: 4, status: 'available', x_position: 500, y_position: 60, width: 80, height: 80, rotation: 0, is_active: true, notes: '', created_at: this.now(), updated_at: this.now() },
      { id: this.uuid(), room_id: r2, code: 'VIP-01', name: 'VIP 1', shape: 'round', capacity_min: 4, capacity_max: 8, chair_count: 8, status: 'available', x_position: 80, y_position: 80, width: 110, height: 110, rotation: 0, is_active: true, notes: 'Premium', created_at: this.now(), updated_at: this.now() },
      { id: this.uuid(), room_id: r2, code: 'VIP-02', name: 'VIP 2', shape: 'rectangle', capacity_min: 6, capacity_max: 12, chair_count: 12, status: 'reserved', x_position: 300, y_position: 80, width: 180, height: 90, rotation: 0, is_active: true, notes: 'Large party', created_at: this.now(), updated_at: this.now() },
      { id: this.uuid(), room_id: r3, code: 'T-01', name: 'Terrace 1', shape: 'round', capacity_min: 2, capacity_max: 4, chair_count: 4, status: 'available', x_position: 80, y_position: 80, width: 80, height: 80, rotation: 0, is_active: true, notes: '', created_at: this.now(), updated_at: this.now() },
      { id: this.uuid(), room_id: r3, code: 'T-02', name: 'Terrace 2', shape: 'round', capacity_min: 2, capacity_max: 4, chair_count: 4, status: 'occupied', x_position: 250, y_position: 80, width: 80, height: 80, rotation: 0, is_active: true, notes: '', created_at: this.now(), updated_at: this.now() },
      { id: this.uuid(), room_id: r4, code: 'B-01', name: 'Bar 1', shape: 'square', capacity_min: 1, capacity_max: 2, chair_count: 2, status: 'available', x_position: 60, y_position: 60, width: 60, height: 60, rotation: 0, is_active: true, notes: '', created_at: this.now(), updated_at: this.now() },
      { id: this.uuid(), room_id: r4, code: 'B-02', name: 'Bar 2', shape: 'square', capacity_min: 1, capacity_max: 2, chair_count: 2, status: 'available', x_position: 160, y_position: 60, width: 60, height: 60, rotation: 0, is_active: true, notes: '', created_at: this.now(), updated_at: this.now() },
    ];
    this._save(this.KEYS.tables, tables);

    const bookings = [
      { id: this.uuid(), booking_code: 'BK-DEMO01', customer_name: 'Andi Pratama', customer_phone: '+6281234567890', party_size: 4, booking_date: today, start_time: '19:00', end_time: '20:30', duration_minutes: 90, status: 'confirmed', channel: 'whatsapp', assigned_table_id: tables[3].id, room_preference: 'Main Hall', special_request: 'Birthday celebration', internal_notes: '', created_at: this.now(), updated_at: this.now() },
      { id: this.uuid(), booking_code: 'BK-DEMO02', customer_name: 'Siti Rahayu', customer_phone: '+6287654321098', party_size: 2, booking_date: today, start_time: '12:00', end_time: '13:30', duration_minutes: 90, status: 'seated', channel: 'kiosk', assigned_table_id: tables[1].id, room_preference: '', special_request: '', internal_notes: '', created_at: this.now(), updated_at: this.now() },
      { id: this.uuid(), booking_code: 'BK-DEMO03', customer_name: 'Budi Santoso', customer_phone: '+6289012345678', party_size: 8, booking_date: today, start_time: '20:00', end_time: '22:00', duration_minutes: 120, status: 'confirmed', channel: 'admin', assigned_table_id: tables[7].id, room_preference: 'VIP Room', special_request: 'Corporate dinner', internal_notes: 'VIP client', created_at: this.now(), updated_at: this.now() },
    ];
    this._save(this.KEYS.bookings, bookings);
    this._save(this.KEYS.audit, []);
  },

  // Reset all data
  reset() {
    Object.values(this.KEYS).forEach(k => localStorage.removeItem(k));
    this.seed();
  }
};

// Initialize seed data on first load
Store.seed();
