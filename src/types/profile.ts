
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

import { supabase } from "@/integrations/supabase/client";

// Updated utility functions to manage profile data persistence with Supabase integration
export const saveProfileData = async (data: ProfileData, userId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    // First try saving to Supabase if a userId is provided
    if (userId) {
      // Process basic info
      const { error: basicInfoError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: data.basicInfo.fullName,
          email: data.basicInfo.email,
          gender: data.basicInfo.gender,
          date_of_birth: data.basicInfo.dateOfBirth,
          phone: data.basicInfo.contactNumber,
          address: data.basicInfo.residentialAddress,
          avatar_url: data.basicInfo.profilePicture,
          updated_at: new Date()
        });
      
      if (basicInfoError) throw basicInfoError;

      // Process medical info
      const { error: medicalInfoError } = await supabase
        .from('medical_info')
        .upsert({
          user_id: userId,
          blood_group: data.medicalInfo.bloodGroup,
          known_allergies: data.medicalInfo.knownAllergies,
          chronic_conditions: data.medicalInfo.chronicConditions,
          current_medications: data.medicalInfo.currentMedications,
          past_surgeries: data.medicalInfo.pastSurgeries,
          vaccination_records: data.medicalInfo.vaccinationRecords,
          family_medical_history: data.medicalInfo.familyMedicalHistory,
          updated_at: new Date()
        });
      
      if (medicalInfoError) throw medicalInfoError;

      // Process health metrics
      const { error: healthMetricsError } = await supabase
        .from('health_metrics')
        .upsert({
          user_id: userId,
          height: data.healthMetrics.height,
          weight: data.healthMetrics.weight,
          bmi: data.healthMetrics.bmi,
          blood_pressure: data.healthMetrics.bloodPressure,
          heart_rate: data.healthMetrics.heartRate,
          glucose_levels: data.healthMetrics.glucoseLevels,
          oxygen_saturation: data.healthMetrics.oxygenSaturation,
          sleep_patterns: data.healthMetrics.sleepPatterns,
          exercise_routine: data.healthMetrics.exerciseRoutine,
          updated_at: new Date()
        });
      
      if (healthMetricsError) throw healthMetricsError;

      // Process health records
      const { error: healthRecordsError } = await supabase
        .from('health_records')
        .upsert({
          user_id: userId,
          medical_reports: data.healthRecords.medicalReports,
          appointment_history: data.healthRecords.appointmentHistory,
          hospital_visits: data.healthRecords.hospitalVisits,
          insurance_provider: data.healthRecords.insuranceDetails.provider,
          insurance_policy_number: data.healthRecords.insuranceDetails.policyNumber,
          insurance_coverage: data.healthRecords.insuranceDetails.coverage,
          updated_at: new Date()
        });
      
      if (healthRecordsError) throw healthRecordsError;

      // Process reminders preferences
      const { error: remindersError } = await supabase
        .from('reminders_preferences')
        .upsert({
          user_id: userId,
          medication_reminders: data.remindersPreferences.medicationReminders,
          appointment_reminders: data.remindersPreferences.appointmentReminders,
          preferred_chat_time: data.remindersPreferences.preferredChatTime,
          language_preference: data.remindersPreferences.languagePreference,
          email_notifications: data.remindersPreferences.notificationPreferences.email,
          sms_notifications: data.remindersPreferences.notificationPreferences.sms,
          push_notifications: data.remindersPreferences.notificationPreferences.push,
          updated_at: new Date()
        });
      
      if (remindersError) throw remindersError;

      // Process account security
      const { error: accountSecurityError } = await supabase
        .from('account_security')
        .upsert({
          user_id: userId,
          username: data.accountSecurity.username,
          two_factor_enabled: data.accountSecurity.twoFactorEnabled,
          emergency_contact_name: data.accountSecurity.emergencyContact.name,
          emergency_contact_relationship: data.accountSecurity.emergencyContact.relationship,
          emergency_contact_phone: data.accountSecurity.emergencyContact.phone,
          data_consent: data.accountSecurity.dataConsent,
          user_role: data.accountSecurity.userRole,
          updated_at: new Date()
        });
      
      if (accountSecurityError) throw accountSecurityError;

      // Process AI Personalization data
      const { error: profilesError } = await supabase
        .from('profiles')
        .update({
          frequent_symptoms: data.aiPersonalization.frequentSymptoms,
          health_goals: data.aiPersonalization.healthGoals,
          chat_history: data.aiPersonalization.chatHistory,
          mood_tracking: data.aiPersonalization.moodTracking,
          updated_at: new Date()
        })
        .eq('id', userId);
      
      if (profilesError) throw profilesError;
    }
    
    // Also save to localStorage as a fallback
    localStorage.setItem('healthProfileData', JSON.stringify(data));
    return { success: true };
  } catch (error) {
    console.error("Error saving profile data:", error);
    
    // Try to save to localStorage as fallback
    try {
      localStorage.setItem('healthProfileData', JSON.stringify(data));
    } catch (localError) {
      console.error("Failed to save to localStorage as well:", localError);
    }
    
    return { success: false, error };
  }
};

