const { randomBytes, scrypt } = require('node:crypto');
const { promisify } = require('node:util');
const { resolve } = require('node:path');
const dotenv = require('dotenv');
const mysql = require('mysql2/promise');

dotenv.config({
  path: [
    resolve(process.cwd(), '.env.local'),
    resolve(process.cwd(), '.env.production'),
  ],
});

const PASSWORD_HASH_ALGORITHM = 'scrypt';
const PASSWORD_HASH_KEY_LENGTH = 32;
const PASSWORD_HASH_SALT_LENGTH = 16;
const PASSWORD_HASH_COST = 14;
const PASSWORD_HASH_R = 8;
const PASSWORD_HASH_P = 1;

const scryptAsync = promisify(scrypt);

function isPasswordHash(password) {
  return String(password).startsWith(`${PASSWORD_HASH_ALGORITHM}$`);
}

async function hashPassword(password) {
  const salt = randomBytes(PASSWORD_HASH_SALT_LENGTH).toString('base64');
  const hash = await scryptAsync(password, salt, PASSWORD_HASH_KEY_LENGTH, {
    N: 2 ** PASSWORD_HASH_COST,
    r: PASSWORD_HASH_R,
    p: PASSWORD_HASH_P,
  });
  return [
    PASSWORD_HASH_ALGORITHM,
    PASSWORD_HASH_COST,
    PASSWORD_HASH_R,
    PASSWORD_HASH_P,
    salt,
    hash.toString('base64'),
  ].join('$');
}

async function main() {
  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT),
    user: process.env.MYSQL_USERNAME,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
  });

  const [users] = await connection.query(
    "SELECT id, password FROM sys_user WHERE password NOT LIKE 'scrypt$%'"
  );

  let migratedCount = 0;
  for (const user of users) {
    if (isPasswordHash(user.password)) {
      continue;
    }

    const passwordHash = await hashPassword(user.password);
    await connection.execute('UPDATE sys_user SET password = ? WHERE id = ?', [
      passwordHash,
      user.id,
    ]);
    migratedCount += 1;
  }

  await connection.end();
  console.log(`sys_user password migrated: ${migratedCount}`);
}

main().catch(error => {
  console.error('sys_user password migration failed:', error.message);
  process.exitCode = 1;
});
