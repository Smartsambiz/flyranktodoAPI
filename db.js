
require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});


async function initDb() {
  
  try {
    const res = await pool.query(
      `CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        done BOOLEAN DEFAULT FALSE
      )`
    );
    

    const { rows } = await pool.query('SELECT COUNT(*) FROM tasks');
    if(parseInt(rows[0].count, 10) === 0){
      await pool.query(
        `INSERT INTO tasks (title, done) VALUES
      ('Sample Task 1', false),
      ('Sample Task 2', true),
      ('Sample Task 3', false)`
      )
      console.log('Sample tasks inserted into the database.');
    }

  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  } 
}





module.exports = {
  query: (text, params) => pool.query(text, params),
  initDb,
};
