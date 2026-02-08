const { Client } = require('pg');

async function checkColumn() {
  const client = new Client({
    connectionString: "postgresql://neondb_owner:npg_0T8lmzXvbfsZ@ep-young-salad-ahq8cs5y-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require"
  });

  try {
    await client.connect();
    console.log('Connected to database.');
    
    const query = `
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'SiteSettings' 
      AND column_name = 'adminProductMode';
    `;
    
    const res = await client.query(query);
    
    if (res.rows.length > 0) {
      console.log('SUCCESS: Column "adminProductMode" EXISTS in the database.');
    } else {
      console.log('FAILURE: Column "adminProductMode" DOES NOT EXIST in the database.');
    }
  } catch (err) {
    console.error('Database Error:', err.message);
  } finally {
    await client.end();
  }
}

checkColumn();
