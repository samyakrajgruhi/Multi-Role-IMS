import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { firestore } from '@/firebase';
import { collection, query, where, getDocs, updateDoc } from 'firebase/firestore';

const MakeCollectionMember = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [sfaId, setSfaId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const isAdmin = user?.role === 'admin';

  const handleSearch = async () => {
    if (!sfaId.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an SFA ID',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsProcessing(true);
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('sfa_id', '==', sfaId.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        toast({
          title: 'Not Found',
          description: 'No member found with this SFA ID',
          variant: 'destructive'
        });
        setMemberInfo(null);
        return;
      }

      const memberDoc = querySnapshot.docs[0];
      const data = memberDoc.data();
      const memberData = { 
        id: memberDoc.id, 
        full_name: data.full_name,
        sfa_id: data.sfa_id,
        cms_id: data.cms_id,
        lobby_id: data.lobby_id,
        role: data.role || 'member'
      };
      setMemberInfo(memberData);

      if (memberData.role === 'collection') {
        toast({
          title: 'Already Collection Member',
          description: 'This member is already a collection member',
        });
      }
    } catch (error) {
      console.error('Error searching member:', error);
      toast({
        title: 'Error',
        description: 'Failed to search for member',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMakeCollectionMember = async () => {
    if (!memberInfo) return;

    try {
      setIsProcessing(true);
      const usersRef = collection(firestore, 'users');
      const q = query(usersRef, where('sfa_id', '==', sfaId.trim()));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const memberDoc = querySnapshot.docs[0];
        await updateDoc(memberDoc.ref, {
          role: 'collection'
        });

        toast({
          title: 'Success',
          description: `${memberInfo.full_name} is now a collection member`,
        });

        setMemberInfo({ ...memberInfo, role: 'collection' });
        setSfaId('');
        setMemberInfo(null);
      }
    } catch (error) {
      console.error('Error updating member role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update member role',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-12 w-12 rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <div className="max-w-4xl mx-auto px-6 py-12">
          <Button 
            variant="ghost" 
            className="mb-6"
            onClick={() => navigate('/admin')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Menu
          </Button>

          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-4">Make Collection Member</h1>
            <p className="text-lg text-text-secondary">Assign collection member role by SFA ID</p>
          </div>

          <Card className="p-6 mb-6">
            <CardHeader>
              <CardTitle>Search Member</CardTitle>
              <CardDescription>Enter the SFA ID of the member you want to make a collection member</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input
                  placeholder="Enter SFA ID (e.g., SFA1001)"
                  value={sfaId}
                  onChange={(e) => setSfaId(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSearch}
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Searching...' : 'Search'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {memberInfo && (
            <Card className="p-6">
              <CardHeader>
                <CardTitle>Member Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-text-secondary">Name</p>
                      <p className="text-lg font-semibold text-text-primary">{memberInfo.full_name || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">SFA ID</p>
                      <p className="text-lg font-semibold text-primary">{memberInfo.sfa_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">CMS ID</p>
                      <p className="text-lg font-semibold text-text-primary">{memberInfo.cms_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Lobby</p>
                      <p className="text-lg font-semibold text-text-primary">{memberInfo.lobby_id || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary">Current Role</p>
                      <p className="text-lg font-semibold text-accent">{memberInfo.role || 'member'}</p>
                    </div>
                  </div>

                  {memberInfo.role !== 'collection' && (
                    <div className="pt-4 border-t border-border">
                      <Button 
                        onClick={handleMakeCollectionMember}
                        disabled={isProcessing}
                        className="w-full"
                      >
                        <UserPlus className="w-4 h-4 mr-2" />
                        {isProcessing ? 'Processing...' : 'Make Collection Member'}
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
};

export default MakeCollectionMember;
