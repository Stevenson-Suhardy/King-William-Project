const pool = require("../../database");

class GuestTransaction {
  static createTransaction(newTransaction) {
    return new Promise((resolve, reject) => {
      const query = `INSERT INTO guest_transaction (guest_trans_date, guest_trans_price, 
            guest_trans_item_quantity, item_id, guest_stay_id) VALUES (current_timestamp, ?, ?, ?, ?)`;

      console.log(newTransaction);

      const values = [
        newTransaction.guest_trans_price,
        newTransaction.guest_trans_item_quantity,
        newTransaction.item_id,
        newTransaction.guest_stay_id,
      ];

      console.log(values);

      pool.query(query, values, (err, results) => {
        if (err) reject(err);
        else resolve(results.insertId);
      });
    });
  }

  static findTransaction(filters) {
    let query = `SELECT guest_trans_id, guest_trans_date, guest_trans_price, item_desc, guest_trans_item_quantity, 
                        guest_stay_id
                      FROM guest_transaction gt
                      INNER JOIN item i ON gt.item_id = i.item_id`;

    let conditions = [];
    let values = [];

    Object.keys(filters).forEach((key) => {
      if (filters[key]) {
        conditions.push(`${key} = ?`);
        values.push(filters[key]);
      }
    });

    if (conditions.length) {
      query += " WHERE " + conditions.join(" AND ");
    }

    return pool.promise().query(query, values);
  }
}

module.exports = GuestTransaction;
