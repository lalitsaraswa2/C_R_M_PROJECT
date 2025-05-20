// controller/logcontroller.js
import logModel from "../model/logmodel.js";

export const createLog = async (req, res) => {
  try {
    const log = new logModel(req.body);
    await log.save();
    res.status(201).json({ message: "Log created successfully", log });
  } catch (error) {
    res.status(500).json({ message: "Failed to create log", error: error.message });
  }
};

export const fatchLog = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const logs = await logModel.find()
      .populate("customer")
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await logModel.countDocuments();
    res.json({ logs, total: count, page: Number(page), limit: Number(limit) });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch logs", error: err.message });
  }
};

export const fatchLogById = async (req, res) => {
  try {
    const log = await logModel.findById(req.params.id);
    if (!log) return res.status(404).json({ message: "Log not found" });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch log", error: error.message });
  }
};

export const UpdateLog = async (req, res) => {
  try {
    const updatedLog = await logModel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedLog) return res.status(404).json({ message: "Log not found" });

    res.json({ message: "Log updated successfully", log: updatedLog });
  } catch (error) {
    res.status(500).json({ message: "Failed to update log", error: error.message });
  }
};

export const DeleteLog = async (req, res) => {
  try {
    const deletedLog = await logModel.findByIdAndDelete(req.params.id);
    if (!deletedLog) return res.status(404).json({ message: "Log not found" });

    res.json({ message: "Log deleted successfully", log: deletedLog });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete log", error: error.message });
  }
};
