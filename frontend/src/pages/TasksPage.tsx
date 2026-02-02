import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import TasksOverviewCard from '@/components/widgets/TasksOverviewCard'; 
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent } from '@/components/ui/card'; // Import Card components

// API fetch function
const fetchMyTasks = async (token: string) => {
  const response = await fetch('http://localhost:5000/api/tasks/my-tasks', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to fetch tasks');
  }
  const resData = await response.json();
  if (!resData.success) {
    throw new Error(resData.message || 'Failed to fetch tasks');
  }
  return resData.data;
};

const TasksPage = () => {
  const { token } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // This function can now be called to refresh the task list
  const loadTasks = async () => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const taskData = await fetchMyTasks(token);
      setTasks(taskData);
    } catch (error: any) {
      toast.error(error.message || "Failed to load tasks");
      setTasks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasks(); // Call on initial page load
  }, [token]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold">My Tasks</h1>
        <p className="text-muted-foreground text-lg mt-2">
          Manage all your pending and completed tasks.
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
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        ) : (
          // Pass the loadTasks function as a prop here
          <TasksOverviewCard tasks={tasks} onTaskCreated={loadTasks} />
        )}
      </motion.div>
    </div>
  );
};

export default TasksPage;