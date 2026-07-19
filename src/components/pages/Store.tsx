import React, { useState } from "react";
import { useProfile } from "../../lib/ProfileContext";
import { cleanGoogleDriveUrl, uploadImageToFirebase } from "../../lib/imageUtils";
import { ExternalLink, ShoppingBag, Star, Zap, X, Mail, CheckCircle, User, Phone, MapPin, Calendar, List, MessageCircle, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ScrollReveal from "../ui/ScrollReveal";
import { ResourceItem } from "../../types";

export default function Store({ setCurrentTab }: { setCurrentTab: (tab: string) => void }) {
  const { resources, addMessage, registrationForms, addEntity } = useProfile();
  
  const [searchQuery, setSearchQuery] = useState("");
  
  const matchesSearch = (item: ResourceItem) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(query)) ||
      (item.description && item.description.toLowerCase().includes(query)) ||
      (item.platform && item.platform.toLowerCase().includes(query))
    );
  };

  const visibleResources = resources.filter(r => !r.isHidden && matchesSearch(r));
  
  // Group by category, providing sensible defaults for older items
  const categoriesMap = new Map<string, ResourceItem[]>();
  
  visibleResources.forEach(r => {
    let catName = r.category;
    if (!catName) {
      if (r.type === 'product') catName = 'Premium Materials';
      else if (r.type === 'affiliate') catName = 'Recommended Gear';
      else if (r.type === 'reference') catName = 'Trusted Tools';
      else catName = 'Store Items';
    }
    
    if (!categoriesMap.has(catName)) {
      categoriesMap.set(catName, []);
    }
    categoriesMap.get(catName)!.push(r);
  });
  
  const uniqueCategories = Array.from(categoriesMap.keys()).sort();

  const [activeFilter, setActiveFilter] = useState("All");
  
  const filterOptions = [
    { id: "All", label: "All Items" },
    ...uniqueCategories.map(c => ({ id: c, label: c }))
  ];

  const [selectedProductForContact, setSelectedProductForContact] = useState<ResourceItem | null>(null);
  
  // Standard Form State
  const [contactForm, setContactForm] = useState({ name: "", email: "", mobile: "", message: "" });
  
  // Dynamic Form State
  const [dynamicAnswers, setDynamicAnswers] = useState<Record<string, string>>({});
  const [uploadingFieldId, setUploadingFieldId] = useState<string | null>(null);

  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const selectedForm = selectedProductForContact?.registrationFormId && registrationForms 
    ? registrationForms.find(f => f.id === selectedProductForContact.registrationFormId)
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

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactSubmitting(true);
    setContactError(null);

    try {
      if (selectedForm) {
        // Validate custom dynamic form fields
        const answersObj: Record<string, string> = {};
        let mappedName = "";
        let mappedMobile = "";
        let mappedAddress = "";
        
        for (const field of selectedForm.fields || []) {
          if (!isFieldVisible(field)) continue;
          
          const val = dynamicAnswers[field.id] || "";
          if (field.required && !val) {
            setContactError(`Please fill in the required field: "${field.label}"`);
            setContactSubmitting(false);
            return;
          }
          answersObj[field.label] = val;

          const labelLower = field.label.toLowerCase();
          const typeLower = (field.type || "").toLowerCase();
          
          if (typeLower === "full name" || (labelLower.includes("name") && !mappedName)) {
            mappedName = val;
          } else if (typeLower === "phone" || ((labelLower.includes("phone") || labelLower.includes("mobile")) && !mappedMobile)) {
            mappedMobile = val;
          } else if (typeLower === "address" || ((labelLower.includes("address") || labelLower.includes("location")) && !mappedAddress)) {
            mappedAddress = val;
          }
        }

        // Add to workshop_registrations so it aligns with the Portfolio dynamic leads
        await addEntity("workshop_registrations", {
          workshopId: selectedProductForContact?.id || "unknown",
          workshopTitle: selectedProductForContact?.title || "Unknown Product",
          name: mappedName || "Store Lead",
          mobile: mappedMobile || "Not Provided",
          address: mappedAddress || "Not Provided",
          preferredDate: "N/A",
          additionalInfo: "Store Product Dynamic Form Submission",
          answers: answersObj,
          createdAt: new Date().toISOString()
        });

      } else {
        // Standard hardcoded fallback
        if (!contactForm.name || !contactForm.email || !contactForm.message) {
          setContactError("Please complete all required fields.");
          setContactSubmitting(false);
          return;
        }

        await addMessage({
          name: contactForm.name,
          email: contactForm.email,
          mobile: contactForm.mobile,
          subject: `Product Inquiry/Lead: ${selectedProductForContact?.title}`,
          message: contactForm.message,
          createdAt: new Date().toISOString()
        });
      }

      setContactSubmitted(true);
      setContactForm({ name: "", email: "", mobile: "", message: "" });
      setDynamicAnswers({});
      
      const redirectUrl = selectedProductForContact?.link || selectedProductForContact?.externalAppUrl;
      if (redirectUrl) {
        setTimeout(() => {
          window.location.href = redirectUrl;
        }, 1500);
      }

    } catch (err) {
      console.error("Failed to submit inquiry:", err);
      setContactError("Failed to send message. Please try again or contact me directly.");
    } finally {
      setContactSubmitting(false);
    }
  };

  const closeContactModal = () => {
    setSelectedProductForContact(null);
    setTimeout(() => {
      setContactSubmitted(false);
      setContactError(null);
      setContactForm({ name: "", email: "", mobile: "", message: "" });
      setDynamicAnswers({});
    }, 300);
  };

  return (
    <div className="min-h-screen pt-20 pb-20 px-4 md:px-6 max-w-7xl mx-auto space-y-12 md:space-y-16 relative">
      
      {/* Header Section */}
      <ScrollReveal>
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif font-bold text-white leading-tight">
            Curated <span className="text-[#d4af37]">Resources</span> & Store
          </h1>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed">
            Explore my premium materials, highly recommended tools, and essential resources to accelerate your journey.
          </p>
        </div>
      </ScrollReveal>

      {/* Sticky Filter & Search Bar */}
      <div className="sticky top-[88px] z-40 bg-[#0a0a0a]/90 backdrop-blur-xl py-3 -mx-4 px-4 md:-mx-6 md:px-6 border-b border-white/10 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)]">
        <div className="flex flex-col items-center justify-center gap-3 max-w-2xl mx-auto">
          {/* Search Input */}
          <div className="relative w-full max-w-lg">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              placeholder="Search for PDF, Amazon, Books, etc..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white/5 border border-white/10 rounded-full text-white text-xs focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] focus:bg-white/10 outline-none transition-all shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 bg-white/10 hover:bg-white/20 rounded-full text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                <X size={12} />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            {filterOptions.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-semibold transition-all duration-300 cursor-pointer ${
                  activeFilter === filter.id
                    ? 'bg-[#d4af37] text-black shadow-[0_0_15px_rgba(212,175,55,0.4)]'
                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* DYNAMIC SECTIONS */}
      {uniqueCategories.map((category, idx) => {
        if (activeFilter !== "All" && activeFilter !== category) return null;
        
        const items = categoriesMap.get(category) || [];
        if (items.length === 0) return null;

        // Determine icon based on the most common type in the category, or default
        const typeCounts = items.reduce((acc, item) => {
          acc[item.type] = (acc[item.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);
        
        let dominantType = 'product';
        let maxCount = 0;
        Object.entries(typeCounts).forEach(([t, count]) => {
          if (count > maxCount) { maxCount = count; dominantType = t; }
        });

        let Icon = ShoppingBag;
        let iconColor = "text-[#d4af37]";
        let iconBg = "bg-[#d4af37]/10";
        
        if (dominantType === 'affiliate') {
          Icon = Star;
          iconColor = "text-pink-500";
          iconBg = "bg-pink-500/10";
        } else if (dominantType === 'reference') {
          Icon = Zap;
          iconColor = "text-blue-500";
          iconBg = "bg-blue-500/10";
        }

        return (
          <ScrollReveal key={category} delay={0.2 + (idx * 0.1)}>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 ${iconBg} rounded-xl`}>
                  <Icon className={iconColor} size={28} />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">{category}</h2>
                </div>
              </div>
              
              <div className={`grid gap-4 md:gap-6 ${
                dominantType === 'reference' 
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                  : 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5'
              }`}>
                {items.map(item => {
                  if (item.type === 'reference') {
                    return (
                      <a
                        key={item.id}
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group p-5 bg-white/[0.02] border border-white/5 hover:bg-blue-500/5 hover:border-blue-500/30 rounded-xl flex items-center justify-between transition-all"
                      >
                        <div className="truncate pr-4">
                          <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">{item.title}</h4>
                          <p className="text-xs text-gray-500 truncate mt-1">{item.description}</p>
                        </div>
                        <ExternalLink size={16} className="text-gray-600 group-hover:text-blue-400 shrink-0 transition-colors" />
                      </a>
                    );
                  }

                  if (item.type === 'affiliate') {
                    return (
                      <a 
                        key={item.id} 
                        href={item.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex flex-col gap-3 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-pink-500/30 p-3 md:p-4 rounded-2xl transition-all"
                      >
                        {item.imageUrl && (
                          <div className="w-full aspect-square rounded-xl overflow-hidden shrink-0">
                            <img 
                              src={cleanGoogleDriveUrl(item.imageUrl)} 
                              alt={item.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        )}
                        <div className="flex flex-col justify-center flex-grow">
                          {item.platform && (
                            <span className="text-[9px] font-mono tracking-widest uppercase text-pink-500 mb-1.5">{item.platform}</span>
                          )}
                          <h3 className="text-sm md:text-base font-bold text-white mb-1.5 group-hover:text-pink-400 transition-colors line-clamp-2">{item.title}</h3>
                          <p className="text-gray-400 text-xs mb-3 line-clamp-3">{item.description}</p>
                          {item.personalNote && (
                            <div className="bg-pink-500/5 border border-pink-500/10 px-3 py-2 rounded-lg mt-auto">
                              <p className="text-[10px] text-pink-200/80 italic line-clamp-2">" {item.personalNote} "</p>
                            </div>
                          )}
                        </div>
                      </a>
                    );
                  }

                  // Default to Product
                  return (
                    <div key={item.id} className="group rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#d4af37]/30 transition-all overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] flex flex-col">
                      {item.imageUrl && (
                        <div className="aspect-square w-full overflow-hidden relative">
                          <img 
                            src={cleanGoogleDriveUrl(item.imageUrl)} 
                            alt={item.title} 
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                        </div>
                      )}
                      <div className="p-4 flex flex-col flex-grow">
                        <h3 className="text-sm md:text-base font-bold text-white mb-2 group-hover:text-[#d4af37] transition-colors line-clamp-2">{item.title}</h3>
                        <p className="text-gray-400 text-xs leading-relaxed mb-4 flex-grow line-clamp-3">{item.description}</p>
                        
                        <div className="flex flex-col gap-2 pt-4 border-t border-white/5 mt-auto">
                          {item.price && <span className="text-sm font-bold text-white text-center">{item.price}</span>}
                          <button
                            onClick={() => setSelectedProductForContact(item)}
                            className="w-full justify-center px-4 py-2 bg-[#d4af37] hover:bg-[#c4a137] text-black text-xs font-semibold rounded-full transition-colors flex items-center gap-2 cursor-pointer"
                          >
                            {item.price ? "Buy Now" : "I am interested"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              {dominantType === 'affiliate' && (
                <p className="text-center text-[10px] text-gray-600 mt-6 max-w-2xl mx-auto">
                  *Disclaimer: Some of these links are affiliate links. If you purchase through them, I may earn a small commission at no extra cost to you. This helps support my work!
                </p>
              )}
            </div>
          </ScrollReveal>
        );
      })}

      {/* Contact Form Modal */}
      <AnimatePresence>
        {selectedProductForContact && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-neutral-950 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8"
            >
              <div className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    {selectedForm ? <Star className="text-[#d4af37]" size={18} /> : <Mail className="text-[#d4af37]" size={18} />}
                    <div>
                      <h3 className="text-base font-semibold text-white">
                        {selectedForm ? selectedForm.name : "Product Inquiry"}
                      </h3>
                      <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase mt-0.5">Secure Registration</p>
                    </div>
                  </div>
                  <button 
                    onClick={closeContactModal}
                    className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {contactSubmitted ? (
                  <div className="text-center py-8 px-4 space-y-4">
                    <div className="w-16 h-16 bg-[#d4af37]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Star className="text-[#d4af37]" size={32} />
                    </div>
                    <h3 className="text-2xl font-serif font-bold text-white">
                      {selectedProductForContact?.link ? "Registration Successful!" : (selectedForm?.successMessage || "Message Sent!")}
                    </h3>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                      {selectedProductForContact?.link 
                        ? "Redirecting you to the next step..." 
                        : `Thank you for your interest in "${selectedProductForContact.title}". I'll get back to you shortly.`}
                    </p>
                    {!selectedProductForContact?.link && (
                      <button
                        onClick={closeContactModal}
                        className="mt-6 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                      >
                        Close Window
                      </button>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 text-left">
                    {selectedForm ? (
                      /* DYNAMIC FORM TEMPLATE FIELDS */
                      <div className="space-y-4">
                        {selectedForm.bannerImage && (
                          <div className="w-full rounded-xl overflow-hidden border border-white/10 mb-4 bg-black/40 flex items-center justify-center min-h-[100px]">
                            <img 
                              src={cleanGoogleDriveUrl(selectedForm.bannerImage)} 
                              alt="Form Banner" 
                              className="w-full h-auto object-cover max-h-[300px]" 
                              referrerPolicy="no-referrer"
                            />
                          </div>
                        )}
                        
                        {selectedForm.description && (
                          <div className="p-3 bg-[#d4af37]/5 border border-[#d4af37]/15 rounded-xl text-[11px] text-amber-300/90 leading-relaxed font-sans mb-2 flex items-start gap-2">
                            <CheckCircle size={14} className="text-[#d4af37] shrink-0 mt-0.5" />
                            <span>{selectedForm.description}</span>
                          </div>
                        )}

                        {selectedForm.fields && selectedForm.fields.map((field: any) => {
                          if (!isFieldVisible(field)) {
                            return null;
                          }

                          const isRequired = !!field.required;
                          const labelLower = (field.label || "").toLowerCase();
                          const typeLower = (field.type || "").toLowerCase();

                          let Icon = User;
                          if (typeLower === "phone") Icon = Phone;
                          else if (typeLower === "address") Icon = MapPin;
                          else if (typeLower === "date") Icon = Calendar;
                          else if (typeLower === "email") Icon = Mail;
                          else if (typeLower === "dropdown") Icon = List;
                          else if (typeLower === "textarea") Icon = MessageCircle;

                          return (
                            <div key={field.id} className="space-y-1.5 transition-all duration-300">
                              <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300 flex items-center gap-1">
                                <Icon size={10} className="text-[#d4af37]" />
                                {field.label} {isRequired && <span className="text-red-500">*</span>}
                              </label>

                              {typeLower === "textarea" || typeLower === "address" ? (
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
                              ) : typeLower.includes("file") || typeLower.includes("image") || typeLower.includes("document") ? (
                                <div>
                                  <div className="flex items-center gap-3">
                                    <label className="flex items-center justify-center px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-xs font-semibold cursor-pointer transition-colors text-white">
                                      <input 
                                        type="file" 
                                        className="hidden" 
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
                                      />
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
                        <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                          Please fill out the form below to inquire about <strong className="text-white">"{selectedProductForContact.title}"</strong>.
                        </p>
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

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300">Email Address *</label>
                            <input
                              type="email"
                              required
                              value={contactForm.email}
                              onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                              placeholder="john@example.com"
                              className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
                            />
                          </div>
                          <div className="space-y-1.5">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300">Mobile Number</label>
                            <input
                              type="tel"
                              value={contactForm.mobile}
                              onChange={(e) => setContactForm({ ...contactForm, mobile: e.target.value })}
                              placeholder="+91 98765 43210"
                              className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-gray-300">Your Message *</label>
                          <textarea
                            required
                            rows={4}
                            value={contactForm.message}
                            onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                            placeholder="How can I help you regarding this product?"
                            className="w-full px-3 py-2.5 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none resize-none transition-all"
                          />
                        </div>
                      </>
                    )}

                    {contactError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-medium mt-2">
                        {contactError}
                      </div>
                    )}

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={contactSubmitting}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-semibold text-sm shadow-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {contactSubmitting ? "Sending..." : (selectedForm?.buttonText || "Send Inquiry")}
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
