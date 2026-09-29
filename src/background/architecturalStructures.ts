/**
 * EventFlow Architectural 3D Structures — "EventFlow Living Atmosphere"
 * 
 * Cinematic, organic, event-tech 3D environment:
 * - Floating celestial celebration rings with non-harmonic multi-axis precession
 * - Grand architectural venue canopies & catenary arches
 * - Translucent celebration polyhedra with specular facets
 * - Open center composition preserving text and UI readability
 * - Page-specific architectural moods (Home, Dashboard, Events, Proposals, Booking, Payment, Admin)
 */

import * as THREE from 'three';
import { BRAND_COLORS } from './palette';
import { PageEnvironmentType, ThemeMode } from './types';

interface FloatingObject {
  mesh: THREE.Object3D;
  basePos: THREE.Vector3;
  baseRot: THREE.Euler;
  rotAxis: THREE.Vector3;
  rotSpeed: number;
  // Non-harmonic floating parameters
  freqX: number;
  freqY: number;
  freqZ: number;
  ampX: number;
  ampY: number;
  ampZ: number;
  phaseX: number;
  phaseY: number;
  phaseZ: number;
}

export class ArchitecturalStructures {
  public root: THREE.Group;
  public homeGroup: THREE.Group;
  public dashboardGroup: THREE.Group;
  public eventsGroup: THREE.Group;
  public proposalsGroup: THREE.Group;
  public bookingGroup: THREE.Group;
  public paymentGroup: THREE.Group;
  public adminGroup: THREE.Group;

  // Animated elements with organic motion profiles
  private floatingObjects: FloatingObject[] = [];
  private pulsingNodes: Array<{ mesh: THREE.Mesh; baseScale: number; phase: number; freq: number }> = [];

  constructor(theme: ThemeMode) {
    this.root = new THREE.Group();

    this.homeGroup = new THREE.Group();
    this.dashboardGroup = new THREE.Group();
    this.eventsGroup = new THREE.Group();
    this.proposalsGroup = new THREE.Group();
    this.bookingGroup = new THREE.Group();
    this.paymentGroup = new THREE.Group();
    this.adminGroup = new THREE.Group();

    this.root.add(this.homeGroup);
    this.root.add(this.dashboardGroup);
    this.root.add(this.eventsGroup);
    this.root.add(this.proposalsGroup);
    this.root.add(this.bookingGroup);
    this.root.add(this.paymentGroup);
    this.root.add(this.adminGroup);

    this.buildHomeStructures(theme);
    this.buildDashboardStructures(theme);
    this.buildEventsStructures(theme);
    this.buildProposalsStructures(theme);
    this.buildBookingStructures(theme);
    this.buildPaymentStructures(theme);
    this.buildAdminStructures(theme);
  }

