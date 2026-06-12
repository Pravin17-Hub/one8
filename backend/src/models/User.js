import { query } from '../config/db.js';
import bcrypt from 'bcrypt';

const PUBLIC_FIELDS =
  'id, email, first_name, last_name, phone, role, profile_image, created_at';

class User {
  static async findByEmail(email) {
    const result = await query('SELECT * FROM users WHERE email = $1', [
      email.toLowerCase().trim(),
    ]);
    return result.rows[0];
  }

  static async findById(id) {
    const result = await query(
      `SELECT ${PUBLIC_FIELDS} FROM users WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  }

  static async create({ email, password, firstName, lastName, role = 'CUSTOMER' }) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    const result = await query(
      'INSERT INTO users (email, password_hash, first_name, last_name, role) VALUES ($1, $2, $3, $4, $5) RETURNING id, email, first_name, last_name, role, created_at',
      [email, passwordHash, firstName, lastName, role]
    );
    const user = result.rows[0];

    // If seller, auto-create a store
    if (role === 'SELLER') {
      const storeName = `${firstName}'s Store`;
      await query(
        'INSERT INTO stores (owner_id, name) VALUES ($1, $2)',
        [user.id, storeName]
      );
    }

    return user;
  }

  static async saveRefreshToken(userId, tokenHash, expiresAt) {
    await query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)`,
      [userId, tokenHash, expiresAt]
    );
  }

  static async findRefreshToken(tokenHash) {
    const result = await query(
      `SELECT rt.*, u.id AS user_id, u.email, u.role
       FROM refresh_tokens rt
       JOIN users u ON u.id = rt.user_id
       WHERE rt.token_hash = $1 AND rt.expires_at > NOW()`,
      [tokenHash]
    );
    return result.rows[0];
  }

  static async deleteRefreshToken(tokenHash) {
    await query('DELETE FROM refresh_tokens WHERE token_hash = $1', [tokenHash]);
  }

  static async deleteAllRefreshTokens(userId) {
    await query('DELETE FROM refresh_tokens WHERE user_id = $1', [userId]);
  }

  static async updateProfile(id, { firstName, lastName, phone }) {
    const result = await query(
      `UPDATE users
       SET first_name = COALESCE($2, first_name),
           last_name = COALESCE($3, last_name),
           phone = COALESCE($4, phone),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
       RETURNING ${PUBLIC_FIELDS}`,
      [id, firstName?.trim() || null, lastName?.trim() || null, phone?.trim() || null]
    );
    return result.rows[0];
  }
}

export default User;
