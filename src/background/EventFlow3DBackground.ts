/**
 * EventFlow 3D Background Engine — "EventFlow Living Atmosphere"
 * 
 * Primary WebGL environment providing continuous, organic, event-tech cinematic atmosphere.
 * Handles continuous organic motion, true multi-layer mouse parallax damping,
 * scroll-driven continuous camera depth, and page-specific architecture.
 */

import * as THREE from 'three';
import { getThemeColors, ThemeColors } from './palette';
import { ArchitecturalStructures } from './architecturalStructures';
import { AmbientParticles } from './particles';
import { LightTrails } from './lightTrails';
import { MouseState, PageEnvironmentType, PerformanceTier, ScrollState, ThemeMode } from './types';

export class EventFlow3DBackground {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  // Scene Subsystems
  private structures: ArchitecturalStructures;
  private particles: AmbientParticles;
  private trails: LightTrails;

  // Orbiting Atmospheric Lights
  private ambientLight: THREE.AmbientLight;
  private keyLight: THREE.DirectionalLight;
  private plumLight: THREE.PointLight;
  private goldLight: THREE.PointLight;

  // State
  private theme: ThemeMode;
  private page: PageEnvironmentType;
  private tier: PerformanceTier;
  private isMobile: boolean;
  private isRunning: boolean = false;
  private animationFrameId: number | null = null;
  private startTime: number;

  // Mouse & Scroll Damping
  public mouse: MouseState = { x: 0, y: 0, targetX: 0, targetY: 0 };
  public scroll: ScrollState = { scrollY: 0, targetScrollY: 0, maxScroll: 1000, progress: 0 };

