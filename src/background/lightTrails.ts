/**
 * EventFlow Luminous 3D Light Trails
 * Flowing spline ribbons with traveling pulses through the architectural space.
 * Symbolic of event celebration paths, attendee connections, and planning journeys.
 */

import * as THREE from 'three';
import { BRAND_COLORS } from './palette';
import { ThemeMode } from './types';

export class LightTrails {
  public group: THREE.Group;
  private trails: Array<{
    curve: THREE.CatmullRomCurve3;
    pulseMesh: THREE.Mesh;
    speed: number;
    progress: number;
  }> = [];

  constructor(theme: ThemeMode) {
    this.group = new THREE.Group();
    const isDark = theme === 'dark';

    // 1. Primary Flowing Celebration Curve (Champagne Gold)
    const path1Points = [
      new THREE.Vector3(-22, -10, -22),
      new THREE.Vector3(-12, 2, -18),
      new THREE.Vector3(0, 8, -16),
      new THREE.Vector3(14, 0, -20),
      new THREE.Vector3(24, 12, -26),
    ];
    const curve1 = new THREE.CatmullRomCurve3(path1Points);
    this.createTrail(curve1, BRAND_COLORS.gold, isDark, 0.0016);

    // 2. Secondary Harmonious Curve (Royal Plum)
    const path2Points = [
      new THREE.Vector3(20, -12, -25),
      new THREE.Vector3(8, -4, -20),
      new THREE.Vector3(-4, 4, -17),
      new THREE.Vector3(-16, -2, -22),
      new THREE.Vector3(-24, 6, -28),
    ];
    const curve2 = new THREE.CatmullRomCurve3(path2Points);
    this.createTrail(curve2, BRAND_COLORS.plum, isDark, 0.0012);
  }

  private createTrail(
    curve: THREE.CatmullRomCurve3,
    color: number,
    isDark: boolean,
    speed: number
  ): void {
    // 1. Subtle glowing trail ribbon (path line)
    const points = curve.getPoints(120);
    const lineGeom = new THREE.BufferGeometry().setFromPoints(points);
    const lineMat = new THREE.LineBasicMaterial({
      color: color,
      transparent: true,
      opacity: isDark ? 0.32 : 0.18,
    });
    const lineMesh = new THREE.Line(lineGeom, lineMat);
    this.group.add(lineMesh);

    // 2. Traveling pulse sphere (luminous head)
    const pulseGeom = new THREE.SphereGeometry(0.35, 14, 14);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: isDark ? 0.88 : 0.65,
    });
    const pulseMesh = new THREE.Mesh(pulseGeom, pulseMat);
    this.group.add(pulseMesh);

    this.trails.push({
      curve,
      pulseMesh,
      speed,
      progress: Math.random(),
    });
  }

  public update(): void {
    for (let i = 0; i < this.trails.length; i++) {
      const trail = this.trails[i];
      trail.progress += trail.speed;
      if (trail.progress > 1) trail.progress -= 1;

      const pos = trail.curve.getPointAt(trail.progress);
      trail.pulseMesh.position.copy(pos);
    }
  }

  public dispose(): void {
    this.group.traverse((obj) => {
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
