"use client";

import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useAppContext } from "@/hooks/useAppContext";
import { mockBuildings, mockRooms } from "@/lib/mock-data";
import { useToast } from "@/hooks/use-toast";
import { getBuildingSuggestion } from "@/app/actions";
import { useState, useTransition, useCallback } from "react";
import { Lightbulb, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const formSchema = z.object({
  studentId: z.string().min(1, "Student ID is required."),
  studentName: z.string().min(1, "Student name is required."),
  buildingId: z.string().min(1, "Please select a building."),
  roomId: z.string().min(1, "Please select a room."),
  semester: z.string().min(1, "Please select a semester."),
  justification: z.string().min(10, "Justification must be at least 10 characters."),
});

type FormData = z.infer<typeof formSchema>;

export function RequestForm() {
  const { user, addRequest } = useAppContext();
  const router = useRouter();
  const { toast } = useToast();
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      studentId: "",
      studentName: "",
      buildingId: "",
      roomId: "",
      semester: "",
      justification: "",
    },
  });

  const selectedBuildingId = watch("buildingId");
  const justificationText = watch("justification");

  const handleJustificationChange = useCallback((text: string) => {
    if (text.length > 20) {
      startTransition(async () => {
        const result = await getBuildingSuggestion(text);
        if (result.buildingSuggestion) {
          setSuggestion(result.buildingSuggestion);
        }
      });
    } else {
      setSuggestion(null);
    }
  }, []);

  const onSubmit = (data: FormData) => {
    if (!user) return;
    const result = addRequest({
      ...data,
      buildingId: parseInt(data.buildingId),
      roomId: parseInt(data.roomId),
      requestedBy: user.id,
    });
    
    toast({
      title: result.success ? "Success" : "Error",
      description: result.message,
      variant: result.success ? "default" : "destructive",
    });

    if (result.success) {
      router.push("/dashboard");
    }
  };
  
  const availableRooms = selectedBuildingId ? mockRooms.filter(r => r.buildingId === parseInt(selectedBuildingId)) : [];

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">New Access Request</CardTitle>
          <CardDescription>
            Fill out the form below to request after-hours access for a student.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="studentName">Student Name</Label>
                <Controller
                  name="studentName"
                  control={control}
                  render={({ field }) => (
                    <Input id="studentName" placeholder="e.g., John Aggie" {...field} />
                  )}
                />
                {errors.studentName && (
                  <p className="text-sm text-destructive mt-1">{errors.studentName.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="studentId">Student ID</Label>
                <Controller
                  name="studentId"
                  control={control}
                  render={({ field }) => (
                    <Input id="studentId" placeholder="e.g., 123456789" {...field} />
                  )}
                />
                {errors.studentId && (
                  <p className="text-sm text-destructive mt-1">{errors.studentId.message}</p>
                )}
              </div>
            </div>
            
            <div>
              <Label htmlFor="semester">Semester</Label>
              <Controller
                name="semester"
                control={control}
                render={({ field }) => (
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <SelectTrigger><SelectValue placeholder="Select a semester" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fall 2024">Fall 2024</SelectItem>
                      <SelectItem value="Spring 2025">Spring 2025</SelectItem>
                      <SelectItem value="Summer 2025">Summer 2025</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.semester && (
                <p className="text-sm text-destructive mt-1">{errors.semester.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="justification">Justification</Label>
              <Controller
                name="justification"
                control={control}
                render={({ field }) => (
                  <Textarea
                    id="justification"
                    placeholder="Provide a detailed reason for the access request..."
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      handleJustificationChange(e.target.value);
                    }}
                  />
                )}
              />
              {errors.justification && (
                <p className="text-sm text-destructive mt-1">{errors.justification.message}</p>
              )}
            </div>
            
            {isPending && (
                <Alert variant="default" className="bg-blue-50 border-blue-200">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <AlertTitle>AI Assistant</AlertTitle>
                    <AlertDescription>Analyzing justification to suggest a building...</AlertDescription>
                </Alert>
            )}

            {suggestion && !isPending && (
                 <Alert className="bg-accent/20 border-accent/50">
                    <Lightbulb className="h-4 w-4 text-accent-foreground" />
                    <AlertTitle className="text-accent-foreground font-bold">AI Suggestion</AlertTitle>
                    <AlertDescription className="text-accent-foreground">
                        Based on your justification, we recommend the <strong>{suggestion}</strong> building.
                    </AlertDescription>
                </Alert>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <Label htmlFor="buildingId">Building</Label>
                <Controller
                  name="buildingId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select a building" /></SelectTrigger>
                      <SelectContent>
                        {mockBuildings.map(b => <SelectItem key={b.id} value={String(b.id)}>{b.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.buildingId && (
                  <p className="text-sm text-destructive mt-1">{errors.buildingId.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="roomId">Room</Label>
                 <Controller
                  name="roomId"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value} disabled={!selectedBuildingId}>
                      <SelectTrigger><SelectValue placeholder={selectedBuildingId ? "Select a room" : "Select a building first"} /></SelectTrigger>
                      <SelectContent>
                        {availableRooms.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.roomId && (
                  <p className="text-sm text-destructive mt-1">{errors.roomId.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Submit Request
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
