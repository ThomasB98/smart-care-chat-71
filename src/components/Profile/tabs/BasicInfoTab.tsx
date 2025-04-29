
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BasicInfo } from "@/types/profile";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BasicInfoTabProps {
  data: BasicInfo;
  onUpdate: (data: BasicInfo) => void;
}

const BasicInfoTab = ({ data, onUpdate }: BasicInfoTabProps) => {
  const [formData, setFormData] = useState<BasicInfo>(data);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <h3 className="text-xl font-semibold">Basic Information</h3>
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
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label>Gender</Label>
              <RadioGroup
                value={formData.gender}
                disabled={!isEditing}
                onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                className="flex space-x-4 mt-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="male" id="male" />
                  <Label htmlFor="male">Male</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="female" id="female" />
                  <Label htmlFor="female">Female</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div>
              <Label>Date of Birth</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !formData.dateOfBirth && "text-muted-foreground",
                      !isEditing && "pointer-events-none"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.dateOfBirth ? (
                      format(formData.dateOfBirth, "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.dateOfBirth || undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, dateOfBirth: date }))}
                    disabled={!isEditing}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="contactNumber">Contact Number</Label>
              <Input
                id="contactNumber"
                name="contactNumber"
                value={formData.contactNumber}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                disabled={!isEditing}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="residentialAddress">Residential Address</Label>
            <Input
              id="residentialAddress"
              name="residentialAddress"
              value={formData.residentialAddress}
              onChange={handleChange}
              disabled={!isEditing}
            />
          </div>
        </div>
      </form>
    </div>
  );
};

export default BasicInfoTab;
