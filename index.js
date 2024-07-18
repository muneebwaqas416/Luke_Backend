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
app.use(cors(
    {
        origin : "*",
        credentials : true 
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
