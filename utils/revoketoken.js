const csv = require("csv-parser");
const createCsvWriter = require("csv-writer").createObjectCsvWriter;
const fs = require("fs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
async function revokeTokens(res,token, refreshToken, next) {
  let decode = jwt.decode(token, process.env.secretKey);
  const username = decode.username;
  if (!fs.existsSync(`./tokenrevoke/${username}tokens.csv`)) {
    const data = [{ token: token, refreshtoken: refreshToken }]; // Fixed typo in refreshtoken
    const csvWriter = createCsvWriter({
      path: `./tokenrevoke/${username}tokens.csv`,
      header: [
        { id: "token", title: "Token" },
        { id: "refreshtoken", title: "RefreshToken" }, // Corrected title
      ],
      append: true,
    });
    await csvWriter.writeRecords([
      { token: "Token", refreshtoken: "RefreshToken" },
    ]);
    await csvWriter.writeRecords(data);
    res.clearCookie("token");
    res.clearCookie("refreshtoken");
    return "success";
  } else {
    const prom = new Promise((reso, rej) => {
      const readstream = fs.createReadStream(
        `./tokenrevoke/${username}tokens.csv`,
        "utf-8"
      );
      let found = false;

      readstream
        .pipe(csv())
        .on("data", (row) => {
          if (row.Token == token && row.RefreshToken == refreshToken) {
            found = true;
          }
        })
        .on("end", () => {
          if (found) {
            rej("Tokens already revoked");
          } else {
            reso(true);
          }
        })
        .on("error", (err) => {
          rej(err);
        });
    });

    try {
      const result = await prom;

      if (result) {
        const data = [{ token: token, refreshtoken: refreshToken }]; // Fixed typo in refreshtoken
        const csvWriter = createCsvWriter({
          path: `./tokenrevoke/${username}tokens.csv`,
          header: [
            { id: "token", title: "Token" },
            { id: "refreshtoken", title: "RefreshToken" }, // Corrected title
          ],
          append: true,
        });

        await csvWriter.writeRecords(data);
        res.clearCookie("token");
        res.clearCookie("refreshtoken");
        return "success";
      } else {
        next({ statusCode: 400, message: "Tokens already revoked" });
      }
    } catch (err) {
      next({ statusCode: 500, message: err });
    }
  }
}
exports.revokeTokens = revokeTokens;
