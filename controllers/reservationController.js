// Imports
const Reservation = require("../models/Reservation");
const Room = require("../models/Room/Room");

/**
 * All Reservation View
 * @param {*} req
 * @param {*} res
 */
const allReservationView = (req, res) => {
  const criteria = req.query;
  const pageTitle = "King William's - Reservations";
  const pageStyle = "/css/reservation/all-reservations.css";

  Reservation.findByCriteria(criteria)
    .then(([rows]) => {
      res.render("reservation/all-reservations", {
        pageTitle: pageTitle,
        pageStyle: pageStyle,
        reservation: rows,
      });
    })
    .catch((err) => res.status(500).send(err));
};

/**
 * Add Reservation View
 * @param {*} req
 * @param {*} res
 */
const addReservationView = (req, res) => {
  const id = req.params.id;

  res.render("reservation/add-reservation", {
    pageTitle: "King William's - Add Reservation",
    pageStyle: "/css/reservation/add-reservation.css",
    guestId: id,
  });
};

/**
 * Choose Room View
 * @param {*} req
 * @param {*} res
 */
const chooseRoomView = (req, res) => {
  const id = req.params.id;
  const checkInDate = req.query.checkInDate;
  const checkOutDate = req.query.checkOutDate;

  // Checks the available rooms based on the check in and check out dates
  Reservation.findAvailableRooms(checkInDate, checkOutDate).then(
    ([availableRooms]) => {
      res.render("reservation/choose-room", {
        pageTitle: "King William's - Choose Room",
        pageStyle: "/css/reservation/choose-room.css",
        guestId: id,
        availableRooms: availableRooms,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
      });
    }
  );
};

/**
 * Add Reservation Logic
 * @param {*} req
 * @param {*} res
 */
const addReservation = async (req, res) => {
  try {
    const guestId = req.params.id;

    Room.getByFilters({ roomNumber: req.body.roomId }).then(async ([room]) => {
      const checkInDate = req.body.checkInDate;
      const checkOutDate = req.body.checkOutDate;

      const date1 = new Date(checkInDate);
      const date2 = new Date(checkOutDate);
      const diffTime = Math.abs(date2 - date1);
      // Check Out and Check In Dates Difference
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      // Calculate the total room price
      const roomPrice = parseFloat(room.rm_base_rate * parseInt(diffDays));

      // Create a new reservation
      const newReservation = {
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        balance: roomPrice * 1.13,
        isCancelled: 0,
        cancelledTime: null,
        guestId: guestId,
        roomId: req.body.roomId,
      };

      // Call a method to add the reservation
      await Reservation.addReservation(newReservation);

      // Redirect or send a response indicating success
      res.redirect("/reservation/all-reservations");
    });
  } catch (error) {
    console.error(error);
    // Handle errors and send an appropriate error response
    res.status(500).send(error.message);
  }
};

/**
 * Cancel Reservation Logic
 * @param {*} req
 * @param {*} res
 */
const cancelReservation = (req, res) => {
  const id = req.params.id;

  Reservation.findByCriteria({ guest_stay_id: id }).then(([rows]) => {
    if (rows.length > 0) {
      const date1 = new Date();
      const date2 = new Date(rows[0].guest_stay_check_in_date);
      const diffTime = Math.abs(date2 - date1);
      // Today's Date and Check In Dates Difference
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      Reservation.getCurrentBalance(id).then(([currentBalance]) => {
        let updatedBalance;

        // Calculate penalty
        if (diffDays <= 2) {
          updatedBalance = parseFloat(
            currentBalance[0].guest_stay_balance / parseFloat(2)
          );
        } else {
          updatedBalance = 0.0;
        }

        Reservation.updateBalance(updatedBalance, id).then(() => {
          Reservation.cancelReservation(id)
            .then(() => {
              res.redirect("/reservation/all-reservations");
            })
            .catch((err) => res.status(500).send(err));
        });
      });
    }
  });
};

/**
 * Edit Reservation View
 * @param {*} req
 * @param {*} res
 */
const editReservationView = (req, res) => {
  const id = req.params.id;
  const pageTitle = "King William's - Edit Reservation";
  const pageStyle = "/css/reservation/edit-reservation.css";

  Reservation.findByCriteria({ guest_stay_id: id })
    .then(([rows]) => {
      if (rows.length > 0) {
        res.render("reservation/edit-reservation", {
          pageTitle: pageTitle,
          pageStyle: pageStyle,
          reservation: rows[0],
        });
      } else {
        res.status(404).send("Reservation not found");
      }
    })
    .catch((err) => res.status(500).send(err));
};

/**
 * Edit Reservation Logic
 * @param {*} req
 * @param {*} res
 */
const editReservation = (req, res) => {
  const id = req.params.id;

  // Get the current balance of the reservation
  Reservation.getCurrentBalance(id).then(([currentBalance]) => {
    const updatedBalance = parseFloat(
      currentBalance[0].guest_stay_balance - parseFloat(req.body.balance)
    );
    // Update balance based on user input
    Reservation.updateBalance(updatedBalance, id)
      .then(() => {
        res.redirect("/reservation/all-reservations");
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send(err.message);
      });
  });
};

// Attach an 'uncaughtException' event handler to log uncaught exceptions
process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err);
  // Handle or log the uncaught exception here
});

// Exports
module.exports = {
  allReservationView,
  addReservationView,
  addReservation,
  chooseRoomView,
  cancelReservation,
  editReservationView,
  editReservation,
};
