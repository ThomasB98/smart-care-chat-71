import { useState, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { User, Camera } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface ProfileHeaderProps {
  userData: {
    name?: string;
    email?: string;
    profileImage?: string;
  };
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileHeader = ({ userData, onImageChange }: ProfileHeaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && userData.email) {
      const file = e.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${userData.email}-${Date.now()}.${fileExt}`;
      const filePath = `profile-images/${fileName}`;

      const { error } = await supabase.storage
        .from('user-data')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (error) {
        console.error('Error uploading image:', error);
      } else {
        console.log('Image uploaded successfully');
        onImageChange(e);
      }
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center">
          <div className="relative mb-4">
            <Avatar className="h-24 w-24 border-4 border-white shadow-md">
              <AvatarImage src={userData.profileImage || "https://github.com/shadcn.png"} alt={userData.name} />
              <AvatarFallback>{userData.name?.charAt(0)}</AvatarFallback>
            </Avatar>
            <Button
              size="icon"
              variant="outline"
              className="absolute bottom-0 right-0 rounded-full bg-white"
              onClick={handleImageClick}
            >
              <Camera className="h-4 w-4" />
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleUploadImage}
              accept="image/*"
            />
          </div>
          <h2 className="text-2xl font-bold">{userData.name || "User Name"}</h2>
          <p className="text-sm text-muted-foreground">{userData.email || "user@example.com"}</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileHeader;
