import React, { useState } from 'react';
import { Bell, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Button } from './ui/button';

interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  isRead: boolean;
}

// Mock data - replace with actual data from backend
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Sunday, 2:00 AM - 4:00 AM',
    createdAt: '2025-01-15T10:30:00',
    isRead: false,
  },
  {
    id: '2',
    title: 'New Feature Released',
    message: 'Check out our new beneficiary request system!',
    createdAt: '2025-01-14T15:20:00',
    isRead: false,
  },
  {
    id: '3',
    title: 'Payment Processing Update',
    message: 'Payment processing times have been improved.',
    createdAt: '2025-01-13T09:15:00',
    isRead: true,
  },
];

export const NotificationDropdown = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = announcements.filter(a => !a.isRead).length;

  const markAsRead = (id: string) => {
    setAnnouncements(prev =>
      prev.map(a => (a.id === id ? { ...a, isRead: true } : a))
    );
  };

  const markAllAsRead = () => {
    setAnnouncements(prev => prev.map(a => ({ ...a, isRead: true })));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button className="relative p-2 text-text-secondary hover:text-primary hover:bg-surface-hover rounded-dashboard transition-all duration-200">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-warning text-white text-xs"
            >
              {unreadCount}
            </Badge>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0 bg-surface border-border z-[100]" align="end">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-text-primary">Notifications</h3>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-primary hover:text-primary-hover"
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          {announcements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-text-muted">
              <Bell className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`p-4 cursor-pointer transition-colors hover:bg-surface-hover ${
                    !announcement.isRead ? 'bg-primary-light/30' : ''
                  }`}
                  onClick={() => markAsRead(announcement.id)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <h4 className={`font-medium text-sm ${
                      !announcement.isRead ? 'text-text-primary' : 'text-text-secondary'
                    }`}>
                      {announcement.title}
                    </h4>
                    {!announcement.isRead && (
                      <div className="w-2 h-2 bg-primary rounded-full mt-1 ml-2" />
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mb-2">
                    {announcement.message}
                  </p>
                  <span className="text-xs text-text-muted">
                    {formatDate(announcement.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};
