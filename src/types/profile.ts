import { Json } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { MessageType } from "@/utils/chatbotUtils";

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
  allergies: string[];
  medications: string[];
  reminders: Reminder[];
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

export interface HealthGoal {
  goal: string;
  target: string;
  progress: number;
  startDate: Date | null;
  targetDate: Date | null;
}

export interface ChatHistoryItem {
  id: string;
  topic: string;
  date: Date;
  summary: string;
  messages: any[];
}

export interface MoodTracking {
  date: Date;
  mood: 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy';
  notes: string;
}

export interface AIPersonalizationData {
  frequentSymptoms: string[];
  healthGoals: HealthGoal[];
  chatHistory: ChatHistoryItem[];
  moodTracking: MoodTracking[];
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

export interface Reminder {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  time: string;
  active: boolean;
}

// Helper function to convert Date objects to strings for storage
const prepareDateObjectsForStorage = (data: ProfileData): any => {
  const processedData = JSON.parse(JSON.stringify(data));
  
  // Convert Date objects to ISO strings for storage
  if (processedData.basicInfo.dateOfBirth) {
    processedData.basicInfo.dateOfBirth = processedData.basicInfo.dateOfBirth instanceof Date 
      ? processedData.basicInfo.dateOfBirth.toISOString() 
      : processedData.basicInfo.dateOfBirth;
  }
  
  if (processedData.aiPersonalization) {
    // Process health goals
    if (processedData.aiPersonalization.healthGoals) {
      processedData.aiPersonalization.healthGoals = processedData.aiPersonalization.healthGoals.map((goal: any) => ({
        ...goal,
        startDate: goal.startDate ? new Date(goal.startDate).toISOString() : null,
        targetDate: goal.targetDate ? new Date(goal.targetDate).toISOString() : null
      }));
    }
    
    // Process chat history
    if (processedData.aiPersonalization.chatHistory) {
      processedData.aiPersonalization.chatHistory = processedData.aiPersonalization.chatHistory.map((chat: any) => {
        const processedChat = {
          ...chat,
          date: chat.date ? new Date(chat.date).toISOString() : null
        };
        
        // Process messages if they exist
        if (chat.messages && Array.isArray(chat.messages)) {
          processedChat.messages = chat.messages.map((message: any) => ({
            ...message,
            timestamp: message.timestamp ? new Date(message.timestamp).toISOString() : null
          }));
        }
        
        return processedChat;
      });
    }
    
    // Process mood tracking
    if (processedData.aiPersonalization.moodTracking) {
      processedData.aiPersonalization.moodTracking = processedData.aiPersonalization.moodTracking.map((mood: any) => ({
        ...mood,
        date: mood.date ? new Date(mood.date).toISOString() : null
      }));
    }
  }
  
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
      data.aiPersonalization.chatHistory = data.aiPersonalization.chatHistory.map(chat => {
        const restoredChat = {
          ...chat,
          date: new Date(chat.date)
        };
        
        // Restore message timestamps if they exist
        if (chat.messages && Array.isArray(chat.messages)) {
          restoredChat.messages = chat.messages.map((message: any) => ({
            ...message,
            timestamp: message.timestamp ? new Date(message.timestamp) : new Date()
          }));
        }
        
        return restoredChat;
      });
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

// Updated utility functions to manage profile data persistence with Supabase integration
export const saveProfileData = async (data: ProfileData, userId: string): Promise<{ success: boolean; error?: any }> => {
  try {
    // First try saving to Supabase if a userId is provided
    if (userId) {
      // Process data for storage - convert Date objects to strings
      const processedData = prepareDateObjectsForStorage(data);
      
      // Process basic info
      const { error: basicInfoError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          name: processedData.basicInfo.fullName,
          email: processedData.basicInfo.email,
          gender: processedData.basicInfo.gender,
          date_of_birth: processedData.basicInfo.dateOfBirth,
          phone: processedData.basicInfo.contactNumber,
          address: processedData.basicInfo.residentialAddress,
          avatar_url: processedData.basicInfo.profilePicture,
          updated_at: new Date().toISOString()
        });
      
      if (basicInfoError) throw basicInfoError;

      // Process medical info
      const { error: medicalInfoError } = await supabase
        .from('medical_info')
        .upsert({
          user_id: userId,
          blood_group: processedData.medicalInfo.bloodGroup,
          known_allergies: processedData.medicalInfo.knownAllergies.join(', '),
          chronic_conditions: processedData.medicalInfo.chronicConditions,
          current_medications: processedData.medicalInfo.currentMedications.join(', '),
          past_surgeries: processedData.medicalInfo.pastSurgeries,
          vaccination_records: processedData.medicalInfo.vaccinationRecords,
          family_medical_history: processedData.medicalInfo.familyMedicalHistory,
          updated_at: new Date().toISOString()
        });
      
      if (medicalInfoError) throw medicalInfoError;

      // Process health metrics
      const { error: healthMetricsError } = await supabase
        .from('health_metrics')
        .upsert({
          user_id: userId,
          height: processedData.healthMetrics.height,
          weight: processedData.healthMetrics.weight,
          bmi: processedData.healthMetrics.bmi,
          blood_pressure: processedData.healthMetrics.bloodPressure,
          heart_rate: processedData.healthMetrics.heartRate,
          glucose_levels: processedData.healthMetrics.glucoseLevels,
          oxygen_saturation: processedData.healthMetrics.oxygenSaturation,
          sleep_patterns: processedData.healthMetrics.sleepPatterns,
          exercise_routine: processedData.healthMetrics.exerciseRoutine,
          updated_at: new Date().toISOString()
        });
      
      if (healthMetricsError) throw healthMetricsError;

      // Process health records
      const { error: healthRecordsError } = await supabase
        .from('health_records')
        .upsert({
          user_id: userId,
          medical_reports: processedData.healthRecords.medicalReports,
          appointment_history: processedData.healthRecords.appointmentHistory,
          hospital_visits: processedData.healthRecords.hospitalVisits,
          insurance_provider: processedData.healthRecords.insuranceDetails.provider,
          insurance_policy_number: processedData.healthRecords.insuranceDetails.policyNumber,
          insurance_coverage: processedData.healthRecords.insuranceDetails.coverage,
          updated_at: new Date().toISOString()
        });
      
      if (healthRecordsError) throw healthRecordsError;

      // Process reminders preferences
      const { error: remindersError } = await supabase
        .from('reminders_preferences')
        .upsert({
          user_id: userId,
          medication_reminders: processedData.remindersPreferences.medicationReminders,
          appointment_reminders: processedData.remindersPreferences.appointmentReminders,
          preferred_chat_time: processedData.remindersPreferences.preferredChatTime,
          language_preference: processedData.remindersPreferences.languagePreference,
          email_notifications: processedData.remindersPreferences.notificationPreferences.email,
          sms_notifications: processedData.remindersPreferences.notificationPreferences.sms,
          push_notifications: processedData.remindersPreferences.notificationPreferences.push,
          updated_at: new Date().toISOString()
        });
      
      if (remindersError) throw remindersError;

      // Process account security
      const { error: accountSecurityError } = await supabase
        .from('account_security')
        .upsert({
          user_id: userId,
          username: processedData.accountSecurity.username,
          two_factor_enabled: processedData.accountSecurity.twoFactorEnabled,
          emergency_contact_name: processedData.accountSecurity.emergencyContact.name,
          emergency_contact_relationship: processedData.accountSecurity.emergencyContact.relationship,
          emergency_contact_phone: processedData.accountSecurity.emergencyContact.phone,
          data_consent: processedData.accountSecurity.dataConsent,
          user_role: processedData.accountSecurity.userRole,
          updated_at: new Date().toISOString()
        });
      
      if (accountSecurityError) throw accountSecurityError;

      // Process AI Personalization data
      const { error: profilesError } = await supabase
        .from('profiles')
        .update({
          frequent_symptoms: processedData.aiPersonalization.frequentSymptoms,
          health_goals: processedData.aiPersonalization.healthGoals,
          chat_history: processedData.aiPersonalization.chatHistory,
          mood_tracking: processedData.aiPersonalization.moodTracking,
          updated_at: new Date().toISOString()
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
    
    // Fix: Properly handle and type-cast the JSON data from Supabase
    const medicalReports = healthRecordsData?.medical_reports as Json[] || [];
    const appointmentHistory = healthRecordsData?.appointment_history as Json[] || [];
    const hospitalVisits = healthRecordsData?.hospital_visits as Json[] || [];
    
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
        knownAllergies: Array.isArray(medicalInfoData?.known_allergies) 
          ? medicalInfoData.known_allergies 
          : (medicalInfoData?.known_allergies?.split(',').map(s => s.trim()).filter(Boolean) || []),
        chronicConditions: medicalInfoData?.chronic_conditions || '',
        currentMedications: Array.isArray(medicalInfoData?.current_medications)
          ? medicalInfoData.current_medications
          : (medicalInfoData?.current_medications?.split(',').map(s => s.trim()).filter(Boolean) || []),
        pastSurgeries: medicalInfoData?.past_surgeries || '',
        vaccinationRecords: medicalInfoData?.vaccination_records || '',
        familyMedicalHistory: medicalInfoData?.family_medical_history || '',
        allergies: Array.isArray(medicalInfoData?.known_allergies) 
          ? medicalInfoData.known_allergies 
          : (medicalInfoData?.known_allergies?.split(',').map(s => s.trim()).filter(Boolean) || []),
        medications: Array.isArray(medicalInfoData?.current_medications)
          ? medicalInfoData.current_medications
          : (medicalInfoData?.current_medications?.split(',').map(s => s.trim()).filter(Boolean) || []),
        reminders: (medicalInfoData as any)?.reminders || [],
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
        // Fix: Properly cast JSON data to our expected types
        medicalReports: Array.isArray(medicalReports) 
          ? medicalReports.map(record => ({
              id: (record as any).id || '',
              name: (record as any).name || '',
              type: (record as any).type || '',
              date: (record as any).date || '',
              fileUrl: (record as any).fileUrl
            })) as HealthRecord[]
          : [],
        appointmentHistory: Array.isArray(appointmentHistory)
          ? appointmentHistory.map(appt => ({
              id: (appt as any).id || '',
              doctor: (appt as any).doctor || '',
              date: (appt as any).date || '',
              purpose: (appt as any).purpose || ''
            }))
          : [],
        hospitalVisits: Array.isArray(hospitalVisits)
          ? hospitalVisits.map(visit => ({
              id: (visit as any).id || '',
              hospital: (visit as any).hospital || '',
              date: (visit as any).date || '',
              reason: (visit as any).reason || ''
            }))
          : [],
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
        frequentSymptoms: (profileData.frequent_symptoms as string[]) || [],
        healthGoals: (profileData.health_goals as any[] || []).map(goal => ({
          goal: goal.goal || '',
          target: goal.target || '',
          progress: goal.progress || 0,
          startDate: goal.startDate ? new Date(goal.startDate) : null,
          targetDate: goal.targetDate ? new Date(goal.targetDate) : null
        })),
        chatHistory: (profileData.chat_history as any[] || []).map(chat => ({
          id: chat.id || '',
          topic: chat.topic || '',
          date: new Date(chat.date || new Date()),
          summary: chat.summary || '',
          messages: Array.isArray(chat.messages) 
            ? chat.messages.map((msg: any) => ({
                ...msg,
                timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
              }))
            : undefined
        })),
        moodTracking: (profileData.mood_tracking as any[] || []).map(mood => ({
          date: new Date(mood.date || new Date()),
          mood: mood.mood || 'neutral',
          notes: mood.notes || ''
        })),
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
      familyMedicalHistory: "",
      allergies: [],
      medications: [],
      reminders: [],
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