  /**
   * Homepage: Grand cinematic event universe
   * Floating celestial celebration rings, grand amphitheater canopy curves,
   * faceted luxury crystal polyhedra.
   */
  /**
   * Home: Grand Festive Celebration Living Atmosphere
   * Replaces cold wireframe models with glowing celebratory floating lanterns/diyas,
   * undulating festive aurora silk waves, and sweeping celebration stage spotlights.
   */
  private buildHomeStructures(theme: ThemeMode): void {
    const isDark = theme === 'dark';

    // 1. Festive Glowing Floating Lanterns / Diyas
    const lanternCount = 14;
    const lanternCoords = [
      { x: -14.5, y: -4.0, z: -18, scale: 0.85, color: BRAND_COLORS.gold, glow: 0xf59e0b },
      { x: -11.0, y: 3.5, z: -16, scale: 0.7, color: BRAND_COLORS.goldLight, glow: 0xfde047 },
      { x: -8.5, y: -7.0, z: -22, scale: 1.05, color: BRAND_COLORS.rose, glow: 0xf43f5e },
      { x: -15.0, y: 7.2, z: -24, scale: 0.9, color: BRAND_COLORS.plum, glow: 0xa855f7 },
      { x: -5.0, y: 8.5, z: -20, scale: 0.65, color: BRAND_COLORS.gold, glow: 0xfbbf24 },
      { x: 5.5, y: 9.0, z: -22, scale: 0.75, color: BRAND_COLORS.goldLight, glow: 0xfef08a },
      { x: 10.5, y: 5.5, z: -17, scale: 0.95, color: BRAND_COLORS.rose, glow: 0xfb7185 },
      { x: 14.0, y: 2.0, z: -15, scale: 1.1, color: BRAND_COLORS.gold, glow: 0xf59e0b },
      { x: 16.5, y: -5.2, z: -20, scale: 0.8, color: BRAND_COLORS.plum, glow: 0x9333ea },
      { x: 12.0, y: -8.0, z: -23, scale: 1.0, color: BRAND_COLORS.gold, glow: 0xf59e0b },
      { x: 7.0, y: -6.5, z: -19, scale: 0.6, color: BRAND_COLORS.goldLight, glow: 0xfde047 },
      { x: -18.0, y: 0.5, z: -26, scale: 1.15, color: BRAND_COLORS.gold, glow: 0xd97706 },
      { x: 18.0, y: 7.0, z: -27, scale: 0.9, color: BRAND_COLORS.rose, glow: 0xe11d48 },
      { x: -2.0, y: 10.5, z: -28, scale: 0.7, color: BRAND_COLORS.goldLight, glow: 0xfef08a },
    ];

    lanternCoords.forEach((coord, i) => {
      const lanternGroup = new THREE.Group();

      // Glowing Diya / Lantern Core
      const coreGeom = new THREE.SphereGeometry(0.55 * coord.scale, 20, 20);
      const coreMat = new THREE.MeshStandardMaterial({
        color: coord.color,
        emissive: coord.glow,
        emissiveIntensity: isDark ? 0.75 : 0.45,
        roughness: 0.2,
        metalness: 0.4,
        transparent: true,
        opacity: isDark ? 0.92 : 0.78,
      });
      const coreMesh = new THREE.Mesh(coreGeom, coreMat);
      lanternGroup.add(coreMesh);

      // Ornate Golden Crown / Rim
      const rimGeom = new THREE.TorusGeometry(0.68 * coord.scale, 0.04 * coord.scale, 16, 36);
      const rimMat = new THREE.MeshStandardMaterial({
        color: BRAND_COLORS.gold,
        metalness: 0.95,
        roughness: 0.15,
        transparent: true,
        opacity: isDark ? 0.85 : 0.65,
      });
      const rimMesh = new THREE.Mesh(rimGeom, rimMat);
      rimMesh.rotation.x = Math.PI / 2;
      lanternGroup.add(rimMesh);

      // Soft Ambient Light Halo Ring
      const haloGeom = new THREE.RingGeometry(0.7 * coord.scale, 1.3 * coord.scale, 28);
      const haloMat = new THREE.MeshBasicMaterial({
        color: coord.glow,
        transparent: true,
        opacity: isDark ? 0.25 : 0.12,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      });
      const haloMesh = new THREE.Mesh(haloGeom, haloMat);
      lanternGroup.add(haloMesh);

      lanternGroup.position.set(coord.x, coord.y, coord.z);
      this.homeGroup.add(lanternGroup);

      // Smooth floating harmonic movement
      this.floatingObjects.push({
        mesh: lanternGroup,
        basePos: lanternGroup.position.clone(),
        baseRot: lanternGroup.rotation.clone(),
        rotAxis: new THREE.Vector3(0.2, 1, 0.3).normalize(),
        rotSpeed: 0.0004 * (i % 2 === 0 ? 1 : -1),
        freqX: 0.15 + (i * 0.03) % 0.15,
        freqY: 0.2 + (i * 0.04) % 0.2,
        freqZ: 0.12 + (i * 0.02) % 0.12,
        ampX: 0.45 + (i % 3) * 0.15,
        ampY: 0.75 + (i % 4) * 0.2,
        ampZ: 0.5 + (i % 2) * 0.2,
        phaseX: i * 0.8,
        phaseY: i * 1.3,
        phaseZ: i * 0.5,
      });

      this.pulsingNodes.push({
        mesh: coreMesh,
        baseScale: 1,
        phase: i * 0.9,
        freq: 0.35 + (i % 3) * 0.1,
      });
    });

    // 2. Flowing Festive Aurora Silk Ribbon Waves
    const createAuroraWave = (
      radius: number,
      tube: number,
      color: number,
      emissive: number,
      pos: THREE.Vector3,
      rot: THREE.Euler,
      rotSpeed: number
    ) => {
      const geom = new THREE.TorusGeometry(radius, tube, 24, 120);
      const mat = new THREE.MeshStandardMaterial({
        color: color,
        emissive: emissive,
        emissiveIntensity: isDark ? 0.45 : 0.25,
        metalness: 0.85,
        roughness: 0.2,
        transparent: true,
        opacity: isDark ? 0.65 : 0.42,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(pos);
      mesh.rotation.copy(rot);
      this.homeGroup.add(mesh);

      this.floatingObjects.push({
        mesh,
        basePos: pos.clone(),
        baseRot: rot.clone(),
        rotAxis: new THREE.Vector3(0.3, 0.8, 0.5).normalize(),
        rotSpeed,
        freqX: 0.08,
        freqY: 0.12,
        freqZ: 0.09,
        ampX: 0.4,
        ampY: 0.6,
        ampZ: 0.45,
        phaseX: 0.4,
        phaseY: 1.8,
        phaseZ: 2.5,
      });
    };

    // Ribbon 1: Royal Saffron & Gold Arching Canopy (Right side)
    createAuroraWave(
      9.2,
      0.08,
      BRAND_COLORS.gold,
      0xf59e0b,
      new THREE.Vector3(14.0, 3.5, -19.0),
      new THREE.Euler(0.6, 0.4, 0.2),
      0.00035
    );

    // Ribbon 2: Royal Velvet Plum & Rose (Left side)
    createAuroraWave(
      11.0,
      0.07,
      BRAND_COLORS.plum,
      0x9333ea,
      new THREE.Vector3(-15.5, -2.5, -24.0),
      new THREE.Euler(0.4, -0.6, 0.3),
      -0.0003
    );

    // Ribbon 3: Deep Celebration Horizon Ring (Atmospheric depth)
    createAuroraWave(
      14.5,
      0.06,
      BRAND_COLORS.rose,
      0xe11d48,
      new THREE.Vector3(3.0, 7.0, -30.0),
      new THREE.Euler(0.2, 0.1, 0.5),
      0.0002
    );

    // 3. Sweeping Celebration Stage Searchlights / Spot Cones
    const beamCount = 3;
    const beamColors = [0xf59e0b, 0xa855f7, 0xf43f5e];
    for (let b = 0; b < beamCount; b++) {
      const beamGeom = new THREE.CylinderGeometry(0.1, 3.8, 26, 24, 1, true);
      const beamMat = new THREE.MeshBasicMaterial({
        color: beamColors[b],
        transparent: true,
        opacity: isDark ? 0.1 : 0.05,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const beamMesh = new THREE.Mesh(beamGeom, beamMat);
      beamMesh.position.set((b - 1) * 11, -12, -22);
      beamMesh.rotation.set(0.4, (b - 1) * 0.3, (b - 1) * 0.2);
      this.homeGroup.add(beamMesh);

      this.floatingObjects.push({
        mesh: beamMesh,
        basePos: beamMesh.position.clone(),
        baseRot: beamMesh.rotation.clone(),
        rotAxis: new THREE.Vector3(0, 0, 1),
        rotSpeed: 0,
        freqX: 0.06 + b * 0.02,
        freqY: 0.1 + b * 0.02,
        freqZ: 0.05,
        ampX: 0.3,
        ampY: 0.5,
        ampZ: 0.3,
        phaseX: b * 1.5,
        phaseY: b * 2.0,
        phaseZ: b * 1.1,
      });
    }
  }

  /**
   * Dashboard: Calm, professional event-control constellation
   */
  private buildDashboardStructures(theme: ThemeMode): void {
    const isDark = theme === 'dark';

    const nodeMat = new THREE.MeshStandardMaterial({
      color: BRAND_COLORS.plum,
      metalness: 0.7,
      roughness: 0.35,
      transparent: true,
      opacity: isDark ? 0.5 : 0.32,
    });

    const lineMat = new THREE.LineBasicMaterial({
      color: BRAND_COLORS.plumHover,
      transparent: true,
      opacity: isDark ? 0.22 : 0.12,
    });

    // Constellation coordinate nodes
    const nodeCoords = [
      [-14, 7, -22],
      [-6, 9, -26],
      [9, 8, -24],
      [16, 6, -26],
      [-12, -5, -24],
      [-3, -6, -28],
      [8, -4, -26],
      [15, -6, -29],
    ];

    const points: THREE.Vector3[] = [];
    nodeCoords.forEach(([x, y, z], idx) => {
      const geom = new THREE.SphereGeometry(0.32, 16, 16);
      const mesh = new THREE.Mesh(geom, nodeMat);
      mesh.position.set(x, y, z);
      this.dashboardGroup.add(mesh);
      points.push(new THREE.Vector3(x, y, z));

      this.pulsingNodes.push({ mesh, baseScale: 1, phase: idx * 0.7, freq: 0.25 });
    });

    const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
    const lines = new THREE.Line(lineGeom, lineMat);
    this.dashboardGroup.add(lines);

    // Calm architectural datum circle
    const datumGeom = new THREE.TorusGeometry(15.0, 0.035, 16, 100);
    const datumMat = new THREE.MeshBasicMaterial({
      color: BRAND_COLORS.plumDeep,
      transparent: true,
      opacity: isDark ? 0.2 : 0.1,
      wireframe: true,
    });
    const datum = new THREE.Mesh(datumGeom, datumMat);
    datum.position.set(0, 0, -25);
    this.dashboardGroup.add(datum);

    this.floatingObjects.push({
      mesh: datum,
      basePos: datum.position.clone(),
      baseRot: datum.rotation.clone(),
      rotAxis: new THREE.Vector3(0.1, 1, 0.05).normalize(),
      rotSpeed: 0.00012,
      freqX: 0.04,
      freqY: 0.07,
      freqZ: 0.05,
      ampX: 0.2,
      ampY: 0.3,
      ampZ: 0.2,
      phaseX: 0,
      phaseY: 1.5,
      phaseZ: 0.8,
    });
  }

  /**
   * Events: Venue-inspired stage architecture & amphitheater curves
   */
  private buildEventsStructures(theme: ThemeMode): void {
    const isDark = theme === 'dark';

    const curveMat = new THREE.MeshStandardMaterial({
      color: BRAND_COLORS.plum,
      metalness: 0.75,
      roughness: 0.28,
      transparent: true,
      opacity: isDark ? 0.38 : 0.22,
      wireframe: true,
    });

    for (let i = 0; i < 3; i++) {
      const stageArc = new THREE.TorusGeometry(10.0 + i * 3.5, 0.065, 16, 90, Math.PI * 1.25);
      const mesh = new THREE.Mesh(stageArc, curveMat);
      mesh.position.set(0, -5.5 + i * 0.9, -19.0 - i * 5.5);
      mesh.rotation.set(-0.25, 0, i * 0.25);
      this.eventsGroup.add(mesh);

      this.floatingObjects.push({
        mesh,
        basePos: mesh.position.clone(),
        baseRot: mesh.rotation.clone(),
        rotAxis: new THREE.Vector3(0, 1, 0),
        rotSpeed: 0,
        freqX: 0.06,
        freqY: 0.1,
        freqZ: 0.06,
        ampX: 0.2,
        ampY: 0.45,
        ampZ: 0.3,
        phaseX: i * 0.9,
        phaseY: i * 1.3,
        phaseZ: i * 0.7,
      });
    }

    // Ambient Spotlight Cones
    const coneGeom = new THREE.ConeGeometry(3.5, 18, 16, 1, true);
    const coneMat = new THREE.MeshBasicMaterial({
      color: BRAND_COLORS.gold,
      transparent: true,
      opacity: isDark ? 0.055 : 0.025,
      side: THREE.DoubleSide,
    });

    const cone1 = new THREE.Mesh(coneGeom, coneMat);
    cone1.position.set(-12, 11, -22);
    cone1.rotation.set(0.5, 0, -0.4);
    this.eventsGroup.add(cone1);

    const cone2 = new THREE.Mesh(coneGeom, coneMat);
    cone2.position.set(12, 11, -22);
    cone2.rotation.set(0.5, 0, 0.4);
    this.eventsGroup.add(cone2);
  }

  /**
   * Proposals: Negotiation and connection network
   */
  private buildProposalsStructures(theme: ThemeMode): void {
    const isDark = theme === 'dark';

    const clientNode = new THREE.Vector3(-11, 3.5, -20);
    const requirementNode = new THREE.Vector3(-4, 1.2, -21);
    const manager1Node = new THREE.Vector3(7, 6.5, -22);
    const manager2Node = new THREE.Vector3(9, -1.5, -23);
    const manager3Node = new THREE.Vector3(6, -6.5, -24);
    const quoteNode = new THREE.Vector3(13, 2.5, -22);

    const networkPoints = [
      clientNode, requirementNode,
      requirementNode, manager1Node,
      requirementNode, manager2Node,
      requirementNode, manager3Node,
      manager1Node, quoteNode,
      manager2Node, quoteNode,
    ];

    const netGeom = new THREE.BufferGeometry().setFromPoints(networkPoints);
    const netLineMat = new THREE.LineBasicMaterial({
      color: BRAND_COLORS.gold,
      transparent: true,
      opacity: isDark ? 0.38 : 0.2,
    });
    const netLines = new THREE.LineSegments(netGeom, netLineMat);
    this.proposalsGroup.add(netLines);

    // Glowing Node Spheres
    const nodeSpheres = [
      { pos: clientNode, color: BRAND_COLORS.plum, size: 0.5 },
      { pos: requirementNode, color: BRAND_COLORS.gold, size: 0.65 },
      { pos: manager1Node, color: BRAND_COLORS.plumHover, size: 0.45 },
      { pos: manager2Node, color: BRAND_COLORS.plumHover, size: 0.45 },
      { pos: manager3Node, color: BRAND_COLORS.plumHover, size: 0.45 },
      { pos: quoteNode, color: BRAND_COLORS.rose, size: 0.55 },
    ];

    nodeSpheres.forEach((ns, i) => {
      const geom = new THREE.SphereGeometry(ns.size, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: ns.color,
        metalness: 0.85,
        roughness: 0.2,
        transparent: true,
        opacity: isDark ? 0.85 : 0.6,
      });
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.copy(ns.pos);
      this.proposalsGroup.add(mesh);
      this.pulsingNodes.push({ mesh, baseScale: 1, phase: i * 0.8, freq: 0.3 });
    });
  }

  /**
   * Booking: Production journey spline and celebration rings
   */
  private buildBookingStructures(theme: ThemeMode): void {
    const isDark = theme === 'dark';

    const journeyCurve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-18, -8, -26),
      new THREE.Vector3(-8, 2, -22),
      new THREE.Vector3(2, 6, -20),
      new THREE.Vector3(12, 1, -22),
      new THREE.Vector3(20, 8, -26),
    ]);

    const tubeGeom = new THREE.TubeGeometry(journeyCurve, 70, 0.08, 12, false);
    const tubeMat = new THREE.MeshStandardMaterial({
      color: BRAND_COLORS.gold,
      metalness: 0.85,
      roughness: 0.25,
      transparent: true,
      opacity: isDark ? 0.55 : 0.3,
    });
    const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
    this.bookingGroup.add(tubeMesh);

    // Milestone Checkpoint Rings
    const ringGeom = new THREE.TorusGeometry(1.6, 0.05, 16, 40);
    const ringMat = new THREE.MeshStandardMaterial({
      color: BRAND_COLORS.plum,
      metalness: 0.8,
      roughness: 0.25,
      transparent: true,
      opacity: isDark ? 0.75 : 0.5,
    });

    [0.15, 0.45, 0.75].forEach((t, idx) => {
      const pos = journeyCurve.getPointAt(t);
      const ring = new THREE.Mesh(ringGeom, ringMat);
      ring.position.copy(pos);
      this.bookingGroup.add(ring);

      this.floatingObjects.push({
        mesh: ring,
        basePos: ring.position.clone(),
        baseRot: ring.rotation.clone(),
        rotAxis: new THREE.Vector3(0.3, 1, 0.2).normalize(),
        rotSpeed: 0.0004 * (idx % 2 === 0 ? 1 : -1),
        freqX: 0.08,
        freqY: 0.12,
        freqZ: 0.07,
        ampX: 0.2,
        ampY: 0.3,
        ampZ: 0.2,
        phaseX: idx,
        phaseY: idx * 1.4,
        phaseZ: idx * 0.6,
      });
    });
  }

