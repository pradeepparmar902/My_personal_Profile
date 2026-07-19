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

    if (editingType === "achievement") {
      return (
        <div className="space-y-6">
          <Section title="Achievement" icon={<Sparkles size={16} className="text-[#d4af37]" />}>
            <p>You are editing a milestone or achievement to showcase your expertise.</p>
          </Section>
          <Section title="Important Fields" icon={<CheckCircle2 size={16} className="text-[#d4af37]" />}>
            <ul className="space-y-3">
              <li><strong className="text-white">Title:</strong> Name of the award, certification, or milestone.</li>
              <li><strong className="text-white">Category:</strong> Group similar achievements together.</li>
              <li><strong className="text-white">Cover Image:</strong> Visual proof (like a certificate or badge) increases trust significantly.</li>
            </ul>
          </Section>
        </div>
      );
    }

    if (editingType === "skill") {
      return (
        <div className="space-y-6">
          <Section title="Capability / Skill" icon={<Target size={16} className="text-[#d4af37]" />}>
            <p>Highlight specific tools, frameworks, or soft skills you master.</p>
          </Section>
          <Section title="Important Fields" icon={<CheckCircle2 size={16} className="text-[#d4af37]" />}>
            <ul className="space-y-3">
              <li><strong className="text-white">Name:</strong> Keep it concise (e.g., "React.js", "Public Speaking").</li>
              <li><strong className="text-white">Proficiency:</strong> Set a percentage (e.g., 95) to show a visual mastery bar.</li>
              <li><strong className="text-white">Icon:</strong> Choose an icon that visually represents this skill.</li>
            </ul>
          </Section>
        </div>
      );
    }

    if (editingType === "testimonial") {
      return (
        <div className="space-y-6">
          <Section title="Student Review" icon={<BookOpen size={16} className="text-[#d4af37]" />}>
            <p>Testimonials are the highest form of social proof. A strong testimonial can double your conversion rate.</p>
          </Section>
          <Section title="Important Fields" icon={<CheckCircle2 size={16} className="text-[#d4af37]" />}>
            <ul className="space-y-3">
              <li><strong className="text-white">Review Text:</strong> Keep it authentic. Highlight specific results they achieved.</li>
              <li><strong className="text-white">Author & Role:</strong> Giving the reviewer a title (e.g., "Software Engineer @ Google") adds massive weight.</li>
              <li><strong className="text-white">Avatar:</strong> Upload their photo if possible!</li>
            </ul>
          </Section>
        </div>
      );
    }

    if (editingType === "workshop_registration" || editingType === "workshop_registrations") {
      return (
        <div className="space-y-6">
          <Section title="Edit Lead / Registration" icon={<Sparkles size={16} className="text-[#d4af37]" />}>
            <p>You are manually modifying a lead's record in your CRM database.</p>
          </Section>
          <Section title="Usage Scenarios" icon={<Info size={16} className="text-[#d4af37]" />}>
            <ul className="space-y-3">
              <li><strong className="text-white">Status Updates:</strong> Change their status from "Waitlist Entry" to "Confirmed Entry" if they paid.</li>
              <li><strong className="text-white">Corrections:</strong> Fix a typo in their email or phone number if they entered it wrong.</li>
              <li><strong className="text-white">Internal Notes:</strong> Add context to the "Additional Info" field if you had a sales call with them.</li>
            </ul>
          </Section>
        </div>
      );
    }

    if (editingType === "position_type" || editingType === "project_category" || editingType === "achievement_category") {
      return (
        <div className="space-y-6">
          <Section title="Category Management" icon={<BookOpen size={16} className="text-[#d4af37]" />}>
            <p>You are editing a structural category used to group your content on the front-end.</p>
          </Section>
          <AlertBox>Changing the name of a category will automatically apply to all items currently in that category.</AlertBox>
        </div>
      );
    }

    if (editingType === "position") {
      return (
        <div className="space-y-6">
          <Section title="Affiliation / Position" icon={<Target size={16} className="text-[#d4af37]" />}>
            <p>You are editing a leadership role, community position, or brand affiliation.</p>
          </Section>
          <Section title="Fields" icon={<CheckCircle2 size={16} className="text-[#d4af37]" />}>
            <ul className="space-y-3">
              <li><strong className="text-white">Position Type:</strong> Grouping (e.g., "Board Member", "Volunteer").</li>
              <li><strong className="text-white">Organization:</strong> Name of the entity you are affiliated with.</li>
              <li><strong className="text-white">Role:</strong> Your specific title.</li>
            </ul>
          </Section>
        </div>
      );
    }

    if (editingType === "messages") {
      return (
        <div className="space-y-6">
          <Section title="Edit Contact Message" icon={<Info size={16} className="text-[#d4af37]" />}>
            <p>You are viewing or modifying a direct inquiry sent from your contact form.</p>
          </Section>
          <AlertBox>Usually, you only need to view this data or delete spam. Modifying it is rarely necessary unless adding internal notes.</AlertBox>
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
      case "about":
        return (
          <div className="space-y-6">
            <Section title="About Page Config" icon={<Info size={16} className="text-[#d4af37]" />}>
              <p>Customize your personal biography and background story.</p>
            </Section>
            <Section title="Tips" icon={<Sparkles size={16} className="text-[#d4af37]" />}>
              <ul className="space-y-3">
                <li><strong className="text-white">Biography:</strong> Use short paragraphs. A wall of text is hard to read.</li>
                <li><strong className="text-white">Images:</strong> Provide high-quality URLs for your profile and cover background.</li>
              </ul>
            </Section>
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
      case "store":
        return (
          <div className="space-y-6">
            <Section title="Store & Resources" icon={<BookOpen size={16} className="text-[#d4af37]" />}>
              <p>Manage digital products, PDFs, and downloadable assets.</p>
            </Section>
            <AlertBox>This section handles direct purchases and file deliveries. Make sure you set pricing and payment links correctly.</AlertBox>
          </div>
        );
      case "experiences":
        return (
          <div className="space-y-6">
            <Section title="Career History" icon={<Info size={16} className="text-[#d4af37]" />}>
              <p>Your timeline of professional roles.</p>
            </Section>
            <Section title="Management" icon={<CheckCircle2 size={16} className="text-[#d4af37]" />}>
              <p>Drag and drop items to reorder them on the timeline. Keep your most relevant and impressive roles near the top or mark them as current.</p>
            </Section>
          </div>
        );
      case "skills":
        return (
          <div className="space-y-6">
            <Section title="Capabilities / Skills" icon={<Target size={16} className="text-[#d4af37]" />}>
              <p>Your technical stack and core competencies.</p>
            </Section>
            <Section title="Strategy" icon={<Sparkles size={16} className="text-[#d4af37]" />}>
              <p>Don't list everything. List the high-value skills that your target audience or potential clients are actively looking for.</p>
            </Section>
          </div>
        );
      case "testimonials":
        return (
          <div className="space-y-6">
            <Section title="Student Reviews" icon={<Info size={16} className="text-[#d4af37]" />}>
              <p>Manage the social proof displayed on your site.</p>
            </Section>
            <Section title="Action" icon={<CheckCircle2 size={16} className="text-[#d4af37]" />}>
              <p>Add new reviews here as they come in. If someone sends you a WhatsApp message praising your workshop, ask them if you can feature it here!</p>
            </Section>
          </div>
        );
      case "achievements":
        return (
          <div className="space-y-6">
            <Section title="Achievements" icon={<Target size={16} className="text-[#d4af37]" />}>
              <p>Showcase milestones, awards, and certifications.</p>
            </Section>
            <Section title="Structure" icon={<CheckCircle2 size={16} className="text-[#d4af37]" />}>
              <p>First, create Categories (e.g., "Certifications", "Awards"), then add specific Achievements under those categories to keep them organized.</p>
            </Section>
          </div>
        );
      case "affiliations":
        return (
          <div className="space-y-6">
            <Section title="Affiliations & Positions" icon={<Sparkles size={16} className="text-[#d4af37]" />}>
              <p>Highlight your leadership roles, board positions, or community involvement.</p>
            </Section>
            <AlertBox>This adds a distinct layer of authority beyond just "jobs" (Career History) and shows you are active in the industry.</AlertBox>
          </div>
        );
      case "inbox":
        return (
          <div className="space-y-6">
            <Section title="Contact Inbox" icon={<Info size={16} className="text-[#d4af37]" />}>
              <p>A log of all direct messages sent through your website's main Contact page.</p>
            </Section>
            <Section title="Management" icon={<CheckCircle2 size={16} className="text-[#d4af37]" />}>
              <p>You can read messages and delete spam here. Remember to reply to these inquiries via your actual email client using the provided email address!</p>
            </Section>
          </div>
        );
      case "navigation":
        return (
          <div className="space-y-6">
            <Section title="Site Navigation" icon={<Target size={16} className="text-[#d4af37]" />}>
              <p>Control the main header navigation menu of your front-end website.</p>
            </Section>
            <AlertBox>You can drag to reorder the tabs, or click the eye icon to completely hide a tab from the public while you work on it.</AlertBox>
          </div>
        );
      case "system":
        return (
          <div className="space-y-6">
            <Section title="System Controls" icon={<Info size={16} className="text-[#d4af37]" />}>
              <p>Advanced administrative functions.</p>
            </Section>
            <Section title="DANGER ZONE" icon={<AlertCircle size={16} className="text-amber-400" />}>
              <ul className="space-y-3">
                <li><strong className="text-white">Master Reset:</strong> Will WIPE your current data and replace it with dummy data. Do not click unless you are testing!</li>
                <li><strong className="text-white">Export:</strong> Generates a full JSON backup of everything. Do this regularly!</li>
              </ul>
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
