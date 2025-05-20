

// logroughts.js File

import express from "express";
import {
  createLog,
  fatchLog,
  fatchLogById,
  UpdateLog,
  DeleteLog
} from "../controller/logcontroller.js";

const logRouter = express.Router();

logRouter.post('/', createLog);
logRouter.get('/', fatchLog);
logRouter.get('/:id', fatchLogById);
logRouter.put('/:id', UpdateLog);
logRouter.delete('/:id', DeleteLog);

export default logRouter;
