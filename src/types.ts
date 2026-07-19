export interface NavItemConfig {
  id: string;
  label: string;
  isHidden: boolean;
}

export interface Profile {
  id?: string;
  name: string;
  title: string;
  tagline: string;
  heroDescription?: string;
  bio: string;
  email: string;
  phone: string;
  location: string;
  avatarUrl: string;
  logoUrl?: string;
  linkedin: string;
  youtube: string;
  instagram: string;
  stats: { label: string; value: string }[];
  badge?: string;
  featuredWorkshopId?: string;
  consultationButtonText?: string;
  aboutSubtitle?: string;
  aboutAvatarUrl?: string;
  highlights?: { title: string; description: string }[];
  skillCategoryOrder?: string[];
  storeCategoryOrder?: string[];
  coachingHours?: string;
  navConfig?: NavItemConfig[];
  seoDescription?: string;
}

export interface Project {
  id?: string;
  title: string;
  description: string;
  category: string;
  coverImage: string;
  link: string;
  details: string;
  order?: number;
  isHidden?: boolean;
  statusBadge?: string;
  allowRegistration?: boolean;
  workshopDate?: string;
  regFormTitle?: string;
  regFormButtonText?: string;
  regCustomQuestion?: string;
  regSuccessMessage?: string;
  formTemplateId?: string; // Links a custom registration form template to this workshop
  paymentLink?: string; // Razorpay or any payment link URL
  whatsappGroupLink?: string; // WhatsApp group/message link for post-registration connect
}

export interface Experience {
  id?: string;
  title: string;
  organization: string;
  period: string;
  details: string;
  isHidden?: boolean;
}

export interface Skill {
  id?: string;
  name: string;
  category: 'Technical' | 'Soft' | 'NLP' | 'Coaching' | string;
  percentage: number;
  description?: string;
  isHidden?: boolean;
  icon?: string;
  iconType?: string;
  hidePercentage?: boolean;
}

export interface Testimonial {
  id?: string;
  author: string;
  role: string;
  text: string;
  avatar: string;
  isHidden?: boolean;
}

export interface ProjectCategory {
  id?: string;
  name: string;
  icon?: string;
  order?: number;
  isHidden?: boolean;
}

export interface AchievementCategory {
  id?: string;
  name: string;
  icon: string;
  order: number;
  isHidden?: boolean;
}

export interface Achievement {
  id?: string;
  title: string;
  narrative: string;
  categoryId: string;
  coverImage: string;
  gallery: string[];
  link: string;
  isHidden?: boolean;
}

export interface PositionType {
  id?: string;
  name: string;
  icon: string;
  isHidden: boolean;
}

export interface Position {
  id?: string;
  position: string;
  organization: string;
  typeId: string;
  period: string;
  about: string;
  url: string;
  isHidden?: boolean;
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  mobile?: string;
  subject: string;
  message: string;
  createdAt: string;
}

export interface FormField {
  id: string;
  label: string;
  type: "Text" | "Number" | "Email" | "Phone" | "Date" | "Full Name" | "Address" | "Gender" | "Photo Upload (Image)" | "Document Upload (PDF/Word)" | string;
  required: boolean;
  placeholder?: string;
  isConditional?: boolean;
  dependsOnFieldId?: string;
  dependsOnValue?: string;
  mergeColumnName?: string;
  options?: string;
  isHidden?: boolean;
}

export interface ReusableField {
  id?: string;
  label: string;
  type: string;
  placeholder?: string;
  required?: boolean;
  createdAt?: string;
}

export interface RegistrationFormTemplate {
  id?: string;
  name: string; // Form name to select from workshop
  title: string; // Display header title
  bannerImage?: string; // Optional banner image URL
  buttonText: string; // Button CTA
  successMessage: string; // Success message
  fields: FormField[];
  createdAt: string;
  isHidden?: boolean;
  isPaused?: boolean; // If true, entry is closed but still collects leads
  pausedMessage?: string; // Custom message to show when paused
  paymentLink?: string; // Razorpay payment link URL
}

export interface WorkshopRegistration {
  id?: string;
  workshopId: string;
  workshopTitle: string;
  name: string;
  mobile: string;
  address: string;
  preferredDate?: string;
  additionalInfo?: string;
  customFieldsData?: { [key: string]: any }; // Store any dynamic answers for custom fields
  answers?: { [key: string]: any }; // Support legacy or dynamic custom answers
  createdAt: string;
}

export interface ResourceItem {
  id?: string;
  category?: string;
  type: 'product' | 'affiliate' | 'reference';
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  externalAppUrl?: string;
  price?: string;
  platform?: string;
  personalNote?: string;
  isHidden?: boolean;
  allowRegistration?: boolean;
  registrationFormId?: string;
  order?: number;
}
