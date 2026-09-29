/**
 * EventFlow Official Brand Palette for 3D Shaders & Materials
 * Primary: Royal Plum #7C3AED (Hover #6D28D9, Pressed #5B21B6)
 * Secondary: Warm Rose #E11D48
 * Accent: Champagne Gold #D4A72C
 * Neutrals: Dark #0F0D14 / Surface #18151F / Light #FAF9F6
 */

import * as THREE from 'three';
import { ThemeMode } from './types';

export const BRAND_COLORS = {
  // Brand Triad
  plum: 0x7c3aed,
  plumHover: 0x6d28d9,
  plumDeep: 0x5b21b6,
  plumSoft: 0xede9fe,

  rose: 0xe11d48,
  roseSoft: 0xfb7185,

  gold: 0xd4a72c,
  goldLight: 0xebd6a4,
  goldDeep: 0xb3861b,

  // Dark Mode Ambient Neutrals
  darkBg: 0x0f0d14,
  darkSurface: 0x18151f,
  darkElevated: 0x211d2a,
  darkHaze: 0x161220,

  // Light Mode Ambient Neutrals
  lightBg: 0xfaf9f6,
  lightSurface: 0xffffff,
  lightMuted: 0xf3eef8,
  lightHaze: 0xf1ecf8,
};

export interface ThemeColors {
  fogColor: number;
  fogDensity: number;
  ambientLightColor: number;
  ambientIntensity: number;
  keyLightColor: number;
  keyIntensity: number;
  plumLightColor: number;
  plumLightIntensity: number;
  goldLightColor: number;
  goldLightIntensity: number;
  archColor: number;
  archOpacity: number;
  ringColor: number;
  ringEmissive: number;
  particleOpacityMultiplier: number;
}

export function getThemeColors(theme: ThemeMode): ThemeColors {
  if (theme === 'dark') {
    return {
      fogColor: BRAND_COLORS.darkBg,
      fogDensity: 0.016,
      ambientLightColor: 0x20182f,
      ambientIntensity: 0.9,
      keyLightColor: 0xffffff,
      keyIntensity: 1.2,
      plumLightColor: BRAND_COLORS.plum,
      plumLightIntensity: 2.2,
      goldLightColor: BRAND_COLORS.gold,
      goldLightIntensity: 1.8,
      archColor: 0x3d285a,
      archOpacity: 0.38,
      ringColor: BRAND_COLORS.gold,
      ringEmissive: 0x4a3608,
      particleOpacityMultiplier: 1.0,
    };
  } else {
    return {
      fogColor: BRAND_COLORS.lightBg,
      fogDensity: 0.012,
      ambientLightColor: 0xe8e0f0,
      ambientIntensity: 1.4,
      keyLightColor: 0xfffcf7,
      keyIntensity: 1.0,
      plumLightColor: BRAND_COLORS.plum,
      plumLightIntensity: 1.2,
      goldLightColor: BRAND_COLORS.gold,
      goldLightIntensity: 1.0,
      archColor: 0x9f88b8,
      archOpacity: 0.22,
      ringColor: BRAND_COLORS.gold,
      ringEmissive: 0x241d08,
      particleOpacityMultiplier: 0.65,
    };
  }
}
