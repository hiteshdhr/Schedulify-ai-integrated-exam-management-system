import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import UpcomingExamsCard from '@/components/widgets/UpcomingExamsCard'; 
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card'; // Import Card components

// --- FIX: Add live fetch function ---
const fetchMyExams = async (token: string) => {
  const response = await fetch('http://localhost:5000/api/exams/my-exams', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to fetch exams');
  }
  const resData = await response.json();
  if (!resData.success) {
    throw new Error(resData.message || 'Failed to fetch exams');
  }
  return resData.data;
};
// --- END OF FIX ---

const ExamsPage = () => {
  const { token } = useAuth();
  const [exams, setExams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const loadExams = async () => {
        try {
          setIsLoading(true);
          const examData = await fetchMyExams(token);
          setExams(examData);
        } catch (error: any) {
          toast.error(error.message || "Failed to load exams");
          setExams([]);
        } finally {
          setIsLoading(false);
        }
      };
      loadExams();
    } else {
      setIsLoading(false); 
    }
  }, [token]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold">My Exams</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Track and manage all your upcoming exams here.
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        {isLoading ? (
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-4 w-2/3" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ) : (
          <UpcomingExamsCard exams={exams} />
        )}
      </motion.div>
    </div>
  );
};

export default ExamsPage;