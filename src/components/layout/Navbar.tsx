import React, { useState } from "react";
import { useProfile } from "../../lib/ProfileContext";
import { Menu, X, ShieldAlert, Sparkles } from "lucide-react";

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export default function Navbar({ currentTab, setCurrentTab }: NavbarProps) {
  const { profile, isAdmin } = useProfile();
  const [isOpen, setIsOpen] = useState(false);

  const defaultNavItems = [
    { id: "home", label: "Home", isHidden: false },
    { id: "about", label: "About", isHidden: false },
    { id: "portfolio", label: "Workshops", isHidden: false },
    { id: "contact", label: "Contact", isHidden: false },
  ];

  const navItems = profile?.navConfig?.length 
    ? profile.navConfig.filter(item => !item.isHidden)
    : defaultNavItems;

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-4 py-4 md:px-8">
      <div className="max-w-7xl mx-auto flex items-center justify-between rounded-full border border-white/10 bg-black/40 backdrop-blur-md px-6 py-3 shadow-2xl">
        {/* Brand / Logo */}
        <button
          onClick={() => handleNavClick("home")}
          className="flex items-center gap-2 group cursor-pointer text-left focus:outline-none"
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-full border border-[#d4af37]/40 bg-gradient-to-br from-[#d4af37]/20 to-[#8a6d1c]/20 overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.2)] group-hover:shadow-[0_0_20px_rgba(212,175,55,0.4)] transition-all">
            <img 
              src={(profile?.logoUrl && profile.logoUrl.trim().length > 0) ? profile.logoUrl : "./logo.png"} 
              alt="Logo" 
              className="w-full h-full object-cover" 
              onError={(e) => {
                e.currentTarget.style.display = 'none';
                if (e.currentTarget.nextElementSibling) {
                  e.currentTarget.nextElementSibling.classList.remove('hidden');
                }
              }} 
            />
            <span className="hidden font-serif font-semibold text-lg text-[#d4af37]">PP</span>
            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div>
            <span className="block font-semibold tracking-wide text-white text-sm md:text-base group-hover:text-[#d4af37] transition-colors">
              {profile?.name || "Pradeep Parmar"}
            </span>
            <span className="block text-[10px] text-[#d4af37]/80 uppercase tracking-widest font-mono">
              Learn. Lead. Succeed.
            </span>
          </div>
        </button>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`px-4 py-2 text-sm font-medium tracking-wide rounded-full transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "text-black bg-gradient-to-r from-[#d4af37] to-amber-500 shadow-[0_0_15px_rgba(212,175,55,0.3)]"
                    : "text-gray-300 hover:text-white hover:bg-white/5"
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {isAdmin && (
            <button
              onClick={() => handleNavClick("admin")}
              className={`flex items-center gap-1.5 ml-2 px-4 py-2 text-sm font-semibold tracking-wide rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] hover:bg-[#d4af37]/20 transition-all cursor-pointer ${
                currentTab === "admin" ? "ring-2 ring-[#d4af37]" : ""
              }`}
            >
              <ShieldAlert size={14} />
              Admin
            </button>
          )}
        </div>

        {/* Mobile Nav Button */}
        <div className="md:hidden flex items-center gap-2">
          {isAdmin && (
            <button
              onClick={() => handleNavClick("admin")}
              className="p-2 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]"
            >
              <ShieldAlert size={16} />
            </button>
          )}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 rounded-full border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden mt-3 mx-2 rounded-3xl border border-white/10 bg-black/95 backdrop-blur-lg p-5 shadow-2xl animate-in fade-in slide-in-from-top-5 duration-200">
          <div className="flex flex-col gap-2">
            {navItems.map((item) => {
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full text-left px-5 py-3 rounded-2xl text-base font-medium transition-all ${
                    isActive
                      ? "text-black bg-gradient-to-r from-[#d4af37] to-amber-500 font-semibold"
                      : "text-gray-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
            
            {isAdmin && (
              <button
                onClick={() => handleNavClick("admin")}
                className="w-full text-left px-5 py-3 rounded-2xl text-base font-semibold border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37] flex items-center gap-2"
              >
                <ShieldAlert size={18} />
                Access Dashboard
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
