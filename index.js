// IMPORTS
// ===============================================================================
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require('compression');
const moment_tz = require('moment-timezone');
const db = require('./db');


// EXPRESS JS
// ===============================================================================

// CONST
const app = express();

// SET
app.use(cors());
app.use(express.json({
    limit:'10mb' //UPLOAD IMAGE
}));
app.use(helmet()); //A lvl 2 helmet
app.use(compression()); //Compress all routes

// APP HOMEs
// ===============================================================================
const project_alias = 'v1';
app.get('/', (req, res)=>{
    res.send("pong");
});
app.get(`/${project_alias}/`, (req, res)=>{
    res.send({
        project_name :"econolabcore_backend",
        greetings: "👋 from econolab",
        info: {
            current_time: moment_tz().toLocaleString() 
        }
    });
});

// ===============================================================================
// ROUTES
// ===============================================================================

// ROUTE IMPORT [3RD PARTY ROUTE]
//------------------------------------------------------------------------

// ROUTE IMPORT [DEV]
//------------------------------------------------------------------------
const r_task = require('./requests');

// ROUTE IMPLEMENTATION
const main_route_dev = "/v1";

app.use(`${main_route_dev}/task`, r_task);

// ROUTE IMPORT [VERSION 1]
//------------------------------------------------------------------------

// EXPORTS
// ===============================================================================
module.exports = app;
