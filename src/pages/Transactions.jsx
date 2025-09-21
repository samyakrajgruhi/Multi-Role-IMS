import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import TransactionHistory from '@/components/TransactionHistory';
import TransactionForm from '@/components/TransactionForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { History, Plus } from 'lucide-react';

const Transactions = () => {
  const [activeTab, setActiveTab] = useState('history');
  const [refreshHistory, setRefreshHistory] = useState(0);

  const handleTransactionSuccess = () => {
    setRefreshHistory(prev => prev + 1);
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-text-primary mb-4">Transaction Management</h1>
            <p className="text-lg text-text-secondary">Track your payments and donations</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="history" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                History
              </TabsTrigger>
              <TabsTrigger value="add" className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add New
              </TabsTrigger>
            </TabsList>

            <TabsContent value="history" key={refreshHistory}>
              <TransactionHistory />
            </TabsContent>

            <TabsContent value="add">
              <div className="max-w-2xl mx-auto">
                <TransactionForm onSuccess={handleTransactionSuccess} />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Transactions;