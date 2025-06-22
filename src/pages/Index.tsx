
import React, { useState, useEffect } from "react";
import ChatInterface from "@/components/ChatInterface";
import ProfilePage from "@/components/Profile/ProfilePage";
import Login from "@/components/Login";
import Registration from "@/components/Registration";
import { useNavigate, useLocation } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";

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
  const [isLoading, setIsLoading] = useState(true);
  
  // Check authentication status on mount
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication status...");
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          console.log("User is authenticated:", user.email);
          const userDataObj = {
            email: user.email || '',
            name: user.user_metadata?.name || user.email?.split('@')[0] || 'User'
          };
          setUserData(userDataObj);
          setIsAuthenticated(true);
        } else {
          console.log("No authenticated user found");
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAuth();
  }, [setUserData]);
  
  // Handle userData changes
  useEffect(() => {
    if (userData.email && userData.name) {
      console.log("User data updated:", userData);
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
    console.log("Login successful:", data);
    setUserData(data);
    setIsAuthenticated(true);
  };
  
  const handleRegister = (data: { email: string; name: string }) => {
    console.log("Registration successful:", data);
    setUserData(data);
    setIsAuthenticated(true);
  };
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-healthcare-light to-white flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-healthcare-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-healthcare-light to-white flex items-center justify-center p-4 overflow-auto">
      <div className="w-full max-w-4xl h-[90vh] min-h-[500px] shadow-xl rounded-xl bg-white border border-gray-100">
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
          <ScrollArea className="h-full overflow-auto">
            <ProfilePage userData={userData} />
          </ScrollArea>
        ) : (
          <ChatInterface />
        )}
      </div>
    </div>
  );
};

export default Index;
