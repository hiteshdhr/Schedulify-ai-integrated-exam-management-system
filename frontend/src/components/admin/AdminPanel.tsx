import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  BookOpen,
  Settings,
  Plus,
  AlertTriangle,
  Briefcase,
  Upload,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { SchedulerConfigModal } from '@/components/admin/SchedulerConfigModal';

// Schema for User Form
const userSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: z.enum(['student', 'instructor', 'admin'] as const),
});
type UserFormData = z.infer<typeof userSchema>;

// Schema for Exam Form
const examSchema = z.object({
  subject: z.string().min(3, 'Subject is required'),
  date: z.string().min(1, 'Date is required'),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  roomNumber: z.string().min(1, 'Room number is required'),
  instructor: z.string().min(1, 'Instructor is required'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
  targetBranch: z.string().min(1, 'Target Branch is required'),
  targetSemester: z.number().min(1, 'Target Semester is required'),
});
type ExamFormData = z.infer<typeof examSchema>;

// Type Definitions
interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'instructor' | 'admin';
  createdAt: string;
}

interface Exam {
  _id: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  instructor: { _id: string; name: string };
  students: string[];
  capacity: number;
}

interface ApiSuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface RoomSuggestion {
  _id: string;
  name: string;
  capacity: number;
  score: number;
}

