import { 
  db, 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  addDoc,
  deleteDoc
} from "./firebase";
import { 
  Profile, 
  Project, 
  Experience, 
  Skill, 
  Testimonial, 
  AchievementCategory, 
  Achievement, 
  PositionType, 
  Position 
} from "../types";

export async function forceSeedDatabase() {
  try {
    console.log("Starting forced reset and seed of database with pradeepparmar.com real data...");
    
    // Clear all existing documents in relevant collections
    const collectionsToClear = [
      "profiles",
      "projects",
      "experience",
      "skills",
      "testimonials",
      "achievement_categories",
      "achievements",
      "position_types",
      "positions"
    ];

    for (const colName of collectionsToClear) {
      const snap = await getDocs(collection(db, colName));
      console.log(`Clearing ${snap.size} documents from collection '${colName}'...`);
      for (const d of snap.docs) {
        await deleteDoc(doc(db, colName, d.id));
      }
    }

    console.log("Clear completed. Beginning seeding of real pradeepparmar.com details...");
    await seedAllDetails();
    console.log("Database reset and forced seeding completed successfully!");
  } catch (err) {
    console.error("Error during force-seeding of database:", err);
    throw err;
  }
}

export async function seedDatabaseIfEmpty() {
  try {
    // Check if profile exists; if not, we assume seed is required
    const profileSnap = await getDocs(collection(db, "profiles"));
    if (profileSnap.empty) {
      console.log("Database is empty. Populating with real pradeepparmar.com content...");
      await seedAllDetails();
    } else {
      console.log("Seeding skipped: Profiles collection is already populated.");
    }
  } catch (error) {
    console.error("Error during conditional database seed check:", error);
  }
}