  constructor(
    canvas: HTMLCanvasElement,
    theme: ThemeMode,
    page: PageEnvironmentType,
    tier: PerformanceTier,
    isMobile: boolean
  ) {
    this.canvas = canvas;
    this.theme = theme;
    this.page = page;
    this.tier = tier;
    this.isMobile = isMobile;

    // Retrieve or initialize session-wide continuous background animation epoch
    let bgAnchor = (window as unknown as { __EF_BG_ANCHOR__?: number }).__EF_BG_ANCHOR__;
    if (!bgAnchor) {
      try {
        const stored = sessionStorage.getItem('ef_bg_anchor_epoch');
        if (stored) {
          const parsed = parseFloat(stored);
          if (!isNaN(parsed) && parsed > 0 && parsed <= performance.timeOrigin + performance.now()) {
            bgAnchor = parsed;
          }
        }
      } catch {
        // Safe fallback if sessionStorage is inaccessible
      }
    }
    if (!bgAnchor) {
      bgAnchor = performance.timeOrigin + performance.now();
      try {
        sessionStorage.setItem('ef_bg_anchor_epoch', bgAnchor.toString());
      } catch {
        // Ignore
      }
    }
    (window as unknown as { __EF_BG_ANCHOR__?: number }).__EF_BG_ANCHOR__ = bgAnchor;
    this.startTime = bgAnchor;

    // Restore prior mouse parallax state if available to prevent jump on page navigation
    try {
      const savedMouse = sessionStorage.getItem('ef_bg_mouse_state');
      if (savedMouse) {
        const parsedM = JSON.parse(savedMouse);
        if (parsedM && typeof parsedM.x === 'number') {
          this.mouse.x = parsedM.x;
          this.mouse.y = parsedM.y;
          this.mouse.targetX = parsedM.targetX || parsedM.x;
          this.mouse.targetY = parsedM.targetY || parsedM.y;
        }
      }
    } catch {
      // Ignore
    }

    // 1. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: tier === 'HIGH' && !isMobile,
      powerPreference: 'high-performance',
    });
    const maxDpr = isMobile ? 1.0 : tier === 'HIGH' ? 1.75 : 1.25;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    this.renderer.setSize(window.innerWidth, window.innerHeight, false);

    // 2. Scene & Fog Setup
    this.scene = new THREE.Scene();
    const colors = getThemeColors(this.theme);
    this.scene.fog = new THREE.FogExp2(colors.fogColor, colors.fogDensity);

    // 3. Camera Setup
    const aspect = window.innerWidth / Math.max(window.innerHeight, 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 150);
    this.camera.position.set(0, 0, 16);

    // 4. Lighting Setup
    this.ambientLight = new THREE.AmbientLight(colors.ambientLightColor, colors.ambientIntensity);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(colors.keyLightColor, colors.keyIntensity);
    this.keyLight.position.set(10, 15, 10);
    this.scene.add(this.keyLight);

    this.plumLight = new THREE.PointLight(colors.plumLightColor, colors.plumLightIntensity, 48, 1.4);
    this.plumLight.position.set(-12, 6, -10);
    this.scene.add(this.plumLight);

    this.goldLight = new THREE.PointLight(colors.goldLightColor, colors.goldLightIntensity, 48, 1.4);
    this.goldLight.position.set(12, -4, -8);
    this.scene.add(this.goldLight);

    // 5. Modular Content Subsystems
    this.structures = new ArchitecturalStructures(this.theme);
    this.scene.add(this.structures.root);
    this.structures.setPage(this.page);

    this.particles = new AmbientParticles(this.tier, this.theme, this.isMobile);
    this.scene.add(this.particles.root);

    this.trails = new LightTrails(this.theme);
    this.scene.add(this.trails.group);

    // Start loop
    this.start();
  }

  public start(): void {
    if (this.isRunning) return;
    this.isRunning = true;
    this.tick = this.tick.bind(this);
    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  public pause(): void {
    this.isRunning = false;
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  public resume(): void {
    if (!this.isRunning) {
      this.start();
    }
  }

  /**
   * Main render loop with smooth interpolation and multi-layer parallax
   */
  private tick(now: number): void {
    if (!this.isRunning) return;

    const currentAbsoluteTime = performance.timeOrigin + now;
    const time = Math.max(0, (currentAbsoluteTime - this.startTime) * 0.001);

    // 1. Damped Mouse Interpolation (delicate lerp factor)
    if (!this.isMobile) {
      this.mouse.x += (this.mouse.targetX - this.mouse.x) * 0.035;
      this.mouse.y += (this.mouse.targetY - this.mouse.y) * 0.035;
    }

    // 2. Damped Scroll Interpolation
    this.scroll.scrollY += (this.scroll.targetScrollY - this.scroll.scrollY) * 0.045;
    const scrollProgress = Math.min(this.scroll.scrollY / 1400, 1.8);

    // 3. Multi-layer Parallax Offsets
    // Layer A (Foreground particles / bokeh): reacts with moderate parallax
    this.particles.root.position.x = this.mouse.x * 1.8;
    this.particles.root.position.y = -this.mouse.y * 1.2;

    // Layer B (Luminous trails): reacts with subtle mid-layer parallax
    this.trails.group.position.x = this.mouse.x * 0.8;
    this.trails.group.position.y = -this.mouse.y * 0.5;

    // Layer C (Architectural structures): reacts with refined low parallax
    this.structures.root.position.x = this.mouse.x * 0.4;
    this.structures.root.position.y = -this.mouse.y * 0.3;

    // 4. Camera Breathing + Smooth Scroll Depth Push
    const breathY = Math.sin(time * 0.25) * 0.2;
    const breathX = Math.cos(time * 0.18) * 0.18;

    const scrollYShift = -scrollProgress * 3.2;
    const scrollZShift = -scrollProgress * 2.2;

    this.camera.position.x = breathX + this.mouse.x * 0.6;
    this.camera.position.y = breathY + (-this.mouse.y * 0.4) + scrollYShift;
    this.camera.position.z = 16 + scrollZShift;

    // Delicate camera look angle
    this.camera.rotation.y = -this.mouse.x * 0.04;
    this.camera.rotation.x = this.mouse.y * 0.03 + scrollProgress * 0.02;

    // 5. Orbiting Atmospheric Lights (cast moving specular highlights)
    this.plumLight.position.x = -11 + Math.sin(time * 0.35) * 4.5;
    this.plumLight.position.y = 5 + Math.cos(time * 0.28) * 3.2;
    this.plumLight.position.z = -10 + Math.sin(time * 0.22) * 2.5;

    this.goldLight.position.x = 11 + Math.cos(time * 0.32) * 4.5;
    this.goldLight.position.y = -4 + Math.sin(time * 0.42) * 3.2;
    this.goldLight.position.z = -9 + Math.cos(time * 0.25) * 2.5;

    // 6. Subsystem Motion Updates
    this.structures.update(time);
    this.particles.update(time);
    this.trails.update();

    // 7. Render
    this.renderer.render(this.scene, this.camera);

    this.animationFrameId = requestAnimationFrame(this.tick);
  }

  /**
   * Handle viewport resize
   */
  public resize(): void {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / Math.max(h, 1);
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h, false);
  }

  /**
   * Transition to a new page environment
   */
  public setPage(page: PageEnvironmentType): void {
    this.page = page;
    this.structures.setPage(page);
  }

  /**
   * Dynamic Theme Transition (Dark / Light)
   */
  public setTheme(theme: ThemeMode): void {
    this.theme = theme;
    const colors: ThemeColors = getThemeColors(theme);

    if (this.scene.fog) {
      (this.scene.fog as THREE.FogExp2).color.setHex(colors.fogColor);
      (this.scene.fog as THREE.FogExp2).density = colors.fogDensity;
    }

    this.ambientLight.color.setHex(colors.ambientLightColor);
    this.ambientLight.intensity = colors.ambientIntensity;

    this.keyLight.color.setHex(colors.keyLightColor);
    this.keyLight.intensity = colors.keyIntensity;

    this.plumLight.color.setHex(colors.plumLightColor);
    this.plumLight.intensity = colors.plumLightIntensity;

    this.goldLight.color.setHex(colors.goldLightColor);
    this.goldLight.intensity = colors.goldLightIntensity;

    // Recreate particles and structures for accurate theme materials
    this.scene.remove(this.structures.root);
    this.structures.dispose();
    this.structures = new ArchitecturalStructures(this.theme);
    this.scene.add(this.structures.root);
    this.structures.setPage(this.page);

    this.scene.remove(this.particles.root);
    this.particles.dispose();
    this.particles = new AmbientParticles(this.tier, this.theme, this.isMobile);
    this.scene.add(this.particles.root);

    this.scene.remove(this.trails.group);
    this.trails.dispose();
    this.trails = new LightTrails(this.theme);
    this.scene.add(this.trails.group);
  }

  /**
   * Clean up all resources
   */
  public dispose(): void {
    this.pause();
    this.structures.dispose();
    this.particles.dispose();
    this.trails.dispose();
    this.renderer.dispose();
  }
}
