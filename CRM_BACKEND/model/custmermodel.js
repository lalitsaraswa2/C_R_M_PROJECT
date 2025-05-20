

// custmermodel.js FIle

import mongoose, { model, Schema } from "mongoose";

const customerSchema = new Schema({
  fullname:{
    type: String,
    required: true  
  },
  email:{
    type: String,
    required: true
  },
  mobile:{
    type: String,
    required: true
  },
  status:{
    type:String,
    enum:['calling','busy','wating','not received','switched off','not rechable'],
    default:'calling'
},
}, {
  timestamps: true  
});
  // mongoose.model = {}

const CoustmerModel = model("Customer", customerSchema);
export default CoustmerModel
