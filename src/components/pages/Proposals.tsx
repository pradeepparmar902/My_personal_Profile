import React, { useState, useEffect } from "react";
import { Upload, Share2, Eye, Copy, Trash2, Check, FileText, Sparkles, Globe } from "lucide-react";

export interface ProposalItem {
  id: string;
  filename: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  wrapperUrl?: string; // lightweight WhatsApp share page URL
}

// Simple IndexedDB storage for large HTML proposal files (prevents localStorage 5MB quota crashes)
const DB_NAME = "PP_Proposals_DB";
const STORE_NAME = "proposals_files";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveFileToIndexedDB(id: string, htmlContent: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(htmlContent, id);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error("Error saving file to IndexedDB:", e);
  }
}

async function getFileFromIndexedDB(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    return new Promise((resolve) => {
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

async function deleteFileFromIndexedDB(id: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
  } catch (e) {}
}

export default function Proposals() {
  const [proposals, setProposals] = useState<ProposalItem[]>(() => {
    try {
      const saved = localStorage.getItem("pp_proposals_meta_list");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {}
    
    return [
      {
        id: "sample-1",
        filename: "AI_Syllabus_for_Professional.html",
        title: "🎓 AI Syllabus for Professional Masterclass",
        description: "Comprehensive AI & LLM training program with voice notes, hands-on modules, and interactive video walkthroughs.",
        imageUrl: "./logo-white.png",
        date: new Date().toLocaleDateString()
      }
    ];
  });

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    try {
      const cleanMeta = proposals.map(({ id, filename, title, description, imageUrl, date }) => ({
        id, filename, title, description, imageUrl, date
      }));
      localStorage.setItem("pp_proposals_meta_list", JSON.stringify(cleanMeta));
    } catch (e) {
      console.warn("localStorage setItem error handled safely:", e);
    }
  }, [proposals]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    processFile(files[0]);
  };

  const processFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith(".html") && !file.name.toLowerCase().endsWith(".htm")) {
      alert("Please upload an exported HTML file (.html)");
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const content = evt.target?.result as string || "";
        
        const parser = new DOMParser();
        const doc = parser.parseFromString(content, "text/html");

        const title = doc.querySelector('meta[property="og:title"]')?.getAttribute("content") ||
                      doc.title.replace(" | LearningOS", "") ||
                      file.name.replace(".html", "").replace(/_/g, " ");

        const description = doc.querySelector('meta[property="og:description"]')?.getAttribute("content") ||
                            "Interactive Executive Proposal featuring voice recordings, video clips, and hands-on modules.";

        let imageUrl = doc.querySelector('meta[property="og:image"]')?.getAttribute("content") ||
                       doc.querySelector("img")?.getAttribute("src") ||
                       "./logo-white.png";

        if (imageUrl.startsWith("data:image") && imageUrl.length > 50000) {
          const firstImgInDoc = doc.querySelector(".note-content img");
          if (firstImgInDoc && firstImgInDoc.getAttribute("src") && !firstImgInDoc.getAttribute("src")?.startsWith("data:")) {
            imageUrl = firstImgInDoc.getAttribute("src")!;
          } else {
            imageUrl = "./logo-white.png";
          }
        }

        // Clean filename (replaces spaces with underscores to prevent WhatsApp link truncation)
        const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const propId = "prop-" + Date.now();
        
        let imageBase64 = null;
        let finalHtmlContent = content;
        const ogImageMatch = content.match(/<meta\s+property=["']og:image["']\s+content=["'](data:image\/[^"']+)["']/i);
        if (ogImageMatch) {
            imageBase64 = ogImageMatch[1];
            const coverFilename = cleanFilename.replace(/\.html?$/i, "") + "-cover.png";
            finalHtmlContent = content.replace(imageBase64, `https://pradeepparmar.com/proposals/${coverFilename}`);
        }

        // Call new lightweight cover+wrapper endpoint (sends ONLY the image, not the 18MB HTML)
        let wrapperUrl: string | undefined;
        try {
          const coverResp = await fetch('/api/save-proposal-cover', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              filename: cleanFilename,
              title,
              description,
              imageBase64: imageBase64  // only the image data — much smaller
            })
          });
          if (coverResp.ok) {
            const coverData = await coverResp.json();
            wrapperUrl = coverData.wrapperUrl;
          }
        } catch (coverErr) {
          console.warn("Cover wrapper generation failed:", coverErr);
        }

        // 2. Store full heavy HTML file in IndexedDB safely
        await saveFileToIndexedDB(propId, finalHtmlContent);

        // 3. Also save full HTML on server disk
        try {
          await fetch('/api/upload-proposal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ filename: cleanFilename, htmlContent: finalHtmlContent })
          });
        } catch (apiErr) {
          console.warn("Server disk upload fallback:", apiErr);
        }

        const newProposal: ProposalItem = {
          id: propId,
          filename: cleanFilename,
          title,
          description,
          imageUrl,
          date: new Date().toLocaleDateString(),
          wrapperUrl
        };

        setProposals(prev => [newProposal, ...prev]);
      } catch (err) {
        console.error("Error processing proposal file:", err);
        alert("Could not process HTML file. Please try again.");
      } finally {
        setIsUploading(false);
      }
    };

    reader.readAsText(file);
  };

  const getProposalUrl = (item: ProposalItem) => {
    const origin = window.location.origin;
    return `${origin}/proposals/${item.filename}`;
  };

  const getShareUrl = (item: ProposalItem) => {
    // Use the lightweight wrapper page for sharing (it has real og:image for WhatsApp)
    // Fall back to direct URL if wrapper wasn't generated yet
    return item.wrapperUrl || getProposalUrl(item);
  };

  const handleShareWhatsApp = (item: ProposalItem) => {
    const url = getShareUrl(item);
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(url)}`, "_blank");
  };

  const handleCopyLink = (item: ProposalItem) => {
    const url = getShareUrl(item);
    navigator.clipboard.writeText(url);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenProposal = async (item: ProposalItem) => {
    const dbContent = await getFileFromIndexedDB(item.id);
    if (dbContent) {
      const blob = new Blob([dbContent], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      window.open(url, "_blank");
    } else {
      window.open(getProposalUrl(item), "_blank");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this proposal?")) {
      await deleteFileFromIndexedDB(id);
      setProposals(prev => prev.filter(p => p.id !== id));
    }
  };

  return (
    <div className="pt-28 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37] text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles size={14} /> Executive Proposals Portal
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
          Interactive <span className="text-[#d4af37]">Proposals & Presentations</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Upload exported HTML proposals to host them on your personal website and generate eye-catching visual preview cards on WhatsApp!
        </p>
      </div>

      {/* Upfront Upload Box */}
      <div className="mb-12 max-w-2xl mx-auto">
        <div className="relative border-2 border-dashed border-[#d4af37]/40 hover:border-[#d4af37] bg-black/40 backdrop-blur-md rounded-3xl p-8 text-center transition-all group">
          <input
            type="file"
            accept=".html,.htm"
            onChange={handleFileUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
          />
          <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-16 h-16 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform">
              <Upload size={28} />
            </div>
            <h3 className="text-lg font-serif font-semibold text-white">
              {isUploading ? "Processing Proposal HTML..." : "Click or Drag & Drop HTML Proposal File"}
            </h3>
            <p className="text-xs text-gray-400 max-w-md">
              Upload exported LearningOS proposal files. Auto-extracts Open Graph title, description, and cover thumbnail for WhatsApp cards.
            </p>
          </div>
        </div>
      </div>

      {/* Proposals List Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-serif font-semibold text-white flex items-center gap-2">
            <FileText className="text-[#d4af37]" size={20} />
            Hosted Proposals ({proposals.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proposals.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md p-6 flex flex-col justify-between hover:border-[#d4af37]/40 transition-all shadow-xl"
            >
              {/* Card Header & Preview */}
              <div>
                <div className="flex items-start gap-4 mb-4">
                  {/* Cover Thumbnail (Red Circle Preview) */}
                  <div className="w-20 h-20 rounded-xl border border-[#d4af37]/30 bg-black overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt="Cover"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "./logo-white.png";
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-base md:text-lg text-white truncate mb-1" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">
                      {item.description}
                    </p>
                    <span className="inline-block text-[10px] text-gray-500 font-mono">
                      📅 {item.date} • {item.filename}
                    </span>
                  </div>
                </div>

                {/* Live Link Badge */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 mb-4 text-xs font-mono text-gray-300 truncate flex items-center gap-2">
                  <Globe size={14} className="text-[#d4af37] flex-shrink-0" />
                  <span className="truncate">{getProposalUrl(item)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                {/* WhatsApp Share Button */}
                <button
                  onClick={() => handleShareWhatsApp(item)}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg"
                >
                  <Share2 size={14} /> Share on WhatsApp
                </button>

                {/* View Proposal Button */}
                <button
                  onClick={() => handleOpenProposal(item)}
                  className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Eye size={14} /> View
                </button>

                {/* Copy Link Button */}
                <button
                  onClick={() => handleCopyLink(item)}
                  className="bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white p-2.5 rounded-xl transition-colors cursor-pointer"
                  title="Copy Live Share Link"
                >
                  {copiedId === item.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>

                {/* Delete Button */}
                <button
                  onClick={() => handleDelete(item.id)}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2.5 rounded-xl transition-colors cursor-pointer"
                  title="Delete Proposal"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
