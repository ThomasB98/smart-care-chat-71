
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { AccountSecurity } from "@/types/profile";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface AccountSecurityTabProps {
  data: AccountSecurity;
  onUpdate: (data: AccountSecurity) => void;
}

const AccountSecurityTab = ({ data, onUpdate }: AccountSecurityTabProps) => {
  const [formData, setFormData] = useState<AccountSecurity>(data);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEmergencyContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      emergencyContact: { ...prev.emergencyContact, [name]: value }
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(formData);
    setIsEditing(false);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Account & Security</h3>
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
            <h4 className="text-lg font-medium">Account Information</h4>
            
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>
            
            {isEditing && (
              <div>
                <Label htmlFor="newPassword">Change Password</Label>
                <Input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  placeholder="Enter new password"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to keep your current password
                </p>
              </div>
            )}
            
            <div className="flex items-center justify-between">
              <Label htmlFor="twoFactorEnabled" className="cursor-pointer">
                Two-Factor Authentication
              </Label>
              <Switch
                id="twoFactorEnabled"
                checked={formData.twoFactorEnabled}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, twoFactorEnabled: checked }))
                }
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="userRole">User Role</Label>
              <Select 
                disabled={!isEditing}
                value={formData.userRole}
                onValueChange={(value) => setFormData(prev => ({ ...prev, userRole: value }))}
              >
                <SelectTrigger id="userRole">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="caregiver">Caregiver</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Emergency Contact</h4>
            
            <div>
              <Label htmlFor="emergencyName">Name</Label>
              <Input
                id="emergencyName"
                name="name"
                value={formData.emergencyContact.name}
                onChange={handleEmergencyContactChange}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="emergencyRelationship">Relationship</Label>
              <Input
                id="emergencyRelationship"
                name="relationship"
                value={formData.emergencyContact.relationship}
                onChange={handleEmergencyContactChange}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="emergencyPhone">Phone Number</Label>
              <Input
                id="emergencyPhone"
                name="phone"
                value={formData.emergencyContact.phone}
                onChange={handleEmergencyContactChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h4 className="text-lg font-medium">Privacy & Consent</h4>
            
            <div className="flex items-start space-x-2">
              <Checkbox
                id="dataConsent"
                checked={formData.dataConsent}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({ ...prev, dataConsent: checked as boolean }))
                }
                disabled={!isEditing}
              />
              <div className="grid gap-1.5 leading-none">
                <Label
                  htmlFor="dataConsent"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Data Usage Consent
                </Label>
                <p className="text-xs text-gray-500">
                  I consent to the use of my health data in accordance with 
                  HIPAA regulations for the purpose of receiving healthcare services.
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AccountSecurityTab;
