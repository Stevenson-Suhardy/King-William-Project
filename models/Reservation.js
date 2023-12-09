const pool = require("../database");

class Reservation {
  // Return rows that matches the criteria. This is used for search functionality.
  static findByCriteria(criteria) {
    let query =
      "SELECT * FROM guest_stay inner join guest on guest_stay.guest_id=guest.guest_id inner join room on guest_stay.rm_id=room.rm_id";
    let conditions = [];
    let values = [];

    Object.keys(criteria).forEach((key) => {
      if (criteria[key]) {
        conditions.push(`${key} = ?`);
        values.push(criteria[key]);
      }
    });

    if (conditions.length) {
      query += " WHERE " + conditions.join(" AND ");
    }

    return pool.promise().query(query, values);
  }

  // Insert
  static addReservation(newReservation) {
    return new Promise((resolve, reject) => {
      let query = `INSERT INTO guest_stay 
                 (guest_stay_check_in_date, guest_stay_check_out_date, guest_stay_balance, 
                  guest_stay_is_cancelled, guest_stay_cancelled_time, guest_id, rm_id) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;

      const values = [
        newReservation.checkInDate,
        newReservation.checkOutDate,
        newReservation.balance,
        newReservation.isCancelled,
        newReservation.cancelledTime,
        newReservation.guestId,
        newReservation.roomId,
      ];
      pool.query(query, values, (err, results) => {
        if (err) reject(err);
        else resolve(results.insertId);
      });
    });
  }

  static findAvailableRooms(checkInDate, checkOutDate) {
    return pool.promise().query(
      `SELECT * FROM room LEFT JOIN room_category ON room.rm_category_id = room_category.rm_category_id WHERE rm_id NOT IN 
      (SELECT rm_id FROM guest_stay 
      WHERE guest_stay_check_in_date <= ? AND guest_stay_check_out_date >= ? AND guest_stay_is_cancelled = 0)`,
      [checkOutDate, checkInDate]
    );
  }

  static cancelReservation(id) {
    return pool
      .promise()
      .query(
        "UPDATE guest_stay SET guest_stay_is_cancelled = 1, guest_stay_cancelled_time = current_timestamp WHERE guest_stay_id = ?",
        [id]
      );
  }

  static getCurrentBalance(stay_id) {
    return pool
      .promise()
      .query(
        `SELECT guest_stay_balance FROM guest_stay WHERE guest_stay_id = ?`,
        [stay_id]
      );
  }

  static updateBalance(updatedBalance, stay_id) {
    return pool
      .promise()
      .query(
        `UPDATE guest_stay SET guest_stay_balance = ? WHERE guest_stay_id = ?`,
        [updatedBalance, stay_id]
      );
  }
}

module.exports = Reservation;
