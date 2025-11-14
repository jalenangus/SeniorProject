"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Building, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { mockUsers } from "@/lib/mock-data";
import { useAppContext } from "@/hooks/useAppContext";

export default function LoginPage() {
  const { user, login } = useAppContext();
  const router = useRouter();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  const handleLogin = () => {
    if (selectedUserId) {
      login(parseInt(selectedUserId, 10));
      router.push("/dashboard");
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
            <CardTitle className="font-headline text-3xl">AggieAccess</CardTitle>
            <CardDescription>After-Hours Access Request System</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-center text-sm text-muted-foreground">
                This is a prototype. Please select a user to simulate login.
              </p>
              <div className="space-y-2">
                <Select onValueChange={setSelectedUserId}>
                  <SelectTrigger className="w-full">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <SelectValue placeholder="Select a user profile" />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {mockUsers.map((mockUser) => (
                      <SelectItem key={mockUser.id} value={String(mockUser.id)}>
                        <div className="flex justify-between w-full">
                          <span>{mockUser.name}</span>
                          <span className="text-muted-foreground ml-4">{mockUser.role}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                onClick={handleLogin}
                disabled={!selectedUserId}
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
