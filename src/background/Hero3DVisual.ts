/**
 * EventFlow Hero 3D Celebration Stage & Planning Pavilion
 * 
 * A high-performance WebGL centerpiece for the EventFlow homepage hero.
 * Communicates: Celebration + Event Planning + Trusted Event Managers + Technology
 * 
 * Features:
 * - 3D Tiered Marble & Gold Celebration Dais
 * - Grand Ceremonial Floral Canopy Arch
 * - Floating Luxury Event Brief & Gold Wax Seal
 * - Interlocking Golden Milestone & Wedding Celebration Rings
 * - Suspended Ambient Crystal Lanterns with Warm Candlelight Glow
 * - Drifting Celebratory Embers & Spark Particle System
 * - Smooth Lerped Mouse Parallax & Scroll Depth
 * - Strict Performance Throttling (IntersectionObserver, DPR capping, Mobile LOD, prefers-reduced-motion)
 */

import * as THREE from 'three';

export class Hero3DVisual {
  private container: HTMLElement;
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;

  // Scene elements
  private stageGroup: THREE.Group;
  private floatingCard: THREE.Group;
  private milestoneRings: THREE.Group;
  private lanterns: THREE.Group[] = [];
  private particles: THREE.Points | null = null;
  private particlePositions: Float32Array | null = null;

  // Lighting
  private ambientLight: THREE.AmbientLight;
  private keyLight: THREE.DirectionalLight;
  private plumLight: THREE.PointLight;
  private goldLight: THREE.PointLight;

  // State & Motion
  private isVisible: boolean = true;
  private prefersReducedMotion: boolean = false;
  private isMobile: boolean = false;
  private animationFrameId: number | null = null;
  private clock: THREE.Clock;
  private targetRotX: number = 0;
  private targetRotY: number = 0;
  private currentRotX: number = 0;
  private currentRotY: number = 0;
  private resizeObserver: ResizeObserver | null = null;
  private intersectionObserver: IntersectionObserver | null = null;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.container = canvas.parentElement || document.body;
    this.clock = new THREE.Clock();

    this.checkEnvironment();

