import React, { useState } from "react";
import { useProfile } from "../../lib/ProfileContext";
import { ResourceItem } from "../../types";
import { Plus, Edit, Trash2, Link as LinkIcon, ShoppingCart, Info, Eye, EyeOff, Save, X, ArrowUpDown } from "lucide-react";
import ImageUploader from "../ui/ImageUploader";
import { cleanGoogleDriveUrl } from "../../lib/imageUtils";
import StoreReorderAdmin from "./StoreReorderAdmin";

export default function StoreAdmin() {
  const { resources, addResource, updateResource, deleteResource, registrationForms } = useProfile();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isReorderMode, setIsReorderMode] = useState(false);
  
  const [formData, setFormData] = useState<Partial<ResourceItem>>({
    type: 'product',
    title: '',
    description: '',
    category: '',
    imageUrl: '',
    link: '',
    price: '',
    platform: '',
    personalNote: '',
    isHidden: false,
    allowRegistration: false,
    registrationFormId: '',
    externalAppUrl: ''
  });

  const handleEdit = (item: ResourceItem) => {
    setEditingId(item.id!);
    setFormData(item);
  };

  const handleAddNew = () => {
    setEditingId("new");
    setFormData({
      type: 'product',
      title: '',
      description: '',
      category: '',
      imageUrl: '',
      link: '',
      price: '',
      platform: '',
      personalNote: '',
      isHidden: false,
      allowRegistration: false,
      registrationFormId: '',
      externalAppUrl: ''
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === "new") {
      await addResource(formData as ResourceItem);
    } else if (editingId) {
      await updateResource(editingId, formData);
    }
    setEditingId(null);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteResource(id);
    }
  };

  const renderForm = () => (
    <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/10 space-y-4">
      <div className="mb-6 border-b border-white/5 pb-6 space-y-6">
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono mb-3 block">
            Card Layout Style (Determines visual appearance)
          </label>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                checked={formData.type === 'product'}
                onChange={() => setFormData({ ...formData, type: 'product' as any })}
                className="accent-[#d4af37]"
              />
              <span className="text-sm text-gray-300 group-hover:text-white">Product (Selling)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                checked={formData.type === 'affiliate'}
                onChange={() => setFormData({ ...formData, type: 'affiliate' as any })}
                className="accent-[#d4af37]"
              />
              <span className="text-sm text-gray-300 group-hover:text-white">Affiliate (Gear)</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer group">
              <input 
                type="radio" 
                checked={formData.type === 'reference'}
                onChange={() => setFormData({ ...formData, type: 'reference' as any })}
                className="accent-[#d4af37]"
              />
              <span className="text-sm text-gray-300 group-hover:text-white">Simple Link</span>
            </label>
          </div>
        </div>

        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono block mb-1">
            Section Category Name
          </label>
          <input
            type="text"
            required
            list="category-suggestions"
            value={formData.category || ""}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            placeholder="e.g. Premium Materials, My Books, Recommended Gear"
            className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] outline-none"
          />
          <datalist id="category-suggestions">
            {existingCategories.map((cat, idx) => (
              <option key={idx} value={cat} />
            ))}
          </datalist>
          <p className="text-[10px] text-gray-500 mt-1">This creates a new tab/section on the public Store page.</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Title</label>
          <input
            type="text"
            required
            value={formData.title || ""}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white"
          />
        </div>

        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Description</label>
          <textarea
            required
            value={formData.description || ""}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white"
            rows={3}
          />
        </div>

        {(formData.type === 'product' || formData.type === 'affiliate') && (
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Image URL</label>
            <ImageUploader 
              currentUrl={formData.imageUrl}
              onUploadComplete={(url) => setFormData({ ...formData, imageUrl: url })}
              pathPrefix="store_resources"
            />
          </div>
        )}

        <div>
          <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
            {formData.type === 'product' ? 'Payment / Checkout Link (e.g. Razorpay)' : 
             formData.type === 'affiliate' ? 'Affiliate Link' : 'Website URL'}
             {formData.allowRegistration && formData.type === 'product' && " (Leave blank if free)"}
          </label>
          <input
            type="url"
            value={formData.link || ''}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="https://"
            className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] outline-none mt-1"
          />
        </div>

        {formData.type === 'product' && (
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">
              External App / Navigation Link (Post-Registration)
            </label>
            <input
              type="url"
              value={formData.externalAppUrl || ''}
              onChange={(e) => setFormData({ ...formData, externalAppUrl: e.target.value })}
              placeholder="https://my-other-app.com"
              className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] outline-none mt-1"
            />
            <p className="text-[10px] text-gray-500 mt-1">If a payment link is provided above, you must configure this redirect inside your Payment Gateway (e.g. Razorpay Settings). If no payment link is provided, we will automatically redirect users here after they register.</p>
          </div>
        )}

        {formData.type === 'product' && (
          <div>
            <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Price (e.g. ₹999 or $49)</label>
            <input
              type="text"
              value={formData.price || ""}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white"
            />
          </div>
        )}

        {formData.type === 'affiliate' && (
          <>
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Platform (e.g. Amazon, Flipkart)</label>
              <input
                type="text"
                value={formData.platform || ""}
                onChange={(e) => setFormData({ ...formData, platform: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Why I recommend this (Personal Note)</label>
              <input
                type="text"
                value={formData.personalNote || ""}
                onChange={(e) => setFormData({ ...formData, personalNote: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white"
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 pt-2">
          {formData.type === 'product' && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.allowRegistration || false}
                onChange={(e) => setFormData({ ...formData, allowRegistration: e.target.checked })}
                className="w-4 h-4 accent-[#d4af37]"
                id="allowRegistration"
              />
              <label htmlFor="allowRegistration" className="text-sm text-gray-300">
                Enable Built-in Registration/Inquiry Form (Instead of immediate external checkout)
              </label>
            </div>
          )}

          {formData.type === 'product' && (
            <div>
              <label className="text-[10px] text-gray-400 uppercase tracking-widest font-mono">Custom Registration Form</label>
              <select
                value={formData.registrationFormId || ""}
                onChange={(e) => setFormData({ ...formData, registrationFormId: e.target.value })}
                className="w-full px-3 py-2 bg-neutral-900 border border-white/10 rounded-lg text-white text-sm focus:border-[#d4af37] outline-none mt-1"
              >
                <option value="">-- Use Standard Form --</option>
                {registrationForms?.map((form: any) => (
                  <option key={form.id} value={form.id}>{form.name}</option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">Select a dynamic form template to use instead of the standard Name/Email/Message form.</p>
            </div>
          )}

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.isHidden || false}
              onChange={(e) => setFormData({ ...formData, isHidden: e.target.checked })}
              className="w-4 h-4 accent-[#d4af37]"
              id="hideResource"
            />
            <label htmlFor="hideResource" className="text-sm text-gray-300">Hide from public view</label>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
          <button
            type="button"
            onClick={() => setEditingId(null)}
            className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 text-white text-sm"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-2 rounded-lg bg-[#d4af37] text-black font-semibold text-sm hover:bg-[#c4a137]"
          >
            Save Item
          </button>
        </div>
      </div>
    </div>
  );

  // Extract unique categories for auto-suggestion
  const existingCategories = Array.from(new Set(
    resources.map(r => r.category).filter(Boolean) as string[]
  ));

  if (isReorderMode) {
    return <StoreReorderAdmin onClose={() => setIsReorderMode(false)} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-serif font-semibold text-white flex items-center gap-2">
            <ShoppingCart className="text-[#d4af37]" size={20} />
            Store & Resources
          </h3>
          <p className="text-sm text-gray-400 mt-1">Manage your products, affiliate links, and trusted references.</p>
        </div>
        {!editingId && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsReorderMode(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              <ArrowUpDown size={16} />
              Reorder
            </button>
            <button
              onClick={handleAddNew}
              className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#c4a137] text-black rounded-lg text-sm font-semibold transition-colors"
            >
              <Plus size={16} />
              Add New Item
            </button>
          </div>
        )}
      </div>

      {editingId ? (
        renderForm()
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resources.map((item) => (
            <div key={item.id} className={`bg-neutral-900/40 border border-white/10 rounded-xl overflow-hidden ${item.isHidden ? 'opacity-50' : ''}`}>
              {item.imageUrl && (
                <div className="aspect-video w-full overflow-hidden border-b border-white/10">
                  <img src={cleanGoogleDriveUrl(item.imageUrl)} alt={item.title} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-gray-300 capitalize">{item.type}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => handleEdit(item)} className="p-1.5 hover:bg-white/10 rounded text-gray-400 hover:text-white">
                      <Edit size={14} />
                    </button>
                    <button onClick={() => handleDelete(item.id!)} className="p-1.5 hover:bg-red-500/20 rounded text-gray-400 hover:text-red-400">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                <h4 className="font-semibold text-white mb-1 truncate">{item.title}</h4>
                <p className="text-xs text-gray-400 line-clamp-2 mb-3">{item.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1"><LinkIcon size={12} /> Link Set</span>
                  {item.price && <span className="text-[#d4af37] font-semibold">{item.price}</span>}
                </div>
              </div>
            </div>
          ))}
          {resources.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-500 border border-dashed border-white/10 rounded-xl">
              No items added yet. Click "Add New Item" to start building your store.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
