import React, { useState } from "react";
import { useProfile } from "../../lib/ProfileContext";
import { cleanGoogleDriveUrl, uploadImageToFirebase } from "../../lib/imageUtils";
import ScrollReveal from "../ui/ScrollReveal";
import TiltCard from "../ui/TiltCard";
import SectionHeading from "../ui/SectionHeading";
import { ExternalLink, BookOpen, ArrowRight, User, Mail, Home, X, CheckCircle, Phone, MapPin, Calendar, Sparkles, MessageCircle, QrCode, Copy, Check, List } from "lucide-react";

interface PortfolioProps {
  setCurrentTab: (tab: string) => void;
}

export default function Portfolio({ setCurrentTab }: PortfolioProps) {
  const { projects, projectCategories, registrationForms = [], addEntity, addMessage } = useProfile();
  const [activeFilter, setActiveFilter] = useState("All");

  const [selectedWorkshopForContact, setSelectedWorkshopForContact] = useState<any | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", mobile: "", subject: "", message: "" });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const [selectedWorkshopForReg, setSelectedWorkshopForReg] = useState<any | null>(null);
  const [selectedWorkshopDetails, setSelectedWorkshopDetails] = useState<any | null>(null);
  const [qrWorkshop, setQrWorkshop] = useState<any | null>(null);
  const [copiedQrUrl, setCopiedQrUrl] = useState(false);
  const [regForm, setRegForm] = useState({
    name: "",
    mobile: "",
    address: "",
    preferredDate: "",
    additionalInfo: ""
  });
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, string>>({});
  const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [formError, setFormError] = useState("");

  const selectedForm = selectedWorkshopForReg && registrationForms
    ? registrationForms.find((f: any) => f.id === selectedWorkshopForReg.formTemplateId)
    : null;

  const isFieldVisible = (field: any): boolean => {
    if (!selectedForm) return true;
    if (field.isHidden) return false;
    if (!field.isConditional || !field.dependsOnFieldId) {
      return true;
    }
    const parentField = (selectedForm.fields || []).find((f: any) => f.id === field.dependsOnFieldId);
    if (!parentField) return true;
    
    // Parent must also be visible recursively
    if (!isFieldVisible(parentField)) return false;
    
    const parentVal = (dynamicAnswers[field.dependsOnFieldId] || "").trim().toLowerCase();
    const expectedVal = (field.dependsOnValue || "").trim().toLowerCase();
    return parentVal === expectedVal;
  };

  // Deep linking: Auto-open registration modal if ID is in query parameters
  React.useEffect(() => {
    if (projects && projects.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const workshopId = params.get("register") || params.get("workshop");
      if (workshopId) {
        const found = projects.find(p => p.id === workshopId);
        if (found && found.allowRegistration) {
          setSelectedWorkshopForReg(found);
          setSubmitSuccess(false);
          setFormError("");
          setDynamicAnswers({});
          setRegForm({
            name: "",
            mobile: "",
            address: "",
            preferredDate: found.workshopDate || "",
            additionalInfo: ""
          });
          
          // Clean up the URL query parameters so refresh doesn't trigger unexpectedly
          const newUrl = window.location.pathname + window.location.hash;
          window.history.replaceState({}, document.title, newUrl);
        }
      }
    }
  }, [projects]);

  React.useEffect(() => {
    const nav = document.querySelector('nav');
    if (selectedWorkshopForReg || selectedWorkshopForContact) {
      document.body.style.overflow = 'hidden';
      if (nav) nav.style.opacity = '0';
      if (nav) nav.style.pointerEvents = 'none';
    } else {
      document.body.style.overflow = '';
      if (nav) nav.style.opacity = '1';
      if (nav) nav.style.pointerEvents = 'auto';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = '';
      if (nav) nav.style.opacity = '1';
      if (nav) nav.style.pointerEvents = 'auto';
    };
  }, [selectedWorkshopForReg, selectedWorkshopForContact]);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.message) {
      setContactError("Please complete all required fields.");
      return;
    }
    
    setContactSubmitting(true);
    setContactError(null);
    
    try {
      await addMessage({
        name: contactForm.name,
        email: contactForm.email,
        mobile: contactForm.mobile,
        subject: contactForm.subject || `Inquiry about ${selectedWorkshopForContact?.title || 'Workshop'}`,
        message: contactForm.message,
        createdAt: new Date().toISOString()
      });
      setContactSubmitted(true);
      setContactForm({ name: "", email: "", mobile: "", subject: "", message: "" });
    } catch (err: any) {
      setContactError(err.message || "Failed to send message. Please try again.");
    } finally {
      setContactSubmitting(false);
    }
  };

  const handleRegSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError("");

    try {
      if (selectedForm) {
        // Validate custom dynamic form fields
        const answersObj: Record<string, string> = {};
        let mappedName = "";
        let mappedMobile = "";
        let mappedAddress = "";
        let mappedDate = selectedWorkshopForReg.workshopDate || "TBD";
        let mappedQueries = "";

        for (const field of selectedForm.fields || []) {
          if (!isFieldVisible(field)) {
            continue; // Skip validating or saving hidden conditional fields
          }
          const val = dynamicAnswers[field.id] || "";
          if (field.required && !val) {
            setFormError(`Please fill in the required field: "${field.label}"`);
            setSubmitting(false);
            return;
          }
          answersObj[field.label] = val;

          // Intelligently map custom field values to standard properties for compatibility with admin table and metrics
          const labelLower = field.label.toLowerCase();
          const typeLower = (field.type || "").toLowerCase();
          if (typeLower === "full name" || (labelLower.includes("name") && !mappedName)) {
            mappedName = val;
          } else if (typeLower === "phone" || ((labelLower.includes("phone") || labelLower.includes("mobile")) && !mappedMobile)) {
            mappedMobile = val;
          } else if (typeLower === "address" || ((labelLower.includes("address") || labelLower.includes("location")) && !mappedAddress)) {
            mappedAddress = val;
          } else if (typeLower === "date" || ((labelLower.includes("date") || labelLower.includes("schedule")) && !mappedDate)) {
            mappedDate = val;
          } else {
            if (val && !val.startsWith("http") && !val.startsWith("data:")) {
              mappedQueries += `${field.label}: ${val}; `;
            }
          }
        }

        // Apply robust fallbacks for main columns if form did not capture standard types
        if (!mappedName) {
          const firstVal = Object.values(dynamicAnswers).find(v => v && !v.startsWith("http") && !v.startsWith("data:"));
          mappedName = firstVal || "Dynamic Registrant";
        }
        if (!mappedMobile) mappedMobile = "Not Provided";
        if (!mappedAddress) mappedAddress = "Not Provided";

        await addEntity("workshop_registrations", {
          workshopId: selectedWorkshopForReg.id || "unknown",
          workshopTitle: selectedWorkshopForReg.title,
          name: mappedName,
          mobile: mappedMobile,
          address: mappedAddress,
          preferredDate: mappedDate,
          additionalInfo: mappedQueries || "Dynamic Form Submission",
          answers: answersObj,
          createdAt: new Date().toISOString()
        });

      } else {
        // Standard hardcoded registration fallback
        if (!regForm.name || !regForm.mobile || !regForm.address) {
          setFormError("Please fill out all required fields.");
          setSubmitting(false);
          return;
        }

        await addEntity("workshop_registrations", {
          workshopId: selectedWorkshopForReg.id || "unknown",
          workshopTitle: selectedWorkshopForReg.title,
          name: regForm.name,
          mobile: regForm.mobile,
          address: regForm.address,
          preferredDate: regForm.preferredDate || selectedWorkshopForReg.workshopDate || "TBD",
          additionalInfo: regForm.additionalInfo || "",
          createdAt: new Date().toISOString()
        });
      }

      setSubmitSuccess(true);
      setRegForm({
        name: "",
        mobile: "",
        address: "",
        preferredDate: "",
        additionalInfo: ""
      });
      setDynamicAnswers({});
    } catch (err) {
      console.error(err);
      setFormError("Failed to submit entry request. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const visibleProjects = projects.filter(p => !p.isHidden);

  // Determine filter categories directly from active projects so mismatches don't hide them
  const projectCatsFromProjects = Array.from(new Set(visibleProjects.map(p => p.category).filter(Boolean)));
  const activeProjCats = projectCatsFromProjects.sort((a, b) => {
    const idxA = (projectCategories || []).findIndex(c => c.name.toLowerCase() === a?.toLowerCase());
    const idxB = (projectCategories || []).findIndex(c => c.name.toLowerCase() === b?.toLowerCase());
    if (idxA === -1 && idxB !== -1) return 1;
    if (idxB === -1 && idxA !== -1) return -1;
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    return (a || "").localeCompare(b || "");
  }) as string[];

  const filterCategories = ["All", ...activeProjCats];

  const filteredProjects = activeFilter === "All" 
    ? visibleProjects 
    : visibleProjects.filter(p => p.category?.toLowerCase() === activeFilter.toLowerCase());

  return (
    <div className="pt-24 md:pt-32 space-y-12 max-w-7xl mx-auto px-4 md:px-8">
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
            PROGRAMS &bull; Work & Live Experience
          </span>
        </div>
      </ScrollReveal>
      <SectionHeading
        title="Training Portfolios & Workshops"
        subtitle="Empowering professionals with technical competence and cognitive breakthrough matrices. Browse programs and sign up."
        badge="Masterclass Catalogue"
      />

      {/* Filter Categories */}
      <div className="flex flex-wrap justify-center items-center gap-2 mb-10">
        {filterCategories.map((filter) => (
          <button
            key={filter}
            onClick={() => setActiveFilter(filter)}
            className={`px-5 py-2 rounded-full text-xs sm:text-sm font-medium tracking-wide transition-all duration-200 cursor-pointer ${
              activeFilter === filter
                ? "text-black bg-gradient-to-r from-[#d4af37] to-amber-500 font-semibold"
                : "text-gray-300 bg-white/5 hover:bg-white/10 border border-white/5"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filteredProjects.length === 0 ? (
        <div className="text-center py-16 text-gray-500">
          No courses currently listed under the "{activeFilter}" filter category.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProjects.map((project, index) => (
              <ScrollReveal key={project.id || index} delay={index * 0.1}>
                <div className="group relative h-full rounded-2xl p-[2px] transition-transform duration-500 hover:-translate-y-2">
                  {project.statusBadge && (
                    <div className="absolute -top-3 left-6 z-30 bg-gradient-to-r from-amber-500 to-[#d4af37] text-black px-4 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-[0_4px_15px_rgba(212,175,55,0.4)] border border-[#d4af37]">
                      {project.statusBadge}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-[#d4af37] to-purple-500 opacity-30 group-hover:opacity-100 blur-[4px] group-hover:blur-[8px] transition-all duration-500 animate-pulse" />
                  <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-[#d4af37] to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                  
                  <TiltCard className="h-full flex flex-col justify-between relative z-10 !bg-neutral-950/90 !border-transparent group-hover:!bg-neutral-900/90">
                    <div>
                      {/* Aspect Cover Image */}
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900 mb-5">
                    <img
                      src={cleanGoogleDriveUrl(project.coverImage) || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop"}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3 px-3 py-1 rounded-full text-[9px] font-mono tracking-widest bg-black/80 border border-[#d4af37]/30 text-[#d4af37] uppercase font-semibold">
                      {project.category}
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-white mb-2 leading-snug">
                    {project.title}
                  </h3>
                  
                  <p className="text-gray-400 text-xs sm:text-sm leading-relaxed mb-4">
                    {project.description}
                  </p>

                  {project.allowRegistration && project.workshopDate && (
                    <div className="mb-4 flex items-center gap-2 text-xs text-amber-400 font-mono bg-amber-500/5 border border-amber-500/10 px-3 py-1.5 rounded-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Next Live Batch: {project.workshopDate}</span>
                    </div>
                  )}

                  {project.details && (
                    <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 mb-5 text-xs text-gray-300 space-y-1">
                      <span className="font-mono text-[#d4af37] font-semibold block uppercase tracking-wider text-[10px]">Course Highlights:</span>
                      <p className="leading-relaxed">{project.details}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                  <button 
                    onClick={() => setSelectedWorkshopDetails(project)}
                    className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-mono text-gray-300 hover:text-[#d4af37] hover:bg-white/10 hover:border-[#d4af37]/30 flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <BookOpen size={14} />
                    Full Access
                  </button>
                  {project.allowRegistration ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setQrWorkshop(project);
                          setCopiedQrUrl(false);
                        }}
                        className="p-2.5 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 text-[#d4af37] hover:text-amber-400 transition-all cursor-pointer"
                        title="Display QR Code for Students to Scan"
                      >
                        <QrCode size={14} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedWorkshopForReg(project);
                          setSubmitSuccess(false);
                          setFormError("");
                          setDynamicAnswers({});
                          setRegForm({
                            name: "",
                            mobile: "",
                            address: "",
                            preferredDate: project.workshopDate || "",
                            additionalInfo: ""
                          });
                        }}
                        className="px-4 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold text-xs tracking-wide shadow-lg hover:shadow-xl transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        {project.regFormButtonText || "Request Invite"}
                        <ArrowRight size={12} />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setSelectedWorkshopForContact(project)}
                      className="px-4 py-2 rounded-full bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-semibold text-xs tracking-wide shadow-lg hover:shadow-xl transition-all flex items-center gap-1 cursor-pointer"
                    >
                      Book Session
                    </button>
                  )}
                  </div>
                </TiltCard>
                </div>
              </ScrollReveal>
          ))}
        </div>
      )}

      {/* Interactive Journey Exploration Cards */}
      <section className="px-4 md:px-8 max-w-7xl mx-auto pt-12 border-t border-white/5 mt-16">
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

          {/* Card 2: Home portal */}
          <ScrollReveal delay={0.2}>
            <div 
              onClick={() => setCurrentTab("home")}
              className="group relative rounded-2xl border border-white/5 bg-white/[0.01] hover:bg-[#d4af37]/[0.02] hover:border-[#d4af37]/30 p-6 md:p-8 flex flex-col justify-between h-full transition-all duration-300 cursor-pointer shadow-lg overflow-hidden"
            >
              <div className="absolute -inset-2 bg-gradient-to-br from-[#d4af37]/0 via-[#d4af37]/0 to-[#d4af37]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
              
              <div className="relative space-y-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#d4af37]/10 to-amber-500/10 border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform duration-300">
                  <Home size={22} />
                </div>
                <div>
                  <span className="text-[9px] font-mono tracking-widest text-[#d4af37]/70 uppercase">
                    02 / HOME PORTAL
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

        {/* Full Access Details Modal */}
        {selectedWorkshopDetails && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto pt-20">
            <div className="relative w-full max-w-2xl bg-[#0c0c0c] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-auto animate-fadeIn flex flex-col max-h-[85vh]">
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40 sticky top-0 z-10">
                <h3 className="text-sm font-semibold text-white font-serif uppercase tracking-widest">Workshop Overview</h3>
                <button
                  onClick={() => setSelectedWorkshopDetails(null)}
                  className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer border-none"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="overflow-y-auto flex-1 p-5 md:p-8 space-y-6 md:space-y-8 custom-scrollbar">
                {/* Cover Image */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-neutral-900 border border-white/5 shadow-inner">
                  <img
                    src={cleanGoogleDriveUrl(selectedWorkshopDetails.coverImage) || "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop"}
                    alt={selectedWorkshopDetails.title}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full text-[10px] font-mono tracking-widest bg-black/80 border border-[#d4af37]/30 text-[#d4af37] uppercase font-semibold backdrop-blur-md">
                    {selectedWorkshopDetails.category}
                  </div>
                </div>

                {/* Title & Description */}
                <div className="space-y-4">
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-snug">{selectedWorkshopDetails.title}</h2>
                  
                  {selectedWorkshopDetails.allowRegistration && selectedWorkshopDetails.workshopDate && (
                    <div className="inline-flex items-center gap-2 text-xs md:text-sm text-amber-400 font-mono bg-amber-500/5 border border-amber-500/10 px-4 py-2 rounded-lg">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Next Live Batch: {selectedWorkshopDetails.workshopDate}</span>
                    </div>
                  )}
                  
                  <div className="prose prose-invert max-w-none text-gray-300 text-sm md:text-base leading-relaxed whitespace-pre-wrap mt-4">
                    {selectedWorkshopDetails.description}
                  </div>
                </div>

                {/* Course Highlights */}
                {selectedWorkshopDetails.details && (
                  <div className="p-5 md:p-6 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 mt-6">
                    <span className="flex items-center gap-2 font-mono text-[#d4af37] font-semibold uppercase tracking-wider text-[11px] md:text-xs">
                      <CheckCircle className="w-4 h-4" />
                      Course Highlights
                    </span>
                    <div className="text-gray-300 text-sm leading-relaxed whitespace-pre-wrap">
                      {selectedWorkshopDetails.details}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="p-4 md:p-5 border-t border-white/10 bg-black/40 flex justify-end gap-3 sticky bottom-0 z-10">
                <button
                  onClick={() => setSelectedWorkshopDetails(null)}
                  className="px-5 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-semibold cursor-pointer transition-colors"
                >
                  Close
                </button>
                {selectedWorkshopDetails.allowRegistration && (
                  <button
                    onClick={() => {
                      setSelectedWorkshopForReg(selectedWorkshopDetails);
                      setSubmitSuccess(false);
                      setSelectedWorkshopDetails(null);
                    }}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all"
                  >
                    Request Invite <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Entry Invite / Registration Form Modal */}
      
      {/* Contact Form Modal (Fallback for Book Session) */}
      {selectedWorkshopForContact && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Header */}
            <div className="px-6 py-5 border-b border-white/10 bg-neutral-900/50 flex items-center justify-between sticky top-0 z-10 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <Mail className="text-[#d4af37]" size={18} />
                <div>
                  <h3 className="text-base font-semibold text-white">Contact for Booking</h3>
                  <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase mt-0.5">Send a message</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setSelectedWorkshopForContact(null);
                  setContactSubmitted(false);
                  setContactError(null);
                }}
                className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors group cursor-pointer"
              >
                <X size={16} className="text-gray-400 group-hover:text-white" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh] custom-scrollbar">
              {contactSubmitted ? (
                <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/20 shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                    <CheckCircle className="text-emerald-500" size={32} />
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-2">Message Sent!</h4>
                    <p className="text-sm text-gray-400 leading-relaxed">
                      Thank you for your interest in <strong>"{selectedWorkshopForContact.title}"</strong>. 
                      Pradeep Parmar will review your message and get back to you shortly.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedWorkshopForContact(null);
                      setContactSubmitted(false);
                    }}
                    className="mt-4 px-6 py-2.5 rounded-full bg-white/10 hover:bg-white/15 text-white font-semibold text-xs tracking-wider uppercase cursor-pointer transition-colors"
                  >
                    Close Window
                  </button>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                    Please fill out the form below to book a session for <strong className="text-white">"{selectedWorkshopForContact.title}"</strong> or ask any questions you may have.
                  </p>
                  
                  {contactError && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium">
                      {contactError}
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300">Your Name *</label>
                    <input
                      type="text"
                      required
                      value={contactForm.name}
                      onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                      placeholder="e.g. John Doe"
                      className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={contactForm.email}
                      onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                      placeholder="e.g. john@example.com"
                      className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300">Mobile Number</label>
                    <input
                      type="tel"
                      value={contactForm.mobile}
                      onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
                      placeholder="e.g. +91 98199 84437"
                      className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300">Subject</label>
                    <input
                      type="text"
                      value={contactForm.subject}
                      onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                      placeholder={`Inquiry about ${selectedWorkshopForContact.title}`}
                      className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300">Message *</label>
                    <textarea
                      rows={4}
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      placeholder="How can we help you?"
                      className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all custom-scrollbar resize-y"
                    />
                  </div>

                  <div className="pt-4 pb-2">
                    <button
                      type="submit"
                      disabled={contactSubmitting}
                      className={`w-full py-3.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all flex items-center justify-center gap-2 cursor-pointer ${contactSubmitting ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
                    >
                      {contactSubmitting ? (
                        <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                      ) : (
                        <>
                          <span>Send Message</span>
                          <ArrowRight size={16} />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {selectedWorkshopForReg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-r from-[#d4af37]/10 to-amber-500/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="text-[#d4af37]" size={18} />
                <div>
                  <h3 className="text-base font-semibold text-white">
                    {selectedWorkshopForReg.regFormTitle || "Workshop Entry Invite"}
                  </h3>
                  <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase mt-0.5">Secure Registration</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedWorkshopForReg(null)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

             {/* Content Body */}
            <div className="p-6 space-y-4">
              {submitSuccess ? (
                <div className="text-center py-6 space-y-4">
                  {selectedForm?.isPaused ? (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-6 relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-32 h-32 bg-red-500/20 blur-3xl rounded-full"></div>
                      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-red-500/20 blur-3xl rounded-full"></div>
                      
                      <div className="text-5xl mb-3 relative z-10 animate-bounce">🥺</div>
                      <h4 className="text-xl font-bold text-red-400 mb-3 relative z-10">
                        Registration Closed!
                      </h4>
                      <p className="text-red-200/90 text-xs md:text-sm leading-relaxed relative z-10 font-medium bg-red-950/40 p-3 rounded-xl border border-red-500/20">
                        {selectedForm.pausedMessage || "Sorry, our entry has been closed. We have stored your details. If any scope or chance, our team will connect you."}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="mx-auto w-14 h-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <CheckCircle size={32} />
                      </div>
                      <div>
                        <h4 className="text-base font-bold text-white">Invite Request Submitted!</h4>
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                          {selectedForm?.successMessage || selectedWorkshopForReg.regSuccessMessage || (
                            <>
                              Your registration for <strong className="text-white">"{selectedWorkshopForReg.title}"</strong> has been securely logged. 
                              Pradeep Parmar will contact you shortly via Mobile/WhatsApp to coordinate schedules.
                            </>
                          )}
                        </p>
                      </div>
                    </>
                  )}
                  {selectedWorkshopForReg.whatsappGroupLink && (
                    <div className="p-4 rounded-xl bg-[#25d366]/5 border border-[#25d366]/20 space-y-2.5 my-2 animate-fadeIn text-left">
                      <span className="text-[10px] font-mono font-semibold tracking-wider uppercase text-[#25d366] block text-center">
                        Next step: Connect via WhatsApp
                      </span>
                      <p className="text-center text-[11px] text-gray-300">
                        Join the official WhatsApp group for this workshop to receive coordinate schedules, session files, and updates instantly:
                      </p>
                      <a 
                        href={selectedWorkshopForReg.whatsappGroupLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-[#25d366] hover:bg-[#20ba5a] text-black font-bold text-xs tracking-wider uppercase transition-all shadow-md hover:shadow-lg w-full cursor-pointer hover:scale-[1.02]"
                      >
                        <MessageCircle size={15} />
                        Join WhatsApp Group
                      </a>
                    </div>
                  )}

                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
                    {(!selectedForm?.isPaused && (selectedWorkshopForReg.paymentLink || selectedForm?.paymentLink)) ? (
                      <a 
                        href={selectedWorkshopForReg.paymentLink || selectedForm?.paymentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-indigo-600 hover:to-purple-600 text-white font-bold text-xs tracking-wider uppercase cursor-pointer hover:shadow-[0_0_15px_rgba(79,70,229,0.5)] transition-all flex items-center gap-2"
                        onClick={() => setSelectedWorkshopForReg(null)}
                      >
                        Proceed to Payment <ArrowRight size={14} />
                      </a>
                    ) : (
                      <button 
                        onClick={() => setSelectedWorkshopForReg(null)}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold text-xs tracking-wider uppercase cursor-pointer hover:shadow-lg transition-all"
                      >
                        Done & Close
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleRegSubmit} className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-gray-400 block mb-1">Target Workshop</span>
                    <div className="px-3 py-2 bg-white/5 border border-white/5 rounded-lg text-xs font-semibold text-[#d4af37]">
                      {selectedWorkshopForReg.title}
                    </div>
                  </div>

                  {selectedForm ? (
                    /* DYNAMIC FORM TEMPLATE FIELDS */
                    <div className="space-y-4">
                      {selectedForm.bannerImage && (
                        <div className="w-full rounded-xl overflow-hidden border border-white/10 mb-4 bg-black/40 flex items-center justify-center min-h-[100px]">
                          <img 
                            src={selectedForm.bannerImage.includes("drive.google.com") 
                              ? selectedForm.bannerImage.replace("/d/", "/uc?export=view&id=").split("/view")[0]
                              : selectedForm.bannerImage
                            } 
                            alt="Form Banner" 
                            className="w-full h-auto object-cover max-h-[300px]" 
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                        <div className="p-3 bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-xl text-[11px] text-amber-300/90 leading-relaxed font-sans mb-2 flex items-start gap-2">
                          <CheckCircle size={14} className="text-[#d4af37] shrink-0 mt-0.5" />
                          <span>
                            Please provide the following details to complete your registration for <strong className="text-white">{selectedForm.name}</strong>.
                          </span>
                        </div>

                      {(selectedForm.fields || []).map((field: any) => {
                        // Check if field should be visible conditionally
                        if (!isFieldVisible(field)) {
                          return null;
                        }

                        const isRequired = !!field.required;
                        const labelLower = (field.label || "").toLowerCase();
                        const typeLower = (field.type || "").toLowerCase();

                        // Icon selection
                        let Icon = User;
                        if (typeLower === "phone") Icon = Phone;
                        else if (typeLower === "address") Icon = MapPin;
                        else if (typeLower === "date") Icon = Calendar;
                        else if (typeLower === "email") Icon = Mail;
                        else if (typeLower === "dropdown") Icon = List;

                        return (
                          <div key={field.id} className="space-y-1.5 text-left transition-all duration-300">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300 flex items-center gap-1">
                              <Icon size={10} className="text-[#d4af37]" />
                              {field.label} {isRequired && <span className="text-red-500">*</span>}
                            </label>

                            {typeLower === "address" ? (
                              <textarea
                                required={isRequired}
                                rows={2}
                                value={dynamicAnswers[field.id] || ""}
                                onChange={(e) => setDynamicAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                                placeholder={field.placeholder || `Enter your ${field.label}...`}
                                className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none resize-none"
                              />
                            ) : typeLower === "gender" ? (
                              <select
                                required={isRequired}
                                value={dynamicAnswers[field.id] || ""}
                                onChange={(e) => setDynamicAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                                className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] outline-none"
                              >
                                <option value="" className="bg-neutral-900 text-white">-- Select Gender --</option>
                                <option value="Male" className="bg-neutral-900 text-white">Male</option>
                                <option value="Female" className="bg-neutral-900 text-white">Female</option>
                                <option value="Other" className="bg-neutral-900 text-white">Other</option>
                              </select>
                            ) : typeLower === "dropdown" ? (
                              <select
                                required={isRequired}
                                value={dynamicAnswers[field.id] || ""}
                                onChange={(e) => setDynamicAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                                className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] outline-none"
                              >
                                <option value="" className="bg-neutral-900 text-white">{field.placeholder || "-- Select Option --"}</option>
                                {(field.options || "")
                                  .split(",")
                                  .map((opt: string) => opt.trim())
                                  .filter((opt: string) => opt.length > 0)
                                  .map((opt: string, optIdx: number) => (
                                    <option key={optIdx} value={opt} className="bg-neutral-900 text-white">
                                      {opt}
                                    </option>
                                  ))}
                              </select>
                            ) : typeLower.includes("upload") || typeLower.includes("image") || typeLower.includes("photo") || typeLower.includes("document") ? (
                              <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                  <input
                                    type="file"
                                    accept={typeLower.includes("image") || typeLower.includes("photo") ? "image/*" : ".pdf,.doc,.docx,.xls,.xlsx,.txt"}
                                    onChange={async (e) => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        setUploadingFieldId(field.id);
                                        try {
                                          if (typeLower.includes("image") || typeLower.includes("photo")) {
                                            const result = await uploadImageToFirebase(file, "registrations/photos");
                                            setDynamicAnswers(prev => ({ ...prev, [field.id]: result.url }));
                                          } else {
                                            const reader = new FileReader();
                                            reader.onload = (readerEvent) => {
                                              const base64Url = readerEvent.target?.result as string;
                                              setDynamicAnswers(prev => ({ ...prev, [field.id]: base64Url }));
                                            };
                                            reader.readAsDataURL(file);
                                          }
                                        } catch (err) {
                                          console.error("Upload failed", err);
                                        } finally {
                                          setUploadingFieldId(null);
                                        }
                                      }
                                    }}
                                    className="hidden"
                                    id={`file_${field.id}`}
                                  />
                                  <label
                                    htmlFor={`file_${field.id}`}
                                    className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 border border-white/10 rounded-lg text-xs font-semibold text-gray-300 hover:text-white cursor-pointer transition-all inline-flex items-center gap-1.5"
                                  >
                                    {uploadingFieldId === field.id ? (
                                      <span className="w-3 h-3 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin" />
                                    ) : (
                                      "Choose File"
                                    )}
                                    {uploadingFieldId === field.id ? "Uploading..." : "Upload Document"}
                                  </label>
                                  {dynamicAnswers[field.id] && (
                                    <span className="text-[10px] text-green-400 font-mono flex items-center gap-1">
                                      <CheckCircle size={12} />
                                      File Attached
                                    </span>
                                  )}
                                </div>
                                {dynamicAnswers[field.id] && (typeLower.includes("image") || typeLower.includes("photo")) && (
                                  <div className="mt-2 w-16 h-16 rounded overflow-hidden border border-white/10 bg-neutral-950">
                                    <img src={cleanGoogleDriveUrl(dynamicAnswers[field.id])} className="w-full h-full object-cover" />
                                  </div>
                                )}
                              </div>
                            ) : (
                              <input
                                type={typeLower === "number" ? "number" : typeLower === "date" ? "date" : typeLower === "email" ? "email" : "text"}
                                required={isRequired}
                                value={dynamicAnswers[field.id] || ""}
                                onChange={(e) => setDynamicAnswers(prev => ({ ...prev, [field.id]: e.target.value }))}
                                placeholder={field.placeholder || `Enter ${field.label}...`}
                                className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none"
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* FALLBACK / STANDARD FORM */
                    <>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300 flex items-center gap-1">
                            <User size={10} className="text-[#d4af37]" />
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={regForm.name}
                            onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                            placeholder="e.g. Rahul Sharma"
                            className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300 flex items-center gap-1">
                            <Phone size={10} className="text-[#d4af37]" />
                            Mobile Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="tel"
                            required
                            value={regForm.mobile}
                            onChange={(e) => setRegForm({ ...regForm, mobile: e.target.value })}
                            placeholder="e.g. +91 98765 43210"
                            className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300 flex items-center gap-1">
                          <MapPin size={10} className="text-[#d4af37]" />
                          Full Address <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          rows={2}
                          value={regForm.address}
                          onChange={(e) => setRegForm({ ...regForm, address: e.target.value })}
                          placeholder="e.g. Flat 402, Golden Heights, Sector 15, Mumbai"
                          className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none resize-none animate-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300 flex items-center gap-1">
                          <Calendar size={10} className="text-[#d4af37]" />
                          Workshop Date / Preferred Schedule
                        </label>
                        <input
                          type="text"
                          value={regForm.preferredDate}
                          onChange={(e) => setRegForm({ ...regForm, preferredDate: e.target.value })}
                          placeholder={selectedWorkshopForReg.workshopDate || "TBD / Flexible"}
                          className="w-full px-3 py-2.5 bg-neutral-900 border border-[#d4af37]/35 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300">
                          {selectedWorkshopForReg.regCustomQuestion || "Additional Queries / Custom Requests (Optional)"}
                        </label>
                        <textarea
                          rows={2}
                          value={regForm.additionalInfo}
                          onChange={(e) => setRegForm({ ...regForm, additionalInfo: e.target.value })}
                          placeholder="e.g. I want corporate customized curriculum, group booking..."
                          className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none resize-none animate-none"
                        />
                      </div>
                    </>
                  )}

                  {formError && (
                    <p className="text-red-400 text-xs font-mono">{formError}</p>
                  )}

                  <div className="pt-2 flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={submitting}
                      onClick={() => setSelectedWorkshopForReg(null)}
                      className="px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-xs text-gray-300 font-semibold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#d4af37] to-amber-500 hover:from-amber-500 hover:to-amber-600 text-black font-bold text-xs tracking-wider uppercase flex items-center gap-2 cursor-pointer shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    >
                      {submitting ? "Submitting..." : (selectedWorkshopForReg.regFormButtonText || "Submit Registration")}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR Code Presentation Overlay */}
      {qrWorkshop && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-neutral-900 border border-white/10 rounded-2xl p-6 shadow-2xl text-center space-y-6 animate-fadeIn">
            <button
              onClick={() => setQrWorkshop(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer border-none"
            >
              ✕
            </button>

            <div className="space-y-1.5">
              <span className="text-[10px] font-mono tracking-widest text-[#d4af37] bg-[#d4af37]/10 px-2.5 py-1 rounded-full uppercase border border-[#d4af37]/20 inline-block">
                Quick Scan Registration
              </span>
              <h3 className="text-lg font-serif font-semibold text-white pt-2 leading-snug">
                {qrWorkshop.title}
              </h3>
              <p className="text-xs text-gray-400">
                Scan this QR code with your mobile camera to open the registration form directly.
              </p>
            </div>

            {/* QR Code container - high contrast white bg for phone camera readers */}
            <div className="mx-auto w-60 h-60 bg-white p-4 rounded-2xl shadow-xl flex items-center justify-center border-4 border-[#d4af37]/20">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
                  `${window.location.origin}${window.location.pathname}?workshop=${qrWorkshop.id}&v=${Date.now()}`
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
                  value={`${window.location.origin}${window.location.pathname}?workshop=${qrWorkshop.id}`}
                  className="flex-1 bg-transparent border-none text-[11px] text-gray-400 outline-none font-mono px-2"
                />
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}${window.location.pathname}?workshop=${qrWorkshop.id}`);
                    setCopiedQrUrl(true);
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
                    `${window.location.origin}${window.location.pathname}?workshop=${qrWorkshop.id}&v=${Date.now()}`
                  )}`}
                  download={`QR_${qrWorkshop.title.replace(/\s+/g, "_")}.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs tracking-wide transition-all text-center block cursor-pointer"
                >
                  Open Full Image
                </a>
                <button
                  onClick={() => setQrWorkshop(null)}
                  className="flex-1 py-2.5 rounded-xl bg-white text-black font-semibold text-xs tracking-wide hover:bg-gray-100 transition-all cursor-pointer border-none"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
