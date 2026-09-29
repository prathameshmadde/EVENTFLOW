const fs = require('fs');
let html = fs.readFileSync('customer-dashboard.html', 'utf8');

const cssToInject = `
    <style>
    @keyframes borderGlow {
      0% { box-shadow: 0 0 5px rgba(212,175,55,0.2); border-color: rgba(212,175,55,0.5); }
      50% { box-shadow: 0 0 15px rgba(212,175,55,0.8); border-color: rgba(212,175,55,1); }
      100% { box-shadow: 0 0 5px rgba(212,175,55,0.2); border-color: rgba(212,175,55,0.5); }
    }
    .milestone-step-box {
      transition: all 0.3s ease;
      border: 1px solid var(--color-border);
    }
    .milestone-step-box:hover {
      animation: borderGlow 1.5s infinite;
      transform: translateY(-2px);
    }
    </style>
`;

html = html.replace('</head>', cssToInject + '\n</head>');
fs.writeFileSync('customer-dashboard.html', html);
console.log('Injected glowing CSS into customer-dashboard.html');

