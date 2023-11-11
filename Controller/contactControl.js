const fs = require("fs");
const csv = require("csv-parser");
const { csvWriter } = require("../utils/csvwriter");
const findOneContact = async (req, res, next) => {
  const results = [];
  const username = req.body.username;
  if (!fs.existsSync(`./usersContacts/${username}contacts.csv`)) {
    return next({ statusCode: 400, message: "error file does not exist " });
  }
  fs.createReadStream(`./usersContacts/${username}contacts.csv`)
    .pipe(csv())
    .on("data", (data) => {
      const name = data.name;
  
      if (name.startsWith(req.params.contact)) {
        results.push(data);
      }
    })
    .on("end", () => {
      if (results == []) {
        res
          .status(200)
          .send({ message: `no contacts found with ${req.params.contact}` });
      } else {
        res.json(results);
      }
      // Send the parsed CSV data as a JSON response
    });
};

const findAllContacts = async (req, res, next) => {
  const results = [];
  
  const username = req.body.username;
  if (!fs.existsSync(`./usersContacts/${username}contacts.csv`)) {
    return next({
      statusCode: 500,
      message: "file does not exist",
      err: "internal server error",
    });
  }
  try {
    const results = [];

    fs.createReadStream(`./usersContacts/${username}contacts.csv`)
      .pipe(csv())
      .on("data", (data) => {
        if (Object.keys(data).length !== 0) {
          results.push(data);
        }
      })
      .on("end", () => {
        if (results.length === 0) {
          res.status(200).send({ message: "No contacts to show" });
        } else {
          res.json(results);
        }
      })
      .on("error", (err) => {
        console.error("Error reading the CSV file:", err);
        res.status(500).send({ message: "Internal server error" });
      });
  } catch (error) {
    console.error(
      "An error occurred outside the file reading operation:",
      error
    );
    next({ statusCode: 500, message: error.message });
  }
};

const createContact = async (req, res, next) => {
  const username = req.body.username;
  
  let flag = false;
  
  if (!fs.existsSync(`./usersContacts/${username}contacts.csv`)) {
    await csvWriter([{ name: "name", contact: "contact" }],username);
    csvWriter([{ name: req.body.name, contact: req.body.contact }],username)
      .then(() => {
        res.status(200).send("successfully saved contact");
      })
      .catch((err) => {
        res.status(400).send("error occured while saving contact " + err);
      });
  } else {
    console.log('working');
    let existcontact = { flag: false };
    fs.createReadStream(`./usersContacts/${username}contacts.csv`)
      .pipe(csv())
      .on("data", (row) => {
        if (row.name == req.body.name) {
          flag = true;
        } else if (row.contact == req.body.contact) {
          existcontact.name = row.name;
          existcontact.contact = row.contact;
          existcontact.flag = true;
        }
      })
      .on("end", () => {
        if (existcontact.flag) {
          return res
            .status(400)
            .send(
              `${existcontact.contact} already exist with the name ${existcontact.name}`
            );
        }
        if (flag) {
          res.status(400).send(`${req.body.name} already contact exist`);
        } else {
          csvWriter([{ name: req.body.name, contact: req.body.contact }],username)
            .then(() => {
              res.status(201).send("successfully saved contact");
            })
            .catch((err) => {
              res.status(400).send(`${err} error occured while saving contact`);
            });
        }
      })
      .on("error", (err) => {
        next({ statusCode: 500, message: `error occured ${err}` });
      });
  }
};

const updateOne = async (req, res, next) => {
  const username = req.body.username;
  if (!fs.existsSync(`./usersContacts/${username}contacts.csv`)) {
    return next({
      statusCode: 500,
      message: "file does not exist",
      err: "internal server error",
    });
  }
  const results = [];
  try {
    let flag = false;
    const filePath = `./usersContacts/${username}contacts.csv`;
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => {
        if (data.name == req.body.name && data != {}) {
          data.contact = req.body.contact;
          data.name=req.body.newName || data.name
          results.push(data);
          flag = true;
        } else if (data != 0) {
          results.push(data);
        }
      })
      .on("end", () => {
        if (flag) {
          fs.unlink(filePath, (err) => {
            if (err) {
              next({ statusCode: 500, message: err });
            } else {
              csvWriter([{ name: "name", contact: "contact" }],username);
              csvWriter(results,username)
                .then(() => {
                  res.status(200).send("updated successfully");
                })
                .catch((err) => {
                  console.error("error occured" + err);
                  next({ statusCode: 500, message: "err occured" + err });
                });
            }
          });
        } else {
          res.status(200).send("didn't find contact to update");
        }
      })
      .on("error", (err) => {
        console.error("Error reading the CSV file:", err);
        res.status(500).send({ message: "Internal server error" });
      });
  } catch (error) {
    console.error(
      "An error occurred outside the file reading operation:",
      error
    );
    next({ statusCode: 500, message: error.message });
  }
};
const deleteOneContact = async (req, res, next) => {
  const username = req.body.username;
  if (!fs.existsSync(`./usersContacts/${username}contacts.csv`)) {
    return next({
      statusCode: 500,
      message: "file does not exist",
      err: "internal server error",
    });
  }
  const results = [];
  try {
    let flag = false;

    fs.createReadStream(`./usersContacts/${username}contacts.csv`)
      .pipe(csv())
      .on("data", (data) => {
        if (data.name == req.body.name && data != 0) {
          flag = true;
        } else if (data != 0) {
          results.push(data);
        }
      })
      .on("end", () => {
        if (flag) {
          console.log(results);
          const filePath = `./usersContacts/${req.body.username}contacts.csv`;
          fs.unlink(filePath, (err) => {
            if (err) {
              next({ statusCode: 500, message: err });
            } else {
              csvWriter([{ name: "name", contact: "contacts" }],username);
              csvWriter(results,username)
                .then(() => {
                  res.status(200).send("deleted successfully");
                })
                .catch((err) => {
                  console.error("error occured" + err);
                  next({ statusCode: 500, message: "err occured" + err });
                });
            }
          });
        } else {
          res.status(200).send("didn't find contact to delete");
        }
      })
      .on("error", (err) => {
        console.error("Error reading the CSV file:", err);
        res.status(500).send({ message: "Internal server error" });
      });
  } catch (error) {
    console.error(
      "An error occurred outside the file reading operation:",
      error
    );
    next({ statusCode: 500, message: error.message });
  }
};

const deleteAllContacts = async (req, res, next) => {
  const filePath = `./usersContacts/${req.body.username}contacts.csv`;
  fs.unlink(filePath, (err) => {
    if (err) {
      next({ statusCode: 500, message: err });
    } else {
      res.status(200).send("deleted all");
    }
  });
};

module.exports = {
  findOneContact,
  findAllContacts,
  createContact,
  updateOne,
  deleteOneContact,
  deleteAllContacts,
};
