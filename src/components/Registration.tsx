
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { MessageCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface RegistrationProps {
  onRegister: (userData: { email: string; name: string; id: string }) => void;
  onBackToLogin: () => void;
}

const Registration = ({ onRegister, onBackToLogin }: RegistrationProps) => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    
    // Simple validation
    if (!name || !email || !password) {
      setError("Please fill all required fields");
      setIsLoading(false);
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }
    
    try {
      console.log("Attempting registration for:", email);
      
      // Register with Supabase - include redirect URL for email confirmation
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            name: name.trim()
          },
          emailRedirectTo: redirectUrl
        }
      });
      
      if (error) {
        console.error("Registration error:", error);
        
        if (error.message.includes("User already registered")) {
          setError("An account with this email already exists. Please try logging in instead.");
        } else if (error.message.includes("Invalid email")) {
          setError("Please enter a valid email address.");
        } else {
          setError(`Registration failed: ${error.message}`);
        }
        setIsLoading(false);
        return;
      }
      
      console.log("Registration successful:", data);
      
      if (data.user) {
        // Check if email confirmation is required
        if (data.user.email_confirmed_at) {
          // User is confirmed, can login immediately
          toast({
            title: "Registration successful",
            description: "Your account has been created successfully!",
          });
          
          onRegister({ 
            email: data.user.email || email, 
            name: name,
            id: data.user.id
          });
        } else {
          // Email confirmation required
          toast({
            title: "Registration successful",
            description: "Please check your email and confirm your account before logging in.",
            duration: 6000,
          });
          
          // For development/testing, still allow login if email confirmation is disabled
          setTimeout(() => {
            onRegister({ 
              email: data.user?.email || email, 
              name: name,
              id: data.user?.id || ''
            });
          }, 1000);
        }
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      setError("An unexpected error occurred during registration. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center p-4 h-full bg-healthcare-light">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-12 w-12 bg-healthcare-primary">
              <MessageCircle className="h-6 w-6 text-white" />
            </Avatar>
          </div>
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Sign up to use the healthcare assistant
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister}>
            <div className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="name" className="text-sm font-medium">Full Name</label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Email</label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium">Password</label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm Password</label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-3 rounded">
                  {error}
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full mt-6 bg-healthcare-primary hover:bg-healthcare-dark"
              disabled={isLoading}
            >
              {isLoading ? "Creating Account..." : "Register"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col">
          <Button 
            variant="ghost" 
            className="mt-2"
            onClick={onBackToLogin}
          >
            Already have an account? Login
          </Button>
          <p className="text-xs text-center text-gray-500 mt-2">
            Your data will be stored securely in our database
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Registration;
