const pool = require("../../database");

class Employee {
  /**
   * Add Employee
   * @param {*} newEmployee
   * @returns
   */
  static add(newEmployee) {
    return new Promise((resolve, reject) => {
      const query = `
          INSERT INTO employee (
            emp_fname, emp_lname, emp_hire_date, emp_street, emp_city, emp_country,
            emp_postal_code, emp_email, emp_phone, emp_is_permanent, position_id
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
      const values = [
        newEmployee.firstName,
        newEmployee.lastName,
        newEmployee.hiredDate,
        newEmployee.street,
        newEmployee.city,
        newEmployee.country,
        newEmployee.postalCode,
        newEmployee.email,
        newEmployee.phone,
        newEmployee.employmentType === "permanent" ? 1 : 0,
        newEmployee.positionId,
      ];

      pool.query(query, values, (err, results) => {
        if (err) reject(err);
        else resolve(results.insertId);
      });
    });
  }

  /**
   * Find employee by criteria
   * @param {*} criteria
   * @returns
   */
  static findByCriteria(criteria) {
    let query = `
        SELECT 
          employee.*, 
          position.position_desc
        FROM 
          employee
        LEFT JOIN 
          position ON employee.position_id = position.position_id
      `;
    let conditions = [];
    let values = [];

    Object.keys(criteria).forEach((key) => {
      if (criteria[key] && criteria[key] !== "Any") {
        conditions.push(`employee.${key} = ?`);
        values.push(criteria[key]);
      }
    });

    if (conditions.length) {
      query += " WHERE " + conditions.join(" AND ");
    }

    return pool.promise().query(query, values);
  }

  /**
   * Update Employee by ID
   * @param {*} id
   * @param {*} updateData
   * @param {*} connection
   * @returns
   */
  static updateById(id, updateData, connection) {
    let query = "UPDATE employee SET ";
    let updates = [];
    let values = [];

    Object.keys(updateData).forEach((key) => {
      if (updateData[key]) {
        updates.push(`${key} = ?`);
        values.push(updateData[key]);
      }
    });

    query += updates.join(", ") + " WHERE emp_id = ?";
    values.push(id);

    return connection.promise().query(query, values);
  }
}

module.exports = Employee;
