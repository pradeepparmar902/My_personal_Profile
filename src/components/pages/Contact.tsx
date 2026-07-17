import React, { useState } from "react";
import { useProfile } from "../../lib/ProfileContext";
import ScrollReveal from "../ui/ScrollReveal";
import SectionHeading from "../ui/SectionHeading";
import { Mail, Phone, MapPin, Send, CheckCircle, Sparkles, ArrowRight, User, BookOpen, Home } from "lucide-react";

interface ContactProps {
  setCurrentTab: (tab: string) => void;
}

export default function Contact({ setCurrentTab }: ContactProps) {
  const { profile, addMessage } = useProfile();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    mobile: "",
    subject: "",
    message: ""
  });
  
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setError("Please complete all required fields (Name, Email, and Message).");
      return;
    }
    
    setSubmitting(true);
    setError(null);
    
    try {
      await addMessage({
        name: formData.name,
        email: formData.email,
        mobile: formData.mobile,
        subject: formData.subject || "General Inquiry",
        message: formData.message,
        createdAt: new Date().toISOString()
      });
      setSubmitted(true);
      setFormData({ name: "", email: "", mobile: "", subject: "", message: "" });
    } catch (err: any) {
      setError("Failed to dispatch message. Please check connection and try again.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

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
            INQUIRIES &bull; Connect & Consult
          </span>
        </div>
      </ScrollReveal>
      <SectionHeading
        title="Connect & Consult"
        subtitle="Schedule corporate training workshops, behavioral mindset consulting, or personal development sessions."
        badge="Inquiries"
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 max-w-5xl mx-auto items-start">
        {/* Left Column: Details */}
        <div className="lg:col-span-5 space-y-6">
          <ScrollReveal direction="right" delay={0.1}>
            <div className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md p-6 space-y-6">
              <h3 className="text-lg font-semibold text-white mb-2 leading-snug">
                Contact Coordinates
              </h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]">
                    <Mail size={16} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider">Direct Email</span>
                    <a href={`mailto:${profile?.email || "pradeepparmar902@gmail.com"}`} className="text-white hover:text-[#d4af37] transition-colors text-sm sm:text-base font-medium">
                      {profile?.email || "pradeepparmar902@gmail.com"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]">
                    <Phone size={16} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider">Contact Phone</span>
                    <a href={`tel:${profile?.phone || "+919023456789"}`} className="text-white hover:text-[#d4af37] transition-colors text-sm sm:text-base font-medium">
                      {profile?.phone || "+91 90234 56789"}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl border border-[#d4af37]/30 bg-[#d4af37]/10 text-[#d4af37]">
                    <MapPin size={16} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-gray-500 font-mono uppercase tracking-wider">Base Location</span>
                    <span className="text-white text-sm sm:text-base font-medium">
                      {profile?.location || "Gujarat, India"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </ScrollReveal>

          <ScrollReveal direction="right" delay={0.2}>
            <div className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md p-6">
              <h4 className="text-sm font-semibold text-[#d4af37] font-mono uppercase tracking-wider mb-3">
                Coaching Hours
              </h4>
              <p className="text-xs text-gray-400 leading-relaxed font-sans whitespace-pre-wrap">
                {profile?.coachingHours ? profile.coachingHours : (
                  <>
                    Monday – Saturday: 09:00 AM – 06:00 PM (IST)<br />
                    Seminar and corporate travel sessions booked on special reserves.
                  </>
                )}
              </p>
            </div>
          </ScrollReveal>
        </div>

        {/* Right Column: Form */}
        <div className="lg:col-span-7">
          <ScrollReveal direction="left" delay={0.1}>
            <div className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-md p-6 md:p-8">
              {submitted ? (
                <div className="text-center py-10 space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 border border-green-500/30 text-green-500 mb-2">
                    <CheckCircle size={32} />
                  </div>
                  <h3 className="text-xl font-serif font-bold text-white">Message Dispatched!</h3>
                  <p className="text-gray-400 text-sm max-w-md mx-auto">
                    Thank you for connecting, Pradeep. Your inquiry has been received. I will review and follow back within 24–48 hours.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 px-6 py-2 rounded-full border border-white/10 hover:bg-[#d4af37]/10 hover:text-[#d4af37] text-white text-sm transition-all cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h3 className="text-lg font-semibold text-white leading-snug">
                    Send a Message
                  </h3>

                  {error && (
                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-mono">
                      {error}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label htmlFor="name" className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                        Full Name *
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Pradeep Parmar"
                        className="w-full px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-black border border-white/10 rounded-xl text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all font-sans"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label htmlFor="email" className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                        Email Address *
                      </label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="pradeep@example.com"
                        className="w-full px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-black border border-white/10 rounded-xl text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all font-sans"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="subject" className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                      Subject
                    </label>
                    <input
                      id="subject"
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Corporate Excel Training proposal"
                      className="w-full px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-black border border-white/10 rounded-xl text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="message" className="block text-[10px] text-gray-400 uppercase tracking-widest font-mono">
                      Your Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={5}
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Hi Pradeep, I would like to book an NLP consultation or coordinate a technical workshop..."
                      className="w-full px-4 py-3 bg-white/[0.03] hover:bg-white/[0.05] focus:bg-black border border-white/10 rounded-xl text-white text-sm focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37] outline-none transition-all font-sans resize-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-[#d4af37] to-amber-500 hover:opacity-90 disabled:opacity-50 text-black font-semibold rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    {submitting ? (
                      <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send size={16} />
                        Dispatch Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </div>

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

          {/* Card 3: Home portal */}
          <ScrollReveal delay={0.3}>
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
                    03 / HOME PORTAL
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
        </div>
      </section>
    </div>
  );
}
