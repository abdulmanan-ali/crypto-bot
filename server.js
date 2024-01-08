const mongoose = require('mongoose');
const next = require('next');
const dotenv = require('dotenv');
const app = require('./app')

const dev = process.env.NODE_ENV || "production";
const nextServer = next({ dev });
const handle = nextServer.getRequestsHandler();

dotenv.config({ path: "./config.env" });

// Building Database Connection

const DB = process.env.DATABASE.replace("<PASSWORD>", process.env.DATABASE_PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    userCreateIndex: true,
    useFindAndModify: false
})