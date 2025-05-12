import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileUpload } from '@/components/FileUpload';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

export default function Index() {
  const navigate = useNavigate();
  const { login, signup, user: authUser } = useAuth(); // Get user from auth context
  const [isLoading, setIsLoading] = useState(false);
  
  // Login state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginRoleUI, setLoginRoleUI] = useState<'student' | 'teacher'>('student'); // loginRole is still used for the RadioGroup, but not passed to auth.login()
  
  // Register state
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerRole, setRegisterRole] = useState<'student' | 'teacher'>('student');
  const [profileImage, setProfileImage] = useState<File | null>(null);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Logging in with:', {
        loginEmail,
        loginPassword,
        loginRoleUI,
    });
    try {
      // Call login without role, backend determines role
      const success = await login(loginEmail, loginPassword); 
      if (success && authUser) { // Check authUser after login success
        console.log('Login result:', authUser);
        localStorage.setItem('role', authUser.role);
        console.log('Logging in with:', {
            loginEmail,
            loginPassword,
            loginRoleUI,
        });
        toast({
          title: 'Login successful',
          description: `Welcome back, ${authUser.name}!`, // Use name from authUser
        });
        
        // Navigate based on role from authUser
        if (authUser.role === 'teacher') {
          navigate('/teacher/dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast({
          title: 'Login failed',
          description: 'Invalid credentials. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Login error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    console.log('Registering with:', {
        registerName,
        registerEmail,
        registerPassword,
        registerRole,
        profileImage,
    });
    if (!registerName || !registerEmail || !registerPassword) {
        toast({
            title: 'Registration failed',
            description: 'Please fill in all required fields.',
            variant: 'destructive',
        });
        setIsLoading(false);
        return;
    }

    try {
        let profileImageDataUrl = null;

        if (profileImage) {
            const reader = new FileReader();
            profileImageDataUrl = await new Promise<string>((resolve) => {
                reader.onload = (e) => resolve(e.target?.result as string);
                reader.readAsDataURL(profileImage);
            });
        }
        console.log('Profile Image Data URL:', profileImageDataUrl);
        const success = await signup(
            registerName,
            registerEmail,
            registerPassword,
            registerRole, 
            profileImageDataUrl || null
        );
        console.log('Registration success:', success);
        if (success) {
            toast({
                title: 'Registration successful',
                description: 'Your account has been created.',
            });
            navigate(registerRole === 'teacher' ? '/teacher/dashboard' : '/dashboard');
        } else {
            toast({
                title: 'Registration failed',
                description: 'This email may already be registered.',
                variant: 'destructive',
            });
        }
    } catch (error) {
        toast({
            title: 'Registration error',
            description: 'An unexpected error occurred. Please try again.',
            variant: 'destructive',
        });
    } finally {
        console.log('Loading state:', isLoading);
        setIsLoading(false);
    }
  };
  
  const handleFileSelect = (file: File) => {
    setProfileImage(file);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-gradient-main rounded-xl flex items-center justify-center mb-4">
            <span className="text-white font-bold text-2xl">E</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-main bg-clip-text text-transparent">EduQuest</h1>
          <p className="text-muted-foreground text-center mt-2">Your interactive learning platform</p>
        </div>
        
        <Card className="w-full">
          <Tabs defaultValue="login">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Register</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <CardHeader>
                <CardTitle>Welcome back</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      placeholder="your@email.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input 
                      id="password" 
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full bg-gradient-main" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
            
            <TabsContent value="register">
              <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>Enter your details to create your account</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input 
                      id="name" 
                      placeholder="John Doe"
                      value={registerName}
                      onChange={(e) => setRegisterName(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email">Email</Label>
                    <Input 
                      id="register-email" 
                      type="email" 
                      placeholder="your@email.com"
                      value={registerEmail}
                      onChange={(e) => setRegisterEmail(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password">Password</Label>
                    <Input 
                      id="register-password" 
                      type="password"
                      value={registerPassword}
                      onChange={(e) => setRegisterPassword(e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>I am a</Label>
                    <RadioGroup 
                      defaultValue="student" 
                      value={registerRole}
                      onValueChange={(value) => setRegisterRole(value as 'student' | 'teacher')}
                      className="flex space-x-4"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="student" id="student-register" />
                        <Label htmlFor="student-register">Student</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="teacher" id="teacher-register" />
                        <Label htmlFor="teacher-register">Teacher</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Profile Picture (optional)</Label>
                    <FileUpload onFileSelect={handleFileSelect} />
                  </div>
                  
                  <Button type="submit" className="w-full bg-gradient-main" disabled={isLoading}>
                    {isLoading ? 'Creating account...' : 'Create Account'}
                  </Button>
                </form>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}
