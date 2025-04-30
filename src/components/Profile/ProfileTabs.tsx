
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BasicInfoTab from "./tabs/BasicInfoTab";
import MedicalInfoTab from "./tabs/MedicalInfoTab";
import HealthMetricsTab from "./tabs/HealthMetricsTab";
import HealthRecordsTab from "./tabs/HealthRecordsTab";
import RemindersTab from "./tabs/RemindersTab";
import AccountSecurityTab from "./tabs/AccountSecurityTab";
import AIPersonalizationTab from "./tabs/AIPersonalizationTab";
import { ProfileData } from "@/types/profile";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProfileTabsProps {
  profileData: ProfileData;
  updateProfileData: (section: string, data: any) => void;
}

const ProfileTabs = ({ profileData, updateProfileData }: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState("basic-info");
  
  return (
    <Tabs defaultValue="basic-info" value={activeTab} onValueChange={setActiveTab} className="w-full">
      <ScrollArea className="mb-6 pb-2 w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1">
          <TabsTrigger value="basic-info">Basic Info</TabsTrigger>
          <TabsTrigger value="medical-info">Medical</TabsTrigger>
          <TabsTrigger value="health-metrics">Metrics</TabsTrigger>
          <TabsTrigger value="health-records">Records</TabsTrigger>
          <TabsTrigger value="reminders">Reminders</TabsTrigger>
          <TabsTrigger value="ai-data">AI Data</TabsTrigger>
          <TabsTrigger value="account">Account</TabsTrigger>
        </TabsList>
      </ScrollArea>
      
      <div className="mt-6">
        <TabsContent value="basic-info">
          <BasicInfoTab 
            data={profileData.basicInfo} 
            onUpdate={(data) => updateProfileData("basicInfo", data)} 
          />
        </TabsContent>
        
        <TabsContent value="medical-info">
          <MedicalInfoTab 
            data={profileData.medicalInfo} 
            onUpdate={(data) => updateProfileData("medicalInfo", data)} 
          />
        </TabsContent>
        
        <TabsContent value="health-metrics">
          <HealthMetricsTab 
            data={profileData.healthMetrics} 
            onUpdate={(data) => updateProfileData("healthMetrics", data)} 
          />
        </TabsContent>
        
        <TabsContent value="health-records">
          <HealthRecordsTab 
            data={profileData.healthRecords} 
            onUpdate={(data) => updateProfileData("healthRecords", data)} 
          />
        </TabsContent>
        
        <TabsContent value="reminders">
          <RemindersTab 
            data={profileData.remindersPreferences} 
            onUpdate={(data) => updateProfileData("remindersPreferences", data)} 
          />
        </TabsContent>
        
        <TabsContent value="ai-data">
          <AIPersonalizationTab 
            data={profileData.aiPersonalization} 
            onUpdate={(data) => updateProfileData("aiPersonalization", data)} 
          />
        </TabsContent>
        
        <TabsContent value="account">
          <AccountSecurityTab 
            data={profileData.accountSecurity} 
            onUpdate={(data) => updateProfileData("accountSecurity", data)} 
          />
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default ProfileTabs;