export const loadProfileData = async (userData: { name: string; email: string; id: string }): Promise<ProfileData> => {
  try {
    // Try to load from Supabase first if we have a user ID
    if (userData.id) {
      const profileData = await fetchProfileDataFromSupabase(userData.id);
      if (profileData) {
        return profileData;
      }
    }
  } catch (error) {
    console.error("Error loading profile from Supabase:", error);
  }
  
  // Fallback to localStorage if Supabase fetch fails or returns no data
  return loadProfileFromLocalStorage(userData);
};

const fetchProfileDataFromSupabase = async (userId: string): Promise<ProfileData | null> => {
  try {
    // Fetch all profile-related data in parallel
    const [
      { data: profileData },
      { data: medicalInfoData },
      { data: healthMetricsData },
      { data: healthRecordsData },
      { data: remindersPreferencesData },
      { data: accountSecurityData }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('medical_info').select('*').eq('user_id', userId).single(),
      supabase.from('health_metrics').select('*').eq('user_id', userId).single(),
      supabase.from('health_records').select('*').eq('user_id', userId).single(),
      supabase.from('reminders_preferences').select('*').eq('user_id', userId).single(),
      supabase.from('account_security').select('*').eq('user_id', userId).single(),
    ]);

    // If essential profile data is missing, return null
    if (!profileData) return null;
    
    // Map Supabase data to ProfileData structure
    const profileObject: ProfileData = {
      basicInfo: {
        fullName: profileData.name || '',
        gender: profileData.gender || '',
        dateOfBirth: profileData.date_of_birth ? new Date(profileData.date_of_birth) : null,
        contactNumber: profileData.phone || '',
        email: profileData.email || '',
        residentialAddress: profileData.address || '',
        profilePicture: profileData.avatar_url || undefined,
      },
      medicalInfo: {
        bloodGroup: medicalInfoData?.blood_group || '',
        knownAllergies: medicalInfoData?.known_allergies || '',
        chronicConditions: medicalInfoData?.chronic_conditions || '',
        currentMedications: medicalInfoData?.current_medications || '',
        pastSurgeries: medicalInfoData?.past_surgeries || '',
        vaccinationRecords: medicalInfoData?.vaccination_records || '',
        familyMedicalHistory: medicalInfoData?.family_medical_history || '',
      },
      healthMetrics: {
        height: healthMetricsData?.height || '',
        weight: healthMetricsData?.weight || '',
        bmi: healthMetricsData?.bmi || '',
        bloodPressure: healthMetricsData?.blood_pressure || '',
        heartRate: healthMetricsData?.heart_rate || '',
        glucoseLevels: healthMetricsData?.glucose_levels || '',
        oxygenSaturation: healthMetricsData?.oxygen_saturation || '',
        sleepPatterns: healthMetricsData?.sleep_patterns || '',
        exerciseRoutine: healthMetricsData?.exercise_routine || '',
      },
      healthRecords: {
        medicalReports: healthRecordsData?.medical_reports || [],
        appointmentHistory: healthRecordsData?.appointment_history || [],
        hospitalVisits: healthRecordsData?.hospital_visits || [],
        insuranceDetails: {
          provider: healthRecordsData?.insurance_provider || '',
          policyNumber: healthRecordsData?.insurance_policy_number || '',
          coverage: healthRecordsData?.insurance_coverage || '',
        },
      },
      remindersPreferences: {
        medicationReminders: remindersPreferencesData?.medication_reminders || false,
        appointmentReminders: remindersPreferencesData?.appointment_reminders || false,
        preferredChatTime: remindersPreferencesData?.preferred_chat_time || '',
        languagePreference: remindersPreferencesData?.language_preference || 'english',
        notificationPreferences: {
          email: remindersPreferencesData?.email_notifications || false,
          sms: remindersPreferencesData?.sms_notifications || false,
          push: remindersPreferencesData?.push_notifications || false,
        },
      },
      accountSecurity: {
        username: accountSecurityData?.username || profileData.name || '',
        twoFactorEnabled: accountSecurityData?.two_factor_enabled || false,
        emergencyContact: {
          name: accountSecurityData?.emergency_contact_name || '',
          relationship: accountSecurityData?.emergency_contact_relationship || '',
          phone: accountSecurityData?.emergency_contact_phone || '',
        },
        dataConsent: accountSecurityData?.data_consent || false,
        userRole: accountSecurityData?.user_role || 'patient',
      },
      aiPersonalization: {
        frequentSymptoms: profileData.frequent_symptoms || [],
        healthGoals: profileData.health_goals || [],
        chatHistory: profileData.chat_history || [],
        moodTracking: profileData.mood_tracking || [],
      },
    };
    
    // Convert any date strings to Date objects
    return restoreDateObjects(profileObject);
  } catch (error) {
    console.error("Error fetching profile data from Supabase:", error);
    return null;
  }
};

const loadProfileFromLocalStorage = (userData: { name: string; email: string }): ProfileData => {
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
