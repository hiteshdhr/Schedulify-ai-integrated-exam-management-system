import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const TimeSlotSelector = ({ timeSlots, setTimeSlots }) => {
  const [newTimeSlot, setNewTimeSlot] = useState({
    day: '',
    startTime: '',
    endTime: ''
  });

  const daysOfWeek = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const timeOptions = [];
  for (let hour = 6; hour <= 23; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeOptions.push(time);
    }
  }

  const addTimeSlot = () => {
    if (newTimeSlot.day && newTimeSlot.startTime && newTimeSlot.endTime) {
      // Check if time slot already exists for this day
      const existingSlot = timeSlots.find(slot => slot.day === newTimeSlot.day);
      if (existingSlot) {
        // Update existing slot
        setTimeSlots(timeSlots.map(slot => 
          slot.day === newTimeSlot.day ? newTimeSlot : slot
        ));
      } else {
        // Add new slot
        setTimeSlots([...timeSlots, newTimeSlot]);
      }
      setNewTimeSlot({ day: '', startTime: '', endTime: '' });
    }
  };

  const removeTimeSlot = (day) => {
    setTimeSlots(timeSlots.filter(slot => slot.day !== day));
  };

  const calculateDuration = (startTime, endTime) => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    const durationMinutes = endMinutes - startMinutes;
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    if (hours > 0 && minutes > 0) {
      return `${hours}h ${minutes}m`;
    } else if (hours > 0) {
      return `${hours}h`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Available Time Slots</span>
        </CardTitle>
        <CardDescription>
          Define when you're available to study during the week
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Add New Time Slot Form */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/20">
          <div className="space-y-2">
            <Label htmlFor="day">Day of Week</Label>
            <Select 
              value={newTimeSlot.day}
              onValueChange={(value) => setNewTimeSlot({...newTimeSlot, day: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map(day => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="start-time">Start Time</Label>
            <Select 
              value={newTimeSlot.startTime}
              onValueChange={(value) => setNewTimeSlot({...newTimeSlot, startTime: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Start time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeOptions.map(time => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="end-time">End Time</Label>
            <Select 
              value={newTimeSlot.endTime}
              onValueChange={(value) => setNewTimeSlot({...newTimeSlot, endTime: value})}
            >
              <SelectTrigger>
                <SelectValue placeholder="End time" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {timeOptions.map(time => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <Button 
              onClick={addTimeSlot}
              disabled={!newTimeSlot.day || !newTimeSlot.startTime || !newTimeSlot.endTime}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Slot
            </Button>
          </div>
        </div>

        {/* Current Time Slots */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Available Time Slots ({timeSlots.length})</h3>
            <div className="text-sm text-muted-foreground">
              Total: {timeSlots.reduce((total, slot) => {
                const [startHour, startMinute] = slot.startTime.split(':').map(Number);
                const [endHour, endMinute] = slot.endTime.split(':').map(Number);
                const duration = (endHour * 60 + endMinute) - (startHour * 60 + startMinute);
                return total + duration;
              }, 0) / 60} hours per week
            </div>
          </div>
          
          {timeSlots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No time slots defined</p>
              <p className="text-sm">Add your available study times</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {timeSlots.map((slot, index) => (
                <motion.div
                  key={slot.day}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="space-y-1">
                    <h4 className="font-medium">{slot.day}</h4>
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <span>{slot.startTime} - {slot.endTime}</span>
                      <span>•</span>
                      <span>{calculateDuration(slot.startTime, slot.endTime)}</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTimeSlot(slot.day)}
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

export default TimeSlotSelector;