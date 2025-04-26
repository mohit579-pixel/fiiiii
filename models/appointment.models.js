import { Schema, model } from "mongoose";

const appointmentSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // Format: "HH:MM" in 24-hour format
    endTime: { type: String, required: true }, // Format: "HH:MM" in 24-hour format
    type: { 
      type: String, 
      enum: ["general-checkup", "scaling", "extraction", "bleaching", "consultation", "other"],
      required: true 
    },
    status: { 
      type: String, 
      enum: ["upcoming", "completed", "canceled", "rescheduled", "confirmed"], 
      default: "upcoming" 
    },
    notes: { type: String },
    location: { type: String },
    paymentStatus: { type: String, enum: ["Paid", "Unpaid"], default: "Unpaid" },
    paymentAmount: {
      type: Number,
      default: 0
    },
    diagnoses: [{
      toothNumber: { type: String, required: true },
      condition: { type: String, required: true },
      severity: { 
        type: String, 
        enum: ["low", "medium", "high"],
        default: "low"
      },
      treatment: { type: String },
      notes: { type: String },
      images: [{ type: String }],
      createdAt: { type: Date, default: Date.now }
    }],
    prescription: { type: String },
    followUpDate: { type: Date },
    medications: [{ type: String }]
  },
  { timestamps: true }
);

// Virtual for getting the full appointment time range
appointmentSchema.virtual('appointmentTime').get(function() {
  return `${this.startTime} - ${this.endTime}`;
});

// Index for faster queries
appointmentSchema.index({ patientId: 1, date: 1 });
appointmentSchema.index({ doctorId: 1, date: 1 });
appointmentSchema.index({ date: 1, status: 1 });

const Appointment = model("Appointment", appointmentSchema);
export default Appointment;