/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { ProfileProvider, useProfile } from "./lib/ProfileContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./components/pages/Home";
import About from "./components/pages/About";
import Portfolio from "./components/pages/Portfolio";
import Contact from "./components/pages/Contact";
import Admin from "./components/pages/Admin";
import { motion, AnimatePresence } from "motion/react";
import { lazy, Suspense } from "react";

const Background3D = lazy(() => import("./components/three/Background3D"));

function MainAppContent() {
  const isDeepLinked = (() => {
    const params = new URLSearchParams(window.location.search);
    return params.has("register") || params.has("workshop");
  })();

  const [currentTab, setCurrentTab] = useState<string>(() => {
    return isDeepLinked ? "portfolio" : "home";
  });
  const { loading } = useProfile();

  // Initial loader layout
  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0a0a]">
        <div className="relative flex items-center justify-center w-20 h-20 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/5 animate-pulse mb-4">
          <span className="font-serif font-bold text-2xl text-[#d4af37]">PP</span>
        </div>
        <div className="w-40 h-1 bg-white/5 rounded-full overflow-hidden">
          <div className="h-full w-1/2 bg-gradient-to-r from-[#d4af37] to-amber-500 rounded-full animate-[shimmer_1.5s_infinite]" 
               style={{
                 backgroundImage: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)"
               }} />
        </div>
        <p className="text-gray-500 font-mono text-[10px] uppercase tracking-widest mt-3">
          Synchronizing Luxury 3D Sandbox...
        </p>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentTab) {
      case "home":
        return <Home setCurrentTab={setCurrentTab} />;
      case "about":
        return <About setCurrentTab={setCurrentTab} />;
      case "portfolio":
        return <Portfolio setCurrentTab={setCurrentTab} />;
      case "contact":
        return <Contact setCurrentTab={setCurrentTab} />;
      case "admin":
        return <Admin />;
      default:
        return <Home setCurrentTab={setCurrentTab} />;
    }
  };

  return (
    <div className="relative min-h-screen text-white overflow-x-hidden font-sans selection:bg-[#d4af37] selection:text-black">
      {/* 3D Canvas Layer (Deferred for Performance, disabled entirely on deep links to prevent WebGL lockups) */}
      {!isDeepLinked && (
        <Suspense fallback={null}>
          <Background3D />
        </Suspense>
      )}

      {/* Navigation Headers */}
      <Navbar currentTab={currentTab} setCurrentTab={setCurrentTab} />

      {/* Main Pages Content Frame with Transitions */}
      <main className="relative pb-12 z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: [0.25, 1, 0.5, 1] }}
          >
            {renderPage()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer coordinates */}
      <Footer setCurrentTab={setCurrentTab} />
    </div>
  );
}

export default function App() {
  return (
    <ProfileProvider>
      <MainAppContent />
    </ProfileProvider>
  );
}
