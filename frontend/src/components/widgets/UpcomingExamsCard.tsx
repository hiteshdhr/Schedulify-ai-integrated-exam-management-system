import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, Calendar, MapPin, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// --- FIX: This interface now matches your REAL backend data ---
interface Exam {
  _id: string; // Changed from id
  subject: string;
  date: string;
  startTime: string; // Changed from time
  endTime: string;
  roomNumber: string; // Changed from location
  instructor: { // Changed from string
    _id: string;
    name: string;
  };
  // Removed priority, daysLeft, duration, and syllabus as they don't exist
}

interface UpcomingExamsCardProps {
  exams?: Exam[] | null; 
}
// --- END OF FIX ---

const UpcomingExamsCard: React.FC<UpcomingExamsCardProps> = ({ exams }) => {

  // --- FIX: Add a simple date formatter ---
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // --- Skeleton Loading State (Unchanged) ---
  if (typeof exams === 'undefined' || exams === null) {
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-5 w-5" />
              <span>Upcoming Exams</span>
            </div>
            <Button variant="ghost" size="sm">
              View All
            </Button>
          </CardTitle>
          <CardDescription>
            Stay on top of your examination schedule
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-32 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }
  // --- END OF SKELETON ---

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5" />
            <span>Upcoming Exams</span>
          </div>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </CardTitle>
        <CardDescription>
          Stay on top of your examination schedule
        </CardDescription>
      </CardHeader>
      <CardContent>
        {exams.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-semibold">No upcoming exams</p>
            <p className="text-sm">Your schedule is clear... for now!</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* --- FIX: This block is updated to use REAL data --- */}
            {exams.map((exam, index) => (
              <motion.div
                key={exam._id} // Use _id
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-1">
                    <h3 className="font-semibold text-lg">{exam.subject}</h3>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <User className="h-4 w-4" />
                      {/* Use instructor.name */}
                      <span>{exam.instructor.name}</span> 
                    </div>
                  </div>
                  <Badge variant="default" className="text-xs">
                    Upcoming
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    {/* Format the date */}
                    <span>{formatDate(exam.date)}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {/* Use startTime and endTime */}
                    <span>{exam.startTime} - {exam.endTime}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    {/* Use roomNumber */}
                    <span>{exam.roomNumber}</span>
                  </div>
                </div>

                {/* --- REMOVED "Key Topics" section --- */}

                <div className="flex items-center justify-between mt-4 pt-3 border-t">
                  <Button variant="ghost" size="sm" disabled>
                    Study Materials
                  </Button>
                  <Button size="sm">
                    Start Studying
                  </Button>
                </div>
              </motion.div>
            ))}
            {/* --- END OF FIX --- */}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingExamsCard;