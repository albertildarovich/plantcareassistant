import { makeAutoObservable, runInAction } from 'mobx';
import { User, UserLocation } from '@shared/types';
import { KEYS, storeData, getData, removeData } from '@shared/lib/storage';
import { ENV } from '@shared/config';
import {
  auth,
  firestore,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  doc,
  getDoc,
  setDoc,
  updateDoc,
} from '@shared/lib/firebase';

class UserStore {
  currentUser: User | null = null;
  isAuthenticated = false;
  loading = false;
  error: string | null = null;

  constructor() {
    makeAutoObservable(this);
  }

  async checkAuthState(): Promise<void> {
    this.loading = true;

    // When USE_MOCK_AUTH is enabled (via .env EXPO_PUBLIC_USE_MOCK_AUTH=true),
    // bypass Firebase auth for development/testing purposes.
    // To use real Firebase auth, set EXPO_PUBLIC_USE_MOCK_AUTH=false in .env
    // and ensure Firebase is properly configured.
    if (ENV.USE_MOCK_AUTH) {
      const MOCK_USER: User = {
        id: 'dev-mock-user',
        email: 'dev@plantcare.local',
        displayName: 'Dev User',
        notificationEnabled: false,
        createdAt: new Date().toISOString(),
      };

      runInAction(() => {
        this.currentUser = MOCK_USER;
        this.isAuthenticated = true;
        this.loading = false;
      });
      return;
    }

    // Real Firebase auth flow
    try {
      const cachedUser = await getData<User>(KEYS.USER_DATA);
      const firebaseUser = auth.currentUser;

      if (firebaseUser && cachedUser) {
        runInAction(() => {
          this.currentUser = cachedUser;
          this.isAuthenticated = true;
        });
      } else if (firebaseUser) {
        await this.loadUserFromFirestore(firebaseUser.uid);
      } else {
        runInAction(() => {
          this.isAuthenticated = false;
          this.currentUser = null;
        });
      }
    } catch (err) {
      runInAction(() => {
        this.isAuthenticated = false;
      });
    } finally {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await this.loadUserFromFirestore(userCredential.user.uid);
    } catch (err: any) {
      runInAction(() => {
        this.error = this.parseAuthError(err.code);
        this.loading = false;
      });
      throw err;
    }
  }

  async signUp(email: string, password: string, displayName: string): Promise<void> {
    this.loading = true;
    this.error = null;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName });

      const newUser: User = {
        id: userCredential.user.uid,
        email,
        displayName,
        notificationEnabled: true,
        createdAt: new Date().toISOString(),
      };

      await setDoc(doc(firestore, 'users', newUser.id), newUser);
      await storeData(KEYS.USER_DATA, newUser);

      runInAction(() => {
        this.currentUser = newUser;
        this.isAuthenticated = true;
        this.loading = false;
      });
    } catch (err: any) {
      runInAction(() => {
        this.error = this.parseAuthError(err.code);
        this.loading = false;
      });
      throw err;
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(auth);
      await removeData(KEYS.USER_DATA);

      runInAction(() => {
        this.currentUser = null;
        this.isAuthenticated = false;
      });
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to sign out';
      });
    }
  }

  async updateLocation(location: UserLocation): Promise<void> {
    if (!this.currentUser) return;

    try {
      await updateDoc(doc(firestore, 'users', this.currentUser.id), { location });
      const updatedUser = { ...this.currentUser, location };
      await storeData(KEYS.USER_DATA, updatedUser);

      runInAction(() => {
        this.currentUser = updatedUser;
      });
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to update location';
      });
    }
  }

  async updateNotificationPreference(enabled: boolean): Promise<void> {
    if (!this.currentUser) return;

    try {
      await updateDoc(doc(firestore, 'users', this.currentUser.id), { notificationEnabled: enabled });
      const updatedUser = { ...this.currentUser, notificationEnabled: enabled };
      await storeData(KEYS.USER_DATA, updatedUser);

      runInAction(() => {
        this.currentUser = updatedUser;
      });
    } catch (err) {
      runInAction(() => {
        this.error = 'Failed to update notification preference';
      });
    }
  }

  private async loadUserFromFirestore(uid: string): Promise<void> {
    try {
      const docSnapshot = await getDoc(doc(firestore, 'users', uid));
      const userData = docSnapshot.data() as User | undefined;
      if (userData) {
        await storeData(KEYS.USER_DATA, userData);

        runInAction(() => {
          this.currentUser = userData;
          this.isAuthenticated = true;
          this.loading = false;
        });
      }
    } catch (err) {
      runInAction(() => {
        this.loading = false;
      });
    }
  }

  private parseAuthError(code: string): string {
    switch (code) {
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Invalid email or password';
      case 'auth/email-already-in-use':
        return 'Email already registered';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters';
      case 'auth/invalid-email':
        return 'Invalid email address';
      default:
        return 'Authentication error occurred';
    }
  }

  clearError(): void {
    this.error = null;
  }
}

export const userStore = new UserStore();
