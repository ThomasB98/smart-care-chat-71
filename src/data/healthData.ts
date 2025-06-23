// Mock data for healthcare information

// Symptoms data for the symptom checker
export const symptoms = [
  { id: "fever", label: "Fever" },
  { id: "cough", label: "Cough" },
  { id: "headache", label: "Headache" },
  { id: "sore_throat", label: "Sore Throat" },
  { id: "fatigue", label: "Fatigue" },
  { id: "body_ache", label: "Body Ache" },
  { id: "shortness_of_breath", label: "Shortness of Breath" },
  { id: "nausea", label: "Nausea" },
  { id: "dizziness", label: "Dizziness" },
  { id: "rash", label: "Skin Rash" }
];

// Generate available appointments from tomorrow to two months ahead
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(today.getDate() + 1);

function formatDate(date) {
  return date.toISOString().split('T')[0];
}

// Add 5 appointments per week for the next 8 weeks
const doctors = [
  { name: "Dr. Sarah Johnson", specialty: "General Medicine", time: "09:00 AM" },
  { name: "Dr. Michael Chen", specialty: "Internal Medicine", time: "11:30 AM" },
  { name: "Dr. Emily Rodriguez", specialty: "Pediatrics", time: "01:00 PM" },
  { name: "Dr. David Kim", specialty: "Cardiology", time: "03:30 PM" },
  { name: "Dr. Priya Patel", specialty: "Dermatology", time: "04:45 PM" },
];

export const availableAppointments = [];

for (let week = 0; week < 8; week++) {
  for (let i = 0; i < 5; i++) {
    const apptDate = new Date(tomorrow);
    apptDate.setDate(tomorrow.getDate() + week * 7 + i); // spread appointments across the week
    const doc = doctors[i % doctors.length];
    availableAppointments.push({
      id: week * 5 + i + 1,
      date: formatDate(apptDate),
      time: doc.time,
      doctor: doc.name,
      specialty: doc.specialty
    });
  }
}

// Health tips and FAQs
export const healthTips = [
  "Stay hydrated by drinking at least 8 glasses of water daily.",
  "Aim for 7-9 hours of quality sleep each night.",
  "Include a variety of fruits and vegetables in your diet.",
  "Exercise regularly - aim for at least 150 minutes of moderate activity per week.",
  "Practice stress management techniques like meditation or deep breathing.",
  "Maintain a balanced diet with appropriate portions.",
  "Take regular breaks from screen time to rest your eyes.",
  "Wash hands frequently to prevent the spread of germs.",
  "Schedule regular check-ups with your healthcare provider.",
  "Stay up to date with recommended vaccinations."
];
