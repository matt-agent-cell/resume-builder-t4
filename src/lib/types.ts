export type MessageRole = "user" | "assistant";

export interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
}

export interface ResumeData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export interface Experience {
  id: string;
  company: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  bullets: string[];
}

export interface Education {
  id: string;
  school: string;
  degree: string;
  field: string;
  graduationDate: string;
}

export interface VaultItem {
  id: string;
  type: "experience" | "education" | "skill" | "project" | "certification";
  label: string;
  detail: string;
  // Expanded data for detail views
  description?: string;
  bullets?: string[];
  tags?: string[];
  dateRange?: string;
  location?: string;
}
