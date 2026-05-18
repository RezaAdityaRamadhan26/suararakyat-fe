import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function seed() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'mysql',
    database: 'suara_rakyat_db',
  });

  const hash = await bcrypt.hash('password123', 10);

  const users = [
    { username: 'superadmin', role: 'super_admin' },
    { username: 'admin1', role: 'admin' },
    { username: 'user1', role: 'user' },
  ];

  for (const user of users) {
    // Check if exists
    const [rows] = await connection.execute('SELECT * FROM users WHERE username = ?', [user.username]);
    if (rows.length === 0) {
      await connection.execute('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [
        user.username,
        hash,
        user.role,
      ]);
      console.log(`Inserted ${user.username}`);
    } else {
      console.log(`User ${user.username} already exists`);
    }
  }

  await connection.end();
}

seed().catch(console.error);
