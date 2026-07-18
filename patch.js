const fs = require('fs');
const file = 'src/lib/ProfileContext.tsx';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
content = content.replace('ReusableField', 'ReusableField,\n  ResourceItem');

// 2. Add to ProfileContextType
content = content.replace('reusableFields: ReusableField[];', 'reusableFields: ReusableField[];\n    resources: ResourceItem[];\n    addResource: (item: ResourceItem) => Promise<void>;\n    updateResource: (id: string, item: Partial<ResourceItem>) => Promise<void>;\n    deleteResource: (id: string) => Promise<void>;');

// 3. Add to state
content = content.replace('const [reusableFields, setReusableFields] = useState<ReusableField[]>([]);', 'const [reusableFields, setReusableFields] = useState<ReusableField[]>([]);\n  const [resources, setResources] = useState<ResourceItem[]>([]);');

// 4. Add to fetch logic
content = content.replace('const fieldsSnap = await getDocs(query(collection(db, "reusableFields")));', 'const fieldsSnap = await getDocs(query(collection(db, "reusableFields")));\n            const resourcesSnap = await getDocs(query(collection(db, "resources"), orderBy("order", "asc")));');

content = content.replace('fieldsSnap.forEach((d) => fieldsList.push({ ...d.data(), id: d.id } as ReusableField));', 'fieldsSnap.forEach((d) => fieldsList.push({ ...d.data(), id: d.id } as ReusableField));\n\n            const resourcesList: ResourceItem[] = [];\n            resourcesSnap.forEach((d) => resourcesList.push({ ...d.data(), id: d.id } as ResourceItem));');

content = content.replace('setReusableFields(fieldsList);', 'setReusableFields(fieldsList);\n            setResources(resourcesList);');

// 5. Add CRUD functions
const crudFunctions = 
  const addResource = async (item: ResourceItem) => {
    try {
      const docRef = await addDoc(collection(db, "resources"), item);
      setResources(prev => [...prev, { ...item, id: docRef.id }]);
    } catch (error) {
      console.error("Error adding resource", error);
      throw error;
    }
  };

  const updateResource = async (id: string, item: Partial<ResourceItem>) => {
    try {
      await updateDoc(doc(db, "resources", id), item);
      setResources(prev => prev.map(r => r.id === id ? { ...r, ...item } : r));
    } catch (error) {
      console.error("Error updating resource", error);
      throw error;
    }
  };

  const deleteResource = async (id: string) => {
    try {
      await deleteDoc(doc(db, "resources", id));
      setResources(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      console.error("Error deleting resource", error);
      throw error;
    }
  };
;

content = content.replace('const addProject = async (project: Project) => {', crudFunctions + '\n  const addProject = async (project: Project) => {');

// 6. Add to Provider value
content = content.replace('reusableFields,', 'reusableFields,\n        resources,\n        addResource,\n        updateResource,\n        deleteResource,');

fs.writeFileSync(file, content);
console.log('Patched ProfileContext.tsx');