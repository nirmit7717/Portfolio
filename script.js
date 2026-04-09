/* ============================================
   GAME DEV PORTFOLIO - SCRIPTS (3D Scroll Edition)
   ============================================ */

// --- Particle Background ---
(function() {
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let w, h;

    function resize() {
        w = canvas.width = window.innerWidth;
        h = canvas.height = window.innerHeight;
    }

    function createParticles() {
        particles = [];
        const count = Math.floor((w * h) / 15000);
        for (let i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                size: Math.random() * 2 + 0.5,
                alpha: Math.random() * 0.5 + 0.1,
                color: Math.random() > 0.7 ? '#ffab1a' : (Math.random() > 0.5 ? '#00cc66' : '#ff1a8c')
            });
        }
    }

    function animate() {
        ctx.clearRect(0, 0, w, h);
        for (let p of particles) {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0) p.x = w;
            if (p.x > w) p.x = 0;
            if (p.y < 0) p.y = h;
            if (p.y > h) p.y = 0;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
        }

        ctx.globalAlpha = 0.04;
        ctx.strokeStyle = '#ffab1a';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = dx * dx + dy * dy;
                if (dist < 14400) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
        ctx.globalAlpha = 1;
        requestAnimationFrame(animate);
    }

    resize();
    createParticles();
    animate();
    window.addEventListener('resize', () => { resize(); createParticles(); });
})();

// --- Navbar Scroll Effect ---
(function() {
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
    });
})();

// --- Mobile Menu ---
(function() {
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');
    let open = false;

    btn.addEventListener('click', () => {
        open = !open;
        if (open) {
            menu.style.display = 'flex';
            requestAnimationFrame(() => menu.classList.add('open'));
            btn.children[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            btn.children[1].style.opacity = '0';
            btn.children[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        } else {
            menu.classList.remove('open');
            setTimeout(() => { menu.style.display = 'none'; }, 400);
            btn.children[0].style.transform = '';
            btn.children[1].style.opacity = '';
            btn.children[2].style.transform = '';
        }
    });

    menu.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => {
            open = false;
            menu.classList.remove('open');
            setTimeout(() => { menu.style.display = 'none'; }, 400);
            btn.children[0].style.transform = '';
            btn.children[1].style.opacity = '';
            btn.children[2].style.transform = '';
        });
    });
})();

// --- Smooth Scroll ---
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) target.scrollIntoView({ behavior: 'smooth' });
    });
});

// --- REVERSIBLE Scroll 3D Transitions ---
// Elements animate IN when scrolled into view, animate OUT when scrolled away
(function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -30px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // All elements that get scroll-triggered 3D animations
    const selectors = [
        '.section-header',
        '.about-text',
        '.about-terminal',
        '.project-card',
        '.skill-card',
        '.contact-info',
        '.contact-form',
        '.contact-link',
        '.stat-item',
        '.category-title',
        '.skill-tag-group',
        '.skill-chip'
    ];

    selectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => observer.observe(el));
    });
})();

// --- Skill Bar Animation (fills on scroll, empties on scroll away) ---
(function() {
    const skillFills = document.querySelectorAll('.skill-fill');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const width = entry.target.getAttribute('data-width');
                entry.target.style.width = width + '%';
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    skillFills.forEach(fill => observer.observe(fill));
})();

// --- Terminal Typewriter Effect (reversible) ---
(function() {
    const terminalBody = document.querySelector('.terminal-body');
    if (!terminalBody) return;

    const lines = terminalBody.querySelectorAll('.output');
    lines.forEach(l => { l.style.opacity = '0'; l.style.transform = 'translateX(-10px)'; });

    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                lines.forEach((line, i) => {
                    setTimeout(() => {
                        line.style.transition = 'all 0.4s ease';
                        line.style.opacity = '1';
                        line.style.transform = 'translateX(0)';
                    }, i * 200);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    observer.observe(terminalBody);
})();

// --- Active Nav Link ---
(function() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            if (window.scrollY >= section.offsetTop - 100) {
                current = section.getAttribute('id');
            }
        });
        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === '#' + current) {
                link.style.color = 'var(--primary)';
            }
        });
    });
})();

// --- Hero 3D Mouse Parallax ---
(function() {
    const heroContent = document.querySelector('.hero-content');
    const hero = document.querySelector('.hero');
    if (!heroContent || !hero) return;

    hero.addEventListener('mousemove', (e) => {
        const rect = hero.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;

        heroContent.style.transform =
            'perspective(1000px) rotateY(' + (x * 4) + 'deg) rotateX(' + (-y * 4) + 'deg) translateZ(10px)';
    });

    hero.addEventListener('mouseleave', () => {
        heroContent.style.transition = 'transform 0.5s ease-out';
        heroContent.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg) translateZ(0)';
        setTimeout(() => { heroContent.style.transition = 'transform 0.1s ease-out'; }, 500);
    });
})();

// --- 3D Card Tilt on Hover ---
(function() {
    const cards = document.querySelectorAll('.project-card, .skill-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            card.style.transform =
                'perspective(800px) rotateY(' + (x * 8) + 'deg) rotateX(' + (-y * 8) + 'deg) translateZ(20px) scale(1.02)';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            card.style.transform = 'perspective(800px) rotateY(0deg) rotateX(0deg) translateZ(0) scale(1)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
            }, 500);
        });
    });
})();

// --- Contact Form ---
(function() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        const btn = form.querySelector('.submit-btn');
        btn.innerHTML = '<span>⏳</span> Sending...';
        btn.disabled = true;
        btn.style.opacity = '0.7';

        // Let the form submit naturally to formsubmit.co
        // The AJAX override gives us UI feedback
        e.preventDefault();

        const formData = new FormData(form);

        fetch(form.action, {
            method: 'POST',
            body: formData,
            headers: { 'Accept': 'application/json' }
        })
        .then(response => {
            if (response.ok) {
                btn.innerHTML = '<span>✅</span> Message Sent!';
                btn.style.background = '#00cc66';
                btn.style.borderColor = '#00cc66';
                btn.style.color = '#000';
                form.reset();
            } else {
                btn.innerHTML = '<span>❌</span> Failed. Try email.';
                btn.style.background = '#ff1a8c';
                btn.style.borderColor = '#ff1a8c';
            }
        })
        .catch(() => {
            btn.innerHTML = '<span>❌</span> Failed. Try email.';
            btn.style.background = '#ff1a8c';
            btn.style.borderColor = '#ff1a8c';
        })
        .finally(() => {
            setTimeout(() => {
                btn.innerHTML = '<span>🪙</span> Send Message';
                btn.style.background = '';
                btn.style.borderColor = '';
                btn.style.color = '';
                btn.style.opacity = '';
                btn.disabled = false;
            }, 3500);
        });
    });
})();
