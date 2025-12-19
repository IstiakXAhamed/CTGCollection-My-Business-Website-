// Script to list all tables in local SQLite database
const Database = require('better-sqlite3')

const db = new Database('./prisma/dev.db', { readonly: true })

try {
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name").all()
  
  console.log('=== TABLES IN LOCAL DATABASE ===')
  tables.forEach(t => console.log('- ' + t.name))
  console.log('=== TOTAL: ' + tables.length + ' tables ===')
  
} catch (error) {
  console.error('Error:', error.message)
} finally {
  db.close()
}
