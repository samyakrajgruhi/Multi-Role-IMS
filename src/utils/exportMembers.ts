interface Member {
  name?: string;
  sfaId?: string;
  cmsId?: string;
  lobby?: string;
  email?: string;
  phoneNumber?: string;
  emergencyNumber?: string;
  designation?: string;
  dateOfBirth?: Date | string;
  bloodGroup?: string;
  presentStatus?: string;
  pfNumber?: string;
  registrationDate?: Date | string;
  isFounder?: boolean;
  isAdmin?: boolean;
  isCollectionMember?: boolean;
  nominees?: Array<{
    name?: string;
    relationship?: string;
    phoneNumber?: string;
    sharePercentage?: number;
  }>;
}

export const exportMembersToCSV = (members: Member[]) => {
  // Define CSV headers
  const headers = [
    'Name',
    'SFA ID',
    'CMS ID',
    'Lobby',
    'Email',
    'Phone Number',
    'Emergency Number',
    'Designation',
    'Date of Birth',
    'Blood Group',
    'Present Status',
    'PF Number',
    'Registration Date',
    'Nominee 1 Name',
    'Nominee 1 Relationship',
    'Nominee 1 Phone',
    'Nominee 1 Share %',
    'Nominee 2 Name',
    'Nominee 2 Relationship',
    'Nominee 2 Phone',
    'Nominee 2 Share %',
    'Nominee 3 Name',
    'Nominee 3 Relationship',
    'Nominee 3 Phone',
    'Nominee 3 Share %',
  ];

  // Convert members data to CSV rows
  const rows = members.map(member => {
    const role = member.isFounder ? 'Founder' : 
                 member.isAdmin ? 'Admin' : 
                 member.isCollectionMember ? 'Collection Member' : 'Member';

    const nominee1 = member.nominees?.[0] || {};
    const nominee2 = member.nominees?.[1] || {};
    const nominee3 = member.nominees?.[2] || {};

    return [
      member.name || '',
      member.sfaId || '',
      member.cmsId || '',
      member.lobby || '',
      member.email || '',
      member.phoneNumber || '',
      member.emergencyNumber || '',
      member.designation || '',
      member.dateOfBirth ? new Date(member.dateOfBirth).toLocaleDateString() : '',
      member.bloodGroup || '',
      member.presentStatus || '',
      member.pfNumber || '',
      member.registrationDate ? new Date(member.registrationDate).toLocaleDateString() : '',
      nominee1.name || '',
      nominee1.relationship || '',
      nominee1.phoneNumber || '',
      nominee1.sharePercentage || '',
      nominee2.name || '',
      nominee2.relationship || '',
      nominee2.phoneNumber || '',
      nominee2.sharePercentage || '',
      nominee3.name || '',
      nominee3.relationship || '',
      nominee3.phoneNumber || '',
      nominee3.sharePercentage || '',
    ].map(field => `"${String(field).replace(/"/g, '""')}"`).join(',');
  });

  // Combine headers and rows
  const csv = [headers.join(','), ...rows].join('\n');

  // Create and trigger download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `SFA_Members_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
