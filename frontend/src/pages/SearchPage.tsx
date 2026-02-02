import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, CheckCircle, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';


const fetchSearchResults = async (query: string, token: string) => {
 
  const response = await fetch(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.message || 'Search request failed');
  }
  const resData = await response.json();
  if (!resData.success) {
    throw new Error(resData.message || 'Failed to get results');
  }
  // API returns { success: true, data: { exams: [], tasks: [], users: [] } }
  return resData.data; 
};


const SearchPage = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const { token } = useAuth();

  const [results, setResults] = useState<{ exams: any[], tasks: any[], users: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (query && token) {
      const performSearch = async () => {
        try {
          setIsLoading(true);
          const searchData = await fetchSearchResults(query, token);
          setResults(searchData);
        } catch (error: any) {
          toast.error(error.message || 'Failed to perform search');
          setResults({ exams: [], tasks: [], users: [] }); 
        } finally {
          setIsLoading(false);
        }
      };
      performSearch();
    } else {
      setIsLoading(false); 
    }
  }, [query, token]);

  const renderResults = () => {
    if (isLoading) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-8 w-1/4" />
          <Skeleton className="h-24 w-full" />
        </div>
      );
    }

    if (!results || (!results.exams.length && !results.tasks.length && !results.users.length)) {
      return (
        <div className="text-center py-12 text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p className="font-semibold">No results found for "{query}"</p>
          <p className="text-sm">Try searching for a different term.</p>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {results.exams.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center"><BookOpen className="mr-2 h-5 w-5" />Exams</h2>
            {results.exams.map((exam: any) => (
              <Link to={`/app/exams/`} key={exam._id}> 
                <Card className="hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="font-medium">{exam.subject}</div>
                    <p className="text-sm text-muted-foreground">
                      {new Date(exam.date).toLocaleDateString()} in {exam.roomNumber}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {results.tasks.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center"><CheckCircle className="mr-2 h-5 w-5" />Tasks</h2>
            {results.tasks.map((task: any) => (
              <Link to={`/app/tasks/`} key={task._id}> 
                <Card className="hover:bg-muted/50">
                  <CardContent className="p-4">
                    <div className="font-medium">{task.title}</div>
                    <p className="text-sm text-muted-foreground">
                      Priority: {task.priority} - Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p> 
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        {results.users.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-xl font-semibold flex items-center"><User className="mr-2 h-5 w-5" />Users</h2>
            {results.users.map((user: any) => (
              <Link to={`/app/profile/`} key={user._id}> {/* Update link if you have a single profile page */}
                <Card className="hover:bg-muted/50">
                  <CardContent className="p-4 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <Badge variant="outline" className="capitalize">{user.role}</Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold">Search Results</h1>
        {query ? (
          <p className="text-muted-foreground text-lg mt-2">
            Showing results for: <span className="font-semibold text-foreground">"{query}"</span>
          </p>
        ) : (
          <p className="text-muted-foreground text-lg mt-2">
            Please enter a search term in the navigation bar.
          </p>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card>
          <CardHeader>
            <CardTitle>Results</CardTitle>
          </CardHeader>
          <CardContent>
            {renderResults()}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default SearchPage;