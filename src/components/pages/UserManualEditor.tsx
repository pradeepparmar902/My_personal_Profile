import React, { useState, useEffect } from "react";
import { useProfile } from "../../lib/ProfileContext";
import { BookText, Save, Check } from "lucide-react";

const availableManuals = [
  // Tabs
  { id: "profile", label: "Profile (Home Page) Tab" },
  { id: "about", label: "About Page Tab" },
  { id: "workshops", label: "Workshops Tab" },
  { id: "forms", label: "Registration Forms Tab" },
  { id: "store", label: "Store Tab" },
  { id: "experiences", label: "Career History Tab" },
  { id: "skills", label: "Capabilities Tab" },
  { id: "testimonials", label: "Student Reviews Tab" },
  { id: "achievements", label: "Achievements Tab" },
  { id: "affiliations", label: "Affiliations Tab" },
  { id: "inbox", label: "Contact Inbox Tab" },
  { id: "registrations", label: "Leads & Registrations Tab" },
  { id: "navigation", label: "Site Navigation Tab" },
  { id: "system", label: "System Controls Tab" },
  // Forms
  { id: "project", label: "Edit Workshop Form" },
  { id: "registration_form", label: "Edit Registration Form" },
  { id: "experience", label: "Edit Experience Form" },
  { id: "achievement", label: "Edit Achievement Form" },
  { id: "skill", label: "Edit Skill Form" },
  { id: "testimonial", label: "Edit Testimonial Form" },
  { id: "workshop_registration", label: "Edit Lead Form" },
  { id: "position", label: "Edit Position Form" },
  { id: "messages", label: "Edit Message Form" },
  { id: "position_type", label: "Edit Category Form" }
];

export default function UserManualEditor() {
  const { userManuals, updateEntity, addEntity } = useProfile();
  const [selectedId, setSelectedId] = useState<string>("profile");
  const [content, setContent] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const existing = userManuals?.find(m => m.id === selectedId);
    if (existing) {
      setContent(existing.content);
    } else {
      setContent("");
    }
    setSaved(false);
  }, [selectedId, userManuals]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const existing = userManuals?.find(m => m.id === selectedId);
      if (existing) {
        await updateEntity("user_manuals", selectedId, { content, updatedAt: new Date().toISOString() });
      } else {
        await updateEntity("user_manuals", selectedId, { id: selectedId, content, updatedAt: new Date().toISOString() }); // using updateEntity as a setDoc replacement if the ID matches
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
      alert("Error saving manual.");
    }
    setIsSaving(false);
  };

  return (
    <div className="mt-8 p-6 rounded-2xl border border-white/10 bg-black/40 space-y-5">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="p-2 bg-[#d4af37]/10 rounded-xl text-[#d4af37]">
          <BookText size={20} />
        </div>
        <div>
          <h3 className="text-lg font-serif font-semibold text-white">Dynamic User Manual Editor</h3>
          <p className="text-xs text-gray-400">Write custom Markdown instructions for the right-side Help Panel.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 ml-1">Select Section Context</label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50 appearance-none font-sans"
          >
            {availableManuals.map(m => (
              <option key={m.id} value={m.id} className="bg-zinc-900 text-white">
                {m.label} ({m.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-400 mb-1.5 ml-1">Manual Content (Markdown)</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write your custom instructions here... Use Markdown for bolding, bullet points, etc. If left empty, the system will fallback to the default text."
            className="w-full h-64 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-[#d4af37]/50 font-mono"
          />
        </div>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-semibold text-sm hover:opacity-90 transition-opacity flex items-center gap-2 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
          >
            {isSaving ? (
              <span className="animate-spin block w-4 h-4 border-2 border-black border-t-transparent rounded-full" />
            ) : saved ? (
              <>
                <Check size={16} /> Saved
              </>
            ) : (
              <>
                <Save size={16} /> Save Custom Manual
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
