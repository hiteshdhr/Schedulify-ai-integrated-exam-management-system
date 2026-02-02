import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Settings,
  Download,
  RefreshCw,
  Loader2,
  Save 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SubjectInput from '@/components/scheduler/SubjectInput';
import TimeSlotSelector from '@/components/scheduler/TimeSlotSelector';
import GeneratedSchedule from '@/components/scheduler/GeneratedSchedule';
import { Dialog, DialogTrigger } from '@/components/ui/dialog';
import { SchedulerPreferencesModal } from '@/components/scheduler/SchedulerPreferencesModal';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

 
interface Subject {
  id: string;
  name: string;
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
}

interface TimeSlot {
  day: string;
  startTime: string;
  endTime: string;
}

interface UserPreferences {
  studyLength: number;
  breakLength: number;
  preferredTime: string;
}

interface StudySession {
  subject: string;
  priority: 'high' | 'medium' | 'low';
  startTime: string;
  endTime: string;
  type: 'study' | 'practice' | 'review';
}

interface DaySchedule {
  day: string;
  sessions: StudySession[];
}

interface GeneratedScheduleData {
  totalStudyHours: number;
  efficiency: number;
  week: DaySchedule[];
}

type StudyBlock = {
  subject: string;
  priority: 'high' | 'medium' | 'low';
  duration: number;
};

