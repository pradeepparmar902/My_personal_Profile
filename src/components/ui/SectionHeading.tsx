import React from "react";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  badge?: string;
  centered?: boolean;
}

export default function SectionHeading({ title, subtitle, badge, centered = true }: SectionHeadingProps) {
  return (
    <div className={`mb-12 ${centered ? "text-center" : "text-left"}`}>
      {badge && (
        <span className="inline-block px-3 py-1 mb-3 text-xs tracking-widest font-mono text-[#d4af37] uppercase bg-[#d4af37]/10 rounded-full border border-[#d4af37]/20">
          {badge}
        </span>
      )}
      <h2 className="text-3xl md:text-4xl font-semibold tracking-tight text-white mb-4">
        {title}
        <span className="block h-1 w-20 bg-gradient-to-r from-[#d4af37] to-amber-500 rounded-full mt-3 mx-auto" style={{ marginLeft: centered ? "auto" : "0" }} />
      </h2>
      {subtitle && (
        <p className="text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
          {subtitle}
        </p>
      )}
    </div>
  );
}
