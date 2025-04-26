import { Schema, model } from "mongoose";

const patientSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    fullName: { type: String, required: true },
    email: { type: String, required: true },
    
    medicalHistory: [
      {
        condition: String,
        diagnosedDate: Date,
        notes: String,
      },
    ],
    appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
    uploadedReports: [
      {
        reportType: String,
        imageUrl: String,
        uploadDate: { type: Date, default: Date.now },
      },
    ],
    paymentHistory: [
      {
        transactionId: String,
        amount: Number,
        status: { type: String, enum: ["Completed", "Failed", "Pending"] },
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Patient = model("Patient", patientSchema);
export default Patient;
