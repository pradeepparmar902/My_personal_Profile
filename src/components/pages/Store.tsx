import React, { useState } from "react";
import { useProfile } from "../../lib/ProfileContext";
import { cleanGoogleDriveUrl } from "../../lib/imageUtils";
import { ExternalLink, ShoppingBag, Star, Zap, ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import ScrollReveal from "../ui/ScrollReveal";
import { ResourceItem } from "../../types";

export default function Store({ setCurrentTab }: { setCurrentTab: (tab: string) => void }) {
  const { resources, profile } = useProfile();
  
  const products = resources.filter(r => r.type === 'product' && !r.isHidden);
  const affiliates = resources.filter(r => r.type === 'affiliate' && !r.isHidden);
  const references = resources.filter(r => r.type === 'reference' && !r.isHidden);

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 md:px-6 max-w-7xl mx-auto space-y-24">
      
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
                      <a 
                        href={product.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-6 py-2.5 bg-[#d4af37] hover:bg-[#c4a137] text-black font-semibold rounded-full transition-colors flex items-center gap-2"
                      >
                        Buy Now
                      </a>
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

    </div>
  );
}