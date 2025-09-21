// Firestore Security Rules
// Copy these rules to your Firebase Console -> Firestore Database -> Rules

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users collection
    match /users/{userId} {
      // Users can read their own data
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Users can create their own profile during registration
      allow create: if request.auth != null && 
        request.auth.uid == request.resource.data.uid;
      
      // Users can update their own data, admins can update any user
      allow update: if request.auth != null && 
        (request.auth.uid == resource.data.uid || 
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Only admins can delete users
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Transactions collection
    match /transactions/{transactionId} {
      // Users can read their own transactions, admins can read all
      allow read: if request.auth != null && 
        (resource.data.cms_id == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.cms_id ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Users can create transactions with their own CMS ID
      allow create: if request.auth != null && 
        request.resource.data.cms_id == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.cms_id;
      
      // Users can update their own transactions, admins can update any
      allow update: if request.auth != null && 
        (resource.data.cms_id == get(/databases/$(database)/documents/users/$(request.auth.uid)).data.cms_id ||
         get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin');
      
      // Only admins can delete transactions
      allow delete: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}