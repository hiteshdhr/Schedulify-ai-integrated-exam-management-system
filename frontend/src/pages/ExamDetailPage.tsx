// src/pages/ExamDetailPage.tsx

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Calendar, Clock, MapPin, User } from 'lucide-react';


interface Exam {
  _id: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  instructor: {
    _id: string;
    name: string;
  };
  students: any[]; // We don't need to list students here
}

const ExamDetailPage = () => {
  // 1. Get the "id" from the URL (e.g., /app/exams/THIS_ID)
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const [exam, setExam] = useState<Exam | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!id || !token) return;

    const fetchExam = async () => {
      setIsLoading(true);
      try {
        // 2. Fetch the specific exam from your backend
        const response = await fetch(`http://localhost:5000/api/exams/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        const resData = await response.json();
        if (!resData.success) {
          throw new Error(resData.message || 'Failed to fetch exam details');
        }
        setExam(resData.data);
      } catch (error: any) {
        toast.error(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExam();
  }, [id, token]); // Re-run if the id or token changes

  // 3. Show a loading skeleton
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-5 w-1/3" />
        </CardHeader>
        <CardContent className="space-y-4 pt-6">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </CardContent>
      </Card>
    );
  }

  // 4. Show "Not Found" message
  if (!exam) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Exam Not Found</CardTitle>
          <CardDescription>
            The exam you are looking for does not exist or you may not have permission.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  // 5. Display the exam details
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">{exam.subject}</CardTitle>
          <CardDescription>
            Here are the details for your upcoming exam.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-3 text-lg">
            <User className="h-5 w-5 text-muted-foreground" />
            <span><strong>Instructor:</strong> {exam.instructor.name}</span>
          </div>
          <div className="flex items-center space-x-3 text-lg">
            <Calendar className="h-5 w-5 text-muted-foreground" />
            <span><strong>Date:</strong> {new Date(exam.date).toLocaleDateString(undefined, {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}</span>
          </div>
          <div className="flex items-center space-x-3 text-lg">
            <Clock className="h-5 w-5 text-muted-foreground" />
            <span><strong>Time:</strong> {exam.startTime} - {exam.endTime}</span>
          </div>
          <div className="flex items-center space-x-3 text-lg">
            <MapPin className="h-5 w-5 text-muted-foreground" />
            <span><strong>Room:</strong> {exam.roomNumber}</span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExamDetailPage;