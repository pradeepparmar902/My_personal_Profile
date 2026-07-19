import React from "react";
import { X, BookOpen, Info, Target, Sparkles, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HelpManualPanelProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  editingType: string | null;
}

export default function HelpManualPanel({ isOpen, onClose, activeTab, editingType }: HelpManualPanelProps) {
  
  const getContextualContent = () => {
    // FORM EDITING CONTEXTS
    if (editingType === "project") {
      return (
        <div className="space-y-6">
          <Section title="Adding a Workshop / Course" icon={<BookOpen size={16} className="text-[#d4af37]" />}>
            <p>You are currently creating or editing a Workshop/Course. This will appear in your <strong>Workshops Portfolio</strong>.</p>
          </Section>
          <Section title="Key Fields & Best Practices" icon={<Target size={16} className="text-[#d4af37]" />}>
            <ul className="space-y-3">
              <li><strong className="text-white">Title:</strong> Keep it punchy and outcome-driven (e.g., "Master SQL in 30 Days").</li>
              <li><strong className="text-white">Overview:</strong> The hook! Explain exactly what the student will achieve.</li>
              <li><strong className="text-white">Stats (Metric/Value):</strong> Use numbers! (e.g., Metric: "Students Taught", Value: "500+").</li>
              <li><strong className="text-white">Cover Image:</strong> Use a high-quality 16:9 ratio image URL.</li>
            </ul>
          </Section>
          <AlertBox>Ensure you categorize this workshop correctly so it appears in the right filters on the front-end!</AlertBox>
        </div>
      );
    }
    
    if (editingType === "registration_form") {
      return (
        <div className="space-y-6">
          <Section title="Registration Forms Builder" icon={<Sparkles size={16} className="text-[#d4af37]" />}>
            <p>You are building a custom Registration or Lead Capture form. These are highly dynamic and will adapt based on the fields you add.</p>
          </Section>
          <Section title="Form Setup" icon={<Target size={16} className="text-[#d4af37]" />}>
            <ul className="space-y-3">
              <li><strong className="text-white">Title:</strong> Name of the form (e.g., "VIP Coaching Application").</li>
              <li><strong className="text-white">Form Fields:</strong> You can add text inputs, dropdowns, and checkboxes. Check the "Required" box if they MUST answer it.</li>
              <li><strong className="text-white">Payment Link:</strong> Add a Razorpay URL here, and students will be prompted to pay immediately after submitting!</li>
            </ul>
          </Section>
        </div>
      );
    }
    
    if (editingType === "experience") {
      return (
        <div className="space-y-6">
          <Section title="Career History" icon={<Info size={16} className="text-[#d4af37]" />}>
            <p>You are editing your professional career timeline. This builds immense credibility for your workshops.</p>
          </Section>
          <Section title="Important Fields" icon={<CheckCircle2 size={16} className="text-[#d4af37]" />}>
            <ul className="space-y-3">
              <li><strong className="text-white">Role & Company:</strong> Be specific. "Lead Data Analyst" is better than "Analyst".</li>
              <li><strong className="text-white">Duration:</strong> Enter "Present" if you currently work there.</li>
              <li><strong className="text-white">Highlights:</strong> Use the plus button to add key achievements. E.g., "Scaled database architecture to handle 1M+ queries."</li>
            </ul>
          </Section>
        </div>
      );
    }

    // TAB CONTEXTS (When not editing a specific item)
    switch (activeTab) {
      case "profile":
        return (
          <div className="space-y-6">
            <Section title="Home Page Settings" icon={<BookOpen size={16} className="text-[#d4af37]" />}>
              <p>This is your global configuration center. Changes here affect the very first impression visitors get.</p>
            </Section>
            <Section title="What to update here:" icon={<Target size={16} className="text-[#d4af37]" />}>
              <ul className="space-y-3">
                <li><strong className="text-white">Hero Name & Taglines:</strong> The massive 3D text on your home screen.</li>
                <li><strong className="text-white">Social Links:</strong> Where your footer icons point to.</li>
                <li><strong className="text-white">Site Navigation:</strong> Hide or reorder the tabs (Home, About, Workshops) on the front-end!</li>
              </ul>
            </Section>
            <AlertBox>Any changes here save instantly when you click the "Save Profile Configurations" button at the very bottom.</AlertBox>
          </div>
        );
      case "registrations":
        return (
          <div className="space-y-6">
            <Section title="Leads & Registrations" icon={<Sparkles size={16} className="text-[#d4af37]" />}>
              <p>Your central CRM! Every single person who fills out a form, registers for a workshop, or contacts you ends up here.</p>
            </Section>
            <Section title="Features" icon={<CheckCircle2 size={16} className="text-[#d4af37]" />}>
              <ul className="space-y-3">
                <li><strong className="text-white">Dashboard:</strong> See your top-performing campaigns instantly.</li>
                <li><strong className="text-white">Filtering:</strong> Click the filter icons on the column headers to sort by specific workshops or lead sources.</li>
                <li><strong className="text-white">Excel Export:</strong> Click the Yellow Export button to download all leads as a CSV for email marketing.</li>
              </ul>
            </Section>
          </div>
        );
      case "workshops":
        return (
          <div className="space-y-6">
            <Section title="Workshops Management" icon={<BookOpen size={16} className="text-[#d4af37]" />}>
              <p>Create and manage the primary products you offer. This populates your front-end "Workshops" page.</p>
            </Section>
            <Section title="Pro Tips" icon={<Sparkles size={16} className="text-[#d4af37]" />}>
              <ul className="space-y-3">
                <li>Click <strong>Add New Workshop</strong> to start building.</li>
                <li>Use the <strong>Eye Icon</strong> to hide a workshop temporarily without deleting it!</li>
                <li>Reorder workshops by dragging them if you want a specific one to appear first.</li>
              </ul>
            </Section>
          </div>
        );
      case "forms":
        return (
          <div className="space-y-6">
            <Section title="Custom Forms" icon={<Info size={16} className="text-[#d4af37]" />}>
              <p>Build dynamic lead-capture forms. You can share direct links to these forms in your marketing campaigns.</p>
            </Section>
            <Section title="QR Codes & Links" icon={<Target size={16} className="text-[#d4af37]" />}>
              <p>Once you create a form, click the <strong>"Settings / Share"</strong> button on it to get a custom QR Code and a direct URL to send to students.</p>
            </Section>
          </div>
        );
      default:
        return (
          <div className="space-y-6">
            <Section title="Admin Dashboard" icon={<Sparkles size={16} className="text-[#d4af37]" />}>
              <p>Welcome to your Luxury 3D Sandbox Admin Panel. Navigate using the left sidebar to manage different aspects of your platform.</p>
              <p className="mt-4">Click into any specific tab or hit "Edit" on an item to see contextual help appear here!</p>
            </Section>
          </div>
        );
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay for mobile to close */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] lg:hidden"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-screen w-full max-w-[340px] bg-[#0a0a0a]/95 backdrop-blur-2xl border-l border-white/10 z-[100] flex flex-col shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-white/10 bg-gradient-to-r from-transparent to-[#d4af37]/5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 flex items-center justify-center">
                  <BookOpen size={14} className="text-[#d4af37]" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white font-serif tracking-wide">User Manual</h2>
                  <p className="text-[9px] text-[#d4af37] uppercase tracking-widest font-mono">Contextual Help</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 custom-scrollbar text-sm text-gray-400">
              {getContextualContent()}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-white/5 bg-black/50 text-center">
              <p className="text-[10px] text-gray-500 font-mono tracking-wider">LEARN. LEAD. SUCCEED.</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Helper UI Components for the Manual
function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 border-b border-white/5 pb-2">
        {icon}
        <h3 className="text-sm font-semibold text-white tracking-wide">{title}</h3>
      </div>
      <div className="leading-relaxed text-[13px]">
        {children}
      </div>
    </div>
  );
}

function AlertBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 p-4 rounded-xl border border-amber-500/30 bg-amber-500/10 flex gap-3 text-amber-200 text-xs leading-relaxed">
      <AlertCircle size={16} className="text-amber-400 shrink-0 mt-0.5" />
      <div>{children}</div>
    </div>
  );
}
