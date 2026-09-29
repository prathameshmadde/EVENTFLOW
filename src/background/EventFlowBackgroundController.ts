/**
 * EventFlow Background Controller (Singleton)
 * Coordinates the 3D WebGL background, fallback renderer, theme detection,
 * mouse/scroll listeners, and visibility lifecycle across all EventFlow pages.
 */

import { EventFlow3DBackground } from './EventFlow3DBackground';
import { FallbackRenderer } from './fallbackRenderer';
import { PageEnvironmentType, PerformanceTier, ThemeMode } from './types';

export class EventFlowBackgroundController {
  private static instance: EventFlowBackgroundController | null = null;

  private canvas: HTMLCanvasElement | null = null;
  private bg3d: EventFlow3DBackground | null = null;
  private fallback: FallbackRenderer | null = null;

  private tier: PerformanceTier = 'HIGH';
  private page: PageEnvironmentType = 'home';
  private theme: ThemeMode = 'dark';
  private prefersReducedMotion: boolean = false;
  private isMobile: boolean = false;
  private isWebGLSupported: boolean = false;

  private resizeTimeout: number | null = null;
  private themeObserver: MutationObserver | null = null;

  public static getInstance(): EventFlowBackgroundController {
    if (!EventFlowBackgroundController.instance) {
      EventFlowBackgroundController.instance = new EventFlowBackgroundController();
    }
    return EventFlowBackgroundController.instance;
  }

  private constructor() {
    this.detectEnvironment();
  }

  /**
   * Assess hardware capabilities, WebGL support, and user preferences
   */
  private detectEnvironment(): void {
    this.prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.isMobile = /Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent) || window.innerWidth < 768;

    // Check WebGL availability
    try {
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      this.isWebGLSupported = Boolean(gl);
    } catch {
      this.isWebGLSupported = false;
    }

    // Determine performance tier
    if (this.prefersReducedMotion || !this.isWebGLSupported) {
      this.tier = 'VERY_LOW';
    } else if (this.isMobile) {
      this.tier = 'LOW';
    } else {
      // Check device memory and concurrency where available
      const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory;
      const cores = navigator.hardwareConcurrency || 4;

      if (memory !== undefined && memory < 4) {
        this.tier = 'MEDIUM';
      } else if (cores < 4) {
        this.tier = 'MEDIUM';
      } else {
        this.tier = 'HIGH';
      }
    }

    // Determine current page environment
    this.page = this.detectPageEnvironment();

