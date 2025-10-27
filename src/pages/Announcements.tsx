import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Megaphone, Trash2, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Announcement {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  createdBy: string;
}

// Mock data - replace with actual data from backend
const mockAnnouncements: Announcement[] = [
  {
    id: '1',
    title: 'System Maintenance',
    message: 'Scheduled maintenance on Sunday, 2:00 AM - 4:00 AM. During this time, the system may be temporarily unavailable.',
    createdAt: '2025-01-15T10:30:00',
    createdBy: 'Admin',
  },
  {
    id: '2',
    title: 'New Feature Released',
    message: 'Check out our new beneficiary request system! Members can now submit benefit requests online.',
    createdAt: '2025-01-14T15:20:00',
    createdBy: 'Admin',
  },
  {
    id: '3',
    title: 'Payment Processing Update',
    message: 'Payment processing times have been improved. Payments will now be processed within 24 hours.',
    createdAt: '2025-01-13T09:15:00',
    createdBy: 'Admin',
  },
];

const Announcements = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    message: '',
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const newAnnouncement: Announcement = {
      id: Date.now().toString(),
      title: formData.title,
      message: formData.message,
      createdAt: new Date().toISOString(),
      createdBy: user?.name || 'Admin',
    };

    setAnnouncements([newAnnouncement, ...announcements]);
    setFormData({ title: '', message: '' });
    setShowForm(false);

    toast({
      title: "Success",
      description: "Announcement created successfully",
    });
  };

  const handleDelete = (id: string) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
    toast({
      title: "Success",
      description: "Announcement deleted successfully",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-text-primary flex items-center gap-3">
              <Megaphone className="w-8 h-8 text-primary" />
              Announcements
            </h1>
            <p className="text-text-secondary mt-2">
              {user?.isAdmin ? 'Create and manage announcements for all users' : 'Stay updated with the latest announcements'}
            </p>
          </div>
          
          {user?.isAdmin && (
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              New Announcement
            </Button>
          )}
        </div>

        {showForm && user?.isAdmin && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Create New Announcement</CardTitle>
              <CardDescription>
                This announcement will be visible to all users
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter announcement title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    maxLength={100}
                  />
                </div>
                
                <div>
                  <Label htmlFor="message">Message</Label>
                  <Textarea
                    id="message"
                    placeholder="Enter announcement message"
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    rows={4}
                    maxLength={500}
                  />
                  <p className="text-xs text-text-muted mt-1">
                    {formData.message.length}/500 characters
                  </p>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setShowForm(false);
                      setFormData({ title: '', message: '' });
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    Create Announcement
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {announcements.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Megaphone className="w-12 h-12 text-text-muted mb-4" />
                <p className="text-text-muted">No announcements yet</p>
              </CardContent>
            </Card>
          ) : (
            announcements.map((announcement) => (
              <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl mb-1">{announcement.title}</CardTitle>
                      <CardDescription>
                        Created by {announcement.createdBy} on {formatDate(announcement.createdAt)}
                      </CardDescription>
                    </div>
                    {user?.isAdmin && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="text-warning hover:text-warning hover:bg-warning-light">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Announcement</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this announcement? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(announcement.id)}>
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-text-secondary">{announcement.message}</p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Announcements;
