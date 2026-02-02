import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Loader2,
  CalendarIcon,
  Plus,
  X,
  Sparkles,
  Upload,
  Settings,
  ArrowRight,
  Check,
} from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { format, addDays, eachDayOfInterval } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import { toast } from 'sonner';


interface User {
  _id: string;
  name: string;
}


interface ExamToSchedule {
  course_id: string;
  name: string;
  num_students: number;
  instructor_id: string;
  targetBranch: string;
  targetSemester: number;
 
  date?: string;
  startTime?: string;
  endTime?: string;
}


interface ParsedExam {
  subject: string; 
  name: string;
  date: string;
  startTime: string;
  endTime: string;
}


const examFormSchema = z.object({
  course_id: z.string().min(1, 'Course ID is required'),
  name: z.string().min(1, 'Course Name is required'),
  num_students: z.number().min(1, 'Must have at least 1 student'),
  instructor_id: z.string().min(1, 'Instructor is required'),
  targetBranch: z.string().min(1, 'Branch is required'),
  targetSemester: z.number().min(1, 'Semester is required'),
  
  date: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
});
type ExamFormData = z.infer<typeof examFormSchema>;


interface SchedulerConfigModalProps {
  instructors: User[];
  onGenerate: (payload: {
    examsToSchedule: ExamToSchedule[];
    timeslots: any[];
  }) => void;
  isGenerating: boolean;
  onOpenChange: (open: boolean) => void;
  handleDatesheetParse: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isParsing: boolean;
  parsedExams: ParsedExam[]; 
  setParsedExams: (exams: ParsedExam[]) => void;
}

