
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RemindersPreferences } from "@/types/profile";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface RemindersTabProps {
  data: RemindersPreferences;
  onUpdate: (data: RemindersPreferences) => void;
}

const RemindersTab = ({ data, onUpdate }: RemindersTabProps) => {
  const [formData, setFormData] = useState<RemindersPreferences>(data);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleSwitchChange = (field: string, checked: boolean) => {
    setFormData(prev => ({ ...prev, [field]: checked }));
  };
  
  const handleNotificationChange = (field: string, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      notificationPreferences: { ...prev.notificationPreferences, [field]: checked }
    }));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Reminders & Preferences</h3>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} variant="outline">Edit</Button>
        ) : (
          <div className="space-x-2">
            <Button onClick={() => setIsEditing(false)} variant="outline">Cancel</Button>
            <Button onClick={handleSubmit} type="submit">Save</Button>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Reminder Settings</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="medicationReminders" className="cursor-pointer">
                Medication Reminders
              </Label>
              <Switch
                id="medicationReminders"
                checked={formData.medicationReminders}
                onCheckedChange={(checked) => handleSwitchChange('medicationReminders', checked)}
                disabled={!isEditing}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="appointmentReminders" className="cursor-pointer">
                Appointment Reminders
              </Label>
              <Switch
                id="appointmentReminders"
                checked={formData.appointmentReminders}
                onCheckedChange={(checked) => handleSwitchChange('appointmentReminders', checked)}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Communication Preferences</h4>
            
            <div>
              <Label htmlFor="preferredChatTime">Preferred Time for Chatbot Interaction</Label>
              <Input
                id="preferredChatTime"
                name="preferredChatTime"
                placeholder="e.g., Morning, Evening"
                value={formData.preferredChatTime}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="languagePreference">Language Preference</Label>
              <Select 
                disabled={!isEditing}
                value={formData.languagePreference}
                onValueChange={(value) => setFormData(prev => ({ ...prev, languagePreference: value }))}
              >
                <SelectTrigger id="languagePreference">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="spanish">Spanish</SelectItem>
                  <SelectItem value="french">French</SelectItem>
                  <SelectItem value="german">German</SelectItem>
                  <SelectItem value="chinese">Chinese</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Notification Preferences</h4>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="emailNotifications" className="cursor-pointer">
                Email Notifications
              </Label>
              <Switch
                id="emailNotifications"
                checked={formData.notificationPreferences.email}
                onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                disabled={!isEditing}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="smsNotifications" className="cursor-pointer">
                SMS Notifications
              </Label>
              <Switch
                id="smsNotifications"
                checked={formData.notificationPreferences.sms}
                onCheckedChange={(checked) => handleNotificationChange('sms', checked)}
                disabled={!isEditing}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <Label htmlFor="pushNotifications" className="cursor-pointer">
                Push Notifications
              </Label>
              <Switch
                id="pushNotifications"
                checked={formData.notificationPreferences.push}
                onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                disabled={!isEditing}
              />
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default RemindersTab;
