const knex = require("knex");

const knex = require("knex")({
  client: "sqlite3",
  connection: {
    filename: "../database.db",
  },
});

const GetCountryList = () => {
  return new Promise((resolve, reject) => {});
};

module.exports = {
  GetCountryList,
};