export const SchedulerConfigModal: React.FC<SchedulerConfigModalProps> = ({
  instructors,
  onGenerate,
  isGenerating,
  onOpenChange,
  handleDatesheetParse,
  isParsing,
  parsedExams,
  setParsedExams,
}) => {
  
  const [examsToSchedule, setExamsToSchedule] = useState<ExamToSchedule[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: addDays(new Date(), 7),
  });

  
  const [stagedExams, setStagedExams] = useState<ExamToSchedule[]>([]);
  
  const [pendingParsedExams, setPendingParsedExams] = useState<ParsedExam[]>([]);

  
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ExamFormData>({
    resolver: zodResolver(examFormSchema),
    defaultValues: {
      course_id: '',
      name: '',
      num_students: 0,
      instructor_id: '',
      targetBranch: '',
      targetSemester: 0,
    },
  });

 
  const onAddExamToStaging = (data: ExamFormData) => {
   
    setStagedExams((prev) => [...prev, data]);
    
    
    setPendingParsedExams((prev) =>
      prev.filter((exam) => exam.subject !== data.course_id)
    );
    
    
    reset({
      course_id: '',
      name: '',
      num_students: 0,
      instructor_id: '',
      targetBranch: '',
      targetSemester: 0,
    });
  };

 
  const handleAddStagedToSolverList = () => {
    setExamsToSchedule((prev) => [...prev, ...stagedExams]);
    setStagedExams([]); 
    toast.success(`Added ${stagedExams.length} exams to the solver list.`);
  };

  
  const selectPendingExam = (exam: ParsedExam) => {
    reset({
      course_id: exam.subject,
      name: exam.name || '',
      date: exam.date, 
      startTime: exam.startTime, 
      endTime: exam.endTime, 
      
      num_students: 0,
      instructor_id: '',
      targetBranch: '',
      targetSemester: 0,
    });
    toast.info(`Auto-filled: ${exam.subject}. Please complete the remaining fields.`);
  };

  
  const removeStagedExam = (course_id: string) => {
    
    const examToUnstage = stagedExams.find(e => e.course_id === course_id);
    
    
    setStagedExams((prev) => prev.filter((exam) => exam.course_id !== course_id));

    
    if (examToUnstage?.date) {
      setPendingParsedExams(prev => [...prev, {
        subject: examToUnstage.course_id,
        name: examToUnstage.name,
        date: examToUnstage.date || '',
        startTime: examToUnstage.startTime || '',
        endTime: examToUnstage.endTime || '',
      }]);
    }
  };
  
 
  const onFileUploaded = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Clear old state
    setStagedExams([]);
    setPendingParsedExams([]);
    setExamsToSchedule([]);
    // Call the parse function (from AdminPanel)
    handleDatesheetParse(event);
  };
  
  // --- NEW: Watch for parsedExams prop to update our pending list ---
  React.useEffect(() => {
    setPendingParsedExams(parsedExams);
  }, [parsedExams]);


  // Helper function to remove an exam from the *final solver* list
  const removeExamFromSolverList = (course_id: string) => {
    setExamsToSchedule((prev) =>
      prev.filter((exam) => exam.course_id !== course_id)
    );
  };

  // Helper function to build the final payload
  const handleGenerateClick = () => {
    if (stagedExams.length > 0) {
      toast.warning(`You have ${stagedExams.length} staged exams. Please add them to the solver list before generating.`);
      return;
    }
    
    if (!dateRange || !dateRange.from || !dateRange.to) {
      toast.error('Please select a valid date range.');
      return;
    }

    const days = eachDayOfInterval({ start: dateRange.from, end: dateRange.to });
    const timeslots = [];
    let idCounter = 1;
    for (const day of days) {
      timeslots.push({
        timeslot_id: `T${idCounter++}`,
        date: format(day, 'yyyy-MM-dd'),
        start: '09:00',
        end: '12:00',
      });
      timeslots.push({
        timeslot_id: `T${idCounter++}`,
        date: format(day, 'yyyy-MM-dd'),
        start: '14:00',
        end: '17:00',
      });
    }

    onGenerate({
      examsToSchedule,
      timeslots,
    });
  };

  return (
    <DialogContent className="sm:max-w-[1000px] max-h-[90vh] grid grid-rows-[auto_1fr_auto]">
      <DialogHeader>
        <DialogTitle>Configure Automated Scheduler</DialogTitle>
        <DialogDescription>
          Define the exams and time window for the solver to use.
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="pr-4 -mx-6 px-6">
        <div className="space-y-6 py-4">
          
          {/* --- 1. TIMESLOTS SECTION --- */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">1. Define Exam Window</h3>
            <div className="grid gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={'outline'}
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateRange?.from ? (
                      dateRange.to ? (
                        <>
                          {format(dateRange.from, 'LLL dd, y')} -{' '}
                          {format(dateRange.to, 'LLL dd, y')}
                        </>
                      ) : (
                        format(dateRange.from, 'LLL dd, y')
                      )
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={dateRange?.from}
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
              <p className="text-xs text-muted-foreground px-1">
                The solver will schedule all exams within this date range, using a
                9am-12pm and 2pm-5pm slot each day.
              </p>
            </div>
          </div>

          <Separator />

          {/* --- 2. EXAMS SECTION --- */}
          <div className="space-y-3">
            <h3 className="text-lg font-medium">2. Define Exams to Schedule</h3>
            
            <Tabs defaultValue="manual" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="manual">
                  <Settings className="mr-2 h-4 w-4" />
                  Manual Entry
                </TabsTrigger>
                <TabsTrigger value="ai">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Auto-fill from Datesheet
                </TabsTrigger>
              </TabsList>
              
              {/* --- MANUAL TAB --- */}
              <TabsContent value="manual">
                <p className="text-xs text-muted-foreground p-2 text-center">
                  Use the form below to manually add one exam at a time to the solver list.
                </p>
              </TabsContent>

              {/* --- AUTO-FILL TAB --- */}
              <TabsContent value="ai">
                <div className="space-y-4 p-2">
                  <div className="space-y-2">
                    <Label htmlFor="datesheet-upload" className="font-medium">
                      Upload Datesheet PDF
                    </Label>
                    <div className="relative">
                      <Input
                        id="datesheet-upload"
                        type="file"
                        accept=".pdf"
                        className="pl-10"
                        onChange={onFileUploaded} // <-- Use new handler
                        disabled={isParsing}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {isParsing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {/* --- NEW BULK STAGING UI --- */}
                  {pendingParsedExams.length > 0 || stagedExams.length > 0 ? (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-4"
                    >
                      <Separator />
                      <div className="grid grid-cols-2 gap-4">
                        {/* Column 1: Pending */}
                        <div className="space-y-2">
                          <Label>1. Parsed Exams (To Be Configured)</Label>
                          <ScrollArea className="h-48 rounded-md border p-2">
                            {pendingParsedExams.length === 0 ? (
                               <p className="text-sm text-muted-foreground text-center p-4">
                                 All parsed exams are staged!
                               </p>
                            ) : (
                              pendingParsedExams.map((exam) => (
                                <Button key={exam.subject} variant="outline" className="w-full justify-start mb-2" onClick={() => selectPendingExam(exam)}>
                                  {/* --- GOAL #5 FIX --- */}
                                  {exam.subject}: {exam.name || 'No Name'} ({exam.date})
                                </Button>
                              ))
                            )}
                          </ScrollArea>
                        </div>
                        {/* Column 2: Staged */}
                        <div className="space-y-2">
                          <Label>2. Staged Exams (Ready for Solver)</Label>
                          <ScrollArea className="h-48 rounded-md border p-2">
                            {stagedExams.length === 0 ? (
                              <p className="text-sm text-muted-foreground text-center p-4">
                                Configure exams and add them here.
                              </p>
                            ) : (
                              stagedExams.map((exam) => (
                                <div key={exam.course_id} className="flex items-center justify-between rounded-md bg-muted/50 p-2 mb-2">
                                  <div>
                                    <p className="font-semibold">{exam.name}</p>
                                    <p className="text-sm text-muted-foreground">{exam.targetBranch}, Sem {exam.targetSemester}</p>
                                  </div>
                                  <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeStagedExam(exam.course_id)}>
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))
                            )}
                          </ScrollArea>
                        </div>
                      </div>
                      
                      {/* Button to move staged to final list */}
                      {stagedExams.length > 0 && (
                        <Button className="w-full" onClick={handleAddStagedToSolverList}>
                          <Check className="mr-2 h-4 w-4" />
                          Add all {stagedExams.length} Staged Exams to Solver List
                        </Button>
                      )}
                    </motion.div>
                  ) : (
                     // --- GOAL #5 FIX (Original Dropdown) ---
                     // This shows if you use the "Manual" tab but still want to auto-fill
                    parsedExams.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-2"
                      >
                        <Separator />
                        <Label htmlFor="parsed-exam-select">
                          Select Exam to Auto-fill Form
                        </Label>
                        <Select onValueChange={(subject) => {
                          const exam = parsedExams.find(e => e.subject === subject);
                          if(exam) selectPendingExam(exam);
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a parsed exam..." />
                          </SelectTrigger>
                          <SelectContent>
                            {parsedExams.map((exam) => (
                              <SelectItem key={exam.subject} value={exam.subject}>
                                {exam.subject}: {exam.name || 'No Name'} ({exam.date})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </motion.div>
                    )
                  )}
                  {/* --- END OF NEW UI --- */}

                </div>
              </TabsContent>
            </Tabs>
            
            <Separator />
            
            {/* --- Form to add a single exam --- */}
            <form
              // --- MODIFIED: Now adds to staging ---
              onSubmit={handleSubmit(onAddExamToStaging)}
              className="grid grid-cols-3 gap-4 p-4 border rounded-lg"
            >
              <div className="space-y-2 col-span-3">
                <Label>Course Name</Label>
                <Input
                  {...register('name')}
                  placeholder="e.g., Intro to Computer Science"
                />
                {errors.name && (
                  <p className="text-sm text-destructive">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Course ID</Label>
                <Input
                  {...register('course_id')}
                  placeholder="e.g., CS101"
                />
                {errors.course_id && (
                  <p className="text-sm text-destructive">
                    {errors.course_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Num. Students</Label>
                <Input
                  type="number"
                  {...register('num_students', { valueAsNumber: true })}
                  placeholder="e.g., 150"
                />
                {errors.num_students && (
                  <p className="text-sm text-destructive">
                    {errors.num_students.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Instructor</Label>
                <Controller
                  name="instructor_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors.map((inst) => (
                          <SelectItem key={inst._id} value={inst._id}>
                            {inst.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.instructor_id && (
                  <p className="text-sm text-destructive">
                    {errors.instructor_id.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Target Branch</Label>
                <Input
                  {...register('targetBranch')}
                  placeholder="e.g., CSE"
                />
                {errors.targetBranch && (
                  <p className="text-sm text-destructive">
                    {errors.targetBranch.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Target Semester</Label>
                <Input
                  type="number"
                  {...register('targetSemester', { valueAsNumber: true })}
                  placeholder="e.g., 1"
                />
                {errors.targetSemester && (
                  <p className="text-sm text-destructive">
                    {errors.targetSemester.message}
                  </p>
                )}
              </div>
              <Button type="submit" className="col-span-3">
                <Plus className="mr-2 h-4 w-4" />
                {}
                Add to Staging Area / Solver List
              </Button>
            </form>

          
            <div className="space-y-2">
              <h4 className="font-medium">
                
                Final Solver List ({examsToSchedule.length})
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-2 rounded-md border p-2">
                {examsToSchedule.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center p-4">
                    No exams added yet.
                  </p>
                ) : (
                  examsToSchedule.map((exam) => (
                    <div
                      key={exam.course_id}
                      className="flex items-center justify-between rounded-md bg-muted/50 p-3"
                    >
                      <div>
                        <p className="font-semibold">{exam.name} ({exam.course_id})</p>
                        <p className="text-sm text-muted-foreground">
                          {exam.targetBranch}, Sem {exam.targetSemester} ({exam.num_students} students)
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500"
                        onClick={() => removeExamFromSolverList(exam.course_id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>

      <DialogFooter>
        <DialogClose asChild>
          <Button variant="outline">Cancel</Button>
        </DialogClose>
        <Button
          onClick={handleGenerateClick}
          disabled={isGenerating || examsToSchedule.length === 0}
        >
          {isGenerating ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Generate Schedule ({examsToSchedule.length})
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};