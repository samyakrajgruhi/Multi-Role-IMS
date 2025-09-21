import { createContext, useContext, useState, useEffect } from "react";
import { auth, firestore } from "@/firebase";
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut,
  sendEmailVerification
} from "firebase/auth";
import { doc, getDoc, query, collection, where, getDocs } from "firebase/firestore";

const getUserData = async (userUid) => {
  try {
    // Find user document by UID since registration stores with CMS ID as doc ID
    const usersRef = collection(firestore, 'users');
    const q = query(usersRef, where("uid", "==", userUid));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const userDoc = querySnapshot.docs[0];
      return { id: userDoc.id, ...userDoc.data() };
    }
    return null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
};

const AuthContext = createContext({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  logout: async () => {},
  sendVerificationEmail: async () => {},
  isAdmin: false,
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userData = await getUserData(firebaseUser.uid);
          if (userData) {
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              emailVerified: firebaseUser.emailVerified,
              full_name: userData.full_name,
              cms_id: userData.cms_id,
              lobby_id: userData.lobby_id,
              sfa_id: userData.sfa_id,
              role: userData.role || 'member',
              createdAt: userData.createdAt
            });
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const sendVerificationEmail = async () => {
    try {
      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error sending verification email:", error);
      return false;
    }
  };

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        logout,
        sendVerificationEmail,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);