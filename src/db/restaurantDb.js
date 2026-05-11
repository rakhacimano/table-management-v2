import Dexie from 'dexie'

export const db = new Dexie('RestaurantTableManagementDB')

db.version(1).stores({
  rooms: 'id, name, status, floor_number',
  tables: 'id, room_id, code, status, shape',
  bookings: 'id, booking_code, customer_name, customer_phone, status, channel, booking_date',
  customers: 'id, name, phone',
  auditLogs: 'id, action, entity_type, entity_id, actor_name, created_at',
  settings: 'id'
})
