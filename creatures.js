/* ============================================
   CUTE AMBIENT CREATURES v2
   ============================================ */

(function() {
    if (window.innerWidth < 769) return;

    const NUM_CREATURES = 5;
    const creatures = [];

    const TYPES = [
        { color: '#ffab1a', glow: 'rgba(255,171,26,0.4)', size: 30, speed: 0.45 },
        { color: '#00cc66', glow: 'rgba(0,204,102,0.4)', size: 26, speed: 0.55 },
        { color: '#ff1a8c', glow: 'rgba(255,26,140,0.4)', size: 28, speed: 0.4 },
        { color: '#a855f7', glow: 'rgba(168,85,247,0.4)', size: 24, speed: 0.6 },
        { color: '#38bdf8', glow: 'rgba(56,189,248,0.4)', size: 27, speed: 0.5 }
    ];

    let mouseX = -9999, mouseY = -9999;
    document.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });
    document.addEventListener('mouseleave', () => { mouseX = -9999; mouseY = -9999; });

    function createEl(type, idx) {
        const el = document.createElement('div');
        el.className = 'creature';
        el.innerHTML = `
            <div class="c-body" style="
                background: ${type.color};
                width: ${type.size}px;
                height: ${type.size}px;
                box-shadow: 0 0 12px ${type.glow}, inset -3px -3px 6px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.15);
            ">
                <div class="c-highlight"></div>
                <div class="c-face">
                    <div class="c-eye c-el"><div class="c-pupil"></div></div>
                    <div class="c-eye c-er"><div class="c-pupil"></div></div>
                    <div class="c-blush c-bl"></div>
                    <div class="c-blush c-br"></div>
                    <div class="c-mouth"></div>
                </div>
            </div>
            <div class="c-legs">
                <div class="c-leg" style="background:${type.color}"></div>
                <div class="c-leg" style="background:${type.color}"></div>
            </div>
            <div class="c-bubble"></div>
        `;
        document.body.appendChild(el);
        return el;
    }

    class Creature {
        constructor(i) {
            this.type = TYPES[i];
            this.el = createEl(this.type, i);
            this.i = i;

            // Spawn at random edge
            const w = window.innerWidth, h = window.innerHeight;
            const side = i % 4;
            if (side === 0) { this.x = Math.random() * w; this.y = 50; }
            else if (side === 1) { this.x = w - 50; this.y = Math.random() * h; }
            else if (side === 2) { this.x = Math.random() * w; this.y = h - 50; }
            else { this.x = 50; this.y = Math.random() * h; }

            this.tx = this.x; this.ty = this.y;
            this.vx = 0; this.vy = 0;
            this.facingRight = true;
            this.state = 'wander';
            this.stateTimer = 0;
            this.cooldown = 100 + Math.random() * 100;
            this.bobPhase = Math.random() * Math.PI * 2;
            this.blinkTimer = 80 + Math.random() * 150;
            this.blinking = false;
            this.walkCycle = 0;
            this.emotion = 'neutral';
            this.bubbleTimeout = null;

            this.pickTarget();
        }

        pickTarget() {
            const w = window.innerWidth, h = window.innerHeight;
            const m = 70;
            const r = Math.random();

            if (r < 0.35) {
                // Top edge
                this.tx = m + Math.random() * (w - m * 2);
                this.ty = m + Math.random() * 60;
            } else if (r < 0.55) {
                // Bottom edge
                this.tx = m + Math.random() * (w - m * 2);
                this.ty = h - m - Math.random() * 60;
            } else if (r < 0.7) {
                // Left edge
                this.tx = m + Math.random() * 50;
                this.ty = m + Math.random() * (h - m * 2);
            } else if (r < 0.85) {
                // Right edge
                this.tx = w - m - Math.random() * 50;
                this.ty = m + Math.random() * (h - m * 2);
            } else {
                // Anywhere in margins
                this.tx = m + Math.random() * (w - m * 2);
                this.ty = m + Math.random() * (h - m * 2);
            }

            this.stateTimer = 250 + Math.random() * 350;
        }

        showBubble(text) {
            const b = this.el.querySelector('.c-bubble');
            b.textContent = text;
            b.classList.add('show');
            if (this.bubbleTimeout) clearTimeout(this.bubbleTimeout);
            this.bubbleTimeout = setTimeout(() => b.classList.remove('show'), 1800);
        }

        hideBubble() {
            this.el.querySelector('.c-bubble').classList.remove('show');
        }

        update(all) {
            this.stateTimer--;
            this.cooldown--;

            const dx = this.tx - this.x, dy = this.ty - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const mdx = mouseX - this.x, mdy = mouseY - this.y;
            const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

            let nearC = null, nearD = Infinity;
            this.nearC = null;
            all.forEach(c => {
                if (c === this) return;
                const d = Math.hypot(c.x - this.x, c.y - this.y);
                if (d < nearD) { nearD = d; nearC = c; this.nearC = c; this.nearD = d; }
            });

            const spd = Math.hypot(this.vx, this.vy);

            switch (this.state) {
                case 'wander':
                    if (dist > 8) {
                        this.vx += (dx / dist) * this.type.speed * 0.06;
                        this.vy += (dy / dist) * this.type.speed * 0.06;
                    }
                    // Chance to interact with viewer
                    if (mDist < 140 && this.cooldown <= 0) {
                        this.state = 'watch_viewer';
                        this.stateTimer = 90 + Math.random() * 70;
                        this.emotion = 'curious';
                    }
                    // Chance to interact with another creature
                    else if (nearD < 80 && this.cooldown <= 0 && Math.random() < 0.5) {
                        this.state = 'meet_creature';
                        this.stateTimer = 80 + Math.random() * 80;
                        this.emotion = 'happy';
                    }
                    else if (this.stateTimer <= 0 || dist < 12) {
                        if (Math.random() < 0.35) {
                            this.state = 'idle';
                            this.stateTimer = 80 + Math.random() * 150;
                            this.emotion = 'neutral';
                        } else {
                            this.pickTarget();
                        }
                    }
                    break;

                case 'idle':
                    this.vx *= 0.92; this.vy *= 0.92;
                    // Still notice the viewer
                    if (mDist < 120 && this.cooldown <= 0) {
                        this.state = 'watch_viewer';
                        this.stateTimer = 80 + Math.random() * 60;
                        this.emotion = 'curious';
                    }
                    if (this.stateTimer <= 0) {
                        this.state = 'wander';
                        this.emotion = 'neutral';
                        this.pickTarget();
                    }
                    break;

                case 'watch_viewer':
                    this.vx *= 0.9; this.vy *= 0.9;
                    this.facingRight = mouseX > this.x;

                    // Bounce slightly toward viewer
                    if (mDist > 40 && mDist < 200) {
                        this.vx += (mdx / mDist) * 0.08;
                        this.vy += (mdy / mDist) * 0.08;
                    }

                    // Show bubble
                    if (this.stateTimer % 40 === 30) {
                        const msgs = ['!', 'hi', '•ᴗ•', '♪', '★', '?', '◡̈'];
                        this.showBubble(msgs[Math.floor(Math.random() * msgs.length)]);
                    }

                    if (this.stateTimer <= 0) {
                        this.state = 'hop_away';
                        this.stateTimer = 35;
                        this.emotion = 'happy';
                        this.cooldown = 180 + Math.random() * 100;
                        this.hideBubble();
                        // Hop away from mouse
                        if (mDist > 1) {
                            this.vx = -(mdx / mDist) * 3.5;
                            this.vy = -(mdy / mDist) * 3.5;
                        } else {
                            this.vx = (Math.random() - 0.5) * 4;
                            this.vy = (Math.random() - 0.5) * 4;
                        }
                    }
                    break;

                case 'meet_creature':
                    this.vx *= 0.88; this.vy *= 0.88;
                    if (nearC) {
                        this.facingRight = nearC.x > this.x;
                        if (nearD > 25) {
                            this.vx += ((nearC.x - this.x) / nearD) * 0.06;
                            this.vy += ((nearC.y - this.y) / nearD) * 0.06;
                        }
                    }
                    if (this.stateTimer % 30 === 20) {
                        const msgs = ['♥', '~', '!', '♫', '◡̈', '⌒'];
                        this.showBubble(msgs[Math.floor(Math.random() * msgs.length)]);
                    }
                    if (this.stateTimer <= 0) {
                        this.state = 'hop_away';
                        this.stateTimer = 30;
                        this.emotion = 'happy';
                        this.cooldown = 150 + Math.random() * 80;
                        this.hideBubble();
                        this.vx = (Math.random() - 0.5) * 3.5;
                        this.vy = (Math.random() - 0.5) * 3.5;
                    }
                    break;

                case 'hop_away':
                    // Just hop away, then return to wander
                    if (this.stateTimer <= 0) {
                        this.state = 'wander';
                        this.emotion = 'neutral';
                        this.pickTarget();
                    }
                    break;
            }

            // Physics
            this.vx *= 0.94;
            this.vy *= 0.94;
            this.x += this.vx;
            this.y += this.vy;

            // Bounds
            const w = window.innerWidth, h = window.innerHeight;
            const pad = 25;
            if (this.x < pad) { this.x = pad; this.vx = Math.abs(this.vx) * 0.5; }
            if (this.x > w - pad) { this.x = w - pad; this.vx = -Math.abs(this.vx) * 0.5; }
            if (this.y < pad) { this.y = pad; this.vy = Math.abs(this.vy) * 0.5; }
            if (this.y > h - pad) { this.y = h - pad; this.vy = -Math.abs(this.vy) * 0.5; }

            // Direction from velocity
            if (Math.abs(this.vx) > 0.15) this.facingRight = this.vx > 0;

            // Walk cycle
            if (spd > 0.25) this.walkCycle += spd * 0.35;

            // Blink
            this.blinkTimer--;
            if (this.blinkTimer <= 0 && !this.blinking) {
                this.blinking = true;
                setTimeout(() => { this.blinking = false; }, 120);
                this.blinkTimer = 80 + Math.random() * 180;
            }
        }

        render() {
            const t = Date.now() * 0.001;
            const spd = Math.hypot(this.vx, this.vy);
            const bob = Math.sin(t * 3.5 + this.bobPhase) * (spd > 0.3 ? 2.5 : 0.8);
            const s = this.type.size;

            // Position
            this.el.style.transform = `translate(${this.x - s / 2}px, ${this.y - s / 2 + bob}px)`;

            // Body flip + squish
            const body = this.el.querySelector('.c-body');
            const flip = this.facingRight ? 1 : -1;
            let sy = 1, sx = 1;
            if (this.emotion === 'happy') {
                sy = 1 + Math.sin(t * 8) * 0.06;
                sx = 1 - Math.sin(t * 8) * 0.04;
            } else if (this.emotion === 'curious') {
                sy = 1 + Math.sin(t * 5) * 0.03;
            }
            body.style.transform = `scaleX(${flip * sx}) scaleY(${sy})`;

            // Eyes
            const eyeL = this.el.querySelector('.c-el');
            const eyeR = this.el.querySelector('.c-er');
            [eyeL, eyeR].forEach(eye => {
                if (this.blinking) {
                    eye.style.height = '2px';
                    eye.style.borderRadius = '1px';
                    eye.style.marginTop = '2px';
                } else if (this.emotion === 'happy') {
                    eye.style.height = '4px';
                    eye.style.borderRadius = '4px 4px 0 0';
                    eye.style.marginTop = '0';
                } else if (this.emotion === 'curious') {
                    eye.style.height = '8px';
                    eye.style.width = '7px';
                    eye.style.borderRadius = '50%';
                    eye.style.marginTop = '-1px';
                } else {
                    eye.style.height = '6px';
                    eye.style.width = '6px';
                    eye.style.borderRadius = '50%';
                    eye.style.marginTop = '0';
                }
            });

            // Pupils look toward target
            const pupils = this.el.querySelectorAll('.c-pupil');
            let lookX = 0, lookY = 0;
            if (this.state === 'watch_viewer') {
                const a = Math.atan2(mouseY - this.y, mouseX - this.x);
                lookX = Math.cos(a) * 1.5;
                lookY = Math.sin(a) * 1;
            } else if (this.state === 'meet_creature' && this.nearC) {
                lookX = this.facingRight ? 1.5 : -1.5;
                lookY = (this.nearC.y > this.y) ? 0.8 : -0.8;
            }
            pupils.forEach(p => {
                p.style.transform = `translate(${lookX}px, ${lookY}px)`;
            });

            // Blush
            const blushL = this.el.querySelector('.c-bl');
            const blushR = this.el.querySelector('.c-br');
            const showBlush = this.emotion === 'happy' ? '0.7' : '0';
            blushL.style.opacity = showBlush;
            blushR.style.opacity = showBlush;

            // Mouth
            const mouth = this.el.querySelector('.c-mouth');
            if (this.emotion === 'happy') {
                mouth.style.width = '7px';
                mouth.style.height = '4px';
                mouth.style.borderRadius = '0 0 4px 4px';
                mouth.style.background = 'rgba(0,0,0,0.35)';
            } else if (this.emotion === 'curious') {
                mouth.style.width = '4px';
                mouth.style.height = '4px';
                mouth.style.borderRadius = '50%';
                mouth.style.background = 'rgba(0,0,0,0.3)';
            } else {
                mouth.style.width = '5px';
                mouth.style.height = '2px';
                mouth.style.borderRadius = '2px';
                mouth.style.background = 'rgba(0,0,0,0.25)';
            }

            // Legs
            const legs = this.el.querySelector('.c-legs');
            const legEls = this.el.querySelectorAll('.c-leg');
            if (spd > 0.25) {
                legs.style.display = 'flex';
                const swing = Math.sin(this.walkCycle) * 12;
                legEls[0].style.transform = `rotate(${swing}deg)`;
                legEls[1].style.transform = `rotate(${-swing}deg)`;
            } else {
                legs.style.display = 'none';
            }

            // Z-index: behind main content but visible
            this.el.style.zIndex = '5';
        }
    }

    // Init
    for (let i = 0; i < NUM_CREATURES; i++) {
        creatures.push(new Creature(i));
    }

    function loop() {
        creatures.forEach(c => { c.update(creatures); c.render(); });
        requestAnimationFrame(loop);
    }
    loop();

    window.addEventListener('resize', () => {
        creatures.forEach(c => {
            c.x = Math.min(c.x, window.innerWidth - 40);
            c.y = Math.min(c.y, window.innerHeight - 40);
        });
    });
})();
