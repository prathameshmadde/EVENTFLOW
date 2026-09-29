/**
 * EventFlow Celebratory Ambient Particles & Stardust
 * 
 * Cinematic 3-tier depth particle system:
 * - Tier 1: Distant micro-dust (depth -25 to -45)
 * - Tier 2: Midground celebratory embers (warm champagne gold, royal plum, and ruby rose)
 * - Tier 3: Foreground soft bokeh orbs (gentle floating blur)
 * 
 * Uses procedural soft radial-gradient glow texture (no hard square pixels).
 * Sways organically with harmonic Lissajous curves.
 */

import * as THREE from 'three';
import { BRAND_COLORS } from './palette';
import { PerformanceTier, ThemeMode } from './types';

export class AmbientParticles {
  public root: THREE.Group;

  private emberPoints: THREE.Points;
  private emberGeom: THREE.BufferGeometry;
  private emberPositions: Float32Array;
  private emberVelocities: Float32Array;
  private emberCount: number;

  private bokehPoints: THREE.Points | null = null;
  private bokehGeom: THREE.BufferGeometry | null = null;
  private bokehPositions: Float32Array | null = null;
  private bokehCount: number = 0;

  private glowTexture: THREE.Texture;

  constructor(tier: PerformanceTier, theme: ThemeMode, isMobile: boolean) {
    this.root = new THREE.Group();

    // Generate soft circular blurred sprite texture
    this.glowTexture = this.createGlowTexture();

    // Scale counts according to hardware tier
    if (isMobile) {
      this.emberCount = 38;
      this.bokehCount = 6;
    } else {
      switch (tier) {
        case 'HIGH':
          this.emberCount = 140;
          this.bokehCount = 18;
          break;
        case 'MEDIUM':
          this.emberCount = 75;
          this.bokehCount = 10;
          break;
        case 'LOW':
        case 'VERY_LOW':
        default:
          this.emberCount = 35;
          this.bokehCount = 4;
          break;
      }
    }

    const isDark = theme === 'dark';

    // 1. Build Midground & Distant Celebratory Embers
    this.emberPositions = new Float32Array(this.emberCount * 3);
    this.emberVelocities = new Float32Array(this.emberCount * 3);
    const colors = new Float32Array(this.emberCount * 3);

    const plumColor = new THREE.Color(BRAND_COLORS.plum);
    const goldColor = new THREE.Color(BRAND_COLORS.gold);
    const roseColor = new THREE.Color(BRAND_COLORS.rose);
    const neutralColor = new THREE.Color(isDark ? 0xc8b8e6 : 0x7c6999);

    for (let i = 0; i < this.emberCount; i++) {
      // 3D coordinates spread across scene depth
      this.emberPositions[i * 3 + 0] = (Math.random() - 0.5) * 48;
      this.emberPositions[i * 3 + 1] = (Math.random() - 0.5) * 32;
      this.emberPositions[i * 3 + 2] = -8 - Math.random() * 26; // Z: -8 to -34

      // Gentle upward drift + soft horizontal sway
      this.emberVelocities[i * 3 + 0] = (Math.random() - 0.5) * 0.012;
      this.emberVelocities[i * 3 + 1] = Math.random() * 0.018 + 0.006;
      this.emberVelocities[i * 3 + 2] = (Math.random() - 0.5) * 0.008;

      // Color distribution: 55% Neutral-Plum, 30% Champagne Gold, 15% Warm Rose
      const rand = Math.random();
      let c: THREE.Color;
      if (rand < 0.55) {
        c = neutralColor;
      } else if (rand < 0.85) {
        c = goldColor;
      } else {
        c = roseColor;
      }
      colors[i * 3 + 0] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }

    this.emberGeom = new THREE.BufferGeometry();
    this.emberGeom.setAttribute('position', new THREE.BufferAttribute(this.emberPositions, 3));
    this.emberGeom.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const emberMat = new THREE.PointsMaterial({
      size: isMobile ? 0.75 : 0.95,
      map: this.glowTexture,
      vertexColors: true,
      transparent: true,
      opacity: isDark ? 0.65 : 0.42,
      blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
      depthWrite: false,
    });

    this.emberPoints = new THREE.Points(this.emberGeom, emberMat);
    this.root.add(this.emberPoints);

    // 2. Build Foreground Soft Bokeh Orbs
    if (this.bokehCount > 0) {
      this.bokehPositions = new Float32Array(this.bokehCount * 3);
      const bokehColors = new Float32Array(this.bokehCount * 3);

      for (let j = 0; j < this.bokehCount; j++) {
        // Foreground coordinates
        this.bokehPositions[j * 3 + 0] = (Math.random() - 0.5) * 36;
        this.bokehPositions[j * 3 + 1] = (Math.random() - 0.5) * 22;
        this.bokehPositions[j * 3 + 2] = 2.0 - Math.random() * 8; // Closer to camera Z: -6 to +2

        const bc = Math.random() > 0.4 ? goldColor : plumColor;
        bokehColors[j * 3 + 0] = bc.r;
        bokehColors[j * 3 + 1] = bc.g;
        bokehColors[j * 3 + 2] = bc.b;
      }

      this.bokehGeom = new THREE.BufferGeometry();
      this.bokehGeom.setAttribute('position', new THREE.BufferAttribute(this.bokehPositions, 3));
      this.bokehGeom.setAttribute('color', new THREE.BufferAttribute(bokehColors, 3));

      const bokehMat = new THREE.PointsMaterial({
        size: isMobile ? 2.5 : 3.8,
        map: this.glowTexture,
        vertexColors: true,
        transparent: true,
        opacity: isDark ? 0.22 : 0.12,
        blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
        depthWrite: false,
      });

      this.bokehPoints = new THREE.Points(this.bokehGeom, bokehMat);
      this.root.add(this.bokehPoints);
    }
  }

