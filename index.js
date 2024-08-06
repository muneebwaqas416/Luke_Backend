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

const corsOptions = {
  origin: ['https://fullprimal.ai','https://www.fullprimal.ai/'], // Replace with your actual frontend URL
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  allowedHeaders: 'X-Requested-With, Content-Type, Authorization',
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers (IE11, various SmartTVs) choke on 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Handle preflight requests
app.use(express.json());
console.log(process.env.OPENAI_API_KEY);
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})

// Your routes here
app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/' , router);



const PORT = process.env.PORT;

app.listen(PORT , ()=>{
    console.log(`App is running on port ${PORT}`)
})