  /**
   * Payment: Secure Escrow Vault Ring & Trust Geometry
   */
  private buildPaymentStructures(theme: ThemeMode): void {
    const isDark = theme === 'dark';

    const goldMat = new THREE.MeshStandardMaterial({
      color: BRAND_COLORS.gold,
      metalness: 0.92,
      roughness: 0.15,
      transparent: true,
      opacity: isDark ? 0.8 : 0.55,
    });

    const plumShieldMat = new THREE.MeshStandardMaterial({
      color: BRAND_COLORS.plum,
      metalness: 0.78,
      roughness: 0.3,
      transparent: true,
      opacity: isDark ? 0.45 : 0.28,
    });

    // Center-right Escrow Ring (vault representation)
    const vaultGeom = new THREE.TorusGeometry(5.0, 0.1, 24, 80);
    const vaultMesh = new THREE.Mesh(vaultGeom, goldMat);
    vaultMesh.position.set(11, 1, -19);
    vaultMesh.rotation.set(0.35, 0.6, 0.1);
    this.paymentGroup.add(vaultMesh);

    this.floatingObjects.push({
      mesh: vaultMesh,
      basePos: vaultMesh.position.clone(),
      baseRot: vaultMesh.rotation.clone(),
      rotAxis: new THREE.Vector3(0.5, 0.8, 0.3).normalize(),
      rotSpeed: 0.00028,
      freqX: 0.07,
      freqY: 0.11,
      freqZ: 0.08,
      ampX: 0.3,
      ampY: 0.45,
      ampZ: 0.35,
      phaseX: 1.0,
      phaseY: 2.0,
      phaseZ: 0.5,
    });

    // Interlocking Escrow Inner Ring
    const innerGeom = new THREE.TorusGeometry(3.6, 0.07, 20, 60);
    const innerMesh = new THREE.Mesh(innerGeom, plumShieldMat);
    innerMesh.position.set(11.4, 1.2, -18.6);
    innerMesh.rotation.set(-0.3, 0.8, -0.2);
    this.paymentGroup.add(innerMesh);

    this.floatingObjects.push({
      mesh: innerMesh,
      basePos: innerMesh.position.clone(),
      baseRot: innerMesh.rotation.clone(),
      rotAxis: new THREE.Vector3(-0.4, 0.9, -0.2).normalize(),
      rotSpeed: -0.00035,
      freqX: 0.09,
      freqY: 0.14,
      freqZ: 0.06,
      ampX: 0.25,
      ampY: 0.4,
      ampZ: 0.3,
      phaseX: 2.5,
      phaseY: 0.7,
      phaseZ: 1.8,
    });
  }

