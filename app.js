const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser=require('cookie-parser')
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser())
//Auth Routes
const authRoutes = require("./routes/authRoute");
app.use("/auth", authRoutes);

//Contact Crud Routes
const contactRoutes=require('./routes/ContactRoute')
app.use('/api',contactRoutes)
//when route not found
app.use((req, res, next) => {
  res.status(404).json({ error: `Route not found: ${req.originalUrl}` });
});
//errorhandling
const { errorhandling } = require("./error_handler/error_handling");
app.use(errorhandling);

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Express server is running on http://localhost:${port}`);
});
