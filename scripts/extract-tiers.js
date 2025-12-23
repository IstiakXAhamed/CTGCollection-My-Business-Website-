// Script to extract loyalty tiers from local PostgreSQL database
const { Client } = require('pg')

const client = new Client({
  connectionString: 'postgresql://postgres:Sanim9944@localhost:5432/ctgcollection'
})

async function extractTiers() {
  try {
    await client.connect()
    console.log('Connected to local PostgreSQL!')
    
    const result = await client.query('SELECT * FROM "LoyaltyTier" ORDER BY "sortOrder"')
    
    console.log('=== LOYALTY TIERS FROM LOCAL POSTGRESQL ===')
    console.log(JSON.stringify(result.rows, null, 2))
    console.log('=== TOTAL: ' + result.rows.length + ' tiers found ===')
    
  } catch (error) {
    console.error('Error:', error.message)
  } finally {
    await client.end()
  }
}

extractTiers()
