import moment from 'moment';

const generatePrescriptionHTML = (data) => {
  const {
    doctor,
    patient,
    appointment,
    clinic = {
      name: "DentalCare",
      address: "123 Ocean Street #45",
      city: "NEW YORK CITY",
      phone: "02-123456 +855-123456789",
      website: "www.DentalCare.com",
      email: "contact@DentalCare.com"
    }
  } = data;

  // Helper function to parse medication string
  const parseMedicationString = (medString) => {
    // Expected format: "name - dosage (instructions)"
    const parts = medString.split(' - ');
    if (parts.length >= 2) {
      const name = parts[0];
      const dosageAndInstructions = parts[1].split(' (');
      const dosage = dosageAndInstructions[0];
      const instructions = dosageAndInstructions[1]?.replace(')', '') || '';
      return { name, dosage, instructions };
    }
    return { name: medString, dosage: 'N/A', instructions: 'N/A' };
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Medical Prescription</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #0088cc;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        .clinic-name {
          color: #0088cc;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        .clinic-info {
          font-size: 12px;
          color: #666;
          margin: 5px 0;
        }
        .prescription-details {
          margin: 20px 0;
        }
        .patient-info {
          margin-bottom: 20px;
        }
        .prescription-content {
          margin: 20px 0;
        }
        .footer {
          margin-top: 40px;
          text-align: right;
          border-top: 1px solid #ddd;
          padding-top: 10px;
        }
        .diagnosis-box {
          border: 1px solid #ddd;
          padding: 10px;
          margin: 10px 0;
          background-color: #f9f9f9;
        }
        .medication-list {
          margin: 20px 0;
        }
        .medication-item {
          margin: 10px 0;
          padding-left: 20px;
        }
        .tooth-diagram {
          text-align: center;
          margin: 20px 0;
        }
        .watermark {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 100px;
          color: rgba(200, 200, 200, 0.1);
          z-index: -1;
        }
      </style>
    </head>
    <body>
      <div class="watermark">DentalCare</div>
      
      <div class="header">
        <h1 class="clinic-name">${clinic.name}</h1>
        <p class="clinic-info">${clinic.address}, ${clinic.city}</p>
        <p class="clinic-info">Phone: ${clinic.phone}</p>
        <p class="clinic-info">Email: ${clinic.email} | Website: ${clinic.website}</p>
      </div>

      <div class="prescription-details">
        <div style="float: right;">
          <p>Date: ${moment().format('YYYY-MM-DD')}</p>
          <p>Prescription ID: ${appointment._id}</p>
        </div>
        
        <div class="patient-info">
          <h3>Patient Information</h3>
          <p>Name: ${patient.fullName}</p>
          <p>Age: ${patient.age || 'N/A'} | Gender: ${patient.gender || 'N/A'}</p>
          <p>Phone: ${patient.phone || 'N/A'}</p>
        </div>

        <div class="prescription-content">
          <h3>Diagnosis</h3>
          ${appointment.diagnoses ? appointment.diagnoses.map(diagnosis => `
            <div class="diagnosis-box">
              <p><strong>Tooth Number:</strong> ${diagnosis.toothNumber || 'N/A'}</p>
              <p><strong>Condition:</strong> ${diagnosis.condition || 'N/A'}</p>
              <p><strong>Severity:</strong> ${diagnosis.severity || 'N/A'}</p>
              <p><strong>Treatment:</strong> ${diagnosis.treatment || 'N/A'}</p>
              <p><strong>Notes:</strong> ${diagnosis.notes || 'N/A'}</p>
            </div>
          `).join('') : '<p>No diagnosis recorded</p>'}

          ${appointment.medications ? `
            <h3>Medications</h3>
            <div class="medication-list">
              ${Array.isArray(appointment.medications) ? 
                appointment.medications.map(med => {
                  // Handle both string and object formats
                  const medication = typeof med === 'string' ? parseMedicationString(med) : med;
                  return `
                    <div class="medication-item">
                      <p>• ${medication.name} ${medication.dosage ? `- ${medication.dosage}` : ''}</p>
                      ${medication.instructions ? `
                        <p style="padding-left: 15px; color: #666;">
                          ${medication.instructions}
                        </p>
                      ` : ''}
                    </div>
                  `;
                }).join('') : ''
              }
            </div>
          ` : ''}

          ${appointment.prescription ? `
            <h3>Additional Instructions</h3>
            <p>${appointment.prescription}</p>
          ` : ''}

          
        </div>
      </div>

      <div class="footer">
        <p>Dr. ${doctor.fullName}</p>
        <p>${doctor.speciality}</p>
        <p>License No: ${doctor.licenseNumber || 'N/A'}</p>
      </div>
    </body>
    </html>
  `;
};

export default generatePrescriptionHTML; 