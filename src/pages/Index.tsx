
import React, { useState, useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";
import ProfilePage from "@/components/Profile/ProfilePage";
import Login from "@/components/Login";
import Registration from "@/components/Registration";
import { useNavigate, useLocation } from "react-router-dom";

interface IndexProps {
  userData: { email: string; name: string };
  setUserData: (userData: { email: string; name: string }) => void;
  defaultRoute?: string;
}

const Index = ({ userData, setUserData, defaultRoute = "/" }: IndexProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showRegistration, setShowRegistration] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // Check if user is authenticated when component mounts
  useEffect(() => {
    if (userData.email && userData.name) {
      setIsAuthenticated(true);
    }
  }, [userData]);
  
  // Handle default route navigation
  useEffect(() => {
    if (isAuthenticated && defaultRoute && location.pathname !== defaultRoute) {
      navigate(defaultRoute);
    }
  }, [isAuthenticated, defaultRoute, navigate, location.pathname]);
  
  const handleLogin = (data: { email: string; name: string }) => {
    setUserData(data);
    setIsAuthenticated(true);
  };
  
  const handleRegister = (data: { email: string; name: string }) => {
    setUserData(data);
    setIsAuthenticated(true);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-healthcare-light to-white flex items-center justify-center p-4">
      <div className="w-full max-w-4xl h-[90vh] min-h-[500px] shadow-xl rounded-xl overflow-hidden bg-white border border-gray-100">
        {!isAuthenticated ? (
          showRegistration ? (
            <Registration 
              onRegister={handleRegister} 
              onBackToLogin={() => setShowRegistration(false)} 
            />
          ) : (
            <Login 
              onLogin={handleLogin} 
              onRegister={() => setShowRegistration(true)} 
            />
          )
        ) : location.pathname === "/profile" ? (
          <ProfilePage userData={userData} />
        ) : (
          <ChatInterface />
        )}
      </div>
    </div>
  );
};

export default Index;
