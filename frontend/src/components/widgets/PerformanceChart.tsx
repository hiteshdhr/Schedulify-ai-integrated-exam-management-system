import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';


interface PerformanceData {
  week: string;
  studyHours: number;
  completedTasks: number;
  examScores: number[];
}


interface PerformanceChartProps {
  data: PerformanceData[] | null; 
  title: string;
  description: string;
}


const PerformanceChart: React.FC<PerformanceChartProps> = ({ data, title, description }) => {
 
  if (!data) {
    return (
      <Card>
        <CardHeader className="pb-4">
          
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
        
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Weekly Study Hours</h3>
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Tasks Completed</h3>
            <Skeleton className="h-24 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }
 
  if (data.length < 2) {
    return (
      <Card>
        <CardHeader className="pb-4">
         
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>{title}</span>
          </CardTitle>
          <CardDescription>
            {description}
          </CardDescription>
         
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="font-semibold">Not enough data</p>
            <p className="text-sm">Complete some tasks to see your performance.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  

  const performanceData = data; 
  const currentWeek = performanceData[performanceData.length - 1];
  const previousWeek = performanceData[performanceData.length - 2];
  
  
  const studyHoursTrend = currentWeek.studyHours - previousWeek.studyHours;
  const tasksTrend = currentWeek.completedTasks - previousWeek.completedTasks;
  
  const avgCurrentScore = currentWeek.examScores.length > 0 ? currentWeek.examScores.reduce((sum, score) => sum + score, 0) / currentWeek.examScores.length : 0;
  const avgPreviousScore = previousWeek.examScores.length > 0 ? previousWeek.examScores.reduce((sum, score) => sum + score, 0) / previousWeek.examScores.length : 0;
  const scoreTrend = avgCurrentScore - avgPreviousScore;

  const maxStudyHours = Math.max(1, ...performanceData.map(d => d.studyHours)); // Ensure max is at least 1
  const maxTasks = Math.max(1, ...performanceData.map(d => d.completedTasks)); // Ensure max is at least 1

  return (
    <Card className="hover:shadow-lg transition-all duration-300">
      <CardHeader className="pb-4">
        {/* --- FIX: Use props for title and description --- */}
        <CardTitle className="flex items-center space-x-2">
          <BarChart3 className="h-5 w-5" />
          <span>{title}</span>
        </CardTitle>
        <CardDescription>
          {description}
        </CardDescription>
        {/* --- END OF FIX --- */}
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl font-bold">{currentWeek.studyHours}</span>
              <div className="ml-2">
                {studyHoursTrend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Study Hours</p>
            <Badge variant={studyHoursTrend > 0 ? "default" : "secondary"} className="text-xs mt-1">
              {studyHoursTrend > 0 ? '+' : ''}{studyHoursTrend}h
            </Badge>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl font-bold">{currentWeek.completedTasks}</span>
              <div className="ml-2">
                {tasksTrend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Tasks Done</p>
            <Badge variant={tasksTrend > 0 ? "default" : "secondary"} className="text-xs mt-1">
              {tasksTrend > 0 ? '+' : ''}{tasksTrend}
            </Badge>
          </div>
          
          <div className="text-center p-3 rounded-lg bg-muted/50">
            <div className="flex items-center justify-center mb-2">
              <span className="text-2xl font-bold">{Math.round(avgCurrentScore)}</span>
              <div className="ml-2">
                {scoreTrend > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Avg Score</p>
            <Badge variant={scoreTrend > 0 ? "default" : "secondary"} className="text-xs mt-1">
              {scoreTrend > 0 ? '+' : ''}{Math.round(scoreTrend)}%
            </Badge>
          </div>
        </div>

        {/* Study Hours Chart */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Weekly Study Hours</h3>
          <div className="space-y-2">
            {performanceData.map((week, index) => (
              <motion.div
                key={week.week}
                initial={{ width: 0 }}
                animate={{ width: `${(week.studyHours / maxStudyHours) * 100}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex items-center space-x-3"
              >
                <div className="w-16 text-sm text-muted-foreground">{week.week}</div>
                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500"
                    style={{ width: `${(week.studyHours / maxStudyHours) * 100}%` }}
                  />
                </div>
                <div className="w-12 text-sm font-medium">{week.studyHours}h</div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Tasks Completed Chart */}
        <div className="space-y-3">
          <h3 className="font-semibold text-sm">Tasks Completed</h3>
          <div className="space-y-2">
            {performanceData.map((week, index) => (
              <motion.div
                key={week.week}
                initial={{ width: 0 }}
                animate={{ width: `${(week.completedTasks / maxTasks) * 100}%` }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="flex items-center space-x-3"
              >
                <div className="w-16 text-sm text-muted-foreground">{week.week}</div>
                <div className="flex-1 h-6 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full transition-all duration-500"
                    style={{ width: `${(week.completedTasks / maxTasks) * 100}%` }}
                  />
                </div>
                <div className="w-12 text-sm font-medium">{week.completedTasks}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceChart;