import React, { useState } from "react";
import { useProfile } from "../../lib/ProfileContext";
import { cleanGoogleDriveUrl } from "../../lib/imageUtils";
import ImageUploader from "../ui/ImageUploader";
import { motion, AnimatePresence } from "motion/react";
import { 
  User, 
  Link2, 
  BookOpen, 
  Trophy, 
  ShieldCheck, 
  MapPin, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  LogOut, 
  Mail, 
  Save, 
  PlusCircle, 
  Info,
  Calendar,
  Lock,
  MessageSquare,
  Briefcase,
  Award,
  Sliders,
  Database,
  FileSpreadsheet,
  BarChart2,
  Cpu,
  Brain,
  TrendingUp,
  Users,
  Sparkles,
  Zap,
  Globe,
  Laptop,
  Flame,
  Activity,
  ArrowUp,
  ArrowDown,
  QrCode,
  Copy,
  Check,
  Target,
  Heart,
  Table,
  Download,
  List,
  Send
} from "lucide-react";

// Icon mapper for skills
const skillIconMap: { [key: string]: any } = {
  FileSpreadsheet,
  BarChart2,
  Database,
  Cpu,
  Brain,
  TrendingUp,
  Users,
  Sparkles,
  Zap,
  Globe,
  Laptop,
  Flame,
  Activity,
  Award,
  Target,
  Heart,
  Trophy
};

const DEFAULT_PROFILE = {
  name: "Pradeep Parmar",
  title: "Master Practitioner & Professional Trainer",
  tagline: "Learn. Lead. Succeed.",
  bio: "👋 Hello! I’m Pradeep Parmar, a passionate trainer dedicated to helping people learn, grow, and succeed. Over the years, I’ve conducted multiple workshops on Excel, Power BI, SQL, Python, Success Training, Belief System, and NLP. I hold an MBA, an ITI background, certifications in Digital Marketing and Data Science, and bring with me 25+ years of corporate experience. Along with my professional journey, I also dedicate time to serving my social community, empowering individuals to achieve growth and transformation. I am proud to be a self-learner who continuously adapts and grows with changing times.",
  email: "pradeepparmar902@yahoo.com",
  phone: "+91 98199 84437",
  location: "Gujarat, India",
  avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
  linkedin: "https://www.linkedin.com/in/pradeep-parmar-1b57a24",
  youtube: "https://www.youtube.com/@parmar_pradeep902",
  instagram: "https://www.instagram.com/pradeepparmar902",
  stats: [
    { label: "Workshops Delivered", value: "250+" },
    { label: "Learners Trained", value: "15,000+" },
    { label: "Corporate Experience", value: "25+ Yrs" },
    { label: "Community Trust", value: "Active" }
  ],
  badge: "NLP Practitioner & Corporate Leader",
  aboutSubtitle: "NLP Master & Advisor",
  aboutAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
  highlights: [
    { title: "Subconscious Blueprint", description: "Custom NLP maps to swap limiting core beliefs." },
    { title: "Enterprise Analytics", description: "Corporate audits in Advanced Excel & Power BI." },
    { title: "Longevity Strategy", description: "Perfect mind-body equilibrium habits." },
    { title: "Relentless Coaching", description: "Actionable and bulletproof accountability logs." }
  ]
};

export default function Admin() {
  const { 
    profile, 
    projects, 
    experiences, 
    skills, 
    testimonials, 
    achievementCategories, 
    projectCategories = [],
    achievements, 
    positionTypes, 
    positions, 
    messages, 
    workshopRegistrations,
    registrationForms,
    reusableFields,
    isAdmin, 
    updateProfile, 
    addEntity, 
    updateEntity, 
    deleteEntity, 
    setAdminStatus, 
    logoutAdmin 
  } = useProfile();

  // Toast state for iframe-safe feedback
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type });
    // Auto-clear after 4 seconds
    setTimeout(() => {
      setToast((current) => current?.message === message ? null : current);
    }, 4000);
  };

  // Authentication states
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // CMS view states
  const [activeTab, setActiveTab] = useState("profile");
  const [draggedProjectIndex, setDraggedProjectIndex] = useState<number | null>(null);
  const [localNavConfig, setLocalNavConfig] = useState<any[]>(
    profile?.navConfig?.length 
      ? [...profile.navConfig] 
      : [
          { id: "home", label: "Home", isHidden: false },
          { id: "about", label: "About", isHidden: false },
          { id: "portfolio", label: "Workshops", isHidden: false },
          { id: "contact", label: "Contact", isHidden: false },
        ]
  );

  React.useEffect(() => {
    if (activeTab === "navigation") {
      setLocalNavConfig(
        profile?.navConfig?.length 
          ? [...profile.navConfig] 
          : [
              { id: "home", label: "Home", isHidden: false },
              { id: "about", label: "About", isHidden: false },
              { id: "portfolio", label: "Workshops", isHidden: false },
              { id: "contact", label: "Contact", isHidden: false },
            ]
      );
    }
  }, [activeTab, profile?.navConfig]);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingType, setEditingType] = useState<string | null>(null);
  const [selectedSkillCategory, setSelectedSkillCategory] = useState("All");
  const [messagesViewMode, setMessagesViewMode] = useState<"cards" | "excel">("cards");
  const [registrationsViewMode, setRegistrationsViewMode] = useState<"cards" | "excel">("cards");

  // Bulletproof CSV Exporter
  const downloadCSV = (
    data: any[],
    filename: string,
    headers: string[],
    valueMapper: (row: any, header: string) => string
  ) => {
    if (!data || data.length === 0) return;
    const csvRows = [];
    
    // Header row
    csvRows.push(headers.join(","));
    
    // Data rows
    for (const row of data) {
      const values = headers.map(header => {
        const val = valueMapper(row, header);
        let cell = val === undefined || val === null ? "" : String(val);
        cell = cell.replace(/"/g, '""');
        if (cell.includes(",") || cell.includes("\n") || cell.includes('"')) {
          cell = `"${cell}"`;
        }
        return cell;
      });
      csvRows.push(values.join(","));
    }
    
    const csvString = csvRows.join("\r\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const seedTestMessages = async () => {
    const testMessages = [
      {
        name: "Aarav Sharma",
        email: "aarav.sharma@example.com",
        subject: "Corporate Workshop Query",
        message: "Hi Pradeep, I would like to inquire about booking an advanced Power BI and corporate training session for our analytics team of 15 members in Mumbai. Please share details.",
        createdAt: new Date(Date.now() - 4 * 3600000).toISOString()
      },
      {
        name: "Neha Patel",
        email: "neha.patel@example.com",
        subject: "NLP Consultation Schedule",
        message: "Hello sir, I have read about your belief system and subconscious blueprint workshop. Do you provide one-on-one personal NLP coaching session? Kindly let me know the pricing and schedule.",
        createdAt: new Date(Date.now() - 24 * 3600000).toISOString()
      },
      {
        name: "Vikram Mehta",
        email: "vikram.mehta@example.com",
        subject: "Excel Advanced formulas",
        message: "Enjoyed your free Excel video. I am looking for a personal fast-track mentorship program for Excel VBA and Power Pivot. Do you conduct weekend batches?",
        createdAt: new Date(Date.now() - 48 * 3600000).toISOString()
      }
    ];

    try {
      for (const msg of testMessages) {
        await addEntity("messages", msg);
      }
      showToast("Successfully seeded 3 rich test inquiry messages!", "success");
    } catch (err) {
      showToast("Failed to seed test messages.", "error");
    }
  };

  const seedTestRegistrations = async () => {
    if (projects.length === 0) {
      showToast("Please create at least one workshop project first to seed registrations.", "error");
      return;
    }
    const sampleWs = projects[0];
    const testRegs = [
      {
        workshopId: sampleWs.id || "sample",
        workshopTitle: sampleWs.title || "NLP Masterclass",
        name: "Rohan Deshmukh",
        mobile: "+91 98200 12345",
        address: "Andheri West, Mumbai, Maharashtra",
        preferredDate: "Upcoming Sunday Morning Batch",
        additionalInfo: "I am super excited to rewrite my limiting belief systems!",
        createdAt: new Date(Date.now() - 2 * 3600000).toISOString()
      },
      {
        workshopId: sampleWs.id || "sample",
        workshopTitle: sampleWs.title || "Power BI Enterprise",
        name: "Priyanka Joshi",
        mobile: "+91 91234 56789",
        address: "Satellite, Ahmedabad, Gujarat",
        preferredDate: "Next Saturday Evening Session",
        additionalInfo: "Please share the dataset files beforehand if possible.",
        createdAt: new Date(Date.now() - 12 * 3600000).toISOString()
      }
    ];

    try {
      for (const reg of testRegs) {
        await addEntity("workshop_registrations", reg);
      }
      showToast("Successfully seeded 2 test registrations!", "success");
    } catch (err) {
      showToast("Failed to seed test registrations.", "error");
    }
  };

  // General Form States
  const [profileForm, setProfileForm] = useState<any>(profile ? { ...profile } : { ...DEFAULT_PROFILE });
  const [qrProject, setQrProject] = useState<any | null>(null);
  const [copiedQrUrl, setCopiedQrUrl] = useState(false);

  // Entity Modal Form States
  const [entityForm, setEntityForm] = useState<any>({});

  // Trigger loading state updates
  React.useEffect(() => {
    if (profile) {
      setProfileForm((prev: any) => {
        if (!prev || prev.name === DEFAULT_PROFILE.name) {
          return { ...profile };
        }
        return prev;
      });
    }
  }, [profile]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Master password bypass as requested in chat coordinates (extremely convenient for AI Studio)
    if (password === "pradeep123" || password === "admin123") {
      setAdminStatus(true);
      setAuthError("");
    } else {
      setAuthError("Incorrect administrator password. Hint: try 'pradeep123'");
    }
  };

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileForm) return;
    try {
      await updateProfile(profileForm);
      showToast("Profile configurations saved successfully!", "success");
    } catch (err) {
      showToast("Error saving profile details.", "error");
    }
  };

  const handleContactDetailsSave = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!profileForm) return;
    try {
      await updateProfile(profileForm);
      showToast("Contact coordinates and coaching hours updated successfully!", "success");
    } catch (err) {
      showToast("Error saving contact coordinate details.", "error");
    }
  };

  const [adminMessageForm, setAdminMessageForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const handleAdminMessageSubmit = async () => {
    if (!adminMessageForm.name || !adminMessageForm.email || !adminMessageForm.message) {
      showToast("Please complete all required fields (Name, Email, and Message).", "error");
      return;
    }
    try {
      await addEntity("messages", {
        ...adminMessageForm,
        createdAt: new Date().toISOString()
      });
      showToast("Inquiry message dispatched and recorded successfully!", "success");
      setAdminMessageForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
    } catch (err) {
      showToast("Failed to dispatch and save message.", "error");
    }
  };

  // Generic Entity CRUD triggering
  const openAddEntity = (type: string, initialData: any = {}) => {
    setEditingType(type);
    setEditingId(null);
    setEntityForm(initialData);
  };

  const openEditEntity = (type: string, id: string, currentData: any) => {
    setEditingType(type);
    setEditingId(id);
    setEntityForm({ ...currentData });
  };

  const handleSaveEntity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingType) return;

    let colName = "";
    if (editingType === "project") colName = "projects";
    else if (editingType === "experience") colName = "experience";
    else if (editingType === "skill") colName = "skills";
    else if (editingType === "testimonial") colName = "testimonials";
    else if (editingType === "project_category") colName = "project_categories";
    else if (editingType === "achievement_category") colName = "achievement_categories";
    else if (editingType === "achievement") colName = "achievements";
    else if (editingType === "position_type") colName = "position_types";
    else if (editingType === "position") colName = "positions";
    else if (editingType === "registration_form") colName = "registration_forms";
    else if (editingType === "messages") colName = "messages";
    else if (editingType === "workshop_registration" || editingType === "workshop_registrations") colName = "workshop_registrations";

    if (!colName) return;

    try {
      if (editingType === "registration_form") {
        // Automatically save any new unique fields to the reusable_fields library
        const fields = entityForm.fields || [];
        for (const field of fields) {
          if (field.label && field.type) {
            const labelLower = field.label.trim().toLowerCase();
            const exists = (reusableFields || []).some(rf => rf.label.trim().toLowerCase() === labelLower && rf.type === field.type);
            if (!exists) {
              try {
                // Save it to the database library
                await addEntity("reusable_fields", {
                  label: field.label.trim(),
                  type: field.type,
                  placeholder: field.placeholder || "",
                  required: !!field.required,
                  createdAt: new Date().toISOString()
                });
              } catch (libErr) {
                console.error("Error auto-saving field to library:", libErr);
              }
            }
          }
        }
      }

      if (editingId) {
        await updateEntity(colName, editingId, entityForm);
      } else {
        const payload = { ...entityForm };
        if ((editingType === "messages" || editingType === "workshop_registration" || editingType === "workshop_registrations") && !payload.createdAt) {
          payload.createdAt = new Date().toISOString();
        }
        await addEntity(colName, payload);
      }
      setEditingType(null);
      setEditingId(null);
      setEntityForm({});
      showToast("Content saved successfully!", "success");
    } catch (err) {
      showToast("Error saving entity contents.", "error");
    }
  };

  const handleDropProject = async (targetIndex: number) => {
    if (draggedProjectIndex === null || draggedProjectIndex === targetIndex) {
      setDraggedProjectIndex(null);
      return;
    }

    const newProjects = [...projects];
    const [draggedItem] = newProjects.splice(draggedProjectIndex, 1);
    newProjects.splice(targetIndex, 0, draggedItem);

    setDraggedProjectIndex(null);

    // Normalize order for all projects
    try {
      await Promise.all(
        newProjects.map((p, idx) => updateEntity("projects", p.id || "", { order: idx }))
      );
      showToast("Reordered successfully!", "success");
    } catch (err) {
      console.error("Failed to reorder projects", err);
      showToast("Failed to save new order.", "error");
    }
  };

  const handleMoveProject = async (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === projects.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newProjects = [...projects];
    const [item] = newProjects.splice(index, 1);
    newProjects.splice(targetIndex, 0, item);

    try {
      await Promise.all(
        newProjects.map((p, idx) => updateEntity("projects", p.id || "", { order: idx }))
      );
      showToast("Moved successfully!", "success");
    } catch (err) {
      console.error("Failed to move project", err);
      showToast("Failed to reorder.", "error");
    }
  };

  const handleDeleteEntity = async (type: string, id: string) => {
    if (!window.confirm("Are you absolutely sure you want to delete this item?")) return;
    
    let colName = "";
    if (type === "project") colName = "projects";
    else if (type === "experience") colName = "experience";
    else if (type === "skill") colName = "skills";
    else if (type === "testimonial") colName = "testimonials";
    else if (type === "project_category") colName = "project_categories";
    else if (type === "achievement_category") colName = "achievement_categories";
    else if (type === "achievement") colName = "achievements";
    else if (type === "position_type") colName = "position_types";
    else if (type === "position") colName = "positions";
    else if (type === "registration_form") colName = "registration_forms";
    else if (type === "workshop_registration" || type === "workshop_registrations") colName = "workshop_registrations";
    else if (type === "messages") colName = "messages";

    if (!colName) return;

    try {
      await deleteEntity(colName, id);
      showToast("Deleted successfully!", "success");
    } catch (err) {
      showToast("Failed to delete the selected item.", "error");
    }
  };

  const toggleHideEntity = async (type: string, id: string, currentIsHidden: boolean) => {
    let colName = "";
    if (type === "project") colName = "projects";
    else if (type === "experience") colName = "experience";
    else if (type === "skill") colName = "skills";
    else if (type === "testimonial") colName = "testimonials";
    else if (type === "achievement") colName = "achievements";
    else if (type === "position") colName = "positions";
    else if (type === "registration_form") colName = "registration_forms";

    if (!colName) return;

    try {
      await updateEntity(colName, id, { isHidden: !currentIsHidden });
    } catch (err) {
      showToast("Error updating item visibility status.", "error");
    }
  };

  const [resetting, setResetting] = useState(false);
  const handleForceReset = async () => {
    if (!window.confirm("WARNING: This will completely wipe all current Firestore records and re-seed the entire database with the real-world content of pradeepparmar.com. Are you sure you want to proceed?")) return;
    setResetting(true);
    try {
      const { forceSeedDatabase } = await import("../../lib/seed");
      await forceSeedDatabase();
      showToast("Database successfully reset and re-seeded with your official website content!", "success");
    } catch (err) {
      console.error(err);
      showToast("Failed to reset database. Check console logs.", "error");
    } finally {
      setResetting(false);
    }
  };

  // Simulated direct image upload helper as requested in chat (user clicks upload -> fills beautiful mockup URL)
  const simulateUpload = (fieldName: string, isArray: boolean = false) => {
    const mockUrls = [
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600",
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=600",
      "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600",
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=600",
      "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600"
    ];
    const pickedUrl = mockUrls[Math.floor(Math.random() * mockUrls.length)];
    
    if (isArray) {
      const currentGallery = entityForm[fieldName] || [];
      setEntityForm((prev: any) => ({
        ...prev,
        [fieldName]: [...currentGallery, pickedUrl]
      }));
    } else {
      setEntityForm((prev: any) => ({
        ...prev,
        [fieldName]: pickedUrl
      }));
    }
  };

  // Auth screen layout
  if (false) {
    return (
      <div className="pt-32 pb-16 flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/60 backdrop-blur-md p-8 shadow-2xl">
          <div className="text-center space-y-2 mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]">
              <Lock size={20} />
            </div>
            <h2 className="text-2xl font-serif font-bold text-white">Admin Dashboard</h2>
            <p className="text-xs text-gray-400">
              Provide the administrator access key to modify the dynamic profile.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono text-center">
                {authError}
              </div>
            )}

            <div className="space-y-1.5">
              <label htmlFor="authPass" className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                Master Security Key
              </label>
              <input
                id="authPass"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Hint: pradeep123"
                className="w-full px-4 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-white text-sm focus:border-[#d4af37] outline-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-semibold text-sm rounded-xl cursor-pointer shadow-lg hover:opacity-90"
            >
              Authenticate & Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Admin Dashboard Dashboard Layout
  return (
    <div className="pt-24 md:pt-32 max-w-7xl mx-auto px-4 md:px-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-white/5 bg-black/40 p-6">
        <div>
          <span className="text-xs font-mono text-[#d4af37] uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-green-500" />
            Security Mode Enabled
          </span>
          <h2 className="text-2xl font-serif font-bold text-white mt-1">
            Dynamic CMS Portal
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Manage your personal bio, active workshops, milestones, leadership profiles, and contact inquiries.
          </p>
        </div>

        <button
          onClick={logoutAdmin}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <LogOut size={12} />
          Lock Dashboard
        </button>
      </div>

      {/* Main CMS Selector Tab Row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Navigation panel */}
        <div className="lg:col-span-3 rounded-2xl border border-white/5 bg-black/40 p-3 md:p-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-2 lg:gap-0 lg:space-y-1">
          {[
            { id: "profile", label: "Profile (Home Page)", icon: User },
            { id: "about", label: "About Page", icon: Info },
            { id: "workshops", label: "Workshops Management", icon: BookOpen },
            { id: "forms", label: "Registration Forms", icon: FileSpreadsheet },
            { id: "experiences", label: "Career History", icon: Briefcase },
            { id: "skills", label: "Capabilities", icon: Award },
            { id: "testimonials", label: "Student Reviews", icon: MessageSquare },
            { id: "achievements", label: "Achievements", icon: Trophy },
            { id: "positions", label: "Affiliations", icon: Link2 },
            { id: "messages", label: "Contact Inbox", icon: Mail },
            { id: "registrations", label: "Workshop Invites", icon: Calendar },
            { id: "navigation", label: "Site Navigation", icon: List },
            { id: "system", label: "System Controls", icon: Sliders },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setEditingType(null);
                }}
                className={`w-full text-left px-3.5 py-2.5 lg:px-4 lg:py-3 rounded-xl text-xs lg:text-sm font-medium flex items-center gap-2.5 lg:gap-3 transition-colors cursor-pointer ${
                  isActive 
                    ? "text-black bg-gradient-to-r from-[#d4af37] to-amber-500 font-semibold" 
                    : "text-gray-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={14} className="shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* CMS Editor Body Panel */}
        <div className="lg:col-span-9 rounded-2xl border border-white/5 bg-black/30 p-6 md:p-8 min-h-[500px]">
          {editingType ? (
            // generic inline creator/editor modal
            <form onSubmit={handleSaveEntity} className="space-y-5">
              <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-4">
                <h3 className="text-lg font-semibold text-white font-serif">
                  {editingId ? "Modify" : "Add New"} {editingType === "project" ? "WORKSHOP / COURSE" : editingType.replace("_", " ").toUpperCase()}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setEditingType(null);
                    setEditingId(null);
                  }}
                  className="px-3 py-1.5 text-xs text-gray-400 bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
                >
                  Back
                </button>
              </div>

              {/* PROJECT TYPE FIELDS */}
              {editingType === "project" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Workshop Title</label>
                      <input
                        type="text"
                        value={entityForm.title || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, title: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Category</label>
                      <select
                        value={entityForm.category || (projectCategories.length > 0 ? projectCategories[0].name : "Technical")}
                        onChange={(e) => setEntityForm({ ...entityForm, category: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      >
                        {projectCategories.length === 0 && <option value="Technical">Technical</option>}
                        {projectCategories.filter(c => !c.isHidden).map((cat) => (
                          <option key={cat.id} value={cat.name}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Status Badge</label>
                      <input
                        type="text"
                        value={entityForm.statusBadge || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, statusBadge: e.target.value })}
                        placeholder="e.g. Hot Selling, Registration Open"
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Brief Description</label>
                    <textarea
                      value={entityForm.description || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, description: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      rows={2}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Key Highlights / Course Details</label>
                    <textarea
                      value={entityForm.details || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, details: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Cover Image</label>
                    <div className="space-y-3 bg-neutral-950/40 p-3.5 rounded-xl border border-white/5">
                      <ImageUploader 
                        onUploadComplete={(url) => setEntityForm({ ...entityForm, coverImage: url })}
                        currentUrl={entityForm.coverImage}
                        pathPrefix="projects"
                        label="Upload Cover Image"
                      />
                      <div className="space-y-1">
                        <span className="text-[9px] text-gray-400 font-mono block">OR USE AN EXTERNAL URL / GOOGLE DRIVE LINK:</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={entityForm.coverImage || ""}
                            onChange={(e) => setEntityForm({ ...entityForm, coverImage: e.target.value })}
                            placeholder="Paste image URL or Google Drive link"
                            className="flex-1 px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => simulateUpload("coverImage")}
                            className="px-3 bg-amber-500/10 hover:bg-amber-500/20 text-[#d4af37] border border-[#d4af37]/20 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                          >
                            Mock
                          </button>
                        </div>
                        <p className="text-[9px] text-gray-500 leading-normal mt-1">
                          💡 Supports Google Drive shared links (shared with "Anyone with link can view").
                        </p>
                      </div>
                      {entityForm.coverImage && (
                        <div className="flex items-center gap-3 p-2 bg-black/40 border border-white/5 rounded-lg">
                          <div className="w-12 h-12 rounded overflow-hidden bg-neutral-950 shrink-0 border border-white/10">
                            <img 
                              src={cleanGoogleDriveUrl(entityForm.coverImage)} 
                              alt="Preview" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] text-gray-400 font-mono block uppercase">Active Image Path:</span>
                            <span className="text-[10px] text-gray-300 font-mono truncate block">{entityForm.coverImage}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEntityForm({ ...entityForm, coverImage: "" })}
                            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 font-semibold rounded bg-red-500/10 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">External booking/info link</label>
                    <input
                      type="text"
                      value={entityForm.link || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, link: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>

                  <div className="border-t border-white/5 pt-4 mt-2 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 h-full py-2">
                        <input
                          type="checkbox"
                          id="allowRegistration"
                          checked={!!entityForm.allowRegistration}
                          onChange={(e) => setEntityForm({ ...entityForm, allowRegistration: e.target.checked })}
                          className="w-4 h-4 rounded border-white/10 bg-neutral-900 text-[#d4af37] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <label htmlFor="allowRegistration" className="text-xs font-semibold text-amber-400 select-none cursor-pointer">
                          Enable Custom Registration / Invite Form
                        </label>
                      </div>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Workshop Date / Schedule</label>
                        <input
                          type="text"
                          placeholder="e.g. 15th Aug 2026, 4:00 PM IST"
                          value={entityForm.workshopDate || ""}
                          disabled={!entityForm.allowRegistration}
                          onChange={(e) => setEntityForm({ ...entityForm, workshopDate: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm disabled:opacity-40"
                        />
                      </div>
                    </div>

                    {entityForm.allowRegistration && (
                      <div className="space-y-1">
                        <label className="text-[10px] text-[#25d366] font-semibold uppercase tracking-wider font-mono flex items-center gap-1">
                          <span>💬 WhatsApp Group / Connect Link</span>
                          <span className="text-[9px] text-gray-400 normal-case font-normal">(Post-Submission Redirect)</span>
                        </label>
                        <input
                          type="url"
                          placeholder="e.g. https://chat.whatsapp.com/invite-code or https://wa.me/..."
                          value={entityForm.whatsappGroupLink || ""}
                          onChange={(e) => setEntityForm({ ...entityForm, whatsappGroupLink: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-[#25d366]/35 rounded-lg text-white text-sm focus:border-[#25d366] outline-none"
                        />
                        <p className="text-[10px] text-gray-500">
                          Users will be prompted to click this link to join your WhatsApp chat or group immediately after successfully registering.
                        </p>
                      </div>
                    )}

                    {entityForm.allowRegistration && (
                      <div className="p-4 rounded-xl border border-white/10 bg-black/50 space-y-4 animate-fadeIn">
                        <div className="flex items-center gap-1 text-xs text-[#d4af37] font-semibold uppercase tracking-wider font-mono border-b border-white/5 pb-2">
                          <span>🛠️ Attach Registration Form Template</span>
                        </div>

                        <div className="space-y-1.5 text-xs text-left">
                          <label className="text-[10px] text-gray-400 uppercase font-mono tracking-wider">Select Registration Form Template</label>
                          <select
                            value={entityForm.formTemplateId || ""}
                            onChange={(e) => setEntityForm({ ...entityForm, formTemplateId: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white"
                          >
                            <option value="">-- Select Custom Form --</option>
                            {registrationForms.map(form => (
                              <option key={form.id} value={form.id}>{form.name}</option>
                            ))}
                          </select>
                          <p className="text-[10px] text-gray-500 mt-1">
                            Create and manage form templates in the dedicated <strong className="text-amber-400">"Registration Forms"</strong> tab on the sidebar.
                          </p>
                        </div>
                        
                        <div className="space-y-1.5 text-xs text-left border-t border-white/5 pt-4">
                          <label className="text-[10px] text-[#d4af37] uppercase font-mono tracking-wider flex items-center gap-1.5">
                            Razorpay Payment Link URL (Optional)
                          </label>
                          <input
                            type="url"
                            value={entityForm.paymentLink || ""}
                            onChange={(e) => setEntityForm({ ...entityForm, paymentLink: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-[#d4af37]/30 rounded-lg text-white placeholder-gray-600 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all"
                            placeholder="https://rzp.io/l/xxxxxxxx"
                          />
                          <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                            If provided, users will see a <strong>"Proceed to Payment"</strong> button linking to this Razorpay page immediately after successfully submitting the registration form.
                          </p>
                        </div>
                      </div>
                    )}

                    {entityForm.allowRegistration && entityForm.id && (
                      <div className="p-4 rounded-xl border border-[#d4af37]/30 bg-black/60 space-y-4 animate-fadeIn mt-4">
                        <div className="flex items-center gap-2 text-xs text-[#d4af37] font-semibold uppercase tracking-wider font-mono border-b border-white/5 pb-2">
                          <QrCode size={14} />
                          <span>Workshop Entry QR Code</span>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center gap-6">
                          <div className="p-3 bg-white rounded-lg flex-shrink-0 w-[120px] h-[120px]">
                            <img
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                                `${window.location.origin}${window.location.pathname}?workshop=${entityForm.id}&v=${Date.now()}`
                              )}`}
                              alt="Workshop Registration QR Code"
                              className="w-full h-full object-contain"
                            />
                          </div>
                          <div className="space-y-3 text-center sm:text-left">
                            <div>
                              <h4 className="text-sm font-semibold text-white">Direct Invite Link Code</h4>
                              <p className="text-[10px] text-gray-400 mt-1 leading-relaxed">
                                Users can scan this QR code to be instantly routed to the registration form for <strong>"{entityForm.title}"</strong>.
                              </p>
                              <p className="text-[9px] text-[#d4af37] font-mono mt-1 break-all">
                                {window.location.origin}{window.location.pathname}?workshop={entityForm.id}
                              </p>
                            </div>
                            <a
                              href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
                                `${window.location.origin}${window.location.pathname}?workshop=${entityForm.id}&v=${Date.now()}`
                              )}`}
                              download={`QR_${entityForm.title?.replace(/\s+/g, "_")}.png`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-4 py-2 rounded-lg bg-[#d4af37] hover:bg-amber-500 text-black font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md mx-auto sm:mx-0 w-fit"
                            >
                              <Download size={14} />
                              Download QR Code
                            </a>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* EXPERIENCE TYPE FIELDS */}
              {editingType === "experience" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Role/Title</label>
                      <input
                        type="text"
                        value={entityForm.title || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, title: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Organization Name</label>
                      <input
                        type="text"
                        value={entityForm.organization || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, organization: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Period / Years</label>
                      <input
                        type="text"
                        value={entityForm.period || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, period: e.target.value })}
                        placeholder="e.g. 2020 - Present"
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Details / Responsibilities</label>
                    <textarea
                      value={entityForm.details || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, details: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      rows={3}
                      required
                    />
                  </div>
                </div>
              )}

              {/* SKILLS TYPE FIELDS */}
              {editingType === "skill" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Skill Name</label>
                      <input
                        type="text"
                        value={entityForm.name || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Category</label>
                      <input
                        type="text"
                        value={entityForm.category || "Technical"}
                        onChange={(e) => setEntityForm({ ...entityForm, category: e.target.value })}
                        placeholder="e.g. Technical, Core, Soft, NLP, Coaching"
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {["Technical", "Core", "Soft", "NLP", "Coaching"].map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setEntityForm({ ...entityForm, category: cat })}
                            className="px-2 py-0.5 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded text-[10px] cursor-pointer"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Percentage Proficiency (0-100)</label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={entityForm.percentage ?? 90}
                        onChange={(e) => setEntityForm({ ...entityForm, percentage: parseInt(e.target.value) || 0 })}
                        className="flex-1 accent-[#d4af37] h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer"
                      />
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={entityForm.percentage ?? 90}
                        onChange={(e) => setEntityForm({ ...entityForm, percentage: Math.min(100, Math.max(0, parseInt(e.target.value) || 0)) })}
                        className="w-20 px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm text-center font-mono"
                        required
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1.5">
                      <input
                        type="checkbox"
                        id="hidePercentage"
                        checked={!!entityForm.hidePercentage}
                        onChange={(e) => setEntityForm({ ...entityForm, hidePercentage: e.target.checked })}
                        className="w-4 h-4 bg-neutral-900 border border-white/10 rounded accent-[#d4af37] cursor-pointer"
                      />
                      <label htmlFor="hidePercentage" className="text-xs text-gray-300 cursor-pointer select-none hover:text-white transition-colors">
                        Hide percentage indicator & level bar (Clean logo + info design)
                      </label>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono block">Skill Icon</label>
                    <div className="flex gap-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
                      <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                        <input
                          type="radio"
                          name="skillIconType"
                          checked={entityForm.iconType !== "url"}
                          onChange={() => setEntityForm({ ...entityForm, iconType: "lucide", icon: entityForm.icon || "Award" })}
                          className="accent-[#d4af37]"
                        />
                        Preset Vector Icon
                      </label>
                      <label className="flex items-center gap-2 text-xs text-white cursor-pointer select-none">
                        <input
                          type="radio"
                          name="skillIconType"
                          checked={entityForm.iconType === "url"}
                          onChange={() => setEntityForm({ ...entityForm, iconType: "url", icon: entityForm.icon && entityForm.icon.startsWith("http") ? entityForm.icon : "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=200" })}
                          className="accent-[#d4af37]"
                        />
                        Custom Image URL
                      </label>
                    </div>

                    {entityForm.iconType !== "url" ? (
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Select Preset Icon</label>
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {[
                            { name: "FileSpreadsheet", label: "Excel" },
                            { name: "BarChart2", label: "Power BI" },
                            { name: "Database", label: "SQL" },
                            { name: "Cpu", label: "Python/AI" },
                            { name: "Brain", label: "NLP" },
                            { name: "TrendingUp", label: "Success" },
                            { name: "Users", label: "Coaching" },
                            { name: "Sparkles", label: "Mindset" },
                            { name: "Award", label: "Expertise" },
                            { name: "Zap", label: "Energy" },
                            { name: "Globe", label: "Digital" },
                            { name: "Laptop", label: "IT" }
                          ].map((item) => {
                            const isSelected = entityForm.icon === item.name;
                            const IconComponent = skillIconMap[item.name] || Award;
                            return (
                              <button
                                key={item.name}
                                type="button"
                                onClick={() => setEntityForm({ ...entityForm, icon: item.name })}
                                className={`p-2 rounded-lg border flex flex-col items-center gap-1 cursor-pointer transition-all ${
                                  isSelected 
                                    ? "bg-[#d4af37]/20 border-[#d4af37] text-[#d4af37]" 
                                    : "bg-neutral-900 border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                                }`}
                              >
                                <IconComponent size={16} />
                                <span className="text-[9px] font-sans truncate w-full text-center">{item.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2 bg-neutral-950/40 p-3.5 rounded-xl border border-white/5">
                        <ImageUploader 
                          onUploadComplete={(url) => setEntityForm({ ...entityForm, icon: url })}
                          currentUrl={entityForm.icon}
                          pathPrefix="skills"
                          label="Upload Custom Icon/Image"
                        />
                        <div className="space-y-1">
                          <span className="text-[9px] text-gray-400 font-mono block">OR USE AN EXTERNAL URL:</span>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              value={entityForm.icon || ""}
                              onChange={(e) => setEntityForm({ ...entityForm, icon: e.target.value })}
                              placeholder="https://example.com/icon.png"
                              className="flex-1 px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => simulateUpload("icon")}
                              className="px-3 bg-amber-500/10 hover:bg-amber-500/20 text-[#d4af37] border border-[#d4af37]/20 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                            >
                              Suggest Image
                            </button>
                          </div>
                          <p className="text-[9px] text-gray-500 leading-normal">
                            Tip: Click Suggest Image to populate dynamic, highly stylized Unsplash visuals.
                          </p>
                        </div>
                        {entityForm.icon && (
                          <div className="flex items-center gap-3 p-2 bg-black/40 border border-white/5 rounded-lg">
                            <div className="w-10 h-10 rounded overflow-hidden bg-neutral-950 shrink-0 border border-white/10">
                              <img 
                                src={cleanGoogleDriveUrl(entityForm.icon)} 
                                alt="Preview" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[9px] text-gray-400 font-mono block uppercase">Active Path:</span>
                              <span className="text-[10px] text-gray-300 font-mono truncate block">{entityForm.icon}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Skill Description / Small Info (Optional)</label>
                    <textarea
                      value={entityForm.description || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, description: e.target.value })}
                      placeholder="e.g. Mastering formulas, pivot tables, VBA macros, and data visualization."
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* TESTIMONIAL TYPE FIELDS */}
              {editingType === "testimonial" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Author Name</label>
                      <input
                        type="text"
                        value={entityForm.author || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, author: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Role / Title & Company</label>
                      <input
                        type="text"
                        value={entityForm.role || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, role: e.target.value })}
                        placeholder="e.g. Director of Operations"
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Testimonial Text</label>
                    <textarea
                      value={entityForm.text || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, text: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Avatar Image</label>
                    <div className="space-y-3 bg-neutral-950/40 p-3.5 rounded-xl border border-white/5">
                      <ImageUploader 
                        onUploadComplete={(url) => setEntityForm({ ...entityForm, avatar: url })}
                        currentUrl={entityForm.avatar}
                        pathPrefix="testimonials"
                        label="Upload Avatar Image"
                      />
                      <div className="space-y-1">
                        <span className="text-[9px] text-gray-400 font-mono block">OR USE AN EXTERNAL URL:</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={entityForm.avatar || ""}
                            onChange={(e) => setEntityForm({ ...entityForm, avatar: e.target.value })}
                            placeholder="https://example.com/avatar.jpg"
                            className="flex-1 px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => simulateUpload("avatar")}
                            className="px-3 bg-amber-500/10 hover:bg-amber-500/20 text-[#d4af37] border border-[#d4af37]/20 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                          >
                            Mock
                          </button>
                        </div>
                      </div>
                      {entityForm.avatar && (
                        <div className="flex items-center gap-3 p-2 bg-black/40 border border-white/5 rounded-lg">
                          <div className="w-10 h-10 rounded-full overflow-hidden bg-neutral-950 shrink-0 border border-white/10">
                            <img 
                              src={cleanGoogleDriveUrl(entityForm.avatar)} 
                              alt="Preview" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] text-gray-400 font-mono block uppercase">Active Path:</span>
                            <span className="text-[10px] text-gray-300 font-mono truncate block">{entityForm.avatar}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* PROJECT CATEGORIES TYPE FIELDS */}
              {editingType === "project_category" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Category Name</label>
                      <input
                        type="text"
                        value={entityForm.name || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Visibility</label>
                      <div className="flex items-center gap-2 h-full py-2">
                        <input
                          type="checkbox"
                          id="catIsHidden"
                          checked={!!entityForm.isHidden}
                          onChange={(e) => setEntityForm({ ...entityForm, isHidden: e.target.checked })}
                          className="w-4 h-4 rounded border-white/10 bg-neutral-900 text-red-500 focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                        <label htmlFor="catIsHidden" className="text-xs font-semibold text-red-400 cursor-pointer">
                          Hide from public website
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ACHIEVEMENT CATEGORIES TYPE FIELDS */}
              {editingType === "achievement_category" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Category Name</label>
                      <input
                        type="text"
                        value={entityForm.name || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Lucide Icon name</label>
                      <select
                        value={entityForm.icon || "Laptop"}
                        onChange={(e) => setEntityForm({ ...entityForm, icon: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      >
                        <option value="Laptop">Laptop (IT)</option>
                        <option value="FileSpreadsheet">FileSpreadsheet (Excel)</option>
                        <option value="BarChart2">BarChart2 (Power BI)</option>
                        <option value="Database">Database (SQL)</option>
                        <option value="Cpu">Cpu (Python / Tech / AI)</option>
                        <option value="Trophy">Trophy (Sports / Milestones)</option>
                        <option value="Target">Target (Goals / Mind Game)</option>
                        <option value="Brain">Brain (NLP / Meditation)</option>
                        <option value="TrendingUp">TrendingUp (Success / Growth)</option>
                        <option value="BookOpen">BookOpen (Workshops / Learning)</option>
                        <option value="Award">Award (Certifications)</option>
                        <option value="Shield">Shield (Social Community)</option>
                        <option value="Heart">Heart (Empowerment / Social)</option>
                        <option value="Briefcase">Briefcase (Professional Career)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Display Order</label>
                      <input
                        type="number"
                        value={entityForm.order || 0}
                        onChange={(e) => setEntityForm({ ...entityForm, order: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ACHIEVEMENT TYPE FIELDS */}
              {editingType === "achievement" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Achievement Title</label>
                      <input
                        type="text"
                        value={entityForm.title || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, title: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Tab Category</label>
                      <select
                        value={entityForm.categoryId || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, categoryId: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      >
                        <option value="">Select Category</option>
                        {achievementCategories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Narrative Detail</label>
                    <textarea
                      value={entityForm.narrative || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, narrative: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Main Cover Image</label>
                    <div className="space-y-3 bg-neutral-950/40 p-3.5 rounded-xl border border-white/5">
                      <ImageUploader 
                        onUploadComplete={(url) => setEntityForm({ ...entityForm, coverImage: url })}
                        currentUrl={entityForm.coverImage}
                        pathPrefix="achievements"
                        label="Upload Cover Image"
                      />
                      <div className="space-y-1">
                        <span className="text-[9px] text-gray-400 font-mono block">OR USE AN EXTERNAL URL / GOOGLE DRIVE LINK:</span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={entityForm.coverImage || ""}
                            onChange={(e) => setEntityForm({ ...entityForm, coverImage: e.target.value })}
                            placeholder="Paste image URL or Google Drive link"
                            className="flex-1 px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs font-mono"
                          />
                          <button
                            type="button"
                            onClick={() => simulateUpload("coverImage")}
                            className="px-3 bg-amber-500/10 hover:bg-amber-500/20 text-[#d4af37] border border-[#d4af37]/20 text-xs font-semibold rounded-lg cursor-pointer transition-colors"
                          >
                            Mock
                          </button>
                        </div>
                        <p className="text-[9px] text-gray-500 leading-normal mt-1">
                          💡 Supports Google Drive shared links (shared with "Anyone with link can view").
                        </p>
                      </div>
                      {entityForm.coverImage && (
                        <div className="flex items-center gap-3 p-2 bg-black/40 border border-white/5 rounded-lg">
                          <div className="w-12 h-12 rounded overflow-hidden bg-neutral-950 shrink-0 border border-white/10">
                            <img 
                              src={cleanGoogleDriveUrl(entityForm.coverImage)} 
                              alt="Preview" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] text-gray-400 font-mono block uppercase">Active Cover Path:</span>
                            <span className="text-[10px] text-gray-300 font-mono truncate block">{entityForm.coverImage}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEntityForm({ ...entityForm, coverImage: "" })}
                            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 font-semibold rounded bg-red-500/10 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 bg-neutral-950/40 p-3.5 rounded-xl border border-white/5">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Gallery Thumbnail Images (Multiple)</label>
                    
                    <div className="space-y-3">
                      <ImageUploader 
                        onUploadComplete={(url) => {
                          const currentGallery = entityForm.gallery || [];
                          setEntityForm({ ...entityForm, gallery: [...currentGallery, url] });
                        }}
                        pathPrefix="achievements/gallery"
                        label="Upload Image to Gallery"
                      />
                      
                      <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-2">
                        <span className="text-[9px] text-gray-500 font-mono">OR SIMULATE A RANDOM MOCK IMAGE:</span>
                        <button
                          type="button"
                          onClick={() => simulateUpload("gallery", true)}
                          className="px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-[#d4af37] border border-[#d4af37]/20 text-[10px] font-semibold rounded-lg cursor-pointer flex items-center gap-1 transition-colors"
                        >
                          <PlusCircle size={10} />
                          Simulate Mock Image
                        </button>
                      </div>
                    </div>
                    {/* display current list */}
                    {entityForm.gallery && entityForm.gallery.length > 0 && (
                      <div className="flex flex-wrap gap-2 p-3 bg-neutral-950 border border-white/5 rounded-xl">
                        {entityForm.gallery.map((gImg: string, idx: number) => (
                          <div key={idx} className="relative w-12 h-12 rounded-lg overflow-hidden border border-white/10">
                            <img src={cleanGoogleDriveUrl(gImg)} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                            <button
                              type="button"
                              onClick={() => {
                                const list = [...entityForm.gallery];
                                list.splice(idx, 1);
                                setEntityForm({ ...entityForm, gallery: list });
                              }}
                              className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg text-[8px]"
                            >
                              X
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Demo App / Launch Link</label>
                    <input
                      type="text"
                      value={entityForm.link || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, link: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* POSITION TYPES TYPE FIELDS */}
              {editingType === "position_type" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Organization Type</label>
                      <input
                        type="text"
                        value={entityForm.name || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Representative Icon</label>
                      <select
                        value={entityForm.icon || "Shield"}
                        onChange={(e) => setEntityForm({ ...entityForm, icon: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      >
                        <option value="Shield">Shield (Social Trust)</option>
                        <option value="Heart">Heart (NGO)</option>
                        <option value="Briefcase">Briefcase (Professional Body)</option>
                        <option value="BookOpen">BookOpen (Academic/Education Board)</option>
                        <option value="Trophy">Trophy (Sports/Athletics Association)</option>
                        <option value="Laptop">Laptop (IT / Technical Org)</option>
                        <option value="Globe">Globe (Global/Digital Hub)</option>
                        <option value="Award">Award (Certifying Body)</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Hide Option</label>
                      <select
                        value={entityForm.isHidden ? "true" : "false"}
                        onChange={(e) => setEntityForm({ ...entityForm, isHidden: e.target.value === "true" })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      >
                        <option value="false">Show</option>
                        <option value="true">Hide</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* POSITION ENTRY TYPE FIELDS */}
              {editingType === "position" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Designation/Role</label>
                      <input
                        type="text"
                        value={entityForm.position || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, position: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Association Type</label>
                      <select
                        value={entityForm.typeId || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, typeId: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      >
                        <option value="">Select Type</option>
                        {positionTypes.filter(t => !t.isHidden).map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Institution / Trust Name</label>
                      <input
                        type="text"
                        value={entityForm.organization || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, organization: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Years/Period</label>
                      <input
                        type="text"
                        value={entityForm.period || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, period: e.target.value })}
                        placeholder="e.g. 2023 - Present"
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Narrative About Role</label>
                    <textarea
                      value={entityForm.about || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, about: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      rows={3}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Institutional Link / URL</label>
                    <input
                      type="text"
                      value={entityForm.url || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, url: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                    />
                  </div>
                </div>
              )}

              {/* REGISTRATION FORM TEMPLATE TYPE FIELDS */}
              {editingType === "registration_form" && (
                <div className="space-y-5 text-left">
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Form Template Name (Internal reference, e.g. "Excel Masterclass Form")</label>
                    <input
                      type="text"
                      value={entityForm.name || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, name: e.target.value })}
                      placeholder="e.g. NLP Basic Form"
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Form Display Header Title (Visible to Visitor)</label>
                      <input
                        type="text"
                        value={entityForm.title || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, title: e.target.value })}
                        placeholder="e.g. Workshop Entry Invite"
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Submit Button CTA Text</label>
                      <input
                        type="text"
                        value={entityForm.buttonText || "Request Invite"}
                        onChange={(e) => setEntityForm({ ...entityForm, buttonText: e.target.value })}
                        placeholder="e.g. Request Invite"
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Form Header/Banner Image (Optional)</label>
                    <div className="bg-neutral-950/40 p-3.5 rounded-xl border border-white/5 space-y-3 mb-4">
                      <ImageUploader 
                        onUploadComplete={(url) => setEntityForm(prev => ({ ...prev, bannerImage: url }))}
                        currentUrl={entityForm.bannerImage}
                        pathPrefix="forms"
                        label="Upload Banner Image"
                        aspectRatio={21/9}
                      />
                      <div className="space-y-1">
                        <span className="text-[9px] text-gray-400 font-mono block">OR USE EXTERNAL URL:</span>
                        <input
                          type="text"
                          value={entityForm.bannerImage || ""}
                          onChange={(e) => setEntityForm(prev => ({ ...prev, bannerImage: e.target.value }))}
                          placeholder="Paste image URL"
                          className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs font-mono"
                        />
                      </div>
                      {entityForm.bannerImage && (
                        <div className="flex items-center gap-3 p-2 bg-black/40 border border-white/5 rounded-lg">
                          <div className="w-16 h-8 rounded overflow-hidden bg-neutral-950 shrink-0 border border-white/10">
                            <img 
                              src={cleanGoogleDriveUrl(entityForm.bannerImage)} 
                              alt="Preview" 
                              className="w-full h-full object-cover" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-[9px] text-gray-400 font-mono block uppercase">Active Image Path:</span>
                            <span className="text-[10px] text-gray-300 font-mono truncate block">{entityForm.bannerImage}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setEntityForm(prev => ({ ...prev, bannerImage: "" }))}
                            className="text-xs text-red-400 hover:text-red-300 px-2 py-1 font-semibold rounded bg-red-500/10 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Custom Success Message</label>
                    <input
                      type="text"
                      value={entityForm.successMessage || "Your registration request has been securely logged."}
                      onChange={(e) => setEntityForm({ ...entityForm, successMessage: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      required
                    />
                  </div>
                  
                  <div className="space-y-1 pt-2 border-t border-white/5">
                    <label className="text-[10px] text-[#d4af37] uppercase font-mono tracking-wider flex items-center gap-1.5">
                      Razorpay Payment Link URL (Optional)
                    </label>
                    <input
                      type="url"
                      value={entityForm.paymentLink || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, paymentLink: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-[#d4af37]/30 rounded-lg text-white placeholder-gray-600 focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] transition-all text-sm"
                      placeholder="https://rzp.io/l/xxxxxxxx"
                    />
                    <p className="text-[10px] text-gray-500 mt-1 leading-relaxed">
                      If provided, users will see a <strong>"Proceed to Payment"</strong> button linking to this Razorpay page immediately after successfully submitting this form. (Note: A workshop's individual payment link will override this one).
                    </p>
                  </div>

                  {/* Reusable Fields Library Panel */}
                  <div className="bg-neutral-950 p-4 rounded-xl border border-white/5 space-y-4 text-left">
                    <div className="flex items-center gap-2 border-b border-white/5 pb-2">
                      <Database size={14} className="text-[#d4af37]" />
                      <h4 className="text-xs font-semibold text-[#d4af37] font-mono uppercase tracking-widest">
                        Reusable Fields Library
                      </h4>
                    </div>

                    <div className="space-y-3">
                      <p className="text-xs text-gray-400">
                        Select any field previously saved in your library to instantly attach it to this form template:
                      </p>
                      
                      <div className="flex flex-wrap gap-2">
                        {(reusableFields || []).length === 0 ? (
                          <span className="text-[10px] text-gray-500 italic">No reusable fields loaded yet.</span>
                        ) : (
                          (reusableFields || []).map((rf) => {
                            const isAlreadyAdded = (entityForm.fields || []).some(
                              (f: any) => f.label?.toLowerCase() === rf.label?.toLowerCase() && f.type === rf.type
                            );
                            return (
                              <button
                                key={rf.id}
                                type="button"
                                disabled={isAlreadyAdded}
                                onClick={() => {
                                  const newField = {
                                    id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                                    label: rf.label,
                                    type: rf.type,
                                    required: rf.required !== undefined ? rf.required : true,
                                    placeholder: rf.placeholder || ""
                                  };
                                  setEntityForm({
                                    ...entityForm,
                                    fields: [...(entityForm.fields || []), newField]
                                  });
                                  showToast(`Attached "${rf.label}" from fields library.`, "success");
                                }}
                                className={`px-2.5 py-1.5 text-xs rounded-lg border flex items-center gap-1.5 cursor-pointer transition-all ${
                                  isAlreadyAdded
                                    ? "bg-neutral-900/40 border-white/5 text-gray-500 cursor-not-allowed"
                                    : "bg-white/5 hover:bg-white/10 border-white/10 text-gray-200 hover:text-white hover:border-[#d4af37]/30"
                                }`}
                              >
                                <span>{rf.label}</span>
                                <span className="text-[9px] font-mono bg-black/40 px-1 py-0.5 rounded text-[#d4af37] font-semibold">{rf.type}</span>
                              </button>
                            );
                          })
                        )}
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-3 space-y-3">
                      <p className="text-xs text-gray-400 font-medium">
                        Can't find the field you need? Create a new custom field and save it to the Library:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs bg-black/40 p-3 rounded-lg border border-white/5 items-end">
                        <div className="md:col-span-5 space-y-1">
                          <label className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">Field Label / Question</label>
                          <input
                            type="text"
                            id="new-lib-label"
                            placeholder="e.g. WhatsApp Number"
                            className="w-full px-2 py-1 bg-neutral-900 border border-white/10 rounded text-white text-xs outline-none focus:border-[#d4af37]/50"
                          />
                        </div>

                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">Data Type</label>
                          <select
                            id="new-lib-type"
                            className="w-full px-2 py-1 bg-neutral-900 border border-white/10 rounded text-white text-xs outline-none focus:border-[#d4af37]/50"
                          >
                            <option value="Text" className="bg-neutral-900 text-white">Text</option>
                            <option value="Number" className="bg-neutral-900 text-white">Number</option>
                            <option value="Email" className="bg-neutral-900 text-white">Email</option>
                            <option value="Phone" className="bg-neutral-900 text-white">Phone</option>
                            <option value="Date" className="bg-neutral-900 text-white">Date</option>
                            <option value="Full Name" className="bg-neutral-900 text-white">Full Name</option>
                            <option value="Address" className="bg-neutral-900 text-white">Address</option>
                            <option value="Gender" className="bg-neutral-900 text-white">Gender</option>
                            <option value="Dropdown" className="bg-neutral-900 text-white">Dropdown (Select list)</option>
                            <option value="Photo Upload (Image)" className="bg-neutral-900 text-white">Photo Upload (Image)</option>
                            <option value="Document Upload (PDF/Word)" className="bg-neutral-900 text-white">Document Upload (PDF/Word)</option>
                          </select>
                        </div>

                        <div className="md:col-span-3 space-y-1">
                          <label className="text-[9px] text-gray-400 font-mono uppercase tracking-wider block">Placeholder (Optional)</label>
                          <input
                            type="text"
                            id="new-lib-placeholder"
                            placeholder="e.g. Enter your active WhatsApp"
                            className="w-full px-2 py-1 bg-neutral-900 border border-white/10 rounded text-white text-xs outline-none focus:border-[#d4af37]/50"
                          />
                        </div>

                        <div className="md:col-span-1">
                          <button
                            type="button"
                            onClick={async () => {
                              const labelInput = document.getElementById("new-lib-label") as HTMLInputElement;
                              const typeSelect = document.getElementById("new-lib-type") as HTMLSelectElement;
                              const placeholderInput = document.getElementById("new-lib-placeholder") as HTMLInputElement;

                              if (!labelInput || !labelInput.value.trim()) {
                                showToast("Please provide a Field Label.", "error");
                                return;
                              }

                              const label = labelInput.value.trim();
                              const type = typeSelect.value;
                              const placeholder = placeholderInput ? placeholderInput.value.trim() : "";

                              // Check if already exists in library (case-insensitive)
                              const exists = (reusableFields || []).some(
                                rf => rf.label?.trim().toLowerCase() === label.toLowerCase() && rf.type === type
                              );
                              if (exists) {
                                showToast(`Field "${label}" (${type}) already exists in your library!`, "error");
                                return;
                              }

                              try {
                                // Save permanently to Firestore collection "reusable_fields"
                                await addEntity("reusable_fields", {
                                  label,
                                  type,
                                  placeholder,
                                  required: true,
                                  createdAt: new Date().toISOString()
                                });

                                // Append to current form fields
                                const newField = {
                                  id: `field_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
                                  label,
                                  type,
                                  required: true,
                                  placeholder
                                };
                                setEntityForm({
                                  ...entityForm,
                                  fields: [...(entityForm.fields || []), newField]
                                });

                                // Reset inputs
                                labelInput.value = "";
                                if (placeholderInput) placeholderInput.value = "";
                                showToast(`Successfully created "${label}" in the Library and added to form!`, "success");
                              } catch (err) {
                                showToast("Failed to create new field in the library.", "error");
                              }
                            }}
                            className="w-full h-8 bg-green-600 hover:bg-green-500 text-white text-xs font-bold rounded flex items-center justify-center cursor-pointer transition-colors"
                            title="Save Field to Library & Form"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fields list builder */}
                  <div className="border-t border-white/5 pt-4 space-y-4">
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-neutral-950 p-3 rounded-xl border border-white/5">
                      <span className="text-xs font-semibold text-[#d4af37] font-mono uppercase tracking-widest">
                        Custom Input Fields ({entityForm.fields ? entityForm.fields.length : 0})
                      </span>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            const standardFields = [
                              { id: "full_name_" + Date.now(), label: "Full Name", type: "Full Name", required: true, placeholder: "Enter your full name" },
                              { id: "mobile_" + Date.now(), label: "Mobile Number", type: "Phone", required: true, placeholder: "Enter your WhatsApp mobile number" },
                              { id: "address_" + Date.now(), label: "Full Address", type: "Address", required: true, placeholder: "Enter your physical address" }
                            ];
                            setEntityForm({
                              ...entityForm,
                              fields: [...(entityForm.fields || []), ...standardFields]
                            });
                          }}
                          className="px-2 py-1 text-[10px] bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/20 rounded font-semibold cursor-pointer transition-all"
                        >
                          + Bundle Standard Fields
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const newField = {
                              id: `field_${Date.now()}`,
                              label: "New Field Label",
                              type: "Text",
                              required: true,
                              placeholder: ""
                            };
                            setEntityForm({
                              ...entityForm,
                              fields: [...(entityForm.fields || []), newField]
                            });
                          }}
                          className="px-2.5 py-1 text-[10px] bg-green-500/10 hover:bg-green-500/25 text-green-300 border border-green-500/20 rounded font-semibold cursor-pointer transition-all"
                        >
                          + Add Field
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {!(entityForm.fields && entityForm.fields.length > 0) ? (
                        <p className="text-xs text-gray-500 italic py-4 text-center bg-black/20 rounded-lg">
                          No fields added yet. Add custom fields or load the "Bundle Standard Fields" to get started.
                        </p>
                      ) : (
                        (entityForm.fields || []).map((field: any, index: number) => (
                          <div key={field.id || index} className="p-3 bg-neutral-900 rounded-xl border border-white/5 space-y-3">
                            <div className="flex items-center justify-between border-b border-white/5 pb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-mono text-[#d4af37]">Field #{index + 1}</span>
                                {field.isHidden && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-mono bg-red-500/10 text-red-400 border border-red-500/20 uppercase flex items-center gap-0.5">
                                    <EyeOff size={8} /> Hidden
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3">
                                {/* Move Up/Down Controls */}
                                <div className="flex items-center gap-1 bg-black/40 px-1.5 py-0.5 rounded border border-white/5">
                                  <button
                                    type="button"
                                    disabled={index === 0}
                                    onClick={() => {
                                      if (index === 0) return;
                                      const updated = [...(entityForm.fields || [])];
                                      const temp = updated[index];
                                      updated[index] = updated[index - 1];
                                      updated[index - 1] = temp;
                                      setEntityForm({ ...entityForm, fields: updated });
                                    }}
                                    className={`p-0.5 rounded transition-colors ${index === 0 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    title="Move Field Up"
                                  >
                                    <ArrowUp size={11} />
                                  </button>
                                  <span className="w-[1px] h-3 bg-white/10" />
                                  <button
                                    type="button"
                                    disabled={index === (entityForm.fields || []).length - 1}
                                    onClick={() => {
                                      if (index === (entityForm.fields || []).length - 1) return;
                                      const updated = [...(entityForm.fields || [])];
                                      const temp = updated[index];
                                      updated[index] = updated[index + 1];
                                      updated[index + 1] = temp;
                                      setEntityForm({ ...entityForm, fields: updated });
                                    }}
                                    className={`p-0.5 rounded transition-colors ${index === (entityForm.fields || []).length - 1 ? 'text-gray-600 cursor-not-allowed' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
                                    title="Move Field Down"
                                  >
                                    <ArrowDown size={11} />
                                  </button>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...(entityForm.fields || [])];
                                    updated.splice(index, 1);
                                    setEntityForm({ ...entityForm, fields: updated });
                                  }}
                                  className="text-[10px] text-red-400 hover:text-red-300 transition-colors font-mono uppercase font-semibold cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 text-xs">
                              <div className="md:col-span-5 space-y-1">
                                <label className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">Field Label / Question</label>
                                <input
                                  type="text"
                                  value={field.label || ""}
                                  placeholder="e.g. Your Age or City"
                                  onChange={(e) => {
                                    const updated = [...(entityForm.fields || [])];
                                    updated[index] = { ...updated[index], label: e.target.value };
                                    setEntityForm({ ...entityForm, fields: updated });
                                  }}
                                  className="w-full px-2 py-1 bg-neutral-950 border border-white/10 rounded text-white"
                                  required
                                />
                              </div>

                              <div className="md:col-span-3 space-y-1">
                                <label className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">Data Type</label>
                                <select
                                  value={field.type || "Text"}
                                  onChange={(e) => {
                                    const updated = [...(entityForm.fields || [])];
                                    updated[index] = { ...updated[index], type: e.target.value };
                                    setEntityForm({ ...entityForm, fields: updated });
                                  }}
                                  className="w-full px-2 py-1 bg-neutral-900 border border-white/10 rounded text-white text-sm outline-none focus:border-[#d4af37]/50"
                                >
                                  <option value="Text" className="bg-neutral-900 text-white">Text</option>
                                  <option value="Number" className="bg-neutral-900 text-white">Number</option>
                                  <option value="Email" className="bg-neutral-900 text-white">Email</option>
                                  <option value="Phone" className="bg-neutral-900 text-white">Phone</option>
                                  <option value="Date" className="bg-neutral-900 text-white">Date</option>
                                  <option value="Full Name" className="bg-neutral-900 text-white">Full Name</option>
                                  <option value="Address" className="bg-neutral-900 text-white">Address</option>
                                  <option value="Gender" className="bg-neutral-900 text-white">Gender</option>
                                  <option value="Dropdown" className="bg-neutral-900 text-white">Dropdown (Select list)</option>
                                  <option value="Photo Upload (Image)" className="bg-neutral-900 text-white">Photo Upload (Image)</option>
                                  <option value="Document Upload (PDF/Word)" className="bg-neutral-900 text-white">Document Upload (PDF/Word)</option>
                                </select>
                              </div>

                              <div className="md:col-span-2 space-y-1">
                                <label className="text-[9px] text-gray-400 font-mono uppercase tracking-wider">Placeholder (Optional)</label>
                                <input
                                  type="text"
                                  value={field.placeholder || ""}
                                  placeholder={field.type === "Dropdown" ? "e.g. Choose option" : "e.g. Enter response"}
                                  onChange={(e) => {
                                    const updated = [...(entityForm.fields || [])];
                                    updated[index] = { ...updated[index], placeholder: e.target.value };
                                    setEntityForm({ ...entityForm, fields: updated });
                                  }}
                                  className="w-full px-2 py-1 bg-neutral-950 border border-white/10 rounded text-white"
                                />
                              </div>

                              <div className="md:col-span-2 flex items-center justify-around gap-2 pt-4 md:pt-0">
                                <label className="flex items-center gap-1 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={!!field.required}
                                    onChange={(e) => {
                                      const updated = [...(entityForm.fields || [])];
                                      updated[index] = { ...updated[index], required: e.target.checked };
                                      setEntityForm({ ...entityForm, fields: updated });
                                    }}
                                    className="w-3.5 h-3.5 rounded border-white/10 bg-neutral-950 text-[#d4af37] focus:ring-0"
                                  />
                                  <span className="text-[10px] font-mono text-gray-400">Req</span>
                                </label>

                                <label className="flex items-center gap-1 cursor-pointer select-none">
                                  <input
                                    type="checkbox"
                                    checked={!!field.isHidden}
                                    onChange={(e) => {
                                      const updated = [...(entityForm.fields || [])];
                                      updated[index] = { ...updated[index], isHidden: e.target.checked };
                                      setEntityForm({ ...entityForm, fields: updated });
                                    }}
                                    className="w-3.5 h-3.5 rounded border-white/10 bg-neutral-950 text-red-500 focus:ring-0"
                                  />
                                  <span className="text-[10px] font-mono text-gray-400 flex items-center gap-0.5">
                                    {field.isHidden ? <EyeOff size={10} className="text-red-400" /> : <Eye size={10} className="text-green-400" />}
                                    Hide
                                  </span>
                                </label>
                              </div>

                              {/* Dropdown Options Input */}
                              {field.type === "Dropdown" && (
                                <div className="md:col-span-12 space-y-1 bg-black/40 p-2.5 rounded-lg border border-white/5 mt-1 text-left">
                                  <label className="text-[9px] text-amber-300 font-mono uppercase tracking-wider block font-semibold">
                                    Dropdown Options (Comma-separated, e.g. Study, Professional, Self-employed)
                                  </label>
                                  <input
                                    type="text"
                                    value={field.options || ""}
                                    placeholder="e.g. Study, Professional, Other"
                                    onChange={(e) => {
                                      const updated = [...(entityForm.fields || [])];
                                      updated[index] = { ...updated[index], options: e.target.value };
                                      setEntityForm({ ...entityForm, fields: updated });
                                    }}
                                    className="w-full px-2 py-1 bg-neutral-950 border border-white/10 rounded text-white text-xs"
                                    required
                                  />
                                  <p className="text-[8px] text-gray-500 font-mono">Options will appear as choices in the dropdown select list for visitors.</p>
                                </div>
                              )}

                              {/* Consolidated/Merged Column Group Name */}
                              <div className="md:col-span-12 space-y-1 bg-white/[0.02] p-2.5 rounded-lg border border-white/5 mt-1 text-left">
                                <label className="text-[9px] text-[#d4af37] font-mono uppercase tracking-wider block font-semibold">
                                  Excel Grid Column Merge Name (Optional)
                                </label>
                                <input
                                  type="text"
                                  value={field.mergeColumnName || ""}
                                  placeholder="e.g. Profession / Coaching Details (Combine multiple dependent responses into a single column)"
                                  onChange={(e) => {
                                    const updated = [...(entityForm.fields || [])];
                                    updated[index] = { ...updated[index], mergeColumnName: e.target.value };
                                    setEntityForm({ ...entityForm, fields: updated });
                                  }}
                                  className="w-full px-2 py-1 bg-neutral-950 border border-white/10 rounded text-white text-xs outline-none focus:border-[#d4af37]/40"
                                />
                                <p className="text-[8px] text-gray-400 font-mono">
                                  <strong>Pro-Tip:</strong> If you have conditional fields like <em>"Which Profession?"</em> and <em>"Field of Coaching?"</em>, give them the <strong>exact same Merge Column Name</strong>. This combines their answers into a single, beautifully organized column in the Excel Grid and CSV download!
                                </p>
                              </div>

                              {/* Conditional Logic Configuration */}
                              <div className="md:col-span-12 border-t border-white/5 pt-2 mt-1 text-left bg-black/10 p-2 rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                                  <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
                                    <input
                                      type="checkbox"
                                      checked={!!field.isConditional}
                                      onChange={(e) => {
                                        const updated = [...(entityForm.fields || [])];
                                        updated[index] = { 
                                          ...updated[index], 
                                          isConditional: e.target.checked,
                                          dependsOnFieldId: e.target.checked ? (updated[index].dependsOnFieldId || "") : "",
                                          dependsOnValue: e.target.checked ? (updated[index].dependsOnValue || "") : ""
                                        };
                                        setEntityForm({ ...entityForm, fields: updated });
                                      }}
                                      className="w-3.5 h-3.5 rounded border-white/10 bg-neutral-900 text-[#d4af37] focus:ring-0"
                                    />
                                    <span className="text-[10px] text-gray-300 font-medium font-mono uppercase tracking-wider">Conditional field (depends on another response)</span>
                                  </label>

                                  {!!field.isConditional && (
                                    <div className="flex flex-wrap items-center gap-2 flex-1">
                                      <span className="text-[10px] text-gray-500">Show only when</span>
                                      <select
                                        value={field.dependsOnFieldId || ""}
                                        onChange={(e) => {
                                          const updated = [...(entityForm.fields || [])];
                                          updated[index] = { ...updated[index], dependsOnFieldId: e.target.value };
                                          setEntityForm({ ...entityForm, fields: updated });
                                        }}
                                        className="px-2 py-0.5 bg-neutral-900 border border-white/10 rounded text-white text-[10px] outline-none"
                                        required={!!field.isConditional}
                                      >
                                        <option value="" className="bg-neutral-900 text-white">-- Select Parent Field --</option>
                                        {(entityForm.fields || [])
                                          .filter((f: any, idx: number) => idx !== index) // don't depend on self
                                          .map((f: any) => (
                                            <option key={f.id} value={f.id} className="bg-neutral-900 text-white">{f.label || `Field ${f.id}`}</option>
                                          ))}
                                      </select>

                                      <span className="text-[10px] text-gray-500">equals</span>

                                      <input
                                        type="text"
                                        value={field.dependsOnValue || ""}
                                        placeholder="e.g. Study"
                                        onChange={(e) => {
                                          const updated = [...(entityForm.fields || [])];
                                          updated[index] = { ...updated[index], dependsOnValue: e.target.value };
                                          setEntityForm({ ...entityForm, fields: updated });
                                        }}
                                        className="px-2 py-0.5 bg-neutral-950 border border-white/10 rounded text-white text-[10px] w-32 outline-none"
                                        required={!!field.isConditional}
                                      />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}

                      {entityForm.fields && entityForm.fields.length > 0 && (
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-white/5">
                          <span className="text-[10px] text-gray-400 font-mono uppercase tracking-wider">Quick Add (Bottom):</span>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const standardFields = [
                                  { id: "full_name_" + Date.now(), label: "Full Name", type: "Full Name", required: true, placeholder: "Enter your full name" },
                                  { id: "mobile_" + Date.now(), label: "Mobile Number", type: "Phone", required: true, placeholder: "Enter your WhatsApp mobile number" },
                                  { id: "address_" + Date.now(), label: "Full Address", type: "Address", required: true, placeholder: "Enter your physical address" }
                                ];
                                setEntityForm({
                                  ...entityForm,
                                  fields: [...(entityForm.fields || []), ...standardFields]
                                });
                              }}
                              className="px-2 py-1 text-[10px] bg-amber-500/10 hover:bg-amber-500/25 text-amber-300 border border-amber-500/20 rounded font-semibold cursor-pointer transition-all"
                            >
                              + Bundle Standard Fields
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const newField = {
                                  id: `field_${Date.now()}`,
                                  label: "New Field Label",
                                  type: "Text",
                                  required: true,
                                  placeholder: ""
                                };
                                setEntityForm({
                                  ...entityForm,
                                  fields: [...(entityForm.fields || []), newField]
                                });
                              }}
                              className="px-2.5 py-1 text-[10px] bg-green-500/10 hover:bg-green-500/25 text-green-300 border border-green-500/20 rounded font-semibold cursor-pointer transition-all"
                            >
                              + Add Field
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* CONTACT MESSAGES ENTRY TYPE FIELDS */}
              {editingType === "messages" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Full Name *</label>
                      <input
                        type="text"
                        value={entityForm.name || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Email Address *</label>
                      <input
                        type="email"
                        value={entityForm.email || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, email: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Subject</label>
                    <input
                      type="text"
                      value={entityForm.subject || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, subject: e.target.value })}
                      className="w-full px-3 py-2 bg-[#171717] border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Inquiry Message *</label>
                    <textarea
                      value={entityForm.message || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, message: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      rows={5}
                      required
                    />
                  </div>
                </div>
              )}

              {/* WORKSHOP REGISTRATION TYPE FIELDS */}
              {(editingType === "workshop_registration" || editingType === "workshop_registrations") && (
                <div className="space-y-4 text-left">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Attendee Full Name *</label>
                      <input
                        type="text"
                        value={entityForm.name || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, name: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Mobile Number (WhatsApp) *</label>
                      <input
                        type="text"
                        value={entityForm.mobile || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, mobile: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Select Workshop *</label>
                      <select
                        value={entityForm.workshopId || ""}
                        onChange={(e) => {
                          const ws = projects.find(p => p.id === e.target.value);
                          setEntityForm({ 
                            ...entityForm, 
                            workshopId: e.target.value, 
                            workshopTitle: ws ? ws.title : "" 
                          });
                        }}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        required
                      >
                        <option value="">Select Workshop</option>
                        {projects.map(p => (
                          <option key={p.id} value={p.id}>{p.title}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Preferred Date / Batch</label>
                      <input
                        type="text"
                        value={entityForm.preferredDate || ""}
                        onChange={(e) => setEntityForm({ ...entityForm, preferredDate: e.target.value })}
                        placeholder="e.g. Next Upcoming Saturday"
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Residential Address *</label>
                    <input
                      type="text"
                      value={entityForm.address || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, address: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Additional Note / Query</label>
                    <textarea
                      value={entityForm.additionalInfo || ""}
                      onChange={(e) => setEntityForm({ ...entityForm, additionalInfo: e.target.value })}
                      className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                      rows={3}
                    />
                  </div>
                </div>
              )}

              {/* SUBMIT ROW */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer"
              >
                <Save size={16} />
                {editingType === "project" ? "Save Workshop Details" : `Save ${editingType.replace("_", " ").toUpperCase()}`}
              </button>
            </form>
          ) : (
            <>
              {/* TAB 1: PROFILE / CORE / CONNECT EDITORS */}
              {activeTab === "profile" && profileForm && (
                <div className="space-y-8">
                  <form onSubmit={handleProfileSave} className="space-y-5">
                    <h3 className="text-lg font-serif font-semibold text-[#d4af37] flex items-center gap-2">
                      <User size={18} />
                      Home Page Profile Configurations
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Full Display Name</label>
                        <input
                          type="text"
                          value={profileForm.name || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Professional Subtitle</label>
                        <input
                          type="text"
                          value={profileForm.title || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })}
                          className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Hero Tagline</label>
                        <input
                          type="text"
                          value={profileForm.tagline || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, tagline: e.target.value })}
                          placeholder="e.g. Learn. Lead. Succeed."
                          className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Hero Badge / Subhead</label>
                        <input
                          type="text"
                          value={profileForm.badge || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, badge: e.target.value })}
                          placeholder="e.g. NLP Practitioner & Corporate Leader"
                          className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Main Home Portrait / Headshot Image</label>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-950/40 p-3.5 rounded-xl border border-white/5">
                        <div className="md:col-span-2 space-y-3">
                          <ImageUploader 
                            onUploadComplete={(url) => setProfileForm({ ...profileForm, avatarUrl: url })}
                            currentUrl={profileForm.avatarUrl}
                            pathPrefix="avatars"
                            label="Upload Main Portrait Image"
                          />
                          <div className="space-y-1">
                            <span className="text-[9px] text-gray-400 font-mono block">OR USE AN EXTERNAL URL / GOOGLE DRIVE LINK:</span>
                            <input
                              type="text"
                              value={profileForm.avatarUrl || ""}
                              onChange={(e) => setProfileForm({ ...profileForm, avatarUrl: e.target.value })}
                              className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs font-mono"
                              placeholder="Paste external image URL or Google Drive link"
                            />
                            <p className="text-[9px] text-gray-500 leading-normal">
                              💡 External Google Drive links are automatically converted and supported.
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-col items-center justify-center border border-white/5 rounded-xl bg-black/40 p-2">
                          <span className="text-[9px] text-gray-500 font-mono mb-2 uppercase">Active Image</span>
                          {profileForm.avatarUrl ? (
                            <div className="w-20 h-20 rounded-full border-2 border-[#d4af37]/30 overflow-hidden bg-neutral-950 shadow-md">
                              <img 
                                src={cleanGoogleDriveUrl(profileForm.avatarUrl)} 
                                alt="Live Preview" 
                                className="w-full h-full object-cover" 
                                referrerPolicy="no-referrer"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-20 rounded-full border border-dashed border-white/10 flex items-center justify-center text-gray-600">
                              <User size={30} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Home Page Hero Description (Small & Crisp)</label>
                      <textarea
                        value={profileForm.heroDescription || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, heroDescription: e.target.value })}
                        placeholder="Provide a short, crisp introduction for the Home Page hero section..."
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        rows={3}
                      />
                    </div>

                    {/* Dynamic Home Statistics Counters Array Form */}
                    <div className="border-t border-white/5 pt-6 space-y-4">
                      <h4 className="text-xs font-semibold text-[#d4af37] font-mono uppercase tracking-widest">
                        Home Statistics Counters (4 Items)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {Array.from({ length: 4 }).map((_, idx) => {
                          const stat = (profileForm.stats || [])[idx] || { label: "", value: "" };
                          return (
                            <div key={idx} className="p-3 rounded-xl border border-white/5 bg-white/[0.01] space-y-2">
                              <div className="text-[10px] font-mono text-gray-500">Counter #{idx + 1}</div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 uppercase tracking-wider font-mono">Value</label>
                                <input
                                  type="text"
                                  value={stat.value || ""}
                                  placeholder="e.g. 250+"
                                  onChange={(e) => {
                                    const newStats = [...(profileForm.stats || [])];
                                    while (newStats.length <= idx) newStats.push({ label: "", value: "" });
                                    newStats[idx] = { ...newStats[idx], value: e.target.value };
                                    setProfileForm({ ...profileForm, stats: newStats });
                                  }}
                                  className="w-full px-2 py-1 bg-neutral-900 border border-white/10 rounded text-white text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 uppercase tracking-wider font-mono">Label</label>
                                <input
                                  type="text"
                                  value={stat.label || ""}
                                  placeholder="e.g. Workshops Delivered"
                                  onChange={(e) => {
                                    const newStats = [...(profileForm.stats || [])];
                                    while (newStats.length <= idx) newStats.push({ label: "", value: "" });
                                    newStats[idx] = { ...newStats[idx], label: e.target.value };
                                    setProfileForm({ ...profileForm, stats: newStats });
                                  }}
                                  className="w-full px-2 py-1 bg-neutral-900 border border-white/10 rounded text-white text-xs"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Connect block nested */}
                    <div className="border-t border-white/5 pt-6 space-y-4">
                      <h4 className="text-xs font-semibold text-[#d4af37] font-mono uppercase tracking-widest">Connect coordinates & Social portals</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Direct Email</label>
                          <input
                            type="email"
                            value={profileForm.email || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Phone</label>
                          <input
                            type="text"
                            value={profileForm.phone || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Location</label>
                          <input
                            type="text"
                            value={profileForm.location || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">LinkedIn Profile Link</label>
                          <input
                            type="text"
                            value={profileForm.linkedin || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">YouTube channel</label>
                          <input
                            type="text"
                            value={profileForm.youtube || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, youtube: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] text-gray-400 uppercase tracking-wider font-mono">Instagram handle</label>
                          <input
                            type="text"
                            value={profileForm.instagram || ""}
                            onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })}
                            className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                          />
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Save size={16} />
                      Save Profile Configurations
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 1.5: ABOUT PAGE DETAILED CONFIGURATION */}
              {activeTab === "about" && profileForm && (
                <div className="space-y-8">
                  <form onSubmit={handleProfileSave} className="space-y-5">
                    <h3 className="text-lg font-serif font-semibold text-[#d4af37] flex items-center gap-2">
                      <Info size={18} />
                      About Page Content Configurations
                    </h3>

                    <div className="space-y-1">
                      <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Personal Story / Biography Narrative</label>
                      <textarea
                        value={profileForm.bio || ""}
                        onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                        className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        rows={6}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">About Page Subtitle (Under Image)</label>
                        <input
                          type="text"
                          value={profileForm.aboutSubtitle || ""}
                          onChange={(e) => setProfileForm({ ...profileForm, aboutSubtitle: e.target.value })}
                          placeholder="e.g. NLP Master & Advisor"
                          className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">About Page Portrait Image</label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-neutral-950/40 p-3.5 rounded-xl border border-white/5">
                          <div className="md:col-span-2 space-y-3">
                            <ImageUploader 
                              onUploadComplete={(url) => setProfileForm({ ...profileForm, aboutAvatarUrl: url })}
                              currentUrl={profileForm.aboutAvatarUrl}
                              pathPrefix="avatars"
                              label="Upload About Page Portrait"
                            />
                            <div className="space-y-1">
                              <span className="text-[9px] text-gray-400 font-mono block">OR USE AN EXTERNAL URL:</span>
                              <input
                                type="text"
                                value={profileForm.aboutAvatarUrl || ""}
                                onChange={(e) => setProfileForm({ ...profileForm, aboutAvatarUrl: e.target.value })}
                                placeholder="Leave blank to use main portrait URL"
                                className="w-full px-3 py-1.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-xs font-mono"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col items-center justify-center border border-white/5 rounded-xl bg-black/40 p-2">
                            <span className="text-[9px] text-gray-500 font-mono mb-2 uppercase">Active Image</span>
                            {(profileForm.aboutAvatarUrl || profileForm.avatarUrl) ? (
                              <div className="w-20 h-20 rounded-xl border border-white/10 overflow-hidden bg-neutral-950 shadow-md">
                                <img 
                                  src={cleanGoogleDriveUrl(profileForm.aboutAvatarUrl || profileForm.avatarUrl)} 
                                  alt="About Live Preview" 
                                  className="w-full h-full object-cover" 
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                            ) : (
                              <div className="w-20 h-20 rounded-xl border border-dashed border-white/10 flex items-center justify-center text-gray-600">
                                <User size={30} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dynamic About Page Checklist Highlights Array Form */}
                    <div className="border-t border-white/5 pt-6 space-y-4">
                      <h4 className="text-xs font-semibold text-[#d4af37] font-mono uppercase tracking-widest">
                        About Page Highlights Checklist (4 Items)
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Array.from({ length: 4 }).map((_, idx) => {
                          const h = (profileForm.highlights || [])[idx] || { title: "", description: "" };
                          return (
                            <div key={idx} className="p-3 rounded-xl border border-white/5 bg-white/[0.01] space-y-2">
                              <div className="text-[10px] font-mono text-gray-500">Highlight Checklist #{idx + 1}</div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 uppercase tracking-wider font-mono">Title</label>
                                <input
                                  type="text"
                                  value={h.title || ""}
                                  placeholder="e.g. Subconscious Blueprint"
                                  onChange={(e) => {
                                    const newH = [...(profileForm.highlights || [])];
                                    while (newH.length <= idx) newH.push({ title: "", description: "" });
                                    newH[idx] = { ...newH[idx], title: e.target.value };
                                    setProfileForm({ ...profileForm, highlights: newH });
                                  }}
                                  className="w-full px-2 py-1 bg-neutral-900 border border-white/10 rounded text-white text-xs"
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[9px] text-gray-400 uppercase tracking-wider font-mono">Description</label>
                                <input
                                  type="text"
                                  value={h.description || ""}
                                  placeholder="e.g. Custom NLP maps to swap beliefs."
                                  onChange={(e) => {
                                    const newH = [...(profileForm.highlights || [])];
                                    while (newH.length <= idx) newH.push({ title: "", description: "" });
                                    newH[idx] = { ...newH[idx], description: e.target.value };
                                    setProfileForm({ ...profileForm, highlights: newH });
                                  }}
                                  className="w-full px-2 py-1 bg-neutral-900 border border-white/10 rounded text-white text-xs"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-semibold rounded-xl flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                    >
                      <Save size={16} />
                      Save About Page Configurations
                    </button>
                  </form>
                </div>
              )}

              {/* TAB 2: WORKSHOPS CRUD */}
              {activeTab === "workshops" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-lg font-serif font-semibold text-white">
                      Programs & Workshops Catalogue
                    </h3>
                    <button
                      onClick={() => openAddEntity("project", { category: projectCategories.length > 0 ? projectCategories[0].name : "Technical" })}
                      className="px-4 py-2 bg-[#d4af37] text-black text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <Plus size={14} />
                      Add Workshop
                    </button>
                  </div>

                  {/* Workshop Categories Management */}
                  <div className="pt-2 pb-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-[#d4af37] font-mono uppercase tracking-widest flex items-center gap-2">
                          <Info size={14} />
                          Workshop Categories
                        </h3>
                        <p className="text-[10px] text-gray-400 mt-1">
                          Create categories first to organize your workshops.
                        </p>
                      </div>
                      <button
                        onClick={() => openAddEntity("project_category", { order: 0, isHidden: false })}
                        className="px-3 py-1.5 bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} />
                        Add Category
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {projectCategories.map((c) => (
                        <div 
                          key={c.id} 
                          className={`px-3.5 py-1.5 rounded-full border text-xs flex items-center gap-2 ${c.isHidden ? "bg-red-500/10 border-red-500/20 text-gray-400" : "bg-white/5 border-white/10 text-white"}`}
                        >
                          <span className="font-semibold">{c.name}</span>
                          {c.isHidden && <span className="text-[9px] text-red-400 uppercase font-mono tracking-wider ml-1">(Hidden)</span>}
                          <div className="flex items-center gap-2 ml-2 pl-2 border-l border-white/10">
                            <button
                              onClick={() => openEditEntity("project_category", c.id || "", c)}
                              className="text-gray-400 hover:text-white"
                              title="Edit"
                            >
                              <Edit size={10} />
                            </button>
                            <button
                              onClick={() => handleDeleteEntity("project_category", c.id || "")}
                              className="text-red-400 hover:text-red-300"
                              title="Delete"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      ))}
                      {projectCategories.length === 0 && (
                        <div className="text-[11px] text-gray-500 italic">No categories created yet. Click "Add Category" to start.</div>
                      )}
                    </div>
                  </div>

                  {/* Visual Registration Form Guide */}
                  <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 text-gray-200 space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                      <h4 className="text-sm font-semibold text-white font-serif">
                        How to Enable Public Registration Forms
                      </h4>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Every workshop you create can have its own automated registration / invite form. To enable it:
                    </p>
                    <ol className="text-xs text-gray-400 space-y-1.5 list-decimal pl-5">
                      <li>
                        Click the <strong className="text-white">Add Workshop</strong> button above or click <strong className="text-white">Edit (Pencil Icon)</strong> on an existing workshop.
                      </li>
                      <li>
                        Scroll to the bottom of the form to find the <strong className="text-[#d4af37]">"Enable Entry Invite / Registration Form"</strong> checkbox.
                      </li>
                      <li>
                        Check the box and fill in your <strong className="text-white">Workshop Date / Schedule</strong>.
                      </li>
                      <li>
                        Save your changes. A beautiful <strong className="text-[#d4af37]">"Request Invite"</strong> registration button will automatically appear for that workshop on your live website!
                      </li>
                    </ol>
                    <p className="text-[11px] text-amber-400/90 font-mono mt-1">
                      💡 All attendee registrations will immediately land in your new <strong className="text-white">"Workshop Invites"</strong> tab on the sidebar.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {projects.map((project, index) => (
                      <div 
                        key={project.id} 
                        draggable
                        onDragStart={() => setDraggedProjectIndex(index)}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={() => handleDropProject(index)}
                        className={`p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] flex items-center justify-between gap-4 cursor-grab active:cursor-grabbing transition-transform ${draggedProjectIndex === index ? "opacity-50 scale-[0.98]" : "opacity-100 scale-100"}`}
                      >
                        <div>
                          <span className="text-[9px] font-mono tracking-widest text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded uppercase border border-[#d4af37]/20">
                            {project.category}
                          </span>
                          <h4 className="text-sm font-semibold text-white mt-1">{project.title}</h4>
                          <p className="text-xs text-gray-400 line-clamp-1">{project.description}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleMoveProject(index, 'up')}
                            disabled={index === 0}
                            className={`p-2 rounded-lg transition-colors ${index === 0 ? "opacity-30 cursor-not-allowed text-gray-500" : "text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"}`}
                            title="Move Up"
                          >
                            <ArrowUp size={14} />
                          </button>
                          <button
                            onClick={() => handleMoveProject(index, 'down')}
                            disabled={index === projects.length - 1}
                            className={`p-2 rounded-lg transition-colors ${index === projects.length - 1 ? "opacity-30 cursor-not-allowed text-gray-500" : "text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 cursor-pointer"}`}
                            title="Move Down"
                          >
                            <ArrowDown size={14} />
                          </button>
                          {project.allowRegistration && (
                            <button
                              onClick={() => {
                                setQrProject(project);
                                setCopiedQrUrl(false);
                              }}
                              className="p-2 text-amber-400 hover:text-[#d4af37] bg-amber-500/5 hover:bg-amber-500/15 border border-[#d4af37]/20 rounded-lg cursor-pointer transition-all"
                              title="Generate Student QR Code & Invite Link"
                            >
                              <QrCode size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => toggleHideEntity("project", project.id || "", !!project.isHidden)}
                            className={`p-2 rounded-lg cursor-pointer transition-colors ${
                              project.isHidden 
                                ? "text-gray-500 hover:text-white bg-white/5" 
                                : "text-green-400 hover:text-green-300 bg-green-500/10"
                            }`}
                            title={project.isHidden ? "Hidden - Click to Show" : "Visible - Click to Hide"}
                          >
                            {project.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => openEditEntity("project", project.id || "", project)}
                            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteEntity("project", project.id || "")}
                            className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB: REGISTRATION FORMS CRUD */}
              {activeTab === "forms" && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4 text-left">
                    <div className="text-left">
                      <h3 className="text-lg font-serif font-semibold text-white">
                        Registration Form Templates
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">Design custom forms with specific data types and attach them to any workshop.</p>
                    </div>
                    <button
                      onClick={() => openAddEntity("registration_form", { name: "New Dynamic Form Template", title: "Workshop Entry Invite", buttonText: "Request Invite", successMessage: "Your registration has been securely logged.", fields: [] })}
                      className="px-4 py-2 bg-[#d4af37] text-black text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg hover:bg-amber-400 transition-all"
                    >
                      <Plus size={14} />
                      Create Form Template
                    </button>
                  </div>

                  {/* Form Builder Intro */}
                  <div className="p-4 rounded-xl border border-amber-500/15 bg-neutral-950 text-left space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="flex h-2 w-2 rounded-full bg-[#d4af37]" />
                      <h4 className="text-xs font-semibold text-[#d4af37] font-mono uppercase tracking-widest">
                        How Form Templates Work
                      </h4>
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Instead of building a separate form from scratch for each event, you can design reusable registration templates with custom input fields. Supported types include:
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[10px] font-mono text-amber-300/80 bg-black/40 p-2.5 rounded-lg border border-white/5">
                      <div>📝 Text Input</div>
                      <div>🔢 Number</div>
                      <div>📧 Email</div>
                      <div>📞 Phone</div>
                      <div>📅 Date</div>
                      <div>👤 Full Name</div>
                      <div>📍 Address</div>
                      <div>⚧ Gender</div>
                      <div>🖼️ Photo (Image)</div>
                      <div>📄 PDF/Word Doc</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                    {registrationForms.length === 0 ? (
                      <div className="md:col-span-2 p-12 rounded-2xl border border-white/5 bg-white/[0.01] text-center text-gray-400 space-y-2">
                        <FileSpreadsheet className="mx-auto text-gray-600 mb-1" size={32} />
                        <h4 className="text-sm font-semibold text-white">No Form Templates Found</h4>
                        <p className="text-xs max-w-sm mx-auto">Create your very first registration form template using the "Create Form Template" button above!</p>
                      </div>
                    ) : (
                      registrationForms.map((form) => (
                        <div 
                          key={form.id} 
                          className="p-5 rounded-2xl border border-white/5 bg-neutral-950 hover:bg-neutral-900/50 transition-all flex flex-col justify-between gap-4 shadow-xl"
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className="text-[9px] font-mono tracking-widest text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded uppercase border border-[#d4af37]/20 font-semibold">
                                {form.fields?.length || 0} Dynamic Fields
                              </span>
                              <span className="text-[9px] text-gray-500 font-mono">
                                ID: {form.id?.substring(0, 6)}...
                              </span>
                            </div>
                            <h4 className="text-base font-semibold text-white mt-2 font-serif">{form.name}</h4>
                            <p className="text-xs text-gray-400 mt-1 italic">"{form.title}"</p>

                            {/* Brief field labels list */}
                            <div className="mt-3 flex flex-wrap gap-1.5">
                              {(form.fields || []).slice(0, 4).map((f: any, idx: number) => (
                                <span key={f.id || idx} className="text-[9px] bg-white/5 px-2 py-0.5 rounded text-gray-300 border border-white/5 font-mono">
                                  {f.label}: {f.type}
                                </span>
                              ))}
                              {(form.fields || []).length > 4 && (
                                <span className="text-[9px] text-[#d4af37] font-mono">
                                  +{(form.fields || []).length - 4} more
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1 text-xs">
                            <span className="text-[10px] text-gray-400">
                              Linked Workshops: <span className="text-white font-semibold">{projects.filter(p => p.formTemplateId === form.id).length}</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => openEditEntity("registration_form", form.id || "", form)}
                                className="p-2 text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl cursor-pointer transition-all"
                                title="Edit Form Structure"
                              >
                                <Edit size={13} />
                              </button>
                              <button
                                onClick={() => handleDeleteEntity("registration_form", form.id || "")}
                                className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-xl cursor-pointer transition-all"
                                title="Delete Template"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* TAB 3: MILESTONES & ACHIEVEMENTS CRUD */}
              {activeTab === "achievements" && (
                <div className="space-y-8">
                  {/* Categories Row */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-sm font-semibold text-[#d4af37] font-mono uppercase tracking-widest flex items-center gap-2">
                        <Info size={14} />
                        Tab Categories (IT, Excel, Mind Game)
                      </h3>
                      <button
                        onClick={() => openAddEntity("achievement_category", { order: 0, icon: "Laptop" })}
                        className="px-3 py-1.5 bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} />
                        Add Tab Category
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {achievementCategories.map((c) => (
                        <div 
                          key={c.id} 
                          className="px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white flex items-center gap-2"
                        >
                          <span className="font-semibold">{c.name}</span>
                          <span className="text-[10px] text-gray-400 font-mono">({c.icon})</span>
                          <button
                            onClick={() => openEditEntity("achievement_category", c.id || "", c)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit size={10} />
                          </button>
                          <button
                            onClick={() => handleDeleteEntity("achievement_category", c.id || "")}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Achievement items row */}
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-lg font-serif font-semibold text-white">
                        Achievement entries
                      </h3>
                      <button
                        onClick={() => {
                          if (achievementCategories.length === 0) {
                            showToast("Please add at least one Tab Category first before adding an achievement card.", "error");
                          } else {
                            openAddEntity("achievement", { categoryId: achievementCategories[0]?.id || "", gallery: [] });
                          }
                        }}
                        className="px-4 py-2 bg-[#d4af37] text-black text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg hover:brightness-110 transition-all"
                      >
                        <Plus size={14} />
                        Add Achievement Card
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {achievements.map((item) => {
                        const cat = achievementCategories.find(c => c.id === item.categoryId);
                        return (
                          <div 
                            key={item.id} 
                            className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] flex items-center justify-between gap-4"
                          >
                            <div>
                              <span className="text-[9px] font-mono tracking-widest text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded uppercase border border-amber-500/20">
                                {cat?.name || "Uncategorized"}
                              </span>
                              <h4 className="text-sm font-semibold text-white mt-1">{item.title}</h4>
                              <p className="text-xs text-gray-400 line-clamp-1">{item.narrative}</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => toggleHideEntity("achievement", item.id || "", !!item.isHidden)}
                                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                                  item.isHidden 
                                    ? "text-gray-500 hover:text-white bg-white/5" 
                                    : "text-green-400 hover:text-green-300 bg-green-500/10"
                                }`}
                                title={item.isHidden ? "Hidden - Click to Show" : "Visible - Click to Hide"}
                              >
                                {item.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                onClick={() => openEditEntity("achievement", item.id || "", item)}
                                className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteEntity("achievement", item.id || "")}
                                className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: LEADERSHIP & AFFILIATIONS TIMELINE CRUD */}
              {activeTab === "positions" && (
                <div className="space-y-8">
                  {/* Org Types Row */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-sm font-semibold text-[#d4af37] font-mono uppercase tracking-widest flex items-center gap-2">
                        <Info size={14} />
                        Organization Types
                      </h3>
                      <button
                        onClick={() => openAddEntity("position_type", { icon: "Shield", isHidden: false })}
                        className="px-3 py-1.5 bg-[#d4af37]/20 border border-[#d4af37]/40 text-[#d4af37] text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer"
                      >
                        <Plus size={12} />
                        Add Org Type
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      {positionTypes.map((t) => (
                        <div 
                          key={t.id} 
                          className="px-3.5 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white flex items-center gap-2"
                        >
                          {t.isHidden ? <EyeOff size={10} className="text-gray-500" /> : <Eye size={10} className="text-green-500" />}
                          <span className="font-semibold">{t.name}</span>
                          <button
                            onClick={() => openEditEntity("position_type", t.id || "", t)}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit size={10} />
                          </button>
                          <button
                            onClick={() => handleDeleteEntity("position_type", t.id || "")}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Position Entries Row */}
                  <div className="space-y-4 pt-6 border-t border-white/5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4">
                      <h3 className="text-lg font-serif font-semibold text-white">
                        Leadership Position Entries
                      </h3>
                      <button
                        onClick={() => {
                          const activeTypes = positionTypes.filter(t => !t.isHidden);
                          if (activeTypes.length === 0) {
                            showToast("Please add at least one Organization Type first before adding a position role.", "error");
                          } else {
                            openAddEntity("position", { typeId: activeTypes[0]?.id || "", period: "2023 - Present" });
                          }
                        }}
                        className="px-4 py-2 bg-[#d4af37] text-black text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg hover:brightness-110 transition-all"
                      >
                        <Plus size={14} />
                        Add Position Role
                      </button>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      {positions.map((p) => {
                        const type = positionTypes.find(t => t.id === p.typeId);
                        return (
                          <div 
                            key={p.id} 
                            className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] flex items-center justify-between gap-4"
                          >
                            <div>
                              <span className="text-[9px] font-mono tracking-widest text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded uppercase border border-[#d4af37]/20">
                                {type?.name || "Affiliation"}
                              </span>
                              <h4 className="text-sm font-semibold text-white mt-1">{p.position}</h4>
                              <p className="text-xs text-gray-400 line-clamp-1">{p.organization} ({p.period})</p>
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => toggleHideEntity("position", p.id || "", !!p.isHidden)}
                                className={`p-2 rounded-lg cursor-pointer transition-colors ${
                                  p.isHidden 
                                    ? "text-gray-500 hover:text-white bg-white/5" 
                                    : "text-green-400 hover:text-green-300 bg-green-500/10"
                                }`}
                                title={p.isHidden ? "Hidden - Click to Show" : "Visible - Click to Hide"}
                              >
                                {p.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                              </button>
                              <button
                                onClick={() => openEditEntity("position", p.id || "", p)}
                                className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDeleteEntity("position", p.id || "")}
                                className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg cursor-pointer"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 5: CONTACT INBOX MESSAGES SUBMISSIONS */}
              {activeTab === "messages" && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 text-left">
                    <div>
                      <h3 className="text-lg font-serif font-semibold text-white">
                        Inbound Contact Form Inquiries
                      </h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        Form submissions collected live from public visitor inquiries.
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={() => openAddEntity("messages", {})}
                        className="px-3 py-1.5 bg-[#d4af37] text-black text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer hover:bg-amber-400 transition-all"
                      >
                        <Plus size={13} />
                        Compose Message
                      </button>
                      
                      <button
                        onClick={seedTestMessages}
                        className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer hover:bg-white/10 transition-all"
                        title="Seed sample inquiries for instant display"
                      >
                        <Sparkles size={13} className="text-[#d4af37]" />
                        Seed Test Data
                      </button>
                      
                      {messages.length > 0 && (
                        <button
                          onClick={() => downloadCSV(
                            messages,
                            "contact_inbound_inquiries",
                            ["Name", "Email", "Subject", "Message", "Date Received"],
                            (row, header) => {
                              if (header === "Name") return row.name || "";
                              if (header === "Email") return row.email || "";
                              if (header === "Subject") return row.subject || "";
                              if (header === "Message") return row.message || "";
                              if (header === "Date Received") return row.createdAt ? new Date(row.createdAt).toLocaleString() : "";
                              return "";
                            }
                          )}
                          className="px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-300 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer hover:bg-green-600/30 transition-all"
                        >
                          <Download size={13} />
                          Export Excel (CSV)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Dynamic Contact Details & Send Message Simulation Grid */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                    {/* LEFT COLUMN: Configure Contact Details */}
                    {profileForm && (
                      <div className="lg:col-span-6 bg-[#171717]/40 rounded-2xl border border-white/5 p-5 md:p-6 space-y-5 text-left backdrop-blur-sm shadow-xl flex flex-col justify-between">
                        <div className="space-y-5">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                              <span className="flex h-2.5 w-2.5 rounded-full bg-[#d4af37] animate-pulse" />
                              <div>
                                <h4 className="text-sm font-serif font-bold text-white tracking-wide">
                                  Configure Contact Coordinates & Coaching Hours
                                </h4>
                                <p className="text-[10px] text-gray-400 mt-0.5">
                                  Modify the public information shown on your live "Connect & Consult" page.
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium block">
                                Direct Email
                              </label>
                              <input
                                type="email"
                                value={profileForm.email || ""}
                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                className="w-full px-3 py-2 bg-neutral-900/90 border border-white/10 rounded-xl text-white text-xs font-sans focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-colors"
                                placeholder="e.g. pradeepparmar902@yahoo.com"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium block">
                                Contact Phone
                              </label>
                              <input
                                type="text"
                                value={profileForm.phone || ""}
                                onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                                className="w-full px-3 py-2 bg-neutral-900/90 border border-white/10 rounded-xl text-white text-xs font-sans focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-colors"
                                placeholder="e.g. +91 98199 84437"
                              />
                            </div>
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium block">
                              Base Location
                            </label>
                            <input
                              type="text"
                              value={profileForm.location || ""}
                              onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })}
                              className="w-full px-3 py-2 bg-neutral-900/90 border border-white/10 rounded-xl text-white text-xs font-sans focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-colors"
                              placeholder="e.g. Gujarat, India"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono font-medium block">
                              Coaching Hours & Availability
                            </label>
                            <textarea
                              value={profileForm.coachingHours || ""}
                              onChange={(e) => setProfileForm({ ...profileForm, coachingHours: e.target.value })}
                              placeholder="e.g. Monday – Saturday: 09:00 AM – 06:00 PM (IST)&#10;Seminar and corporate travel sessions booked on special reserves."
                              className="w-full px-3.5 py-2.5 bg-neutral-900/90 border border-white/10 rounded-xl text-white text-xs font-sans focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-colors leading-relaxed"
                              rows={3}
                            />
                          </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleContactDetailsSave()}
                            className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-amber-500 text-black text-xs font-bold rounded-lg cursor-pointer hover:opacity-90 flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
                          >
                            <Save size={13} />
                            Save Contact Settings
                          </button>
                        </div>
                      </div>
                    )}

                    {/* RIGHT COLUMN: Send a Message simulation / manual message form */}
                    <div className="lg:col-span-6 bg-[#171717]/40 rounded-2xl border border-white/5 p-5 md:p-6 space-y-5 text-left backdrop-blur-sm shadow-xl flex flex-col justify-between">
                      <div className="space-y-5">
                        <div className="border-b border-white/5 pb-3">
                          <h4 className="text-sm font-serif font-bold text-white tracking-wide">
                            Send a Message
                          </h4>
                          <p className="text-[10px] text-gray-400 mt-0.5">
                            Simulate or manually register an inbound message on behalf of a client.
                          </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                              Full Name *
                            </label>
                            <input
                              type="text"
                              value={adminMessageForm.name}
                              onChange={(e) => setAdminMessageForm(prev => ({ ...prev, name: e.target.value }))}
                              placeholder="Pradeep Parmar"
                              className="w-full px-3 py-2 bg-neutral-900/90 border border-white/10 rounded-xl text-white text-xs font-sans focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-colors"
                            />
                          </div>

                          <div className="space-y-1.5">
                            <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                              Email Address *
                            </label>
                            <input
                              type="email"
                              value={adminMessageForm.email}
                              onChange={(e) => setAdminMessageForm(prev => ({ ...prev, email: e.target.value }))}
                              placeholder="pradeep@example.com"
                              className="w-full px-3 py-2 bg-neutral-900/90 border border-white/10 rounded-xl text-white text-xs font-sans focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-colors"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                            Subject
                          </label>
                          <input
                            type="text"
                            value={adminMessageForm.subject}
                            onChange={(e) => setAdminMessageForm(prev => ({ ...prev, subject: e.target.value }))}
                            placeholder="Corporate Excel Training proposal"
                            className="w-full px-3 py-2 bg-neutral-900/90 border border-white/10 rounded-xl text-white text-xs font-sans focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-colors"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                            Your Message *
                          </label>
                          <textarea
                            value={adminMessageForm.message}
                            onChange={(e) => setAdminMessageForm(prev => ({ ...prev, message: e.target.value }))}
                            placeholder="Hi Pradeep, I would like to book an NLP consultation or coordinate a technical workshop..."
                            className="w-full px-3.5 py-2 bg-neutral-900/90 border border-white/10 rounded-xl text-white text-xs font-sans focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-colors leading-relaxed"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 flex justify-end">
                        <button
                          type="button"
                          onClick={handleAdminMessageSubmit}
                          className="px-6 py-2.5 bg-gradient-to-r from-[#d4af37] to-amber-500 hover:opacity-90 text-black text-xs font-bold rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all w-full sm:w-auto"
                        >
                          <Send size={13} />
                          Dispatch Message
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between bg-[#171717] p-2 rounded-xl border border-white/5">
                    <span className="text-xs font-mono text-gray-400 pl-2">
                      Total Submissions: <strong className="text-[#d4af37] font-semibold">{messages.length}</strong>
                    </span>
                    
                    <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                      <button
                        onClick={() => setMessagesViewMode("cards")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                          messagesViewMode === "cards"
                            ? "bg-[#d4af37] text-black shadow-md"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <List size={13} />
                        Cards View
                      </button>
                      <button
                        onClick={() => setMessagesViewMode("excel")}
                        className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                          messagesViewMode === "excel"
                            ? "bg-[#d4af37] text-black shadow-md"
                            : "text-gray-400 hover:text-white"
                        }`}
                      >
                        <Table size={13} />
                        Excel Grid View
                      </button>
                    </div>
                  </div>

                  {messages.length === 0 ? (
                    <div className="text-center py-16 text-gray-500 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center gap-3">
                      <Mail size={32} className="text-gray-600" />
                      <p className="text-sm font-sans">No messages received in the mailbox yet.</p>
                      <button 
                        onClick={seedTestMessages}
                        className="mt-2 text-xs text-[#d4af37] hover:underline cursor-pointer"
                      >
                        Click here to seed gorgeous sample inquiries
                      </button>
                    </div>
                  ) : messagesViewMode === "cards" ? (
                    <div className="space-y-4 text-left">
                      {messages.map((msg) => (
                        <div 
                          key={msg.id} 
                          className="p-5 rounded-xl border border-white/5 bg-black/40 hover:border-white/10 transition-colors space-y-3"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                            <div>
                              <h4 className="text-sm font-semibold text-white leading-none">
                                {msg.name}
                              </h4>
                              <a href={`mailto:${msg.email}`} className="text-[#d4af37] text-xs hover:underline mt-1 block">
                                {msg.email}
                              </a>
                              {msg.mobile && (
                                <a href={`tel:${msg.mobile}`} className="text-gray-400 text-xs hover:text-white transition-colors mt-1 block">
                                  {msg.mobile}
                                </a>
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-gray-500">
                              {new Date(msg.createdAt).toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="text-xs text-gray-300 font-medium font-mono uppercase tracking-wider">
                            Subject: {msg.subject}
                          </div>
                          
                          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                            {msg.message}
                          </p>
 
                          <div className="flex justify-end pt-2 border-t border-white/[0.02]">
                            <button
                              onClick={() => handleDeleteEntity("messages", msg.id || "")}
                              className="px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg cursor-pointer"
                            >
                              Archive / Delete
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* EXCEL GRID TABLE VIEW WITH OPTIMIZED WIDTH */
                    <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-2xl">
                      <div className="overflow-x-auto w-full">
                        <table className="w-full min-w-[1000px] border-collapse text-left text-xs text-gray-300 table-layout-auto">
                          <thead>
                            <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] font-mono uppercase tracking-wider text-gray-400 select-none">
                              <th className="p-3.5 border-r border-white/5 font-bold text-center">#</th>
                              <th className="p-3.5 border-r border-white/5 font-bold">Client / Sender</th>
                              <th className="p-3.5 border-r border-white/5 font-bold">Coordinates</th>
                              <th className="p-3.5 border-r border-white/5 font-bold">Subject Inquiry</th>
                              <th className="p-3.5 border-r border-white/5 font-bold">Detailed Message</th>
                              <th className="p-3.5 border-r border-white/5 font-bold">Date Received</th>
                              <th className="p-3.5 text-center font-bold">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 font-sans">
                            {messages.map((msg, index) => (
                              <tr key={msg.id} className="hover:bg-[#d4af37]/5 transition-colors group">
                                <td className="p-3 border-r border-white/5 font-mono text-gray-500 text-[10px] select-none text-center">
                                  {(index + 1).toString().padStart(2, "0")}
                                </td>
                                <td className="p-3 border-r border-white/5 font-semibold text-white">
                                  {msg.name}
                                </td>
                                <td className="p-3 border-r border-white/5 font-mono text-xs text-[#d4af37]">
                                  <div className="flex flex-col gap-1">
                                    <a href={`mailto:${msg.email}`} className="hover:underline">{msg.email}</a>
                                    {msg.mobile && (
                                      <a href={`tel:${msg.mobile}`} className="text-gray-400 hover:text-white transition-colors">
                                        {msg.mobile}
                                      </a>
                                    )}
                                  </div>
                                </td>
                                <td className="p-3 border-r border-white/5 font-semibold text-gray-200">
                                  {msg.subject}
                                </td>
                                <td className="p-3 border-r border-white/5 text-gray-400 max-w-sm whitespace-pre-wrap break-words leading-relaxed">
                                  {msg.message}
                                </td>
                                <td className="p-3 border-r border-white/5 font-mono text-[10px] text-gray-500 whitespace-nowrap">
                                  {new Date(msg.createdAt).toLocaleString()}
                                </td>
                                <td className="p-3 text-center">
                                  <button
                                    onClick={() => handleDeleteEntity("messages", msg.id || "")}
                                    className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded border border-red-500/20 cursor-pointer transition-colors"
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === "registrations" && (() => {
                const fieldLabelToMergeName: Record<string, string> = {};
                if (registrationForms) {
                  registrationForms.forEach(form => {
                    if (form.fields) {
                      form.fields.forEach((field: any) => {
                        if (field.label && field.mergeColumnName) {
                          fieldLabelToMergeName[field.label] = field.mergeColumnName.trim();
                        }
                      });
                    }
                  });
                }

                const getDisplayAnswer = (reg: any, colKey: string) => {
                  if (!reg.answers) return "—";
                  
                  // If exact match exists and is filled (not empty/dash)
                  if (reg.answers[colKey] !== undefined && reg.answers[colKey] !== "" && reg.answers[colKey] !== "—") {
                    return String(reg.answers[colKey]);
                  }
                  
                  // Look for dynamic mapped answers matching this mergeColumnName
                  const candidates: string[] = [];
                  Object.entries(reg.answers).forEach(([originalLabel, value]) => {
                    const mappedMergeName = fieldLabelToMergeName[originalLabel];
                    if (mappedMergeName === colKey && value !== undefined && value !== "" && value !== "—") {
                      candidates.push(String(value));
                    }
                  });
                  
                  if (candidates.length > 0) {
                    return candidates.join(" / ");
                  }
                  
                  // Fallback: if exact match is just "—" or doesn't exist
                  return String(reg.answers[colKey] || "—");
                };

                const dynamicKeys = (() => {
                  const keys = new Set<string>();
                  if (workshopRegistrations) {
                    workshopRegistrations.forEach(reg => {
                      if (reg.answers) {
                        Object.keys(reg.answers).forEach(k => {
                          const norm = k.toLowerCase().replace(/[^a-z0-9]/g, "");
                          const isStandard = [
                            "fullname", "name", "mobilenumber", "mobile", "phone", "whatsappmobile", "whatsapp",
                            "address", "fulladdress", "preferreddate", "preferredbatch", "workshopdate",
                            "workshopdatepreferredschedule", "additionalinfo", "additionalnote", "additionalqueries",
                            "additionalquery", "queries", "notes", "note"
                          ].includes(norm);
                          if (!isStandard) {
                            const mergedName = fieldLabelToMergeName[k];
                            keys.add(mergedName || k);
                          }
                        });
                      }
                    });
                  }
                  return Array.from(keys);
                })();

                return (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4 text-left">
                      <div>
                        <h3 className="text-lg font-serif font-semibold text-white">
                          Workshop Entry Invites & Registrations
                        </h3>
                        <p className="text-xs text-gray-400 mt-0.5">
                          View leads and attendee bookings submitted for your interactive workshops.
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => {
                            if (projects.length === 0) {
                              showToast("Please create at least one Workshop project first before adding a registration.", "error");
                            } else {
                              openAddEntity("workshop_registration", { 
                                workshopId: projects[0].id || "", 
                                workshopTitle: projects[0].title || "",
                                preferredDate: "Next Upcoming Saturday"
                              });
                            }
                          }}
                          className="px-3 py-1.5 bg-[#d4af37] text-black text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer hover:bg-amber-400 transition-all"
                        >
                          <Plus size={13} />
                          Add Manual Lead
                        </button>

                        <button
                          onClick={seedTestRegistrations}
                          className="px-3 py-1.5 bg-white/5 border border-white/10 text-gray-300 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer hover:bg-white/10 transition-all"
                          title="Seed sample registrations for instant display"
                        >
                          <Sparkles size={13} className="text-[#d4af37]" />
                          Seed Test Data
                        </button>

                        {workshopRegistrations && workshopRegistrations.length > 0 && (
                          <button
                            onClick={() => downloadCSV(
                              workshopRegistrations,
                              "workshop_registrations",
                              ["Workshop", "Name", "Mobile", "Address", "Preferred Date", ...dynamicKeys, "Additional Note", "Registered At"],
                              (row, header) => {
                                if (header === "Workshop") return row.workshopTitle || "";
                                if (header === "Name") return row.name || "";
                                if (header === "Mobile") return row.mobile || "";
                                if (header === "Address") return row.address || "";
                                if (header === "Preferred Date") return row.preferredDate || "";
                                if (header === "Additional Note") return row.additionalInfo || "";
                                if (header === "Registered At") return row.createdAt ? new Date(row.createdAt).toLocaleString() : "";
                                if (dynamicKeys.includes(header)) {
                                  return getDisplayAnswer(row, header);
                                }
                                return "";
                              }
                            )}
                            className="px-3 py-1.5 bg-green-600/20 border border-green-500/30 text-green-300 text-xs font-semibold rounded-lg flex items-center gap-1 cursor-pointer hover:bg-green-600/30 transition-all"
                          >
                            <Download size={13} />
                            Export Excel (CSV)
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between bg-[#171717] p-2 rounded-xl border border-white/5">
                      <span className="text-xs font-mono text-gray-400 pl-2">
                        Total Bookings: <strong className="text-[#d4af37] font-semibold">{workshopRegistrations?.length || 0}</strong>
                      </span>
                      
                      <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/5">
                        <button
                          onClick={() => setRegistrationsViewMode("cards")}
                          className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                            registrationsViewMode === "cards"
                              ? "bg-[#d4af37] text-black shadow-md"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          <List size={13} />
                          Cards View
                        </button>
                        <button
                          onClick={() => setRegistrationsViewMode("excel")}
                          className={`px-3 py-1 text-xs font-semibold rounded-md flex items-center gap-1.5 transition-all cursor-pointer ${
                            registrationsViewMode === "excel"
                              ? "bg-[#d4af37] text-black shadow-md"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          <Table size={13} />
                          Excel Grid View
                        </button>
                      </div>
                    </div>

                    {(!workshopRegistrations || workshopRegistrations.length === 0) ? (
                      <div className="text-center py-16 text-gray-500 rounded-2xl border border-white/5 bg-white/[0.01] flex flex-col items-center justify-center gap-3">
                        <FileSpreadsheet size={32} className="text-gray-600" />
                        <p className="text-sm font-sans">No workshop registrations received yet.</p>
                        <button 
                          onClick={seedTestRegistrations}
                          className="mt-2 text-xs text-[#d4af37] hover:underline cursor-pointer"
                        >
                          Click here to seed professional attendee registrations
                        </button>
                      </div>
                    ) : registrationsViewMode === "cards" ? (
                      <div className="space-y-4">
                        {workshopRegistrations.map((reg) => (
                          <div 
                            key={reg.id} 
                            className="p-5 rounded-xl border border-white/5 bg-black/40 hover:border-white/10 transition-colors space-y-3 text-left"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-2.5">
                              <div>
                                <span className="text-[10px] uppercase tracking-wider font-semibold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded mr-2">
                                  {reg.workshopTitle}
                                </span>
                                <h4 className="text-sm font-semibold text-white inline-block mt-1 sm:mt-0">
                                  {reg.name}
                                </h4>
                              </div>
                              <span className="text-[10px] font-mono text-gray-500">
                                Registered: {new Date(reg.createdAt).toLocaleString()}
                              </span>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-left">
                              <div className="space-y-1">
                                <span className="text-[10px] text-gray-400 font-mono uppercase block">Mobile Number</span>
                                <a href={`tel:${reg.mobile}`} className="text-white hover:text-[#d4af37] font-semibold transition-colors">
                                  {reg.mobile}
                                </a>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-gray-400 font-mono uppercase block">Preferred Date / Schedule</span>
                                <span className="text-gray-200 font-semibold">
                                  {reg.preferredDate || "Not Specified"}
                                </span>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[10px] text-gray-400 font-mono uppercase block">Residential Address</span>
                                <span className="text-gray-300">
                                  {reg.address}
                                </span>
                              </div>
                            </div>
   
                            {reg.additionalInfo && (
                              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-2.5 text-xs text-left">
                                <span className="text-[10px] text-[#d4af37] font-mono block mb-1">Additional Note / Query:</span>
                                <p className="text-gray-300 italic">"{reg.additionalInfo}"</p>
                              </div>
                            )}
   
                            {reg.answers && Object.keys(reg.answers).length > 0 && (
                              <div className="bg-white/[0.02] border border-white/5 rounded-lg p-3 text-xs space-y-2 text-left">
                                <span className="text-[10px] text-[#d4af37] font-mono block uppercase tracking-wider font-semibold border-b border-white/5 pb-1">Dynamic Form Submissions:</span>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                                  {Object.entries(reg.answers).map(([key, val]: [string, any]) => {
                                    const valStr = String(val);
                                    const isImage = valStr.match(/\.(jpeg|jpg|gif|png|webp)/i) || valStr.includes("images.unsplash.com") || valStr.startsWith("data:image/") || valStr.includes("drive.google.com") || valStr.includes("docs.google.com");
                                    const isDoc = valStr.match(/\.(pdf|doc|docx|xls|xlsx|txt)/i) || valStr.includes("document");
   
                                    return (
                                      <div key={key} className="space-y-1">
                                        <span className="text-[10px] text-gray-400 font-mono capitalize">{key.replace(/_/g, " ")}:</span>
                                        {isImage ? (
                                          <div className="mt-1">
                                            <a href={cleanGoogleDriveUrl(valStr)} target="_blank" rel="noreferrer" className="inline-block relative rounded-lg overflow-hidden border border-white/10 group">
                                              <img src={cleanGoogleDriveUrl(valStr)} alt={key} className="h-20 w-auto object-cover hover:scale-105 transition-transform" referrerPolicy="no-referrer" />
                                              <span className="absolute bottom-0 left-0 right-0 bg-black/80 text-[8px] text-center py-0.5 text-white opacity-0 group-hover:opacity-100 transition-opacity">View Image</span>
                                            </a>
                                          </div>
                                        ) : isDoc || valStr.startsWith("http") ? (
                                          <div className="mt-1">
                                            <a 
                                              href={valStr} 
                                              target="_blank" 
                                              rel="noreferrer" 
                                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/20 rounded font-mono text-[9px] uppercase font-semibold transition-all"
                                            >
                                              📄 View Document / File
                                            </a>
                                          </div>
                                        ) : (
                                          <p className="text-white font-medium">{valStr || "—"}</p>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            )}
   
                            <div className="flex justify-end pt-2 border-t border-white/[0.02]">
                              <button
                                onClick={() => handleDeleteEntity("workshop_registrations", reg.id || "")}
                                className="px-3 py-1.5 text-[10px] font-semibold tracking-wider uppercase border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg cursor-pointer"
                              >
                                Remove / Delete Lead
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      /* EXCEL GRID TABLE VIEW FOR REGISTRATIONS */
                      <div className="w-full overflow-hidden rounded-xl border border-white/10 bg-black/60 shadow-2xl">
                        <div className="overflow-x-auto w-full">
                          <table className="w-full min-w-[1200px] border-collapse text-left text-xs text-gray-300 table-layout-auto">
                            <thead>
                              <tr className="border-b border-white/10 bg-white/[0.03] text-[10px] font-mono uppercase tracking-wider text-gray-400 select-none">
                                <th className="p-3.5 border-r border-white/5 font-bold text-center">#</th>
                                <th className="p-3.5 border-r border-white/5 font-bold">Workshop Goal</th>
                                <th className="p-3.5 border-r border-white/5 font-bold">Attendee Name</th>
                                <th className="p-3.5 border-r border-white/5 font-bold">WhatsApp Mobile</th>
                                <th className="p-3.5 border-r border-white/5 font-bold">Preferred Batch</th>
                                <th className="p-3.5 border-r border-white/5 font-bold">Physical Address</th>
                                {dynamicKeys.map(key => (
                                  <th key={key} className="p-3.5 border-r border-white/5 font-bold">{key}</th>
                                ))}
                                <th className="p-3.5 border-r border-white/5 font-bold">Additional Query</th>
                                <th className="p-3.5 border-r border-white/5 font-bold">Registered At</th>
                                <th className="p-3.5 text-center font-bold">Actions</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 font-sans">
                              {workshopRegistrations.map((reg, index) => (
                                <tr key={reg.id} className="hover:bg-[#d4af37]/5 transition-colors group">
                                  <td className="p-3 border-r border-white/5 font-mono text-gray-500 text-[10px] select-none text-center">
                                    {(index + 1).toString().padStart(2, "0")}
                                  </td>
                                  <td className="p-3 border-r border-white/5">
                                    <span className="text-[10px] uppercase tracking-wider font-semibold text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded border border-[#d4af37]/20 whitespace-nowrap">
                                      {reg.workshopTitle}
                                    </span>
                                  </td>
                                  <td className="p-3 border-r border-white/5 font-semibold text-white">
                                    {reg.name}
                                  </td>
                                  <td className="p-3 border-r border-white/5 font-mono text-xs text-gray-200">
                                    <a href={`tel:${reg.mobile}`} className="hover:text-[#d4af37] transition-colors">{reg.mobile}</a>
                                  </td>
                                  <td className="p-3 border-r border-white/5 text-gray-300 font-medium">
                                    {reg.preferredDate || "Not Specified"}
                                  </td>
                                  <td className="p-3 border-r border-white/5 text-gray-400 max-w-xs truncate" title={reg.address}>
                                    {reg.address}
                                  </td>
                                  
                                  {dynamicKeys.map(key => {
                                    const valStr = getDisplayAnswer(reg, key);
                                    const isImage = valStr.match(/\.(jpeg|jpg|gif|png|webp)/i) || valStr.includes("images.unsplash.com") || valStr.startsWith("data:image/") || valStr.includes("drive.google.com") || valStr.includes("docs.google.com");
                                    const isDoc = valStr.match(/\.(pdf|doc|docx|xls|xlsx|txt)/i) || valStr.includes("document");

                                    return (
                                      <td key={key} className="p-3 border-r border-white/5 text-gray-300 max-w-xs truncate" title={valStr}>
                                        {isImage ? (
                                          <a href={cleanGoogleDriveUrl(valStr)} target="_blank" rel="noreferrer" className="text-[#d4af37] hover:underline inline-flex items-center gap-1 font-mono text-[10px]">
                                            🖼️ View Image
                                          </a>
                                        ) : isDoc || valStr.startsWith("http") ? (
                                          <a href={valStr} target="_blank" rel="noreferrer" className="text-[#d4af37] hover:underline inline-flex items-center gap-1 font-mono text-[10px]">
                                            📄 View Doc
                                          </a>
                                        ) : (
                                          valStr || "—"
                                        )}
                                      </td>
                                    );
                                  })}

                                  <td className="p-3 border-r border-white/5 text-gray-400 max-w-xs truncate" title={reg.additionalInfo}>
                                    {reg.additionalInfo || "—"}
                                  </td>
                                  <td className="p-3 border-r border-white/5 font-mono text-[10px] text-gray-500 whitespace-nowrap">
                                    {new Date(reg.createdAt).toLocaleString()}
                                  </td>
                                  <td className="p-3 text-center">
                                    <button
                                      onClick={() => handleDeleteEntity("workshop_registrations", reg.id || "")}
                                      className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-wider text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded border border-red-500/20 cursor-pointer transition-colors"
                                    >
                                      Delete
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* TAB 6: CAREER EXPERIENCE HISTORY CRUD */}
              {activeTab === "experiences" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-lg font-serif font-semibold text-white">
                      Career Experience History
                    </h3>
                    <button
                      onClick={() => openAddEntity("experience", {})}
                      className="px-4 py-2 bg-[#d4af37] text-black text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <Plus size={14} />
                      Add Experience
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {experiences.map((exp) => (
                      <div 
                        key={exp.id} 
                        className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] flex items-center justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white">{exp.title}</h4>
                            <span className="text-[10px] font-mono text-gray-400 bg-white/5 px-1.5 py-0.5 rounded">
                              {exp.period}
                            </span>
                          </div>
                          <p className="text-xs text-[#d4af37] font-mono mt-0.5">{exp.organization}</p>
                          <p className="text-xs text-gray-400 line-clamp-1 mt-1">{exp.details}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => toggleHideEntity("experience", exp.id || "", !!exp.isHidden)}
                            className={`p-2 rounded-lg cursor-pointer transition-colors ${
                              exp.isHidden 
                                ? "text-gray-500 hover:text-white bg-white/5" 
                                : "text-green-400 hover:text-green-300 bg-green-500/10"
                            }`}
                            title={exp.isHidden ? "Hidden - Click to Show" : "Visible - Click to Hide"}
                          >
                            {exp.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => openEditEntity("experience", exp.id || "", exp)}
                            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteEntity("experience", exp.id || "")}
                            className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 7: SKILLS CRUD */}
              {activeTab === "skills" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-lg font-serif font-semibold text-white capitalize">
                        {selectedSkillCategory === "All" ? "Core Capability Skills" : `${selectedSkillCategory} Skills`}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">
                        Organize your competencies like Technical, Core, NLP, or Soft skills.
                      </p>
                    </div>
                    <button
                      onClick={() => openAddEntity("skill", { category: "Technical", percentage: 90 })}
                      className="px-4 py-2 bg-[#d4af37] text-black text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg hover:bg-amber-400 transition-colors"
                    >
                      <Plus size={14} />
                      Add Skill
                    </button>
                  </div>

                  {/* Category Reordering Panel */}
                  {(() => {
                    const uniqueCats = Array.from(new Set(skills.map(s => s.category || "Technical"))).filter(Boolean);
                    if (uniqueCats.length <= 1) return null;

                    // Sort categories according to existing profile order if present
                    const sortedCats = [...uniqueCats].sort((a, b) => {
                      if (!profile?.skillCategoryOrder) return 0;
                      const idxA = profile.skillCategoryOrder.indexOf(a);
                      const idxB = profile.skillCategoryOrder.indexOf(b);
                      if (idxA === -1 && idxB === -1) return 0;
                      if (idxA === -1) return 1;
                      if (idxB === -1) return -1;
                      return idxA - idxB;
                    });

                    const handleMove = async (index: number, direction: 'up' | 'down') => {
                      const newOrder = [...sortedCats];
                      const targetIndex = direction === 'up' ? index - 1 : index + 1;
                      if (targetIndex < 0 || targetIndex >= newOrder.length) return;
                      
                      // Swap
                      const temp = newOrder[index];
                      newOrder[index] = newOrder[targetIndex];
                      newOrder[targetIndex] = temp;

                      // Update profile
                      if (profile) {
                        try {
                          await updateProfile({
                            ...profile,
                            skillCategoryOrder: newOrder
                          });
                          showToast("Skill categories reordered successfully!", "success");
                        } catch (err) {
                          showToast("Failed to update category order.", "error");
                        }
                      }
                    };

                    return (
                      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#d4af37] flex items-center gap-1.5">
                              <Sliders size={12} />
                              Category Reordering Menu
                            </h4>
                            <p className="text-[10px] text-gray-400 mt-0.5">Reorders the categories displayed on the Home and About pages</p>
                          </div>
                          <span className="text-[10px] font-mono bg-white/5 border border-white/5 text-[#d4af37] px-2 py-0.5 rounded self-start">
                            {sortedCats.length} Categories
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                          {sortedCats.map((cat, idx) => (
                            <div key={cat} className="flex items-center justify-between bg-black/40 border border-white/5 rounded-lg p-2.5">
                              <span className="text-xs text-gray-200 font-semibold truncate pr-2">
                                <span className="font-mono text-[10px] text-gray-500 mr-1.5">{(idx + 1).toString().padStart(2, '0')}</span>
                                {cat}
                              </span>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={idx === 0}
                                  onClick={() => handleMove(idx, 'up')}
                                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-[#d4af37] disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer transition-colors"
                                  title="Move Category Up"
                                >
                                  <ArrowUp size={12} />
                                </button>
                                <button
                                  type="button"
                                  disabled={idx === sortedCats.length - 1}
                                  onClick={() => handleMove(idx, 'down')}
                                  className="p-1 rounded bg-white/5 hover:bg-white/10 text-gray-400 hover:text-[#d4af37] disabled:opacity-30 disabled:hover:text-gray-400 cursor-pointer transition-colors"
                                  title="Move Category Down"
                                >
                                  <ArrowDown size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}

                  {/* Dynamic Category Selector Tabs with Counters */}
                  {(() => {
                    const uniqueCats = Array.from(new Set(skills.map(s => s.category || "Technical"))).filter(Boolean);
                    const availableCategories = ["All", ...uniqueCats];
                    
                    return (
                      <div className="flex flex-wrap gap-2 py-2">
                        {availableCategories.map((cat) => {
                          const isActive = selectedSkillCategory === cat;
                          const count = cat === "All" ? skills.length : skills.filter(s => s.category === cat).length;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setSelectedSkillCategory(cat)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer flex items-center gap-1.5 ${
                                isActive
                                  ? "bg-[#d4af37] text-black border-[#d4af37] shadow-lg shadow-[#d4af37]/10"
                                  : "bg-white/5 text-gray-300 border-white/5 hover:bg-white/10"
                              }`}
                            >
                              <span>{cat}</span>
                              <span className={`px-1.5 py-0.25 rounded-full text-[10px] ${isActive ? "bg-black/25 text-black font-bold" : "bg-white/10 text-gray-400"}`}>
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    );
                  })()}

                  <div className="grid grid-cols-1 gap-4">
                    {skills
                      .filter(s => selectedSkillCategory === "All" || s.category === selectedSkillCategory)
                      .map((skill) => (
                        <div 
                          key={skill.id} 
                          className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] flex items-center justify-between gap-4"
                        >
                          {skill.icon && (
                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-[#d4af37] shrink-0">
                              {skill.iconType === "url" || skill.icon.startsWith("http") ? (
                                <img src={skill.icon} alt={skill.name} className="w-6 h-6 object-contain rounded" referrerPolicy="no-referrer" />
                              ) : (
                                React.createElement(skillIconMap[skill.icon] || Award, { size: 18 })
                              )}
                            </div>
                          )}
                          <div className="flex-1">
                            <div className="flex items-center justify-between max-w-sm mb-1.5">
                              <h4 className="text-sm font-semibold text-white">{skill.name}</h4>
                              <span className="text-xs text-[#d4af37] font-mono font-bold">
                                {skill.percentage}% {skill.hidePercentage && <span className="text-red-400 font-sans font-normal text-[10px] ml-1 bg-red-500/10 px-1 py-0.5 rounded">Bar Hidden</span>}
                              </span>
                            </div>
                            <span className="text-[9px] font-mono tracking-widest text-[#d4af37] bg-[#d4af37]/10 px-2 py-0.5 rounded uppercase">
                              {skill.category}
                            </span>
                            {skill.description && (
                              <p className="text-xs text-gray-400 mt-1 max-w-xl font-sans leading-relaxed whitespace-pre-line">
                                {skill.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              onClick={() => toggleHideEntity("skill", skill.id || "", !!skill.isHidden)}
                              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                                skill.isHidden 
                                  ? "text-gray-500 hover:text-white bg-white/5" 
                                  : "text-green-400 hover:text-green-300 bg-green-500/10"
                              }`}
                              title={skill.isHidden ? "Hidden - Click to Show" : "Visible - Click to Hide"}
                            >
                              {skill.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                            <button
                              onClick={() => openEditEntity("skill", skill.id || "", skill)}
                              className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteEntity("skill", skill.id || "")}
                              className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg cursor-pointer"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    {skills.filter(s => selectedSkillCategory === "All" || s.category === selectedSkillCategory).length === 0 && (
                      <div className="text-center py-8 text-xs text-gray-500 border border-dashed border-white/5 rounded-xl">
                        No skills found in the "{selectedSkillCategory}" category.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 8: TESTIMONIALS CRUD */}
              {activeTab === "testimonials" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <h3 className="text-lg font-serif font-semibold text-white">
                      Student & Client Endorsements
                    </h3>
                    <button
                      onClick={() => openAddEntity("testimonial", {})}
                      className="px-4 py-2 bg-[#d4af37] text-black text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg"
                    >
                      <Plus size={14} />
                      Add Testimonial
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {testimonials.map((t) => (
                      <div 
                        key={t.id} 
                        className="p-4 rounded-xl border border-white/5 bg-white/[0.01] hover:bg-white/[0.02] flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <img 
                            src={t.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150"} 
                            className="w-10 h-10 rounded-full object-cover border border-white/10"
                          />
                          <div>
                            <h4 className="text-sm font-semibold text-white">{t.author}</h4>
                            <p className="text-xs text-[#d4af37] font-mono">{t.role}</p>
                            <p className="text-xs text-gray-400 line-clamp-1 mt-1">"{t.text}"</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => toggleHideEntity("testimonial", t.id || "", !!t.isHidden)}
                            className={`p-2 rounded-lg cursor-pointer transition-colors ${
                              t.isHidden 
                                ? "text-gray-500 hover:text-white bg-white/5" 
                                : "text-green-400 hover:text-green-300 bg-green-500/10"
                            }`}
                            title={t.isHidden ? "Hidden - Click to Show" : "Visible - Click to Hide"}
                          >
                            {t.isHidden ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                          <button
                            onClick={() => openEditEntity("testimonial", t.id || "", t)}
                            className="p-2 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg cursor-pointer"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteEntity("testimonial", t.id || "")}
                            className="p-2 text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 rounded-lg cursor-pointer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "navigation" && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between border-b border-white/5 pb-4">
                    <div>
                      <h3 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
                        <List className="text-[#d4af37]" size={20} />
                        Site Navigation
                      </h3>
                      <p className="text-sm text-gray-400 mt-1">Reorder or hide the top navigation links for the public website.</p>
                    </div>
                    <button
                      onClick={() => updateProfile({ navConfig: localNavConfig }).then(() => showToast("Navigation settings saved!", "success"))}
                      className="px-4 py-2 bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-semibold rounded-xl hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2"
                    >
                      <Save size={16} />
                      Save Navigation
                    </button>
                  </div>
                  <div className="space-y-3">
                    {localNavConfig.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors">
                        <div className="flex items-center gap-4">
                          <span className={`font-medium ${item.isHidden ? "text-gray-500 line-through" : "text-white"}`}>
                            {item.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newConfig = [...localNavConfig];
                              newConfig[index].isHidden = !newConfig[index].isHidden;
                              setLocalNavConfig(newConfig);
                            }}
                            className={`p-2 rounded-lg ${item.isHidden ? "text-gray-400 hover:text-white bg-white/5" : "text-[#d4af37] hover:text-amber-400 bg-[#d4af37]/10"}`}
                            title={item.isHidden ? "Show on website" : "Hide from website"}
                          >
                            {item.isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                          
                          <div className="flex items-center border border-white/10 rounded-lg overflow-hidden ml-4">
                            <button
                              disabled={index === 0}
                              onClick={() => {
                                const newConfig = [...localNavConfig];
                                const temp = newConfig[index - 1];
                                newConfig[index - 1] = newConfig[index];
                                newConfig[index] = temp;
                                setLocalNavConfig(newConfig);
                              }}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowUp size={16} />
                            </button>
                            <div className="w-px h-4 bg-white/10" />
                            <button
                              disabled={index === localNavConfig.length - 1}
                              onClick={() => {
                                const newConfig = [...localNavConfig];
                                const temp = newConfig[index + 1];
                                newConfig[index + 1] = newConfig[index];
                                newConfig[index] = temp;
                                setLocalNavConfig(newConfig);
                              }}
                              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <ArrowDown size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 9: SYSTEM CONTROLS / RESEED */}
              {activeTab === "system" && (
                <div className="space-y-6">
                  <div className="border-b border-white/5 pb-4">
                    <h3 className="text-lg font-serif font-semibold text-white">
                      System Administrative Controls
                    </h3>
                    <p className="text-xs text-gray-400">
                      Advanced utilities to reset, re-seed, or manage deep database values securely.
                    </p>
                  </div>

                  <div className="p-6 rounded-2xl border border-red-500/20 bg-red-500/[0.02] space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-red-500/10 rounded-xl text-red-400">
                        <Database size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-white">Reset & Re-Seed Database Content</h4>
                        <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                          This operation will completely purge your current Firestore collections (profiles, projects, experiences, skills, testimonials, achievements, positions) and re-seed them with the exact real content extracted directly from your official website <strong>pradeepparmar.com</strong>.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-red-500/10 flex justify-end">
                      <button
                        type="button"
                        onClick={handleForceReset}
                        disabled={resetting}
                        className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-semibold text-xs tracking-wider uppercase transition-colors cursor-pointer flex items-center gap-1.5 shadow-lg"
                      >
                        {resetting ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Purging & Re-seeding...
                          </>
                        ) : (
                          <>
                            <Database size={12} />
                            Reset to pradeepparmar.com Defaults
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* QR Code Presentation Overlay */}
      <AnimatePresence>
        {qrProject && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl text-center space-y-6"
            >
              <button
                onClick={() => setQrProject(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer border-none"
              >
                ✕
              </button>

              <div className="space-y-1.5">
                <span className="text-[10px] font-mono tracking-widest text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-1 rounded-full uppercase border border-[#d4af37]/20 inline-block">
                  Student Registration Entry
                </span>
                <h3 className="text-lg font-serif font-semibold text-white pt-2 leading-snug">
                  {qrProject.title}
                </h3>
                <p className="text-xs text-gray-400">
                  Share this QR code or link so students can scan and register instantly.
                </p>
              </div>

              {/* QR Code container - high contrast white bg for phone camera readers */}
              <div className="mx-auto w-60 h-60 bg-white p-4 rounded-2xl shadow-xl flex items-center justify-center border-4 border-[#d4af37]/20">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                    `${window.location.origin}${window.location.pathname}?workshop=${qrProject.id}&v=${Date.now()}`
                  )}`}
                  alt="Workshop Registration QR Code"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-2 p-2 bg-black/40 border border-white/5 rounded-xl">
                  <input
                    type="text"
                    readOnly
                    value={`${window.location.origin}${window.location.pathname}?workshop=${qrProject.id}`}
                    className="flex-1 bg-transparent border-none text-[11px] text-gray-400 outline-none font-mono px-2"
                  />
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?workshop=${qrProject.id}`);
                      setCopiedQrUrl(true);
                      showToast("Invite link copied to clipboard!", "success");
                      setTimeout(() => setCopiedQrUrl(false), 2000);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#d4af37] hover:bg-amber-400 text-black text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all shrink-0 border-none"
                  >
                    {copiedQrUrl ? <Check size={12} /> : <Copy size={12} />}
                    {copiedQrUrl ? "Copied" : "Copy"}
                  </button>
                </div>

                <div className="flex gap-2.5 pt-1">
                  <a
                    href={`https://api.qrserver.com/v1/create-qr-code/?size=600x600&data=${encodeURIComponent(
                      `${window.location.origin}${window.location.pathname}?workshop=${qrProject.id}&v=${Date.now()}`
                    )}`}
                    download={`QR_${qrProject.title.replace(/\s+/g, "_")}.png`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs tracking-wide transition-all text-center block cursor-pointer"
                  >
                    Open Full Image
                  </a>
                  <button
                    onClick={() => setQrProject(null)}
                    className="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold text-xs tracking-wide hover:bg-gray-100 transition-all cursor-pointer border-none"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dynamic Toast Notifications */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm w-[calc(100vw-3rem)] sm:w-80 p-4 rounded-xl border border-white/10 bg-neutral-950/95 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 pointer-events-auto"
          >
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg shrink-0 ${
                toast.type === "success" 
                  ? "bg-green-500/10 text-green-400" 
                  : toast.type === "error" 
                    ? "bg-red-500/10 text-red-400" 
                    : "bg-[#d4af37]/10 text-[#d4af37]"
              }`}>
                {toast.type === "success" ? <ShieldCheck size={16} /> : <Info size={16} />}
              </div>
              <p className="text-xs text-white font-medium leading-normal">{toast.message}</p>
            </div>
            <button 
              onClick={() => setToast(null)}
              className="text-gray-400 hover:text-white p-1 rounded-md hover:bg-white/5 transition-colors text-xs shrink-0 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
