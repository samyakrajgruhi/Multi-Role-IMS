// Initial Admin Setup Utility
// Run this once to create the first admin user

import { auth, firestore } from '@/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';

export const setupInitialAdmin = async (adminData) => {
  try {
    const { email, password, fullName, cmsId, lobbyId } = adminData;
    
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Generate SFA ID
    const sfaId = `SFA${String(Date.now()).slice(-6)}`;
    
    // Create user document in Firestore with admin role
    const userData = {
      full_name: fullName,
      cms_id: cmsId,
      lobby_id: lobbyId,
      sfa_id: sfaId,
      email: email,
      uid: user.uid,
      role: 'admin', // Set as admin
      createdAt: new Date().toISOString(),
      emailVerified: false
    };
    
    await setDoc(doc(firestore, 'users', cmsId), userData);
    
    console.log('Initial admin user created successfully');
    return { success: true, user: userData };
    
  } catch (error) {
    console.error('Error creating initial admin:', error);
    return { success: false, error: error.message };
  }
};

// Example usage (uncomment and modify as needed):
// setupInitialAdmin({
//   email: 'admin@sfa.gov.in',
//   password: 'SecurePassword123!',
//   fullName: 'SFA Administrator',
//   cmsId: 'ADMIN001',
//   lobbyId: 'MAIN'
// });