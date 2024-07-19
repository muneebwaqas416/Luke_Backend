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


app.use(cors({
  origin : ["https://full-primal-ai.web.app"],
  methods : ["POST"],
  credentials : true
}));
app.use(express.json());
console.log(process.env.OPENAI_API_KEY);
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

app.use('/' , router);

const PORT = process.env.PORT;

app.listen(PORT , ()=>{
    console.log(`App is running on port ${PORT}`)
})
