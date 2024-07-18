const express = require('express');
const app = express();
const OpenAI = require('openai');
const fspromises = require('fs').promises
const path = require('path')
const fs = require("fs")
require("dotenv").config()
const cors = require('cors'); // If you're also dealing with CORS issues
const router = require('./Routers/generateDayRouter');

// Middleware to parse JSON bodies

app.use(express.json());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "full-primal-ai.web.app"); // update to match the domain you will make the request from
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});
app.use(cors(
    {
        origin:'http://localhost:5173', 
        credentials:true,            //access-control-allow-credentials:true
        optionSuccessStatus:200
    } 
)); // If you need to handle CORS

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

app.use('/' , router);

const PORT = process.env.PORT;

app.listen(PORT , ()=>{
    console.log(`App is running on port ${PORT}`)
})
