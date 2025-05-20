// controllers/customer.js
import CoustmerModel from "../model/custmermodel.js";

export const createcustomer = async (req, res) => {
  try {
    const customer = new CoustmerModel(req.body);
    await customer.save();
    res.status(201).json({ message: "Customer created successfully!", customer });
  } catch (error) {
    res.status(500).json({ message: "Failed to create customer", error: error.message });
  }
};

export const fetchcustomer = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 3;
    const skip = (page - 1) * limit;

    const [customers, total] = await Promise.all([
      CoustmerModel.find().skip(skip).limit(limit).sort({ createdAt: -1 }),
      CoustmerModel.countDocuments()
    ]);

    res.status(200).json({ customers, total });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error", error: err.message });
  }
};

export const fetchcustomerById = async (req, res) => {
  try {
    const customer = await CoustmerModel.findById(req.params.id);
    if (!customer) return res.status(404).json({ message: "Customer not found" });
    res.json(customer);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch customer", error: error.message });
  }
};

export const updateCustomer = async (req, res) => {
  try {
    const updatedCustomer = await CoustmerModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedCustomer) return res.status(404).json({ message: "Customer not found" });

    res.json({ message: "Customer updated successfully", customer: updatedCustomer });
  } catch (error) {
    res.status(500).json({ message: "Failed to update customer", error: error.message });
  }
};

export const deleteCustomer = async (req, res) => {
  try {
    const deletedCustomer = await CoustmerModel.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) return res.status(404).json({ message: "Customer not found" });

    res.json({ message: "Customer deleted successfully", customer: deletedCustomer });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete customer", error: error.message });
  }
};
