
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { useState } from "react";

const queryClient = new QueryClient();

const App = () => {
  const [userData, setUserData] = useState<{ email: string; name: string }>({ email: "", name: "" });
  
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRoutes userData={userData} setUserData={setUserData} />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

interface AppRoutesProps {
  userData: { email: string; name: string };
  setUserData: (userData: { email: string; name: string }) => void;
}

const AppRoutes = ({ userData, setUserData }: AppRoutesProps) => {
  return (
    <Routes>
      <Route path="/" element={
        <Index 
          userData={userData} 
          setUserData={setUserData} 
        />
      } />
      <Route path="/profile" element={
        <Index 
          userData={userData} 
          setUserData={setUserData} 
          defaultRoute="/profile" 
        />
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
