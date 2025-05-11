document.addEventListener('DOMContentLoaded', function () {
    particlesJS('particles-js', {
      particles: {
        number: {
          value: 80,
          density: {
            enable: true,
            value_area: 800
          }
        },
        color: { 
          value: "#5865F2" 
        },
        shape: { 
          type: "circle" 
        },
        opacity: {
          value: 0.3,
          random: true,
          anim: {
            enable: true,
            speed: 1,
            opacity_min: 0.1,
            sync: false
          }
        },
        size: {
          value: 3,
          random: true,
          anim: {
            enable: true,
            speed: 2,
            size_min: 0.1,
            sync: false
          }
        },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#5865F2",
          opacity: 0.2,
          width: 1
        },
        move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: true,
          straight: false,
          out_mode: "out",
          bounce: false,
          attract: {
            enable: true,
            rotateX: 600,
            rotateY: 1200
          }
        }
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: {
            enable: true,
            mode: "grab"
          },
          onclick: {
            enable: true,
            mode: "push"
          },
          resize: true
        },
        modes: {
          grab: {
            distance: 140,
            line_linked: {
              opacity: 0.5
            }
          },
          push: {
            particles_nb: 4
          }
        }
      },
      retina_detect: true
    });
  
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    });
  
    const nav = document.querySelector('.glass-nav');
    let lastScroll = 0;
  
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
  
      if (currentScroll > lastScroll && currentScroll > 100) {
        nav.style.transform = 'translateY(-100%)';
      } else {
        nav.style.transform = 'translateY(0)';
      }
  
      lastScroll = currentScroll;
    });
  
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };
  
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);
  
    document.querySelectorAll('.info-section').forEach(section => {
      section.style.opacity = '0';
      section.style.transform = 'translateY(20px)';
      section.style.transition = 'all 0.6s ease-out';
      observer.observe(section);
    });
  
    document.querySelectorAll('.feature-box, .pricing-box').forEach(box => {
      box.style.opacity = '0';
      box.style.transform = 'translateY(20px)';
      box.style.transition = 'all 0.6s ease-out';
      observer.observe(box);
    });
  
    const style = document.createElement('style');
    style.textContent = `
      .fade-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
      }
    `;
    document.head.appendChild(style);

    // Footer functionality
    const footer = document.querySelector('.footer');
    let lastScrollY = window.scrollY;
    let scrollTimeout;

    function handleScroll() {
        const currentScrollY = window.scrollY;
        const windowHeight = window.innerHeight;
        const documentHeight = document.documentElement.scrollHeight;
        const scrollPosition = currentScrollY + windowHeight;
        
        // Show footer only when at the absolute bottom (within 5px)
        if (documentHeight - scrollPosition < 5) {
            footer.classList.add('visible');
        } else {
            footer.classList.remove('visible');
        }
    }

    // Add scroll event listener
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                handleScroll();
                scrollTimeout = null;
            }, 10); // Faster response time
        }
    }, { passive: true });

    // Initialize footer state
    handleScroll();

    // Terms and Conditions functionality
    const termsLink = document.querySelector('.terms-link');
    const termsFullpage = document.getElementById('termsFullpage');
    const backToMain = document.getElementById('backToMain');
    const mainContent = document.querySelector('main');

    termsLink.addEventListener('click', (e) => {
        e.preventDefault();
        termsFullpage.classList.add('active');
        mainContent.style.display = 'none';
        footer.classList.remove('visible');
        document.body.style.overflow = 'hidden';
    });

    backToMain.addEventListener('click', () => {
        termsFullpage.classList.remove('active');
        mainContent.style.display = 'flex';
        document.body.style.overflow = 'auto';
        // Check if we should show the footer
        handleScroll();
    });
  });

