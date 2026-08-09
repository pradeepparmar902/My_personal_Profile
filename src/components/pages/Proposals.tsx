import React, { useState, useEffect, useRef } from "react";
import { Upload, Share2, Eye, Copy, Trash2, Check, FileText, Sparkles, Globe, Image, X, ArrowRight } from "lucide-react";

export interface ProposalItem {
  id: string;
  filename: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
  wrapperUrl?: string;
}

// ── IndexedDB helpers for large HTML files ──────────────────────────────────
const DB_NAME = "PP_Proposals_DB";
const STORE_NAME = "proposals_files";
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror  = () => reject(request.error);
  });
}
async function saveFileToIndexedDB(id: string, html: string) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(html, id);
    return new Promise<void>((res, rej) => { tx.oncomplete = () => res(); tx.onerror = () => rej(tx.error); });
  } catch (e) { console.error(e); }
}
async function getFileFromIndexedDB(id: string): Promise<string | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).get(id);
    return new Promise((res) => { req.onsuccess = () => res(req.result || null); req.onerror = () => res(null); });
  } catch { return null; }
}
async function deleteFileFromIndexedDB(id: string) {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
  } catch {}
}

// ── Compress image to max 1200×630 JPEG ≈ 100–200 KB ──────────────────────
function compressImageFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const src = e.target?.result as string;
      const img = new window.Image();
      img.onload = () => {
        const MAX_W = 1200, MAX_H = 630;
        const ratio = Math.min(MAX_W / img.width, MAX_H / img.height, 1);
        const canvas = document.createElement("canvas");
        canvas.width  = Math.round(img.width  * ratio);
        canvas.height = Math.round(img.height * ratio);
        const ctx = canvas.getContext("2d");
        if (!ctx) { resolve(""); return; }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve("");
      img.src = src;
    };
    reader.onerror = () => resolve("");
    reader.readAsDataURL(file);
  });
}

// ── Pending draft before user confirms ────────────────────────────────────
interface PendingProposal {
  htmlContent: string;
  filename: string;
  title: string;
  description: string;
}

