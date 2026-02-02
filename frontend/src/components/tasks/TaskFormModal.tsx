import React from 'react';
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
import { Loader2 } from 'lucide-react';

// 1. Define the shape of the form data
const taskSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subject: z.string().optional(),
  dueDate: z.string().min(1, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high'] as const),
  // --- FIX 1: Changed z.coerce.number() to z.number() ---
  // This simplifies the type for the Zod resolver.
  studyHours: z.number().min(0, "Hours can't be negative").optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

// 2. Define the component props
interface TaskFormModalProps {
  // Make sure 'data' is explicitly typed as TaskFormData
  onSubmit: (data: TaskFormData) => Promise<void>;
  isSubmitting: boolean;
}

// 3. Create the component
export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  onSubmit,
  isSubmitting,
}) => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      subject: '',
      dueDate: '',
      priority: 'medium',
      studyHours: 0, // This default value is fine
    },
  });

  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Add New Task</DialogTitle>
        <DialogDescription>
          Fill out the details for your new task.
        </DialogDescription>
      </DialogHeader>
      {/* This handleSubmit will now correctly infer the types */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">Task Title</Label>
          <Input id="title" {...register('title')} placeholder="e.g., Read Chapter 5" />
          {errors.title && (
            <p className="text-sm text-destructive">{errors.title.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" {...register('subject')} placeholder="e.g., Physics" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date</Label>
            <Input id="dueDate" type="date" {...register('dueDate')} />
            {errors.dueDate && (
              <p className="text-sm text-destructive">{errors.dueDate.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Controller
              name="priority"
              control={control}
              render={({ field }) => (
                <Select onValueChange={field.onChange} value={field.value}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studyHours">Est. Study Hours</Label>
            <Input
              id="studyHours"
              type="number"
              // --- FIX 2: Add valueAsNumber: true ---
              // This tells react-hook-form to convert the input to a number
              // before validation, which matches the z.number() schema.
              {...register('studyHours', { valueAsNumber: true })}
            />
            {errors.studyHours && (
              <p className="text-sm text-destructive">{errors.studyHours.message}</p>
            )}
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
};