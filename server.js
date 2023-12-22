/* istanbul ignore file */
require('dotenv').config();

const mongoose = require('mongoose');
const app = require('./app');

//connect db
const DB = process.env.DATABASE;

//mongoose connect db
mongoose.connect(DB).then(() => console.log('DB connection successful!'));

const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}......`);
});

//any promise error have not been handled yet
process.on('unhandledRejection', (error) => {
  console.log(error.name, error.message);
  console.log('UNHANDLED REJECTION. Shutdown....');
  server.close(() => {
    process.exit(1);
  });
});

//any bug in code but have not been handled yet
process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION. Shutdown....');
  console.log(err.name, err.message);
  process.exit(1);
});

module.exports = server;