async function seedAllDetails() {
  // 1. Seed Profile
  const defaultProfile: Profile = {
    name: "Pradeep Parmar",
    title: "Master Practitioner & Professional Trainer",
    tagline: "Learn. Lead. Succeed.",
    heroDescription: "Over the last decade, I have guided thousands of professionals, corporate leaders, and students to unlock their ultimate mental potential, master advanced technical tools, and live with conscious purpose.",
    bio: "👋 Hello! I’m Pradeep Parmar, a passionate trainer dedicated to helping people learn, grow, and succeed. Over the years, I’ve conducted multiple workshops on Excel, Power BI, SQL, Python, Success Training, Belief System, and NLP. I hold an MBA, an ITI background, certifications in Digital Marketing and Data Science, and bring with me 25+ years of corporate experience. Along with my professional journey, I also dedicate time to serving my social community, empowering individuals to achieve growth and transformation. I am proud to be a self-learner who continuously adapts and grows with changing times.",
    email: "pradeepparmar902@yahoo.com",
    phone: "+91 98199 84437",
    location: "Gujarat, India",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
    linkedin: "https://www.linkedin.com/in/pradeep-parmar-1b57a24",
    youtube: "https://www.youtube.com/@parmar_pradeep902",
    instagram: "https://www.instagram.com/pradeepparmar902",
    stats: [
      { label: "Workshops Delivered", value: "250+" },
      { label: "Learners Trained", value: "15,000+" },
      { label: "Corporate Experience", value: "25+ Yrs" },
      { label: "Community Trust", value: "Active" }
    ],
    badge: "NLP Practitioner & Corporate Leader",
    aboutSubtitle: "NLP Master & Advisor",
    aboutAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=600&auto=format&fit=crop",
    highlights: [
      { title: "Subconscious Blueprint", description: "Custom NLP maps to swap limiting core beliefs." },
      { title: "Enterprise Analytics", description: "Corporate audits in Advanced Excel & Power BI." },
      { title: "Longevity Strategy", description: "Perfect mind-body equilibrium habits." },
      { title: "Relentless Coaching", description: "Actionable and bulletproof accountability logs." }
    ]
  };
  await setDoc(doc(db, "profiles", "default"), defaultProfile);

  // 2. Seed Projects / Workshops Catalogue
  const workshops: Project[] = [
    {
      title: "Excel Basic & Advance",
      description: "Master spreadsheet calculations from fundamental calculations to advanced dynamic formulas, Pivot tables, and custom macros.",
      category: "Technical",
      coverImage: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
      link: "https://pradeepparmar.com/registration-form/",
      details: "Includes dynamic arrays, lookup optimizations, conditional rules, Power Query integrations, and automated formatting routines."
    },
    {
      title: "Power BI Analyst",
      description: "Transform multi-source unstructured raw data into clean enterprise-grade interactive reports and business intelligence dashboards.",
      category: "Technical",
      coverImage: "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=600&auto=format&fit=crop",
      link: "https://pradeepparmar.com/registration-form/",
      details: "Covers data schema modeling, DAX query formulation, Power Query data cleaning transformations, and report sharing protocols."
    },
    {
      title: "SQL & Relational Databases",
      description: "Unlock full database query capabilities, study data architectures, and write performance-optimized database queries from scratch.",
      category: "Technical",
      coverImage: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?q=80&w=600&auto=format&fit=crop",
      link: "https://pradeepparmar.com/registration-form/",
      details: "Ideal for data controllers. Explores tables, joins, filters, indexing optimizations, groupings, and recursive relational schemas."
    },
    {
      title: "Python for Analytics",
      description: "Learn practical Python programming specifically focused on automating repetitive tasks and manipulating data collections.",
      category: "Technical",
      coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
      link: "https://pradeepparmar.com/registration-form/",
      details: "Introduces core syntax, Pandas datasets, Numpy calculations, and Matplotlib/Seaborn visualization workflows."
    },
    {
      title: "Unlock Yourself (NLP)",
      description: "A transformative psychological mindset masterclass applying advanced Neuro-Linguistic Programming (NLP) methods.",
      category: "Mindset",
      coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop",
      link: "https://pradeepparmar.com/registration-form/",
      details: "Shatters deep-seated subconscious limitations, installs empowering mental anchors, and aligns conscious purpose."
    },
    {
      title: "The 6 S's of Success",
      description: "A comprehensive strategy blueprint focusing on Self, Skill, Strategy, Structure, Sustenance, and Spirit.",
      category: "Mindset",
      coverImage: "https://images.unsplash.com/photo-1494173853739-c21f58b16055?q=80&w=600&auto=format&fit=crop",
      link: "https://pradeepparmar.com/registration-form/",
      details: "Synthesizes career development, daily calendar architectures, habit formation, and high energy conservation."
    },
    {
      title: "Comfort Crisis",
      description: "Overcome standard procrastination loops, understand voluntary physical/mental friction, and build resilient self-discipline.",
      category: "Mindset",
      coverImage: "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=600&auto=format&fit=crop",
      link: "https://pradeepparmar.com/registration-form/",
      details: "Explains how standard hyper-comfort compromises growth, and provides practical frameworks to re-introduce constructive daily challenges."
    },
    {
      title: "Subconscious Positive Beliefs",
      description: "Reprogram the subconscious mind to construct positive and proactive belief systems, overcoming self-doubt and fear.",
      category: "Mindset",
      coverImage: "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?q=80&w=600&auto=format&fit=crop",
      link: "https://pradeepparmar.com/registration-form/",
      details: "Applies daily meditative focus maps, visualization routines, and verbal re-frames to establish continuous cognitive confidence."
    },
    {
      title: "Mind, Body, & Soul Energy",
      description: "Achieve deep structural alignment through customized fitness, focused meditation, and optimized bio-energetic health.",
      category: "Holistic",
      coverImage: "https://images.unsplash.com/photo-1545205597-3d9d02c29597?q=80&w=600&auto=format&fit=crop",
      link: "https://pradeepparmar.com/registration-form/",
      details: "Incorporates deep diaphragmatic breathing mechanics, cognitive pacing techniques, and high-energy nutrition metrics."
    }
  ];
  for (const workshop of workshops) {
    await addDoc(collection(db, "projects"), workshop);
  }

  // 3. Seed Experiences
  const experiences: Experience[] = [
    {
      title: "MCT & Senior Corporate Trainer",
      organization: "Professional Freelance Training Services",
      period: "2012 - Present",
      details: "Delivering advanced enterprise-grade technical workshops (Excel, Power BI, SQL, Python) and behavioral mindset coaching (NLP, Success Principles, Belief Systems) to global organizations and corporate leaders."
    },
    {
      title: "Education Committee President",
      organization: "MMP Community",
      period: "2020 - Present",
      details: "Heading educational boards, academic welfare integrations, and computer literacy workshops for local schools and rural student programs."
    },
    {
      title: "Senior Data & Business Strategy Analyst",
      organization: "Enterprise Solutions Group",
      period: "2000 - 2012",
      details: "Utilized robust data analytics architectures, data modeling systems, and digital strategy blueprints to optimize operations and drive organizational growth."
    }
  ];
  for (const exp of experiences) {
    await addDoc(collection(db, "experience"), exp);
  }

  // 4. Seed Skills
  const skills: Skill[] = [
    { 
      name: "Advanced Microsoft Excel", 
      category: "Technical", 
      percentage: 98, 
      icon: "FileSpreadsheet", 
      iconType: "lucide",
      description: "Complex formulas, power query automation, VBA macros & dashboard systems." 
    },
    { 
      name: "Power BI & Data Modeling", 
      category: "Technical", 
      percentage: 92, 
      icon: "BarChart2", 
      iconType: "lucide",
      description: "DAX calculations, interactive reporting, multi-source modeling & visualization." 
    },
    { 
      name: "SQL Query Optimization", 
      category: "Technical", 
      percentage: 88, 
      icon: "Database", 
      iconType: "lucide",
      description: "Database architecture, query structuring, table relations & auditing." 
    },
    { 
      name: "Python Automation", 
      category: "Technical", 
      percentage: 82, 
      icon: "Cpu", 
      iconType: "lucide",
      description: "Scripting, task scheduling, automated data scraping & processing." 
    },
    { 
      name: "Neuro-Linguistic Programming (NLP)", 
      category: "NLP", 
      percentage: 95, 
      icon: "Brain", 
      iconType: "lucide",
      description: "Certified master trainer techniques, behavioral alignment & mental reprogramming." 
    },
    { 
      name: "Subconscious Positive Beliefs", 
      category: "NLP", 
      percentage: 92, 
      icon: "Sparkles", 
      iconType: "lucide",
      description: "Removing mental blockers, designing customized positive neural habits." 
    },
    { 
      name: "Corporate Group Training", 
      category: "Coaching", 
      percentage: 94, 
      icon: "Users", 
      iconType: "lucide",
      description: "Interactive learning models, leadership workshops, & corporate development." 
    },
    { 
      name: "Executive Mindset Coaching", 
      category: "Coaching", 
      percentage: 90, 
      icon: "TrendingUp", 
      iconType: "lucide",
      description: "One-on-one personal breakthroughs, performance strategies & success systems." 
    },
    { 
      name: "Public Speaking & Keynote", 
      category: "Soft", 
      percentage: 96, 
      icon: "Award", 
      iconType: "lucide",
      description: "Dynamic presentation delivery, high-impact keynotes & student reviews." 
    }
  ];
  for (const sk of skills) {
    await addDoc(collection(db, "skills"), sk);
  }

  // 5. Seed Testimonials
  const testimonials: Testimonial[] = [
    {
      author: "Anjali Mehta",
      role: "HR Director, Fortune Global Corp",
      text: "Pradeep's Excel and Power BI sessions completely revolutionized our department's productivity. He breaks complex technical architectures down into simple daily habits. Brilliant corporate trainer!",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=150&auto=format&fit=crop"
    },
    {
      author: "Rajesh Kulkarni",
      role: "Executive VP, Apex Financial Group",
      text: "The 'Unlock Yourself' NLP workshop changed my mental map entirely. I removed deep-seated professional blocks that held my leadership potential back for years. Highly recommended.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop"
    },
    {
      author: "Dr. Sameer Sen",
      role: "Medical Practitioner & Wellness Advocate",
      text: "Pradeep Parmar's balance of technical clarity, behavioral NLP, and Mind-Body-Soul alignment is highly scientific and actionable. A true professional advisor.",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=150&auto=format&fit=crop"
    }
  ];
  for (const t of testimonials) {
    await addDoc(collection(db, "testimonials"), t);
  }

  // 6. Seed Achievement Categories
  const cats: AchievementCategory[] = [
    { name: "IT", icon: "Laptop", order: 1 },
    { name: "Excel Sessions", icon: "FileSpreadsheet", order: 2 },
    { name: "Motivation & Mind Game", icon: "Brain", order: 3 }
  ];

  let techCatId = "";
  let excelCatId = "";
  let mindCatId = "";

  for (const c of cats) {
    const docRef = await addDoc(collection(db, "achievement_categories"), c);
    if (c.name === "IT") techCatId = docRef.id;
    if (c.name === "Excel Sessions") excelCatId = docRef.id;
    if (c.name === "Motivation & Mind Game") mindCatId = docRef.id;
  }

  // 7. Seed Achievements
  if (techCatId && excelCatId && mindCatId) {
    const achievements: Achievement[] = [
      {
        title: "MMP Community Digital Classroom Launched",
        narrative: "Configured local server structures and digital training labs for rural schools. Facilitated digital literacy and basic computer spreadsheets training for over 150+ students.",
        categoryId: techCatId,
        coverImage: "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?q=80&w=600&auto=format&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=600&auto=format&fit=crop",
          "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?q=80&w=600&auto=format&fit=crop"
        ],
        link: "https://pradeepparmar.com/about/"
      },
      {
        title: "NLP Coaching Interactive Dashboard",
        narrative: "Developed a functional web workspace mapping cognitive triggers and positive mental routines for active mindset coaching clients.",
        categoryId: techCatId,
        coverImage: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=600&auto=format&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop"
        ],
        link: "https://pradeepparmar.com/about/"
      },
      {
        title: "National Professional Analytics Summit",
        narrative: "Featured keynote presenter delivering dynamic analytical solutions and high-speed reporting formats to over 800+ senior financial managers.",
        categoryId: excelCatId,
        coverImage: "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=600&auto=format&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=600&auto=format&fit=crop"
        ],
        link: "https://pradeepparmar.com/about/"
      },
      {
        title: "Unlock Yourself Mindset Seminar",
        narrative: "Delivered interactive behavioral breakthroughs and belief system rewrites to over 500+ professionals, yielding 98% positive participant feedback.",
        categoryId: mindCatId,
        coverImage: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop",
        gallery: [
          "https://images.unsplash.com/photo-1552581230-264079377a41?q=80&w=600&auto=format&fit=crop"
        ],
        link: "https://pradeepparmar.com/about/"
      }
    ];
    for (const ach of achievements) {
      await addDoc(collection(db, "achievements"), ach);
    }
  }

  // 8. Seed Position Types
  const types: PositionType[] = [
    { name: "Social Trust", icon: "Shield", isHidden: false },
    { name: "NGO", icon: "Heart", isHidden: false },
    { name: "Professional Body", icon: "Briefcase", isHidden: false }
  ];

  let trustTypeId = "";
  let ngoTypeId = "";
  let profTypeId = "";

  for (const t of types) {
    const docRef = await addDoc(collection(db, "position_types"), t);
    if (t.name === "Social Trust") trustTypeId = docRef.id;
    if (t.name === "NGO") ngoTypeId = docRef.id;
    if (t.name === "Professional Body") profTypeId = docRef.id;
  }

  // 9. Seed Positions
  if (trustTypeId && ngoTypeId && profTypeId) {
    const positions: Position[] = [
      {
        position: "Education Committee President",
        organization: "MMP Community Education Board",
        typeId: trustTypeId,
        period: "2020 - Present",
        about: "Directing strategic computer operations, setting up digital classroom infrastructure, and leading community youth skill enhancement campaigns.",
        url: "https://pradeepparmar.com/about/"
      },
      {
        position: "Honorary Trustee & Financial Auditor",
        organization: "Universal Care Welfare Association",
        typeId: ngoTypeId,
        period: "2018 - Present",
        about: "Supporting transparency audits, overseeing resource distributions for educational and medical welfare campaigns, and advising on fund compliance.",
        url: "https://pradeepparmar.com/about/"
      },
      {
        position: "Senior Facilitator & Regional Member",
        organization: "All-India Professional Trainers Association",
        typeId: profTypeId,
        period: "2015 - Present",
        about: "Fostering regional trainer collaborations, moderating curriculum standard workshops, and speaking on analytics-mindset integration summits.",
        url: "https://pradeepparmar.com/about/"
      }
    ];
    for (const p of positions) {
      await addDoc(collection(db, "positions"), p);
    }
  }
}
