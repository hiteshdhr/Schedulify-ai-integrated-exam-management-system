import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';

const CalendarWidget = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Mock events data
  const events = [
    { date: new Date(2024, 0, 20), title: 'Math Exam', type: 'exam' },
    { date: new Date(2024, 0, 22), title: 'Physics Lab', type: 'exam' },
    { date: new Date(2024, 0, 25), title: 'CS Project Due', type: 'task' },
    { date: new Date(2024, 0, 28), title: 'Chemistry Quiz', type: 'exam' },
  ];

  const getEventsForDate = (date) => {
    return events.filter(event => isSameDay(event.date, date));
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Calendar</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={previousMonth}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={nextMonth}
              className="h-8 w-8"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="text-lg font-semibold text-center">
          {format(currentDate, 'MMMM yyyy')}
        </div>
      </CardHeader>
      <CardContent>
        {/* Days of week header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
            <div key={day} className="text-xs font-medium text-muted-foreground text-center py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month start */}
          {Array.from({ length: monthStart.getDay() }, (_, i) => (
            <div key={`empty-${i}`} className="h-8" />
          ))}
          
          {/* Month days */}
          {monthDays.map(day => {
            const dayEvents = getEventsForDate(day);
            const isSelected = isSameDay(day, selectedDate);
            const isTodayDate = isToday(day);
            
            return (
              <motion.div
                key={day.toISOString()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  h-8 flex items-center justify-center text-sm cursor-pointer rounded-md transition-colors relative
                  ${isTodayDate 
                    ? 'bg-blue-600 text-white font-semibold' 
                    : isSelected
                    ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100'
                    : 'hover:bg-muted'
                  }
                `}
                onClick={() => setSelectedDate(day)}
              >
                {format(day, 'd')}
                {dayEvents.length > 0 && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1 h-1 bg-orange-500 rounded-full" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Selected date events */}
        {selectedDate && (
          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium">
              {format(selectedDate, 'MMMM d, yyyy')}
            </h4>
            {getEventsForDate(selectedDate).length > 0 ? (
              <div className="space-y-1">
                {getEventsForDate(selectedDate).map((event, index) => (
                  <div
                    key={index}
                    className="text-xs p-2 rounded bg-muted flex items-center justify-between"
                  >
                    <span>{event.title}</span>
                    <Badge variant={event.type === 'exam' ? 'default' : 'secondary'} className="text-xs">
                      {event.type}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No events scheduled</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CalendarWidget;