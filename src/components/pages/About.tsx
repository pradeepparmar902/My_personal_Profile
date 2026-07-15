import React from "react";
import { useProfile } from "../../lib/ProfileContext";
import { cleanGoogleDriveUrl } from "../../lib/imageUtils";
import ScrollReveal from "../ui/ScrollReveal";
import SectionHeading from "../ui/SectionHeading";
import { motion } from "motion/react";
import { 
  Briefcase, 
  Calendar, 
  GraduationCap, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  User, 
  BookOpen, 
  Mail, 
  Home,
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
  Activity
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
  Award
};

interface AboutProps {
  setCurrentTab: (tab: string) => void;
}

export default function About({ setCurrentTab }: AboutProps) {
  const { profile, experiences, skills } = useProfile();

  const visibleExperiences = experiences.filter(e => !e.isHidden);
  const visibleSkills = skills.filter(s => !s.isHidden);

  // Group skills by category if possible
  const rawCategories = Array.from(new Set(visibleSkills.map(s => s.category || "General")));
  const categories = [...rawCategories].sort((a, b) => {
    if (!profile?.skillCategoryOrder) return 0;
    const idxA = profile.skillCategoryOrder.indexOf(a);
    const idxB = profile.skillCategoryOrder.indexOf(b);
    if (idxA === -1 && idxB === -1) return 0;
    if (idxA === -1) return 1;
    if (idxB === -1) return -1;
    return idxA - idxB;
  });

  return (
    <div className="pt-24 md:pt-32 space-y-16 max-w-7xl mx-auto px-4 md:px-8">
      {/* Sleek Breadcrumb / Back to Home navigation */}
      <ScrollReveal direction="down" delay={0.05}>
        <div className="flex items-center justify-between pb-4 border-b border-white/5">
          <button
            onClick={() => setCurrentTab("home")}
            className="inline-flex items-center gap-2 text-[10px] font-mono tracking-[0.2em] text-gray-400 hover:text-[#d4af37] transition-colors group cursor-pointer"
          >
            <span className="w-6 h-[1px] bg-gray-600 group-hover:bg-[#d4af37] transition-all group-hover:w-8" />
            BACK TO HOME HUB
          </button>
          
          <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest hidden sm:inline-block">
            BIOGRAPHY Narratives &bull; {profile?.name || "Pradeep Parmar"}
          </span>
        </div>
      </ScrollReveal>

      {/* 1. Bio / Introduction */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-5 flex justify-center">
          <ScrollReveal direction="right" delay={0.1}>
            <div className="relative">
              <div className="absolute -inset-2 bg-gradient-to-r from-[#d4af37] to-amber-500 rounded-3xl blur-lg opacity-25" />
              <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-neutral-900 aspect-[3/4] w-72 md:w-85 shadow-2xl">
                <img
                  src={cleanGoogleDriveUrl(profile?.aboutAvatarUrl || profile?.avatarUrl) || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop"}
                  alt={profile?.name || "Pradeep Parmar"}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <h3 className="text-xl font-serif font-bold text-white leading-snug">{profile?.name || "Pradeep Parmar"}</h3>
                  <p className="text-[#d4af37] text-xs font-mono uppercase tracking-widest mt-1">
                    {profile?.aboutSubtitle || "NLP Master & Advisor"}
                  </p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className="lg:col-span-7 space-y-6">
          <ScrollReveal direction="left" delay={0.2}>
            <span className="text-xs font-mono text-[#d4af37] uppercase tracking-widest">About Pradeep</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mt-2">
              Transforming Lives Through Mindset & Tech
            </h2>
            <div className="space-y-4">
              {(() => {
                const text = profile?.bio || "I am an NLP Master Practitioner, Corporate Trainer, and Personal Growth Coach. Over the last decade, I have guided thousands of professionals, corporate leaders, and students to unlock their ultimate mental potential, master advanced technical tools, and live with conscious purpose.";
                const paragraphs = text.split(/\r?\n/);
                return paragraphs.map((para, paraIdx) => {
                  if (!para.trim()) {
                    return <div key={paraIdx} className="h-3" />;
                  }
                  const parts = para.split(/(\*\*.*?\*\*)/g);
                  return (
                    <p key={paraIdx} className="text-gray-300 text-sm md:text-base leading-relaxed font-sans">
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
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {(profile?.highlights || [
                { title: "Subconscious Blueprint", description: "Custom NLP maps to swap limiting core beliefs." },
                { title: "Enterprise Analytics", description: "Corporate audits in Advanced Excel & Power BI." },
                { title: "Longevity Strategy", description: "Perfect mind-body equilibrium habits." },
                { title: "Relentless Coaching", description: "Actionable and bulletproof accountability logs." }
              ]).map((highlight, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <CheckCircle2 size={16} className="text-[#d4af37] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-white text-xs font-semibold uppercase tracking-wider">{highlight.title}</h4>
                    <p className="text-gray-400 text-xs mt-0.5">{highlight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* 2. Skills Grid with Animations */}
      <section className="space-y-10">
        <SectionHeading
          title="Core Capabilities"
          subtitle="A blend of advanced data architecture proficiency and psychological peak-performance methods."
          badge="Expertise"
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
          {categories.map((cat, idx) => (
            <ScrollReveal key={cat} delay={idx * 0.1}>
              <div className="rounded-2xl border border-white/5 bg-gradient-to-b from-white/[0.02] to-transparent hover:border-[#d4af37]/30 transition-all duration-300 p-6 md:p-8 shadow-xl shadow-black/50 group">
                <div className="flex items-center gap-3.5 pb-5 mb-6 border-b border-white/10">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#d4af37]/20 to-[#d4af37]/5 flex items-center justify-center text-[#d4af37] border border-[#d4af37]/30 font-mono text-sm font-bold shadow-md shadow-[#d4af37]/5">
                    {String(idx + 1).padStart(2, '0')}
                  </div>
                  <h3 className="text-lg sm:text-xl font-serif font-semibold text-white tracking-wide uppercase">
                    {cat} Skills
                  </h3>
                </div>
                
                <div className="space-y-6">
                  {visibleSkills
                    .filter(s => s.category === cat)
                    .map((skill) => (
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
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* 3. Professional Timeline (Experiences) */}
      <section className="space-y-8">
        <SectionHeading
          title="Career Journey"
          subtitle="My professional trajectory spanning technical architecture consulting and corporate mindset coaching."
          badge="History"
        />

        <div className="max-w-4xl mx-auto space-y-8 relative">
          {/* Vertical left border for timeline */}
          <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-white/10" />

          {visibleExperiences.map((exp, idx) => (
            <ScrollReveal key={exp.id || idx} delay={idx * 0.1}>
              <div className="relative pl-14 group">
                {/* Timeline Node */}
                <div className="absolute left-4 top-1.5 w-4.5 h-4.5 rounded-full border border-[#d4af37] bg-black group-hover:bg-[#d4af37] transition-all duration-300 transform -translate-x-1/2 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#d4af37] group-hover:bg-black transition-colors" />
                </div>

                <div className="rounded-2xl border border-white/5 bg-black/30 p-6 group-hover:border-[#d4af37]/10 transition-colors">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
                    <div>
                      <h4 className="text-lg font-semibold text-white leading-snug">
                        {exp.title}
                      </h4>
                      <p className="text-[#d4af37] text-xs font-mono mt-0.5">
                        {exp.organization}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-mono text-gray-400 bg-white/5 px-2.5 py-1 rounded-md border border-white/5">
                      <Calendar size={12} />
                      {exp.period}
                    </span>
                  </div>
                  
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                    {exp.details}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </section>

      {/* Interactive Journey Exploration Cards */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto pt-8 border-t border-white/5">
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
              onClick={() => setCurrentTab("home")}
              className="group relative rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-[#d4af37]/[0.02] hover:border-[#d4af37]/30 p-6 md:p-8 flex flex-col justify-between h-full transition-all duration-300 cursor-pointer shadow-lg overflow-hidden"
            >
              {/* Gold gradient backdrop on hover */}
              <div className="absolute -inset-2 bg-gradient-to-br from-[#d4af37]/0 via-[#d4af37]/0 to-[#d4af37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/10 to-amber-500/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform duration-300">
                  <Home size={22} />
                </div>
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-[#d4af37]/70 uppercase">
                    01 / HOME PORTAL
                  </span>
                  <h3 className="text-lg font-semibold text-white mt-1.5 mb-2 group-hover:text-[#d4af37] transition-colors">
                    Back to Main Hub
                  </h3>
                  <p className="text-gray-400 text-xs md:text-sm leading-relaxed">
                    Return to the home screen for direct overviews of statistics, highlights, and introductory matrices.
                  </p>
                </div>
              </div>

              <div className="relative pt-6 border-t border-white/5 mt-6 flex items-center justify-between text-xs font-semibold text-[#d4af37] group-hover:text-white transition-colors">
                <span>View Home</span>
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
              onClick={() => setCurrentTab("contact")}
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
                <span>Schedule Consultation</span>
                <div className="p-1.5 rounded-full bg-white/5 group-hover:bg-[#d4af37] group-hover:text-black transition-all">
                  <ArrowRight size={14} />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
}
