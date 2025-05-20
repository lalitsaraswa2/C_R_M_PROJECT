
// index.js file 


import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import logRouter from './roughts/logroughts.js';

import coustmerRought from './roughts/coustmerRought.js'

import cors from "cors"

// const cors = require('cors');
// app.use(cors());

import bodyParser from 'body-parser';

import mongoose  from "mongoose"

mongoose.connect("mongodb://localhost:27017").then(()=>{
  
      console.log("db connect");
      
}).catch((error)=>{
    console.log("error",error);
    
})

const app = express();
app.use(express.json())
const PORT = process.env.PORT || 8070;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
  
app.use(cors())
 app.use('/coustmer',coustmerRought)
 app.use("/logs", logRouter); 

 
//  app.use(express.urlencoded({ extended: false }));
//  app.use(bodyParser.json())



