const express = require("express");
const sqlite3 = require("sqlite3").verbose();

const PORT = process.env.PORT || 8081;

const app = express();

// DB Connection
const db = new sqlite3.Database(":memory", (err) => {
  if (err) {
    return console.log(err.message);
  }
  console.log(`connected to database`);
});

//Fetched country by countryName
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

// fetch country list
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

// API ENDPOINT country list
app.get("/contries", async (req, res) => {
  try {
    const contriesData = await getCountries();
    res.status(201).json(contriesData);
  } catch (err) {
    res.status(500).json(err);
  }
});

// GET COUNTRY BY ID
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
        rows.forEach((row) => {
          resp.countryId = row.country_id;
          resp.year = row.year;
          resp.category = row.category;
          resp.value = row.value;

          data.push({ ...resp });
        });
        resolve(data);
      }
    );
  });
};

// API ENDPOINT fetch country by id
app.get("/contry/:id", async (req, res) => {
  try {
    const { startYear, endYear } = req.query;
    const id = req.params.id;
    const resp = await getCountry(id, startYear, endYear);
    res.status(201).json(resp);
  } catch (err) {
    res.status(500).json(err);
  }
});

app.get("/", (req, res) => {
  res.send("WORKING");
});

app.listen(PORT, () => {
  console.log("Listening on PORT ", PORT);
});
