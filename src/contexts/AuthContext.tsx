/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { auth, firestore } from "@/firebase";
import { 
  User, 
  onAuthStateChanged, 
  signOut as firebaseSignOut ,
} from "firebase/auth";
import { doc, getDocs, getDoc, collection, query, where  } from "firebase/firestore";


interface FirestoreUserData {
  [x: string]: string | boolean | number;
  full_name?: string;
  cms_id?: string;
  lobby_id?: string;
  email?: string;
  uid?: string;
  phone_number?: string;
  isAdmin?: boolean;
  isFounder?: boolean;
  isCollectionMember?: boolean;
  emergency_number?: string;
  sfa_id?: string;
  isDisabled?: boolean;
}

const getUserData = async (userId: string, retries = 3): Promise<FirestoreUserData> => {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      // Method 1: Try query by UID
      const userQuery = query(collection(firestore,'users'), where('uid','==',userId));
      const userSnapshot = await getDocs(userQuery);
      
      if (!userSnapshot.empty) {
        const userData = userSnapshot.docs[0].data() as FirestoreUserData;
        console.log('✅ Successfully fetched user data:', userData);
        return userData;
      }

      // Method 2: If query fails, try users_by_uid collection
      console.log(`⚠️ Query attempt ${attempt + 1}/${retries}: Trying users_by_uid...`);
      const uidDocRef = doc(firestore, 'users_by_uid', userId);
      const uidDoc = await getDoc(uidDocRef);
      
      if (uidDoc.exists()) {
        const uidData = uidDoc.data();
        // Fetch full user data using SFA ID
        const userDocRef = doc(firestore, 'users', uidData.sfa_id);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          console.log('✅ Found user via users_by_uid collection');
          return userDoc.data() as FirestoreUserData;
        }
      }
      
      console.warn(`⚠️ Attempt ${attempt + 1}/${retries}: No user document found for uid ${userId}`);
      
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 500));
      }
    } catch (error) {
      console.error(`❌ Attempt ${attempt + 1}/${retries} failed:`, error);
      
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  console.error('❌ Failed to fetch user data after all retries');
  return {};
};

interface UserData {
  uid: string;
  email: string | null;
  name?: string;
  cmsId?: string;
  lobby?: string;
  phoneNumber?: string;
  isAdmin?: boolean;
  isFounder?: boolean;
  isCollectionMember?: boolean;
  emergencyNumber?: string;
  sfaId?: string;
  isDisabled?: boolean;
}

interface AuthContextType {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isDataLoaded: boolean; 
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>; 
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isDataLoaded: false,
  logout: async () => {},
  refreshUserData: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false); 

  const fetchAndSetUserData = async (firebaseUser: User) => {
  try {
    console.log('🔄 Fetching user data for:', firebaseUser.uid);
    setIsDataLoaded(false);
    
    const userData = await getUserData(firebaseUser.uid);
    
    // Check if user is disabled
    if (userData.isDisabled) {
      console.error('⚠️ User account is disabled');
      await firebaseSignOut(auth);
      throw new Error('Your account has been disabled. Please contact an administrator.');
    }
    
    if (!userData.sfa_id) {
      console.error('⚠️ WARNING: No SFA ID found in user data!', userData);
    }
    
    const fullUserData: UserData = {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      name: userData.full_name || 'User Name',
      cmsId: userData.cms_id || 'CMS00000',
      lobby: userData.lobby_id || 'ANVT',
      isAdmin: userData.isAdmin || false,
      isFounder: userData.isFounder || false,
      isCollectionMember: userData.isCollectionMember || false,
      sfaId: userData.sfa_id || 'SFA000',
      phoneNumber: userData.phone_number || '',
      emergencyNumber: userData.emergency_number || ''
    };
    
    console.log('✅ Setting user data:', fullUserData);
    setUser(fullUserData);
    setIsDataLoaded(true);
  } catch (error) {
    console.error('❌ Error in fetchAndSetUserData:', error);
    setIsDataLoaded(true);
    // Force logout if disabled
    await firebaseSignOut(auth);
    setUser(null);
  }
};

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await fetchAndSetUserData(firebaseUser);
      } else {
        console.log('🚪 User logged out');
        setUser(null);
        setIsDataLoaded(true);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
      setIsDataLoaded(false);
      console.log('✅ User logged out successfully');
    } catch (error) {
      console.error('❌ Error logging out:', error);
    }
  };

  const refreshUserData = async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      console.log('🔄 Manually refreshing user data...');
      await fetchAndSetUserData(currentUser);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading,
      isDataLoaded,
      logout,
      refreshUserData
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};