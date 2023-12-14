/**
 * Login View
 * @param {*} req
 * @param {*} res
 * @returns
 */
const loginView = (req, res) => {
  const pageTitle = "Login";
  const pageStyle = "/css/login.css";
  if (req.session.username) {
    res.redirect("/");
    return;
  }
  res.render("login", {
    pageTitle: pageTitle,
    pageStyle: pageStyle,
  });
};

/**
 * Login Logic
 * @param {*} req
 * @param {*} res
 */
const login = (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (
    (username === "admin" && password === "admin") ||
    (username === "employee" && password === "employee")
  ) {
    req.session.username = username;
    res.redirect("/");
  } else {
    res.redirect("/login");
  }
};

// Exports
module.exports = { loginView, login };
