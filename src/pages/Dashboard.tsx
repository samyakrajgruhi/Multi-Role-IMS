import React from 'react';
import Navbar from '../components/Navbar';
import RevenueCard from '../components/RevenueCard';
import MembersCard from '../components/MembersCard';
import DashboardTable from '../components/DashboardTable';

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* Main Content */}
      <main className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard Overview</h1>
            <p className="text-text-secondary">Monitor your business performance in real-time</p>
          </div>

          {/* Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Cards */}
            <div className="space-y-6">
              <RevenueCard />
              <MembersCard />
            </div>

            {/* Right Column - Table */}
            <div className="lg:col-span-1">
              <DashboardTable />
            </div>
          </div>

          {/* Additional Content for Scroll Testing */}
          <div className="mt-12 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className="dashboard-card animate-fade-in hover-lift"
                  style={{ animationDelay: `${1 + i * 0.1}s` }}
                >
                  <h4 className="font-semibold text-text-primary mb-2">Quick Stats {i}</h4>
                  <div className="text-2xl font-bold text-primary mb-1">
                    {(Math.random() * 1000).toFixed(0)}
                  </div>
                  <p className="text-xs text-text-muted">Sample metric description</p>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Content for More Scroll */}
          <div className="mt-16 text-center py-12">
            <div className="dashboard-card max-w-2xl mx-auto animate-fade-in" style={{ animationDelay: '1.5s' }}>
              <h3 className="text-xl font-semibold text-text-primary mb-4">Welcome to Your Dashboard</h3>
              <p className="text-text-secondary mb-6">
                This modern dashboard provides real-time insights into your business performance. 
                Scroll up and down to see the floating navbar in action!
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <button className="px-6 py-2 bg-primary text-white rounded-dashboard hover:bg-primary-hover transition-colors duration-200 hover-lift">
                  View Reports
                </button>
                <button className="px-6 py-2 border border-border text-text-primary rounded-dashboard hover:bg-surface-hover transition-colors duration-200 hover-lift">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;