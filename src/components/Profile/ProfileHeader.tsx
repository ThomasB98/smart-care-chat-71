
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Camera } from "lucide-react";

interface ProfileHeaderProps {
  userData: {
    email: string;
    name: string;
    profileImage?: string;
  };
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileHeader = ({ userData, onImageChange }: ProfileHeaderProps) => {
  const [isHovering, setIsHovering] = useState(false);
  
  return (
    <div className="flex flex-col items-center mb-6">
      <div 
        className="relative"
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        <Avatar className="h-24 w-24 border-2 border-healthcare-primary">
          {userData.profileImage ? (
            <AvatarImage src={userData.profileImage} alt={userData.name} />
          ) : (
            <AvatarFallback className="bg-healthcare-light text-healthcare-primary text-xl">
              <User size={36} />
            </AvatarFallback>
          )}
        </Avatar>
        
        {isHovering && (
          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center cursor-pointer">
            <label htmlFor="profile-image" className="cursor-pointer p-2">
              <Camera className="text-white" />
              <input
                id="profile-image"
                type="file"
                className="hidden"
                accept="image/*"
                onChange={onImageChange}
              />
            </label>
          </div>
        )}
      </div>
      
      <h2 className="text-2xl font-bold mt-4">{userData.name}</h2>
      <p className="text-gray-500">{userData.email}</p>
    </div>
  );
};

export default ProfileHeader;
