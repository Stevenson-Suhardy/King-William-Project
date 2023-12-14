// Imports
const Handlebars = require("handlebars");
const { options } = require("./routes/route");

// Helper Functions
Handlebars.registerHelper("formatDate", function (date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
});

Handlebars.registerHelper("formatDateTime", function (datetime) {
  const year = datetime.getFullYear();
  const month = String(datetime.getMonth() + 1).padStart(2, "0");
  const day = String(datetime.getDate()).padStart(2, "0");
  let hour = String(datetime.getHours()).padStart(2, "0");
  const minute = String(datetime.getMinutes()).padStart(2, "0");

  var sAMPM = "AM";

  var iHourCheck = parseInt(hour);

  if (iHourCheck > 12) {
    sAMPM = "PM";
    hour = iHourCheck - 12;
  } else if (iHourCheck === 0) {
    hour = "12";
  }

  return `${year}-${month}-${day} ${hour}:${minute} ${sAMPM}`;
});

Handlebars.registerHelper("convertToYesNo", function (value) {
  return value === 1 ? "Yes" : "No";
});

Handlebars.registerHelper("calculateTotal", function (quantity, price) {
  const numericQuantity = parseFloat(quantity);
  const numericPrice = parseFloat(price);

  if (!isNaN(numericQuantity) && !isNaN(numericPrice)) {
    const total = numericQuantity * numericPrice;
    return "$" + total.toFixed(2);
  }

  return "$0.00";
});

Handlebars.registerHelper(
  "calculateSubtotal",
  function (transactions, roomPrice) {
    let subtotal = 0;

    transactions.forEach((transaction) => {
      const total =
        parseFloat(transaction.guest_trans_item_quantity) *
        parseFloat(transaction.guest_trans_price);
      subtotal += isNaN(total) ? 0 : total;
    });

    subtotal += parseFloat(roomPrice);

    return subtotal.toFixed(2);
  }
);

Handlebars.registerHelper("calculateTax", function (subtotal, taxRate) {
  // Ensure subtotal and taxRate are numeric values
  const numericSubtotal = parseFloat(subtotal);
  const numericTaxRate = parseFloat(taxRate);

  if (isNaN(numericSubtotal) || isNaN(numericTaxRate)) {
    return "$0.00"; // or handle the error as needed
  }

  const Tax = numericSubtotal * taxRate;

  // Format the result as $$.$$
  return Tax.toFixed(2);
});

Handlebars.registerHelper("calculateGrandtotal", function (subtotal, tax) {
  // Ensure subtotal and taxRate are numeric values
  const numericSubtotal = parseFloat(subtotal);
  const numericTax = parseFloat(tax);

  if (isNaN(numericSubtotal) || isNaN(numericTax)) {
    return "error"; // or handle the error as needed
  }

  const grandTotal = numericSubtotal + numericTax;

  // Format the result as $$.$$
  return grandTotal.toFixed(2);
});

Handlebars.registerHelper("formatCurrency", function (value) {
  // Convert value to a number using parseFloat
  const numericValue = parseFloat(value);

  // Check if numericValue is a valid number
  if (!isNaN(numericValue)) {
    // Format as currency with two decimal places
    return "$" + numericValue.toFixed(2);
  }

  // If the value is not a valid number, return an empty string or handle the error as needed
  return "";
});

Handlebars.registerHelper("ifCond", function (v1, operator, v2, options) {
  switch (operator) {
    case "==":
      return v1 == v2 ? options.fn(this) : options.inverse(this);
    case "===":
      return v1 === v2 ? options.fn(this) : options.inverse(this);
    case "!=":
      return v1 != v2 ? options.fn(this) : options.inverse(this);
    case "!==":
      return v1 !== v2 ? options.fn(this) : options.inverse(this);
    case "<":
      return v1 < v2 ? options.fn(this) : options.inverse(this);
    case "<=":
      return v1 <= v2 ? options.fn(this) : options.inverse(this);
    case ">":
      return v1 > v2 ? options.fn(this) : options.inverse(this);
    case ">=":
      return v1 >= v2 ? options.fn(this) : options.inverse(this);
    case "&&":
      return v1 && v2 ? options.fn(this) : options.inverse(this);
    case "||":
      return v1 || v2 ? options.fn(this) : options.inverse(this);
    default:
      return options.inverse(this);
  }
});

Handlebars.registerHelper(
  "canBeCancelled",
  function (checkInDate, isCancelled, options) {
    const today = new Date();
    const checkIn = new Date(checkInDate);

    if (isCancelled === 1) {
      return options.inverse(this);
    } else {
      if (today < checkIn) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    }
  }
);
