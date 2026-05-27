/* ==========================================================================
   YELLOWJACKETS CONFESSION - MAIN SYSTEM CONTROL
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // SPA navigation elements
    const pages = document.querySelectorAll('.page');
    
    // Audio elements
    const audioSomeday = document.getElementById('audio-someday');
    const audioFade = document.getElementById('audio-fade');
    const audioEarrings = document.getElementById('audio-earrings');
    const audioLinger = document.getElementById('audio-linger');
    
    let currentAudio = null;
    let isMuted = true;
    
    // Game initialization hook
    let game = null;

    /* ==========================================================================
       SOUND MANAGER & AUDIO CROSSFADER
       ========================================================================== */
    function playTrack(targetAudio) {
        if (!targetAudio) return;
        
        // If track is already playing, do nothing
        if (currentAudio === targetAudio && !isMuted) {
            return;
        }

        // Crossfade function
        const fadeTransition = (outTrack, inTrack) => {
            let fadeOutInterval, fadeInInterval;
            
            // 1. Fade out active track
            if (outTrack) {
                let volumeOut = outTrack.volume;
                fadeOutInterval = setInterval(() => {
                    if (volumeOut > 0.05) {
                        volumeOut -= 0.05;
                        outTrack.volume = volumeOut;
                    } else {
                        outTrack.volume = 0;
                        outTrack.pause();
                        clearInterval(fadeOutInterval);
                    }
                }, 30);
            }
            
            // 2. Fade in target track
            inTrack.volume = 0;
            // Safari/Chrome play promise handling
            const playPromise = inTrack.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    let volumeIn = 0;
                    if (!isMuted) {
                        fadeInInterval = setInterval(() => {
                            if (volumeIn < 0.95) {
                                volumeIn += 0.05;
                                inTrack.volume = volumeIn;
                            } else {
                                inTrack.volume = 1;
                                clearInterval(fadeInInterval);
                            }
                        }, 50);
                    } else {
                        inTrack.volume = 0;
                    }
                }).catch(err => {
                    console.log("Audio autoplay prevented by browser. Activating once clicked.", err);
                });
            }
        };

        fadeTransition(currentAudio, targetAudio);
        currentAudio = targetAudio;
    }

    // Sound toggle button click
    const audioControl = document.getElementById('audio-control');
    audioControl.addEventListener('click', () => {
        isMuted = !isMuted;
        
        if (isMuted) {
            audioControl.classList.remove('audio-active');
            document.getElementById('audio-status').textContent = 'SOUND MUTED';
            if (currentAudio) currentAudio.volume = 0;
        } else {
            audioControl.classList.add('audio-active');
            document.getElementById('audio-status').textContent = 'SOUND ACTIVE';
            
            // Unmute current audio and play
            if (currentAudio) {
                currentAudio.volume = 1;
                const playPromise = currentAudio.play();
                if (playPromise !== undefined) {
                    playPromise.catch(err => console.log("Sound toggle failed:", err));
                }
            } else {
                // If on page 3 or later, start the respective page track
                const activePage = document.querySelector('.page.active').id;
                handlePageAudio(activePage);
            }
        }
    });

    function handlePageAudio(pageId) {
        if (isMuted) return; // Keep silent if muted

        switch(pageId) {
            case 'page-1':
            case 'page-2':
                // Silence or ambient forest sounds
                if (currentAudio) {
                    currentAudio.pause();
                    currentAudio = null;
                }
                break;
            case 'page-3':
                playTrack(audioSomeday);
                break;
            case 'page-4':
                playTrack(audioFade);
                break;
            case 'page-5':
                playTrack(audioEarrings);
                break;
            case 'page-6':
                playTrack(audioLinger);
                break;
        }
    }

    /* ==========================================================================
       SPA PAGE ROUTING SYSTEM WITH GLITCH VFX
       ========================================================================== */
    function transitionToPage(targetPageId) {
        // Trigger glitch screen overlay
        document.body.classList.add('glitch-screen');
        setTimeout(() => {
            document.body.classList.remove('glitch-screen');
        }, 300);

        // Hide active page
        const activePage = document.querySelector('.page.active');
        if (activePage) {
            activePage.classList.remove('active');
        }

        // Show target page
        const targetPage = document.getElementById(targetPageId);
        targetPage.classList.add('active');

        // Manage background music for the page
        handlePageAudio(targetPageId);

        // Custom actions based on page transition
        if (targetPageId === 'page-2') {
            // Start the canvas runner game
            if (!game) {
                game = new GameEngine('gameCanvas');
            }
            game.start();
        } else if (game && targetPageId !== 'page-2') {
            // Stop game when transitioning away
            game.stop();
        }
    }

    /* ==========================================================================
       FALLING FOREST ASHES / SOOT GENERATOR
       ========================================================================== */
    const ashContainer = document.getElementById('ash-container');
    function generateAshParticles() {
        const count = 35;
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.classList.add('ash-particle');
            
            // Random styling for authentic look
            const size = Math.random() * 5 + 1;
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.left = Math.random() * 100 + 'vw';
            
            // Delay and duration
            particle.style.animationDelay = Math.random() * 12 + 's';
            particle.style.animationDuration = Math.random() * 8 + 6 + 's';
            
            // Random horizontal drifts
            particle.style.setProperty('--drift-val', (Math.random() * 60 + 20) + 'px');
            
            ashContainer.appendChild(particle);
        }
    }
    generateAshParticles();

    /* ==========================================================================
       DYNAMIC POLAROID COLLAGE SPLATER & FALLBACK
       ========================================================================== */
    const themeGraphics = [
        // Theme SVGs for gorgeous out-of-box graphics
        `<svg viewBox="0 0 100 100" fill="none" stroke="#e6b00f" stroke-width="2"><path d="M 50 10 C 25 10, 10 30, 10 55 L 50 90 L 90 55 C 90 30, 75 10, 50 10 Z"/><circle cx="50" cy="30" r="8"/><path d="M 30 55 L 70 55"/></svg>`, // Wilderness symbol outline
        `<svg viewBox="0 0 100 100" fill="none" stroke="#e6b00f" stroke-width="2"><rect x="25" y="30" width="50" height="40" rx="4"/><circle cx="40" cy="50" r="6"/><circle cx="60" cy="50" r="6"/><path d="M 35 30 L 35 20 L 65 20 L 65 30"/></svg>`, // Cassette Tape
        `<svg viewBox="0 0 100 100" fill="none" stroke="#e6b00f" stroke-width="2"><path d="M 20 80 L 50 20 L 80 80 Z"/><line x1="35" y1="50" x2="65" y2="50"/></svg>`, // Forest Cabin
        `<svg viewBox="0 0 100 100" stroke="#e6b00f" fill="none" stroke-width="2"><circle cx="50" cy="50" r="35"/><line x1="50" y1="5" x2="50" y2="95"/><line x1="5" y1="50" x2="95" y2="50"/><path d="M 45 25 L 50 15 L 55 25 Z"/></svg>`, // Compass
        `<svg viewBox="0 0 100 100" stroke="#e6b00f" fill="none" stroke-width="2"><path d="M 50 85 C 50 85, 25 60, 25 40 C 25 25, 45 15, 50 30 C 55 15, 75 25, 75 40 C 75 60, 50 85, 50 85 Z"/><path d="M 45 30 L 40 10 M 55 28 L 60 8" stroke-width="3"/></svg>`, // Anatomical Heart
        `<svg viewBox="0 0 100 100" stroke="#e6b00f" fill="none" stroke-width="2"><path d="M 20 85 L 50 10 L 80 85 Z"/><path d="M 35 85 L 50 35 L 65 85 Z"/><path d="M 45 85 L 50 55 L 55 85 Z"/></svg>` // Wilderness Pines
    ];

    const polaroidData = {
        'page-3': [
            { label: "Shauna Shipman", caption: "You remind me of Shauna Shipman" },
            { label: "Sophie Nélisse", caption: "The beautiful Sophie Nélisse" },
            { label: "Shauna Shipman", caption: "" },
            { label: "Your Laugh", caption: "Stand out naturally without trying" },
            { label: "Your Energy", caption: "Your humor, energy, personality" },
            { label: "Unexpected", caption: "Nervous admitting all this" }
        ],
        'page-4': [
            { label: "Shauna Shipman", caption: "Truth always comes out eventually" },
            { label: "Sophie Nélisse", caption: "Admired you immediately in school" },
            { label: "Shauna Shipman", caption: "" },
            { label: "Sophie Nélisse", caption: "Learning the hard way" },
            { label: "Shauna Shipman", caption: "Chasing the idea of perfect love" },
            { label: "Sophie Nélisse", caption: "Completely honest this time" }
        ],
        'page-5': [
            { label: "Shauna Shipman", caption: "I respect your answer completely" },
            { label: "Sophie Nélisse", caption: "Thankful you became someone special" },
            { label: "Shauna Shipman", caption: "I don't regret liking you at all" },
            { label: "Sophie Nélisse", caption: "Whatever distance or boundaries you want" },
            { label: "Shauna Shipman", caption: "Thank you for listening to my past" },
            { label: "Sophie Nélisse", caption: "I will still wish the best for you always" }
        ],
        'page-6': [
            { label: "Shauna Shipman 🫀", caption: "Jewel Kyelle DG. Jamolin" },
            { label: "Sophie Nélisse", caption: "PLEASE DON'T TELL ANYONE YET" },
            { label: "Shauna Shipman", caption: "" },
            { label: "Sophie Nélisse", caption: "Survival and honesty" },
            { label: "Shauna Shipman", caption: "A real heartbeat confession" },
            { label: "Sophie Nélisse", caption: "Thank you for everything" }
        ]
    };

    // Stagger coordinates for scattered polaroids (3 left column, 3 right column)
    const positions = [
        // Left Column coordinates
        { left: '4%', top: '6%', rotate: '-12deg', drift: '-8px' },
        { left: '2%', top: '38%', rotate: '9deg', drift: '12px' },
        { left: '3%', top: '68%', rotate: '-6deg', drift: '-10px' },
        // Right Column coordinates
        { right: '4%', top: '8%', rotate: '14deg', drift: '8px' },
        { right: '2%', top: '40%', rotate: '-9deg', drift: '-12px' },
        { right: '3%', top: '70%', rotate: '7deg', drift: '10px' }
    ];

    function createPolaroids() {
        Object.keys(polaroidData).forEach(pageId => {
            const container = document.getElementById(`collage-${pageId}`);
            if (!container) return;

            const isStatic = container.classList.contains('static-collage');
            const dataList = polaroidData[pageId];

            dataList.forEach((data, index) => {
                const pos = positions[index];
                const frame = document.createElement('div');
                frame.classList.add('polaroid-frame');
                
                // Set positions and sways
                if (pos.left) frame.style.left = pos.left;
                if (pos.right) frame.style.right = pos.right;
                frame.style.top = pos.top;
                frame.style.setProperty('--base-rot', pos.rotate);
                frame.style.setProperty('--drift-val', pos.drift);
                frame.style.zIndex = Math.floor(Math.random() * 3) + 5; // Layer layering
                
                // Sway animation
                frame.style.animation = `swayFrame ${Math.random() * 4 + 4}s ease-in-out infinite alternate`;
                
                // Inner Image elements
                const wrapper = document.createElement('div');
                wrapper.classList.add('polaroid-img-wrapper');
                
                const img = document.createElement('img');
                img.classList.add('polaroid-img');
                img.alt = data.label;
                
                // Set standard path for photos (e.g. assets/page3_1.jpg)
                const imgNum = index + 1;
                const folderName = pageId.replace('page-', 'page'); // page3, page4...
                img.src = `assets/${folderName}_${imgNum}.jpg`;

                // Handle missing image / fallback graphic
                img.onerror = () => {
                    img.style.display = 'none';
                    const svgWrapper = document.createElement('div');
                    svgWrapper.classList.add('polaroid-svg-fallback');
                    svgWrapper.innerHTML = themeGraphics[index % themeGraphics.length];
                    wrapper.appendChild(svgWrapper);
                };

                // Polaroid Label
                const label = document.createElement('span');
                label.classList.add('polaroid-label');
                label.textContent = data.label;

                wrapper.appendChild(img);
                frame.appendChild(wrapper);
                frame.appendChild(label);
                
                // Add Lightbox interaction if not static (page 4)
                if (!isStatic) {
                    frame.addEventListener('click', () => {
                        openLightbox(img.src, data.caption, img.style.display === 'none', index);
                    });
                }
                
                container.appendChild(frame);
            });
        });
    }
    createPolaroids();

    /* ==========================================================================
       LIGHTBOX POPUP SYSTEM
       ========================================================================== */
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.getElementById('lightbox-close');

    function openLightbox(src, caption, isSvgFallback, fallbackIdx) {
        lightboxImg.style.display = 'block';
        
        // Remove existing SVGs in lightbox
        const existingSvg = lightbox.querySelector('.lightbox-content-wrapper svg');
        if (existingSvg) existingSvg.remove();

        if (isSvgFallback) {
            lightboxImg.style.display = 'none';
            const svgContainer = document.createElement('div');
            svgContainer.style.width = '300px';
            svgContainer.style.height = '300px';
            svgContainer.style.margin = '20px 0';
            svgContainer.innerHTML = themeGraphics[fallbackIdx % themeGraphics.length];
            
            // Inject styled SVG
            const wrapper = lightbox.querySelector('.lightbox-content-wrapper');
            wrapper.insertBefore(svgContainer, lightboxCaption);
        } else {
            lightboxImg.src = src;
        }

        lightboxCaption.textContent = caption;
        lightbox.classList.add('show');
    }

    lightboxClose.addEventListener('click', () => {
        lightbox.classList.remove('show');
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-content-wrapper')) {
            lightbox.classList.remove('show');
        }
    });

    /* ==========================================================================
       USER NAVIGATION DECISION PATHWAYS
       ========================================================================== */
    
    // Page 1 Play Button -> Game Screen (Page 2)
    document.getElementById('play-button').addEventListener('click', () => {
        // Trigger browser audio initialization gesture
        isMuted = false;
        audioControl.classList.add('audio-active');
        document.getElementById('audio-status').textContent = 'SOUND ACTIVE';
        
        // Go to game
        transitionToPage('page-2');
    });

    // Page 2 Game Over / Next Button -> Confession Card (Page 3)
    document.getElementById('game-next-btn').addEventListener('click', () => {
        transitionToPage('page-3');
    });

    // Page 3 Confession Card Options
    // Yes or Not Sure -> Go to Page 4 (Flaws and past)
    document.getElementById('p3-yes').addEventListener('click', () => {
        transitionToPage('page-4');
    });
    document.getElementById('p3-not-sure').addEventListener('click', () => {
        transitionToPage('page-4');
    });
    // No -> Go to Page 5 (Rejection / Honesty letter)
    document.getElementById('p3-no').addEventListener('click', () => {
        transitionToPage('page-5');
    });

    // Page 4 Flaws Card Options
    // Yes -> Go to Page 6 (Final Secret Page)
    document.getElementById('p4-yes').addEventListener('click', () => {
        transitionToPage('page-6');
    });
    // No -> Go to Page 5 (Rejection / Honesty letter)
    document.getElementById('p4-no').addEventListener('click', () => {
        transitionToPage('page-5');
    });

    // Page 5 Rejection Thank You Next Button -> Go to Page 6
    document.getElementById('p5-next').addEventListener('click', () => {
        transitionToPage('page-6');
    });

});