export default function Proposals() {
  const [proposals, setProposals] = useState<ProposalItem[]>(() => {
    try {
      const saved = localStorage.getItem("pp_proposals_meta_list");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [copiedId, setCopiedId]     = useState<string | null>(null);
  const [isSaving, setIsSaving]     = useState(false);
  const [pending, setPending]       = useState<PendingProposal | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [coverFile, setCoverFile]   = useState<File | null>(null);
  const [editTitle, setEditTitle]   = useState("");
  const [editDesc, setEditDesc]     = useState("");
  const coverInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const cleanMeta = proposals.map(({ id, filename, title, description, imageUrl, date, wrapperUrl }) => ({
        id, filename, title, description, imageUrl, date, wrapperUrl
      }));
      localStorage.setItem("pp_proposals_meta_list", JSON.stringify(cleanMeta));
    } catch (e) { console.warn(e); }
  }, [proposals]);

  // ── Step 1: HTML file selected ─────────────────────────────────────────
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".html") && !file.name.toLowerCase().endsWith(".htm")) {
      alert("Please upload an HTML file (.html)");
      return;
    }
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string || "";
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");

      const title = doc.querySelector('meta[property="og:title"]')?.getAttribute("content")
        || doc.title.replace(" | LearningOS", "")
        || file.name.replace(/\.html?$/i, "").replace(/_/g, " ");
      const desc = doc.querySelector('meta[property="og:description"]')?.getAttribute("content")
        || "Interactive Executive Proposal featuring voice recordings, video clips, and hands-on modules.";
      const cleanFilename = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");

      setPending({ htmlContent: content, filename: cleanFilename, title, description: desc });
      setEditTitle(title);
      setEditDesc(desc);
      setCoverPreview("");
      setCoverFile(null);
    };
    reader.readAsText(file);
    // reset input so same file can be re-uploaded
    e.target.value = "";
  };

  // ── Step 2: Cover image selected ──────────────────────────────────────
  const handleCoverImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const preview = await compressImageFile(file);
    setCoverPreview(preview);
  };

  // ── Step 2: Confirm & publish ──────────────────────────────────────────
  const handleConfirmPublish = async () => {
    if (!pending) return;
    setIsSaving(true);
    try {
      const compressedBase64 = coverFile ? await compressImageFile(coverFile) : "";

      // 1. Generate OG wrapper + save cover PNG on server
      let wrapperUrl: string | undefined;
      try {
        const resp = await fetch("/api/save-proposal-cover", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: pending.filename,
            title: editTitle,
            description: editDesc,
            imageBase64: compressedBase64 || null
          })
        });
        if (resp.ok) {
          const data = await resp.json();
          wrapperUrl = data.wrapperUrl;
        }
      } catch (err) { console.warn("Cover wrapper API failed:", err); }

      const propId = "prop-" + Date.now();

      // 2. Store full HTML in IndexedDB for local viewing
      await saveFileToIndexedDB(propId, pending.htmlContent);

      // 3. Save full HTML on server disk
      try {
        await fetch("/api/upload-proposal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: pending.filename, htmlContent: pending.htmlContent })
        });
      } catch {}

      const newProposal: ProposalItem = {
        id: propId,
        filename: pending.filename,
        title: editTitle,
        description: editDesc,
        imageUrl: compressedBase64 || "./logo-white.png",
        date: new Date().toLocaleDateString(),
        wrapperUrl
      };

      setProposals(prev => [newProposal, ...prev]);
      setPending(null);
      setCoverPreview("");
      setCoverFile(null);
    } catch (err) {
      console.error(err);
      alert("Upload failed. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const getProposalUrl = (item: ProposalItem) => `${window.location.origin}/proposals/${item.filename}`;
  const getShareUrl   = (item: ProposalItem) => item.wrapperUrl || getProposalUrl(item);

  const handleShareWhatsApp = (item: ProposalItem) =>
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(getShareUrl(item))}`, "_blank");

  const handleCopyLink = (item: ProposalItem) => {
    navigator.clipboard.writeText(getShareUrl(item));
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenProposal = async (item: ProposalItem) => {
    const db = await getFileFromIndexedDB(item.id);
    if (db) {
      const blob = new Blob([db], { type: "text/html" });
      window.open(URL.createObjectURL(blob), "_blank");
    } else {
      window.open(getProposalUrl(item), "_blank");
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Remove this proposal?")) {
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
          Upload your HTML proposals and generate beautiful WhatsApp preview cards with your chosen cover image.
        </p>
      </div>

      {/* ── Step 1: HTML Upload ── */}
      {!pending && (
        <div className="mb-12 max-w-2xl mx-auto">
          <label className="relative border-2 border-dashed border-[#d4af37]/40 hover:border-[#d4af37] bg-black/40 backdrop-blur-md rounded-3xl p-8 text-center transition-all group cursor-pointer block">
            <input type="file" accept=".html,.htm" onChange={handleFileUpload} className="hidden" />
            <div className="flex flex-col items-center justify-center gap-3">
              <div className="w-16 h-16 rounded-full border border-[#d4af37]/30 bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37] group-hover:scale-110 transition-transform">
                <Upload size={28} />
              </div>
              <h3 className="text-lg font-serif font-semibold text-white">Click or Drag & Drop HTML Proposal File</h3>
              <p className="text-xs text-gray-400 max-w-md">
                Step 1 of 2 — Select your exported LearningOS HTML file. You'll set the cover image in the next step.
              </p>
            </div>
          </label>
        </div>
      )}

      {/* ── Step 2: Setup Panel (after HTML selected) ── */}
      {pending && (
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="border border-[#d4af37]/40 bg-black/60 backdrop-blur-md rounded-3xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <ArrowRight size={18} className="text-[#d4af37]" /> Setup WhatsApp Card
              </h3>
              <button onClick={() => setPending(null)} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {/* Title */}
            <div className="mb-4">
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Title</label>
              <input
                value={editTitle}
                onChange={e => setEditTitle(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]/60"
              />
            </div>

            {/* Description */}
            <div className="mb-6">
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-1 block">Description</label>
              <textarea
                value={editDesc}
                onChange={e => setEditDesc(e.target.value)}
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#d4af37]/60 resize-none"
              />
            </div>

            {/* Cover Image */}
            <div className="mb-6">
              <label className="text-xs text-gray-400 uppercase tracking-wider mb-2 block">
                Cover Image for WhatsApp Preview <span className="text-[#d4af37]">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Upload the same image you set in "WhatsApp Card & Cover Settings" in LearningOS (the EDUCATION 2026 / cover banner). This will appear when the link is shared on WhatsApp.
              </p>
              <div className="flex items-center gap-4">
                {coverPreview ? (
                  <div className="relative w-32 h-20 rounded-xl overflow-hidden border border-[#d4af37]/40 flex-shrink-0">
                    <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                    <button
                      onClick={() => { setCoverPreview(""); setCoverFile(null); }}
                      className="absolute top-1 right-1 w-5 h-5 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors cursor-pointer"
                    >
                      <X size={10} />
                    </button>
                  </div>
                ) : (
                  <div className="w-32 h-20 rounded-xl border-2 border-dashed border-white/20 flex items-center justify-center text-gray-600 flex-shrink-0">
                    <Image size={24} />
                  </div>
                )}
                <div>
                  <button
                    onClick={() => coverInputRef.current?.click()}
                    className="bg-[#d4af37]/20 hover:bg-[#d4af37]/30 border border-[#d4af37]/40 text-[#d4af37] text-xs font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                  >
                    {coverPreview ? "Change Cover Image" : "📷 Upload Cover Image"}
                  </button>
                  <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverImageSelect} className="hidden" />
                  <p className="text-[10px] text-gray-500 mt-1.5">PNG, JPG, WEBP — auto-compressed to 1200×630</p>
                </div>
              </div>
            </div>

            {/* File info */}
            <div className="bg-white/5 rounded-xl px-4 py-3 mb-6 text-xs text-gray-400 font-mono">
              📄 {pending.filename}
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setPending(null)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-gray-400 hover:text-white text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPublish}
                disabled={isSaving}
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                {isSaving ? "Publishing..." : "✅ Publish & Generate WhatsApp Card"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Proposals Grid ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <h2 className="text-xl font-serif font-semibold text-white flex items-center gap-2">
            <FileText className="text-[#d4af37]" size={20} />
            Hosted Proposals ({proposals.length})
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {proposals.map((item) => (
            <div key={item.id} className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur-md p-6 flex flex-col justify-between hover:border-[#d4af37]/40 transition-all shadow-xl">
              <div>
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-20 h-20 rounded-xl border border-[#d4af37]/30 bg-black overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img
                      src={item.imageUrl}
                      alt="Cover"
                      className="w-full h-full object-cover"
                      onError={(e) => { e.currentTarget.src = "./logo-white.png"; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-base md:text-lg text-white truncate mb-1" title={item.title}>
                      {item.title}
                    </h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mb-2">{item.description}</p>
                    <span className="inline-block text-[10px] text-gray-500 font-mono">
                      📅 {item.date} • {item.filename}
                    </span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 mb-4 text-xs font-mono text-gray-300 truncate flex items-center gap-2">
                  <Globe size={14} className="text-[#d4af37] flex-shrink-0" />
                  <span className="truncate">{getProposalUrl(item)}</span>
                </div>

                {item.wrapperUrl && (
                  <div className="bg-emerald-900/20 border border-emerald-500/20 rounded-xl p-2.5 mb-4 text-xs text-emerald-400 truncate flex items-center gap-2">
                    <Share2 size={12} className="flex-shrink-0" />
                    <span className="truncate">WhatsApp card: {item.wrapperUrl}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                <button onClick={() => handleShareWhatsApp(item)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg">
                  <Share2 size={14} /> Share on WhatsApp
                </button>
                <button onClick={() => handleOpenProposal(item)} className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer">
                  <Eye size={14} /> View
                </button>
                <button onClick={() => handleCopyLink(item)} className="bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white p-2.5 rounded-xl transition-colors cursor-pointer" title="Copy Share Link">
                  {copiedId === item.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                </button>
                <button onClick={() => handleDelete(item.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2.5 rounded-xl transition-colors cursor-pointer" title="Delete">
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
