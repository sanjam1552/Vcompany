/* ============================================================
   RVNL MIRROR — Premium Newsletter Website
   Complete JavaScript Module
   Modern ES6+ · No External Dependencies
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ────────────────────────────────────────────────────────────
     § 1. LOADING SCREEN
     Fades the loader overlay once every asset has loaded.
     ──────────────────────────────────────────────────────────── */
  const loaderScreen = document.querySelector('.loader-screen');

  if (loaderScreen) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        loaderScreen.classList.add('fade-out');
      }, 1500);
    });
  }


  /* ────────────────────────────────────────────────────────────
     § 2. STICKY NAVIGATION
     – Appears after scrolling 600 px
     – Highlights the currently visible section link
     – Smooth-scrolls to the target section on click
     ──────────────────────────────────────────────────────────── */
  const stickyNav    = document.querySelector('.sticky-nav');
  const navLinks     = document.querySelectorAll('.sticky-nav .nav-links a[data-section]');
  const SHOW_NAV_AT  = 600;  // px from top

  // Collect all sections referenced by nav links
  const sectionIds = Array.from(navLinks).map(l => l.getAttribute('href').replace('#', ''));
  const sectionElements = sectionIds.map(id => document.getElementById(id)).filter(Boolean);

  // Show / hide the nav bar
  const handleNavVisibility = () => {
    if (!stickyNav) return;
    if (window.scrollY > SHOW_NAV_AT) {
      stickyNav.classList.add('visible');
    } else {
      stickyNav.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleNavVisibility, { passive: true });

  // Highlight active section link via IntersectionObserver
  if (sectionElements.length && navLinks.length) {
    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.getAttribute('id');
            navLinks.forEach((link) => {
              link.classList.toggle(
                'active',
                link.getAttribute('href') === `#${id}`
              );
            });
          }
        });
      },
      {
        rootMargin: '-30% 0px -60% 0px', // fires when section is ~30% into viewport
        threshold: 0,
      }
    );

    sectionElements.forEach((sec) => sectionObserver.observe(sec));
  }

  // Smooth-scroll on nav-link click
  navLinks.forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const targetId  = link.getAttribute('href');
      const targetEl  = document.querySelector(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Close mobile menu if open
      const navLinksContainer = document.querySelector('.sticky-nav .nav-links');
      if (navLinksContainer) navLinksContainer.classList.remove('open');
    });
  });

  // Mobile hamburger toggle
  const hamburger = document.querySelector('.nav-hamburger');
  if (hamburger) {
    hamburger.addEventListener('click', () => {
      const navLinksContainer = document.querySelector('.sticky-nav .nav-links');
      if (navLinksContainer) navLinksContainer.classList.toggle('open');
    });
  }


  /* ────────────────────────────────────────────────────────────
     § 3. SCROLL REVEAL ANIMATIONS
     Uses IntersectionObserver (threshold 0.15).
     Once an element is revealed it is unobserved so the
     animation only fires once.
     ──────────────────────────────────────────────────────────── */
  const revealElements = document.querySelectorAll(
    '.reveal, .reveal-left, .reveal-right, .reveal-scale'
  );

  if (revealElements.length) {
    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target); // one-time animation
          }
        });
      },
      { threshold: 0.15 }
    );

    revealElements.forEach((el) => revealObserver.observe(el));
  }


  /* ────────────────────────────────────────────────────────────
     § 4. ANIMATED COUNTERS
     Elements with `data-count` are counted from 0 → target.
     Optional `data-suffix` (e.g. "k", "Cr", "%").
     Uses requestAnimationFrame with easeOutCubic easing.
     Duration ≈ 2 seconds.
     ──────────────────────────────────────────────────────────── */
  const counterElements = document.querySelectorAll('[data-count]');

  /**
   * easeOutCubic easing function
   * @param {number} t — normalised time (0–1)
   * @returns {number}
   */
  const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

  /**
   * Format a number with comma separators
   * @param {number} num
   * @returns {string}
   */
  const formatNumber = (num) => {
    return num.toLocaleString('en-IN'); // Indian comma format; switch to 'en-US' if needed
  };

  /**
   * Animate a single counter element
   * @param {HTMLElement} el
   */
  const animateCounter = (el) => {
    const target   = parseFloat(el.getAttribute('data-count'));
    const suffix   = el.getAttribute('data-suffix') || '';
    const duration = 2000; // ms
    const isFloat  = target % 1 !== 0;
    let   start    = null;

    const step = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed  = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased    = easeOutCubic(progress);
      const current  = eased * target;

      el.textContent = isFloat
        ? current.toFixed(2) + suffix
        : formatNumber(Math.floor(current)) + suffix;

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
  };

  if (counterElements.length) {
    const counterObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.3 }
    );

    counterElements.forEach((el) => counterObserver.observe(el));
  }


  /* ────────────────────────────────────────────────────────────
     § 5. PIU ACCORDION
     Clicking an item's <h4> toggles `.open`.
     Only one item can be open at a time (true accordion).
     ──────────────────────────────────────────────────────────── */
  const piuItems = document.querySelectorAll('.piu-item');

  piuItems.forEach((item) => {
    const header = item.querySelector('h4');
    if (!header) return;

    header.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all items first (accordion behaviour)
      piuItems.forEach((other) => other.classList.remove('open'));

      // Toggle the clicked item
      if (!isOpen) {
        item.classList.add('open');
      }
    });
  });


  /* ────────────────────────────────────────────────────────────
     § 6. BACK TO TOP BUTTON
     Visible after 800 px of scroll.
     Smooth-scrolls to the top on click.
     ──────────────────────────────────────────────────────────── */
  const backToTopBtn   = document.querySelector('.back-to-top');
  const SHOW_BTN_AT    = 800;

  const handleBackToTopVisibility = () => {
    if (!backToTopBtn) return;
    if (window.scrollY > SHOW_BTN_AT) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  };

  window.addEventListener('scroll', handleBackToTopVisibility, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }


  /* ────────────────────────────────────────────────────────────
     § 7. PARALLAX — HERO BACKGROUND
     Subtle vertical translation at 0.3× scroll speed.
     Disabled on screens ≤ 768 px for performance.
     ──────────────────────────────────────────────────────────── */
  const heroBg = document.querySelector('.hero-bg-image');

  const handleParallax = () => {
    if (!heroBg || window.innerWidth <= 768) return;
    const scrollY = window.scrollY;
    heroBg.style.transform = `translateY(${scrollY * 0.3}px) scale(1)`;
  };

  window.addEventListener('scroll', handleParallax, { passive: true });

  // Reset on resize if crossing the breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth <= 768 && heroBg) {
      heroBg.style.transform = '';
    }
  });


  /* ────────────────────────────────────────────────────────────
     § 8. TICKER — PAUSE ON HOVER
     Pauses the CSS animation when the user hovers over the
     ticker bar; resumes on mouseleave.
     ──────────────────────────────────────────────────────────── */
  const tickerBar   = document.querySelector('.ticker-bar');
  const tickerTrack = document.querySelector('.ticker-track');

  if (tickerBar && tickerTrack) {
    tickerBar.addEventListener('mouseenter', () => {
      tickerTrack.classList.add('paused');
    });

    tickerBar.addEventListener('mouseleave', () => {
      tickerTrack.classList.remove('paused');
    });
  }

}); // end DOMContentLoaded
