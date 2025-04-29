
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
