
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import { ProfileData } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProfilePageProps {
  userData: {
    email: string;
    name: string;
  };
}

const ProfilePage = ({ userData }: ProfilePageProps) => {
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  
  // Initialize with default profile data
  const [profileData, setProfileData] = useState<ProfileData>({
    basicInfo: {
      fullName: userData.name || "",
      gender: "",
      dateOfBirth: null,
      contactNumber: "",
      email: userData.email || "",
      residentialAddress: "",
      profilePicture: profileImage
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
  });
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      setProfileImage(imageUrl);
      
      // Update the profile data with the new image
      updateProfileData("basicInfo", {
        ...profileData.basicInfo,
        profilePicture: imageUrl
      });
    }
  };
  
  const updateProfileData = (section: string, data: any) => {
    setProfileData(prev => ({
      ...prev,
      [section]: data
    }));
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-healthcare-light to-white p-4 md:p-8">
      <Card className="max-w-5xl mx-auto">
        <CardContent className="p-6 md:p-8">
          <div className="mb-6">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/')}
              className="flex items-center text-healthcare-primary hover:text-healthcare-dark mb-4"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Chat
            </Button>
            <h1 className="text-3xl font-bold">My Health Profile</h1>
          </div>
          
          <ProfileHeader 
            userData={{ ...userData, profileImage }}
            onImageChange={handleProfileImageChange}
          />
          
          <ProfileTabs 
            profileData={profileData}
            updateProfileData={updateProfileData}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
