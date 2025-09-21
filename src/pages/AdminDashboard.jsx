import React from 'react';
import Navbar from '@/components/Navbar';
import AdminPanel from '@/components/AdminPanel';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const AdminDashboard = () => {
  const { user, isLoading, isAdmin } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="w-8 h-8 text-primary" />
              <h1 className="text-4xl font-bold text-text-primary">Admin Dashboard</h1>
            </div>
            <p className="text-lg text-text-secondary">System administration and user management</p>
          </div>

          <AdminPanel />
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;