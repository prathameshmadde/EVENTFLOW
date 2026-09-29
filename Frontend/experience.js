// ==========================================================================
// EVENTFLOW AMBIENT EXPERIENCE ENGINE — experience.js
// Scroll reveals, orchestrated hero animations, magnetic buttons,
// interactive 3D card tilt & adaptive ambient simulation.
// ==========================================================================

(function () {
  'use strict';

  var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // 1. Dismiss loader on window load or fallback timeout
  function dismissLoader() {
    var loader = document.getElementById('ef-loader');
    if (loader) {
      setTimeout(function () {
        loader.classList.add('ef-hide');
      }, 120);
    }
  }
  if (document.readyState === 'complete') {
    dismissLoader();
  } else {
    window.addEventListener('load', dismissLoader);
  }

  // 2. Header scroll elevation class
  var header = document.querySelector('.site-header');
  if (header) {
    var checkScroll = function () {
      if (window.scrollY > 20) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
    };
    checkScroll();
    window.addEventListener('scroll', checkScroll, { passive: true });
  }

  // 3. Scroll-Triggered Reveal System (IntersectionObserver)
  function setupScrollReveals() {
    if (prefersReducedMotion) {
      document.querySelectorAll('.ef-reveal, .ef-reveal-left, .ef-reveal-right, .ef-stagger').forEach(function (el) {
        el.classList.add('revealed');
      });
      return;
    }

    // Auto-tag common content sections if not already tagged
    var targets = [
      '.section-head',
      '.app-header',
      '.app-top',
      '.welcome',
      '.trust-grid',
      '.event-card',
      '.flow-card',
      '.manager-card',
      '.review-card',
      '.blog-card',
      '.stat',
      '.panel',
      '.admin-tile',
      '.proposal-card',
      '.booking-card',
      '.auth-box',
      '.service-card',
      '.task-item',
      '.guest-item',
      '.payment-row',
      '.refund-row',
      '.req-item-card',
      '.proposal-interactive-card',
      '.booking-item-card',
      '.kpi-tile',
      '.hero-flagship-card'
    ];

    function applyRevealTags(root) {
      root = root || document;
      targets.forEach(function (selector) {
        root.querySelectorAll(selector).forEach(function (el) {
          if (!el.classList.contains('ef-reveal') && !el.classList.contains('revealed') && !el.closest('.hero')) {
            el.classList.add('ef-reveal');
          }
        });
      });
    }
    applyRevealTags(document);

    // Tag containers for staggered animations
    var staggerContainers = [
      '.event-grid',
      '.flow-cards',
      '.manager-grid',
      '.review-grid',
      '.blog-grid',
      '.stats',
      '.admin-tiles',
      '.req-stats-row',
      '.table-wrap',
      '.proposals-grid',
      '.bookings-grid',
      '.services-grid',
      '.kpi-metric-grid',
      '.milestone-stepper'
    ];
    function applyStaggerTags(root) {
      root = root || document;
      staggerContainers.forEach(function (selector) {
        root.querySelectorAll(selector).forEach(function (el) {
          if (!el.classList.contains('ef-stagger')) {
            el.classList.add('ef-stagger');
          }
        });
      });
    }
    applyStaggerTags(document);

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            obs.unobserve(entry.target);
          }
        });
      }, {
        threshold: 0.05,
        rootMargin: '50px 0px 50px 0px'
      });

      function checkVisibleReveals(root) {
        root = root || document;
        root.querySelectorAll('.ef-reveal, .ef-reveal-left, .ef-reveal-right, .ef-stagger').forEach(function (el) {
          if (el.classList.contains('revealed')) return;
          // Check if element is currently rendered with dimensions
          var rect = el.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            if (rect.top < window.innerHeight + 100 && rect.bottom > -50) {
              el.classList.add('revealed');
              return;
            }
          }
          observer.observe(el);
        });
      }
      checkVisibleReveals(document);

      // Watch for dynamically rendered items and tab pane display changes
      if (window.MutationObserver) {
        var domObserver = new MutationObserver(function (mutations) {
          var addedAny = false;
          var tabChanged = false;
          mutations.forEach(function (mutation) {
            if (mutation.type === 'attributes' && (mutation.attributeName === 'style' || mutation.attributeName === 'class')) {
              var targetEl = mutation.target;
              if (targetEl && (targetEl.classList.contains('dash-tab-pane') || targetEl.closest('.dash-tab-pane'))) {
                tabChanged = true;
              }
            }
            if (mutation.addedNodes && mutation.addedNodes.length > 0) {
              for (var i = 0; i < mutation.addedNodes.length; i++) {
                var node = mutation.addedNodes[i];
                if (node.nodeType === 1) {
                  targets.forEach(function (sel) {
                    if (node.matches && node.matches(sel)) {
                      if (!node.classList.contains('ef-reveal') && !node.classList.contains('revealed')) {
                        node.classList.add('ef-reveal');
                        observer.observe(node);
                        addedAny = true;
                      }
                    }
                    if (node.querySelectorAll) {
                      node.querySelectorAll(sel).forEach(function (child) {
                        if (!child.classList.contains('ef-reveal') && !child.classList.contains('revealed')) {
                          child.classList.add('ef-reveal');
                          observer.observe(child);
                          addedAny = true;
                        }
                      });
                    }
                  });
                }
              }
            }
          });
          if (addedAny || tabChanged) {
            applyRevealTags(document);
            applyStaggerTags(document);
            checkVisibleReveals(document);
            setupCardTilt();
            setupMagneticButtons();
          }
        });
        domObserver.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });
      }
    } else {
      // Fallback for older browsers
      document.querySelectorAll('.ef-reveal, .ef-reveal-left, .ef-reveal-right, .ef-stagger').forEach(function (el) {
        el.classList.add('revealed');
      });
    }
  }

  // 4. EventFlow Primary 3D Background Environment
  function initBackgroundExperience() {
    if (prefersReducedMotion) return;

    function doMount() {
      var canvas = document.getElementById('ef-scene');
      if (!canvas) return;

      document.body.classList.add('has-ef-scene');

      if (window.EventFlowBackground) {
        window.EventFlowBackground.mount(canvas);
        return;
      }

      var scriptId = 'ef-3d-bundle';
      var script = document.getElementById(scriptId);
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = 'assets/ef-3d-scene.js';
        script.async = true;
        document.head.appendChild(script);
      }
      script.addEventListener('load', function () {
        if (window.EventFlowBackground) {
          var el = document.getElementById('ef-scene');
          if (el) window.EventFlowBackground.mount(el);
        }
      });
    }

      // Guarantee continuous session-level animation epoch
      try {
        if (!sessionStorage.getItem('ef_bg_anchor_epoch')) {
          sessionStorage.setItem('ef_bg_anchor_epoch', (performance.timeOrigin + performance.now()).toString());
        }
      } catch (e) {}

      // Save animation and mouse state before unloading page
      window.addEventListener('beforeunload', function () {
        try {
          if (window.EventFlowBackground) {
            sessionStorage.setItem('ef_bg_anchor_epoch', (sessionStorage.getItem('ef_bg_anchor_epoch') || (performance.timeOrigin + performance.now()).toString()));
          }
        } catch (e) {}
      });

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', doMount);
      } else {
        doMount();
      }
  }
  initBackgroundExperience();

  // 5. Interactive Card Tilt for Desktop
  function setupCardTilt() {
    if (prefersReducedMotion || 'ontouchstart' in window) return;

    var tiltCards = document.querySelectorAll('.tilt, .event-card, .flow-card, .manager-card, .service-card');
    tiltCards.forEach(function (card) {
      if (card._efTiltBound) return;
      card._efTiltBound = true;
      card.addEventListener('mousemove', function (e) {
        var rect = card.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        var rotX = -(y / (rect.height / 2)) * 5;
        var rotY = (x / (rect.width / 2)) * 5;
        card.style.transform = 'perspective(900px) rotateX(' + rotX.toFixed(2) + 'deg) rotateY(' + rotY.toFixed(2) + 'deg) translateY(-5px)';
      });
      card.addEventListener('mouseleave', function () {
        card.style.transform = '';
      });
    });
  }

  // 6. Magnetic Button Effect
  function setupMagneticButtons() {
    if (prefersReducedMotion || 'ontouchstart' in window) return;

    var magnetics = document.querySelectorAll('.ef-magnetic, .btn-primary, .btn-secondary, .btn-light');
    magnetics.forEach(function (el) {
      if (el._efMagBound) return;
      el._efMagBound = true;
      el.addEventListener('mousemove', function (e) {
        var rect = el.getBoundingClientRect();
        var x = e.clientX - rect.left - rect.width / 2;
        var y = e.clientY - rect.top - rect.height / 2;
        el.style.transform = 'translate(' + (x * 0.15).toFixed(1) + 'px, ' + (y * 0.15).toFixed(1) + 'px)';
      });
      el.addEventListener('mouseleave', function () {
        el.style.transform = '';
      });
    });
  }

  // 7. Auto-Playing Festival & Occasions Carousel
  function setupFestivalCarousel() {
    var carousel = document.getElementById('festival-carousel');
    if (!carousel) return;

    var track = carousel.querySelector('.festival-carousel-track');
    var cards = carousel.querySelectorAll('.festival-card');
    var prevBtn = carousel.querySelector('.carousel-btn.prev');
    var nextBtn = carousel.querySelector('.carousel-btn.next');
    var dotsContainer = carousel.querySelector('.carousel-dots');
    if (!track || cards.length === 0) return;

    var totalCards = cards.length;
    var currentIndex = 0;
    var autoPlayInterval = null;
    var isHovered = false;

    function getVisibleCount() {
      var w = window.innerWidth;
      if (w <= 768) return 1;
      if (w <= 1024) return 2;
      return 3;
    }

    function getMaxIndex() {
      return Math.max(0, totalCards - getVisibleCount());
    }

    function createDots() {
      if (!dotsContainer) return;
      dotsContainer.innerHTML = '';
      var maxIdx = getMaxIndex();
      var count = maxIdx + 1;
      for (var i = 0; i < count; i++) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot' + (i === currentIndex ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
        dot.dataset.index = i;
        (function (idx) {
          dot.addEventListener('click', function () {
            goToSlide(idx);
            resetAutoPlay();
          });
        })(i);
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      if (!dotsContainer) return;
      var dots = dotsContainer.querySelectorAll('.carousel-dot');
      dots.forEach(function (d, i) {
        if (i === currentIndex) {
          d.classList.add('active');
        } else {
          d.classList.remove('active');
        }
      });
    }

    function updateSlidePosition() {
      var maxIdx = getMaxIndex();
      if (currentIndex > maxIdx) currentIndex = maxIdx;
      if (currentIndex < 0) currentIndex = 0;

      var firstCard = cards[0];
      var secondCard = cards[1];
      if (firstCard && secondCard) {
        var step = secondCard.getBoundingClientRect().left - firstCard.getBoundingClientRect().left;
        track.style.transform = 'translateX(-' + (currentIndex * step) + 'px)';
      }

      if (prevBtn) prevBtn.disabled = (currentIndex === 0);
      if (nextBtn) nextBtn.disabled = (currentIndex >= maxIdx);
      updateDots();
    }

    function goToSlide(idx) {
      var maxIdx = getMaxIndex();
      currentIndex = Math.min(Math.max(0, idx), maxIdx);
      updateSlidePosition();
    }

    function nextSlide() {
      var maxIdx = getMaxIndex();
      if (currentIndex >= maxIdx) {
        currentIndex = 0;
      } else {
        currentIndex++;
      }
      updateSlidePosition();
    }

    function prevSlide() {
      var maxIdx = getMaxIndex();
      if (currentIndex <= 0) {
        currentIndex = maxIdx;
      } else {
        currentIndex--;
      }
      updateSlidePosition();
    }

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        prevSlide();
        resetAutoPlay();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        nextSlide();
        resetAutoPlay();
      });
    }

    function startAutoPlay() {
      if (prefersReducedMotion) return;
      stopAutoPlay();
      autoPlayInterval = setInterval(function () {
        if (!isHovered) {
          nextSlide();
        }
      }, 4200);
    }

    function stopAutoPlay() {
      if (autoPlayInterval) {
        clearInterval(autoPlayInterval);
        autoPlayInterval = null;
      }
    }

    function resetAutoPlay() {
      stopAutoPlay();
      startAutoPlay();
    }

    carousel.addEventListener('mouseenter', function () {
      isHovered = true;
    });
    carousel.addEventListener('mouseleave', function () {
      isHovered = false;
    });

    // Touch Swipe support
    var touchStartX = 0;
    var touchEndX = 0;
    track.addEventListener('touchstart', function (e) {
      touchStartX = e.touches[0].clientX;
      isHovered = true;
    }, { passive: true });
    track.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].clientX;
      isHovered = false;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 40) {
        if (diff > 0) {
          nextSlide();
        } else {
          prevSlide();
        }
        resetAutoPlay();
      }
    }, { passive: true });

    window.addEventListener('resize', function () {
      createDots();
      updateSlidePosition();
    }, { passive: true });

    createDots();
    updateSlidePosition();
    startAutoPlay();
  }

  // 8. Interactive Animated Mouse Cursor System
  function setupMouseCursor() {
    if (prefersReducedMotion) return;
    if (window.matchMedia && window.matchMedia('(hover: none) and (pointer: coarse)').matches) return;
    if (document.getElementById('ef-cursor')) return;

    // Create cursor DOM elements
    var cursorWrapper = document.createElement('div');
    cursorWrapper.className = 'ef-cursor';
    cursorWrapper.id = 'ef-cursor';
    cursorWrapper.setAttribute('aria-hidden', 'true');

    var ring = document.createElement('div');
    ring.className = 'ef-cursor-ring';
    ring.id = 'ef-cursor-ring';

    var dot = document.createElement('div');
    dot.className = 'ef-cursor-dot';
    dot.id = 'ef-cursor-dot';

    cursorWrapper.appendChild(ring);
    cursorWrapper.appendChild(dot);
    document.body.appendChild(cursorWrapper);

    var mouseX = -100;
    var mouseY = -100;
    var ringX = -100;
    var ringY = -100;
    var isVisible = false;
    var isRunning = true;
    var lastSparkTime = 0;
    var lastSparkX = 0;
    var lastSparkY = 0;
    var activeSparks = 0;
    var MAX_SPARKS = 12;

    // Direct tracking for dot, lerp for ring
    function renderCursor() {
      if (!isRunning) return;

      var dx = mouseX - ringX;
      var dy = mouseY - ringY;
      ringX += dx * 0.18;
      ringY += dy * 0.18;

      ring.style.transform = 'translate3d(' + ringX.toFixed(2) + 'px, ' + ringY.toFixed(2) + 'px, 0)';

      requestAnimationFrame(renderCursor);
    }
    requestAnimationFrame(renderCursor);

    // Mouse movement listener
    window.addEventListener('mousemove', function (e) {
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isVisible) {
        isVisible = true;
        ringX = mouseX;
        ringY = mouseY;
        cursorWrapper.classList.add('ef-cursor-visible');
      }

      dot.style.transform = 'translate3d(' + mouseX + 'px, ' + mouseY + 'px, 0)';

      // Generate subtle luxury sparks on swift cursor movements
      var now = Date.now();
      if (now - lastSparkTime > 55 && activeSparks < MAX_SPARKS) {
        var dist = Math.hypot(mouseX - lastSparkX, mouseY - lastSparkY);
        if (dist > 18) {
          lastSparkTime = now;
          lastSparkX = mouseX;
          lastSparkY = mouseY;
          createSpark(mouseX, mouseY);
        }
      }
    }, { passive: true });

    function createSpark(x, y) {
      activeSparks++;
      var spark = document.createElement('div');
      spark.className = 'ef-cursor-spark';
      spark.style.left = x + 'px';
      spark.style.top = y + 'px';

      var driftX = (Math.random() - 0.5) * 24;
      var driftY = (Math.random() - 0.5) * 24;
      spark.style.setProperty('--drift-x', driftX.toFixed(1) + 'px');
      spark.style.setProperty('--drift-y', driftY.toFixed(1) + 'px');

      cursorWrapper.appendChild(spark);

      setTimeout(function () {
        if (spark && spark.parentNode) {
          spark.parentNode.removeChild(spark);
        }
        activeSparks = Math.max(0, activeSparks - 1);
      }, 620);
    }

    // Interactive element hover detection via delegation
    document.addEventListener('mouseover', function (e) {
      var target = e.target;
      if (!target || !target.closest) return;

      var interactiveEl = target.closest('a, button, [role="button"], input, select, textarea, .btn, .hotstar-thumb-card, .hotstar-nav-btn, .tab, .pill, .filter-chip, .badge, .carousel-dot, .card, .event-card, .flow-card, label');
      var showcaseEl = target.closest('.hotstar-showcase, .hotstar-stage, #festival-carousel');

      if (interactiveEl) {
        cursorWrapper.classList.add('is-hovering');
      } else {
        cursorWrapper.classList.remove('is-hovering');
      }
    }, { passive: true });

    // Click Ripple and Active State
    window.addEventListener('mousedown', function (e) {
      cursorWrapper.classList.add('is-clicking');

      var ripple = document.createElement('div');
      ripple.className = 'ef-cursor-ripple';
      ripple.style.left = e.clientX + 'px';
      ripple.style.top = e.clientY + 'px';
      cursorWrapper.appendChild(ripple);

      setTimeout(function () {
        if (ripple && ripple.parentNode) {
          ripple.parentNode.removeChild(ripple);
        }
      }, 550);
    });

    window.addEventListener('mouseup', function () {
      cursorWrapper.classList.remove('is-clicking');
    });

    // Window leave and enter handling
    document.addEventListener('mouseleave', function () {
      cursorWrapper.classList.remove('ef-cursor-visible');
      isVisible = false;
    });

    document.addEventListener('mouseenter', function () {
      cursorWrapper.classList.add('ef-cursor-visible');
      isVisible = true;
    });

    window.addEventListener('blur', function () {
      cursorWrapper.classList.remove('ef-cursor-visible');
      isVisible = false;
    });
  }

  // 9. Dashboard content scroll handling (support nested scrolling containers)
  function setupDashboardScrollListener() {
    var dashContent = document.querySelector('.dash-content');
    if (dashContent) {
      dashContent.addEventListener('scroll', function () {
        setupScrollReveals();
      }, { passive: true });
    }
  }

  // 10. Desktop Navigation Scroll Spy & Smooth In-Page Navigation
  function setupScrollSpy() {
    var desktopNav = document.getElementById('desktop-nav') || document.querySelector('.desktop-nav');
    if (!desktopNav) return;

    var navLinks = desktopNav.querySelectorAll('a');
    if (!navLinks.length) return;

    // Smooth scrolling for hash links
    navLinks.forEach(function (link) {
      if (link.hasAttribute('data-scrollspy-bound')) return;
      link.setAttribute('data-scrollspy-bound', 'true');

      var href = link.getAttribute('href');
      if (href && href.startsWith('#') && href.length > 1) {
        link.addEventListener('click', function (e) {
          var targetId = href.substring(1);
          var targetEl = document.getElementById(targetId);
          if (targetEl) {
            e.preventDefault();
            var header = document.querySelector('.site-header');
            var headerOffset = (header ? header.offsetHeight : 70) + 16;
            var elementPosition = targetEl.getBoundingClientRect().top;
            var offsetPosition = elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: Math.max(0, offsetPosition),
              behavior: 'smooth'
            });

            if (history.pushState) {
              history.pushState(null, null, href);
            }
          }
        });
      }
    });

    // Mapped sections for scroll spy
    var sectionMappings = [
      { id: 'hero', links: ['#hero', 'index.html', '#'] },
      { id: 'trust-stats-ribbon', links: ['#hero', '#trust-stats-ribbon'] },
      { id: 'trust-strip', links: ['#hero'] },
      { id: 'categories-section', links: ['#categories-section', 'events.html'] },
      { id: 'how-it-works', links: ['#how-it-works', '#flow-section'] },
      { id: 'managers-section', links: ['#how-it-works', '#managers-section'] },
      { id: 'services-section', links: ['#services-section', 'services.html'] },
      { id: 'dark-brand-section', links: ['#services-section', '#dark-brand-section'] },
      { id: 'testimonials', links: ['#services-section', '#testimonials'] },
      { id: 'final-cta', links: ['#services-section', '#final-cta'] }
    ];

    var trackedSections = [];
    sectionMappings.forEach(function (mapping) {
      var el = document.getElementById(mapping.id);
      if (el) {
        trackedSections.push({
          id: mapping.id,
          el: el,
          links: mapping.links
        });
      }
    });

    if (!trackedSections.length) return;

    var isTicking = false;

    function evaluateActiveSection() {
      var scrollPosition = window.pageYOffset || document.documentElement.scrollTop || 0;
      var windowHeight = window.innerHeight;
      var docHeight = document.documentElement.scrollHeight;
      var header = document.querySelector('.site-header');
      var headerOffset = (header ? header.offsetHeight : 70) + 80;

      var currentSection = trackedSections[0];

      // If reached near bottom, activate last section
      if (scrollPosition + windowHeight >= docHeight - 80) {
        currentSection = trackedSections[trackedSections.length - 1];
      } else {
        for (var i = 0; i < trackedSections.length; i++) {
          var rect = trackedSections[i].el.getBoundingClientRect();
          if (rect.top <= headerOffset) {
            currentSection = trackedSections[i];
          }
        }
      }

      if (!currentSection) return;

      navLinks.forEach(function (link) {
        var href = link.getAttribute('href');
        if (!href) return;

        var matchesCurrent = false;
        for (var m = 0; m < currentSection.links.length; m++) {
          var candidate = currentSection.links[m];
          if (href === candidate || (href.startsWith('#') && href === '#' + currentSection.id)) {
            matchesCurrent = true;
            break;
          }
        }

        if (matchesCurrent) {
          link.classList.add('active');
        } else {
          if (href.startsWith('#')) {
            link.classList.remove('active');
          }
        }
      });

      isTicking = false;
    }

    window.addEventListener('scroll', function () {
      if (!isTicking) {
        window.requestAnimationFrame(evaluateActiveSection);
        isTicking = true;
      }
    }, { passive: true });

    // Initial evaluation
    evaluateActiveSection();
  }

  // Expose EventFlowExperience on window for programmatic re-triggers
  window.EventFlowExperience = {
    refresh: function () {
      setupScrollReveals();
      setupCardTilt();
      setupMagneticButtons();
      setupScrollSpy();
    },
    setupScrollReveals: setupScrollReveals,
    setupCardTilt: setupCardTilt,
    setupMagneticButtons: setupMagneticButtons,
    setupScrollSpy: setupScrollSpy
  };

  // 11. Initialize all experience features on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      setupScrollReveals();
      setupCardTilt();
      setupMagneticButtons();
      setupFestivalCarousel();
      setupMouseCursor();
      setupDashboardScrollListener();
      setupScrollSpy();
    });
  } else {
    setupScrollReveals();
    setupCardTilt();
    setupMagneticButtons();
    setupFestivalCarousel();
    setupMouseCursor();
    setupDashboardScrollListener();
    setupScrollSpy();
  }

})();
