/**
 * EventFlow 3D Background Environment & Hero 3D Entrypoint
 * Boots the unified EventFlowBackgroundController and Hero3DVisual
 */

import * as THREE from 'three';
import { EventFlowBackgroundController } from './EventFlowBackgroundController';
import { Hero3DVisual } from './Hero3DVisual';

declare global {
  interface Window {
    THREE?: typeof THREE;
    EventFlowBackground?: EventFlowBackgroundController;
    EventFlowHero3D?: Hero3DVisual;
  }
}

function initEventFlowBackground(): void {
  // Expose THREE for any helper scripts
  window.THREE = THREE;

  // 1. Ambient Background Controller
  const controller = EventFlowBackgroundController.getInstance();
  window.EventFlowBackground = controller;

  const bgCanvas = document.getElementById('ef-scene') as HTMLCanvasElement;
  if (bgCanvas) {
    controller.mount(bgCanvas);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      controller.mount();
    });
  }

  // 2. Hero 3D Celebration Stage & Pavilion Visual
  const heroCanvas = document.getElementById('hero-3d-canvas') as HTMLCanvasElement;
  if (heroCanvas) {
    window.EventFlowHero3D = new Hero3DVisual(heroCanvas);
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      const delayedHeroCanvas = document.getElementById('hero-3d-canvas') as HTMLCanvasElement;
      if (delayedHeroCanvas && !window.EventFlowHero3D) {
        window.EventFlowHero3D = new Hero3DVisual(delayedHeroCanvas);
      }
    });
  }
}

// Auto-boot if in browser context
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initEventFlowBackground);
  } else {
    initEventFlowBackground();
  }
}

export { EventFlowBackgroundController, Hero3DVisual };

