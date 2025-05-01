
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import ProfileHeader from "./ProfileHeader";
import ProfileTabs from "./ProfileTabs";
import { ProfileData, saveProfileData, loadProfileData } from "@/types/profile";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ProfilePageProps {
  userData: {
    email: string;
    name: string;
    id?: string;
  };
}

const ProfilePage = ({ userData }: ProfilePageProps) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [profileImage, setProfileImage] = useState<string | undefined>(undefined);
  const [currentUser, setCurrentUser] = useState<{ email: string; name: string; id: string } | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Initialize with data from Supabase or localStorage as fallback
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  
  useEffect(() => {
    const checkAuthAndLoadProfile = async () => {
      try {
        setLoading(true);
        
        // Get current user from Supabase auth
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          const userInfo = {
            id: user.id,
            email: user.email || userData.email,
            name: userData.name // Use provided name as Supabase auth doesn't store names
          };
          
          setCurrentUser(userInfo);
          
          // Load profile data from Supabase using user ID
          const profileData = await loadProfileData(userInfo);
          setProfileData(profileData);
          
          if (profileData.basicInfo.profilePicture) {
            setProfileImage(profileData.basicInfo.profilePicture);
          }
        } else {
          // Not authenticated, show message and redirect
          toast({
            title: "Authentication required",
            description: "Please sign in to access your profile",
            variant: "destructive",
          });
          navigate('/');
        }
      } catch (error) {
        console.error("Error loading profile:", error);
        toast({
          title: "Error loading profile",
          description: "There was a problem loading your profile data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthAndLoadProfile();
  }, [userData.name, userData.email, navigate, toast]);
  
  // Update profile image from saved data on initial load
  useEffect(() => {
    if (profileData?.basicInfo.profilePicture) {
      setProfileImage(profileData.basicInfo.profilePicture);
    }
  }, [profileData]);
  
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const imageUrl = URL.createObjectURL(e.target.files[0]);
      setProfileImage(imageUrl);
      
      // Update the profile data with the new image
      if (profileData) {
        updateProfileData("basicInfo", {
          ...profileData.basicInfo,
          profilePicture: imageUrl
        });
      }
    }
  };
  
  const updateProfileData = async (section: string, data: any) => {
    if (!currentUser || !profileData) return;
    
    setProfileData(prev => {
      if (!prev) return null;
      
      const updatedData = {
        ...prev,
        [section]: data
      };
      
      // Save to Supabase
      saveProfileData(updatedData, currentUser.id)
        .then(({ success, error }) => {
          if (success) {
            toast({
              title: "Data saved successfully",
              description: `Your ${getSectionDisplayName(section)} has been updated.`,
            });
          } else {
            console.error("Error saving data:", error);
            toast({
              title: "Error saving data",
              description: "There was a problem saving your data. Changes were saved locally.",
              variant: "destructive",
            });
          }
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
  
  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Loading your profile...</p>
      </div>
    );
  }
  
  if (!profileData || !currentUser) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <p>Please sign in to view your profile</p>
      </div>
    );
  }
  
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
