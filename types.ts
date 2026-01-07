export enum ViewState {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  CREATE = 'CREATE',
  SCHEDULE = 'SCHEDULE',
  SETTINGS = 'SETTINGS',
}

export enum PostTone {
  PROFESSIONAL = 'Profesional',
  CASUAL = 'Casual',
  CONTROVERSIAL = 'Polémico/Debate',
  EDUCATIONAL = 'Educativo',
  INSPIRATIONAL = 'Inspirador',
  HUMOROUS = 'Humorístico',
}

export enum ContentFormat {
  CINEMATIC_PHOTO = 'Foto Cinemática',
  DATA_VISUALIZATION = 'Arte Abstracto 3D (Tech)',
  PERSONAL_PHOTO = 'Foto Personal (AI Ref)',
  CAROUSEL_DESIGN = 'Fondo Minimalista',
  REALISTIC_OFFICE = 'Entorno Profesional'
}

export type LanguageOption = 'ES' | 'EN' | 'MIX';

export interface UserProfile {
  name: string;
  role: string;
  resumePdfData?: string; // Base64 of PDF
  website?: string;
  socialLinks?: string[];
  selectedTopics: string[]; // High level tags
  tone: PostTone;
  language: LanguageOption;
  headshotUrl?: string; // Base64 for Image Generation reference
}

export interface GeneratedContent {
  headline: string;
  body: string;
  hashtags: string[];
  cta: string;
}

export interface ResearchIdea {
  title: string;
  description: string;
  sourceUrl?: string;
}

export interface WeeklyStrategyItem {
  day: string;
  topic: string;
  tone: PostTone;
  format: ContentFormat;
  rationale: string;
  newsContext?: string;
  language: 'ES' | 'EN'; // Explicit language for that day
}

export interface Post {
  id: string;
  topic: string;
  content: GeneratedContent;
  imageUrl?: string;
  format: ContentFormat;
  scheduledDate: Date;
  status: 'draft' | 'scheduled' | 'published';
  stats?: {
    views: number;
    likes: number;
    comments: number;
  };
}