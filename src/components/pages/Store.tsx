import React, { useState } from "react";
import { useProfile } from "../../lib/ProfileContext";
import { cleanGoogleDriveUrl } from "../../lib/imageUtils";
import { ExternalLink, ShoppingBag, Star, Zap, ShoppingCart, X, Mail } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ScrollReveal from "../ui/ScrollReveal";
import { ResourceItem } from "../../types";

export default function Store({ setCurrentTab }: { setCurrentTab: (tab: string) => void }) {
  const { resources, addMessage } = useProfile();
  
  const products = resources.filter(r => r.type === 'product' && !r.isHidden);
  const affiliates = resources.filter(r => r.type === 'affiliate' && !r.isHidden);
  const references = resources.filter(r => r.type === 'reference' && !r.isHidden);

  const [selectedProductForContact, setSelectedProductForContact] = useState<ResourceItem | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", mobile: "", message: "" });
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSubmitted, setContactSubmitted] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

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
        subject: `Product Inquiry: ${selectedProductForContact?.title}`,
        message: contactForm.message,
        createdAt: new Date().toISOString()
      });
      setContactSubmitted(true);
      setContactForm({ name: "", email: "", mobile: "", message: "" });
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
    }, 300);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-6 max-w-7xl mx-auto space-y-24 relative">
      
      {/* Header Section */}
      <ScrollReveal>
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white leading-tight">
            Curated <span className="text-[#d4af37]">Resources</span> & Store
          </h1>
          <p className="text-gray-400 text-lg md:text-xl leading-relaxed">
            Explore my premium materials, highly recommended tools, and essential resources to accelerate your journey.
          </p>
        </div>
      </ScrollReveal>

      {/* SECTION 1: MY PRODUCTS */}
      {products.length > 0 && (
        <ScrollReveal delay={0.2}>
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-[#d4af37]/10 rounded-xl">
                <ShoppingBag className="text-[#d4af37]" size={28} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Premium Materials</h2>
                <p className="text-gray-400 text-sm md:text-base mt-1">Exclusive products and advanced guides.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id} className="group rounded-2xl bg-white/[0.02] border border-white/5 hover:border-[#d4af37]/30 transition-all overflow-hidden shadow-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.15)] flex flex-col">
                  {product.imageUrl && (
                    <div className="aspect-[4/3] w-full overflow-hidden relative">
                      <img 
                        src={cleanGoogleDriveUrl(product.imageUrl)} 
                        alt={product.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                    </div>
                  )}
                  <div className="p-6 md:p-8 flex flex-col flex-grow">
                    <h3 className="text-xl font-bold text-white mb-3 group-hover:text-[#d4af37] transition-colors">{product.title}</h3>
                    <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">{product.description}</p>
                    
                    <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-auto">
                      {product.price && <span className="text-lg font-bold text-white">{product.price}</span>}
                      {product.allowRegistration ? (
                        <button
                          onClick={() => setSelectedProductForContact(product)}
                          className="px-6 py-2.5 bg-[#d4af37] hover:bg-[#c4a137] text-black font-semibold rounded-full transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          {product.price ? "Buy Now" : "I am interested book now"}
                        </button>
                      ) : (
                        <a 
                          href={product.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-2.5 bg-[#d4af37] hover:bg-[#c4a137] text-black font-semibold rounded-full transition-colors flex items-center gap-2"
                        >
                          {product.price ? "Buy Now" : "I am interested book now"}
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

      {/* SECTION 2: AFFILIATES */}
      {affiliates.length > 0 && (
        <ScrollReveal delay={0.3}>
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-pink-500/10 rounded-xl">
                <Star className="text-pink-500" size={28} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Recommended Gear</h2>
                <p className="text-gray-400 text-sm md:text-base mt-1">Tools and books I personally use and highly recommend.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {affiliates.map((aff) => (
                <a 
                  key={aff.id} 
                  href={aff.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col sm:flex-row gap-6 bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-pink-500/30 p-4 md:p-6 rounded-2xl transition-all"
                >
                  {aff.imageUrl && (
                    <div className="w-full sm:w-40 aspect-square rounded-xl overflow-hidden shrink-0">
                      <img 
                        src={cleanGoogleDriveUrl(aff.imageUrl)} 
                        alt={aff.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="flex flex-col justify-center">
                    {aff.platform && (
                      <span className="text-[10px] font-mono tracking-widest uppercase text-pink-500 mb-2">{aff.platform}</span>
                    )}
                    <h3 className="text-lg font-bold text-white mb-2 group-hover:text-pink-400 transition-colors">{aff.title}</h3>
                    <p className="text-gray-400 text-sm mb-4 line-clamp-3">{aff.description}</p>
                    {aff.personalNote && (
                      <div className="bg-pink-500/5 border border-pink-500/10 px-4 py-3 rounded-lg mt-auto">
                        <p className="text-xs text-pink-200/80 italic line-clamp-2">" {aff.personalNote} "</p>
                      </div>
                    )}
                  </div>
                </a>
              ))}
            </div>
            <p className="text-center text-[10px] text-gray-600 mt-6 max-w-2xl mx-auto">
              *Disclaimer: Some of these links are affiliate links. If you purchase through them, I may earn a small commission at no extra cost to you. This helps support my work!
            </p>
          </div>
        </ScrollReveal>
      )}

      {/* SECTION 3: REFERENCES */}
      {references.length > 0 && (
        <ScrollReveal delay={0.4}>
          <div className="space-y-12">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/10 rounded-xl">
                <Zap className="text-blue-500" size={28} />
              </div>
              <div>
                <h2 className="text-2xl md:text-3xl font-serif font-bold text-white">Trusted Tools</h2>
                <p className="text-gray-400 text-sm md:text-base mt-1">Software and platforms I use to run my business and study.</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {references.map((ref) => (
                <a
                  key={ref.id}
                  href={ref.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group p-5 bg-white/[0.02] border border-white/5 hover:bg-blue-500/5 hover:border-blue-500/30 rounded-xl flex items-center justify-between transition-all"
                >
                  <div className="truncate pr-4">
                    <h4 className="font-semibold text-white group-hover:text-blue-400 transition-colors truncate">{ref.title}</h4>
                    <p className="text-xs text-gray-500 truncate mt-1">{ref.description}</p>
                  </div>
                  <ExternalLink size={16} className="text-gray-600 group-hover:text-blue-400 shrink-0 transition-colors" />
                </a>
              ))}
            </div>
          </div>
        </ScrollReveal>
      )}

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
                    <Mail className="text-[#d4af37]" size={18} />
                    <div>
                      <h3 className="text-base font-semibold text-white">Product Inquiry</h3>
                      <p className="text-[10px] text-gray-400 font-mono tracking-wider uppercase mt-0.5">Send a message</p>
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
                    <h3 className="text-2xl font-serif font-bold text-white">Message Sent!</h3>
                    <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
                      Thank you for your interest in "{selectedProductForContact.title}". I'll get back to you shortly.
                    </p>
                    <button
                      onClick={closeContactModal}
                      className="mt-6 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 text-white font-medium hover:bg-white/10 transition-colors"
                    >
                      Close Window
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <p className="text-xs text-gray-400 mb-4 leading-relaxed">
                      Please fill out the form below to inquire about <strong className="text-white">"{selectedProductForContact.title}"</strong>.
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

                    <div className="pt-4 flex justify-end">
                      <button
                        type="submit"
                        disabled={contactSubmitting}
                        className="px-6 py-2.5 rounded-full bg-gradient-to-r from-[#d4af37] to-amber-500 text-black font-semibold text-sm shadow-lg hover:shadow-[0_0_15px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                      >
                        {contactSubmitting ? "Sending..." : "Send Inquiry"}
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
