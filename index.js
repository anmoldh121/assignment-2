const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const PORT = 8081;

const app = express();
const db = new sqlite3.Database(":memory", (err) => {
  if (err) {
    return console.log(err.message);
  }
  console.log(`connected to database`);
});

const getcontryData = (countryName) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT MAX(year), MIN(year), country_id
        FROM countries WHERE country_or_area="${countryName}"`,
      (err, row) => {
        if (err) {
          reject(err);
        }
        let countryData = {};
        console.log(row);
        row.forEach((el) => {
          countryData.maxYear = el["MAX(year)"];
          countryData.minYear = el["MIN(year)"];
          countryData.id = el.country_id;
        });
        resolve({ [countryName]: { ...countryData } });
      }
    );
  });
};

const getCountries = () => {
  return new Promise((resolve, reject) => {
    let resp = [];
    db.all(
      `SELECT DISTINCT country_or_area FROM countries`,
      async (err, data) => {
        if (err) {
          console.log(err);
        }
        await Promise.all(data.map((c) => getcontryData(c.country_or_area)))
          .then((resp) => {
            resolve(resp);
          })
          .catch((err) => {
            reject(err);
          });
      }
    );
  });
};

app.get("/contries", async (req, res) => {
  try {
    const contriesData = await getCountries();
    console.log(contriesData);
    res.status(201).json(contriesData);
  } catch (err) {}
});

const getCountry = (id, startYear, endYear) => {
  return new Promise((resolve, reject) => {
    db.all(
      `SELECT * FROM countries WHERE country_id="${id}" AND year>=${startYear} AND year<=${endYear}`,
      (err, rows) => {
        if (err) {
          console.log(err);
          reject(err);
        }
        let resp = {};
        let data = [];
        console.log(rows);
        rows.forEach((row) => {
          resp.countryId = row.country_id;
          resp.year = row.year;
          resp.category = row.category;
          resp.value = row.value;

          data.push({...resp})
        });
        resolve(data);
      }
    );
  });
};

app.get("/contry/:id", async (req, res) => {
  try {
    const { startYear, endYear } = req.query;
    const id = req.params.id;
    const resp = await getCountry(id, startYear, endYear);
    res.status(201).json(resp);
  } catch (err) {}
});



app.listen(PORT, () => {
  console.log("Listening on PORT ", PORT);
});
