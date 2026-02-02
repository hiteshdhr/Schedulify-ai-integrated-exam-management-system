import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, BookOpen, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

const SubjectInput = ({ subjects, setSubjects }) => {
  const [newSubject, setNewSubject] = useState({
    name: '',
    priority: '',
    estimatedHours: ''
  });

  const addSubject = () => {
    if (newSubject.name && newSubject.priority && newSubject.estimatedHours) {
      const subject = {
        id: Date.now().toString(),
        name: newSubject.name,
        priority: newSubject.priority,
        estimatedHours: parseInt(newSubject.estimatedHours)
      };
      setSubjects([...subjects, subject]);
      setNewSubject({ name: '', priority: '', estimatedHours: '' });
    }
  };

  const removeSubject = (id) => {
    setSubjects(subjects.filter(subject => subject.id !== id));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const getPriorityIcon = (priority) => {
    if (priority === 'high') {
      return <AlertTriangle className="h-3 w-3" />;
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpen className="h-5 w-5" />
          <span>Subjects & Priorities</span>
        </CardTitle>
        <CardDescription>
          Add your subjects with priorities and estimated study hours
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Subject Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20">
          <div className="space-y-2">
            <Label htmlFor="subject-name">Subject Name</Label>
            <Input
              id="subject-name"
              placeholder="e.g., Advanced Mathematics"
              value={newSubject.name}
              onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="priority">Priority Level</Label>
            <Select 
              value={newSubject.priority}
              onValueChange={(value) => setNewSubject({...newSubject, priority: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High Priority</SelectItem>
                <SelectItem value="medium">Medium Priority</SelectItem>
                <SelectItem value="low">Low Priority</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="estimated-hours">Est. Hours</Label>
            <Input
              id="estimated-hours"
              type="number"
              placeholder="Hours"
              min="1"
              max="20"
              value={newSubject.estimatedHours}
              onChange={(e) => setNewSubject({...newSubject, estimatedHours: e.target.value})}
            />
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={addSubject}
              disabled={!newSubject.name || !newSubject.priority || !newSubject.estimatedHours}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Subject
            </Button>
          </div>
        </div>

        {/* Current Subjects List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Current Subjects ({subjects.length})</h3>
            <div className="text-sm text-muted-foreground">
              Total: {subjects.reduce((sum, subject) => sum + subject.estimatedHours, 0)} hours
            </div>
          </div>
          
          {subjects.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No subjects added yet</p>
              <p className="text-sm">Add your first subject to get started</p>
            </div>
          ) : (
            <div className="space-y-3">
              {subjects.map((subject, index) => (
                <motion.div
                  key={subject.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="space-y-1">
                      <h4 className="font-medium">{subject.name}</h4>
                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={getPriorityColor(subject.priority)}
                          className="text-xs flex items-center space-x-1"
                        >
                          {getPriorityIcon(subject.priority)}
                          <span>{subject.priority} priority</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {subject.estimatedHours} hours
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSubject(subject.id)}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SubjectInput;