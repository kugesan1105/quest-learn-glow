
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
import { Lock } from "lucide-react";

export default function Index() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, we'd validate and authenticate
    // For now, just navigate to the dashboard
    navigate("/dashboard");
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
                <CardTitle className="text-center">Login to Learn</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin}>
                  <div className="space-y-4">
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
                  </div>
                </form>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full btn-gradient" 
                  size="lg"
                  onClick={handleLogin}
                >
                  Login to Learn
                </Button>
              </CardFooter>
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
