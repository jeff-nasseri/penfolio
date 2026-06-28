import bcrypt from 'bcryptjs';

export const hashPassword = (plain: string): string => bcrypt.hashSync(plain, 10);

export const verifyPassword = (plain: string, hash: string): boolean =>
  bcrypt.compareSync(plain, hash);
