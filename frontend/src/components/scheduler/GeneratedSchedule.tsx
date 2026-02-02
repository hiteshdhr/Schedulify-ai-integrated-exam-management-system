import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, TrendingUp, Download, Share } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

const GeneratedSchedule = ({ schedule }) => {
  const getTypeColor = (type) => {
    switch (type) {
      case 'study': return 'bg-blue-500';
      case 'practice': return 'bg-green-500';
      case 'review': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'medium': return 'border-l-orange-500';
      case 'low': return 'border-l-green-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Schedule Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Schedule Overview</span>
          </CardTitle>
          <CardDescription>
            Your optimized study schedule for this week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-blue-600">{schedule.totalStudyHours}h</div>
              <p className="text-sm text-muted-foreground">Total Study Time</p>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50">
              <div className="text-2xl font-bold text-green-600">{schedule.efficiency}%</div>
              <p className="text-sm text-muted-foreground">Efficiency Score</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2 mt-4">
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Weekly Schedule</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {schedule.week.map((day, dayIndex) => (
              <motion.div
                key={day.day}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: dayIndex * 0.1 }}
                className="space-y-3"
              >
                <h3 className="font-semibold text-lg border-b pb-2">{day.day}</h3>
                
                {day.sessions.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4">No study sessions scheduled</p>
                ) : (
                  <div className="space-y-2">
                    {day.sessions.map((session, sessionIndex) => (
                      <motion.div
                        key={sessionIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: (dayIndex * 0.1) + (sessionIndex * 0.05) }}
                        className={`flex items-center justify-between p-3 border-l-4 rounded-r-lg bg-muted/30 ${getPriorityColor(session.priority)}`}
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">
                              {session.startTime} - {session.endTime}
                            </span>
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-medium">{session.subject}</h4>
                            <div className="flex items-center space-x-2">
                              <div className={`w-2 h-2 rounded-full ${getTypeColor(session.type)}`} />
                              <span className="text-xs text-muted-foreground capitalize">
                                {session.type} session
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge 
                            variant={session.priority === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {session.priority}
                          </Badge>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Schedule Legend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Session Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-blue-500" />
              <span className="text-sm">Study</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <span className="text-sm">Practice</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-purple-500" />
              <span className="text-sm">Review</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneratedSchedule;