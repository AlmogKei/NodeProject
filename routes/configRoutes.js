const indexR = require("./index");
const toysR = require("./toys");
const usersR = require("./users");

exports.routesInit = (app) => {
  // הגדרת ראוטים לאיזה ראוטר הם שייכים
  app.use("/", indexR);
  app.use("/toys", toysR);
  app.use("/users", usersR);

}