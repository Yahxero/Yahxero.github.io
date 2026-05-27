/* ==========================================================================
   YELLOWJACKETS ESCAPE RUNNER - GAME ENGINE (VIBRANT FOREST, TUTORIAL, & BALANCED RUN)
   ========================================================================== */

class GameEngine {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        // Game States
        this.isRunning = false;
        this.isGameOver = false;
        this.isEndingSequence = false;
        this.endingStep = 0;
        
        // Tutorial State
        this.showTutorial = true;
        
        // Physics & Dimensions
        this.groundY = 280;
        this.gravity = 0.6;
        
        // Game Stats (INCREASED LENGTH FOR A FULL GAME EXPERIENCE)
        this.distance = 0;
        this.targetDistance = 1500; // Finish line (approx 45-50 seconds of gameplay at relaxed pace)
        this.ammo = 5;
        this.maxAmmo = 10;
        this.ammoRegenTimer = 0;
        
        // Player properties (Yahiero - Boy Silhouette)
        this.player = {
            x: 100,
            y: 220,
            width: 40,
            height: 65,
            vy: 0,
            isJumping: false,
            isSlashing: false,
            slashCooldown: 0,
            slashAnimFrame: 0,
            isInvincible: false,
            invincibleTimer: 0,
            flashState: false,
            health: 100
        };
        
        // Girl Character (Jewel - Flowing Scarf Silhouette)
        this.jewel = {
            x: 850,
            y: 215,
            width: 40,
            height: 65,
            targetX: 500,
            opacity: 0,
            hairOffset: 0
        };
        
        // Game entities lists
        this.enemies = [];
        this.projectiles = [];
        this.pickups = [];
        this.particles = [];
        this.fireflies = []; // Colorful Glowing forest fireflies
        
        // Parallax Background offsets
        this.bgOffsetFar = 0;
        this.bgOffsetMid = 0;
        this.bgOffsetNear = 0;
        
        // SPEED MULTIPLIER (Relaxed and readable pace)
        this.speedMultiplier = 2.2; 
        
        // FX and Screen shake
        this.screenShake = 0;
        
        // Key bindings state
        this.keys = {};
        
