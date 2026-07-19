import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const PASSWORD_HASH_ALGORITHM = 'scrypt';
const PASSWORD_HASH_KEY_LENGTH = 32;
const PASSWORD_HASH_SALT_LENGTH = 16;
const PASSWORD_HASH_COST = 14;
const PASSWORD_HASH_R = 8;
const PASSWORD_HASH_P = 1;
const PASSWORD_HASH_PART_COUNT = 6;
const PASSWORD_HASH_MIN_COST = 2;

const scryptAsync = promisify(scrypt) as (
  password: string,
  salt: string,
  keylen: number,
  options: { N: number; r: number; p: number }
) => Promise<Buffer>;

export const isPasswordHash = (value: string) =>
  value.startsWith(`${PASSWORD_HASH_ALGORITHM}$`);

/**
 * 生成后台管理员密码哈希
 */
export async function hashPassword(password: string) {
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

/**
 * 校验后台管理员密码哈希
 */
export async function verifyPassword(password: string, passwordHash: string) {
  const parts = passwordHash.split('$');
  if (
    parts.length !== PASSWORD_HASH_PART_COUNT ||
    parts[0] !== PASSWORD_HASH_ALGORITHM
  ) {
    return false;
  }

  const [, n, r, p, salt, storedHash] = parts;
  const cost = Number(n);
  const blockSize = Number(r);
  const parallelization = Number(p);
  if (
    !Number.isInteger(cost) ||
    !Number.isInteger(blockSize) ||
    !Number.isInteger(parallelization) ||
    cost < PASSWORD_HASH_MIN_COST ||
    blockSize <= 0 ||
    parallelization <= 0 ||
    !salt ||
    !storedHash
  ) {
    return false;
  }

  const key = Buffer.from(storedHash, 'base64');
  const hash = await scryptAsync(password, salt, key.length, {
    N: 2 ** cost,
    r: blockSize,
    p: parallelization,
  });

  return key.length === hash.length && timingSafeEqual(key, hash);
}
