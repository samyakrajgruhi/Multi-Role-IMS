import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { User, Mail, Shield, MapPin, CreditCard, Calendar, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const UserInfo = () => {
  const { user, isLoading, sendVerificationEmail } = useAuth();
  const [sendingVerification, setSendingVerification] = useState(false);

  const handleSendVerification = async () => {
    setSendingVerification(true);
    const success = await sendVerificationEmail();
    setSendingVerification(false);
    
    if (success) {
      alert('Verification email sent! Please check your inbox.');
    } else {
      alert('Failed to send verification email. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-4">User Information</h1>
            <p className="text-lg text-text-secondary">Your SFA membership details</p>
          </div>

          <div className="space-y-6">
            {/* Profile Card */}
            <Card className="p-8">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                    <img 
                      src="/SFA-updateLogo.png" 
                      alt="SFA Logo" 
                      className="w-10 h-10 object-contain"
                    />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary">{user.full_name}</h2>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                        {user.role === 'admin' ? (
                          <><Shield className="w-3 h-3 mr-1" />Admin</>
                        ) : (
                          <><User className="w-3 h-3 mr-1" />Member</>
                        )}
                      </Badge>
                      {user.emailVerified ? (
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Verified
                        </Badge>
                      ) : (
                        <Badge variant="destructive">
                          <XCircle className="w-3 h-3 mr-1" />
                          Unverified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-text-secondary flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email Address
                    </Label>
                    <div className="mt-1 p-3 bg-surface border border-border rounded-dashboard">
                      <p className="text-text-primary">{user.email}</p>
                      {!user.emailVerified && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleSendVerification}
                          disabled={sendingVerification}
                          className="mt-2"
                        >
                          {sendingVerification ? 'Sending...' : 'Send Verification Email'}
                        </Button>
                      )}
                    </div>
                  </div>

                  <div>
                    <Label className="text-text-secondary flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      SFA ID
                    </Label>
                    <p className="mt-1 p-3 bg-primary-light text-primary rounded-dashboard font-medium">
                      {user.sfa_id}
                    </p>
                  </div>

                  <div>
                    <Label className="text-text-secondary flex items-center gap-2">
                      <User className="w-4 h-4" />
                      CMS ID
                    </Label>
                    <p className="mt-1 p-3 bg-accent-light text-accent rounded-dashboard font-mono">
                      {user.cms_id}
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <Label className="text-text-secondary flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Lobby ID
                    </Label>
                    <p className="mt-1 p-3 bg-warning-light text-warning rounded-dashboard font-medium">
                      {user.lobby_id}
                    </p>
                  </div>

                  <div>
                    <Label className="text-text-secondary flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Member Since
                    </Label>
                    <p className="mt-1 p-3 bg-surface border border-border rounded-dashboard text-text-primary">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      }) : 'N/A'}
                    </p>
                  </div>

                  <div>
                    <Label className="text-text-secondary">Account Status</Label>
                    <div className="mt-1 p-3 bg-surface border border-border rounded-dashboard">
                      <div className="flex items-center justify-between">
                        <span className="text-text-primary">Active Member</span>
                        <Badge variant="outline" className="text-green-600">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Active
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h3 className="text-lg font-bold text-text-primary mb-4">Quick Actions</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 h-12"
                  onClick={() => window.location.href = '/transactions'}
                >
                  <CreditCard className="w-4 h-4" />
                  View Transactions
                </Button>
                
                <Button 
                  variant="outline" 
                  className="flex items-center gap-2 h-12"
                  onClick={() => window.location.href = '/payment'}
                >
                  <CreditCard className="w-4 h-4" />
                  Make Payment
                </Button>

                {user.role === 'admin' && (
                  <Button 
                    variant="outline" 
                    className="flex items-center gap-2 h-12"
                    onClick={() => window.location.href = '/admin'}
                  >
                    <Shield className="w-4 h-4" />
                    Admin Panel
                  </Button>
                )}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default UserInfo;