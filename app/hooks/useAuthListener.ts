// hooks/useAuthListener.ts
import { useEffect } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const useAuthListener = () => {
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdTokenResult().then((idTokenResult) => {
          console.log('User email verified:', idTokenResult.claims.email_verified);
        });
      } else {
        console.log('No user is signed in');
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);
};

export default useAuthListener;
