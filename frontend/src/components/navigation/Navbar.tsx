import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // Removed useLocation
import { motion } from 'framer-motion';
import { Bell, Search, Sparkles } from 'lucide-react'; // Removed User
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThemeToggle } from '@/components/theme-toggle';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { ChatModal } from '@/components/assistant/ChatModal';
import { toast } from 'sonner';

// --- (Notification interface is unchanged) ---
interface Notification {
  _id: string;
  message: string;
  link: string;
  read: boolean;
  createdAt: string;
}

const Navbar = () => {
  // const location = useLocation(); // Removed unused variable
  const navigate = useNavigate();
  const { user, token, logout } = useAuth(); 

  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // --- (useEffect and helper functions are unchanged) ---
  useEffect(() => {
    if (!user || !token) {
      setNotifications([]);
      setLoadingNotifications(false);
      return;
    }

    const fetchNotifications = async () => {
      setLoadingNotifications(true);
      try {
        const response = await fetch('http://localhost:5000/api/notifications/my', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch notifications');
        }

        const resData = await response.json();
        
        if (resData.success) {
          setNotifications(resData.data);
        } else {
          setNotifications([]);
        }

      } catch (error: any) {
        toast.error(error.message || 'Could not load notifications');
        setNotifications([]);
      } finally {
        setLoadingNotifications(false);
      }
    };

    fetchNotifications();

  }, [user, token]);

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim() !== '') {
      navigate(`/app/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Clear after search
    }
  };

  const getInitials = (name: string | undefined) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const handleNotificationClick = async (notification: Notification) => {
    navigate(notification.link || '/app/dashboard');
    if (token) {
      try {
        await fetch(`http://localhost:5000/api/notifications/read/${notification._id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setNotifications((prev) => prev.filter((n) => n._id !== notification._id));
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    }
  };
  // --- (End of unchanged code) ---

  return (
    <>
      <motion.header
        initial={{ y: -64, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className=" left-0 top-0 w-full h-16 bg-background/80 backdrop-blur-lg border-b z-40"
      >
        <div className="flex items-center justify-between px-6 h-full">
          
          {/* --- GROUP 1: LEFT (Logo) --- */}
          <div className="flex items-center space-x-4">
            <Link to="/app/dashboard" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="font-bold text-xl hidden sm:block">Schedulify</span>
            </Link>
          </div>

          {/* --- GROUP 2: CENTER (Search) --- */}
          <div className="flex-1 flex justify-center px-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search exams, tasks..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
              />
            </div>
          </div>

          {/* --- GROUP 3: RIGHT (Icons + Avatar) --- */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(true)}>
              <Sparkles className="h-4 w-4" />
            </Button>
            
            {/* Notification Bell */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  {notifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64" align="end">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {loadingNotifications ? (
                  <DropdownMenuItem disabled>Loading...</DropdownMenuItem>
                ) : notifications.length === 0 ? (
                  <DropdownMenuItem disabled>No new notifications</DropdownMenuItem>
                ) : (
                  notifications.map(notif => (
                    <DropdownMenuItem key={notif._id} onSelect={() => handleNotificationClick(notif)}>
                      <p className="text-xs truncate">{notif.message}</p>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* User Avatar Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`} alt={user?.name} />
                    <AvatarFallback>{getInitials(user?.name)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                
                {/* --- THIS IS THE FIX --- */}
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                {/* --- END OF FIX --- */}

                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/app/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/app/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout}>
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          
        </div>
      </motion.header>

      {/* Chat Modal */}
      <ChatModal isOpen={isChatOpen} onOpenChange={setIsChatOpen} />
    </>
  );
};

export default Navbar;