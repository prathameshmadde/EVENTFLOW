/**
 * EventFlow Fallback Renderer
 * Clean 2D canvas fallback for devices where WebGL is unavailable or reduced-motion is requested.
 * Renders an elegant multi-layer brand atmosphere with soft lighting and zero GPU strain.
 */

import { PageEnvironmentType, ThemeMode } from './types';

export class FallbackRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private theme: ThemeMode;
  private page: PageEnvironmentType;
  private width: number = 0;
  private height: number = 0;

  constructor(canvas: HTMLCanvasElement, theme: ThemeMode, page: PageEnvironmentType) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.theme = theme;
    this.page = page;
    this.resize();
    this.render();
  }

  public resize(): void {
    this.width = this.canvas.width = window.innerWidth;
    this.height = this.canvas.height = window.innerHeight;
    this.render();
  }

  public setTheme(theme: ThemeMode): void {
    this.theme = theme;
    this.render();
  }

  public setPage(page: PageEnvironmentType): void {
    this.page = page;
    this.render();
  }

  public render(): void {
    if (!this.ctx) return;
    const { ctx, width, height } = this;
    ctx.clearRect(0, 0, width, height);

    const isDark = this.theme === 'dark';

    // 1. Base gradient
    const baseGrad = ctx.createLinearGradient(0, 0, width, height);
    if (isDark) {
      baseGrad.addColorStop(0, '#0F0D14');
      baseGrad.addColorStop(0.5, '#161122');
      baseGrad.addColorStop(1, '#0F0D14');
    } else {
      baseGrad.addColorStop(0, '#FAF9F6');
      baseGrad.addColorStop(0.5, '#F4EFFB');
      baseGrad.addColorStop(1, '#FAF9F6');
    }
    ctx.fillStyle = baseGrad;
    ctx.fillRect(0, 0, width, height);

    // 2. Soft Royal Plum Ambient Glow (top right)
    const plumGlow = ctx.createRadialGradient(
      width * 0.75,
      height * 0.25,
      10,
      width * 0.75,
      height * 0.25,
      width * 0.55
    );
    if (isDark) {
      plumGlow.addColorStop(0, 'rgba(124, 58, 237, 0.18)');
      plumGlow.addColorStop(0.6, 'rgba(109, 40, 217, 0.06)');
      plumGlow.addColorStop(1, 'rgba(15, 13, 20, 0)');
    } else {
      plumGlow.addColorStop(0, 'rgba(124, 58, 237, 0.10)');
      plumGlow.addColorStop(0.6, 'rgba(109, 40, 217, 0.03)');
      plumGlow.addColorStop(1, 'rgba(250, 249, 246, 0)');
    }
    ctx.fillStyle = plumGlow;
    ctx.fillRect(0, 0, width, height);

    // 3. Champagne Gold Accent Glow (bottom left)
    const goldGlow = ctx.createRadialGradient(
      width * 0.2,
      height * 0.75,
      10,
      width * 0.2,
      height * 0.75,
      width * 0.45
    );
    if (isDark) {
      goldGlow.addColorStop(0, 'rgba(212, 167, 44, 0.12)');
      goldGlow.addColorStop(0.6, 'rgba(212, 167, 44, 0.03)');
      goldGlow.addColorStop(1, 'rgba(15, 13, 20, 0)');
    } else {
      goldGlow.addColorStop(0, 'rgba(212, 167, 44, 0.08)');
      goldGlow.addColorStop(0.6, 'rgba(212, 167, 44, 0.02)');
      goldGlow.addColorStop(1, 'rgba(250, 249, 246, 0)');
    }
    ctx.fillStyle = goldGlow;
    ctx.fillRect(0, 0, width, height);

    // 4. Subtle venue architectural arc silhouette
    ctx.save();
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.65, Math.min(width, height) * 0.45, Math.PI, 0, false);
    ctx.lineWidth = 1;
    ctx.strokeStyle = isDark ? 'rgba(212, 167, 44, 0.12)' : 'rgba(124, 58, 237, 0.08)';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.65, Math.min(width, height) * 0.38, Math.PI, 0, false);
    ctx.strokeStyle = isDark ? 'rgba(124, 58, 237, 0.10)' : 'rgba(212, 167, 44, 0.06)';
    ctx.stroke();
    ctx.restore();
  }

  public dispose(): void {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.width, this.height);
    }
  }
}
