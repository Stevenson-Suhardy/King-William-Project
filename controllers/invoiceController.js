// Imports
const Invoice = require("../models/Invoice");

/**
 * Invoice View Logic
 * @param {*} req
 * @param {*} res
 */
const invoiceView = (req, res) => {
  const id = req.params.id;
  Invoice.findInvoiceById(id)
    .then(([rows]) => {
      if (rows.length > 0) {
        const checkInDate = rows[0].guest_stay_check_in_date;
        const checkOutDate = rows[0].guest_stay_check_out_date;

        const date1 = new Date(checkInDate);
        const date2 = new Date(checkOutDate);
        const diffTime = Math.abs(date2 - date1);
        // Check Out and Check In Dates Difference
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Calculate the total room price
        const roomPrice = parseFloat(rows[0].rm_base_rate * parseInt(diffDays));

        res.render("invoice", {
          pageTitle: "King William's - View Invoice",
          pageStyle: "/css/invoice.css",
          invoice: rows[0],
          transactions: rows,
          hasItems: rows[0].item_desc !== null,
          roomPricePerNight: rows[0].rm_base_rate,
          roomPrice: roomPrice,
          roomQuantity: `${diffDays} night(s)`,
          balancePenalty: parseFloat(rows[0].guest_stay_balance / 1.13),
          isCancelled: rows[0].guest_stay_is_cancelled,
        });
      } else {
        res
          .status(404)
          .send("Invoice not found. This guest has no transactions.");
      }
    })
    .catch((err) => res.status(500).send(err));
};

// Exports
module.exports = { invoiceView };
