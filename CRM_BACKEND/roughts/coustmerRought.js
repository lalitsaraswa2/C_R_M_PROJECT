 
// coustmerRought.js file 


 import custmerModel from "../model/custmermodel.js";
// routes/customerRoute.js
import { Router } from "express";
import { 
  createcustomer, 
  fetchcustomer, 
  fetchcustomerById, 
  updateCustomer, 
  deleteCustomer } from "../controller/customer.js";

const router = Router();

router.post("/", createcustomer);
router.get("/", fetchcustomer);
router.get("/:id", fetchcustomerById);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
