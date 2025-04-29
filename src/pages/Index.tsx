
import React, { useState } from "react";
import ChatInterface from "@/components/ChatInterface";
import ProfilePage from "@/components/Profile/ProfilePage";
import { useLocation } from "react-router-dom";

const Index = () => {
  const location = useLocation();
  const userData = location.state?.userData || { name: "", email: "" };

  return (
    <div className="min-h-screen bg-gradient-to-b from-healthcare-light to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] min-h-[500px] shadow-xl rounded-xl overflow-hidden bg-white border border-gray-100">
        {location.pathname === "/profile" ? (
          <ProfilePage userData={userData} />
        ) : (
          <ChatInterface />
        )}
      </div>
    </div>
  );
};

export default Index;
