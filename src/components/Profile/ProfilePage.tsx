
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import { ProfileData, saveProfileData, loadProfileData } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ProfilePageProps {
  userData: {
    email: string;
    name: string;
  };
}

const ProfilePage = ({ userData }: ProfilePageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  
  // Initialize with data from localStorage or defaults
  const [profileData, setProfileData] = useState<ProfileData>(() => loadProfileData(userData));
  
  // Update profile image from saved data on initial load
  useEffect(() => {
    if (profileData.basicInfo.profilePicture) {
      setProfileImage(profileData.basicInfo.profilePicture);
    }
  }, []);
  
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
    setProfileData(prev => {
      const updatedData = {
        ...prev,
        [section]: data
      };
      
      // Save to localStorage after each update
      saveProfileData(updatedData);
      
      // Show success toast
      toast({
        title: "Data saved successfully",
        description: `Your ${getSectionDisplayName(section)} has been updated.`,
      });
      
      return updatedData;
    });
  };
  
  const getSectionDisplayName = (section: string): string => {
    switch(section) {
      case "basicInfo": return "Basic Information";
      case "medicalInfo": return "Medical Information";
      case "healthMetrics": return "Health Metrics";
      case "healthRecords": return "Health Records";
      case "remindersPreferences": return "Reminders & Preferences";
      case "accountSecurity": return "Account Security";
      case "aiPersonalization": return "AI Personalization";
      default: return section;
    }
  };
  
  return (
    <div className="w-full px-4 py-6 md:py-8">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            className="flex items-center text-healthcare-primary hover:text-healthcare-dark mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Chat
          </Button>
          <h1 className="text-2xl md:text-3xl font-bold">My Health Profile</h1>
        </div>
        
        <ProfileHeader 
          userData={{ ...userData, profileImage }}
          onImageChange={handleProfileImageChange}
        />
        
        <div className="mt-8">
          <ProfileTabs 
            profileData={profileData}
            updateProfileData={updateProfileData}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
