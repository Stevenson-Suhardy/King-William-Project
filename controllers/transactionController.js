// Imports
const Item = require("../models/Item");
const GuestTransaction = require("../models/Guest/GuestTransaction");
const Reservation = require("../models/Reservation");

/**
 * All Transactions View
 * @param {*} req
 * @param {*} res
 */
const allTransactionsView = (req, res) => {
  const pageTitle = "King William's - Transactions";
  const pageStyle = "/css/transaction/all-transactions.css";
  const filters = req.query;
  GuestTransaction.findTransaction(filters)
    .then(([rows]) => {
      res.render("transaction/all-transactions", {
        pageTitle: pageTitle,
        pageStyle: pageStyle,
        transaction: rows,
      });
    })
    .catch((err) => res.status(500).send(err));
};

/**
 * Add Transaction View
 * @param {*} req
 * @param {*} res
 */
const addTransactionView = (req, res) => {
  const pageTitle = "King William's - Add Transaction";
  const pageStyle = "/css/transaction/add-transaction.css";
  Item.findItems({}).then(([rows]) => {
    res.render("transaction/add-transaction", {
      pageTitle: pageTitle,
      pageStyle: pageStyle,
      items: rows,
    });
  });
};

/**
 * Add Transaction Logic
 * @param {*} req
 * @param {*} res
 */
const createTransactions = (req, res) => {
  Item.findItems({ item_id: req.body.item })
    .then(([rows]) => {
      const newTransaction = {
        guest_stay_id: req.body.guest_stay_id,
        item_id: req.body.item,
        guest_trans_item_quantity: req.body.guest_trans_item_quantity,
        guest_trans_price: rows[0].item_price,
      };

      GuestTransaction.createTransaction(newTransaction)
        .then(() => {
          // Get the current balance and update it after creating a new transaction
          Reservation.getCurrentBalance(req.body.guest_stay_id)
            .then(([currentBalance]) => {
              console.log(currentBalance);
              if (
                !currentBalance ||
                isNaN(parseFloat(currentBalance[0].guest_stay_balance))
              ) {
                throw new Error("Invalid current balance");
              }

              // Original balance including 13% tax
              const originalBalance =
                parseFloat(currentBalance[0].guest_stay_balance) / 1.13;

              // Transaction total without tax
              const transactionTotalWithoutTax =
                parseFloat(newTransaction.guest_trans_price) *
                parseFloat(newTransaction.guest_trans_item_quantity);

              // Add the transaction total without tax to the original balance
              const updatedBalanceWithoutTax =
                originalBalance + transactionTotalWithoutTax;

              // Add 13% tax to the updated balance
              const updatedBalance = updatedBalanceWithoutTax * 1.13;

              // Update the balance in the guest_stay table
              return Reservation.updateBalance(
                updatedBalance,
                req.body.guest_stay_id
              );
            })
            .then(() => res.redirect("/transaction/all-transactions"))
            .catch((err) => {
              console.error(err);
              res.status(500).send(err.message);
            });
        })
        .catch((err) => {
          console.error(err);
          res.status(500).send(err.message);
        });
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send(err.message);
    });
};

// Exports
module.exports = {
  allTransactionsView,
  addTransactionView,
  createTransactions,
};
