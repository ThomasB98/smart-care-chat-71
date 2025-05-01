
export interface BasicInfo {
  fullName: string;
  gender: string;
  dateOfBirth: Date | null;
  contactNumber: string;
  email: string;
  residentialAddress: string;
  profilePicture?: string;
}

export interface MedicalInfo {
  bloodGroup: string;
  knownAllergies: string;
  chronicConditions: string;
  currentMedications: string;
  pastSurgeries: string;
  vaccinationRecords: string;
  familyMedicalHistory: string;
}

export interface HealthMetrics {
  height: string;
  weight: string;
  bmi: string;
  bloodPressure: string;
  heartRate: string;
  glucoseLevels: string;
  oxygenSaturation: string;
  sleepPatterns: string;
  exerciseRoutine: string;
}

export interface HealthRecord {
  id: string;
  name: string;
  type: string;
  date: string;
  fileUrl?: string;
}

export interface HealthRecords {
  medicalReports: HealthRecord[];
  appointmentHistory: {
    id: string;
    doctor: string;
    date: string;
    purpose: string;
  }[];
  hospitalVisits: {
    id: string;
    hospital: string;
    date: string;
    reason: string;
  }[];
  insuranceDetails: {
    provider: string;
    policyNumber: string;
    coverage: string;
  };
}

export interface RemindersPreferences {
  medicationReminders: boolean;
  appointmentReminders: boolean;
  preferredChatTime: string;
  languagePreference: string;
  notificationPreferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

export interface AccountSecurity {
  username: string;
  twoFactorEnabled: boolean;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  dataConsent: boolean;
  userRole: string;
}

export interface AIPersonalizationData {
  frequentSymptoms: string[];
  healthGoals: {
    goal: string;
    target: string;
    progress: number;
    startDate: Date | null;
    targetDate: Date | null;
  }[];
  chatHistory: {
    id: string;
    topic: string;
    date: Date;
    summary: string;
  }[];
  moodTracking: {
    date: Date;
    mood: 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy';
    notes: string;
  }[];
}

export interface ProfileData {
  basicInfo: BasicInfo;
  medicalInfo: MedicalInfo;
  healthMetrics: HealthMetrics;
  healthRecords: HealthRecords;
  remindersPreferences: RemindersPreferences;
  accountSecurity: AccountSecurity;
  aiPersonalization: AIPersonalizationData;
}

// Helper function to convert Date objects to strings for storage
const prepareDateObjectsForStorage = (data: ProfileData): ProfileData => {
  const processedData = JSON.parse(JSON.stringify(data)) as ProfileData;
  
  // Don't need to process most fields as they're already stored as strings
  // But we need to handle the AI Personalization data specifically
  
  return processedData;
};

// Helper function to convert stored strings back to Date objects
const restoreDateObjects = (data: ProfileData): ProfileData => {
  if (data.aiPersonalization) {
    // Convert health goals dates
    if (data.aiPersonalization.healthGoals) {
      data.aiPersonalization.healthGoals = data.aiPersonalization.healthGoals.map(goal => ({
        ...goal,
        startDate: goal.startDate ? new Date(goal.startDate) : null,
        targetDate: goal.targetDate ? new Date(goal.targetDate) : null
      }));
    }
    
    // Convert chat history dates
    if (data.aiPersonalization.chatHistory) {
      data.aiPersonalization.chatHistory = data.aiPersonalization.chatHistory.map(chat => ({
        ...chat,
        date: new Date(chat.date)
      }));
    }
    
    // Convert mood tracking dates
    if (data.aiPersonalization.moodTracking) {
      data.aiPersonalization.moodTracking = data.aiPersonalization.moodTracking.map(mood => ({
        ...mood,
        date: new Date(mood.date)
      }));
    }
  }
  
  // Also convert basic info date of birth if present
  if (data.basicInfo && data.basicInfo.dateOfBirth) {
    data.basicInfo.dateOfBirth = new Date(data.basicInfo.dateOfBirth);
  }
  
  return data;
};

// New utility functions to manage profile data persistence
export const saveProfileData = (data: ProfileData) => {
  localStorage.setItem('healthProfileData', JSON.stringify(data));
};

export const loadProfileData = (userData: { name: string; email: string }): ProfileData => {
  const savedData = localStorage.getItem('healthProfileData');
  
  if (savedData) {
    try {
      const parsedData = JSON.parse(savedData) as ProfileData;
      const restoredData = restoreDateObjects(parsedData);
      
      // Update with current user data to ensure it's in sync
      return {
        ...restoredData,
        basicInfo: {
          ...restoredData.basicInfo,
          fullName: restoredData.basicInfo.fullName || userData.name,
          email: restoredData.basicInfo.email || userData.email,
        },
        accountSecurity: {
          ...restoredData.accountSecurity,
          username: restoredData.accountSecurity.username || userData.name,
        }
      };
    } catch (error) {
      console.error('Error parsing saved profile data:', error);
    }
  }
  
  // Return default data if nothing is saved
  return getDefaultProfileData(userData);
};

export const getDefaultProfileData = (userData: { name: string; email: string }): ProfileData => {
  return {
    basicInfo: {
      fullName: userData.name || "",
      gender: "",
      dateOfBirth: null,
      contactNumber: "",
      email: userData.email || "",
      residentialAddress: "",
    },
    medicalInfo: {
      bloodGroup: "",
      knownAllergies: "",
      chronicConditions: "",
      currentMedications: "",
      pastSurgeries: "",
      vaccinationRecords: "",
      familyMedicalHistory: ""
    },
    healthMetrics: {
      height: "",
      weight: "",
      bmi: "",
      bloodPressure: "",
      heartRate: "",
      glucoseLevels: "",
      oxygenSaturation: "",
      sleepPatterns: "",
      exerciseRoutine: ""
    },
    healthRecords: {
      medicalReports: [],
      appointmentHistory: [],
      hospitalVisits: [],
      insuranceDetails: {
        provider: "",
        policyNumber: "",
        coverage: ""
      }
    },
    remindersPreferences: {
      medicationReminders: true,
      appointmentReminders: true,
      preferredChatTime: "",
      languagePreference: "english",
      notificationPreferences: {
        email: true,
        sms: false,
        push: true
      }
    },
    accountSecurity: {
      username: userData.name || "",
      twoFactorEnabled: false,
      emergencyContact: {
        name: "",
        relationship: "",
        phone: ""
      },
      dataConsent: true,
      userRole: "patient"
    },
    aiPersonalization: {
      frequentSymptoms: [],
      healthGoals: [],
      chatHistory: [],
      moodTracking: []
    }
  };
};
