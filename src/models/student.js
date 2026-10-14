const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    lastName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
    email: { type: String, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, required: true, unique: true, match: /^[6-9]\d{9}$/ },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true, enum: ["Female", "Male", "Other"] },
    standard: { type: String, required: true, enum: ["5", "6", "7", "8", "9", "10"] },
    course: {
      type: String,
      required: true,
      enum: ["SSC", "HSC Foundation", "JEE Foundation", "NEET Foundation"],
    },
    guardianName: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    guardianPhone: { type: String, required: true, match: /^[6-9]\d{9}$/ },
    address: { type: String, required: true, trim: true, minlength: 5, maxlength: 300 },
  },
  { timestamps: true, versionKey: false },
);

studentSchema.index({ email: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Student", studentSchema);