    // Determine initial theme
    this.theme = this.detectCurrentTheme();
  }

  /**
   * Map current pathname to appropriate 3D page environment archetype
   */
  private detectPageEnvironment(): PageEnvironmentType {
    const path = window.location.pathname.toLowerCase();

    if (
      path.includes('customer-dashboard') ||
      path.includes('manager-dashboard') ||
      path.includes('bookings') ||
      path.includes('my-bookings')
    ) {
      return 'dashboard';
    }

    if (path.includes('events') || path.includes('services') || path.includes('event-details')) {
      return 'events';
    }

    if (
      path.includes('proposal') ||
      path.includes('manager-requirements') ||
      path.includes('create-requirement') ||
      path.includes('my-requirements') ||
      path.includes('requirement-details')
    ) {
      return 'proposals';
    }

    if (path.includes('booking') || path.includes('tasks') || path.includes('guests')) {
      return 'booking';
    }

    if (path.includes('payment') || path.includes('refund')) {
      return 'payment';
    }

    if (path.includes('admin')) {
      return 'admin';
    }

    return 'home';
  }

  /**
   * Detect current theme from HTML attributes or localStorage
   */
  private detectCurrentTheme(): ThemeMode {
    const docTheme =
      document.documentElement.getAttribute('data-theme') ||
      document.body.getAttribute('data-ef-theme') ||
      localStorage.getItem('ef-theme');
    return docTheme === 'light' ? 'light' : 'dark';
  }

  /**
   * Mount on the given or found canvas element
   */
  public mount(targetCanvas?: HTMLCanvasElement): void {
    const canvasEl = targetCanvas || (document.getElementById('ef-scene') as HTMLCanvasElement);
    if (!canvasEl) {
      console.warn('[EventFlowBackground] Canvas #ef-scene not found in DOM.');
      return;
    }

    this.canvas = canvasEl;
    this.canvas.style.pointerEvents = 'none';

    // Route between 3D WebGL and 2D fallback based on tier
    if (this.isWebGLSupported && !this.prefersReducedMotion && this.tier !== 'VERY_LOW') {
      try {
        this.bg3d = new EventFlow3DBackground(
          this.canvas,
          this.theme,
          this.page,
          this.tier,
          this.isMobile
        );
      } catch (err) {
        console.warn('[EventFlowBackground] WebGL initialization failed, switching to fallback renderer.', err);
        this.fallback = new FallbackRenderer(this.canvas, this.theme, this.page);
      }
    } else {
      this.fallback = new FallbackRenderer(this.canvas, this.theme, this.page);
    }

    this.setupListeners();
    this.setupReadabilityOverlay();
  }

  /**
   * Set up event listeners for mouse, scroll, resize, theme, and tab visibility
   */
  private setupListeners(): void {
    // 1. Mouse Tracking (Desktop only)
    if (!this.isMobile && this.bg3d) {
      window.addEventListener(
        'mousemove',
        (e: MouseEvent) => {
          // Normalized coordinates from -1 to 1
          const nx = (e.clientX / window.innerWidth) * 2 - 1;
          const ny = (e.clientY / window.innerHeight) * 2 - 1;
          if (this.bg3d) {
            this.bg3d.mouse.targetX = nx;
            this.bg3d.mouse.targetY = ny;
          }
        },
        { passive: true }
      );
    }

    // 2. Scroll Tracking (Smooth continuous depth translation)
    window.addEventListener(
      'scroll',
      () => {
        const sy = window.scrollY || window.pageYOffset || 0;
        if (this.bg3d) {
          this.bg3d.scroll.targetScrollY = sy;
        }
      },
      { passive: true }
    );

    // 3. Viewport Resize Listener (Debounced)
    window.addEventListener(
      'resize',
      () => {
        if (this.resizeTimeout !== null) {
          clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = window.setTimeout(() => {
          if (this.bg3d) {
            this.bg3d.resize();
          } else if (this.fallback) {
            this.fallback.resize();
          }
        }, 120);
      },
      { passive: true }
    );

    // 4. Tab Visibility (Pause rendering when tab is hidden to save GPU/power)
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.bg3d) this.bg3d.pause();
      } else {
        if (this.bg3d) this.bg3d.resume();
      }
    });

    // 5. Theme Change Observer (HTML data-theme attribute)
    this.themeObserver = new MutationObserver(() => {
      const newTheme = this.detectCurrentTheme();
      if (newTheme !== this.theme) {
        this.theme = newTheme;
        if (this.bg3d) {
          this.bg3d.setTheme(this.theme);
        } else if (this.fallback) {
          this.fallback.setTheme(this.theme);
        }
        this.setupReadabilityOverlay();
      }
    });
    this.themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'class'],
    });

    // 6. Prefer reduced motion dynamic listener
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', (e) => {
      this.prefersReducedMotion = e.matches;
      if (this.prefersReducedMotion && this.bg3d) {
        this.bg3d.dispose();
        this.bg3d = null;
        if (this.canvas) {
          this.fallback = new FallbackRenderer(this.canvas, this.theme, this.page);
        }
      }
    });
  }

  /**
   * Configure page readability veil overlay for optimal typography contrast
   */
  private setupReadabilityOverlay(): void {
    let veil = document.querySelector('.ef-scene-veil') as HTMLElement;
    if (!veil && this.canvas) {
      veil = document.createElement('div');
      veil.className = 'ef-scene-veil';
      this.canvas.insertAdjacentElement('afterend', veil);
    }
    if (veil) {
      veil.style.pointerEvents = 'none';
      // Harmonious translucent gradient that preserves the vibrant continuous 3D background animation
      const isDark = this.theme === 'dark';
      if (isDark) {
        veil.style.background =
          'radial-gradient(ellipse at 85% 15%, rgba(212, 167, 44, 0.18) 0%, transparent 60%), radial-gradient(ellipse at 15% 85%, rgba(225, 29, 72, 0.12) 0%, transparent 55%), radial-gradient(ellipse at 50% 50%, rgba(124, 58, 237, 0.1) 0%, transparent 65%), linear-gradient(180deg, rgba(15, 13, 20, 0.2) 0%, rgba(15, 13, 20, 0.45) 45%, rgba(15, 13, 20, 0.65) 90%)';
      } else {
        veil.style.background =
          'radial-gradient(ellipse at 85% 15%, rgba(212, 167, 44, 0.12) 0%, transparent 55%), radial-gradient(ellipse at 15% 85%, rgba(124, 58, 237, 0.08) 0%, transparent 50%), linear-gradient(180deg, rgba(250, 249, 246, 0.25) 0%, rgba(250, 249, 246, 0.55) 50%, rgba(250, 249, 246, 0.75) 92%)';
      }
    }
  }

  /**
   * Programmatic Page Switch API
   */
  public setPage(page: PageEnvironmentType): void {
    this.page = page;
    if (this.bg3d) {
      this.bg3d.setPage(page);
    } else if (this.fallback) {
      this.fallback.setPage(page);
    }
  }

  /**
   * Teardown
   */
  public dispose(): void {
    if (this.themeObserver) {
      this.themeObserver.disconnect();
    }
    if (this.bg3d) {
      this.bg3d.dispose();
      this.bg3d = null;
    }
    if (this.fallback) {
      this.fallback.dispose();
      this.fallback = null;
    }
  }
}