        // Bindings
        this.initControls();
        this.generateFireflies();
    }
    
    start() {
        if (this.isRunning) return;
        this.isRunning = true;
        this.resetGame();
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    resetGame() {
        this.isGameOver = false;
        this.isEndingSequence = false;
        this.showTutorial = true; // Show tutorial at start of each run
        this.endingStep = 0;
        this.distance = 0;
        this.ammo = 5;
        this.enemies = [];
        this.projectiles = [];
        this.pickups = [];
        this.particles = [];
        this.screenShake = 0;
        this.player.health = 100;
        this.player.x = 100;
        this.player.y = this.groundY - this.player.height;
        this.player.vy = 0;
        this.player.isJumping = false;
        this.player.isSlashing = false;
        this.speedMultiplier = 2.2;
        
        // Reset Jewel
        this.jewel.x = 850;
        this.jewel.opacity = 0;
        
        // Make sure tutorial overlay is active
        const tutOverlay = document.getElementById('game-tutorial');
        if (tutOverlay) tutOverlay.classList.add('active');
        
        // Hide next button and dialog box initially
        document.getElementById('game-next-container').classList.remove('show');
        document.getElementById('game-dialog-box').classList.remove('show');
        
        // Generate initial background particles (Magical Multi-Colored Forest Spores!)
        const sporeColors = ['rgba(236, 72, 153, 0.45)', 'rgba(6, 182, 212, 0.45)', 'rgba(16, 185, 129, 0.45)', 'rgba(245, 158, 11, 0.45)'];
        for(let i=0; i<45; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2.8 + 1,
                vx: -Math.random() * 0.8 - 0.3,
                vy: Math.random() * 0.4 - 0.2,
                color: sporeColors[i % sporeColors.length]
            });
        }
        this.generateFireflies();
    }
    
    generateFireflies() {
        this.fireflies = [];
        // Multicolored dynamic fireflies
        const colors = [
            'rgba(20, 184, 166, 0.85)',  // Teal
            'rgba(244, 63, 94, 0.85)',   // Hot Pink
            'rgba(132, 204, 22, 0.85)',  // Lime Green
            'rgba(255, 204, 0, 0.85)'    // Golden Yellow
        ];
        
        for (let i = 0; i < 20; i++) {
            this.fireflies.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * (this.groundY - 80),
                size: Math.random() * 3 + 1,
                angle: Math.random() * Math.PI * 2,
                speed: Math.random() * 0.4 + 0.15,
                pulseSpeed: Math.random() * 0.06 + 0.02,
                pulseVal: Math.random(),
                color: colors[i % colors.length]
            });
        }
    }
    
    initControls() {
        // Keyboard controls
        window.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // Single press action triggers (Disabled when tutorial is open)
            if (!this.showTutorial) {
                if ((e.code === 'Space' || e.code === 'ArrowUp') && !this.isEndingSequence) {
                    this.jump();
                }
                if ((e.code === 'KeyF' || e.code === 'KeyZ') && !this.isEndingSequence) {
                    this.slash();
                }
                if ((e.code === 'KeyD' || e.code === 'KeyX') && !this.isEndingSequence) {
                    this.throwKnife();
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // HTML Tutorial Button click handler
        const startBtn = document.getElementById('start-run-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.showTutorial = false;
                const tutOverlay = document.getElementById('game-tutorial');
                if (tutOverlay) tutOverlay.classList.remove('active');
                
                // Spawn minor startup smoke dust
                this.spawnDust(this.player.x, this.groundY, 8);
            });
        }
        
        // Mobile Button Controls (Disabled when tutorial is open)
        document.getElementById('m-jump-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.showTutorial) this.jump();
        });
        document.getElementById('m-slash-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.showTutorial) this.slash();
        });
        document.getElementById('m-throw-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!this.showTutorial) this.throwKnife();
        });
    }
    
    jump() {
        if (!this.player.isJumping) {
            this.player.vy = -10.5; 
            this.player.isJumping = true;
            this.spawnDust(this.player.x + 20, this.groundY, 6);
        }
    }
    
    slash() {
        if (this.player.slashCooldown <= 0) {
            this.player.isSlashing = true;
            this.player.slashCooldown = 15;
            this.player.slashAnimFrame = 0;
            
            this.screenShake = 4;
            
            let slashX = this.player.x + this.player.width;
            let slashW = 75; 
            
            this.enemies.forEach(enemy => {
                if (enemy.x > slashX && enemy.x < slashX + slashW) {
                    if (this.player.y + this.player.height > enemy.y && this.player.y < enemy.y + enemy.height) {
                        this.damageEnemy(enemy, 35);
                    }
                }
            });
        }
    }
    
    throwKnife() {
        if (this.ammo > 0) {
            this.ammo--;
            document.getElementById('game-ammo').textContent = this.ammo;
            
            this.projectiles.push({
                x: this.player.x + this.player.width,
                y: this.player.y + this.player.height / 2 - 5,
                vx: 8, 
                width: 15,
                height: 5,
                color: '#e6b00f'
            });
            
            this.spawnDust(this.player.x + this.player.width, this.player.y + this.player.height / 2, 3);
        }
    }
    
    damageEnemy(enemy, amount) {
        enemy.health -= amount;
        enemy.flashTime = 5;
        this.screenShake = 6;
        
        // Spawn sparks
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: enemy.x + enemy.width/2,
                y: enemy.y + enemy.height/2,
                size: Math.random() * 2.5 + 1,
                vx: (Math.random() - 0.2) * 4,
                vy: (Math.random() - 0.5) * 5,
                color: Math.random() > 0.5 ? '#10b981' : '#ec4899', // Lush magical color sparkles!
                life: 20
            });
        }
    }
    
    spawnDust(x, y, count) {
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x: x,
                y: y,
                size: Math.random() * 3 + 1,
                vx: (Math.random() - 0.8) * 2,
                vy: (Math.random() - 0.5) * 1.5,
                color: 'rgba(16, 185, 129, 0.3)', // Emerald dust trail
                life: 15
            });
        }
    }
    
    spawnEnemy() {
        if (this.isEndingSequence) return;
        
        let rand = Math.random();
        let newEnemy;
        
        if (rand < 0.45) {
            // Wolf
            newEnemy = {
                type: 'wolf',
                x: 820,
                y: this.groundY - 35,
                width: 55,
                height: 35,
                speed: 3.5, 
                health: 20,
                maxHealth: 20,
                color: '#475569',
                flashTime: 0
            };
        } else if (rand < 0.8) {
            // Deer
            newEnemy = {
                type: 'deer',
                x: 820,
                y: this.groundY - 55,
                width: 45,
                height: 55,
                speed: 2.2, 
                health: 40,
                maxHealth: 40,
                color: '#b45309',
                flashTime: 0
            };
        } else {
            // Bear
            newEnemy = {
                type: 'bear',
                x: 820,
                y: this.groundY - 70,
                width: 75,
                height: 70,
                speed: 1.2, 
                health: 80,
                maxHealth: 80,
                color: '#1e293b',
                flashTime: 0
            };
        }
        
        this.enemies.push(newEnemy);
    }
    
    spawnPickup() {
        if (this.isEndingSequence) return;
        this.pickups.push({
            x: 820 + Math.random() * 100,
            y: 120 + Math.random() * 80,
            width: 20,
            height: 20,
            speed: this.speedMultiplier,
            color: '#e6b00f'
        });
    }
    
    // Core game update loop
    update() {
        // SCREEN-SAVER MODE DURING TUTORIAL
        // Keeps the forest alive, fireflies pulsing, and spore particles drifting!
        if (this.showTutorial) {
            this.updateAmbient();
            return;
        }

        if (this.screenShake > 0) this.screenShake -= 0.5;
        
        // Update Fireflies
        this.fireflies.forEach(f => {
            f.angle += 0.02;
            f.x += Math.sin(f.angle) * f.speed;
            f.y += Math.cos(f.angle * 0.5) * f.speed * 0.5;
            f.pulseVal += f.pulseSpeed;
            
            if (f.x < -10) f.x = this.canvas.width + 10;
            if (f.x > this.canvas.width + 10) f.x = -10;
            if (f.y < -10) f.y = this.groundY - 80;
            if (f.y > this.groundY - 5) f.y = 10;
        });
        
        // Progress distance
        if (!this.isEndingSequence) {
            this.distance += this.speedMultiplier * 0.1;
            document.getElementById('game-dist').textContent = Math.floor(this.distance) + 'm';
            
            if (this.distance >= this.targetDistance) {
                this.triggerEndingSequence();
            }
        }
        
        // Ammo slow regeneration
        if (this.ammo < this.maxAmmo) {
            this.ammoRegenTimer++;
            if (this.ammoRegenTimer >= 180) {
                this.ammo++;
                document.getElementById('game-ammo').textContent = this.ammo;
                this.ammoRegenTimer = 0;
            }
        }
        
        // Update Player state
        if (!this.isEndingSequence) {
            this.player.vy += this.gravity;
            this.player.y += this.player.vy;
            
            if (this.player.y + this.player.height >= this.groundY) {
                this.player.y = this.groundY - this.player.height;
                this.player.vy = 0;
                this.player.isJumping = false;
            }
        } else {
            // Ending sequence: Guide player to standing clearing spot
            if (this.player.x < 300) {
                this.player.x += 1.5;
                if (Math.floor(this.player.x) % 12 === 0) {
                    this.player.y = this.groundY - this.player.height - 2;
                } else {
                    this.player.y = this.groundY - this.player.height;
                }
            } else {
                this.player.y = this.groundY - this.player.height;
            }
            
            // Guide Jewel in from right
            if (this.jewel.x > this.jewel.targetX) {
                this.jewel.x -= 1.2;
                this.jewel.opacity = Math.min(1, this.jewel.opacity + 0.02);
            }
            this.jewel.hairOffset += 0.08;
        }
        
        // Update Invincibility timer
        if (this.player.isInvincible) {
            this.player.invincibleTimer--;
            if (Math.floor(this.player.invincibleTimer / 4) % 2 === 0) {
                this.player.flashState = true;
            } else {
                this.player.flashState = false;
            }
            
            if (this.player.invincibleTimer <= 0) {
                this.player.isInvincible = false;
                this.player.flashState = false;
            }
        }
        
        // Slash Animation Cooldown
        if (this.player.slashCooldown > 0) {
            this.player.slashCooldown--;
            this.player.slashAnimFrame = Math.floor((15 - this.player.slashCooldown) / 3);
            if (this.player.slashCooldown <= 0) {
                this.player.isSlashing = false;
            }
        }
        
        // Spawn managers
        if (!this.isEndingSequence) {
            if (Math.random() < 0.005) { 
                this.spawnEnemy();
            }
            if (Math.random() < 0.003) {
                this.spawnPickup();
            }
        }
        
        // Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            let p = this.projectiles[i];
            p.x += p.vx;
            
            if (p.x > this.canvas.width) {
                this.projectiles.splice(i, 1);
                continue;
            }
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                let enemy = this.enemies[j];
                if (p.x + p.width > enemy.x && p.x < enemy.x + enemy.width &&
                    p.y + p.height > enemy.y && p.y < enemy.y + enemy.height) {
                    
                    this.damageEnemy(enemy, 20);
                    this.projectiles.splice(i, 1);
                    break;
                }
            }
        }
        
        // Update Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            let enemy = this.enemies[i];
            enemy.x -= enemy.speed;
            
            if (enemy.flashTime > 0) enemy.flashTime--;
            
            // Death Check
            if (enemy.health <= 0) {
                for(let k=0; k<12; k++) {
                    this.particles.push({
                        x: enemy.x + enemy.width/2,
                        y: enemy.y + enemy.height/2,
                        size: Math.random() * 3 + 1.5,
                        vx: (Math.random() - 0.5) * 6,
                        vy: (Math.random() - 0.5) * 6,
                        color: enemy.color,
                        life: 25
                    });
                }
                this.enemies.splice(i, 1);
                continue;
            }
            
            if (enemy.x + enemy.width < 0) {
                this.enemies.splice(i, 1);
                continue;
            }
            
            // Player collision
            if (!this.player.isInvincible && !this.isEndingSequence) {
                if (this.player.x + this.player.width > enemy.x + 10 && this.player.x < enemy.x + enemy.width - 10 &&
                    this.player.y + this.player.height > enemy.y + 5 && this.player.y < enemy.y + enemy.height) {
                    
                    this.triggerPlayerDamage();
                }
            }
        }
        
        // Update Pickups
        for (let i = this.pickups.length - 1; i >= 0; i--) {
            let p = this.pickups[i];
            p.x -= p.speed;
            p.y += Math.sin(this.distance * 0.1) * 1;
            
            if (p.x + p.width < 0) {
                this.pickups.splice(i, 1);
                continue;
            }
            
            if (this.player.x + this.player.width > p.x && this.player.x < p.x + p.width &&
                this.player.y + this.player.height > p.y && this.player.y < p.y + p.height) {
                
                this.ammo = Math.min(this.maxAmmo, this.ammo + 3);
                document.getElementById('game-ammo').textContent = this.ammo;
                
                for (let k = 0; k < 6; k++) {
                    this.particles.push({
                        x: p.x + p.width/2,
                        y: p.y + p.height/2,
                        size: Math.random() * 2.5 + 1,
                        vx: (Math.random() - 0.5) * 3,
                        vy: (Math.random() - 0.5) * 3,
                        color: '#ffcc00',
                        life: 15
                    });
                }
                this.pickups.splice(i, 1);
            }
        }
        
        // Update Particles
        for (let i = this.particles.length - 1; i >= 0; i--) {
            let part = this.particles[i];
            part.x += part.vx || -this.speedMultiplier; 
            part.y += part.vy || 0;
            
            if (part.life !== undefined) {
                part.life--;
                if (part.life <= 0) {
                    this.particles.splice(i, 1);
                    continue;
                }
            }
            
            if (part.x < 0) {
                part.x = this.canvas.width + 10;
                part.y = Math.random() * this.canvas.height;
            }
        }
        
        // Scroll background parallax layers (VIBRANT)
        if (!this.isEndingSequence) {
            this.bgOffsetFar = (this.bgOffsetFar - this.speedMultiplier * 0.05) % this.canvas.width;
            this.bgOffsetMid = (this.bgOffsetMid - this.speedMultiplier * 0.15) % this.canvas.width;
            this.bgOffsetNear = (this.bgOffsetNear - this.speedMultiplier * 0.5) % this.canvas.width;
        }
    }
    
    // Ambient screensaver updates for when the tutorial is overlayed
    updateAmbient() {
        // Update fireflies
        this.fireflies.forEach(f => {
            f.angle += 0.015;
            f.x += Math.sin(f.angle) * f.speed;
            f.y += Math.cos(f.angle * 0.5) * f.speed * 0.5;
            f.pulseVal += f.pulseSpeed;
            if (f.x < -10) f.x = this.canvas.width + 10;
            if (f.x > this.canvas.width + 10) f.x = -10;
        });
        
        // Update magical forest spores
        this.particles.forEach(part => {
            part.x += part.vx || -0.5;
            part.y += part.vy || 0;
            if (part.x < -10) {
                part.x = this.canvas.width + 10;
                part.y = Math.random() * this.canvas.height;
            }
        });
    }
    
    triggerPlayerDamage() {
        this.player.isInvincible = true;
        this.player.invincibleTimer = 60;
        this.screenShake = 10;
        
        for(let k=0; k<10; k++) {
            this.particles.push({
                x: this.player.x + this.player.width/2,
                y: this.player.y + this.player.height/2,
                size: Math.random() * 3 + 1,
                vx: (Math.random() - 0.5) * 7,
                vy: (Math.random() - 0.5) * 7,
                color: '#ec4899', // bright pink shockwave sparks!
                life: 20
            });
        }
    }
    
    // Core game render loop
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        if (this.screenShake > 0) {
            let dx = (Math.random() - 0.5) * this.screenShake;
            let dy = (Math.random() - 0.5) * this.screenShake;
            this.ctx.translate(dx, dy);
        }
        
        // 1. Forest Sky gradient (MAGICAL Twilight colorful colors instead of black-yellow!)
        let skyGrad = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        skyGrad.addColorStop(0, '#030712'); // Slate black sky top
        skyGrad.addColorStop(0.4, '#1e1b4b'); // Royal Indigo mid-sky
        skyGrad.addColorStop(1, '#3b0764'); // Vibrant Violet forest floor horizon sky!
        this.ctx.fillStyle = skyGrad;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 2. Parallax Pines Forest (Emerald green, purple, and magical hues!)
        this.drawParallaxBackground();
        
        // 3. Draw Ground Line with bright colorful forest turf
        this.ctx.strokeStyle = '#10b981'; // Vibrant emerald outline!
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.groundY);
        this.ctx.lineTo(this.canvas.width, this.groundY);
        this.ctx.stroke();
        
        // Ground Layer fill (Moss-covered deep magical forest floor)
        this.ctx.fillStyle = '#062f21'; 
        this.ctx.fillRect(0, this.groundY, this.canvas.width, this.canvas.height - this.groundY);
        
        // Draw colorful glowing mushroom caps & plants on floor
        this.ctx.fillStyle = '#22c55e'; // emerald grass
        for(let i=0; i<this.canvas.width; i+=25) {
            let grassX = (i + this.bgOffsetNear) % (this.canvas.width + 25) - 12;
            this.ctx.beginPath();
            this.ctx.moveTo(grassX, this.groundY);
            this.ctx.lineTo(grassX + 4, this.groundY - 12);
            this.ctx.lineTo(grassX + 8, this.groundY);
            this.ctx.fill();
            
            // Magical glowing cyan/pink mushrooms on ground
            if (i % 75 === 0) {
                this.ctx.save();
                this.ctx.fillStyle = i % 150 === 0 ? '#06b6d4' : '#ec4899'; // cyan or pink glowing shrooms
                this.ctx.beginPath();
                this.ctx.arc(grassX + 10, this.groundY - 5, 4, Math.PI, 0); // cap
                this.ctx.fill();
                this.ctx.fillStyle = '#ffffff';
                this.ctx.fillRect(grassX + 9, this.groundY - 5, 2, 5); // stalk
                this.ctx.restore();
            }
        }
        
        // 4. Draw pickups (Knife boxes)
        this.pickups.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(p.x, p.y + p.height/2);
            this.ctx.lineTo(p.x + p.width - 5, p.y);
            this.ctx.lineTo(p.x + p.width, p.y + p.height/2);
            this.ctx.lineTo(p.x + p.width - 5, p.y + p.height);
            this.ctx.closePath();
            this.ctx.fill();
            this.ctx.stroke();
        });
        
        // 5. Draw Projectiles
        this.projectiles.forEach(p => {
            this.ctx.fillStyle = p.color;
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 1;
            this.ctx.fillRect(p.x, p.y, p.width, p.height);
            this.ctx.fillStyle = '#27272a';
            this.ctx.fillRect(p.x - 3, p.y - 1, 3, p.height + 2);
        });
        
        // 6. Draw Enemies (Bears, Wolves, Deer in matching silhouettes)
        this.enemies.forEach(enemy => {
            if (enemy.flashTime > 0 && Math.floor(enemy.flashTime) % 2 === 0) {
                this.ctx.fillStyle = '#ffffff';
            } else {
                this.ctx.fillStyle = enemy.color;
            }
            
            this.ctx.save();
            this.ctx.translate(enemy.x, enemy.y);
            
            if (enemy.type === 'wolf') {
                this.drawWolfSilhouette(enemy.width, enemy.height);
            } else if (enemy.type === 'deer') {
                this.drawDeerSilhouette(enemy.width, enemy.height);
            } else if (enemy.type === 'bear') {
                this.drawBearSilhouette(enemy.width, enemy.height);
            }
            
            this.ctx.restore();
            
            if (enemy.health < enemy.maxHealth) {
                let barW = enemy.width;
                let barH = 4;
                this.ctx.fillStyle = '#111827';
                this.ctx.fillRect(enemy.x, enemy.y - 10, barW, barH);
                
                this.ctx.fillStyle = '#ef4444';
                this.ctx.fillRect(enemy.x, enemy.y - 10, barW * (enemy.health / enemy.maxHealth), barH);
            }
        });
        
        // 7. Draw Fireflies (Amber Glow bugs drifting in forest)
        this.fireflies.forEach(f => {
            let glowRad = f.size * (3.5 + Math.abs(Math.sin(f.pulseVal)) * 3);
            
            this.ctx.save();
            let fireflyGrad = this.ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, glowRad);
            fireflyGrad.addColorStop(0, f.color.replace('0.85', '1'));
            fireflyGrad.addColorStop(0.3, f.color.replace('0.85', '0.45'));
            fireflyGrad.addColorStop(1, 'rgba(0,0,0,0)');
            
            this.ctx.fillStyle = fireflyGrad;
            this.ctx.beginPath();
            this.ctx.arc(f.x, f.y, glowRad, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
        
        // 8. Draw Particles (Drifting multi-colored magical forest spores!)
        this.particles.forEach(part => {
            this.ctx.fillStyle = part.color;
            this.ctx.beginPath();
            this.ctx.arc(part.x, part.y, part.size, 0, Math.PI * 2);
            this.ctx.fill();
        });
        
        // 9. Draw Player (YAHIERO - Realistic Boy jointed silhouette)
        if (!this.player.flashState) {
            this.ctx.save();
            this.ctx.translate(this.player.x, this.player.y);
            this.drawRealisticBoyPlayer();
            this.ctx.restore();
        }
        
        // 10. Draw Jewel (JEWEL - Realistic Standing Girl silhouette, in ending sequence)
        if (this.isEndingSequence) {
            this.ctx.save();
            this.ctx.translate(this.jewel.x, this.jewel.y);
            this.ctx.globalAlpha = this.jewel.opacity;
            this.drawRealisticGirlJewel();
            this.ctx.restore();
        }
        
        // 11. Draw Slashing arc
        if (this.player.isSlashing) {
            this.drawSlashVFX();
        }
        
        this.ctx.restore();
    }
    
    // Draw highly detailed Colorful Parallax Forest (Lush realistic look!)
    drawParallaxBackground() {
        // A. Far Layer (Magical purple twilight mountain peaks) - scrolls very slowly
        this.ctx.fillStyle = 'rgba(88, 28, 135, 0.28)'; // transparent violet purple peaks
        for(let i=0; i<8; i++) {
            let x = (i * 140 + this.bgOffsetFar) % (this.canvas.width + 140) - 140;
            this.drawPineSilhouette(x, this.groundY, 180, 0.85);
        }
        
        // B. Mid Layer (Dense emerald and teal green forest) - scrolls slowly
        this.ctx.fillStyle = '#064e3b'; // deep emerald teal green
        for (let i = 0; i < 10; i++) {
            let x = (i * 110 + this.bgOffsetMid) % (this.canvas.width + 110) - 110;
            let treeH = 195 + Math.sin(i * 1.5) * 35;
            this.drawPineSilhouette(x, this.groundY, treeH, 1.1);
        }
        
        // C. Foreground Layer (Thick closer lush trees with vibrant green highlights)
        this.ctx.fillStyle = '#0f766e'; // teal foreground green
        for (let i = 0; i < 4; i++) {
            let x = (i * 260 + this.bgOffsetNear) % (this.canvas.width + 260) - 260;
            this.drawPineSilhouette(x, this.groundY, 260, 1.5);
            
            // Draw detailed tree trunk
            this.ctx.fillStyle = '#062f21'; 
            this.ctx.fillRect(x - 50, 0, 12, this.groundY);
            this.ctx.fillStyle = '#0f766e';
        }
        
        // D. Forest Canopy overlay (Vibrant green/emerald leaves overlay)
        this.ctx.fillStyle = '#022c22'; // deep mossy green
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(this.canvas.width, 0);
        for (let x = 0; x <= this.canvas.width; x += 40) {
            this.ctx.quadraticCurveTo(x + 20, 20 + Math.sin(x * 0.15) * 12, x + 40, 0);
        }
        this.ctx.fill();
    }
    
    // Pine tree branch tiers
    drawPineSilhouette(x, y, h, scale) {
        this.ctx.save();
        this.ctx.translate(x, y);
        
        // Trunk
        this.ctx.fillRect(-3 * scale, -h, 6 * scale, h);
        
        // Pine branches
        let tiers = 7;
        let startY = -h * 0.2;
        let endY = -h * 0.95;
        let step = (endY - startY) / tiers;
        
        for (let i = 0; i < tiers; i++) {
            let currY = startY + i * step;
            let tierW = (h * 0.28) * (1 - (i / (tiers + 1))) * scale;
            let tierH = (h * 0.12) * scale;
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, currY + tierH);
            this.ctx.quadraticCurveTo(-tierW * 0.9, currY + tierH * 0.5, -tierW, currY);
            this.ctx.lineTo(0, currY - tierH * 0.4);
            this.ctx.lineTo(tierW, currY);
            this.ctx.quadraticCurveTo(tierW * 0.9, currY + tierH * 0.5, 0, currY + tierH);
            this.ctx.closePath();
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    // Draw realistic boy silhouette (YAHIERO)
    drawRealisticBoyPlayer() {
        let w = this.player.width;
        let h = this.player.height;
        let runCycle = (this.distance * 0.5) % (Math.PI * 2);
        
        this.ctx.fillStyle = '#000000';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        let hipX = w / 2 - 2;
        let hipY = h - 26;
        let neckX = w / 2;
        let neckY = h - 50;
        
        // Running physics limb calculations
        let runningScale = (this.player.isJumping || this.showTutorial) ? 0 : 1;
        let leftLegAngle = Math.sin(runCycle) * 0.8 * runningScale;
        let rightLegAngle = Math.sin(runCycle + Math.PI) * 0.8 * runningScale;
        
        let leftArmAngle = Math.sin(runCycle + Math.PI) * 0.7 * runningScale;
        let rightArmAngle = Math.sin(runCycle) * 0.7 * runningScale;
        
        if (this.player.isJumping) {
            leftLegAngle = -0.5;
            rightLegAngle = 0.6;
            leftArmAngle = -0.8;
            rightArmAngle = 0.9;
        }
        
        if (this.showTutorial) {
            // Standing pose during tutorial
            leftLegAngle = 0.05;
            rightLegAngle = -0.05;
            leftArmAngle = 0.1;
            rightArmAngle = 0.15;
        }

        if (this.isEndingSequence && this.player.x >= 300) {
            leftLegAngle = 0.05;
            rightLegAngle = -0.05;
            leftArmAngle = 0.1;
            rightArmAngle = 0.2;
        }

        // --- 1. BACK limbs ---
        // Back Arm
        let bElbowX = neckX + Math.sin(leftArmAngle) * 14;
        let bElbowY = neckY + 8 + Math.cos(leftArmAngle) * 14;
        let bHandX = bElbowX + Math.sin(leftArmAngle + 0.5) * 12;
        let bHandY = bElbowY + Math.cos(leftArmAngle + 0.5) * 12;
        
        this.ctx.beginPath();
        this.ctx.moveTo(neckX, neckY + 6);
        this.ctx.lineTo(bElbowX, bElbowY);
        this.ctx.lineTo(bHandX, bHandY);
        this.ctx.stroke();
        
        // Back Leg
        let bKneeX = hipX + Math.sin(leftLegAngle) * 16;
        let bKneeY = hipY + Math.cos(leftLegAngle) * 16;
        let bFootX = bKneeX + Math.sin(leftLegAngle - 0.6) * 15;
        let bFootY = bKneeY + Math.cos(leftLegAngle - 0.6) * 15;
        
        this.ctx.beginPath();
        this.ctx.moveTo(hipX, hipY);
        this.ctx.lineTo(bKneeX, bKneeY);
        this.ctx.lineTo(bFootX, bFootY);
        this.ctx.lineTo(bFootX + 5, bFootY);
        this.ctx.stroke();
        
        // --- 2. Torso and Head (BOY shape) ---
        this.ctx.beginPath();
        this.ctx.moveTo(neckX - 4, neckY);
        this.ctx.lineTo(neckX + 5, neckY + 4);
        this.ctx.lineTo(hipX + 6, hipY);
        this.ctx.lineTo(hipX - 7, hipY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Boy's head
        let headRadius = 7.5;
        let headCenterX = neckX + 1;
        let headCenterY = neckY - headRadius;
        this.ctx.beginPath();
        this.ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        // Short textured messy hair spikes
        this.ctx.beginPath();
        this.ctx.moveTo(headCenterX - 6, headCenterY - 4);
        this.ctx.lineTo(headCenterX - 9, headCenterY - 6);
        this.ctx.lineTo(headCenterX - 5, headCenterY - 7);
        this.ctx.lineTo(headCenterX - 6, headCenterY - 10);
        this.ctx.lineTo(headCenterX - 2, headCenterY - 8);
        this.ctx.lineTo(headCenterX + 2, headCenterY - 10);
        this.ctx.lineTo(headCenterX + 4, headCenterY - 6);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Glowing gaze
        this.ctx.fillStyle = 'rgba(230, 176, 15, 0.95)';
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = '#e6b00f';
        this.ctx.fillRect(headCenterX + 3, headCenterY - 2, 4, 1.8);
        this.ctx.fillStyle = '#000000';
        this.ctx.shadowBlur = 0;
        
        // --- 3. FRONT limbs ---
        // Front Leg
        let fKneeX = hipX + Math.sin(rightLegAngle) * 16;
        let fKneeY = hipY + Math.cos(rightLegAngle) * 16;
        let fFootX = fKneeX + Math.sin(rightLegAngle - 0.6) * 15;
        let fFootY = fKneeY + Math.cos(rightLegAngle - 0.6) * 15;
        
        this.ctx.beginPath();
        this.ctx.moveTo(hipX, hipY);
        this.ctx.lineTo(fKneeX, fKneeY);
        this.ctx.lineTo(fFootX, fFootY);
        this.ctx.lineTo(fFootX + 5, fFootY);
        this.ctx.stroke();
        
        // Front Arm
        let fElbowX = neckX + Math.sin(rightArmAngle) * 14;
        let fElbowY = neckY + 8 + Math.cos(rightArmAngle) * 14;
        let fHandX = fElbowX + Math.sin(rightArmAngle + 0.5) * 12;
        let fHandY = fElbowY + Math.cos(rightArmAngle + 0.5) * 12;
        
        if (this.player.isSlashing) {
            fElbowX = neckX + 15;
            fElbowY = neckY + 10;
            fHandX = fElbowX + 15;
            fHandY = fElbowY - 8;
        }
        
        this.ctx.beginPath();
        this.ctx.moveTo(neckX, neckY + 6);
        this.ctx.lineTo(fElbowX, fElbowY);
        this.ctx.lineTo(fHandX, fHandY);
        this.ctx.stroke();
        
        if (this.player.isSlashing) {
            this.ctx.strokeStyle = '#e6b00f';
            this.ctx.lineWidth = 2.5;
            this.ctx.beginPath();
            this.ctx.moveTo(fHandX, fHandY);
            this.ctx.lineTo(fHandX + 15, fHandY - 5);
            this.ctx.stroke();
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 4;
        }
    }
    
    // Draw Jewel (Girl silhouette with long flowing hair and scarf)
    drawRealisticGirlJewel() {
        let w = this.jewel.width;
        let h = this.jewel.height;
        
        this.ctx.fillStyle = '#000000';
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        let hipX = w / 2;
        let hipY = h - 26;
        let neckX = w / 2;
        let neckY = h - 50;
        
        // Standing Legs
        this.ctx.beginPath();
        this.ctx.moveTo(hipX - 2, hipY);
        this.ctx.lineTo(hipX - 6, hipY + 14);
        this.ctx.lineTo(hipX - 4, h);
        this.ctx.lineTo(hipX - 8, h);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(hipX + 2, hipY);
        this.ctx.lineTo(hipX + 2, hipY + 14);
        this.ctx.lineTo(hipX, h);
        this.ctx.lineTo(hipX - 4, h);
        this.ctx.stroke();
        
        // Torso
        this.ctx.beginPath();
        this.ctx.moveTo(neckX - 3, neckY);
        this.ctx.lineTo(neckX + 3, neckY);
        this.ctx.lineTo(hipX + 5, hipY);
        this.ctx.lineTo(hipX - 5, hipY);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Head & Flowing long hair
        let headRadius = 7;
        let headCenterX = neckX;
        let headCenterY = neckY - headRadius;
        this.ctx.beginPath();
        this.ctx.arc(headCenterX, headCenterY, headRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        let wave = Math.sin(this.jewel.hairOffset) * 2.5;
        this.ctx.beginPath();
        this.ctx.moveTo(headCenterX + 4, headCenterY - 4);
        this.ctx.quadraticCurveTo(headCenterX + 16 + wave, headCenterY + 12, headCenterX + 10 + wave, headCenterY + 30);
        this.ctx.lineTo(headCenterX - 3, headCenterY + 15);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Front arms folded
        this.ctx.beginPath();
        this.ctx.moveTo(neckX - 2, neckY + 4);
        this.ctx.lineTo(neckX - 10, neckY + 14);
        this.ctx.lineTo(neckX - 3, neckY + 22);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(neckX + 2, neckY + 4);
        this.ctx.lineTo(neckX - 8, neckY + 14);
        this.ctx.lineTo(neckX - 1, neckY + 20);
        this.ctx.stroke();
        
        // Scarf details
        this.ctx.strokeStyle = '#e6b00f'; 
        this.ctx.lineWidth = 3.5;
        
        this.ctx.beginPath();
        this.ctx.moveTo(neckX - 5, neckY + 1);
        this.ctx.lineTo(neckX + 5, neckY + 1);
        this.ctx.stroke();
        
        let tailWave1 = Math.sin(this.jewel.hairOffset * 1.2) * 4;
        let tailWave2 = Math.cos(this.jewel.hairOffset * 0.9) * 3;
        
        this.ctx.strokeStyle = 'rgba(230, 176, 15, 0.9)';
        this.ctx.lineWidth = 2.2;
        
        this.ctx.beginPath();
        this.ctx.moveTo(neckX + 2, neckY + 1);
        this.ctx.quadraticCurveTo(neckX + 20 + tailWave1, neckY + 10, neckX + 26 + tailWave1, neckY + 22);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(neckX - 1, neckY + 1);
        this.ctx.quadraticCurveTo(neckX + 15 + tailWave2, neckY + 12, neckX + 18 + tailWave2, neckY + 30);
        this.ctx.stroke();
    }
    
    drawWolfSilhouette(w, h) {
        this.ctx.fillStyle = '#000000';
        
        this.ctx.beginPath();
        this.ctx.ellipse(w/2, h - 12, w/2 - 4, h/3, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(w - 18, h - 22);
        this.ctx.lineTo(w, h - 35);
        this.ctx.lineTo(w - 5, h - 12);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(w - 12, h - 32);
        this.ctx.lineTo(w - 15, h - 42);
        this.ctx.lineTo(w - 8, h - 32);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#f43f5e'; // glowing hot pink beast eyes!
        this.ctx.shadowBlur = 6;
        this.ctx.shadowColor = '#f43f5e';
        this.ctx.beginPath();
        this.ctx.arc(w - 8, h - 28, 2, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 3.5;
        let walkCycle = (this.distance * 0.8) % (Math.PI * 2);
        
        this.ctx.beginPath();
        this.ctx.moveTo(10, h - 8);
        this.ctx.lineTo(10 + Math.sin(walkCycle) * 6, h);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(w - 15, h - 8);
        this.ctx.lineTo(w - 15 + Math.sin(walkCycle + Math.PI) * 6, h);
        this.ctx.stroke();
    }
    
    drawDeerSilhouette(w, h) {
        this.ctx.fillStyle = '#000000';
        
        this.ctx.beginPath();
        this.ctx.ellipse(w/2, h - 18, w/2 - 6, h/4, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(w - 16, h - 22);
        this.ctx.lineTo(w - 10, h - 48);
        this.ctx.lineTo(w, h - 46);
        this.ctx.lineTo(w - 8, h - 16);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2.5;
        this.ctx.beginPath();
        this.ctx.moveTo(w - 10, h - 48);
        this.ctx.lineTo(w - 14, h - 60);
        this.ctx.lineTo(w - 20, h - 63);
        this.ctx.moveTo(w - 12, h - 54);
        this.ctx.lineTo(w - 6, h - 59);
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#06b6d4'; // glowing cyan eye
        this.ctx.beginPath();
        this.ctx.arc(w - 6, h - 44, 2, 0, Math.PI*2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 2.5;
        let walkCycle = (this.distance * 0.7) % (Math.PI * 2);
        
        this.ctx.beginPath();
        this.ctx.moveTo(8, h - 12);
        this.ctx.lineTo(6 + Math.sin(walkCycle) * 8, h);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(w - 12, h - 12);
        this.ctx.lineTo(w - 14 + Math.sin(walkCycle + Math.PI) * 8, h);
        this.ctx.stroke();
    }
    
    drawBearSilhouette(w, h) {
        this.ctx.fillStyle = '#000000';
        
        this.ctx.beginPath();
        this.ctx.ellipse(w/2, h - 25, w/2 - 4, h/3, 0.05, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(w/2 - 10, h - 45, 18, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.moveTo(w - 30, h - 40);
        this.ctx.lineTo(w, h - 35);
        this.ctx.lineTo(w - 5, h - 15);
        this.ctx.lineTo(w - 40, h - 20);
        this.ctx.closePath();
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(w - 24, h - 45, 5, 0, Math.PI*2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#ef4444'; 
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#ef4444';
        this.ctx.beginPath();
        this.ctx.arc(w - 10, h - 34, 3, 0, Math.PI*2);
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        this.ctx.strokeStyle = '#000000';
        this.ctx.lineWidth = 6;
        let walkCycle = (this.distance * 0.5) % (Math.PI * 2);
        
        this.ctx.beginPath();
        this.ctx.moveTo(15, h - 15);
        this.ctx.lineTo(15 + Math.sin(walkCycle) * 4, h);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(w - 20, h - 15);
        this.ctx.lineTo(w - 20 + Math.sin(walkCycle + Math.PI) * 4, h);
        this.ctx.stroke();
    }
    
    drawSlashVFX() {
        let frame = this.player.slashAnimFrame;
        let px = this.player.x + this.player.width + 10;
        let py = this.player.y + 10;
        
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(230, 176, 15, 0.85)';
        this.ctx.shadowBlur = 12;
        this.ctx.shadowColor = '#e6b00f';
        this.ctx.lineWidth = 4 - (frame * 0.7);
        this.ctx.lineCap = 'round';
        
        this.ctx.beginPath();
        let startAngle = -Math.PI / 3;
        let endAngle = Math.PI / 3;
        
        this.ctx.arc(px - 10, py + 15, 45, startAngle, endAngle);
        this.ctx.stroke();
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        this.ctx.arc(px - 10, py + 15, 43, startAngle, endAngle);
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    animate() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        
        requestAnimationFrame(() => this.animate());
    }
    
    /* ==========================================================================
       ENDING SEQUENCE: THE CONFESSION TYPEWRITER SEQUENCE
       ========================================================================== */
    triggerEndingSequence() {
        this.isEndingSequence = true;
        this.enemies = []; // Clear beasts
        this.speedMultiplier = 0; // Stop scrolling
        
        setTimeout(() => {
            document.getElementById('game-dialog-box').classList.add('show');
            this.runDialogueSequence();
        }, 1200);
    }
    
    runDialogueSequence() {
        const dialogTextEl = document.getElementById('dialog-text');
        const speakerEl = document.getElementById('dialog-speaker');
        
        const dialogs = [
            { speaker: "YAHIERO", text: "hello... uhm.." },
            { speaker: "YAHIERO", text: "there's something you must know.." },
            { speaker: "YAHIERO", text: "<span class='jewel-glow'>jewel</span>" },
            { speaker: "YAHIERO", text: "So… can I be honest now?" },
            { speaker: "YAHIERO", text: "I like you." }
        ];
        
        const typeWriter = (text, i, fn) => {
            if (i < text.length) {
                if (text.charAt(i) === '<') {
                    let tagEnd = text.indexOf('>', i);
                    let closeTagEnd = text.indexOf('>', tagEnd + 1);
                    dialogTextEl.innerHTML = text.substring(0, closeTagEnd + 1);
                    i = closeTagEnd + 1;
                } else {
                    dialogTextEl.innerHTML = text.substring(0, i + 1);
                    i++;
                }
                
                this.dialogTimer = setTimeout(() => typeWriter(text, i, fn), 45);
            } else if (fn) {
                this.dialogTimer = setTimeout(fn, 1500);
            }
        };
        
        const nextStep = () => {
            if (this.endingStep < dialogs.length) {
                let current = dialogs[this.endingStep];
                speakerEl.textContent = current.speaker;
                dialogTextEl.innerHTML = "";
                
                typeWriter(current.text, 0, () => {
                    this.endingStep++;
                    setTimeout(nextStep, 1000);
                });
            } else {
                document.getElementById('game-next-container').classList.add('show');
            }
        };
        
        nextStep();
    }
}

window.GameEngine = GameEngine;
