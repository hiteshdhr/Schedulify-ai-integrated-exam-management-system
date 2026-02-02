import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext'; 
import { Skeleton } from '@/components/ui/skeleton'; 
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

// Zod Schema
const academicSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  branch: z.string().min(1, 'Branch/Stream is required'),
  // --- FIX 1: Change z.coerce.number() to z.number() ---
  semester: z.number().min(1, 'Semester is required').max(12, 'Invalid semester'),
});

type AcademicFormData = z.infer<typeof academicSchema>;

const ProfilePage = () => {
  const { user, token, updateUser } = useAuth();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<AcademicFormData>({
    resolver: zodResolver(academicSchema), // This is now type-safe
    defaultValues: {
      institution: user?.academicDetails?.institution || '',
      branch: user?.academicDetails?.branch || '',
      semester: user?.academicDetails?.semester || undefined,
    },
  });

  const onAcademicSubmit = async (data: AcademicFormData) => {
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/users/my-academic-details', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });
      
      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.message || 'Failed to update details');
      }

      updateUser(resData.data);
      toast.success('Academic details updated successfully!');

    } catch (error: any) {
      toast.error(error.message || 'Could not save details');
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (!user) {
    return (
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold">My Profile</h1>
          <p className="text-muted-foreground text-lg mt-2">
            View and manage your personal information
          </p>
        </motion.div>
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Account Details</CardTitle>
            <CardDescription>
              Your personal account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-6 w-64" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-6 w-20 rounded-full" />
                  <Skeleton className="h-5 w-40" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold">My Profile</h1>
        <p className="text-muted-foreground text-lg mt-2">
          View and manage your personal information
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Account Details</CardTitle>
            <CardDescription>
              Your personal account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <h2 className="text-3xl font-semibold">{user.name}</h2>
                <p className="text-muted-foreground text-lg">{user.email}</p>
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="capitalize">{user.role}</Badge>
                  <span className="text-muted-foreground text-sm">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {user.role === 'student' && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Academic Details</CardTitle>
              <CardDescription>
                This information helps us automatically add you to relevant exams.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* This handleSubmit is now type-safe */}
              <form onSubmit={handleSubmit(onAcademicSubmit)} className="space-y-4 max-w-lg">
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution Type</Label>
                  <Controller
                    name="institution"
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your institution type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="School">School</SelectItem>
                          <SelectItem value="College">College</SelectItem>
                          <SelectItem value="University">University</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                  {errors.institution && (
                    <p className="text-sm text-destructive">{errors.institution.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="branch">Branch / Stream</Label>
                  <Input 
                    id="branch" 
                    {...register('branch')} 
                    placeholder="e.g., CSE, B.Com, Arts" 
                  />
                  {errors.branch && (
                    <p className="text-sm text-destructive">{errors.branch.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="semester">Current Semester</Label>
                  <Input 
                    id="semester" 
                    type="number" 
                    // --- FIX 2: Add valueAsNumber: true ---
                    {...register('semester', { valueAsNumber: true })}
                    // --- END OF FIX ---
                    placeholder="e.g., 4" 
                  />
                  {errors.semester && (
                    <p className="text-sm text-destructive">{errors.semester.message}</p>
                  )}
                </div>
                
                <Button type="submit" disabled={isSubmitting || !isDirty}>
                  {isSubmitting ? 'Saving...' : 'Save Academic Details'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default ProfilePage;