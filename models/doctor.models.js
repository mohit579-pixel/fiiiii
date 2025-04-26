import { Schema, model } from "mongoose";

const doctorSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    specialization: { type: String, required: true },
    experience: { type: String, required: true },
    licenseNumber: { type: String, required: true, unique: true },
    patients: [{ type: Schema.Types.ObjectId, ref: "Patient" }],
    appointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
    aiAnalysis: [
      {
        patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
        reportType: String,
        imageUrl: String,
        aiResult: String,
        timestamp: { type: Date, default: Date.now },
      },
    ],
    prescriptions: [
      {
        patientId: { type: Schema.Types.ObjectId, ref: "Patient" },
        medicines: [
          {
            name: String,
            dosage: String,
            instructions: String,
          },
        ],
        date: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Doctor = model("Doctor", doctorSchema);
export default Doctor;
