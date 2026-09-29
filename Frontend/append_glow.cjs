const fs = require('fs');

const globalGlowCSS = `
/* =========================================================
   GLOBAL GLOW ANIMATIONS (Added as per user request)
========================================================= */

@keyframes btnPrimaryGlow {
  0% { box-shadow: 0 0 5px rgba(124, 58, 237, 0.4), 0 8px 22px rgba(184, 35, 109, 0.26); }
  50% { box-shadow: 0 0 20px rgba(124, 58, 237, 0.8), 0 14px 30px rgba(184, 35, 109, 0.4); }
  100% { box-shadow: 0 0 5px rgba(124, 58, 237, 0.4), 0 8px 22px rgba(184, 35, 109, 0.26); }
}

@keyframes btnOutlineGlow {
  0% { box-shadow: 0 0 5px rgba(212, 167, 44, 0.2); border-color: rgba(212, 167, 44, 0.5); }
  50% { box-shadow: 0 0 15px rgba(212, 167, 44, 0.8); border-color: rgba(212, 167, 44, 1); }
  100% { box-shadow: 0 0 5px rgba(212, 167, 44, 0.2); border-color: rgba(212, 167, 44, 0.5); }
}

@keyframes cardGlow {
  0% { box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
  50% { box-shadow: 0 15px 35px rgba(124, 58, 237, 0.2), 0 0 0 1px rgba(124, 58, 237, 0.15); }
  100% { box-shadow: 0 8px 24px rgba(0,0,0,0.06); }
}

@keyframes goldCardGlow {
  0% { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
  50% { box-shadow: 0 12px 28px rgba(212, 167, 44, 0.3), 0 0 0 1px rgba(212, 167, 44, 0.2); }
  100% { box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
}

/* Apply Glows to Buttons */
.btn-primary:hover {
  animation: btnPrimaryGlow 2s infinite ease-in-out !important;
}

.btn-outline:hover {
  animation: btnOutlineGlow 2s infinite ease-in-out !important;
}

/* Apply Glows to Cards */
.hero-flagship-card:hover, 
.proposal-interactive-card:hover, 
.booking-item-card:hover, 
.req-item-card:hover,
.sidebar-user-card:hover {
  animation: cardGlow 2.5s infinite ease-in-out !important;
  transform: translateY(-3px) !important;
  transition: all 0.3s ease !important;
}

.kpi-tile:hover {
  animation: goldCardGlow 2.5s infinite ease-in-out !important;
  transform: translateY(-3px) !important;
  transition: all 0.3s ease !important;
}
`;

fs.appendFileSync('styles.css', '\n' + globalGlowCSS + '\n');
console.log('Successfully appended global glow animations to styles.css');