// Main AdminPanel Component
const AdminPanel = () => {
  const { token } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [exams, setExams] = useState<Exam[]>([]);
  const [instructors, setInstructors] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // State for modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isExamModalOpen, setIsExamModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  
  const [selectedItem, setSelectedItem] = useState<{
    id: string;
    name: string;
    type: 'user' | 'exam';
  } | null>(null);

  const [parsedExams, setParsedExams] = useState<any[]>([]);
  // --- STATE LIFTED UP ---
  const [isParsing, setIsParsing] = useState(false);

  const fetchData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const [usersRes, examsRes, instructorsRes] = await Promise.all([
        fetch('http://localhost:5000/api/users', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:5000/api/exams', {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch('http://localhost:5000/api/users/role/instructor', {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!usersRes.ok) {
        const errData = await usersRes.json();
        throw new Error(errData.message || 'Failed to fetch users');
      }

      if (!examsRes.ok) {
        const errData = await examsRes.json();
        throw new Error(errData.message || 'Failed to fetch exams');
      }

      if (!instructorsRes.ok) {
        const errData = await instructorsRes.json();
        throw new Error(errData.message || 'Failed to fetch instructors');
      }

      const usersData: ApiSuccessResponse<User[]> = await usersRes.json();
      const examsData: ApiSuccessResponse<Exam[]> = await examsRes.json();
      const instructorsData: ApiSuccessResponse<User[]> =
        await instructorsRes.json();

      if (usersData.success) {
        setUsers(usersData.data);
      } else {
        throw new Error(usersData.message || 'Failed to fetch users');
      }

      if (examsData.success) {
        setExams(examsData.data);
      } else {
        throw new Error(examsData.message || 'Failed to fetch exams');
      }

      if (instructorsData.success) {
        setInstructors(instructorsData.data);
      } else {
        throw new Error(instructorsData.message || 'Failed to fetch instructors');
      }
    } catch (error: any) {
      toast.error('Failed to load data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [token]);
  
  const handleCreateUser = async (data: UserFormData) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to create user');
      }
      toast.success('User created successfully!');
      setIsUserModalOpen(false);
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleCreateExam = async (data: ExamFormData) => {
    try {
      const response = await fetch('http://localhost:5000/api/exams', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...data,
          date: new Date(data.date).toISOString(),
        }),
      });
      const resData = await response.json();
      if (!response.ok) {
        throw new Error(resData.message || 'Failed to create exam');
      }
      toast.success('Exam scheduled successfully! Matching students will be notified.');
      setIsExamModalOpen(false);
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    const { id, type } = selectedItem;
    const url = `http://localhost:5000/api/${
      type === 'user' ? 'users' : 'exams'
    }/${id}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete ${type}`);
      }
      toast.success(
        `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully!`
      );
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
      fetchData(); // Refresh data
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  // --- LOGIC LIFTED UP ---
  const handleDatesheetParse = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append('datesheet', file);

    setIsParsing(true);
    setParsedExams([]);
    try {
      const response = await fetch(
        'http://localhost:5000/api/exams/parse-datesheet',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );

      const resData: ApiSuccessResponse<any[]> = await response.json();

      if (!resData.success) {
        throw new Error(resData.message || 'Failed to parse file');
      }

      if (resData.data.length === 0) {
        toast.warning('Could not find any exams in that datesheet.');
        return;
      }

      setParsedExams(resData.data);
      toast.success(
        `Parsed ${resData.data.length} exams! Select one to auto-fill.`
      );
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsParsing(false);
      if (event.target) {
        event.target.value = ''; // Clear file input
      }
    }
  };
  
  const handleRunScheduler = async (payload: any) => {
    if (!window.confirm("Are you sure you want to run the automated scheduler? This will delete all existing exams and generate a new schedule. This action cannot be undone.")) {
      return;
    }

    if (instructors.length === 0) {
      toast.error("Cannot run scheduler: No instructors found in the database. Please add an instructor first.");
      return;
    }

    setIsGenerating(true);
    toast.info("Starting automated scheduler... This may take up to 60 seconds.");

    try {
      const response = await fetch('http://localhost:5000/api/scheduler/run', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json();
      if (!resData.success) {
        throw new Error(resData.message);
      }

      toast.success(resData.message);
      setIsConfigModalOpen(false); 
      fetchData(); // Refresh the exam list!

    } catch (error: any) {
      toast.error(error.message || 'Failed to run scheduler.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const stats = [
    {
      title: 'Total Users',
      value: users.length.toString(),
      icon: Users,
      color: 'text-blue-600',
    },
    {
      title: 'Active Exams',
      value: exams.length.toString(),
      icon: BookOpen,
      color: 'text-green-600',
    },
    {
      title: 'Instructors',
      value: instructors.length.toString(),
      icon: Briefcase,
      color: 'text-purple-600',
    },
    {
      title: 'Students',
      value: users.filter((u) => u.role === 'student').length.toString(),
      icon: Users,
      color: 'text-orange-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      {/* --- THIS IS THE CORRECT LAYOUT --- */}
      <div className="space-y-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-4xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground text-lg mt-2">
              Manage users, exams, and system settings
            </p>
          </div>
          <div className="flex items-center space-x-4">
            
            <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Full Schedule
                </Button>
              </DialogTrigger>
              <SchedulerConfigModal
                instructors={instructors}
                isGenerating={isGenerating}
                onGenerate={handleRunScheduler}
                onOpenChange={setIsConfigModalOpen}
                // --- PASSING NEW PROPS ---
                handleDatesheetParse={handleDatesheetParse}
                isParsing={isParsing}
                parsedExams={parsedExams}
                setParsedExams={setParsedExams}
              />
            </Dialog>

            <Dialog open={isUserModalOpen} onOpenChange={setIsUserModalOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add User
                </Button>
              </DialogTrigger>
              <UserFormModal
                onSubmit={handleCreateUser}
              />
            </Dialog>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -5 }}
            >
              <Card className="hover:shadow-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground font-medium">
                        {stat.title}
                      </p>
                      <p className="text-3xl font-bold">{stat.value}</p>
                    </div>
                    <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Tabs defaultValue="exams" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="users">User Management</TabsTrigger>
              <TabsTrigger value="exams">Exam Management</TabsTrigger>
            </TabsList>

            <TabsContent value="users" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>All Users ({users.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>User</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell className="flex items-center space-x-3">
                            <Avatar className="h-8 w-8">
                              <AvatarImage
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                              />
                              <AvatarFallback>
                                {user.name
                                  .split(' ')
                                  .map((n) => n[0])
                                  .join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {user.email}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="capitalize">
                              {user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" disabled>
                                Edit
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => {
                                  setSelectedItem({
                                    id: user._id,
                                    name: user.name,
                                    type: 'user',
                                  });
                                  setIsDeleteModalOpen(true);
                                }}
                              >
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="exams" className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Scheduled Exams ({exams.length})</CardTitle>
                    <Dialog
                      open={isExamModalOpen}
                      onOpenChange={setIsExamModalOpen}
                    >
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Manual Exam
                        </Button>
                      </DialogTrigger>
                      <ExamFormModal
                        onSubmit={handleCreateExam}
                        instructors={instructors}
                        token={token}
                        parsedExams={parsedExams}
                        setParsedExams={setParsedExams}
                        // --- PASSING NEW PROPS ---
                        handleDatesheetParse={handleDatesheetParse}
                        isParsing={isParsing}
                      />
                    </Dialog>
                  </div>
                  <CardDescription>
                    This table shows all currently scheduled exams. You can manually add or delete exams.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Exam</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Instructor</TableHead>
                        <TableHead>Room</TableHead>
                        <TableHead>Enrolled</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exams.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center">
                            No exams scheduled. Try the "Generate Full Schedule" button!
                          </TableCell>
                        </TableRow>
                      ) : (
                        exams.map((exam) => (
                          <TableRow key={exam._id}>
                            <TableCell className="font-medium">
                              {exam.subject}
                            </TableCell>
                            <TableCell>
                              {new Date(exam.date).toLocaleDateString()} at{' '}
                              {exam.startTime}
                            </TableCell>
                            <TableCell>
                              {exam.instructor?.name || 'N/A'}
                            </TableCell>
                            <TableCell>{exam.roomNumber}</TableCell>
                            <TableCell>
                              {exam.students.length} / {exam.capacity}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <Button variant="ghost" size="sm" disabled>
                                  Edit
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => {
                                    setSelectedItem({
                                      id: exam._id,
                                      name: exam.subject,
                                      type: 'exam',
                                    });
                                    setIsDeleteModalOpen(true);
                                  }}
                                >
                                  Delete
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>

      <Dialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <AlertTriangle className="mr-2 text-red-500" />
              Are you absolutely sure?
            </DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the
              {selectedItem
                ? ` ${selectedItem.type} "${selectedItem.name}"`
                : ' item'}
              .
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" onClick={() => setSelectedItem(null)}>
                Cancel
              </Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Yes, delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// User Form Modal
const UserFormModal = ({
  onSubmit,
}: {
  onSubmit: (data: UserFormData) => void;
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: undefined,
    },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New User</DialogTitle>
        <DialogDescription>
          Fill out the details to create a new user account.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Full Name</Label>
          <Input id="name" {...register('name')} placeholder="John Doe" />
          {errors.name && (
            <p className="text-sm text-destructive">{errors.name.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            {...register('email')}
            placeholder="john.doe@example.com"
          />
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            {...register('password')}
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Controller
            name="role"
            control={control}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value ?? ''}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="instructor">Instructor</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          {errors.role && (
            <p className="text-sm text-destructive">{errors.role.message}</p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create User'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

// Exam Form Modal
const ExamFormModal = ({
  onSubmit,
  instructors,
  token,
  parsedExams,
  setParsedExams,
  // --- RECEIVING NEW PROPS ---
  handleDatesheetParse,
  isParsing,
}: {
  onSubmit: (data: ExamFormData) => void;
  instructors: User[];
  token: string | null;
  parsedExams: any[];
  setParsedExams: (exams: any[]) => void;
  // --- NEW PROPS ---
  handleDatesheetParse: (event: React.ChangeEvent<HTMLInputElement>) => void;
  isParsing: boolean;
}) => {
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<ExamFormData>({
    resolver: zodResolver(examSchema),
    defaultValues: {
      subject: '',
      date: '',
      startTime: '',
      endTime: '',
      roomNumber: '',
      instructor: '',
      capacity: undefined,
      targetBranch: '',
      targetSemester: undefined,
    },
  });

  // --- LOCAL STATE REMOVED ---
  // const [isParsing, setIsParsing] = useState(false); // <-- REMOVED
  const [isSuggesting, setIsSuggesting] = useState(false);
  const [roomSuggestions, setRoomSuggestions] = useState<RoomSuggestion[]>([]);

  // --- FUNCTION REMOVED ---
  // const handleDatesheetParse = async (...) => { ... } // <-- REMOVED

  const handleExamSelect = (subject: string) => {
    const selected = parsedExams.find((e) => e.subject === subject);
    if (!selected) return;

    setValue('subject', selected.subject);
    setValue('date', selected.date);
    setValue('startTime', selected.startTime || selected.start_time || '');
    setValue('endTime', selected.endTime || selected.end_time || '');
    toast.info(`Auto-filled details for ${selected.subject}`);
    setParsedExams([]); // Clear list after selection
  };

  const handleSuggestRoom = async () => {
    if (!token) return;
    const { capacity, date, startTime, endTime } = getValues();
    if (!capacity || !date || !startTime || !endTime) {
      toast.error('Please fill in Capacity, Date, and Times to get suggestions.');
      return;
    }
    setIsSuggesting(true);
    setRoomSuggestions([]);
    try {
      const query = new URLSearchParams({
        capacity: String(capacity),
        date,
        startTime,
        endTime,
      }).toString();
      const response = await fetch(
        `http://localhost:5000/api/rooms/suggest?${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const resData: ApiSuccessResponse<RoomSuggestion[]> = await response.json();
      if (!resData.success) {
        throw new Error(resData.message || 'Failed to get suggestions');
      }
      if (resData.data.length === 0) {
        toast.warning('No available rooms match your criteria.');
        setRoomSuggestions([]);
        return;
      }
      setRoomSuggestions(resData.data);
      const bestRoom = resData.data[0];
      setValue('roomNumber', bestRoom.name);
      toast.success(`Suggested: ${bestRoom.name} (Best Fit)`);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsSuggesting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[600px] grid grid-rows-[auto_minmax(0,1fr)_auto] max-h-[90vh]">
      <DialogHeader>
        <DialogTitle>Schedule Manual Exam</DialogTitle>
        <DialogDescription>
          Manually add a single exam. This will bypass the automated solver.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit(onSubmit)} className="grid grid-rows-[minmax(0,1fr)_auto] overflow-hidden">
        
        <ScrollArea className="pr-4">
          <div className="space-y-4 py-4">
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
              <TabsContent value="manual">
                <p className="text-xs text-muted-foreground p-2 text-center">
                  Fill in all the exam details below.
                </p>
              </TabsContent>
              <TabsContent value="ai">
                <div className="space-y-4 p-2">
                  <div className="space-y-2">
                    <Label htmlFor="datesheet-upload" className="font-medium">
                      1. Upload Datesheet PDF
                    </Label>
                    <div className="relative">
                      <Input
                        id="datesheet-upload"
                        type="file"
                        accept=".pdf"
                        className="pl-10"
                        // --- USING PROPS ---
                        onChange={handleDatesheetParse}
                        disabled={isParsing}
                      />
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {/* --- USING PROPS --- */}
                        {isParsing ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  </div>

                  {parsedExams.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="space-y-2"
                    >
                      <Separator />
                      <Label htmlFor="parsed-exam-select">
                        2. Select Exam to Auto-fill
                      </Label>
                      <Select onValueChange={handleExamSelect}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a parsed exam..." />
                        </SelectTrigger>
                        <SelectContent>
                          {parsedExams.map((exam) => (
                            <SelectItem key={exam.subject} value={exam.subject}>
                              {exam.subject} ({exam.date})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </motion.div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
            <Separator />

            {/* --- ALL THE FIXES FOR TYPOS ARE HERE --- */}
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                {...register('subject')}
                placeholder="e.g., Advanced Mathematics"
              />
              {errors.subject && (
                <p className="text-sm text-destructive">
                  {errors.subject.message}
                </p>
              )}
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input id="date" type="date" {...register('date')} />
                {errors.date && (
                  <p className="text-sm text-destructive">
                    {errors.date.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input id="startTime" type="time" {...register('startTime')} />
                {errors.startTime && (
                  <p className="text-sm text-destructive">
                    {errors.startTime.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input id="endTime" type="time" {...register('endTime')} />
                {errors.endTime && (
                  <p className="text-sm text-destructive">
                    {errors.endTime.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="capacity">Capacity</Label>
                <Input
                  id="capacity"
                  type="number"
                  {...register('capacity', { valueAsNumber: true })}
                />
                {errors.capacity && (
                  <p className="text-sm text-destructive">
                    {errors.capacity.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="instructor">Instructor</Label>
                <Controller
                  name="instructor"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an instructor" />
                      </SelectTrigger>
                      <SelectContent>
                        {instructors.length === 0 ? (
                          <SelectItem value="none" disabled>
                            No instructors found
                          </SelectItem>
                        ) : (
                          instructors.map((inst) => (
                            <SelectItem key={inst._id} value={inst._id}>
                              {inst.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.instructor && (
                  <p className="text-sm text-destructive">
                    {errors.instructor.message}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="roomNumber">Room Number</Label>
              <div className="flex space-x-2">
                <Input
                  id="roomNumber"
                  {...register('roomNumber')}
                  placeholder="e.g., Hall A-101"
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSuggestRoom}
                  disabled={isSuggesting}
                >
                  {isSuggesting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="mr-2 h-4 w-4" />
                  )}
                  Suggest
                </Button>
              </div>
              {errors.roomNumber && (
                <p className="text-sm text-destructive">
                  {errors.roomNumber.message}
                </p>
              )}
            </div>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="space-y-2">
                <Label htmlFor="targetBranch">Target Branch</Label>
                <Input
                  id="targetBranch"
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
                <Label htmlFor="targetSemester">Target Semester</Label>
                <Input
                  id="targetSemester"
                  type="number"
                  {...register('targetSemester', { valueAsNumber: true })}
                  placeholder="e.g., 4"
                />
                {errors.targetSemester && (
                  <p className="text-sm text-destructive">
                    {errors.targetSemester.message}
                  </p>
                )}
              </div>
            </div>

            {roomSuggestions.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 'auto' }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-3 bg-muted/50 rounded-md border space-y-2"
              >
                <Label>AI Suggestions (Best rooms first)</Label>
                <div className="flex flex-wrap gap-2">
                  {roomSuggestions.map((room) => (
                    <Button
                      type="button"
                      key={room._id}
                      variant="outline"
                      size="sm"
                      className="flex-grow"
                      onClick={() => setValue('roomNumber', room.name)}
                    >
                      {room.name} (Cap: {room.capacity}, Score:{' '}
                      {Math.round(room.score)})
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </ScrollArea>
        
        <DialogFooter className="pt-4 border-t">
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Scheduling...' : 'Schedule Exam'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};

export default AdminPanel;