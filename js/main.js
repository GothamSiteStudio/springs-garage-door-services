/* ============================================================
   SPRINGS GARAGE DOOR SERVICES - Main JavaScript
   Modern dark-themed garage door services website
   Vanilla JS - No dependencies
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     UTILITY HELPERS
  ---------------------------------------------------------- */

  /** Detect mobile / low-power devices */
  const isMobile = () => window.innerWidth <= 768;

  /** Throttle - limits function calls to once per `limit` ms */
  function throttle(fn, limit) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  }

  /** Debounce - delays execution until `delay` ms after last call */
  function debounce(fn, delay) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), delay);
    };
  }

  /** Safe querySelector shorthand */
  const qs = (sel, ctx = document) => ctx.querySelector(sel);
  const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ----------------------------------------------------------
     1. PRELOADER
  ---------------------------------------------------------- */
  function initPreloader() {
    const preloader = qs('#preloader') || qs('.preloader');
    if (!preloader) return;

    window.addEventListener('load', () => {
      preloader.classList.add('fade-out');
      setTimeout(() => {
        preloader.style.display = 'none';
      }, 600);
    });
  }

  /* ----------------------------------------------------------
     2. NAVIGATION - Scroll Effect
     Adds .scrolled class to nav when page scrolls past 100px
  ---------------------------------------------------------- */
  function initNavScroll() {
    const nav = qs('nav') || qs('.navbar') || qs('header');
    if (!nav) return;

    const handleScroll = () => {
      if (window.scrollY > 100) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };

    window.addEventListener('scroll', throttle(handleScroll, 50));
    // Run once on load in case page is already scrolled
    handleScroll();
  }

  /* ----------------------------------------------------------
     3. MOBILE HAMBURGER MENU TOGGLE
  ---------------------------------------------------------- */
  function initMobileMenu() {
    const hamburger = qs('.hamburger') || qs('.menu-toggle') || qs('.mobile-menu-btn');
    const navMenu = qs('.nav-menu') || qs('.nav-links') || qs('.mobile-menu');
    const body = document.body;

    if (!hamburger || !navMenu) return;

    hamburger.setAttribute('aria-expanded', 'false');

    hamburger.addEventListener('click', (e) => {
      e.stopPropagation();
      hamburger.classList.toggle('active');
      navMenu.classList.toggle('active');
      body.classList.toggle('menu-open');
      hamburger.setAttribute('aria-expanded', String(navMenu.classList.contains('active')));
    });

    // Close menu when clicking a link inside the mobile menu
    qsa('a', navMenu).forEach((link) => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        body.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navMenu.classList.contains('active') && !navMenu.contains(e.target) && !hamburger.contains(e.target)) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        body.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navMenu.classList.contains('active')) {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
        body.classList.remove('menu-open');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ----------------------------------------------------------
     4. SMOOTH SCROLL FOR ANCHOR LINKS
  ---------------------------------------------------------- */
  function initSmoothScroll() {
    qsa('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#' || targetId === '#!') return;

        const target = qs(targetId);
        if (!target) return;

        e.preventDefault();
        const navHeight = (qs('nav') || qs('.navbar') || qs('header'))?.offsetHeight || 0;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth',
        });
      });
    });
  }

  /* ----------------------------------------------------------
     5. SCROLL-TRIGGERED ANIMATIONS (IntersectionObserver)
     Adds .animated class to .animate-on-scroll elements
  ---------------------------------------------------------- */
  function initScrollAnimations() {
    const elements = qsa('.animate-on-scroll');
    if (!elements.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            observer.unobserve(entry.target); // animate only once
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));
  }

  /* ----------------------------------------------------------
     6. COUNTER ANIMATION FOR STATISTICS
     Animates numbers from 0 to data-target value
  ---------------------------------------------------------- */
  function initCounters() {
    const counters = qsa('[data-target]');
    if (!counters.length) return;

    const animateCounter = (el) => {
      const target = parseInt(el.getAttribute('data-target'), 10);
      if (isNaN(target)) return;

      const duration = 2000; // ms
      const startTime = performance.now();
      const startValue = 0;

      function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease-out cubic for smooth deceleration
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(startValue + (target - startValue) * eased);

        el.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(update);
        } else {
          el.textContent = target.toLocaleString();
        }
      }

      requestAnimationFrame(update);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCounter(entry.target);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => observer.observe(counter));
  }

  /* ----------------------------------------------------------
     7. PARALLAX EFFECT ON HERO SECTIONS
     Moves background slower than scroll speed
     Disabled on mobile for performance
  ---------------------------------------------------------- */
  function initParallax() {
    if (isMobile()) return;

    const heroSections = qsa('.hero, .hero-section, [data-parallax]');
    if (!heroSections.length) return;

    let ticking = false;

    function updateParallax() {
      const scrollY = window.scrollY;
      heroSections.forEach((hero) => {
        const speed = parseFloat(hero.getAttribute('data-parallax-speed')) || 0.5;
        const offset = scrollY * speed;
        hero.style.backgroundPositionY = `${offset}px`;
      });
      ticking = false;
    }

    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });
  }

  /* ----------------------------------------------------------
     8. BACK TO TOP BUTTON
     Show/hide based on scroll, smooth scroll to top on click
  ---------------------------------------------------------- */
  function initBackToTop() {
    const btn = qs('.back-to-top') || qs('#backToTop');
    if (!btn) return;

    const toggleVisibility = () => {
      if (window.scrollY > 400) {
        btn.classList.add('visible');
      } else {
        btn.classList.remove('visible');
      }
    };

    window.addEventListener('scroll', throttle(toggleVisibility, 100));
    toggleVisibility();

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ----------------------------------------------------------
     9. ACTIVE NAV LINK HIGHLIGHTING
     Highlights the nav link corresponding to the current section
  ---------------------------------------------------------- */
  function initActiveNavHighlight() {
    const sections = qsa('section[id]');
    const navLinks = qsa('nav a[href^="#"], .navbar a[href^="#"], header a[href^="#"]');
    if (!sections.length || !navLinks.length) return;

    const handleScroll = () => {
      const scrollPos = window.scrollY + 150;

      sections.forEach((section) => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        const id = section.getAttribute('id');

        if (scrollPos >= top && scrollPos < top + height) {
          navLinks.forEach((link) => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${id}`) {
              link.classList.add('active');
            }
          });
        }
      });
    };

    window.addEventListener('scroll', throttle(handleScroll, 100));
    handleScroll();
  }

  function initCurrentPageLinks() {
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = qsa('.nav-menu .nav-link');
    if (!navLinks.length) return;

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      const normalizedHref = href.split('#')[0] || 'index.html';
      if (normalizedHref === currentPath) {
        link.classList.add('active');
      }
    });
  }

  /* ----------------------------------------------------------
     10. TYPEWRITER EFFECT
     Applies a typewriter animation to elements with .typewriter
  ---------------------------------------------------------- */
  function initTypewriter() {
    const elements = qsa('.typewriter');
    if (!elements.length) return;

    elements.forEach((el) => {
      const text = el.getAttribute('data-typewriter') || el.textContent;
      const speed = parseInt(el.getAttribute('data-typewriter-speed'), 10) || 60;
      const delay = parseInt(el.getAttribute('data-typewriter-delay'), 10) || 500;

      el.textContent = '';
      el.style.borderRight = '2px solid #f59e0b'; // blinking cursor
      el.style.display = 'inline-block';

      let charIndex = 0;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setTimeout(() => {
                function type() {
                  if (charIndex < text.length) {
                    el.textContent += text.charAt(charIndex);
                    charIndex++;
                    setTimeout(type, speed);
                  } else {
                    // Blink cursor a few times then remove
                    setTimeout(() => {
                      el.style.borderRight = 'none';
                    }, 2000);
                  }
                }
                type();
              }, delay);
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.3 }
      );

      observer.observe(el);
    });
  }

  /* ----------------------------------------------------------
     11. FAQ ACCORDION
     Toggle .active on .faq-item, only one open at a time
  ---------------------------------------------------------- */
  function initFaqAccordion() {
    const faqItems = qsa('.faq-item');
    if (!faqItems.length) return;

    faqItems.forEach((item) => {
      const question = qs('.faq-question, .faq-header, .faq-title', item);
      if (!question) return;

      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');

        // Close all other items
        faqItems.forEach((otherItem) => {
          if (otherItem !== item) {
            otherItem.classList.remove('active');
          }
        });

        // Toggle the clicked item
        item.classList.toggle('active', !isActive);
      });
    });
  }

  /* ----------------------------------------------------------
     12. LAZY LOADING IMAGES (IntersectionObserver)
     Images should have data-src and optionally data-srcset
  ---------------------------------------------------------- */
  function initLazyLoad() {
    const images = qsa('img[data-src], img.lazy');
    if (!images.length) return;

    // Use native lazy loading if available as a fallback check
    if ('loading' in HTMLImageElement.prototype) {
      images.forEach((img) => {
        if (img.dataset.src) img.src = img.dataset.src;
        if (img.dataset.srcset) img.srcset = img.dataset.srcset;
        img.classList.add('loaded');
      });
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) img.src = img.dataset.src;
            if (img.dataset.srcset) img.srcset = img.dataset.srcset;
            img.classList.add('loaded');
            observer.unobserve(img);
          }
        });
      },
      {
        rootMargin: '200px 0px', // load slightly before visible
      }
    );

    images.forEach((img) => observer.observe(img));
  }

  /* ----------------------------------------------------------
     13. FORM VALIDATION FOR CONTACT FORMS
  ---------------------------------------------------------- */
  function initFormValidation() {
    const forms = qsa('.contact-form, #contactForm, form[data-validate]');
    if (!forms.length) return;

    const patterns = {
      email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      phone: /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]*$/,
      name: /^[a-zA-Z\s'-]{2,}$/,
    };

    function showError(input, message) {
      clearError(input);
      input.classList.add('error');
      const errorEl = document.createElement('span');
      errorEl.className = 'form-error';
      errorEl.textContent = message;
      errorEl.style.cssText = 'color:#ef4444;font-size:0.85rem;display:block;margin-top:4px;';
      input.parentNode.appendChild(errorEl);
    }

    function clearError(input) {
      input.classList.remove('error');
      const existing = input.parentNode.querySelector('.form-error');
      if (existing) existing.remove();
    }

    function validateField(input) {
      const type = input.getAttribute('type') || input.tagName.toLowerCase();
      const value = input.value.trim();
      const required = input.hasAttribute('required');

      clearError(input);

      if (required && !value) {
        showError(input, 'This field is required.');
        return false;
      }

      if (value) {
        if (type === 'email' && !patterns.email.test(value)) {
          showError(input, 'Please enter a valid email address.');
          return false;
        }
        if (type === 'tel' && !patterns.phone.test(value)) {
          showError(input, 'Please enter a valid phone number.');
          return false;
        }
        if (input.getAttribute('name') === 'name' && !patterns.name.test(value)) {
          showError(input, 'Please enter a valid name.');
          return false;
        }
        if (input.minLength > 0 && value.length < input.minLength) {
          showError(input, `Minimum ${input.minLength} characters required.`);
          return false;
        }
      }

      input.classList.add('valid');
      return true;
    }

    forms.forEach((form) => {
      const inputs = qsa('input, textarea, select', form);
      let successEl = qs('.form-success', form);

      if (!successEl && form.hasAttribute('data-demo-form')) {
        successEl = document.createElement('div');
        successEl.className = 'form-success';
        successEl.hidden = true;
        successEl.textContent = 'Thanks. This template form is ready for your final CRM or email integration.';
        form.appendChild(successEl);
      }

      // Real-time validation on blur
      inputs.forEach((input) => {
        input.addEventListener('blur', () => validateField(input));
        input.addEventListener('input', debounce(() => {
          if (input.classList.contains('error')) validateField(input);
        }, 300));
      });

      // Submit validation
      form.addEventListener('submit', (e) => {
        let isValid = true;
        inputs.forEach((input) => {
          if (!validateField(input)) isValid = false;
        });

        if (!isValid) {
          e.preventDefault();
          // Scroll to first error
          const firstError = qs('.error', form);
          if (firstError) {
            firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
            firstError.focus();
          }
          return;
        }

        if (form.hasAttribute('data-demo-form')) {
          e.preventDefault();
          form.reset();
          inputs.forEach((input) => {
            input.classList.remove('valid');
            input.classList.remove('error');
          });
          if (successEl) {
            successEl.hidden = false;
          }
        }
      });
    });
  }

  /* ----------------------------------------------------------
     14. FLOATING PARTICLES BACKGROUND (Canvas-based)
     Subtle particle effect for hero section using accent color
     Disabled on mobile for performance
  ---------------------------------------------------------- */
  function initParticles() {
    if (isMobile()) return;

    const heroSection = qs('.hero, .hero-section, #hero');
    if (!heroSection) return;

    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.classList.add('particles-canvas');
    canvas.style.cssText =
      'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:1;';
    heroSection.style.position = heroSection.style.position || 'relative';
    heroSection.insertBefore(canvas, heroSection.firstChild);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;
    let canvasWidth, canvasHeight;

    function resizeCanvas() {
      canvasWidth = heroSection.offsetWidth;
      canvasHeight = heroSection.offsetHeight;
      canvas.width = canvasWidth;
      canvas.height = canvasHeight;
    }

    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 2 + 1;
        this.speedX = (Math.random() - 0.5) * 0.8;
        this.speedY = (Math.random() - 0.5) * 0.8;
        this.opacity = Math.random() * 0.4 + 0.1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around edges
        if (this.x < 0) this.x = canvasWidth;
        if (this.x > canvasWidth) this.x = 0;
        if (this.y < 0) this.y = canvasHeight;
        if (this.y > canvasHeight) this.y = 0;
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(245, 158, 11, ${this.opacity})`; // #f59e0b
        ctx.fill();
      }
    }

    function initParticleArray() {
      particles = [];
      const count = Math.min(Math.floor((canvasWidth * canvasHeight) / 12000), 80);
      for (let i = 0; i < count; i++) {
        particles.push(new Particle());
      }
    }

    function connectParticles() {
      const maxDist = 150;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < maxDist) {
            const opacity = (1 - dist / maxDist) * 0.15;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(245, 158, 11, ${opacity})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    }

    function animate() {
      ctx.clearRect(0, 0, canvasWidth, canvasHeight);

      particles.forEach((p) => {
        p.update();
        p.draw();
      });

      connectParticles();
      animationId = requestAnimationFrame(animate);
    }

    // Only animate when hero is visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (!animationId) animate();
          } else {
            cancelAnimationFrame(animationId);
            animationId = null;
          }
        });
      },
      { threshold: 0 }
    );

    resizeCanvas();
    initParticleArray();
    observer.observe(heroSection);

    window.addEventListener(
      'resize',
      debounce(() => {
        resizeCanvas();
        initParticleArray();
      }, 250)
    );
  }

  /* ----------------------------------------------------------
     15. TESTIMONIAL AUTO-SLIDER
     Automatically cycles through testimonials, pauses on hover
  ---------------------------------------------------------- */
  function initTestimonialSlider() {
    const slider = qs('.testimonial-slider, .testimonials-slider, .testimonials-carousel');
    if (!slider) return;

    const slides = qsa('.testimonial-slide, .testimonial-item, .testimonial-card', slider);
    if (slides.length <= 1) return;

    let current = 0;
    let interval;
    const delay = 5000;

    function goToSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.remove('active');
        slide.style.opacity = '0';
        slide.style.transform = 'translateX(30px)';
        slide.style.position = 'absolute';
        slide.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      });

      slides[index].classList.add('active');
      slides[index].style.opacity = '1';
      slides[index].style.transform = 'translateX(0)';
      slides[index].style.position = 'relative';

      // Update dots if they exist
      const dots = qsa('.testimonial-dot, .slider-dot', slider.parentElement);
      dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
      });
    }

    function nextSlide() {
      current = (current + 1) % slides.length;
      goToSlide(current);
    }

    function startAutoplay() {
      interval = setInterval(nextSlide, delay);
    }

    function stopAutoplay() {
      clearInterval(interval);
    }

    // Initialize
    goToSlide(0);
    startAutoplay();

    // Pause on hover
    slider.addEventListener('mouseenter', stopAutoplay);
    slider.addEventListener('mouseleave', startAutoplay);

    // Touch support - pause on touch
    slider.addEventListener('touchstart', stopAutoplay, { passive: true });
    slider.addEventListener('touchend', () => {
      stopAutoplay();
      startAutoplay();
    });

    // Optional dot navigation
    const dots = qsa('.testimonial-dot, .slider-dot', slider.parentElement);
    dots.forEach((dot, i) => {
      dot.addEventListener('click', () => {
        current = i;
        goToSlide(current);
        stopAutoplay();
        startAutoplay();
      });
    });
  }

  /* ----------------------------------------------------------
     16. SERVICE CARDS TILT EFFECT (3D Transform)
     Subtle tilt on mouse move - disabled on mobile
  ---------------------------------------------------------- */
  function initCardTilt() {
    if (isMobile()) return;

    const cards = qsa('.service-card, .card-tilt');
    if (!cards.length) return;

    cards.forEach((card) => {
      card.style.transition = 'transform 0.15s ease-out';
      card.style.transformStyle = 'preserve-3d';

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const rotateX = ((y - centerY) / centerY) * -6; // max 6 degrees
        const rotateY = ((x - centerX) / centerX) * 6;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
      });
    });
  }

  /* ----------------------------------------------------------
     17. PHONE NUMBER CLICK TRACKING
     Logs phone link clicks for analytics
  ---------------------------------------------------------- */
  function initPhoneTracking() {
    const phoneLinks = qsa('a[href^="tel:"]');
    if (!phoneLinks.length) return;

    phoneLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const number = link.getAttribute('href').replace('tel:', '');
        console.log(`[TRACKING] Phone number clicked: ${number} | Time: ${new Date().toISOString()}`);
      });
    });
  }

  /* ----------------------------------------------------------
     18. CURRENT YEAR AUTO-UPDATE IN FOOTER
  ---------------------------------------------------------- */
  function initCurrentYear() {
    const yearElements = qsa('#currentYear, .current-year, [data-year]');
    const currentYear = new Date().getFullYear();

    yearElements.forEach((el) => {
      el.textContent = currentYear;
    });
  }

  /* ----------------------------------------------------------
     19. MAGNETIC BUTTON EFFECT ON CTA BUTTONS
     Subtle cursor-follow effect - disabled on mobile
  ---------------------------------------------------------- */
  function initMagneticButtons() {
    if (isMobile()) return;

    const buttons = qsa('.cta-btn, .btn-magnetic, .magnetic, a.cta, button.cta');
    if (!buttons.length) return;

    buttons.forEach((btn) => {
      btn.style.transition = 'transform 0.2s ease-out';

      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;

        // Magnetic pull - subtle movement towards cursor
        btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ----------------------------------------------------------
     20. SCROLL PROGRESS BAR
     Shows reading progress at the very top of the page
  ---------------------------------------------------------- */
  function initScrollProgress() {
    // Create progress bar element if it doesn't exist
    let progressBar = qs('.scroll-progress, #scrollProgress');

    if (!progressBar) {
      progressBar = document.createElement('div');
      progressBar.id = 'scrollProgress';
      progressBar.style.cssText =
        'position:fixed;top:0;left:0;height:3px;background:linear-gradient(90deg,#f59e0b,#d97706);width:0%;z-index:10000;transition:width 0.1s linear;pointer-events:none;';
      document.body.prepend(progressBar);
    }

    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      progressBar.style.width = `${progress}%`;
    };

    window.addEventListener('scroll', throttle(updateProgress, 30));
    updateProgress();
  }

  /* ----------------------------------------------------------
     21. IMAGE REVEAL ANIMATION ON SCROLL
     Slides images into view with a reveal mask effect
  ---------------------------------------------------------- */
  function initImageReveal() {
    const images = qsa('.reveal-image, .image-reveal, [data-reveal]');
    if (!images.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.2,
        rootMargin: '0px 0px -80px 0px',
      }
    );

    images.forEach((img) => {
      // Set initial state via JS so it works even without CSS
      if (!img.classList.contains('revealed')) {
        img.style.clipPath = img.style.clipPath || 'inset(0 100% 0 0)';
        img.style.transition = 'clip-path 0.8s cubic-bezier(0.77, 0, 0.175, 1), opacity 0.8s ease';
        img.style.opacity = '0';
      }
      observer.observe(img);
    });

    // CSS for .revealed state
    const style = document.createElement('style');
    style.textContent = `
      .revealed {
        clip-path: inset(0 0% 0 0) !important;
        opacity: 1 !important;
      }
    `;
    document.head.appendChild(style);
  }

  /* ----------------------------------------------------------
     22. STAGGER ANIMATION FOR GRID ITEMS
     Delays each item's animation based on its index
  ---------------------------------------------------------- */
  function initStaggerAnimation() {
    const grids = qsa('.stagger-grid, .services-grid, .grid-stagger, [data-stagger]');
    if (!grids.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const children = [...entry.target.children];
            children.forEach((child, index) => {
              child.style.opacity = '0';
              child.style.transform = 'translateY(30px)';
              child.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;

              // Trigger the animation in the next frame
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  child.style.opacity = '1';
                  child.style.transform = 'translateY(0)';
                });
              });
            });
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    );

    grids.forEach((grid) => {
      // Set initial hidden state for children
      [...grid.children].forEach((child) => {
        child.style.opacity = '0';
        child.style.transform = 'translateY(30px)';
      });
      observer.observe(grid);
    });
  }

  /* ----------------------------------------------------------
     BONUS: SMOOTH CURSOR GLOW EFFECT
     Adds a subtle glow following the cursor on dark backgrounds
     Disabled on mobile for performance
  ---------------------------------------------------------- */
  function initCursorGlow() {
    if (isMobile()) return;

    const hero = qs('.hero, .hero-section, #hero');
    if (!hero) return;

    const glow = document.createElement('div');
    glow.classList.add('cursor-glow');
    glow.style.cssText =
      'position:absolute;width:300px;height:300px;border-radius:50%;' +
      'background:radial-gradient(circle,rgba(245,158,11,0.08) 0%,transparent 70%);' +
      'pointer-events:none;z-index:2;transform:translate(-50%,-50%);' +
      'transition:opacity 0.3s ease;opacity:0;';
    hero.appendChild(glow);

    hero.addEventListener('mousemove', (e) => {
      const rect = hero.getBoundingClientRect();
      glow.style.left = `${e.clientX - rect.left}px`;
      glow.style.top = `${e.clientY - rect.top}px`;
      glow.style.opacity = '1';
    });

    hero.addEventListener('mouseleave', () => {
      glow.style.opacity = '0';
    });
  }

  /* ----------------------------------------------------------
     INITIALIZATION
     Runs all modules on DOMContentLoaded
  ---------------------------------------------------------- */
  document.addEventListener('DOMContentLoaded', () => {
    // --- Core functionality ---
    initPreloader();
    initNavScroll();
    initMobileMenu();
    initSmoothScroll();
    initCurrentPageLinks();
    initActiveNavHighlight();
    initCurrentYear();

    // --- Animations & effects ---
    initScrollAnimations();
    initCounters();
    initTypewriter();
    initImageReveal();
    initStaggerAnimation();

    // --- Interactive components ---
    initFaqAccordion();
    initTestimonialSlider();
    initFormValidation();
    initLazyLoad();

    // --- Visual effects (skipped on mobile for performance) ---
    initParallax();
    initParticles();
    initCardTilt();
    initMagneticButtons();
    initCursorGlow();

    // --- Utility ---
    initScrollProgress();
    initBackToTop();
    initPhoneTracking();

    console.log('%c Springs Garage Door Services ', 'background:#f59e0b;color:#000;font-size:14px;font-weight:bold;padding:4px 12px;border-radius:4px;');
    console.log('%c Website initialized successfully ', 'color:#888;font-size:11px;');
  });
})();
