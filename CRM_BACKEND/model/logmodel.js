

// logmodel.js File

import mongoose, { Schema, model } from "mongoose";

const logSchema = new Schema({
  customer: {
    type: mongoose.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  startAt: {
    type: Date
  },
  endsAt: {
    type: Date
  },
  followUp: {
    type: Date
  },
  status: {
    type: String,
    enum: ['calling', 'busy', 'waiting', 'not received', 'switch off', 'not reachable'],
    default: 'calling'
  }
});

logSchema.pre('save', function (next) {
  if (!this.startAt) this.startAt = new Date();
  if (!this.endsAt) this.endsAt = new Date();
  next();
});

const logModel = model("Log", logSchema);
export default logModel;
