import React, { useState, useEffect } from 'react';
import { Users, UserCheck } from 'lucide-react';

const MembersCard = () => {
  const [members, setMembers] = useState(0);
  const targetMembers = 156;
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });

  useEffect(() => {
    const animationDuration = 1500; // 1.5 seconds
    const steps = 50;
    const increment = targetMembers / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      setMembers(Math.floor(increment * currentStep));
      
      if (currentStep >= steps) {
        setMembers(targetMembers);
        clearInterval(timer);
      }
    }, animationDuration / steps);

    return () => clearInterval(timer);
  }, [targetMembers]);

  return (
    <div className="dashboard-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-text-secondary text-sm font-medium mb-1">Members Assisted</h3>
          <p className="text-text-muted text-xs">{currentMonth} 2024</p>
        </div>
        <div className="w-12 h-12 bg-accent-light rounded-dashboard flex items-center justify-center">
          <Users className="w-6 h-6 text-accent" />
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="counter text-3xl font-bold text-text-primary animate-counter" style={{ animationDelay: '0.2s' }}>
          {members.toLocaleString()}
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1 bg-primary-light px-2 py-1 rounded-full">
            <UserCheck className="w-3 h-3 text-primary" />
            <span className="text-xs font-medium text-primary">+12.3%</span>
          </div>
          <span className="text-xs text-text-muted">vs last month</span>
        </div>
      </div>
      
      {/* Member categories */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-xs text-text-secondary">New Members</span>
          <span className="text-xs font-medium text-text-primary">42</span>
        </div>
        <div className="progress-bar h-1.5">
          <div 
            className="progress-fill bg-gradient-to-r from-accent to-primary"
            style={{ width: '27%', animationDelay: '0.7s' }}
          />
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-xs text-text-secondary">Returning</span>
          <span className="text-xs font-medium text-text-primary">114</span>
        </div>
        <div className="progress-bar h-1.5">
          <div 
            className="progress-fill bg-gradient-to-r from-primary to-accent"
            style={{ width: '73%', animationDelay: '0.9s' }}
          />
        </div>
      </div>
    </div>
  );
};

export default MembersCard;