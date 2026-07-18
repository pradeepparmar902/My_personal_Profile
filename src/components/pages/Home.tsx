import React, { useState, useEffect } from "react";
import { useProfile } from "../../lib/ProfileContext";
import { cleanGoogleDriveUrl } from "../../lib/imageUtils";
import ScrollReveal from "../ui/ScrollReveal";
import { motion } from "motion/react";
import TiltCard from "../ui/TiltCard";
import SectionHeading from "../ui/SectionHeading";
import { 
  ArrowRight, 
  Sparkles, 
  Play, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  Laptop, 
  FileSpreadsheet, 
  Brain, 
  Shield, 
  Heart, 
  Briefcase, 
  Maximize2, 
  X, 
  ExternalLink,
  User,
  BookOpen,
  Database,
  BarChart2,
  Cpu,
  TrendingUp,
  Users,
  Award,
  Zap,
  Globe,
  Flame,
  Activity,
  Trophy,
  Target,
  LayoutGrid,
  Search,
  Download,
  Filter
} from "lucide-react";

// Icon mapper for dynamic categories
const iconMap: { [key: string]: any } = {
  Laptop: Laptop,
  FileSpreadsheet: FileSpreadsheet,
  Brain: Brain,
  Shield: Shield,
  Heart: Heart,
  Briefcase: Briefcase,
  BarChart2: BarChart2,
  Database: Database,
  Cpu: Cpu,
  Trophy: Trophy,
  Target: Target,
  Award: Award,
  TrendingUp: TrendingUp,
  Sparkles: Sparkles,
  Users: Users,
  BookOpen: BookOpen,
  Zap: Zap,
  Globe: Globe,
  Flame: Flame,
  Activity: Activity
};

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
  Award
};

interface HomeProps {
  setCurrentTab: (tab: string) => void;
}

export default function Home({ setCurrentTab }: HomeProps) {
  const { 
    profile, 
    projects, 
    testimonials, 
    achievementCategories, 
    achievements, 
    positions, 
    positionTypes,
    skills
  } = useProfile();

  const handleScheduleConsultation = () => {
    if (profile?.featuredWorkshopId) {
      window.history.pushState({}, "", "?workshop=" + profile.featuredWorkshopId);
      setCurrentTab("portfolio"); // Navigate to Workshops page
      // Force a scroll to top so the modal is visible
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setCurrentTab("contact");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Filter hidden entities for public view
  const visibleProjects = projects.filter(p => !p.isHidden);
  const visibleTestimonials = testimonials.filter(t => !t.isHidden);
  const visibleAchievements = achievements.filter(a => !a.isHidden);
  const visiblePositions = positions.filter(p => !p.isHidden);
  const visibleCategories = achievementCategories.filter(c => !c.isHidden && visibleAchievements.some(a => a.categoryId === c.id));
  const visibleSkills = (skills || []).filter(s => !s.isHidden);

  // Sort skill categories based on profile?.skillCategoryOrder
  const rawSkillCats = Array.from(new Set(visibleSkills.map(s => s.category || "Technical")));
  const sortedSkillCats = [...rawSkillCats].sort((a, b) => {
    if (!profile?.skillCategoryOrder) return 0;
    const idxA = profile.skillCategoryOrder.indexOf(a);
    const idxB = profile.skillCategoryOrder.indexOf(b);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  // Testimonials state
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  
  // Achievements state
  const [activeCatId, setActiveCatId] = useState("");
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [achievementsViewMode, setAchievementsViewMode] = useState<"grid" | "excel">("grid");
  const [excelSearchQuery, setExcelSearchQuery] = useState("");
  const [selectedCell, setSelectedCell] = useState<{ rowIdx: number; colIdx: number } | null>(null);

  // Positions Excel state
  const [positionsViewMode, setPositionsViewMode] = useState<"grid" | "excel">("grid");
  const [positionsExcelSearchQuery, setPositionsExcelSearchQuery] = useState("");
  const [positionsSelectedCell, setPositionsSelectedCell] = useState<{ rowIdx: number; colIdx: number } | null>(null);

  const excelFilteredPositions = visiblePositions.filter(p => {
    const orgType = positionTypes.find(t => t.id === p.typeId)?.name || "";
    const searchLower = positionsExcelSearchQuery.toLowerCase();
    return (
      (p.position || "").toLowerCase().includes(searchLower) ||
      (p.organization || "").toLowerCase().includes(searchLower) ||
      (p.about || "").toLowerCase().includes(searchLower) ||
      (p.period || "").toLowerCase().includes(searchLower) ||
      orgType.toLowerCase().includes(searchLower)
    );
  });

  const handleExportPositionsCSV = () => {
    const headers = ["Organization Type", "Role/Position", "Organization", "Period/Years", "About Description", "URL"];
    const rows = visiblePositions.map(p => {
      const orgType = positionTypes.find(t => t.id === p.typeId)?.name || "Other";
      return [
        orgType,
        p.position || "",
        p.organization || "",
        p.period || "",
        p.about || "",
        p.url || ""
      ].map(field => `"${field.replace(/"/g, '""')}"`).join(",");
    });
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Leadership_and_Affiliations.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSelectedPositionCellValue = () => {
    if (!positionsSelectedCell) return "";
    const item = excelFilteredPositions[positionsSelectedCell.rowIdx];
    if (!item) return "";
    switch (positionsSelectedCell.colIdx) {
      case 0: return positionTypes.find(t => t.id === item.typeId)?.name || "Other";
      case 1: return item.position || "";
      case 2: return item.organization || "";
      case 3: return item.period || "";
      case 4: return item.about || "";
      case 5: return item.url || "N/A";
      default: return "";
    }
  };

  const excelFilteredAchievements = visibleAchievements.filter(a => {
    const catName = achievementCategories.find(c => c.id === a.categoryId)?.name || "";
    const searchLower = excelSearchQuery.toLowerCase();
    return (
      (a.title || "").toLowerCase().includes(searchLower) ||
      (a.narrative || "").toLowerCase().includes(searchLower) ||
      catName.toLowerCase().includes(searchLower)
    );
  });

  const handleExportCSV = () => {
    const headers = ["Category", "Milestone Title", "Narrative / Description", "Cover Image URL", "Launch/Demo Link"];
    const rows = visibleAchievements.map(a => {
      const catName = achievementCategories.find(c => c.id === a.categoryId)?.name || "Other";
      return [
        catName,
        a.title || "",
        a.narrative || "",
        a.coverImage || "",
        a.link || ""
      ].map(field => `"${field.replace(/"/g, '""')}"`).join(",");
    });
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "Milestones_and_Achievements.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getSelectedCellValue = () => {
    if (!selectedCell) return "";
    const item = excelFilteredAchievements[selectedCell.rowIdx];
    if (!item) return "";
    switch (selectedCell.colIdx) {
      case 0: return achievementCategories.find(c => c.id === item.categoryId)?.name || "Other";
      case 1: return item.title || "";
      case 2: return item.narrative || "";
      case 3: return item.link || "N/A";
      case 4: return item.coverImage || "N/A";
      case 5: return (item.gallery || []).join(", ");
      default: return "";
    }
  };

  // Auto-set first category
  useEffect(() => {
    if (visibleCategories.length > 0 && !activeCatId) {
      setActiveCatId(visibleCategories[0].id || "");
    }
  }, [visibleCategories]);

  // Auto-play testimonials
  useEffect(() => {
    if (visibleTestimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % visibleTestimonials.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [visibleTestimonials]);

  const handleNextTestimonial = () => {
    setActiveTestimonial((prev) => (prev + 1) % visibleTestimonials.length);
  };

  const handlePrevTestimonial = () => {
    setActiveTestimonial((prev) => (prev - 1 + visibleTestimonials.length) % visibleTestimonials.length);
  };

  const activeCategory = visibleCategories.find(c => c.id === activeCatId);
  const filteredAchievements = visibleAchievements.filter(a => a.categoryId === activeCatId);

  return (
    <div className="pt-24 md:pt-32 space-y-24">
      {/* 1. Immersive Hero Section */}
      <section className="relative px-4 md:px-8 max-w-7xl mx-auto min-h-[85vh] flex flex-col justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Text Column */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left flex flex-col items-center lg:items-start">

            <ScrollReveal direction="down" delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-full">
                <Sparkles size={14} className="text-[#d4af37] animate-pulse" />
                <span className="text-xs font-mono font-medium text-[#d4af37] tracking-widest uppercase">
                  {profile?.badge || "NLP Practitioner & Corporate Leader"}
                </span>
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.2}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-bold text-white leading-tight">
                {profile?.tagline ? (
                  profile.tagline.includes(".") ? (
                    (() => {
                      const parts = profile.tagline.split(".");
                      if (parts.length >= 3) {
                        return (
                          <>
                            {parts[0]}. {parts[1]}.<br />
                            <span className="bg-gradient-to-r from-[#d4af37] via-amber-500 to-[#d4af37] bg-clip-text text-transparent">
                              {parts[2] || "Succeed"}
                            </span>
                          </>
                        );
                      }
                      return profile.tagline;
                    })()
                  ) : (
                    profile.tagline
                  )
                ) : (
                  <>
                    Learn. Lead.<br />
                    <span className="bg-gradient-to-r from-[#d4af37] via-amber-500 to-[#d4af37] bg-clip-text text-transparent">
                      Succeed.
                    </span>
                  </>
                )}
              </h1>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.3}>
              <div className="max-w-xl mx-auto lg:mx-0">
                {(() => {
                  const text = profile?.heroDescription || profile?.bio || "Over the last decade, I have guided thousands of professionals, corporate leaders, and students to unlock their ultimate mental potential, master advanced technical tools, and live with conscious purpose.";
                  const paragraphs = text.split(/\r?\n/);
                  return paragraphs.map((para, paraIdx) => {
                    if (!para.trim()) {
                      return <div key={paraIdx} className="h-3" />;
                    }
                    const parts = para.split(/(\*\*.*?\*\*)/g);
                    return (
                      <p key={paraIdx} className="text-gray-300 text-base md:text-lg leading-relaxed font-sans mb-4 last:mb-0">
                        {parts.map((part, partIdxPart) => {
                          if (part.startsWith("**") && part.endsWith("**")) {
                            return (
                              <strong key={partIdxPart} className="font-bold text-white">
                                {part.slice(2, -2)}
                              </strong>
                            );
                          }
                          return part;
                        })}
                      </p>
                    );
                  });
                })()}
              </div>
            </ScrollReveal>

            <ScrollReveal direction="up" delay={0.4}>
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <button
                  onClick={() => setCurrentTab("portfolio")}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-semibold tracking-wide rounded-full shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  Explore Workshops
                  <ArrowRight size={18} />
                </button>
                <button
                  onClick={handleScheduleConsultation}
                  className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white font-medium tracking-wide rounded-full border border-white/10 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {profile?.consultationButtonText || "Schedule Consultation"}
                </button>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Image Spotlight Column */}
          <div className="lg:col-span-5 flex justify-center">
            <ScrollReveal direction="left" delay={0.3}>
              <div className="relative group">
                {/* Spotlight Backdrop Glow */}
                <div className="absolute -inset-4 bg-gradient-to-br from-[#d4af37]/20 to-amber-500/20 rounded-full blur-2xl opacity-75 group-hover:opacity-100 transition-opacity duration-500" />
                
                {/* Luxury Circular Frame */}
                <div className="relative w-72 h-72 sm:w-85 sm:h-85 rounded-full border-2 border-[#d4af37]/30 bg-black/60 p-4 shadow-[0_0_40px_rgba(0,0,0,0.8)] flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-[#d4af37]/5 to-transparent rounded-full" />
                  
                  {/* Portrait headshot cutout */}
                  <img
                    src={cleanGoogleDriveUrl(profile?.avatarUrl) || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop"}
                    alt={profile?.name || "Pradeep Parmar"}
                    className="w-full h-full object-cover rounded-full"
                    referrerPolicy="no-referrer"
                  />
                  
                  {/* Outer Orbit Light Arc */}
                  <div className="absolute inset-2 border border-white/10 rounded-full pointer-events-none" />
                </div>

                {/* Floating Badge */}
                <button 
                  onClick={handleScheduleConsultation}
                  className="absolute -bottom-2 -right-2 bg-gradient-to-r from-neutral-900 to-black border border-[#d4af37]/30 px-4 py-2.5 rounded-2xl flex items-center gap-2 shadow-xl hover:scale-105 hover:border-[#d4af37]/60 transition-all cursor-pointer group/btn"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse group-hover/btn:bg-green-400" />
                  <span className="text-xs font-mono font-medium text-white tracking-wider group-hover/btn:text-[#d4af37] transition-colors">
                    Booking Sessions
                  </span>
                </button>
              </div>
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* 2. Glassmorphism Statistics Row */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {(profile?.stats || [
              { label: "Workshops Delivered", value: "250+" },
              { label: "Learners Trained", value: "15,000+" },
              { label: "Corporate Clients", value: "40+" },
              { label: "Years Experience", value: "10+" }
            ]).map((stat, idx) => (
              <div 
                key={idx} 
                className="rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] backdrop-blur-md p-5 text-center transition-colors"
              >
                <div className="text-2xl sm:text-3xl font-bold tracking-tight bg-gradient-to-r from-[#d4af37] to-amber-400 bg-clip-text text-transparent mb-1 font-mono">
                  {stat.value}
                </div>
                <div className="text-xs text-gray-400 tracking-wider font-mono uppercase">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </section>

      {/* 2.5 Dynamic Skills & Core Capabilities Section */}
      {visibleSkills.length > 0 && (
        <section className="px-4 md:px-8 max-w-7xl mx-auto space-y-10">
          <SectionHeading
            title="Skills & Expertise"
            subtitle="Explore my dynamic competencies in enterprise technology architecture and behavioral peak performance."
            badge="Expertise"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {sortedSkillCats.map((cat, catIdx) => {
              const catSkills = visibleSkills.filter(s => s.category === cat);
              return (
                <ScrollReveal key={cat} delay={catIdx * 0.1}>
                  <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent hover:border-[#d4af37]/30 transition-all duration-300 p-6 md:p-8 flex flex-col justify-between h-full shadow-xl shadow-black/50 group">
                    <div>
                      <div className="flex items-center gap-3.5 pb-5 mb-6 border-b border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30 font-mono text-sm font-bold shadow-md shadow-[#d4af37]/5">
                          {String(catIdx + 1).padStart(2, '0')}
                        </div>
                        <h3 className="text-lg sm:text-xl font-serif font-semibold text-white tracking-wide uppercase">
                          {cat} Skills
                        </h3>
                      </div>

                      <div className="space-y-6">
                        {catSkills.map((skill) => (
                          <div key={skill.id || skill.name} className="space-y-2.5">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3">
                                {skill.icon && (
                                  <div className="w-9 h-9 rounded-lg bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] shrink-0 shadow-sm shadow-[#d4af37]/5">
                                    {skill.iconType === "url" || skill.icon.startsWith("http") ? (
                                      <img src={skill.icon} alt={skill.name} className="w-5 h-5 object-contain rounded" referrerPolicy="no-referrer" />
                                    ) : (
                                      React.createElement(skillIconMap[skill.icon] || Award, { size: 18 })
                                    )}
                                  </div>
                                )}
                                <span className="text-sm sm:text-base font-semibold text-gray-100 tracking-wide group-hover:text-white transition-colors">{skill.name}</span>
                              </div>
                              {!skill.hidePercentage && (
                                <span className="text-xs sm:text-sm text-[#d4af37] font-mono font-bold bg-[#d4af37]/10 border border-[#d4af37]/20 px-2 py-0.5 rounded-md">{skill.percentage}%</span>
                              )}
                            </div>
                            
                            {/* Bar */}
                            {!skill.hidePercentage && (
                              <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  whileInView={{ width: `${skill.percentage}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 1.2, ease: "easeOut" }}
                                  className="h-full bg-gradient-to-r from-[#d4af37] via-amber-400 to-[#d4af37] rounded-full"
                                />
                              </div>
                            )}
                            
                            {skill.description && (
                              <p className={`text-xs sm:text-sm text-gray-400 font-sans leading-relaxed whitespace-pre-line ${skill.icon ? 'pl-12' : 'pl-0'}`}>
                                {skill.description}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </ScrollReveal>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Featured Workshops / Projects Section */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto">
        <SectionHeading 
          title="Featured Workshops" 
          subtitle="Empower your technical expertise and professional mindset with certified seminars delivered live." 
          badge="Signature Programs"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {visibleProjects.slice(0, 3).map((project, idx) => (
            <ScrollReveal key={project.id || idx} delay={idx * 0.1}>
              <TiltCard className="h-full flex flex-col justify-between">
                <div>
                  <div className="relative h-48 w-full rounded-xl overflow-hidden mb-5">
                    <img
                      src={cleanGoogleDriveUrl(project.coverImage) || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop"}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-mono tracking-wider bg-black/80 border border-[#d4af37]/30 text-[#d4af37] uppercase">
                      {project.category}
                    </div>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2 leading-snug">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-400 text-sm leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {project.allowRegistration && project.workshopDate && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-amber-400 font-mono">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Next Live Batch: {project.workshopDate}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <button 
                    onClick={() => setCurrentTab("portfolio")}
                    className="text-xs font-semibold text-[#d4af37] hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    View Details
                    <ArrowRight size={12} />
                  </button>
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all flex items-center gap-1.5"
                    >
                      Learn More
                      <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </TiltCard>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 4. Dynamic Achievements Section with Gallery & Lightbox & Excel Spreadsheet View */}
      <section className={`px-4 md:px-8 mx-auto transition-all duration-300 ${achievementsViewMode === "excel" ? "max-w-none xl:px-12 w-full" : "max-w-7xl"}`}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <SectionHeading
              title="Milestones & Achievements"
              subtitle="Explore high-impact projects, technological contributions, and interactive mind hacks."
              badge="Track Record"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-neutral-900 border border-white/10 p-1 rounded-xl shrink-0">
            <button
              onClick={() => {
                setAchievementsViewMode("grid");
                setSelectedCell(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                achievementsViewMode === "grid"
                  ? "bg-gradient-to-r from-[#d4af37] to-amber-500 text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <LayoutGrid size={14} />
              Card Grid
            </button>
            <button
              onClick={() => {
                setAchievementsViewMode("excel");
                setSelectedCell(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                achievementsViewMode === "excel"
                  ? "bg-gradient-to-r from-[#d4af37] to-amber-500 text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FileSpreadsheet size={14} />
              Excel View
            </button>
          </div>
        </div>

        {/* Tab Buttons & Search Filter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-neutral-950/40 p-4 rounded-2xl border border-white/5">
          {achievementsViewMode === "grid" ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                {visibleCategories.map((cat) => {
                  const IconComponent = iconMap[cat.icon] || Sparkles;
                  const isActive = cat.id === activeCatId;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setActiveCatId(cat.id || "")}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium tracking-wide transition-all duration-200 cursor-pointer ${
                        isActive
                          ? "text-black bg-gradient-to-r from-[#d4af37] to-amber-500 font-semibold shadow-[0_0_15px_rgba(212,175,55,0.2)]"
                          : "text-gray-300 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/10"
                      }`}
                    >
                      <IconComponent size={12} />
                      {cat.name}
                    </button>
                  );
                })}
              </div>
              <div className="text-xs font-mono text-gray-500 bg-neutral-900/50 px-3 py-1.5 rounded-lg border border-white/5">
                Showing {filteredAchievements.length} record{filteredAchievements.length === 1 ? "" : "s"}
              </div>
            </>
          ) : (
            <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                <Filter size={14} className="text-emerald-500" />
                <span>Spreadsheet Database Filter:</span>
                <span className="text-white font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">All Categories Enabled</span>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 text-xs font-semibold font-mono tracking-wide transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  Export Sheet (.csv)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Dynamic Display based on Mode */}
        {achievementsViewMode === "grid" ? (
          /* Grid Card View */
          filteredAchievements.length === 0 ? (
            <div className="text-center py-12 text-gray-500 rounded-2xl border border-white/5 bg-white/[0.01]">
              No achievement records uploaded yet under this category.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {filteredAchievements.map((item, index) => (
                <ScrollReveal key={item.id || index} delay={index * 0.1}>
                  <div className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md p-6 flex flex-col md:flex-row gap-6 hover:border-[#d4af37]/20 transition-all h-full">
                    {/* Left Column: Image & Galleries */}
                    <div className="w-full md:w-2/5 flex flex-col gap-3 shrink-0">
                      <div className="relative aspect-video md:aspect-square w-full rounded-xl overflow-hidden bg-neutral-900 border border-white/5 group">
                        <img
                          src={cleanGoogleDriveUrl(item.coverImage) || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop"}
                          alt={item.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                        <button
                          onClick={() => setLightboxImage(item.coverImage)}
                          className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity cursor-pointer"
                        >
                          <Maximize2 size={20} />
                        </button>
                      </div>

                      {/* Gallery Thumbnails */}
                      {item.gallery && item.gallery.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {item.gallery.map((thumb, tIdx) => (
                            <div 
                              key={tIdx} 
                              className="relative w-12 h-12 rounded-lg overflow-hidden bg-neutral-900 border border-white/10 cursor-pointer hover:border-[#d4af37]/50 group"
                              onClick={() => setLightboxImage(thumb)}
                            >
                              <img
                                src={cleanGoogleDriveUrl(thumb)}
                                alt="Thumbnail"
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-[8px]">
                                <Maximize2 size={10} />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Right Column: Title & Text */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-[#d4af37] uppercase bg-[#d4af37]/10 px-2 py-0.5 rounded-md border border-[#d4af37]/20">
                          {activeCategory?.name || "Milestone"}
                        </span>
                        <h4 className="text-lg font-semibold text-white mt-2 mb-2 leading-snug">
                          {item.title}
                        </h4>
                        <p className="text-gray-400 text-xs md:text-sm leading-relaxed font-sans mb-4">
                          {item.narrative}
                        </p>
                      </div>

                      {item.link && (
                        <div className="pt-2 border-t border-white/5">
                          <a
                            href={item.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs text-[#d4af37] hover:text-white font-medium transition-colors"
                          >
                            Launch Link
                            <ExternalLink size={12} />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollReveal>
              ))}
            </div>
          )
        ) : (
          /* Excel Spreadsheet View */
          <div className="rounded-2xl border border-white/10 bg-[#0c0c0d] overflow-hidden shadow-2xl">
            {/* 1. Microsoft Excel Toolbar / Formula Bar Header */}
            <div className="bg-[#1f1f23] px-4 py-3.5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-[#107c41] flex items-center justify-center text-white text-[11px] font-bold">
                  X
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block truncate leading-none">
                    Active_Milestones_Ledger.xlsx
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono tracking-wider">
                    Microsoft Excel Online Mode
                  </span>
                </div>
              </div>

              {/* Status statistics inside ribbon */}
              <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                <div>
                  <span className="text-gray-600 mr-1">STATUS:</span>
                  <span className="text-emerald-400 font-semibold">READY</span>
                </div>
                <div className="h-3 w-[1px] bg-white/10" />
                <div>
                  <span className="text-gray-600 mr-1">RECORDS:</span>
                  <span className="text-white font-semibold">{excelFilteredAchievements.length}</span>
                </div>
              </div>
            </div>

            {/* 2. Interactive Formula Bar */}
            <div className="bg-[#18181b] px-3 py-2 border-b border-white/10 flex items-center gap-2 font-mono text-xs">
              {/* Selected Cell Box */}
              <div className="w-14 h-7 bg-neutral-950 border border-white/10 rounded flex items-center justify-center text-gray-300 font-semibold select-none">
                {selectedCell 
                  ? `${String.fromCharCode(65 + selectedCell.colIdx)}${selectedCell.rowIdx + 2}` 
                  : "A2"
                }
              </div>

              {/* fx indicator */}
              <div className="text-gray-500 italic font-serif px-1.5 select-none text-sm">
                fx
              </div>

              {/* Search Bar / Formula Input */}
              <div className="flex-1 flex items-center bg-neutral-950 border border-white/10 rounded h-7 px-2.5 gap-2 group focus-within:border-emerald-500/50 transition-colors">
                <Search size={12} className="text-gray-500 shrink-0" />
                <input
                  type="text"
                  placeholder='Enter text or use formulas: e.g. =SEARCH("Power BI")'
                  value={excelSearchQuery}
                  onChange={(e) => {
                    setExcelSearchQuery(e.target.value);
                    setSelectedCell(null);
                  }}
                  className="flex-1 bg-transparent text-white text-xs outline-none font-mono placeholder:text-gray-600"
                />
                {excelSearchQuery && (
                  <button 
                    onClick={() => {
                      setExcelSearchQuery("");
                      setSelectedCell(null);
                    }}
                    className="text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Selected Cell Content Explanation */}
            <div className="bg-emerald-900/5 px-4 py-2 border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-400">
              <div className="truncate pr-4">
                <span className="text-emerald-500 font-semibold mr-1">Formula Output:</span>
                <span className="text-gray-300 italic">
                  {selectedCell 
                    ? `"${getSelectedCellValue()}"`
                    : `Showing all milestones. Click any spreadsheet cell to focus and view full text details above.`
                  }
                </span>
              </div>
              <span className="text-[9px] text-gray-500 uppercase select-none shrink-0">
                Formula Bar Auto-Sync
              </span>
            </div>

            {/* 3. The Grid / Spreadsheet Table */}
            <div className="overflow-x-auto w-full max-h-[500px]">
              <table className="w-full text-left border-collapse table-fixed select-text">
                {/* Column Grid Letters (A, B, C...) */}
                <thead className="bg-[#1f1f23] select-none text-[10px] font-mono font-bold tracking-wider text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="w-8 bg-neutral-950 border-r border-white/10 text-center py-1"></th>
                    <th className="w-28 px-4 py-1.5 border-r border-white/10 text-center">A</th>
                    <th className="w-44 px-4 py-1.5 border-r border-white/10 text-center">B</th>
                    <th className="w-[360px] px-4 py-1.5 border-r border-white/10 text-center">C</th>
                    <th className="w-28 px-4 py-1.5 border-r border-white/10 text-center">D</th>
                    <th className="w-28 px-4 py-1.5 border-r border-white/10 text-center">E</th>
                    <th className="w-28 px-4 py-1.5 border-r border-white/10 text-center">F</th>
                    <th className="w-24 px-4 py-1.5 text-center">G</th>
                  </tr>
                  {/* Column Text Labels */}
                  <tr className="bg-[#17171a] border-b border-white/10 text-[11px] font-mono text-gray-300">
                    <th className="bg-neutral-950 border-r border-white/10 text-center py-2"></th>
                    <th className="px-4 py-2.5 border-r border-white/10">Category</th>
                    <th className="px-4 py-2.5 border-r border-white/10">Milestone Title</th>
                    <th className="px-4 py-2.5 border-r border-white/10">Narrative / Explanation</th>
                    <th className="px-4 py-2.5 border-r border-white/10 text-center">Cover Image</th>
                    <th className="px-4 py-2.5 border-r border-white/10 text-center">Secondary Gallery</th>
                    <th className="px-4 py-2.5 border-r border-white/10 text-center">Launch Status</th>
                    <th className="px-4 py-2.5 text-center">Link Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5 font-mono text-xs">
                  {excelFilteredAchievements.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-500 italic bg-black/10">
                        No rows match your current search/formula filter query. Try clearing the search box.
                      </td>
                    </tr>
                  ) : (
                    excelFilteredAchievements.map((item, rowIdx) => {
                      const catName = achievementCategories.find(c => c.id === item.categoryId)?.name || "Other";
                      
                      return (
                        <tr 
                          key={item.id || rowIdx} 
                          className="hover:bg-neutral-900/40 group transition-colors"
                        >
                          {/* Row Number Gutter */}
                          <td className="bg-neutral-950 border-r border-white/10 text-center font-mono text-[10px] text-gray-500 py-3.5 select-none font-bold">
                            {rowIdx + 2}
                          </td>

                          {/* Column A: Category */}
                          <td 
                            onClick={() => setSelectedCell({ rowIdx, colIdx: 0 })}
                            className={`px-4 py-2 border-r border-white/5 cursor-pointer min-w-0 transition-all ${
                              selectedCell?.rowIdx === rowIdx && selectedCell?.colIdx === 0
                                ? "outline outline-2 outline-[#107c41] bg-emerald-500/5"
                                : ""
                            }`}
                          >
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-white/5 border border-white/10 text-gray-300 block text-center truncate">
                              {catName}
                            </span>
                          </td>

                          {/* Column B: Milestone Title */}
                          <td 
                            onClick={() => setSelectedCell({ rowIdx, colIdx: 1 })}
                            className={`px-4 py-2 border-r border-white/5 cursor-pointer font-sans font-semibold text-white min-w-0 transition-all ${
                              selectedCell?.rowIdx === rowIdx && selectedCell?.colIdx === 1
                                ? "outline outline-2 outline-[#107c41] bg-[#107c41]/10"
                                : ""
                            }`}
                          >
                            <div className="truncate" title={item.title}>
                              {item.title}
                            </div>
                          </td>

                          {/* Column C: Narrative / Description */}
                          <td 
                            onClick={() => setSelectedCell({ rowIdx, colIdx: 2 })}
                            className={`px-4 py-2 border-r border-white/5 cursor-pointer text-gray-400 font-sans text-xs min-w-0 transition-all ${
                              selectedCell?.rowIdx === rowIdx && selectedCell?.colIdx === 2
                                ? "outline outline-2 outline-[#107c41] bg-emerald-500/5"
                                : ""
                            }`}
                          >
                            <p className="line-clamp-2 leading-relaxed" title={item.narrative}>
                              {item.narrative}
                            </p>
                          </td>

                          {/* Column D: Cover Image */}
                          <td 
                            onClick={() => setSelectedCell({ rowIdx, colIdx: 4 })}
                            className={`px-4 py-2 border-r border-white/5 cursor-pointer text-center select-none transition-all ${
                              selectedCell?.rowIdx === rowIdx && selectedCell?.colIdx === 4
                                ? "outline outline-2 outline-[#107c41] bg-emerald-500/5"
                                : ""
                            }`}
                          >
                            {item.coverImage ? (
                              <div className="inline-flex items-center gap-1.5">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setLightboxImage(item.coverImage);
                                  }}
                                  className="w-10 h-7 rounded border border-white/15 overflow-hidden hover:border-[#d4af37] cursor-pointer"
                                >
                                  <img 
                                    src={cleanGoogleDriveUrl(item.coverImage)} 
                                    alt="thumb" 
                                    className="w-full h-full object-cover" 
                                    referrerPolicy="no-referrer"
                                  />
                                </button>
                              </div>
                            ) : (
                              <span className="text-gray-600 text-[10px]">No Cover</span>
                            )}
                          </td>

                          {/* Column E: Secondary Gallery */}
                          <td 
                            onClick={() => setSelectedCell({ rowIdx, colIdx: 5 })}
                            className={`px-4 py-2 border-r border-white/5 cursor-pointer text-center select-none transition-all ${
                              selectedCell?.rowIdx === rowIdx && selectedCell?.colIdx === 5
                                ? "outline outline-2 outline-[#107c41] bg-emerald-500/5"
                                : ""
                            }`}
                          >
                            {item.gallery && item.gallery.length > 0 ? (
                              <div className="flex justify-center items-center gap-1">
                                {item.gallery.slice(0, 3).map((thumb, gIdx) => (
                                  <button
                                    key={gIdx}
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setLightboxImage(thumb);
                                    }}
                                    className="w-4 h-4 rounded-full border border-white/10 overflow-hidden hover:border-[#d4af37] shrink-0"
                                  >
                                    <img 
                                      src={cleanGoogleDriveUrl(thumb)} 
                                      alt="thumb" 
                                      className="w-full h-full object-cover" 
                                      referrerPolicy="no-referrer"
                                    />
                                  </button>
                                ))}
                                {item.gallery.length > 3 && (
                                  <span className="text-[9px] text-gray-500 font-bold">+{item.gallery.length - 3}</span>
                                )}
                              </div>
                            ) : (
                              <span className="text-gray-600 text-[10px]">Empty</span>
                            )}
                          </td>

                          {/* Column F: Launch Status */}
                          <td 
                            onClick={() => setSelectedCell({ rowIdx, colIdx: 3 })}
                            className={`px-4 py-2 border-r border-white/5 cursor-pointer text-center transition-all ${
                              selectedCell?.rowIdx === rowIdx && selectedCell?.colIdx === 3
                                ? "outline outline-2 outline-[#107c41] bg-emerald-500/5"
                                : ""
                            }`}
                          >
                            {item.link ? (
                              <span className="text-[10px] font-mono tracking-wide text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                Active Link
                              </span>
                            ) : (
                              <span className="text-[10px] text-gray-600">
                                N/A
                              </span>
                            )}
                          </td>

                          {/* Column G: Link Action */}
                          <td className="px-4 py-2 text-center">
                            {item.link ? (
                              <a
                                href={item.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] hover:text-white transition-colors text-[10px]"
                              >
                                Launch
                                <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span className="text-[10px] text-gray-600 italic">Static</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. Microsoft Excel Status Bar */}
            <div className="bg-[#107c41] text-white px-4 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono select-none">
              <div className="flex items-center gap-3">
                <span className="font-semibold tracking-wider uppercase">Sheet1 (Achievements)</span>
                <span className="text-white/40">|</span>
                <span>Active Ledger Filters</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Sum: 0.00</span>
                <span>Count: {excelFilteredAchievements.length}</span>
                <span className="bg-[#0b5c2f] px-2 py-0.5 rounded text-[9px] font-bold">100% Zoom</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 5. Leadership & Affiliations Timeline & Excel Spreadsheet View */}
      <section className={`px-4 md:px-8 mx-auto transition-all duration-300 ${positionsViewMode === "excel" ? "max-w-none xl:px-12 w-full" : "max-w-7xl"}`}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <SectionHeading
              title="Leadership & Affiliations"
              subtitle="Positions and strategic trust structures I actively support globally."
              badge="Social Responsibility"
            />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-neutral-900 border border-white/10 p-1 rounded-xl shrink-0">
            <button
              onClick={() => {
                setPositionsViewMode("grid");
                setPositionsSelectedCell(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                positionsViewMode === "grid"
                  ? "bg-gradient-to-r from-[#d4af37] to-amber-500 text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <LayoutGrid size={14} />
              Timeline View
            </button>
            <button
              onClick={() => {
                setPositionsViewMode("excel");
                setPositionsSelectedCell(null);
              }}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                positionsViewMode === "excel"
                  ? "bg-gradient-to-r from-[#d4af37] to-amber-500 text-black shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <FileSpreadsheet size={14} />
              Excel View
            </button>
          </div>
        </div>

        {/* Tab Buttons & Search Filter */}
        {positionsViewMode === "excel" && (
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-8 bg-neutral-950/40 p-4 rounded-2xl border border-white/5">
            <div className="w-full flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
                <Filter size={14} className="text-emerald-500" />
                <span>Spreadsheet Database Filter:</span>
                <span className="text-white font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">All Roles Enabled</span>
              </div>
              
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleExportPositionsCSV}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 text-emerald-400 text-xs font-semibold font-mono tracking-wide transition-colors cursor-pointer"
                >
                  <Download size={13} />
                  Export Sheet (.csv)
                </button>
              </div>
            </div>
          </div>
        )}

        {visiblePositions.length === 0 ? (
          <div className="text-center py-12 text-gray-500 rounded-2xl border border-white/5 bg-white/[0.01]">
            No affiliations added yet. Use the admin dashboard to add roles.
          </div>
        ) : positionsViewMode === "grid" ? (
          /* Timeline view style */
          <div className="relative max-w-4xl mx-auto">
            {/* Timeline Line */}
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#d4af37]/40 via-amber-500/10 to-transparent transform -translate-x-1/2" />

            <div className="space-y-12">
              {visiblePositions.map((pos, idx) => {
                const orgType = positionTypes.find(t => t.id === pos.typeId);
                const IconComponent = orgType ? (iconMap[orgType.icon] || Shield) : Shield;
                const isLeft = idx % 2 === 0;

                return (
                  <ScrollReveal key={pos.id || idx} delay={idx * 0.1}>
                    <div className={`relative flex flex-col md:flex-row items-start ${isLeft ? "md:flex-row-reverse" : ""}`}>
                      {/* Timeline Center Point Icon */}
                      <div className="absolute left-4 md:left-1/2 transform -translate-x-1/2 flex items-center justify-center w-8 h-8 rounded-full border border-[#d4af37] bg-black text-[#d4af37] z-10 shadow-[0_0_10px_rgba(212,175,55,0.3)]">
                        <IconComponent size={14} />
                      </div>

                      {/* Spacer for desktop */}
                      <div className="hidden md:block w-1/2" />

                      {/* Box Content Card */}
                      <div className="w-full md:w-1/2 pl-12 md:pl-0 md:px-8">
                        <div className="rounded-2xl border border-white/5 bg-black/30 p-6 hover:border-[#d4af37]/20 transition-all shadow-xl">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                            <span className="text-[10px] font-mono font-semibold tracking-wider text-[#d4af37] uppercase bg-[#d4af37]/10 px-2.5 py-0.5 rounded-full border border-[#d4af37]/20">
                              {orgType?.name || "Affiliation"}
                            </span>
                            <span className="text-xs font-mono text-gray-400 flex items-center gap-1">
                              <Calendar size={12} />
                              {pos.period}
                            </span>
                          </div>

                          <h4 className="text-lg font-semibold text-white leading-snug">
                            {pos.position}
                          </h4>
                          <p className="text-amber-500/80 text-sm font-medium mt-0.5 mb-3">
                            {pos.organization}
                          </p>

                          <p className="text-gray-400 text-xs md:text-sm leading-relaxed mb-4">
                            {pos.about}
                          </p>

                          {pos.url && (
                            <a
                              href={pos.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-[#d4af37] hover:text-white transition-colors"
                            >
                              Visit Organization
                              <ExternalLink size={10} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </ScrollReveal>
                );
              })}
            </div>
          </div>
        ) : (
          /* Excel Spreadsheet View for Positions */
          <div className="rounded-2xl border border-white/10 bg-[#0c0c0d] overflow-hidden shadow-2xl">
            {/* 1. Microsoft Excel Toolbar / Formula Bar Header */}
            <div className="bg-[#1f1f23] px-4 py-3.5 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded bg-[#107c41] flex items-center justify-center text-white text-[11px] font-bold">
                  X
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold text-white block truncate leading-none">
                    Roles_and_Affiliations_Ledger.xlsx
                  </span>
                  <span className="text-[10px] text-emerald-400 font-mono tracking-wider">
                    Microsoft Excel Online Mode
                  </span>
                </div>
              </div>

              {/* Status statistics inside ribbon */}
              <div className="flex items-center gap-4 text-[10px] font-mono text-gray-400 bg-black/40 px-3 py-1.5 rounded-lg border border-white/5">
                <div>
                  <span className="text-gray-600 mr-1">STATUS:</span>
                  <span className="text-emerald-400 font-semibold">READY</span>
                </div>
                <div className="h-3 w-[1px] bg-white/10" />
                <div>
                  <span className="text-gray-600 mr-1">RECORDS:</span>
                  <span className="text-white font-semibold">{excelFilteredPositions.length}</span>
                </div>
              </div>
            </div>

            {/* 2. Interactive Formula Bar */}
            <div className="bg-[#18181b] px-3 py-2 border-b border-white/10 flex items-center gap-2 font-mono text-xs">
              {/* Selected Cell Box */}
              <div className="w-14 h-7 bg-neutral-950 border border-white/10 rounded flex items-center justify-center text-gray-300 font-semibold select-none">
                {positionsSelectedCell 
                  ? `${String.fromCharCode(65 + positionsSelectedCell.colIdx)}${positionsSelectedCell.rowIdx + 2}` 
                  : "A2"
                }
              </div>

              {/* fx indicator */}
              <div className="text-gray-500 italic font-serif px-1.5 select-none text-sm">
                fx
              </div>

              {/* Search Bar / Formula Input */}
              <div className="flex-1 flex items-center bg-neutral-950 border border-white/10 rounded h-7 px-2.5 gap-2 group focus-within:border-emerald-500/50 transition-colors">
                <Search size={12} className="text-gray-500 shrink-0" />
                <input
                  type="text"
                  placeholder='Enter text or use formulas: e.g. =SEARCH("Chairman")'
                  value={positionsExcelSearchQuery}
                  onChange={(e) => {
                    setPositionsExcelSearchQuery(e.target.value);
                    setPositionsSelectedCell(null);
                  }}
                  className="flex-1 bg-transparent text-white text-xs outline-none font-mono placeholder:text-gray-600"
                />
                {positionsExcelSearchQuery && (
                  <button 
                    onClick={() => {
                      setPositionsExcelSearchQuery("");
                      setPositionsSelectedCell(null);
                    }}
                    className="text-[10px] bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white px-1.5 py-0.5 rounded cursor-pointer"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>

            {/* Interactive Selected Cell Content Explanation */}
            <div className="bg-emerald-900/5 px-4 py-2 border-b border-white/5 flex items-center justify-between text-[11px] font-mono text-gray-400">
              <div className="truncate pr-4">
                <span className="text-emerald-500 font-semibold mr-1">Formula Output:</span>
                <span className="text-gray-300 italic">
                  {positionsSelectedCell 
                    ? `"${getSelectedPositionCellValue()}"`
                    : `Showing all strategic affiliations. Click any spreadsheet cell to focus and view full text details above.`
                  }
                </span>
              </div>
              <span className="text-[9px] text-gray-500 uppercase select-none shrink-0">
                Formula Bar Auto-Sync
              </span>
            </div>

            {/* 3. The Grid / Spreadsheet Table */}
            <div className="overflow-x-auto w-full max-h-[500px]">
              <table className="w-full text-left border-collapse table-fixed select-text">
                {/* Column Grid Letters (A, B, C...) */}
                <thead className="bg-[#1f1f23] select-none text-[10px] font-mono font-bold tracking-wider text-gray-400 border-b border-white/10">
                  <tr>
                    <th className="w-8 bg-neutral-950 border-r border-white/10 text-center py-1"></th>
                    <th className="w-28 px-4 py-1.5 border-r border-white/10 text-center">A</th>
                    <th className="w-44 px-4 py-1.5 border-r border-white/10 text-center">B</th>
                    <th className="w-[360px] px-4 py-1.5 border-r border-white/10 text-center">C</th>
                    <th className="w-28 px-4 py-1.5 border-r border-white/10 text-center">D</th>
                    <th className="w-[420px] px-4 py-1.5 border-r border-white/10 text-center">E</th>
                    <th className="w-24 px-4 py-1.5 text-center">F</th>
                  </tr>
                  {/* Column Text Labels */}
                  <tr className="bg-[#17171a] border-b border-white/10 text-[11px] font-mono text-gray-300">
                    <th className="bg-neutral-950 border-r border-white/10 text-center py-2"></th>
                    <th className="px-4 py-2.5 border-r border-white/10">Org Type</th>
                    <th className="px-4 py-2.5 border-r border-white/10">Role / Position</th>
                    <th className="px-4 py-2.5 border-r border-white/10">Organization</th>
                    <th className="px-4 py-2.5 border-r border-white/10">Period</th>
                    <th className="px-4 py-2.5 border-r border-white/10">About Description</th>
                    <th className="px-4 py-2.5 text-center">Action URL</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-white/5 font-mono text-xs">
                  {excelFilteredPositions.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-gray-500 italic bg-black/10">
                        No rows match your current search/formula filter query. Try clearing the search box.
                      </td>
                    </tr>
                  ) : (
                    excelFilteredPositions.map((item, rowIdx) => {
                      const orgType = positionTypes.find(t => t.id === item.typeId);
                      
                      return (
                        <tr 
                          key={item.id || rowIdx} 
                          className="hover:bg-neutral-900/40 group transition-colors"
                        >
                          {/* Row Number Gutter */}
                          <td className="bg-neutral-950 border-r border-white/10 text-center font-mono text-[10px] text-gray-500 py-3.5 select-none font-bold">
                            {rowIdx + 2}
                          </td>

                          {/* Column A: Org Type */}
                          <td 
                            onClick={() => setPositionsSelectedCell({ rowIdx, colIdx: 0 })}
                            className={`px-4 py-2 border-r border-white/5 cursor-pointer min-w-0 transition-all ${
                              positionsSelectedCell?.rowIdx === rowIdx && positionsSelectedCell?.colIdx === 0
                                ? "outline outline-2 outline-[#107c41] bg-emerald-500/5"
                                : ""
                            }`}
                          >
                            <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase bg-white/5 border border-white/10 text-gray-300 block text-center truncate">
                              {orgType?.name || "Affiliation"}
                            </span>
                          </td>

                          {/* Column B: Role / Position */}
                          <td 
                            onClick={() => setPositionsSelectedCell({ rowIdx, colIdx: 1 })}
                            className={`px-4 py-2 border-r border-white/5 cursor-pointer font-sans font-semibold text-white min-w-0 transition-all ${
                              positionsSelectedCell?.rowIdx === rowIdx && positionsSelectedCell?.colIdx === 1
                                ? "outline outline-2 outline-[#107c41] bg-[#107c41]/10"
                                : ""
                            }`}
                          >
                            <div className="truncate" title={item.position}>
                              {item.position}
                            </div>
                          </td>

                          {/* Column C: Organization */}
                          <td 
                            onClick={() => setPositionsSelectedCell({ rowIdx, colIdx: 2 })}
                            className={`px-4 py-2 border-r border-white/5 cursor-pointer text-amber-500/90 font-semibold font-sans min-w-0 transition-all ${
                              positionsSelectedCell?.rowIdx === rowIdx && positionsSelectedCell?.colIdx === 2
                                ? "outline outline-2 outline-[#107c41] bg-emerald-500/5"
                                : ""
                            }`}
                          >
                            <div className="truncate" title={item.organization}>
                              {item.organization}
                            </div>
                          </td>

                          {/* Column D: Period */}
                          <td 
                            onClick={() => setPositionsSelectedCell({ rowIdx, colIdx: 3 })}
                            className={`px-4 py-2 border-r border-white/5 cursor-pointer text-center text-gray-400 transition-all ${
                              positionsSelectedCell?.rowIdx === rowIdx && positionsSelectedCell?.colIdx === 3
                                ? "outline outline-2 outline-[#107c41] bg-emerald-500/5"
                                : ""
                            }`}
                          >
                            <span className="text-xs truncate block" title={item.period}>
                              {item.period}
                            </span>
                          </td>

                          {/* Column E: About Description */}
                          <td 
                            onClick={() => setPositionsSelectedCell({ rowIdx, colIdx: 4 })}
                            className={`px-4 py-2 border-r border-white/5 cursor-pointer text-gray-400 font-sans text-xs min-w-0 transition-all ${
                              positionsSelectedCell?.rowIdx === rowIdx && positionsSelectedCell?.colIdx === 4
                                ? "outline outline-2 outline-[#107c41] bg-emerald-500/5"
                                : ""
                            }`}
                          >
                            <p className="line-clamp-2 leading-relaxed" title={item.about}>
                              {item.about}
                            </p>
                          </td>

                          {/* Column F: Action URL */}
                          <td className="px-4 py-2 text-center">
                            {item.url ? (
                              <a
                                href={item.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#d4af37] hover:text-white transition-colors text-[10px]"
                              >
                                Visit
                                <ExternalLink size={10} />
                              </a>
                            ) : (
                              <span className="text-[10px] text-gray-600 italic">Static</span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* 4. Microsoft Excel Status Bar */}
            <div className="bg-[#107c41] text-white px-4 py-1.5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] font-mono select-none">
              <div className="flex items-center gap-3">
                <span className="font-semibold tracking-wider uppercase">Sheet1 (Affiliations)</span>
                <span className="text-white/40">|</span>
                <span>Active Ledger Filters</span>
              </div>
              <div className="flex items-center gap-4">
                <span>Sum: 0.00</span>
                <span>Count: {excelFilteredPositions.length}</span>
                <span className="bg-[#0b5c2f] px-2 py-0.5 rounded text-[9px] font-bold">100% Zoom</span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* 6. Professional Testimonials Slider */}
      <section className="px-4 md:px-8 max-w-5xl mx-auto">
        <SectionHeading
          title="Client & Student Endorsements"
          subtitle="Real results and behavioral outcomes from corporations and individuals worldwide."
          badge="Reviews"
        />

        {visibleTestimonials.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            No reviews published yet. Add testimonials in the CMS.
          </div>
        ) : (
          <ScrollReveal direction="up" delay={0.2}>
            <div className="relative rounded-3xl border border-white/5 bg-white/[0.01] backdrop-blur-md p-8 md:p-12 text-center shadow-2xl">
              {/* Giant Gold Quote Mark */}
              <div className="absolute top-6 left-8 text-6xl font-serif text-[#d4af37]/10 pointer-events-none select-none">
                “
              </div>

              <div className="space-y-6">
                <p className="text-lg md:text-xl text-gray-200 leading-relaxed italic font-sans max-w-3xl mx-auto">
                  "{visibleTestimonials[activeTestimonial].text}"
                </p>

                <div className="flex flex-col items-center gap-2 pt-6">
                  <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-[#d4af37]/30 bg-neutral-800 shadow-lg">
                    <img
                      src={cleanGoogleDriveUrl(visibleTestimonials[activeTestimonial].avatar) || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"}
                      alt={visibleTestimonials[activeTestimonial].author}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-base leading-snug">
                      {visibleTestimonials[activeTestimonial].author}
                    </h4>
                    <p className="text-[#d4af37] text-xs font-mono tracking-wider">
                      {visibleTestimonials[activeTestimonial].role}
                    </p>
                  </div>
                </div>
              </div>

              {/* Slider Navigation Controls */}
              {visibleTestimonials.length > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={handlePrevTestimonial}
                    className="p-2.5 rounded-full border border-white/5 bg-white/5 hover:bg-[#d4af37]/15 text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <span className="text-xs font-mono text-gray-500">
                    {activeTestimonial + 1} / {visibleTestimonials.length}
                  </span>
                  <button
                    onClick={handleNextTestimonial}
                    className="p-2.5 rounded-full border border-white/5 bg-white/5 hover:bg-[#d4af37]/15 text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              )}
            </div>
          </ScrollReveal>
        )}
      </section>

      {/* 7. Interactive Journey Exploration Cards */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto pt-8">
        <ScrollReveal direction="up" delay={0.1}>
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[10px] font-mono tracking-[0.25em] text-[#d4af37] uppercase bg-[#d4af37]/5 px-3.5 py-1.5 rounded-full border border-[#d4af37]/20">
              EXPLORE FURTHER
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-semibold text-white tracking-tight mt-4 mb-3">
              Where would you like to go next?
            </h2>
            <p className="text-xs md:text-sm text-gray-400 font-sans tracking-wide">
              Select a path to continue exploring my background, interactive programs, or scheduling a session.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: About biography */}
          <ScrollReveal delay={0.1}>
            <div 
              onClick={() => setCurrentTab("about")}
              className="group relative rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-[#d4af37]/[0.02] hover:border-[#d4af37]/30 p-6 md:p-8 flex flex-col justify-between h-full transition-all duration-300 cursor-pointer shadow-lg overflow-hidden"
            >
              {/* Gold gradient backdrop on hover */}
              <div className="absolute -inset-2 bg-gradient-to-br from-[#d4af37]/0 via-[#d4af37]/0 to-[#d4af37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/10 to-amber-500/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform duration-300">
                  <User size={22} />
                </div>
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-[#d4af37]/70 uppercase">
                    01 / MY STORY & STORYTELLING
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-1.5 mb-2 group-hover:text-[#d4af37] transition-colors">
                    The Mind Behind the Coach
                  </h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                    Explore a 25-year corporate journey combining Finance, AI, NLP mastery, and transformational community training.
                  </p>
                </div>
              </div>

              <div className="relative pt-6 border-t border-white/5 mt-6 flex items-center justify-between text-xs font-semibold text-[#d4af37] group-hover:text-white transition-colors">
                <span>Read Biography</span>
                <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-[#d4af37] group-hover:text-black transition-all">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 2: Workshops list */}
          <ScrollReveal delay={0.2}>
            <div 
              onClick={() => setCurrentTab("portfolio")}
              className="group relative rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-[#d4af37]/[0.02] hover:border-[#d4af37]/30 p-6 md:p-8 flex flex-col justify-between h-full transition-all duration-300 cursor-pointer shadow-lg overflow-hidden"
            >
              <div className="absolute -inset-2 bg-gradient-to-br from-[#d4af37]/0 via-[#d4af37]/0 to-[#d4af37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/10 to-amber-500/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform duration-300">
                  <BookOpen size={22} />
                </div>
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-[#d4af37]/70 uppercase">
                    02 / SIGNATURE PROGRAMS
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-1.5 mb-2 group-hover:text-[#d4af37] transition-colors">
                    Accelerate Your Skills
                  </h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                    Master Advanced Excel, Power BI, SQL, Python, or success mindset frameworks in certified live workshop tracks.
                  </p>
                </div>
              </div>

              <div className="relative pt-6 border-t border-white/5 mt-6 flex items-center justify-between text-xs font-semibold text-[#d4af37] group-hover:text-white transition-colors">
                <span>Explore Workshops</span>
                <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-[#d4af37] group-hover:text-black transition-all">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Card 3: Contact form */}
          <ScrollReveal delay={0.3}>
            <div 
              onClick={handleScheduleConsultation}
              className="group relative rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-[#d4af37]/[0.02] hover:border-[#d4af37]/30 p-6 md:p-8 flex flex-col justify-between h-full transition-all duration-300 cursor-pointer shadow-lg overflow-hidden"
            >
              <div className="absolute -inset-2 bg-gradient-to-br from-[#d4af37]/0 via-[#d4af37]/0 to-[#d4af37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/10 to-amber-500/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform duration-300">
                  <Mail size={22} />
                </div>
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-[#d4af37]/70 uppercase">
                    03 / BEGIN COLLABORATION
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-1.5 mb-2 group-hover:text-[#d4af37] transition-colors">
                    Begin Your Breakthrough
                  </h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                    Book custom corporate trainings, mindset consultations, or interactive masterclass projects for your team.
                  </p>
                </div>
              </div>

              <div className="relative pt-6 border-t border-white/5 mt-6 flex items-center justify-between text-xs font-semibold text-[#d4af37] group-hover:text-white transition-colors">
                <span>{profile?.consultationButtonText || "Schedule Consultation"}</span>
                <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-[#d4af37] group-hover:text-black transition-all">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Lightbox Overlay Component */}
      {lightboxImage && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <button
            onClick={() => setLightboxImage(null)}
            className="absolute top-6 right-6 p-3 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
          <div className="relative max-w-4xl max-h-[85vh] overflow-hidden rounded-2xl border border-white/10 shadow-2xl bg-neutral-950">
            <img
              src={cleanGoogleDriveUrl(lightboxImage)}
              alt="Lightbox View"
              className="max-w-full max-h-[80vh] object-contain"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}
    </div>
  );
}
