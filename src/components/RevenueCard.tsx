import React, { useState, useEffect } from 'react';
import { TrendingUp, IndianRupee } from 'lucide-react';

const RevenueCard = () => {
  const [revenue, setRevenue] = useState(0);
  const targetRevenue = 2847500; // ₹28,47,500

  useEffect(() => {
    const animationDuration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetRevenue / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setRevenue(Math.floor(increment * currentStep));
      
      if (currentStep >= steps) {
        setRevenue(targetRevenue);
        clearInterval(timer);
      }
    }, animationDuration / steps);

    return () => clearInterval(timer);
  }, [targetRevenue]);

  const formatRevenue = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="dashboard-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-text-secondary text-sm font-medium mb-1">Total Revenue</h3>
          <p className="text-text-muted text-xs">Current fiscal year</p>
        </div>
        <div className="w-12 h-12 bg-primary-light rounded-dashboard flex items-center justify-center">
          <IndianRupee className="w-6 h-6 text-primary" />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="counter text-3xl font-bold text-text-primary animate-counter">
          {formatRevenue(revenue)}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-accent-light px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3 text-accent" />
            <span className="text-xs font-medium text-accent">+23.5%</span>
          </div>
          <span className="text-xs text-text-muted">vs last year</span>
        </div>
      </div>
      
      {/* Animated progress bar */}
      <div className="mt-4">
        <div className="flex justify-between text-xs text-text-muted mb-2">
          <span>Progress</span>
          <span>85%</span>
        </div>
        <div className="progress-bar h-2">
          <div 
            className="progress-fill bg-gradient-to-r from-primary to-primary-hover"
            style={{ width: '85%', animationDelay: '0.5s' }}
          />
        </div>
      </div>
    </div>
  );
};

export default RevenueCard;