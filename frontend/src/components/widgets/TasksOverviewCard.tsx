import React, { useState } from 'react'; 
import { motion } from 'framer-motion';

import { CheckCircle, Clock, AlertCircle, Plus, Loader2 } from 'lucide-react'; 
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { TaskFormModal } from '@/components/tasks/TaskFormModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';


interface Task {
  _id: string; 
  title: string;
  subject: string;
  dueDate: string;
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  progress: number;
}


interface TasksOverviewCardProps {
  tasks?: Task[] | null;
  onTaskCreated?: () => void;
}

const TasksOverviewCard: React.FC<TasksOverviewCardProps> = ({ tasks, onTaskCreated }) => {
  const { token } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  
  const [completingId, setCompletingId] = useState<string | null>(null);
  

  const handleCreateTask = async (data: any) => {
    
    if (!token) {
      toast.error('You must be logged in to create a task.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('http://localhost:5000/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          dueDate: new Date(data.dueDate),
        }),
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.message || 'Failed to create task');
      }

      toast.success('Task created successfully!');
      setIsModalOpen(false); // Close the modal
      
      if (onTaskCreated) {
        onTaskCreated(); // Call the refresh function
      }

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- ADD THIS ENTIRE FUNCTION ---
  const handleMarkComplete = async (taskId: string) => {
    if (!token) {
      toast.error('You must be logged in.');
      return;
    }

    setCompletingId(taskId); // Start loading spinner
    try {
      const response = await fetch(`http://localhost:5000/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ completed: true }), // Send the update
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.message || 'Failed to update task');
      }

      toast.success('Task marked as complete!');
      
      if (onTaskCreated) {
        onTaskCreated(); // Refresh the task list
      }

    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setCompletingId(null); // Stop loading spinner
    }
  };
  // --- END OF ADDITION ---

  if (typeof tasks === 'undefined' || tasks === null) {
    // ... (skeleton loading state is unchanged)
    return (
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Tasks Overview</span>
            </div>
            <Button size="icon" variant="ghost">
              <Plus className="h-4 w-4" />
            </Button>
          </CardTitle>
          <CardDescription>
            Track your study tasks and assignments
          </CardDescription>
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full rounded-lg" />
          <Skeleton className="h-24 w-full rounded-lg" />
        </CardContent>
      </Card>
    );
  }

  // ... (helper variables are unchanged)
  const completedTasks = tasks.filter(task => task.completed).length;
  const totalTasks = tasks.length;
  const completionPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'medium': return <Clock className="h-4 w-4 text-orange-500" />;
      case 'low': return <Clock className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getDueDateColor = (dueDate: string) => {
    // This logic might need to be improved to handle dates
    if (dueDate === 'Today') return 'text-red-600';
    if (dueDate === 'Tomorrow') return 'text-orange-600';
    return 'text-muted-foreground';
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <Card className="hover:shadow-lg transition-all duration-300">
        {/* ... (CardHeader is unchanged) ... */}
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span>Tasks Overview</span>
            </div>
            <DialogTrigger asChild>
              <Button size="icon" variant="ghost">
                <Plus className="h-4 w-4" />
              </Button>
            </DialogTrigger>
          </CardTitle>
          <CardDescription>
            Track your study tasks and assignments
          </CardDescription>
          
          <div className="space-y-2 pt-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-muted-foreground">
                {completedTasks}/{totalTasks} completed
              </span>
            </div>
            <Progress value={completionPercentage} className="h-2" />
          </div>
        </CardHeader>
        
        <CardContent>
          {tasks.length === 0 ? (
            // ... (empty state is unchanged) ...
            <div className="text-center py-12 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p className="font-semibold">No tasks here</p>
              <p className="text-sm">Click below to add your first task.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {tasks.map((task, index) => (
                <motion.div
                  key={task._id} // <-- FIX: Use _id
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 border rounded-lg transition-all duration-200 hover:bg-muted/50 ${
                    task.completed ? 'opacity-75' : ''
                  }`}
                >
                  {/* ... (task title/date/priority is unchanged) ... */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start space-x-3">
                      <div className="mt-1">
                        {task.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : (
                          getPriorityIcon(task.priority)
                        )}
                      </div>
                      <div className="space-y-1">
                        <h3 className={`font-medium ${
                          task.completed ? 'line-through text-muted-foreground' : ''
                        }`}>
                          {task.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">{task.subject}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${getDueDateColor(task.dueDate)}`}>
                        {task.dueDate}
                      </div>
                      <Badge 
                        variant={task.completed ? 'secondary' : 'outline'} 
                        className="text-xs mt-1"
                      >
                        {task.priority} priority
                      </Badge>
                    </div>
                  </div>
                  
                  {!task.completed && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Progress</span>
                        <span className="text-sm font-medium">{task.progress}%</span>
                      </div>
                      <Progress value={task.progress} className="h-1" />
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-3 pt-3 border-t">
                    <div className="flex items-center space-x-2">
                      {!task.completed && (
                        // --- THIS IS THE "Update Progress" BUTTON YOU SAW ---
                        <Button variant="ghost" size="sm" disabled>
                          Update Progress
                        </Button>
                      )}
                    </div>
                    {/* --- UPDATE THIS BUTTON --- */}
                    <Button 
                      size="sm" 
                      variant={task.completed ? "secondary" : "default"}
                      disabled={task.completed || completingId === task._id}
                      onClick={() => handleMarkComplete(task._id)}
                    >
                      {completingId === task._id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {task.completed ? 'Completed' : 'Mark Complete'}
                    </Button>
                    {/* --- END OF BUTTON UPDATE --- */}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
          
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Add New Task
            </Button>
          </DialogTrigger>
        </CardContent>
      </Card>

      {/* Modal Content */}
      <TaskFormModal 
        onSubmit={handleCreateTask}
        isSubmitting={isSubmitting}
      />
    </Dialog>
  );
};

export default TasksOverviewCard;