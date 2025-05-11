import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function Index() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [role, setRole] = useState("student");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(""); 
    try {
      const res = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        if (errorData && errorData.error) {
          setErrorMessage(errorData.error);
        } else {
          setErrorMessage("Login failed");
        }
        return;
      }

      const data = await res.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userName", data.name);
      localStorage.setItem("userProfileImage", data.profileImage || "");
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      setErrorMessage("Login error!");
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      console.log("name", name);
      console.log("email", email);
      console.log("password", password);
      console.log("profileImage", profileImage);
      const res = await fetch("http://localhost:8000/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
          profileImage,
          role,
        }),
      });
  
      if (!res.ok) {
        throw new Error("Signup failed");
      }
  
      const data = await res.json();
      alert(data.message);
      localStorage.setItem("userName", name);
      localStorage.setItem("userEmail", email);
      localStorage.setItem("userProfileImage", profileImage || "");
      localStorage.setItem("userRole", role);
      navigate("/dashboard");
    } catch (err) {
      console.error(err);
      alert("Signup error!");
    }
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setProfileImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <div className="hero-gradient py-6">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="font-bold text-xl text-white">EduQuest</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row">
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 md:p-16">
          <div className="max-w-md w-full">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-main bg-clip-text text-transparent">
                Unlock Your Learning Journey
              </h1>
              <p className="text-muted-foreground">
                Complete tasks to progress through your personalized learning path.
                Each completed task will unlock new adventures in knowledge!
              </p>
            </div>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-center">Welcome to EduQuest</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="login" className="w-full">
                  <TabsList className="grid w-full grid-cols-2 mb-4">
                    <TabsTrigger value="login">Login</TabsTrigger>
                    <TabsTrigger value="signup">Sign Up</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="login">
                    <form onSubmit={handleLogin} className="space-y-4">
                      {errorMessage && (
                        <div className="text-red-500 text-sm">{errorMessage}</div>
                      )}
                      <div className="space-y-2">
                        <Input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <Button 
                        className="w-full btn-gradient" 
                        size="lg"
                        type="submit"
                      >
                        Login to Learn
                      </Button>
                    </form>
                  </TabsContent>
                  
                  <TabsContent value="signup">
                    <form onSubmit={handleSignup} className="space-y-4">
                      <div className="flex flex-col items-center mb-4">
                        <div className="relative group cursor-pointer mb-2">
                          <Avatar className="h-20 w-20 border-4 border-purple-light">
                            {profileImage ? (
                              <AvatarImage src={profileImage} alt="Profile" />
                            ) : (
                              <AvatarFallback className="bg-gradient-main text-white">
                                <User size={30} />
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <span className="text-white text-xs">Change</span>
                          </div>
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="absolute inset-0 opacity-0 cursor-pointer" 
                            onChange={handleImageUpload}
                          />
                        </div>
                        <Label htmlFor="profile-image" className="text-sm text-muted-foreground">
                          Profile Picture
                        </Label>
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="text"
                          placeholder="Full Name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="email"
                          placeholder="Email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Input
                          type="password"
                          placeholder="Password"
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                          Role
                        </label>
                        <select
                          id="role"
                          value={role}
                          onChange={(e) => setRole(e.target.value)}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          required
                        >
                          <option value="student">Student</option>
                          <option value="teacher">Teacher</option>
                        </select>
                      </div>
                      <Button 
                        className="w-full btn-gradient" 
                        size="lg"
                        type="submit"
                      >
                        Create Account
                      </Button>
                    </form>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="hidden md:flex md:w-1/2 bg-gradient-main items-center justify-center p-16">
          <div className="text-center text-white">
            <div className="mb-8 transform -rotate-6">
              <div className="w-24 h-24 mx-auto bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <Lock size={48} className="text-white" />
              </div>
              <p className="text-lg font-semibold">Begin Your Learning Quest</p>
            </div>
            
            <div className="mb-8 transform rotate-6">
              <div className="w-24 h-24 mx-auto bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <p className="text-lg font-semibold">Track Your Progress</p>
            </div>
            
            <div className="transform -rotate-3">
              <div className="w-24 h-24 mx-auto bg-white/20 rounded-xl flex items-center justify-center mb-4">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
              </div>
              <p className="text-lg font-semibold">Complete Challenges</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}