    // 1. Renderer setup
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: !this.isMobile,
      powerPreference: 'high-performance',
    });

    const maxDpr = this.isMobile ? 1.0 : 1.5;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, maxDpr));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    // 2. Scene setup
    this.scene = new THREE.Scene();

    // 3. Camera setup
    const aspect = (this.container.clientWidth || 600) / (this.container.clientHeight || 500);
    this.camera = new THREE.PerspectiveCamera(40, aspect, 0.1, 100);
    this.camera.position.set(0, 1.8, 10.5);

    // 4. Lighting setup
    this.ambientLight = new THREE.AmbientLight(0xfff6ea, 1.4);
    this.scene.add(this.ambientLight);

    this.keyLight = new THREE.DirectionalLight(0xffeedd, 2.2);
    this.keyLight.position.set(6, 10, 8);
    this.scene.add(this.keyLight);

    this.plumLight = new THREE.PointLight(0xc026d3, 2.8, 28, 1.4);
    this.plumLight.position.set(-7, 4, -4);
    this.scene.add(this.plumLight);

    this.goldLight = new THREE.PointLight(0xf59e0b, 3.4, 25, 1.2);
    this.goldLight.position.set(5, -1, 4);
    this.scene.add(this.goldLight);

    // 5. Build 3D Celebration Environment
    this.stageGroup = new THREE.Group();
    this.floatingCard = new THREE.Group();
    this.milestoneRings = new THREE.Group();

    this.buildCelebrationStage();
    this.buildCeremonialArch();
    this.buildFloatingEventBrief();
    this.buildMilestoneRings();
    this.buildCrystalLanterns();
    this.buildCelebratoryParticles();

    this.scene.add(this.stageGroup);
    this.stageGroup.position.set(0, -0.6, 0);

    // 6. Observers & Listeners
    this.setupResize();
    this.setupVisibility();
    this.setupInteractivity();
    this.setupThemeWatcher();

    // 7. Start Render Loop
    this.start();
  }

  private checkEnvironment(): void {
    this.isMobile = window.innerWidth < 768;
    this.prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Builds the Tiered Marble & Gold Celebration Dais
   */
  private buildCelebrationStage(): void {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Materials
    const marbleMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x221c30 : 0xfbf9f5,
      roughness: 0.18,
      metalness: 0.22,
    });

    const goldTrimMat = new THREE.MeshStandardMaterial({
      color: 0xd4a72c,
      roughness: 0.2,
      metalness: 0.85,
    });

    const velvetMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x4a0e2e : 0x7c1a4e,
      roughness: 0.6,
      metalness: 0.1,
    });

    // Lower Tier (Platform Base)
    const lowerGeom = new THREE.CylinderGeometry(4.2, 4.4, 0.35, 48);
    const lowerMesh = new THREE.Mesh(lowerGeom, marbleMat);
    lowerMesh.position.y = -1.8;
    this.stageGroup.add(lowerMesh);

    // Lower Gold Rim Ring
    const lowerRimGeom = new THREE.TorusGeometry(4.3, 0.05, 16, 64);
    const lowerRim = new THREE.Mesh(lowerRimGeom, goldTrimMat);
    lowerRim.rotation.x = Math.PI / 2;
    lowerRim.position.y = -1.65;
    this.stageGroup.add(lowerRim);

    // Upper Tier (Main Celebration Podium)
    const upperGeom = new THREE.CylinderGeometry(3.3, 3.45, 0.3, 48);
    const upperMesh = new THREE.Mesh(upperGeom, marbleMat);
    upperMesh.position.y = -1.5;
    this.stageGroup.add(upperMesh);

    // Center Velvet Inset
    const insetGeom = new THREE.CylinderGeometry(2.6, 2.6, 0.05, 40);
    const insetMesh = new THREE.Mesh(insetGeom, velvetMat);
    insetMesh.position.y = -1.34;
    this.stageGroup.add(insetMesh);

    // Golden Boundary Stanchions with Catenary Ropes
    const stanchionGeom = new THREE.CylinderGeometry(0.045, 0.055, 0.8, 16);
    const stanchionHeadGeom = new THREE.SphereGeometry(0.09, 16, 16);
    const numPosts = 6;
    const postRadius = 3.1;

    for (let i = 0; i < numPosts; i++) {
      const angle = (i / numPosts) * Math.PI * 2;
      const x = Math.cos(angle) * postRadius;
      const z = Math.sin(angle) * postRadius;

      const postGroup = new THREE.Group();
      const post = new THREE.Mesh(stanchionGeom, goldTrimMat);
      const head = new THREE.Mesh(stanchionHeadGeom, goldTrimMat);
      head.position.y = 0.42;
      postGroup.add(post);
      postGroup.add(head);

      postGroup.position.set(x, -1.0, z);
      this.stageGroup.add(postGroup);
    }
  }

  /**
   * Builds the Ceremonial Floral / Catenary Canopy Arch
   */
  private buildCeremonialArch(): void {
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xdfb43a,
      roughness: 0.25,
      metalness: 0.8,
    });

    const crystalMat = new THREE.MeshStandardMaterial({
      color: 0xf3e8ff,
      roughness: 0.1,
      metalness: 0.9,
      transparent: true,
      opacity: 0.85,
    });

    const plumMat = new THREE.MeshStandardMaterial({
      color: 0xb8236d,
      roughness: 0.3,
      metalness: 0.5,
    });

    // Outer Grand Arch Curve
    const archCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.8, -1.3, -0.4),
      new THREE.Vector3(-2.2, 1.2, -0.2),
      new THREE.Vector3(0, 2.5, 0),
      new THREE.Vector3(2.2, 1.2, -0.2),
      new THREE.Vector3(2.8, -1.3, -0.4),
    ]);

    const archGeom = new THREE.TubeGeometry(archCurve, 64, 0.07, 12, false);
    const archMesh = new THREE.Mesh(archGeom, goldMat);
    this.stageGroup.add(archMesh);

    // Inner Secondary Swag Curve
    const swagCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-2.5, -1.3, -0.2),
      new THREE.Vector3(-1.8, 0.8, 0.1),
      new THREE.Vector3(0, 2.0, 0.2),
      new THREE.Vector3(1.8, 0.8, 0.1),
      new THREE.Vector3(2.5, -1.3, -0.2),
    ]);

    const swagGeom = new THREE.TubeGeometry(swagCurve, 48, 0.045, 10, false);
    const swagMesh = new THREE.Mesh(swagGeom, goldMat);
    this.stageGroup.add(swagMesh);

    // Floral & Crystal Rosettes along the Arch
    const rosetteGeom = new THREE.IcosahedronGeometry(0.12, 1);
    const petalGeom = new THREE.ConeGeometry(0.08, 0.18, 5);

    for (let t = 0.15; t <= 0.85; t += 0.08) {
      const pt = archCurve.getPoint(t);
      const rosette = new THREE.Mesh(rosetteGeom, t % 0.16 < 0.08 ? crystalMat : plumMat);
      rosette.position.copy(pt);
      rosette.rotation.set(Math.random(), Math.random(), Math.random());
      this.stageGroup.add(rosette);

      // Accent petals
      for (let p = 0; p < 3; p++) {
        const petal = new THREE.Mesh(petalGeom, goldMat);
        petal.position.copy(pt);
        petal.position.x += (Math.random() - 0.5) * 0.15;
        petal.position.y += (Math.random() - 0.5) * 0.15;
        petal.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        this.stageGroup.add(petal);
      }
    }
  }

  /**
   * Floating 3D Event Brief / Luxury Invitation Card
   */
  private buildFloatingEventBrief(): void {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';

    // Parchment card
    const cardGeom = new THREE.BoxGeometry(1.6, 2.2, 0.03);
    const cardMat = new THREE.MeshStandardMaterial({
      color: isDark ? 0x1f192b : 0xfcfbfa,
      roughness: 0.35,
      metalness: 0.15,
    });
    const cardMesh = new THREE.Mesh(cardGeom, cardMat);

    // Gold card border
    const borderGeom = new THREE.BoxGeometry(1.64, 2.24, 0.02);
    const borderMat = new THREE.MeshStandardMaterial({
      color: 0xd4a72c,
      roughness: 0.2,
      metalness: 0.9,
    });
    const borderMesh = new THREE.Mesh(borderGeom, borderMat);
    borderMesh.position.z = -0.01;

    // Gold Wax Seal Medallion in center
    const sealGeom = new THREE.CylinderGeometry(0.26, 0.26, 0.04, 24);
    const sealMat = new THREE.MeshStandardMaterial({
      color: 0x9333ea,
      roughness: 0.3,
      metalness: 0.6,
    });
    const seal = new THREE.Mesh(sealGeom, sealMat);
    seal.rotation.x = Math.PI / 2;
    seal.position.set(0, 0.45, 0.025);

    // Seal emblem star
    const starGeom = new THREE.OctahedronGeometry(0.12);
    const starMat = new THREE.MeshStandardMaterial({
      color: 0xfde047,
      roughness: 0.15,
      metalness: 0.95,
    });
    const star = new THREE.Mesh(starGeom, starMat);
    star.position.set(0, 0.45, 0.05);

    // Decorative embossed lines (brief layout lines)
    const lineMat = new THREE.MeshBasicMaterial({
      color: isDark ? 0x645778 : 0xd8c7aa,
    });

    const lineGeom = new THREE.PlaneGeometry(1.1, 0.035);
    const line1 = new THREE.Mesh(lineGeom, lineMat);
    line1.position.set(0, -0.05, 0.02);

    const line2 = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 0.035), lineMat);
    line2.position.set(0, -0.25, 0.02);

    const line3 = new THREE.Mesh(new THREE.PlaneGeometry(1.0, 0.035), lineMat);
    line3.position.set(0, -0.45, 0.02);

    const line4 = new THREE.Mesh(new THREE.PlaneGeometry(0.7, 0.035), lineMat);
    line4.position.set(0, -0.65, 0.02);

    this.floatingCard.add(borderMesh);
    this.floatingCard.add(cardMesh);
    this.floatingCard.add(seal);
    this.floatingCard.add(star);
    this.floatingCard.add(line1);
    this.floatingCard.add(line2);
    this.floatingCard.add(line3);
    this.floatingCard.add(line4);

    // Place floating card comfortably in stage center
    this.floatingCard.position.set(-0.2, 0.4, 0.8);
    this.floatingCard.rotation.set(0.12, -0.22, -0.06);
    this.stageGroup.add(this.floatingCard);
  }

  /**
   * Interlocking Golden Celebration & Milestone Rings
   */
  private buildMilestoneRings(): void {
    const ringMat1 = new THREE.MeshStandardMaterial({
      color: 0xeab308,
      roughness: 0.16,
      metalness: 0.92,
    });

    const ringMat2 = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.22,
      metalness: 0.88,
    });

    // Ring 1 (Solitaire / Celebration Ring)
    const ring1Geom = new THREE.TorusGeometry(0.85, 0.045, 20, 64);
    const ring1 = new THREE.Mesh(ring1Geom, ringMat1);

    // Solitaire Gem on Ring 1
    const gemGeom = new THREE.OctahedronGeometry(0.14);
    const gemMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.95,
      transparent: true,
      opacity: 0.9,
    });
    const gem = new THREE.Mesh(gemGeom, gemMat);
    gem.position.set(0, 0.88, 0);
    ring1.add(gem);

    // Ring 2 (Interlocking Band)
    const ring2Geom = new THREE.TorusGeometry(0.78, 0.04, 18, 60);
    const ring2 = new THREE.Mesh(ring2Geom, ringMat2);
    ring2.position.set(0.4, -0.2, 0.15);
    ring2.rotation.set(0.7, 0.6, 0.2);

    this.milestoneRings.add(ring1);
    this.milestoneRings.add(ring2);

    this.milestoneRings.position.set(1.7, 0.9, 0.5);
    this.milestoneRings.rotation.set(0.3, -0.4, 0.2);
    this.stageGroup.add(this.milestoneRings);
  }

  /**
   * Suspended Crystal Celebration Lanterns
   */
  private buildCrystalLanterns(): void {
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xd4a72c,
      roughness: 0.2,
      metalness: 0.85,
    });

    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xfff7ed,
      roughness: 0.1,
      metalness: 0.2,
      transparent: true,
      opacity: 0.65,
    });

    const flameMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
    });

    const positions = [
      new THREE.Vector3(-2.1, 0.6, 1.1),
      new THREE.Vector3(2.3, 0.3, 1.2),
    ];

    positions.forEach((pos, idx) => {
      const lantern = new THREE.Group();

      // Top cap & hook
      const capGeom = new THREE.ConeGeometry(0.18, 0.14, 6);
      const cap = new THREE.Mesh(capGeom, goldMat);
      cap.position.y = 0.35;
      lantern.add(cap);

      // Glass body
      const bodyGeom = new THREE.CylinderGeometry(0.15, 0.12, 0.45, 6);
      const body = new THREE.Mesh(bodyGeom, glassMat);
      lantern.add(body);

      // Base
      const baseGeom = new THREE.CylinderGeometry(0.16, 0.16, 0.06, 6);
      const base = new THREE.Mesh(baseGeom, goldMat);
      base.position.y = -0.25;
      lantern.add(base);

      // Interior warm flame
      const flameGeom = new THREE.SphereGeometry(0.06, 12, 12);
      const flame = new THREE.Mesh(flameGeom, flameMat);
      lantern.add(flame);

      // Mini point light
      const light = new THREE.PointLight(0xf59e0b, 1.5, 6);
      lantern.add(light);

      lantern.position.copy(pos);
      this.stageGroup.add(lantern);
      this.lanterns.push(lantern);
    });
  }

  /**
   * Celebratory Floating Sparks & Embers Particle System
   */
  private buildCelebratoryParticles(): void {
    const count = this.isMobile ? 30 : 65;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const goldColor = new THREE.Color(0xf59e0b);
    const roseColor = new THREE.Color(0xd946ef);
    const whiteColor = new THREE.Color(0xfffbeb);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      // Cylinder distribution around stage
      const angle = Math.random() * Math.PI * 2;
      const radius = 0.5 + Math.random() * 3.5;
      positions[idx] = Math.cos(angle) * radius;
      positions[idx + 1] = -1.2 + Math.random() * 3.8;
      positions[idx + 2] = Math.sin(angle) * radius * 0.8;

      // Varied celebratory tones
      const rand = Math.random();
      const col = rand > 0.6 ? goldColor : (rand > 0.3 ? roseColor : whiteColor);
      colors[idx] = col.r;
      colors[idx + 1] = col.g;
      colors[idx + 2] = col.b;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Particle sprite using canvas texture for clean round dot with soft halo
    const pCanvas = document.createElement('canvas');
    pCanvas.width = 32;
    pCanvas.height = 32;
    const ctx = pCanvas.getContext('2d');
    if (ctx) {
      const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
      grad.addColorStop(0, 'rgba(255,255,255,1)');
      grad.addColorStop(0.3, 'rgba(245,158,11,0.8)');
      grad.addColorStop(1, 'rgba(245,158,11,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 32, 32);
    }
    const texture = new THREE.CanvasTexture(pCanvas);

    const material = new THREE.PointsMaterial({
      size: this.isMobile ? 0.22 : 0.28,
      map: texture,
      transparent: true,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.particles = new THREE.Points(geometry, material);
    this.particlePositions = positions;
    this.stageGroup.add(this.particles);
  }

  private setupResize(): void {
    const handleResize = () => {
      const width = this.container.clientWidth || window.innerWidth;
      const height = this.container.clientHeight || 500;

      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(width, height, false);
      this.isMobile = window.innerWidth < 768;
    };

    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(handleResize);
      this.resizeObserver.observe(this.container);
    } else {
      window.addEventListener('resize', handleResize);
    }

    // Run initial sizing
    handleResize();
  }

  private setupVisibility(): void {
    if (window.IntersectionObserver) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          this.isVisible = entry.isIntersecting;
          if (this.isVisible && !this.animationFrameId) {
            this.start();
          }
        });
      }, { threshold: 0.1 });

      this.intersectionObserver.observe(this.canvas);
    }
  }

  private setupInteractivity(): void {
    const onMouseMove = (e: MouseEvent) => {
      if (this.prefersReducedMotion) return;
      const rect = this.canvas.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);

      // Constrain tilt to gentle, premium range
      this.targetRotY = x * 0.22;
      this.targetRotX = -y * 0.14;
    };

    const onScroll = () => {
      if (this.prefersReducedMotion) return;
      const scrollY = window.scrollY;
      const maxScroll = 600;
      const progress = Math.min(scrollY / maxScroll, 1.0);
      // Subtle depth recession on scroll
      this.camera.position.z = 10.5 + progress * 1.5;
      this.stageGroup.position.y = -0.6 - progress * 0.4;
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });

    // Touch support for tablet/mobile
    this.canvas.addEventListener('touchmove', (e: TouchEvent) => {
      if (this.prefersReducedMotion || !e.touches[0]) return;
      const touch = e.touches[0];
      const rect = this.canvas.getBoundingClientRect();
      const x = ((touch.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((touch.clientY - rect.top) / rect.height) * 2 - 1);
      this.targetRotY = x * 0.15;
      this.targetRotX = -y * 0.1;
    }, { passive: true });
  }

  private setupThemeWatcher(): void {
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      this.ambientLight.intensity = isDark ? 0.9 : 1.4;
      this.keyLight.intensity = isDark ? 1.8 : 2.2;
      this.plumLight.intensity = isDark ? 3.2 : 2.6;
      this.goldLight.intensity = isDark ? 3.8 : 3.0;
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
  }

  public start(): void {
    if (this.animationFrameId !== null) return;

    const animate = () => {
      if (!this.isVisible) {
        this.animationFrameId = null;
        return;
      }

      this.animationFrameId = requestAnimationFrame(animate);
      this.render();
    };

    this.animationFrameId = requestAnimationFrame(animate);
  }

  public stop(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private render(): void {
    let bgAnchor = (window as unknown as { __EF_BG_ANCHOR__?: number }).__EF_BG_ANCHOR__;
    if (!bgAnchor) {
      try {
        const stored = sessionStorage.getItem('ef_bg_anchor_epoch');
        if (stored) {
          const parsed = parseFloat(stored);
          if (!isNaN(parsed) && parsed > 0) {
            bgAnchor = parsed;
          }
        }
      } catch {
        // Fallback
      }
    }
    const elapsed = bgAnchor
      ? Math.max(0, (performance.timeOrigin + performance.now() - bgAnchor) * 0.001)
      : this.clock.getElapsedTime();

    if (!this.prefersReducedMotion) {
      // 1. Lerp mouse parallax for silk-smooth responsiveness
      this.currentRotX += (this.targetRotX - this.currentRotX) * 0.05;
      this.currentRotY += (this.targetRotY - this.currentRotY) * 0.05;

      // Base gentle breathing rotation + mouse parallax
      const breathingTilt = Math.sin(elapsed * 0.6) * 0.02;
      this.stageGroup.rotation.x = this.currentRotX + 0.1 + breathingTilt;
      this.stageGroup.rotation.y = this.currentRotY + Math.sin(elapsed * 0.4) * 0.04;

      // 2. Animate Floating Event Brief (Card)
      if (this.floatingCard) {
        this.floatingCard.position.y = 0.4 + Math.sin(elapsed * 1.3) * 0.12;
        this.floatingCard.rotation.y = -0.22 + Math.cos(elapsed * 0.8) * 0.08;
        this.floatingCard.rotation.z = -0.06 + Math.sin(elapsed * 0.9) * 0.03;
      }

      // 3. Animate Milestone Rings
      if (this.milestoneRings) {
        this.milestoneRings.position.y = 0.9 + Math.cos(elapsed * 1.1) * 0.1;
        this.milestoneRings.rotation.y = elapsed * 0.25;
        this.milestoneRings.rotation.x = 0.3 + Math.sin(elapsed * 0.7) * 0.08;
      }

      // 4. Animate Suspended Lanterns
      this.lanterns.forEach((lantern, i) => {
        const phase = i * 1.5;
        lantern.position.y += Math.sin(elapsed * 1.2 + phase) * 0.003;
        lantern.rotation.y = Math.sin(elapsed * 0.5 + phase) * 0.12;
      });

      // 5. Animate Floating Celebratory Embers
      if (this.particles && this.particlePositions) {
        const positions = this.particlePositions;
        const count = positions.length / 3;

        for (let i = 0; i < count; i++) {
          const idx = i * 3;
          // Gentle upward drift
          positions[idx + 1] += 0.004 + (i % 3) * 0.002;
          // Gentle horizontal sway
          positions[idx] += Math.sin(elapsed * 0.8 + i) * 0.002;

          // Wrap back around stage base when reaching top
          if (positions[idx + 1] > 2.8) {
            positions[idx + 1] = -1.3;
          }
        }

        const attr = this.particles.geometry.getAttribute('position') as THREE.BufferAttribute;
        if (attr) attr.needsUpdate = true;
      }

      // 6. Subtle Light Motion (celebratory ambience)
      this.goldLight.position.x = 4 + Math.sin(elapsed * 0.8) * 1.5;
      this.plumLight.position.y = 4 + Math.cos(elapsed * 0.7) * 1.2;
    }

    this.renderer.render(this.scene, this.camera);
  }

  public destroy(): void {
    this.stop();
    if (this.resizeObserver) this.resizeObserver.disconnect();
    if (this.intersectionObserver) this.intersectionObserver.disconnect();
    this.renderer.dispose();
  }
}
