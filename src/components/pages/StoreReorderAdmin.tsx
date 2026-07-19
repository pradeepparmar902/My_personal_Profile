import React, { useState, useEffect } from "react";
import { useProfile } from "../../lib/ProfileContext";
import { ResourceItem } from "../../types";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Save, X, Layers, Package } from "lucide-react";

// Sortable Category Item Component
function SortableCategory({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-4 mb-2 bg-neutral-900 border border-white/10 rounded-xl ${isDragging ? 'opacity-50 ring-2 ring-[#d4af37]' : ''}`}>
      <button {...attributes} {...listeners} className="cursor-grab p-1 text-gray-500 hover:text-white">
        <GripVertical size={20} />
      </button>
      <span className="font-bold text-white text-lg">{id}</span>
    </div>
  );
}

// Sortable Resource Item Component
function SortableResource({ item }: { item: ResourceItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id! });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className={`flex items-center gap-3 p-3 mb-2 bg-white/5 border border-white/5 rounded-lg ${isDragging ? 'opacity-50 ring-2 ring-blue-500' : ''}`}>
      <button {...attributes} {...listeners} className="cursor-grab p-1 text-gray-500 hover:text-white">
        <GripVertical size={16} />
      </button>
      <div className="flex-grow min-w-0">
        <h4 className="font-semibold text-white text-sm truncate">{item.title}</h4>
        <p className="text-[10px] text-gray-400 truncate">{item.type} • {item.price || 'Free'}</p>
      </div>
    </div>
  );
}

export default function StoreReorderAdmin({ onClose }: { onClose: () => void }) {
  const { profile, resources, updateProfile, updateResource } = useProfile();
  const [activeTab, setActiveTab] = useState<'categories' | 'items'>('categories');
  const [isSaving, setIsSaving] = useState(false);
  
  // Local state for categories
  const [categories, setCategories] = useState<string[]>([]);
  // Local state for items
  const [itemsMap, setItemsMap] = useState<Record<string, ResourceItem[]>>({});

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // Initialize state
  useEffect(() => {
    // 1. Gather all unique categories currently in use
    const uniqueFromItems = Array.from(new Set(resources.map(r => r.category).filter(Boolean) as string[]));
    
    // 2. Sort them based on profile.storeCategoryOrder if it exists
    const sortedCategories = [...uniqueFromItems].sort((a, b) => {
      const orderA = profile?.storeCategoryOrder?.indexOf(a) ?? -1;
      const orderB = profile?.storeCategoryOrder?.indexOf(b) ?? -1;
      if (orderA === -1 && orderB === -1) return a.localeCompare(b);
      if (orderA === -1) return 1;
      if (orderB === -1) return -1;
      return orderA - orderB;
    });
    setCategories(sortedCategories);

    // 3. Group items by category and sort them by order
    const grouped: Record<string, ResourceItem[]> = {};
    sortedCategories.forEach(cat => {
      grouped[cat] = resources
        .filter(r => r.category === cat)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
    });
    setItemsMap(grouped);
  }, [profile?.storeCategoryOrder, resources]);

  const handleDragEndCategories = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setCategories((items) => {
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over!.id as string);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleDragEndItems = (cat: string, event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setItemsMap(prev => {
        const catItems = [...prev[cat]];
        const oldIndex = catItems.findIndex(i => i.id === active.id);
        const newIndex = catItems.findIndex(i => i.id === over!.id);
        return {
          ...prev,
          [cat]: arrayMove(catItems, oldIndex, newIndex)
        };
      });
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // 1. Save Category Order to Profile
      if (profile) {
        await updateProfile({ ...profile, storeCategoryOrder: categories });
      }

      // 2. Save Item Orders to Resources
      const updates: Promise<void>[] = [];
      Object.entries(itemsMap).forEach(([cat, catItems]) => {
        catItems.forEach((item, index) => {
          // If the order changed, update it
          if (item.order !== index) {
            updates.push(updateResource(item.id!, { order: index }));
          }
        });
      });
      await Promise.all(updates);
      onClose();
    } catch (error) {
      console.error("Error saving reorder:", error);
      alert("Failed to save new order.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-serif font-semibold text-white">Reorder Store</h3>
          <p className="text-sm text-gray-400 mt-1">Drag and drop to rearrange your categories and items.</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm text-white transition-colors">Cancel</button>
          <button 
            onClick={handleSave} 
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-[#d4af37] hover:bg-[#c4a137] text-black rounded-lg text-sm font-semibold disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            {isSaving ? "Saving..." : "Save Order"}
          </button>
        </div>
      </div>

      <div className="flex gap-4 p-1 bg-white/5 rounded-xl max-w-sm">
        <button 
          onClick={() => setActiveTab('categories')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'categories' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}
        >
          <Layers size={16} /> Categories
        </button>
        <button 
          onClick={() => setActiveTab('items')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'items' ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}
        >
          <Package size={16} /> Items
        </button>
      </div>

      <div className="bg-neutral-900/50 p-6 rounded-xl border border-white/10">
        {activeTab === 'categories' && (
          <div>
            <h4 className="text-[#d4af37] font-semibold mb-4">Drag to Reorder Categories</h4>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEndCategories}>
              <SortableContext items={categories} strategy={verticalListSortingStrategy}>
                {categories.map(cat => <SortableCategory key={cat} id={cat} />)}
              </SortableContext>
            </DndContext>
            {categories.length === 0 && <p className="text-gray-500 text-sm">No categories found.</p>}
          </div>
        )}

        {activeTab === 'items' && (
          <div className="space-y-8">
            {categories.map(cat => (
              <div key={cat} className="bg-black/30 p-4 rounded-xl border border-white/5">
                <h4 className="text-[#d4af37] font-semibold mb-4">{cat}</h4>
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={(e) => handleDragEndItems(cat, e)}>
                  <SortableContext items={itemsMap[cat]?.map(i => i.id!) || []} strategy={verticalListSortingStrategy}>
                    {itemsMap[cat]?.map(item => <SortableResource key={item.id} item={item} />)}
                  </SortableContext>
                </DndContext>
                {(!itemsMap[cat] || itemsMap[cat].length === 0) && <p className="text-gray-500 text-sm">No items in this category.</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
