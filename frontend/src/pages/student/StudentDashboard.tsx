import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react'; 
import { Button } from '@/components/ui/button';
import CalendarWidget from '@/components/widgets/CalendarWidget';
import UpcomingExamsCard from '@/components/widgets/UpcomingExamsCard';
import TasksOverviewCard from '@/components/widgets/TasksOverviewCard';
import PerformanceChart from '@/components/widgets/PerformanceChart';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import AdminPanel from '@/components/admin/AdminPanel'; 

// (fetchApi function remains the same)
const fetchApi = async (url: string, token: string) => {
  const response = await fetch(`http://localhost:5000${url}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || `Failed to fetch ${url}`);
  }
  const resData = await response.json();
  if (!resData.success) {
    throw new Error(resData.message || `Failed to fetch ${url}`);
  }
  return resData.data;
};


const StudentDashboard = () => {
  const { user, token } = useAuth();
  const [exams, setExams] = useState<any[] | null>(null);
  const [tasks, setTasks] = useState<any[] | null>(null);
  const [performanceData, setPerformanceData] = useState<any[] | null>(null);

  useEffect(() => {
    // Only run if user exists, has a token, and is NOT an admin
    if (user && token && user.role !== 'admin') {
      const loadDashboard = async () => {
        try {
          const [examData, taskData, perfData] = await Promise.all([
            fetchApi('/api/exams/my-exams', token),
            fetchApi('/api/tasks/my-tasks', token),
            fetchApi('/api/analytics/my-performance', token)
          ]);
          
          setExams(examData);
          setTasks(taskData);
          setPerformanceData(perfData); 
        } catch (error: any) {
          toast.error(error.message || "Failed to load dashboard data");
          setExams([]);
          setTasks([]);
          setPerformanceData([]);
        }
      };
      loadDashboard();
    }
  }, [user, token]);

  // --- Role-based Rendering ---
  
  if (user?.role === 'admin') {
    // Admins see the AdminPanel. It has its own "Schedule Exam" button.
    return <AdminPanel />;
  }
  
  if (user?.role === 'instructor') {
    // Instructors see a simplified dashboard
    return (
      <div className="space-y-4 m-4">
        <h1 className="text-4xl font-bold">Welcome, {user.name}!</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Here are your assigned exam duties.
        </p>
        <UpcomingExamsCard exams={exams} />
      </div>
    );
  }

  // --- Default: Student Dashboard ---
  const pendingTaskCount = tasks ? tasks.filter((t: any) => !t.completed).length : 0;
  const examCount = exams ? exams.length : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold">Welcome, {user?.name}! 👋</h1>
          <p className="text-muted-foreground text-lg mt-2">
            You have {examCount} exams and {pendingTaskCount} pending tasks. Let's stay organized!
          </p>
        </div>
        {/* --- "Schedule Exam" button is correctly removed from the student view --- */}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <UpcomingExamsCard exams={exams} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            {/* --- THIS IS THE FIX --- */}
            <PerformanceChart 
              data={performanceData} 
              title="Performance Analytics"
              description="Your academic performance over the past 6 weeks"
            />
            {/* --- END OF FIX --- */}
          </motion.div>
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            <CalendarWidget />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
          >
            <TasksOverviewCard tasks={tasks} />
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;