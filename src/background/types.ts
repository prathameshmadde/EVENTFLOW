/**
 * EventFlow 3D Background Environment Types
 */

export type PerformanceTier = 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';

export type PageEnvironmentType =
  | 'home'
  | 'dashboard'
  | 'events'
  | 'proposals'
  | 'booking'
  | 'payment'
  | 'admin';

export type ThemeMode = 'dark' | 'light';

export interface BackgroundConfig {
  tier: PerformanceTier;
  page: PageEnvironmentType;
  theme: ThemeMode;
  prefersReducedMotion: boolean;
  isMobile: boolean;
}

export interface MouseState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
}

export interface ScrollState {
  scrollY: number;
  targetScrollY: number;
  maxScroll: number;
  progress: number;
}
