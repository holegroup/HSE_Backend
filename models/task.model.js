const mongoose = require("mongoose");

const taskSchema = mongoose.Schema(
  {
    inspector_name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    product: {
      type: String,
      required: true,
    },
    part_number: {
      type: String,
      required: true,
    },
    due_date: {
      type: Date,
      required: true,
    },
    note: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["Pending", "Due Soon", "Overdue", "Completed"],
      default: "Pending",
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    supervisorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    inspectionForms: [
      { type: mongoose.Schema.Types.ObjectId, ref: "Inspection" },
    ],
    critical: {
      type: Boolean,
      default: false,
    },
    maintenance_freq: {
      type: Number, // in days
      default: null,
      // required: true
    },
    recurring: { 
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Task", taskSchema);
