import {
  hashPassword,
  verifyPassword,
} from '../../../../src/modules/sys/utils/passwordHash';

describe('passwordHash', () => {
  it('should verify correct password', async () => {
    const passwordHash = await hashPassword('admin123');

    expect(passwordHash.startsWith('scrypt$')).toBe(true);
    expect(passwordHash.length).toBeLessThanOrEqual(128);
    expect(passwordHash.split('$')[1]).toBe('14');
    expect(passwordHash).not.toBe('admin123');
    expect(await verifyPassword('admin123', passwordHash)).toBe(true);
  });

  it('should reject wrong password', async () => {
    const passwordHash = await hashPassword('admin123');

    expect(await verifyPassword('wrong-password', passwordHash)).toBe(false);
  });

  it('should reject invalid hash format', async () => {
    expect(await verifyPassword('admin123', 'admin123')).toBe(false);
  });

  it('should reject invalid scrypt params', async () => {
    expect(await verifyPassword('admin123', 'scrypt$x$8$1$salt$hash')).toBe(
      false
    );
  });
});
