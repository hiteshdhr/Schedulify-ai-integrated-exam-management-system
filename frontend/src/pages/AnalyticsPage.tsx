import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PerformanceChart from '@/components/widgets/PerformanceChart'; 
import { useAuth } from '@/context/AuthContext'; 
import { toast } from 'sonner'; 

// --- (fetchSystemPerformance function is unchanged) ---
const fetchSystemPerformance = async (token: string) => {
  const response = await fetch('http://localhost:5000/api/analytics/system-performance', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Failed to fetch system analytics');
  }
  const resData = await response.json();
  if (!resData.success) {
    throw new Error(resData.message || 'Failed to fetch analytics');
  }
  return resData.data; 
};
// --- END OF FIX ---

const AnalyticsPage = () => {
  const { token } = useAuth();
  const [performanceData, setPerformanceData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const loadAnalytics = async () => {
        try {
          setIsLoading(true);
          const perfData = await fetchSystemPerformance(token);
          setPerformanceData(perfData);
        } catch (error: any) {
          toast.error(error.message || "Failed to load analytics");
          setPerformanceData([]);
        } finally {
          setIsLoading(false);
        }
      };
      loadAnalytics();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold">System Analytics</h1>
        <p className="text-muted-foreground text-lg mt-2">
          View system-wide performance and user analytics.
        </p>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        {/* --- THIS IS THE FIX --- */}
        <PerformanceChart 
          data={performanceData} 
          title="System-Wide Analytics"
          description="Total student performance over the past 6 weeks"
        />
        {/* --- END OF FIX --- */}
      </motion.div>
    </div>
  );
};

export default AnalyticsPage;