import React from "react";
import { useProfile } from "../../lib/ProfileContext";
import { Youtube, Instagram, Linkedin, Mail, Settings, Sparkles } from "lucide-react";

interface FooterProps {
  setCurrentTab: (tab: string) => void;
}

export default function Footer({ setCurrentTab }: FooterProps) {
  const { profile } = useProfile();
  
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-24 border-t border-white/10 bg-black/60 backdrop-blur-md pt-12 pb-8 px-4 md:px-8">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-white/5">
        {/* Brand */}
        <div className="text-center md:text-left">
          <h3 className="font-serif text-xl font-semibold tracking-wide text-white">
            {profile?.name || "Pradeep Parmar"}
          </h3>
          <p className="text-[#d4af37] text-xs font-mono uppercase tracking-widest mt-1">
            {profile?.title || "NLP Master Practitioner & Corporate Trainer"}
          </p>
        </div>

        {/* Social Navigation Links */}
        <div className="flex items-center gap-4">
          {profile?.youtube && (
            <a
              href={profile.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-[#ff0000] hover:border-[#ff0000]/40 transition-all hover:scale-110"
              title="YouTube"
            >
              <Youtube size={18} />
            </a>
          )}
          {profile?.instagram && (
            <a
              href={profile.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-[#e1306c] hover:border-[#e1306c]/40 transition-all hover:scale-110"
              title="Instagram"
            >
              <Instagram size={18} />
            </a>
          )}
          {profile?.linkedin && (
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-[#0077b5] hover:border-[#0077b5]/40 transition-all hover:scale-110"
              title="LinkedIn"
            >
              <Linkedin size={18} />
            </a>
          )}
          {profile?.email && (
            <a
              href={`mailto:${profile.email}`}
              className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-white/5 text-gray-400 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-all hover:scale-110"
              title="Email"
            >
              <Mail size={18} />
            </a>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 pt-6 text-xs text-gray-500 font-mono">
        <div>
          &copy; {currentYear} {profile?.name || "Pradeep Parmar"}. All rights reserved.
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              setCurrentTab("admin");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-[#d4af37]/10 hover:text-[#d4af37] hover:border-[#d4af37]/20 transition-all cursor-pointer"
          >
            <Settings size={12} />
            Manage Content
          </button>
        </div>
      </div>
    </footer>
  );
}
