import { Schema, model } from "mongoose";

const aiDiagnosisSchema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Doctor" },
    imageUrl: { type: String, required: true },
    diagnosisResult: { type: String, required: true },
    confidenceScore: { type: Number, required: true },
  },
  { timestamps: true }
);

const AIDiagnosis = model("AIDiagnosis", aiDiagnosisSchema);
export default AIDiagnosis;
