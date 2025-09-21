import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { CreditCard, Plus } from 'lucide-react';
import { firestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const TransactionForm = ({ onSuccess }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: '',
    collector_name: '',
    mode: '',
    description: '',
    status: 'completed'
  });

  const paymentModes = [
    'Cash',
    'UPI',
    'Net Banking',
    'Credit Card',
    'Debit Card',
    'Cheque',
    'NEFT/RTGS'
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.collector_name || !formData.mode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (isNaN(formData.amount) || parseFloat(formData.amount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      
      const transactionData = {
        cms_id: user.cms_id,
        amount: parseFloat(formData.amount),
        collector_name: formData.collector_name,
        mode: formData.mode,
        description: formData.description,
        status: formData.status,
        createdAt: new Date().toISOString(),
        user_name: user.full_name,
        sfa_id: user.sfa_id,
        lobby_id: user.lobby_id
      };

      await addDoc(collection(firestore, 'transactions'), transactionData);
      
      toast({
        title: "Success",
        description: "Transaction recorded successfully"
      });
      
      // Reset form
      setFormData({
        amount: '',
        collector_name: '',
        mode: '',
        description: '',
        status: 'completed'
      });
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast({
        title: "Error",
        description: "Failed to record transaction",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <CreditCard className="w-5 h-5 text-primary" />
        <h3 className="text-xl font-bold text-text-primary">Add New Transaction</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="amount" className="text-text-secondary">Amount (₹) *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div>
            <Label htmlFor="collector" className="text-text-secondary">Collector Name *</Label>
            <Input
              id="collector"
              type="text"
              placeholder="Enter collector name"
              value={formData.collector_name}
              onChange={(e) => handleInputChange('collector_name', e.target.value)}
              className="mt-1"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="mode" className="text-text-secondary">Payment Mode *</Label>
          <Select value={formData.mode} onValueChange={(value) => handleInputChange('mode', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select payment mode" />
            </SelectTrigger>
            <SelectContent>
              {paymentModes.map((mode) => (
                <SelectItem key={mode} value={mode}>
                  {mode}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description" className="text-text-secondary">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add any additional notes..."
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className="mt-1"
            rows={3}
          />
        </div>

        <div>
          <Label htmlFor="status" className="text-text-secondary">Status</Label>
          <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          type="submit" 
          className="w-full"
          disabled={loading}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-4 w-4 rounded-full border-2 border-white border-t-transparent"></div>
              Recording...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Record Transaction
            </div>
          )}
        </Button>
      </form>
    </Card>
  );
};

export default TransactionForm;