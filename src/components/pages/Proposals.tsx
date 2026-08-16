import React, { useState, useEffect, useRef } from "react";
import { Upload, Share2, Eye, Copy, Trash2, Check, FileText, Sparkles, Globe, Image, X, ArrowRight, Mail, Download, RefreshCw, HelpCircle } from "lucide-react";

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

interface PendingProposal {
  htmlContent: string;
  filename: string;
  title: string;
  description: string;
  targetProposalId?: string; // set if updating an existing proposal!
}

export default function Proposals() {
  const [proposals, setProposals] = useState<ProposalItem[]>(() => {
    try {
      const saved = localStorage.getItem("pp_proposals_meta_list");
      if (saved) return JSON.parse(saved);
    } catch {}
    return [];
  });

  const [copiedId, setCopiedId]         = useState<string | null>(null);
  const [isSaving, setIsSaving]         = useState(false);
  const [pending, setPending]           = useState<PendingProposal | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>("");
  const [coverFile, setCoverFile]       = useState<File | null>(null);
  const [editTitle, setEditTitle]       = useState("");
  const [editDesc, setEditDesc]         = useState("");
  const [activeModalItem, setActiveModalItem] = useState<ProposalItem | null>(null);
  
  const coverInputRef  = useRef<HTMLInputElement>(null);
  const updateInputRef = useRef<HTMLInputElement>(null);
  const [updatingProposal, setUpdatingProposal] = useState<ProposalItem | null>(null);

  useEffect(() => {
    try {
      const cleanMeta = proposals.map(({ id, filename, title, description, imageUrl, date, wrapperUrl }) => ({
        id, filename, title, description, imageUrl, date, wrapperUrl
      }));
      localStorage.setItem("pp_proposals_meta_list", JSON.stringify(cleanMeta));
    } catch (e) { console.warn(e); }
  }, [proposals]);

  // ── Step 1: Upload New HTML File ─────────────────────────────────────────
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
    e.target.value = "";
  };

  // ── Step 1 (Update Mode): Trigger update for existing proposal ──────────
  const triggerUpdateProposal = (item: ProposalItem) => {
    setUpdatingProposal(item);
    if (updateInputRef.current) {
      updateInputRef.current.click();
    }
  };

  const handleUpdateFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !updatingProposal) return;
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
        || updatingProposal.title;
      const desc = doc.querySelector('meta[property="og:description"]')?.getAttribute("content")
        || updatingProposal.description;

      // KEEP THE EXACT SAME FILENAME so URL NEVER CHANGES!
      setPending({
        htmlContent: content,
        filename: updatingProposal.filename,
        title: title,
        description: desc,
        targetProposalId: updatingProposal.id
      });

      setEditTitle(updatingProposal.title);
      setEditDesc(updatingProposal.description);
      setCoverPreview(updatingProposal.imageUrl.startsWith("data:") ? updatingProposal.imageUrl : "");
      setCoverFile(null);
      setUpdatingProposal(null);
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCoverImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    const preview = await compressImageFile(file);
    setCoverPreview(preview);
  };

  // ── Step 2: Confirm & Publish / Update ────────────────────────────────────
  const handleConfirmPublish = async () => {
    if (!pending) return;
    setIsSaving(true);
    try {
      let compressedBase64 = coverFile ? await compressImageFile(coverFile) : coverPreview;

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

      const propId = pending.targetProposalId || ("prop-" + Date.now());

      // 1. Update IndexedDB for local viewing
      await saveFileToIndexedDB(propId, pending.htmlContent);

      // 2. Overwrite server disk HTML file (URL stays identical!)
      try {
        await fetch("/api/upload-proposal", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: pending.filename, htmlContent: pending.htmlContent })
        });
      } catch {}

      const updatedProposal: ProposalItem = {
        id: propId,
        filename: pending.filename,
        title: editTitle,
        description: editDesc,
        imageUrl: compressedBase64 || "./logo-white.png",
        date: new Date().toLocaleDateString(),
        wrapperUrl
      };

      if (pending.targetProposalId) {
        // Replace existing item in state
        setProposals(prev => prev.map(p => p.id === pending.targetProposalId ? updatedProposal : p));
      } else {
        // Add new proposal to top
        setProposals(prev => [updatedProposal, ...prev]);
      }

      setPending(null);
      setCoverPreview("");
      setCoverFile(null);
    } catch (err) {
      console.error(err);
      alert("Save failed. Please try again.");
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

  const handleCopyEmailHtml = (item: ProposalItem) => {
    const targetUrl = getProposalUrl(item);
    const imgUrl = item.imageUrl && !item.imageUrl.startsWith("data:") 
      ? item.imageUrl 
      : `${window.location.origin}/logo-white.png`;
    
    const htmlSnippet = `<a href="${targetUrl}" target="_blank" style="display:inline-block;text-decoration:none;"><img src="${imgUrl}" alt="${item.title.replace(/"/g, '&quot;')}" style="max-width:100%;height:auto;border-radius:12px;box-shadow:0 4px 20px rgba(0,0,0,0.15);" /></a>`;
    
    navigator.clipboard.writeText(htmlSnippet);
    setCopiedId(`email-${item.id}`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Download Clickable HTML Image Banner file
  const handleDownloadClickableHtml = (item: ProposalItem) => {
    const targetUrl = getProposalUrl(item);
    const imgUrl = item.imageUrl || `${window.location.origin}/logo-white.png`;

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>${item.title}</title>
<style>
  body { margin:0; padding:0; background:#0a0a0a; color:#fff; font-family:sans-serif; display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:100vh; text-align:center; }
  .banner-container { max-width:800px; padding:20px; box-sizing:border-box; }
  .clickable-img { width:100%; max-width:100%; border-radius:16px; box-shadow:0 10px 30px rgba(212,175,55,0.25); cursor:pointer; transition:transform 0.2s ease; }
  .clickable-img:hover { transform:scale(1.02); }
  .btn { display:inline-block; margin-top:20px; background:#d4af37; color:#000; font-weight:bold; padding:12px 28px; border-radius:30px; text-decoration:none; font-size:16px; }
</style>
</head>
<body>
<div class="banner-container">
  <a href="${targetUrl}" target="_blank">
    <img src="${imgUrl}" alt="${item.title}" class="clickable-img" />
  </a>
  <br/>
  <a href="${targetUrl}" target="_blank" class="btn">View Executive Proposal →</a>
</div>
<script>
  setTimeout(function(){ window.location.href = "${targetUrl}"; }, 800);
</script>
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Clickable_Image_${item.filename}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
      {/* Hidden file input for updating existing proposals */}
      <input ref={updateInputRef} type="file" accept=".html,.htm" onChange={handleUpdateFileSelected} className="hidden" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#d4af37]/40 bg-[#d4af37]/10 text-[#d4af37] text-xs font-semibold uppercase tracking-wider mb-4">
          <Sparkles size={14} /> Executive Proposals Portal
        </div>
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-white mb-4">
          Interactive <span className="text-[#d4af37]">Proposals & Presentations</span>
        </h1>
        <p className="text-gray-400 text-sm md:text-base">
          Upload HTML proposals, update existing proposals without changing shared URLs, and generate WhatsApp preview cards!
        </p>
      </div>

      {/* ── Step 1: Upload New HTML File ── */}
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
                Select your exported LearningOS HTML file. To update an existing proposal without changing its URL, use the "Update HTML" button on its card below.
              </p>
            </div>
          </label>
        </div>
      )}

      {/* ── Step 2: Setup / Update Panel ── */}
      {pending && (
        <div className="mb-12 max-w-2xl mx-auto">
          <div className="border border-[#d4af37]/40 bg-black/60 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                {pending.targetProposalId ? (
                  <>
                    <RefreshCw size={18} className="text-amber-400" /> Update Existing Proposal Content
                  </>
                ) : (
                  <>
                    <ArrowRight size={18} className="text-[#d4af37]" /> Setup WhatsApp Card & Cover
                  </>
                )}
              </h3>
              <button onClick={() => setPending(null)} className="text-gray-500 hover:text-white transition-colors cursor-pointer">
                <X size={18} />
              </button>
            </div>

            {pending.targetProposalId && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 mb-4 text-xs text-amber-300 flex items-center gap-2">
                <RefreshCw size={14} className="flex-shrink-0" />
                <span>Updating <strong>{pending.filename}</strong> — The shared URL will remain exactly the same!</span>
              </div>
            )}

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
                Upload your banner image (e.g. Mumbai Meghwal Panchayat banner or custom cover). This image will appear as the WhatsApp preview card.
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
              📄 Target File: {pending.filename}
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
                {isSaving ? "Saving..." : (pending.targetProposalId ? "🔄 Overwrite & Update Live Proposal" : "✅ Publish & Generate WhatsApp Card")}
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

                <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 mb-3 text-xs font-mono text-gray-300 truncate flex items-center gap-2">
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

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <button onClick={() => handleShareWhatsApp(item)} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-lg">
                    <Share2 size={14} /> Share on WhatsApp
                  </button>
                  <button onClick={() => handleOpenProposal(item)} className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs py-2.5 px-3 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer" title="View Proposal">
                    <Eye size={14} /> View
                  </button>
                  <button onClick={() => handleCopyLink(item)} className="bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white p-2.5 rounded-xl transition-colors cursor-pointer" title="Copy Share Link">
                    {copiedId === item.id ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="bg-red-500/10 hover:bg-red-500/20 text-red-400 p-2.5 rounded-xl transition-colors cursor-pointer" title="Delete">
                    <Trash2 size={16} />
                  </button>
                </div>

                {/* Additional Buttons: Update HTML & Clickable Embed Options */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => triggerUpdateProposal(item)}
                    className="flex-1 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Replace/Update HTML content for this proposal without changing the shared URL"
                  >
                    <RefreshCw size={14} /> Update HTML File (Keep Same URL)
                  </button>

                  <button
                    onClick={() => setActiveModalItem(item)}
                    className="bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white font-semibold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="Clickable image embed code & options"
                  >
                    <HelpCircle size={14} /> Embed Options
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal: Embed & Download Options ── */}
      {activeModalItem && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#d4af37]/40 rounded-3xl p-6 md:p-8 max-w-xl w-full shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-serif font-bold text-white flex items-center gap-2">
                <Image className="text-[#d4af37]" size={20} /> Clickable Image Options
              </h3>
              <button onClick={() => setActiveModalItem(null)} className="text-gray-400 hover:text-white cursor-pointer">
                <X size={20} />
              </button>
            </div>

            {/* Option 1: Download Clickable HTML File */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Download className="text-emerald-400" size={16} /> Option 1: Download Clickable Image HTML File
              </div>
              <p className="text-xs text-gray-400">
                Downloads an HTML card containing your image banner. When anyone opens or clicks the image file, it instantly navigates to your hosted proposal.
              </p>
              <button
                onClick={() => handleDownloadClickableHtml(activeModalItem)}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                <Download size={14} /> Download Clickable Banner HTML
              </button>
            </div>

            {/* Option 2: Copy HTML Embed Code for Email / Website */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold text-sm">
                <Mail className="text-amber-400" size={16} /> Option 2: Copy HTML Code (For Emails & Websites)
              </div>
              <p className="text-xs text-gray-400">
                Copies HTML code containing your image wrapped inside a hyperlink (`&lt;a href="..."&gt;&lt;img .../&gt;&lt;/a&gt;`). Paste into Gmail, Outlook, or Mailchimp emails so clicking the image opens the proposal.
              </p>
              <button
                onClick={() => handleCopyEmailHtml(activeModalItem)}
                className="w-full bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-semibold text-xs py-2.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {copiedId === `email-${activeModalItem.id}` ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />} Copy Email HTML Embed Code
              </button>
            </div>

            {/* Explanation box */}
            <div className="bg-blue-950/40 border border-blue-500/30 rounded-2xl p-4 text-xs text-blue-200 space-y-1.5">
              <div className="font-semibold flex items-center gap-1.5 text-blue-300">
                💡 How Clickable Images Work Across Different Platforms:
              </div>
              <ul className="list-disc list-inside space-y-1 text-gray-300 text-[11px]">
                <li><strong>In Emails (Gmail, Outlook):</strong> Paste Option 2 code. Tapping the image will open your proposal page.</li>
                <li><strong>In WhatsApp:</strong> Raw photo attachments (`.png`/`.jpg`) do not support hidden web links in chat apps. Use the <strong>"Share on WhatsApp"</strong> button to send the Link Card where WhatsApp displays the image card as a clickable link.</li>
                <li><strong>Standalone File:</strong> Download Option 1. Double clicking or opening the file opens the proposal automatically.</li>
              </ul>
            </div>

            <div className="text-right">
              <button onClick={() => setActiveModalItem(null)} className="px-5 py-2 rounded-xl bg-white/10 text-white text-xs hover:bg-white/20 transition-colors cursor-pointer">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