const SchedulerPage = () => {
  const { user, token, updateUser } = useAuth();

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState<TimeSlot[]>([]);
  const [generatedSchedule, setGeneratedSchedule] = useState<GeneratedScheduleData | null>(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSavingSchedule, setIsSavingSchedule] = useState(false); // New state
  
  const [isPrefsModalOpen, setIsPrefsModalOpen] = useState(false);
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);

  const [activeTab, setActiveTab] = useState("setup");

 
  useEffect(() => {
    if (token) {
      const fetchSavedSchedule = async () => {
        try {
          const response = await fetch('http://localhost:5000/api/users/my-schedule', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const resData = await response.json();
          if (resData.success && resData.data && resData.data.week && resData.data.week.length > 0) {
            setGeneratedSchedule(resData.data);
            setActiveTab("result"); // Switch to result tab if schedule exists
          }
        } catch (error) {
          console.error("Failed to load saved schedule", error);
        }
      };
      fetchSavedSchedule();
    }
  }, [token]);

   
  const saveScheduleToBackend = async (schedule: GeneratedScheduleData) => {
    if (!token) return;
    setIsSavingSchedule(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/my-schedule', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(schedule)
      });
      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.message);
      }
      
    } catch (error: any) {
      toast.error("Failed to auto-save schedule.");
    } finally {
      setIsSavingSchedule(false);
    }
  };

  const handleSavePreferences = async (newPrefs: UserPreferences) => {
    if (!token) return;
    
    setIsSavingPrefs(true);
    try {
      const response = await fetch('http://localhost:5000/api/users/my-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newPrefs)
      });
      
      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.message || 'Failed to save preferences');
      }

      updateUser(resData.data); 
      toast.success('Preferences saved!');
      
    } catch (error: any) {
      toast.error(error.message || 'Could not save preferences');
    } finally {
      setIsSavingPrefs(false);
      setIsPrefsModalOpen(false); 
    }
  };
  
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const minutesToTime = (minutes: number): string => {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const generateStudyTimetable = (
    subjects: Subject[],
    timeSlots: TimeSlot[],
    prefs: UserPreferences
  ): GeneratedScheduleData => {
    
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    let studyBlocks: StudyBlock[] = [];
    
   
    const totalRequestedMinutes = subjects.reduce((sum, sub) => sum + (sub.estimatedHours * 60), 0);

    subjects.forEach(subject => {
      const numBlocks = Math.ceil(subject.estimatedHours * 60 / prefs.studyLength);
      for (let i = 0; i < numBlocks; i++) {
        studyBlocks.push({
          subject: subject.name,
          priority: subject.priority,
          duration: prefs.studyLength,
        });
      }
    });

    studyBlocks.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

    let availableSlots = timeSlots.map(slot => ({
      day: slot.day,
      start: timeToMinutes(slot.startTime),
      end: timeToMinutes(slot.endTime),
    }));

    const weekSchedule: DaySchedule[] = [
      { day: 'Monday', sessions: [] },
      { day: 'Tuesday', sessions: [] },
      { day: 'Wednesday', sessions: [] },
      { day: 'Thursday', sessions: [] },
      { day: 'Friday', sessions: [] },
      { day: 'Saturday', sessions: [] },
      { day: 'Sunday', sessions: [] },
    ];
    
  
    let totalMinutesScheduled = 0;

    for (const block of studyBlocks) {
      let blockScheduled = false;
      
      for (const slot of availableSlots) {
        const availableDuration = slot.end - slot.start;
        
        if (availableDuration >= block.duration) {
          const sessionStartTime = slot.start;
          const sessionEndTime = slot.start + block.duration;
          
          const day = weekSchedule.find(d => d.day === slot.day);
          if (day) {
            day.sessions.push({
              subject: block.subject,
              priority: block.priority,
              startTime: minutesToTime(sessionStartTime),
              endTime: minutesToTime(sessionEndTime),
              type: 'study', 
            });
          }
          
          slot.start = sessionEndTime + prefs.breakLength;
          totalMinutesScheduled += block.duration;
          blockScheduled = true;
          break; 
        }
      }
      
      if (!blockScheduled) {
        toast.warning(`Could not fit "${block.subject}". Try adding more time slots.`);
      }
    }

    const finalWeekSchedule = weekSchedule
      .map(day => {
        day.sessions.sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
        return day;
      })
      .filter(day => day.sessions.length > 0); 

    // 2. Cal  Real Effi Score
    let realEfficiency = 100;
    if (totalRequestedMinutes > 0) {
        // (Sc Mi / Requested Minutes) * 100
        realEfficiency = Math.round((totalMinutesScheduled / totalRequestedMinutes) * 100);
    } else {
        
        realEfficiency = 100; 
    }

    return {
      totalStudyHours: Math.round(totalMinutesScheduled / 60 * 10) / 10,
      efficiency: realEfficiency, // <--- Using the cal val
      week: finalWeekSchedule,
    };
  };

  const generateSchedule = async () => {
    if (!user) {
      toast.error('Could not find user preferences.');
      return;
    }
    
    if (subjects.length === 0) {
      toast.error('Please add at least one subject.');
      return;
    }

    if (selectedTimeSlots.length === 0) {
      toast.error('Please add at least one time slot.');
      return;
    }
    
    setIsGenerating(true);
    setGeneratedSchedule(null); 
    
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    try {
      const schedule = generateStudyTimetable(subjects, selectedTimeSlots, user.preferences);
      
      if (schedule.week.length === 0) {
        toast.error("Could not generate schedule. Check if your time slots are long enough.");
      } else {
        setGeneratedSchedule(schedule);
        toast.success('Schedule generated successfully!');
        
        // --- Auto-save the schedule ---
        await saveScheduleToBackend(schedule);
        
        setActiveTab("result");
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate schedule');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-[calc(100vh-8rem)] items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-4xl font-bold">Smart Scheduler</h1>
          <p className="text-muted-foreground text-lg mt-2">
            Create optimized study schedules based on your preferences and priorities
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Dialog open={isPrefsModalOpen} onOpenChange={setIsPrefsModalOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Settings className="mr-2 h-4 w-4" />
                Preferences
              </Button>
            </DialogTrigger>
            <SchedulerPreferencesModal 
              isOpen={isPrefsModalOpen} 
              onOpenChange={setIsPrefsModalOpen}
              preferences={user.preferences}
              onSave={handleSavePreferences}
              isSaving={isSavingPrefs}
            />
          </Dialog>

          {generatedSchedule && (
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          )}
        </div>
      </motion.div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="setup">
            <Settings className="mr-2 h-4 w-4" />
            1. Setup Schedule
          </TabsTrigger>
          <TabsTrigger value="result" disabled={!generatedSchedule}>
            <Calendar className="mr-2 h-4 w-4" />
            2. View Schedule
          </TabsTrigger>
        </TabsList>

        <TabsContent value="setup" className="space-y-6 mt-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <SubjectInput subjects={subjects} setSubjects={setSubjects} />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <TimeSlotSelector timeSlots={selectedTimeSlots} setTimeSlots={setSelectedTimeSlots} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end"
          >
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
              onClick={generateSchedule}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              {isGenerating ? 'Generating...' : 'Generate My Schedule'}
            </Button>
          </motion.div>
        </TabsContent>

        <TabsContent value="result" className="mt-6">
          {generatedSchedule ? (
            <div>
              {/* Show saving indicator if applicable */}
              {isSavingSchedule && (
                <div className="flex items-center justify-end mb-2 text-sm text-muted-foreground">
                  <Loader2 className="h-3 w-3 mr-2 animate-spin" /> Saving schedule...
                </div>
              )}
              <GeneratedSchedule schedule={generatedSchedule} />
            </div>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>No Schedule Generated</CardTitle>
                <CardDescription>
                  Go back to the 'Setup Schedule' tab and click 'Generate My Schedule'.
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SchedulerPage;