  /**
   * Admin: Structured architectural grid frame
   */
  private buildAdminStructures(theme: ThemeMode): void {
    const isDark = theme === 'dark';

    const boxGeom = new THREE.BoxGeometry(22, 15, 12);
    const boxMat = new THREE.MeshBasicMaterial({
      color: BRAND_COLORS.plumDeep,
      wireframe: true,
      transparent: true,
      opacity: isDark ? 0.18 : 0.09,
    });
    const gridBox = new THREE.Mesh(boxGeom, boxMat);
    gridBox.position.set(0, 0, -25);
    this.adminGroup.add(gridBox);

    this.floatingObjects.push({
      mesh: gridBox,
      basePos: gridBox.position.clone(),
      baseRot: gridBox.rotation.clone(),
      rotAxis: new THREE.Vector3(0.05, 1, 0.02).normalize(),
      rotSpeed: 0.00008,
      freqX: 0.03,
      freqY: 0.05,
      freqZ: 0.04,
      ampX: 0.15,
      ampY: 0.25,
      ampZ: 0.15,
      phaseX: 0,
      phaseY: 1.2,
      phaseZ: 2.0,
    });
  }

  /**
   * Switch visible group based on active page
   */
  public setPage(page: PageEnvironmentType): void {
    // Keep the home celebration living atmosphere active everywhere so continuous animation matches the home page
    this.homeGroup.visible = true;
    this.dashboardGroup.visible = page === 'dashboard' || page === 'home';
    this.eventsGroup.visible = page === 'events';
    this.proposalsGroup.visible = page === 'proposals';
    this.bookingGroup.visible = page === 'booking';
    this.paymentGroup.visible = page === 'payment';
    this.adminGroup.visible = page === 'admin';
  }