  /**
   * Procedural circular feathered glow texture
   */
  private createGlowTexture(): THREE.Texture {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      gradient.addColorStop(0, 'rgba(255, 255, 255, 1.0)');
      gradient.addColorStop(0.3, 'rgba(255, 255, 255, 0.6)');
      gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.15)');
      gradient.addColorStop(1.0, 'rgba(255, 255, 255, 0.0)');

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, 64, 64);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }

  /**
   * Organic motion update step:
   * Smooth upward drift with soft wrapping bounds and Lissajous wave sway
   */
  public update(time: number): void {
    const pos = this.emberGeom.attributes.position.array as Float32Array;

    for (let i = 0; i < this.emberCount; i++) {
      const idx = i * 3;
      // Sway horizontally
      pos[idx + 0] += this.emberVelocities[idx + 0] + Math.sin(time * 0.4 + i * 0.7) * 0.007;
      // Drift upward
      pos[idx + 1] += this.emberVelocities[idx + 1];
      // Subtle depth breathing
      pos[idx + 2] += Math.cos(time * 0.3 + i) * 0.004;

      // Soft vertical wrapping bounds
      if (pos[idx + 1] > 18) {
        pos[idx + 1] = -18;
        pos[idx + 0] = (Math.random() - 0.5) * 48;
      }
      // Horizontal wrapping
      if (pos[idx + 0] > 26) pos[idx + 0] = -26;
      if (pos[idx + 0] < -26) pos[idx + 0] = 26;
    }
    this.emberGeom.attributes.position.needsUpdate = true;

    // Update Bokeh Orbs
    if (this.bokehGeom && this.bokehPositions) {
      const bpos = this.bokehGeom.attributes.position.array as Float32Array;
      for (let j = 0; j < this.bokehCount; j++) {
        const bidx = j * 3;
        bpos[bidx + 1] += 0.005 + Math.sin(time * 0.2 + j) * 0.002;
        bpos[bidx + 0] += Math.cos(time * 0.15 + j * 1.5) * 0.006;

        if (bpos[bidx + 1] > 14) {
          bpos[bidx + 1] = -14;
          bpos[bidx + 0] = (Math.random() - 0.5) * 36;
        }
      }
      this.bokehGeom.attributes.position.needsUpdate = true;
    }
  }

  /**
   * Clean up resources
   */
  public dispose(): void {
    this.emberGeom.dispose();
    (this.emberPoints.material as THREE.Material).dispose();
    if (this.bokehGeom && this.bokehPoints) {
      this.bokehGeom.dispose();
      (this.bokehPoints.material as THREE.Material).dispose();
    }
    this.glowTexture.dispose();
  }
}
