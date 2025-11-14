"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building, Lock, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/hooks/useAppContext";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Terminal } from "lucide-react";

export default function LoginPage() {
  const { user, login } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = () => {
    setError(null);
    const result = login(username, password);
    if (result.success) {
      router.push("/dashboard");
    } else {
      setError(result.message);
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: result.message,
      });
    }
  };

  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="mx-auto bg-primary text-primary-foreground p-3 rounded-full w-fit mb-4">
              <Building className="h-8 w-8" />
            </div>
            <CardTitle className="font-headline text-3xl">AggieRequest</CardTitle>
            <CardDescription>After-Hours Access Request System</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertTitle>Error</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                 <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="username" 
                    placeholder="Enter your username" 
                    value={username} 
                    onChange={(e) => setUsername(e.target.value)}
                    className="pl-10"
                  />
                 </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                 <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="Enter your password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                onClick={handleLogin}
                disabled={!username || !password}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
              >
                Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
        <p className="text-center text-xs text-muted-foreground mt-6">
          &copy; {new Date().getFullYear()} NCAT Senior Project Prototype.
        </p>
      </div>
    </main>
  );
}
