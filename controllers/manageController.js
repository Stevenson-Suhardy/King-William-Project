/**
 * Manage View
 * @param {*} req
 * @param {*} res
 */
const manageView = (req, res) => {
  const pageTitle = "King William's - Manage";
  const pageStyle = "/css/manage.css";
  res.render("manage", {
    pageTitle: pageTitle,
    pageStyle: pageStyle,
    isAdmin: req.session.username === "admin",
  });
};

// Exports
module.exports = { manageView };