  /**
   * Organic motion update step:
   * Combines slow continuous precession with non-harmonic multi-axis sinusoidal drift.
   * Eliminates repetitive 360-degree loops.
   */
  public update(time: number): void {
    // 1. Organic floating & precession for all structural objects
    for (let i = 0; i < this.floatingObjects.length; i++) {
      const obj = this.floatingObjects[i];

      // Multi-axis organic position drift with non-harmonic frequencies
      const dx = Math.sin(time * obj.freqX + obj.phaseX) * obj.ampX + Math.cos(time * 0.05 + obj.phaseZ) * (obj.ampX * 0.25);
      const dy = Math.sin(time * obj.freqY + obj.phaseY) * obj.ampY + Math.cos(time * 0.07) * (obj.ampY * 0.2);
      const dz = Math.cos(time * obj.freqZ + obj.phaseZ) * obj.ampZ;

      obj.mesh.position.x = obj.basePos.x + dx;
      obj.mesh.position.y = obj.basePos.y + dy;
      obj.mesh.position.z = obj.basePos.z + dz;

      // Organic rotation: slow precession on distinct 3D vector + subtle wave tilt
      if (obj.rotSpeed !== 0) {
        obj.mesh.rotateOnAxis(obj.rotAxis, obj.rotSpeed);
      }
    }

    // 2. Subtle organic breathing pulse for constellation nodes
    for (let k = 0; k < this.pulsingNodes.length; k++) {
      const node = this.pulsingNodes[k];
      const scale = node.baseScale + Math.sin(time * node.freq + node.phase) * 0.08;
      node.mesh.scale.set(scale, scale, scale);
    }
  }

  /**
   * Clean up all geometries and materials on dispose
   */
  public dispose(): void {
    this.root.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) {
        const mesh = obj as THREE.Mesh;
        if (mesh.geometry) mesh.geometry.dispose();
        if (mesh.material) {
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m) => m.dispose());
          } else {
            mesh.material.dispose();
          }
        }
      }
    });
  }
}
