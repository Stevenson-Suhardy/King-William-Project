// Imports
const Guest = require("../models/Guest/Guest");
const pool = require("../database");

/**
 * All Guest View
 * @param {*} req
 * @param {*} res
 */
const allGuestsView = (req, res) => {
  const criteria = req.query;
  Guest.findByCriteria(criteria)
    .then(([rows]) => {
      res.render("guest/all-guests", {
        pageTitle: "King William's - All Guests",
        pageStyle: "/css/guest/all-guests.css",
        guests: rows,
      });
    })
    .catch((err) => res.status(500).send(err));
};

/**
 * Edit Guest View
 * @param {*} req
 * @param {*} res
 */
const editGuestView = (req, res) => {
  const id = req.params.id;
  Guest.findById(id)
    .then(([rows]) => {
      if (rows.length > 0) {
        res.render("guest/edit-guest", {
          pageTitle: "King William's - Edit Guest",
          pageStyle: "/css/guest/edit-guest.css",
          guest: rows[0],
        });
      } else {
        res.status(404).send("Guest not found");
      }
    })
    .catch((err) => res.status(500).send(err));
};

/**
 * Edit Guest Logic
 * @param {*} req
 * @param {*} res
 */
const editGuest = (req, res) => {
  const id = req.params.id;
  const updateData = req.body;
  pool.getConnection((err, connection) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        res.status(500).send(err);
        return;
      }
      Guest.updateById(id, updateData, connection)
        .then(() => {
          connection.commit((err) => {
            if (err) {
              connection.rollback(() => {
                connection.release();
                res.status(500).send(err);
              });
            } else {
              connection.release();
              res.redirect("/guest/all-guests");
            }
          });
        })
        .catch((err) => {
          connection.rollback(() => {
            connection.release();
            res.status(500).send(err);
          });
        });
    });
  });
};

/**
 * Add Guest View
 * @param {*} req
 * @param {*} res
 */
const addGuestView = (req, res) => {
  const pageTitle = "King William's - Add Guest";
  const pageStyle = "/css/guest/add-guest.css";
  res.render("guest/add-guest", {
    pageTitle: pageTitle,
    pageStyle: pageStyle,
  });
};

/**
 * Add Guest Logic
 * @param {*} req
 * @param {*} res
 */
const addGuest = (req, res) => {
  const newGuestData = req.body;
  pool.getConnection((err, connection) => {
    if (err) {
      res.status(500).send(err);
      return;
    }
    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        res.status(500).send(err);
        return;
      }
      Guest.create(newGuestData, connection)
        .then(() => {
          connection.commit((err) => {
            if (err) {
              connection.rollback(() => {
                connection.release();
                res.status(500).send(err);
              });
            } else {
              connection.release();
              res.redirect("/guest/all-guests");
            }
          });
        })
        .catch((err) => {
          connection.rollback(() => {
            connection.release();
            res.status(500).send(err);
          });
        });
    });
  });
};

// Exports
module.exports = {
  allGuestsView,
  editGuestView,
  editGuest,
  addGuestView,
  addGuest,
};
