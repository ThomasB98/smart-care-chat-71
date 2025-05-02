
import { symptoms, symptomAnalysis, healthTips, healthFAQs } from "../data/healthData";

export interface MessageType {
  id: string;
  content: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  type: 'text' | 'options' | 'symptom-checker' | 'appointment' | 'reminder' | 'health-tip' | 'nearby-doctors';
  options?: string[];
  messages?: MessageType[]; // For storing message history
}

// Generate a unique ID for messages
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Mapbox token for maps functionality
export const MAPBOX_TOKEN = "pk.eyJ1IjoidGhvbWFzYjk4IiwiYSI6ImNtYTc3Z2N4dDB2ZzAybHNkdGxwYWV5YmYifQ.Cjl9InQhsLNvGhxJJs3ymg";

// Process user input and generate a response
export const processUserInput = (userInput: string): MessageType => {
  const userInputLower = userInput.toLowerCase();
  
  // Simple keyword matching for different functionalities
  if (userInputLower.includes('symptom') || userInputLower.includes('not feeling well') || userInputLower.includes('sick')) {
    return {
      id: generateId(),
      content: "I can help you check your symptoms. What symptoms are you experiencing?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'symptom-checker',
      options: symptoms.map(s => s.label)
    };
  } 
  else if (userInputLower.includes('appointment') || userInputLower.includes('schedule') || userInputLower.includes('booking') || userInputLower.includes('doctor')) {
    return {
      id: generateId(),
      content: "Would you like to schedule an appointment with a healthcare provider?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'appointment'
    };
  } 
  else if (userInputLower.includes('medicine') || userInputLower.includes('medication') || userInputLower.includes('reminder')) {
    return {
      id: generateId(),
      content: "I can help you set up medication reminders. Would you like to add one?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'reminder'
    };
  }
  else if (userInputLower.includes('tip') || userInputLower.includes('advice') || userInputLower.includes('health tips')) {
    const randomTip = healthTips[Math.floor(Math.random() * healthTips.length)];
    return {
      id: generateId(),
      content: `Here's a health tip for you: ${randomTip}`,
      sender: 'bot',
      timestamp: new Date(),
      type: 'health-tip'
    };
  }
  else if (userInputLower.includes('faq') || userInputLower.includes('question')) {
    return {
      id: generateId(),
      content: "Here are some frequently asked health questions. Which one would you like to know more about?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'options',
      options: healthFAQs.map(faq => faq.question)
    };
  }
  else if (userInputLower.includes('hospital') || userInputLower.includes('nearby') || userInputLower.includes('find') || userInputLower.includes('location')) {
    return {
      id: generateId(),
      content: "I can help you find nearby hospitals and doctors. Would you like me to show you healthcare facilities in your area?",
      sender: 'bot',
      timestamp: new Date(),
      type: 'nearby-doctors'
    };
  }
  else if (userInputLower.includes('hello') || userInputLower.includes('hi')) {
    return {
      id: generateId(),
      content: "Hello! I'm your Smart Healthcare Assistant. How can I help you today? You can ask about symptoms, schedule an appointment, set medication reminders, get health tips, or find nearby healthcare facilities.",
      sender: 'bot',
      timestamp: new Date(),
      type: 'text'
    };
  }
  else {
    return {
      id: generateId(),
      content: "I'm here to help with your health concerns. You can ask me about symptoms, schedule an appointment, set medication reminders, get health tips and information, or find nearby healthcare facilities.",
      sender: 'bot',
      timestamp: new Date(),
      type: 'options',
      options: ["Check symptoms", "Schedule appointment", "Set medication reminder", "Get health tips", "Ask health questions", "Find nearby doctors"]
    };
  }
};

// Get analysis for a specific symptom
export const getSymptomAnalysis = (symptomName: string): string => {
  const symptomKey = symptoms.find(s => s.label.toLowerCase() === symptomName.toLowerCase())?.id;
  return symptomKey && symptomAnalysis[symptomKey] 
    ? symptomAnalysis[symptomKey] 
    : "I don't have specific information about that symptom. It's best to consult with a healthcare professional for personalized advice.";
};

// Get response for FAQ questions
export const getFAQResponse = (question: string): string => {
  const faq = healthFAQs.find(f => f.question === question);
  return faq ? faq.answer : "I don't have information about that specific question.";
};
