// Imports
const express = require("express");
const exphbs = require("express-handlebars");
const dotenv = require("dotenv");
const path = require("path");
const helper = require("./helper");

const session = require("express-session");

dotenv.config({ path: "./process.env" });

// Application Configuration
const PORT = process.env.PORT || 5000;

const app = express();

const unless = (path, middleware) => {
  return (req, res, next) => {
    if (path === req.path) {
      return next();
    } else {
      return middleware(req, res, next);
    }
  };
};

app.engine(
  "hbs",
  exphbs.engine({
    defaultLayout: "main",
    partialsDir: "views/partials",
    extname: ".hbs",
  })
);
app.set("view engine", ".hbs");
app.set("views", "views");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

app.use(
  unless("/login", (req, res, next) => {
    if (req.session.username) {
      next();
    } else {
      res.redirect("/login");
    }
  })
);

app.use("/", require("./routes/route"));

app.use((req, res, next) => {
  res.locals.formatDate = helper.formatDate;
  next();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
