import React, { createContext, useContext, useState, useEffect } from "react";
import { signInAnonymously } from "firebase/auth";
import { 
  db, 
  auth, 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  onAuthStateChanged,
  signOut
} from "./firebase";
import { seedDatabaseIfEmpty } from "./seed";
import { 
  Profile, 
  Project, 
  Experience, 
  Skill, 
  Testimonial, 
  AchievementCategory, 
  Achievement, 
  PositionType, 
  Position,
  ContactMessage,
  WorkshopRegistration,
  RegistrationFormTemplate,
  ReusableField
} from "../types";

interface ProfileContextType {
  profile: Profile | null;
  projects: Project[];
  experiences: Experience[];
  skills: Skill[];
  testimonials: Testimonial[];
  achievementCategories: AchievementCategory[];
  achievements: Achievement[];
  positionTypes: PositionType[];
  positions: Position[];
  messages: ContactMessage[];
  workshopRegistrations: WorkshopRegistration[];
  registrationForms: RegistrationFormTemplate[];
  reusableFields: ReusableField[];
  loading: boolean;
  isAdmin: boolean;
  adminUser: any | null;
  refreshData: () => Promise<void>;
  updateProfile: (profileData: Profile) => Promise<void>;
  
  // CRUD operations
  addEntity: (colName: string, data: any) => Promise<void>;
  updateEntity: (colName: string, id: string, data: any) => Promise<void>;
  deleteEntity: (colName: string, id: string) => Promise<void>;
  addMessage: (message: ContactMessage) => Promise<void>;
  logoutAdmin: () => Promise<void>;
  setAdminStatus: (status: boolean) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [skills, setSkills] = useState<Skill[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [achievementCategories, setAchievementCategories] = useState<AchievementCategory[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [positionTypes, setPositionTypes] = useState<PositionType[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [workshopRegistrations, setWorkshopRegistrations] = useState<WorkshopRegistration[]>([]);
  const [registrationForms, setRegistrationForms] = useState<RegistrationFormTemplate[]>([]);
  const [reusableFields, setReusableFields] = useState<ReusableField[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminUser, setAdminUser] = useState<any | null>(null);

  const refreshData = async () => {
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Timeout waiting for Firestore response")), 8000)
    );

    try {
      await Promise.race([
        (async () => {
          // Seed first if empty
          await seedDatabaseIfEmpty();

          // Fetch critical data first (needed for deep linking and main UI)
          const [profileDoc, projectsSnap] = await Promise.all([
            getDoc(doc(db, "profiles", "default")),
            getDocs(collection(db, "projects"))
          ]);

          if (profileDoc.exists()) {
            setProfile({ id: "default", ...profileDoc.data() } as Profile);
          }

          const projectsList: Project[] = [];
          projectsSnap.forEach((d) => projectsList.push({ id: d.id, ...d.data() } as Project));
          setProjects(projectsList);

          // Critical data loaded! Unblock the UI instantly so deep links open immediately.
          setLoading(false);

          // Fetch the rest of the non-critical data concurrently in the background
          const [
            experiencesSnap,
            skillsSnap,
            testimonialsSnap,
            categoriesSnap,
            achievementsSnap,
            positionTypesSnap,
            positionsSnap,
            formsSnap,
            fieldsSnap,
            messagesSnap,
            regsSnap
          ] = await Promise.all([
            getDocs(collection(db, "experience")),
            getDocs(collection(db, "skills")),
            getDocs(collection(db, "testimonials")),
            getDocs(collection(db, "achievement_categories")),
            getDocs(collection(db, "achievements")),
            getDocs(collection(db, "position_types")),
            getDocs(collection(db, "positions")),
            getDocs(collection(db, "registration_forms")).catch(err => { console.error(err); return null; }),
            getDocs(collection(db, "reusable_fields")).catch(err => { console.error(err); return null; }),
            (isAdmin || auth.currentUser) ? getDocs(collection(db, "messages")).catch(err => { console.error(err); return null; }) : Promise.resolve(null),
            (isAdmin || auth.currentUser) ? getDocs(collection(db, "workshop_registrations")).catch(err => { console.error(err); return null; }) : Promise.resolve(null)
          ]);

          const experiencesList: Experience[] = [];
          experiencesSnap.forEach((d) => experiencesList.push({ id: d.id, ...d.data() } as Experience));
          setExperiences(experiencesList);

          const skillsList: Skill[] = [];
          skillsSnap.forEach((d) => skillsList.push({ id: d.id, ...d.data() } as Skill));
          setSkills(skillsList);

          const testimonialsList: Testimonial[] = [];
          testimonialsSnap.forEach((d) => testimonialsList.push({ id: d.id, ...d.data() } as Testimonial));
          setTestimonials(testimonialsList);

          const categoriesList: AchievementCategory[] = [];
          categoriesSnap.forEach((d) => categoriesList.push({ id: d.id, ...d.data() } as AchievementCategory));
          categoriesList.sort((a, b) => (a.order || 0) - (b.order || 0));
          setAchievementCategories(categoriesList);

          const achievementsList: Achievement[] = [];
          achievementsSnap.forEach((d) => achievementsList.push({ id: d.id, ...d.data() } as Achievement));
          setAchievements(achievementsList);

          const positionTypesList: PositionType[] = [];
          positionTypesSnap.forEach((d) => positionTypesList.push({ id: d.id, ...d.data() } as PositionType));
          setPositionTypes(positionTypesList);

          const positionsList: Position[] = [];
          positionsSnap.forEach((d) => positionsList.push({ id: d.id, ...d.data() } as Position));
          setPositions(positionsList);

          if (formsSnap) {
            const formsList: RegistrationFormTemplate[] = [];
            formsSnap.forEach((d) => formsList.push({ id: d.id, ...d.data() } as RegistrationFormTemplate));
            setRegistrationForms(formsList);
          }

          if (fieldsSnap) {
            let fieldsList: ReusableField[] = [];
            fieldsSnap.forEach((d) => fieldsList.push({ id: d.id, ...d.data() } as ReusableField));
            
            if (fieldsList.length === 0) {
              const defaults = [
                { label: "Full Name", type: "Full Name", required: true, placeholder: "e.g. John Doe" },
                { label: "Email Address", type: "Email", required: true, placeholder: "e.g. john@example.com" },
                { label: "Mobile Number", type: "Phone", required: true, placeholder: "e.g. +91 99999 88888" },
                { label: "Date of Birth", type: "Date", required: false, placeholder: "Select your birth date" },
                { label: "City & State", type: "Address", required: false, placeholder: "e.g. Mumbai, Maharashtra" },
                { label: "Gender", type: "Gender", required: false, placeholder: "e.g. Male/Female/Other" }
              ];
              for (const f of defaults) {
                await addDoc(collection(db, "reusable_fields"), f);
              }
              const freshSnap = await getDocs(collection(db, "reusable_fields"));
              fieldsList = [];
              freshSnap.forEach((d) => fieldsList.push({ id: d.id, ...d.data() } as ReusableField));
            }
            setReusableFields(fieldsList);
          }

          if (messagesSnap) {
            const messagesList: ContactMessage[] = [];
            messagesSnap.forEach((d) => messagesList.push({ id: d.id, ...d.data() } as ContactMessage));
            messagesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setMessages(messagesList);
          }

          if (regsSnap) {
            const regsList: WorkshopRegistration[] = [];
            regsSnap.forEach((d) => regsList.push({ id: d.id, ...d.data() } as WorkshopRegistration));
            regsList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setWorkshopRegistrations(regsList);
          }
        })(),
        timeoutPromise
      ]);
    } catch (error) {
      console.warn("Database sync timed out or failed. Falling back to default pre-loaded content.", error);
    } finally {
      setLoading(false);
    }
  };

  // Listen to Auth State
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setAdminUser(user);
        setIsAdmin(true);
      } else {
        setAdminUser(null);
        // We will keep a local storage flag for convenience if the user uses visual bypass, but keep secure
        const localAdmin = localStorage.getItem("admin_session") === "active";
        setIsAdmin(localAdmin);
        if (localAdmin) {
          try {
            await signInAnonymously(auth);
          } catch (err) {
            console.warn("Failed anonymous login on session restore (Anonymous Auth provider might not be enabled in Firebase Console):", err);
          }
        }
      }
      refreshData();
    });
    return () => unsubscribe();
  }, [isAdmin]);

  const updateProfile = async (profileData: Profile) => {
    try {
      await setDoc(doc(db, "profiles", "default"), profileData);
      setProfile({ id: "default", ...profileData });
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  const addEntity = async (colName: string, data: any) => {
    try {
      await addDoc(collection(db, colName), data);
      await refreshData();
    } catch (error) {
      console.error(`Error adding to ${colName}:`, error);
      throw error;
    }
  };

  const updateEntity = async (colName: string, id: string, data: any) => {
    try {
      await setDoc(doc(db, colName, id), data, { merge: true });
      await refreshData();
    } catch (error) {
      console.error(`Error updating ${colName} (${id}):`, error);
      throw error;
    }
  };

  const deleteEntity = async (colName: string, id: string) => {
    try {
      await deleteDoc(doc(db, colName, id));
      await refreshData();
    } catch (error) {
      console.error(`Error deleting from ${colName} (${id}):`, error);
      throw error;
    }
  };

  const addMessage = async (msg: ContactMessage) => {
    try {
      await addDoc(collection(db, "messages"), msg);
      await refreshData();
    } catch (error) {
      console.error("Error saving contact message:", error);
      throw error;
    }
  };

  const logoutAdmin = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("admin_session");
      setIsAdmin(false);
      setAdminUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const setAdminStatus = async (status: boolean) => {
    setIsAdmin(status);
    if (status) {
      localStorage.setItem("admin_session", "active");
      try {
        await signInAnonymously(auth);
      } catch (err) {
        console.warn("Failed anonymous sign-in (Anonymous Auth provider might not be enabled in Firebase Console):", err);
      }
    } else {
      localStorage.removeItem("admin_session");
      try {
        await signOut(auth);
      } catch (err) {
        console.error("Failed sign-out:", err);
      }
    }
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        projects,
        experiences,
        skills,
        testimonials,
        achievementCategories,
        achievements,
        positionTypes,
        positions,
        messages,
        workshopRegistrations,
        registrationForms,
        reusableFields,
        loading,
        isAdmin,
        adminUser,
        refreshData,
        updateProfile,
        addEntity,
        updateEntity,
        deleteEntity,
        addMessage,
        logoutAdmin,
        setAdminStatus
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
