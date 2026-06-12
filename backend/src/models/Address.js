import { query } from '../config/db.js';

class Address {
  static async create(
    userId,
    { fullName, phone, addressLine1, addressLine2, city, state, postalCode, country },
    client = null
  ) {
    const executor = client ? client.query.bind(client) : query;
    const result = await executor(
      `INSERT INTO addresses (
        user_id, full_name, phone, address_line_1, address_line_2,
        city, state, postal_code, country
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *`,
      [
        userId,
        fullName.trim(),
        phone.trim(),
        addressLine1.trim(),
        addressLine2?.trim() || null,
        city.trim(),
        state.trim(),
        postalCode.trim(),
        country.trim(),
      ]
    );
    return result.rows[0];
  }
}

export default Address;
