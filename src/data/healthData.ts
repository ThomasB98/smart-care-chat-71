
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

// Basic symptom analysis logic (very simplified)
export const symptomAnalysis: Record<string, string> = {
  fever: "Fever could indicate an infection. Monitor your temperature and stay hydrated.",
  cough: "Coughs can be caused by infections, allergies, or irritants. If persistent, consider consulting a healthcare provider.",
  headache: "Headaches can be due to stress, dehydration, or other factors. Rest and stay hydrated.",
  sore_throat: "Sore throats are often caused by viral infections. Warm liquids and rest may help.",
  fatigue: "Fatigue can be caused by lack of sleep, stress, or underlying health conditions.",
  body_ache: "Body aches often accompany infections or can be caused by physical exertion.",
  shortness_of_breath: "Shortness of breath could indicate a respiratory issue and should be evaluated by a healthcare professional.",
  nausea: "Nausea can be caused by digestive issues, motion sickness, or other factors.",
  dizziness: "Dizziness may be caused by inner ear issues, low blood sugar, or dehydration.",
  rash: "Skin rashes can be caused by allergies, infections, or other skin conditions."
};

// Mock available appointment slots
export const availableAppointments = [
  { id: 1, date: "2025-05-02", time: "09:00 AM", doctor: "Dr. Sarah Johnson", specialty: "General Medicine" },
  { id: 2, date: "2025-05-02", time: "11:30 AM", doctor: "Dr. Sarah Johnson", specialty: "General Medicine" },
  { id: 3, date: "2025-05-03", time: "10:00 AM", doctor: "Dr. Michael Chen", specialty: "Internal Medicine" },
  { id: 4, date: "2025-05-03", time: "02:15 PM", doctor: "Dr. Michael Chen", specialty: "Internal Medicine" },
  { id: 5, date: "2025-05-04", time: "09:30 AM", doctor: "Dr. Emily Rodriguez", specialty: "Pediatrics" },
  { id: 6, date: "2025-05-04", time: "01:00 PM", doctor: "Dr. Emily Rodriguez", specialty: "Pediatrics" },
  { id: 7, date: "2025-05-05", time: "11:00 AM", doctor: "Dr. David Kim", specialty: "Cardiology" },
  { id: 8, date: "2025-05-05", time: "03:30 PM", doctor: "Dr. David Kim", specialty: "Cardiology" }
];

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

export const healthFAQs = [
  {
    question: "How can I improve my sleep quality?",
    answer: "Maintain a regular sleep schedule, create a restful environment, limit screen time before bed, avoid caffeine and large meals in the evening, and consider relaxation techniques before bedtime."
  },
  {
    question: "What are the signs of dehydration?",
    answer: "Signs include increased thirst, dry mouth, fatigue, headache, dark-colored urine, and dizziness. Stay hydrated by drinking water regularly throughout the day."
  },
  {
    question: "How can I manage stress effectively?",
    answer: "Regular exercise, adequate sleep, mindfulness practices, maintaining social connections, and time management can all help reduce stress. Consider activities like yoga, meditation, or hobbies you enjoy."
  },
  {
    question: "When should I get a flu shot?",
    answer: "The best time to get a flu shot is before flu season begins, typically in early fall. However, getting vaccinated later can still provide protection during most of the flu season."
  },
  {
    question: "How much exercise do adults need?",
    answer: "Adults should aim for at least 150 minutes of moderate-intensity aerobic activity or 75 minutes of vigorous activity per week, plus muscle-strengthening activities at least twice a week."
  }
];
