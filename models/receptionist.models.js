import { Schema, model } from "mongoose";

const receptionistSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    assignedDoctors: [{ type: Schema.Types.ObjectId, ref: "Doctor" }],
    managedAppointments: [{ type: Schema.Types.ObjectId, ref: "Appointment" }],
  },
  { timestamps: true }
);

const Receptionist = model("Receptionist", receptionistSchema);
export default Receptionist;
