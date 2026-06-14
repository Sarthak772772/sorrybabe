/* ==========================================================================
   STATE MANAGEMENT & DATA CONFIG
   ========================================================================== */
const GF_NAME = "Ayushi";

// Register GSAP plugins
gsap.registerPlugin(TextPlugin);

// Screen sequence tracker
let currentScreen = 0;

// Screen 4 (Hearts Tap) revealed states
let heartsTappedCount = 0;
const HEART_MESSAGES = [
    "I miss you. ❤️",
    "I miss your smile. 😊",
    "I miss talking to you. 💬",
    "I miss making you laugh. 😂",
    "I care about you a lot. 🌟"
];

let cardsSwipedCount = 0;

/* ==========================================================================
   WEB AUDIO API SOUND GENERATOR
   ========================================================================== */
let audioCtx = null;

function getAudioContext() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    return audioCtx;
}

function playCuteTone(type) {
    try {
        const ctx = getAudioContext();
        const now = ctx.currentTime;
        
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        if (type === 'click') {
            // Cute bubbly pop pitch rise
            osc.type = 'sine';
            osc.frequency.setValueAtTime(400, now);
            osc.frequency.exponentialRampToValueAtTime(800, now + 0.12);
            
            gain.gain.setValueAtTime(0.15, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.12);
            
            osc.start(now);
            osc.stop(now + 0.12);
        } else if (type === 'chime') {
            // Sparkling high bell tone
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(880, now);
            osc.frequency.setValueAtTime(1100, now + 0.08);
            osc.frequency.setValueAtTime(1320, now + 0.16);
            
            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.005, now + 0.35);
            
            osc.start(now);
            osc.stop(now + 0.35);
        } else if (type === 'swipe') {
            // Low pitch friction wave
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(220, now);
            osc.frequency.exponentialRampToValueAtTime(80, now + 0.2);
            
            gain.gain.setValueAtTime(0.1, now);
            gain.gain.linearRampToValueAtTime(0.01, now + 0.2);
            
            osc.start(now);
            osc.stop(now + 0.2);
        } else if (type === 'harp') {
            // Majestic rising chords
            const freqs = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
            freqs.forEach((freq, idx) => {
                const o = ctx.createOscillator();
                const g = ctx.createGain();
                o.connect(g);
                g.connect(ctx.destination);
                
                o.type = 'sine';
                o.frequency.setValueAtTime(freq, now + idx * 0.08);
                g.gain.setValueAtTime(0.08, now + idx * 0.08);
                g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.4);
                
                o.start(now + idx * 0.08);
                o.stop(now + idx * 0.08 + 0.4);
            });
        }
    } catch (e) {
        console.log("Audio synthesis error: ", e);
    }
}

/* ==========================================================================
   INITIALIZATION & BOOTSTRAP
   ========================================================================== */
window.addEventListener('DOMContentLoaded', () => {
    initThreeBackground();
    initTheme();
    initMusic();
    initCursor();
    initScreenNavigation();
});

/* ==========================================================================
   THEME SWITCH CONTROLLER
   ========================================================================== */
function initTheme() {
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;
    
    const currentTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', currentTheme);
    updateThemeIcon(currentTheme);
    
    themeToggle.addEventListener('click', () => {
        playCuteTone('click');
        const theme = html.getAttribute('data-theme');
        const newTheme = theme === 'light' ? 'dark' : 'light';
        
        html.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('#theme-toggle i');
    if (theme === 'dark') {
        icon.className = 'fa-solid fa-sun';
    } else {
        icon.className = 'fa-solid fa-moon';
    }
}

/* ==========================================================================
   MUSIC CONTROLS
   ========================================================================== */
function initMusic() {
    const musicToggle = document.getElementById('music-toggle');
    const volumeSlider = document.getElementById('volume-slider');
    const audio = document.getElementById('bg-music');
    
    audio.volume = volumeSlider.value;
    
    musicToggle.addEventListener('click', () => {
        playCuteTone('click');
        toggleMusic();
    });
    
    volumeSlider.addEventListener('input', (e) => {
        audio.volume = e.target.value;
        if (audio.volume === 0) {
            musicToggle.querySelector('i').className = 'fa-solid fa-volume-xmark';
        } else if (audio.paused) {
            musicToggle.querySelector('i').className = 'fa-solid fa-music';
        } else {
            musicToggle.querySelector('i').className = 'fa-solid fa-music fa-spin';
            audio.muted = false;
        }
    });
    
    function toggleMusic() {
        if (audio.paused) {
            audio.play().then(() => {
                musicToggle.querySelector('i').className = 'fa-solid fa-music fa-spin';
            }).catch(err => {
                console.log("Audio autoplay blocked by browser.");
            });
        } else {
            audio.pause();
            musicToggle.querySelector('i').className = 'fa-solid fa-music';
        }
    }
}

/* ==========================================================================
   CUSTOM CURSOR SYSTEM
   ========================================================================== */
let cursorX = 0, cursorY = 0;
let targetX = 0, targetY = 0;
const speed = 0.15;

function initCursor() {
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = document.getElementById('custom-cursor-dot');
    
    document.addEventListener('mousemove', (e) => {
        targetX = e.clientX;
        targetY = e.clientY;
    });
    
    function updateCursorPosition() {
        cursorX += (targetX - cursorX) * speed;
        cursorY += (targetY - cursorY) * speed;
        
        cursor.style.left = `${cursorX}px`;
        cursor.style.top = `${cursorY}px`;
        
        cursorDot.style.left = `${targetX}px`;
        cursorDot.style.top = `${targetY}px`;
        
        requestAnimationFrame(updateCursorPosition);
    }
    updateCursorPosition();
    
    // Magnet scales on clickable nodes
    function applyMagnet() {
        const clickables = document.querySelectorAll('button, a, .heart-tap-card, .envelope-wrapper, .deck-card');
        clickables.forEach(item => {
            if (!item.dataset.cursorBound) {
                item.dataset.cursorBound = "true";
                item.addEventListener('mouseenter', () => {
                    cursor.style.width = '50px';
                    cursor.style.height = '50px';
                    cursor.style.backgroundColor = 'rgba(255, 107, 139, 0.1)';
                });
                item.addEventListener('mouseleave', () => {
                    cursor.style.width = '32px';
                    cursor.style.height = '32px';
                    cursor.style.backgroundColor = 'transparent';
                });
            }
        });
    }
    applyMagnet();
    
    // Keep monitor active for new elements dynamically appended
    setInterval(applyMagnet, 1500);

    document.addEventListener('click', (e) => {
        createClickSparkles(e.clientX, e.clientY);
    });
}

function createClickSparkles(x, y) {
    for (let i = 0; i < 6; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'cursor-sparkle';
        sparkle.innerHTML = '❤️';
        sparkle.style.position = 'fixed';
        sparkle.style.left = `${x}px`;
        sparkle.style.top = `${y}px`;
        sparkle.style.pointerEvents = 'none';
        sparkle.style.zIndex = '999999';
        sparkle.style.fontSize = `${Math.random() * 8 + 8}px`;
        document.body.appendChild(sparkle);
        
        const angle = (i / 6) * Math.PI * 2;
        const velocity = Math.random() * 40 + 20;
        
        gsap.to(sparkle, {
            x: Math.cos(angle) * velocity,
            y: Math.sin(angle) * velocity - 10,
            opacity: 0,
            scale: 0.3,
            duration: 0.7,
            ease: "power2.out",
            onComplete: () => sparkle.remove()
        });
    }
}

/* ==========================================================================
   THREE.JS BACKGROUND CANVAS (AMBIENT DRIFT HEARTS)
   ========================================================================== */
function initThreeBackground() {
    const canvas = document.getElementById('three-bg');
    const scene = new THREE.Scene();
    
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 30;
    
    const renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Parametric Heart geometry
    const heartShape = new THREE.Shape();
    heartShape.moveTo(0, 0.8);
    heartShape.bezierCurveTo(0.3, 1.4, 1.2, 1.4, 1.2, 0.5);
    heartShape.bezierCurveTo(1.2, -0.3, 0.4, -0.8, 0, -1.4);
    heartShape.bezierCurveTo(-0.4, -0.8, -1.2, -0.3, -1.2, 0.5);
    heartShape.bezierCurveTo(-1.2, 1.4, -0.3, 1.4, 0, 0.8);
    
    const geometry = new THREE.ShapeGeometry(heartShape);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
    scene.add(ambientLight);
    
    const pointLight = new THREE.PointLight(0xffb7c5, 1, 100);
    pointLight.position.set(0, 0, 20);
    scene.add(pointLight);
    
    const heartCount = 30;
    const hearts = [];
    const materialColors = [0xff6b8b, 0xff8da1, 0xe0a96d, 0xdcd6f7, 0xffd1a9];
    
    for (let i = 0; i < heartCount; i++) {
        const randomColor = materialColors[Math.floor(Math.random() * materialColors.length)];
        const material = new THREE.MeshPhongMaterial({
            color: randomColor,
            side: THREE.DoubleSide,
            shininess: 70,
            transparent: true,
            opacity: Math.random() * 0.3 + 0.25
        });
        
        const mesh = new THREE.Mesh(geometry, material);
        
        resetHeart(mesh);
        mesh.position.y = Math.random() * 60 - 30;
        
        scene.add(mesh);
        hearts.push(mesh);
    }
    
    function resetHeart(mesh) {
        mesh.position.x = Math.random() * 60 - 30;
        mesh.position.y = -35;
        mesh.position.z = Math.random() * 20 - 10;
        
        const scale = Math.random() * 0.7 + 0.35;
        mesh.scale.set(scale, scale, scale);
        
        mesh.rotation.x = Math.random() * Math.PI;
        mesh.rotation.y = Math.random() * Math.PI;
        mesh.rotation.z = Math.random() * Math.PI;
        
        mesh.userData = {
            speedY: Math.random() * 0.04 + 0.015,
            rotSpeedX: Math.random() * 0.008 - 0.004,
            rotSpeedY: Math.random() * 0.008 - 0.004,
            rotSpeedZ: Math.random() * 0.008 - 0.004,
            driftFreq: Math.random() * 0.004 + 0.001,
            driftAmp: Math.random() * 0.04 + 0.01
        };
    }
    
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
    
    const clock = new THREE.Clock();
    
    function animate() {
        const time = clock.getElapsedTime();
        
        hearts.forEach(mesh => {
            mesh.position.y += mesh.userData.speedY;
            mesh.position.x += Math.sin(time * mesh.userData.driftFreq) * mesh.userData.driftAmp;
            
            mesh.rotation.x += mesh.userData.rotSpeedX;
            mesh.rotation.y += mesh.userData.rotSpeedY;
            mesh.rotation.z += mesh.userData.rotSpeedZ;
            
            if (mesh.position.y > 35) {
                resetHeart(mesh);
            }
        });
        
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================================================
   WIZARD SCREEN NAV ROUTER
   ========================================================================== */
function initScreenNavigation() {
    const totalScreens = 10;
    
    const btn0 = document.getElementById('btn-0');
    if (btn0) {
        btn0.addEventListener('click', (e) => {
            playCuteTone('click');
            
            // Spawn heart sparkles
            const rect = btn0.getBoundingClientRect();
            const btnX = rect.left + rect.width / 2;
            const btnY = rect.top + rect.height / 2;
            createClickSparkles(e.clientX || btnX, e.clientY || btnY);
            
            // Try to autoplay background music when clicking check button
            const audio = document.getElementById('bg-music');
            if (audio && audio.paused) {
                audio.play().then(() => {
                    document.getElementById('music-toggle').querySelector('i').className = 'fa-solid fa-music fa-spin';
                }).catch(e => console.log("Audio block: waiting"));
            }
            
            transitionToScreen(1);
        });
    }
    
    for (let i = 1; i <= totalScreens; i++) {
        const nextBtn = document.getElementById(`btn-${i}`);
        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                playCuteTone('click');
                
                // If moving from Screen 1, check music autoplay block helper
                if (i === 1) {
                    const audio = document.getElementById('bg-music');
                    if (audio && audio.paused) {
                        audio.play().then(() => {
                            document.getElementById('music-toggle').querySelector('i').className = 'fa-solid fa-music fa-spin';
                        }).catch(e => console.log("Audio block: waiting"));
                    }
                }
                
                transitionToScreen(i + 1);
            });
        }
    }
}

function transitionToScreen(nextIndex) {
    const currentEl = document.getElementById(`screen-${currentScreen}`);
    const nextEl = document.getElementById(`screen-${nextIndex}`);
    
    if (!nextEl) return;
    
    // GSAP Screen out transition
    gsap.to(currentEl, {
        opacity: 0,
        y: -30,
        scale: 0.95,
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
            currentEl.classList.remove('active');
            
            // Prepare next screen
            nextEl.classList.add('active');
            gsap.fromTo(nextEl, 
                { opacity: 0, y: 30, scale: 0.95 },
                { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: "power2.out" }
            );
            
            currentScreen = nextIndex;
            
            // Fire screen-specific actions
            triggerScreenAction(nextIndex);
        }
    });
}

function triggerScreenAction(screenId) {
    if (screenId === 1) {
        startScreen1Loader();
    } else if (screenId === 3) {
        startCutenessMeter();
    } else if (screenId === 4) {
        initHeartsTapBoard();
    } else if (screenId === 5) {
        initEnvelopeSurprise();
    } else if (screenId === 6) {
        initLovedCardsDeck();
    } else if (screenId === 8) {
        startApologyTypewriter();
    } else if (screenId === 9) {
        // Activate falling rose petals
        document.getElementById('rose-petals-canvas').style.display = 'block';
        initRosePetals();
    } else if (screenId === 10) {
        startFinalScreenEffects();
    }
}

/* ==========================================================================
   SCREEN 1: LOADER TIMER
   ========================================================================== */
function startScreen1Loader() {
    const loaderBar = document.querySelector('#screen-1 .loader-bar');
    const continueBtn = document.getElementById('btn-1');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 12;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
            
            // Show action button
            continueBtn.classList.add('show-action');
        }
        loaderBar.style.width = `${progress}%`;
    }, 150);
}

/* ==========================================================================
   SCREEN 3: CUTENESS METER FILL
   ========================================================================== */
function startCutenessMeter() {
    const progressCircle = document.getElementById('cuteness-progress-circle');
    const percentText = document.getElementById('cuteness-percentage');
    const msg = document.getElementById('cuteness-msg');
    const btn = document.getElementById('btn-3');
    
    // Clear initial state
    progressCircle.style.strokeDashoffset = '502';
    percentText.innerText = '0';
    msg.classList.remove('show-action');
    btn.classList.remove('show-action');
    
    const counter = { val: 0 };
    
    gsap.to(counter, {
        val: 100,
        duration: 3,
        ease: "power1.inOut",
        onUpdate: () => {
            percentText.innerText = Math.floor(counter.val);
            
            // Circle fill mapping: 502 = empty, 0 = 100% full
            const offset = 502 - (counter.val / 100) * 502;
            progressCircle.style.strokeDashoffset = offset;
        },
        onComplete: () => {
            playCuteTone('chime');
            
            // Show typewriter message and Continue button
            msg.classList.add('show-action');
            btn.classList.add('show-action');
            
            // Confetti burst
            confetti({
                particleCount: 80,
                spread: 60,
                origin: { y: 0.65 },
                colors: ['#ff6b8b', '#ff8da1', '#ffd1a9']
            });
        }
    });
}

/* ==========================================================================
   SCREEN 4: HEARTS TAP BOARD
   ========================================================================== */
function initHeartsTapBoard() {
    heartsTappedCount = 0;
    const btn = document.getElementById('btn-4');
    btn.classList.remove('show-action');
    
    const cards = document.querySelectorAll('.heart-tap-card');
    
    // Shuffle the messages array so it's fresh
    const shuffled = [...HEART_MESSAGES].sort(() => 0.5 - Math.random());
    
    cards.forEach((card, idx) => {
        card.className = "heart-tap-card"; // reset revealed
        card.querySelector('.heart-tap-text').innerText = shuffled[idx];
        
        // Remove existing listener to prevent duplicate attachment
        const newCard = card.cloneNode(true);
        card.parentNode.replaceChild(newCard, card);
        
        newCard.addEventListener('click', () => {
            if (!newCard.classList.contains('revealed')) {
                playCuteTone('chime');
                newCard.classList.add('revealed');
                
                // Add micro-spring animation
                gsap.fromTo(newCard, { scale: 0.9 }, { scale: 1.05, yoyo: true, repeat: 1, duration: 0.2 });
                
                heartsTappedCount++;
                if (heartsTappedCount === cards.length) {
                    setTimeout(() => {
                        btn.classList.add('show-action');
                        playCuteTone('harp');
                    }, 500);
                }
            }
        });
    });
}

/* ==========================================================================
   SCREEN 5: ENVELOPE SURPRISE
   ========================================================================== */
function initEnvelopeSurprise() {
    const envelope = document.getElementById('apology-envelope');
    const btn = document.getElementById('btn-5');
    const fallbackBtn = document.getElementById('fallback-open-btn');
    const tip = document.getElementById('envelope-tip');
    const modal = document.getElementById('apology-letter-modal');
    
    const sal = document.getElementById('apology-letter-sal');
    const body = document.getElementById('apology-letter-body');
    const sig = document.getElementById('apology-letter-sig');
    
    // Reset state
    envelope.classList.remove('opened');
    modal.classList.remove('show');
    btn.classList.remove('show-action');
    fallbackBtn.style.display = 'inline-flex';
    fallbackBtn.style.opacity = '1';
    tip.style.display = 'block';
    tip.style.opacity = '1';
    
    sal.style.opacity = '0';
    body.innerHTML = '';
    sig.style.opacity = '0';
    
    let opened = false;
    
    function openLetter() {
        if (opened) return;
        opened = true;
        
        playCuteTone('chime');
        envelope.classList.add('opened');
        
        // Hide tip & fallback button smoothly
        gsap.to([fallbackBtn, tip], {
            opacity: 0,
            duration: 0.4,
            onComplete: () => {
                fallbackBtn.style.display = 'none';
                tip.style.display = 'none';
            }
        });
        
        // Confetti Sparkles
        confetti({
            particleCount: 100,
            spread: 75,
            origin: { y: 0.65 },
            colors: ['#ff6b8b', '#ff7597', '#ffd1a9', '#ffffff']
        });
        
        // Spawn floating hearts around envelope area
        for (let i = 0; i < 12; i++) {
            setTimeout(() => {
                const heart = document.createElement('div');
                heart.innerHTML = '❤️';
                heart.style.position = 'fixed';
                heart.style.left = `${window.innerWidth / 2 + (Math.random() - 0.5) * 250}px`;
                heart.style.top = `${window.innerHeight / 2 + (Math.random() - 0.5) * 150}px`;
                heart.style.pointerEvents = 'none';
                heart.style.zIndex = '999999';
                heart.style.fontSize = `${Math.random() * 15 + 15}px`;
                heart.style.color = `hsl(${Math.random() * 20 + 340}, 100%, 75%)`;
                document.body.appendChild(heart);
                
                gsap.to(heart, {
                    y: -150 - Math.random() * 100,
                    x: (Math.random() - 0.5) * 100,
                    opacity: 0,
                    scale: 0.2,
                    duration: 1.6,
                    ease: "power1.out",
                    onComplete: () => heart.remove()
                });
            }, i * 100);
        }
        
        // Open modal after flap opens
        setTimeout(() => {
            modal.classList.add('show');
            playCuteTone('chime');
            
            // Apology message content with cute emojis
            const letterText = `I know things haven't been perfect lately...\n\nMaybe I made mistakes.\nMaybe I hurt your feelings without realizing it. 😔\n\nFor that, I am truly sorry. ❤️\n\nYou mean so much to me and I never want to be the reason behind your sadness. 🌷\n\nI miss your smile 😊💕\nI miss talking to you 🥺💌\nI miss the little moments we share ✨❤️\n\nNo matter what happens,\nyou will always be special to me. 💖\n\nThank you for being patient with me.\nThank you for being you. 🌹\n\nAnd if possible...\n\nCan you forgive me? 🥺❤️`;
            
            // Open Letter animations inside modal
            gsap.to(sal, {
                opacity: 1,
                duration: 0.6,
                delay: 0.3,
                onComplete: () => {
                    // Type apology body
                    gsap.to(body, {
                        duration: 15,
                        text: letterText,
                        ease: "none",
                        onComplete: () => {
                            // Fade in signature
                            gsap.to(sig, {
                                opacity: 1,
                                duration: 0.6,
                                onComplete: () => {
                                    // Unlock continue action
                                    btn.classList.add('show-action');
                                    playCuteTone('harp');
                                }
                            });
                        }
                    });
                }
            });
        }, 800);
    }
    
    // Bind click handlers
    envelope.addEventListener('click', openLetter);
    fallbackBtn.addEventListener('click', openLetter);
}

/* ==========================================================================
   SCREEN 6: THINGS I LOVE DECK
   ========================================================================== */
function initLovedCardsDeck() {
    const btn = document.getElementById('btn-6');
    const completeMsg = document.getElementById('deck-complete-msg');
    const progressEl = document.getElementById('deck-progress');
    const subtitleEl = document.getElementById('deck-subtitle');
    const deckContainer = document.getElementById('deck-container');
    
    // Reset state
    btn.classList.remove('show-action');
    completeMsg.classList.remove('show-action');
    progressEl.innerText = "Card 1 of 10 ❤️";
    progressEl.style.display = 'block';
    progressEl.style.opacity = '1';
    if (subtitleEl) {
        subtitleEl.style.display = 'block';
        subtitleEl.style.opacity = '1';
    }
    
    // Clone container to clear previous listeners upon replay
    const newContainer = deckContainer.cloneNode(true);
    deckContainer.parentNode.replaceChild(newContainer, deckContainer);
    
    const cards = newContainer.querySelectorAll('.deck-card');
    const totalCards = cards.length;
    
    // Set initial classes and styles
    cards.forEach((card, idx) => {
        card.classList.remove('active');
        gsap.set(card, { opacity: 0, scale: 0.9, y: 0 });
    });
    
    let activeIndex = 0;
    if (cards[0]) {
        cards[0].classList.add('active');
        gsap.set(cards[0], { opacity: 1, scale: 1, y: 0 });
    }
    
    let transitioning = false;
    
    cards.forEach((card, idx) => {
        card.addEventListener('click', (e) => {
            if (idx !== activeIndex || transitioning) return;
            
            transitioning = true;
            
            // Play bubble sound & spawn sparkles
            playCuteTone('click');
            
            const rect = card.getBoundingClientRect();
            const cardX = rect.left + rect.width / 2;
            const cardY = rect.top + rect.height / 2;
            const clickX = e.clientX || cardX;
            const clickY = e.clientY || cardY;
            
            createClickSparkles(clickX, clickY);
            
            // Floaty rising hearts
            for (let i = 0; i < 4; i++) {
                const heart = document.createElement('div');
                heart.innerHTML = '❤️';
                heart.style.position = 'fixed';
                heart.style.left = `${cardX + (Math.random() - 0.5) * 80}px`;
                heart.style.top = `${cardY}px`;
                heart.style.pointerEvents = 'none';
                heart.style.zIndex = '999999';
                heart.style.fontSize = `${Math.random() * 8 + 14}px`;
                document.body.appendChild(heart);
                
                gsap.to(heart, {
                    y: -120 - Math.random() * 60,
                    x: (Math.random() - 0.5) * 60,
                    opacity: 0,
                    scale: 0.5,
                    duration: 1.4,
                    ease: "power1.out",
                    onComplete: () => heart.remove()
                });
            }
            
            // Scale down and fade out current card
            gsap.to(card, {
                scale: 0.85,
                opacity: 0,
                duration: 0.35,
                ease: "power2.inOut",
                onComplete: () => {
                    card.classList.remove('active');
                    
                    activeIndex++;
                    
                    if (activeIndex < totalCards) {
                        // Load and fade in the next card
                        const nextCard = cards[activeIndex];
                        nextCard.classList.add('active');
                        progressEl.innerText = `Card ${activeIndex + 1} of ${totalCards} ❤️`;
                        
                        gsap.fromTo(nextCard, 
                            { scale: 0.9, opacity: 0 },
                            { 
                                scale: 1, 
                                opacity: 1, 
                                duration: 0.35, 
                                ease: "power2.out",
                                onComplete: () => {
                                    transitioning = false;
                                }
                            }
                        );
                    } else {
                        // After Card 10 is tapped
                        gsap.to([progressEl, subtitleEl], {
                            opacity: 0,
                            duration: 0.3,
                            onComplete: () => {
                                progressEl.style.display = 'none';
                                if (subtitleEl) subtitleEl.style.display = 'none';
                            }
                        });
                        
                        // Show success message and glowing Continue button
                        completeMsg.classList.add('show-action');
                        btn.classList.add('show-action');
                        
                        gsap.fromTo([completeMsg, btn],
                            { opacity: 0, scale: 0.9 },
                            { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
                        );
                        
                        // Play success theme sounds
                        playCuteTone('harp');
                        
                        // Confetti explosion
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: { y: 0.7 }
                        });
                        
                        transitioning = false;
                    }
                }
            });
        });
    });
}

/* ==========================================================================
   SCREEN 8: APOLOGY TYPEWRITER
   ========================================================================== */
function startApologyTypewriter() {
    const textEl = document.getElementById('apology-typewriter');
    const btn = document.getElementById('btn-8');
    
    textEl.innerHTML = '';
    textEl.className = 'typewriter-text typewriter-cursor';
    btn.classList.remove('show-action');
    
    const textBody = `No matter how upset you are...\nNo matter how much time passes...\nYou'll always be special to me.`;
    
    gsap.to(textEl, {
        duration: 5,
        text: textBody,
        ease: "none",
        onComplete: () => {
            textEl.className = 'typewriter-text'; // remove cursor blink
            btn.classList.add('show-action');
            playCuteTone('harp');
        }
    });
}

/* ==========================================================================
   FINAL SCREEN & DECISION CONFLICT
   ========================================================================== */
let finalConfettiInterval = null;

function startFinalScreenEffects() {
    // Stop any existing intervals
    if (finalConfettiInterval) clearInterval(finalConfettiInterval);
    
    // Constant slow floaty confetti bursts
    finalConfettiInterval = setInterval(() => {
        if (currentScreen !== 10) {
            clearInterval(finalConfettiInterval);
            return;
        }
        confetti({
            particleCount: 15,
            spread: 50,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
            colors: ['#ff6b8b', '#ff8da1', '#ffd1a9', '#dcd6f7']
        });
    }, 2000);
    
    // Forgive me button click
    const forgiveBtn = document.getElementById('forgive-btn');
    const restartBtn = document.getElementById('restart-btn');
    const celebrationOverlay = document.getElementById('forgiveness-celebration');
    const closeCelebrationBtn = document.getElementById('close-celebration-btn');
    
    // Remove existing event handlers
    const newForgive = forgiveBtn.cloneNode(true);
    forgiveBtn.parentNode.replaceChild(newForgive, forgiveBtn);
    
    const newRestart = restartBtn.cloneNode(true);
    restartBtn.parentNode.replaceChild(newRestart, restartBtn);
    
    newForgive.addEventListener('click', () => {
        playCuteTone('harp');
        celebrationOverlay.classList.add('show');
        
        // Massive burst confetti
        const end = Date.now() + (3 * 1000);
        (function frame() {
            confetti({
                particleCount: 5,
                angle: 60,
                spread: 55,
                origin: { x: 0 }
            });
            confetti({
                particleCount: 5,
                angle: 120,
                spread: 55,
                origin: { x: 1 }
            });
            
            if (Date.now() < end) {
                requestAnimationFrame(frame);
            }
        }());
    });
    
    newRestart.addEventListener('click', () => {
        playCuteTone('click');
        // Stop confetti loops
        if (finalConfettiInterval) clearInterval(finalConfettiInterval);
        
        // Reset and route to screen 0
        transitionToScreen(0);
    });
    
    closeCelebrationBtn.addEventListener('click', () => {
        playCuteTone('click');
        celebrationOverlay.classList.remove('show');
    });
}

/* ==========================================================================
   CANVAS ROSE PETALS DRIFTING
   ========================================================================== */
function initRosePetals() {
    const canvas = document.getElementById('rose-petals-canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    });
    
    const petalCount = 20;
    const petals = [];
    
    class Petal {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * -canvas.height;
            this.r = Math.random() * 6 + 4;
            this.d = Math.random() * petalCount;
            this.vy = Math.random() * 1.2 + 0.6;
            this.vx = Math.random() * 0.8 - 0.4;
            this.opacity = Math.random() * 0.4 + 0.3;
            const petalColors = ['#ffccd5', '#ffb3c1', '#ff8da1', '#ff7597', '#ffa3b1'];
            this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
        }
        update() {
            this.y += this.vy;
            this.x += this.vx + Math.sin(this.d + this.y * 0.01) * 0.4;
            
            if (this.y > canvas.height) {
                this.y = -20;
                this.x = Math.random() * canvas.width;
            }
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(this.x, this.y, this.r, this.r * 1.5, Math.PI / 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
    }
    
    for (let i = 0; i < petalCount; i++) {
        petals.push(new Petal());
    }
    
    function animatePetals() {
        if (currentScreen < 9) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            canvas.style.display = 'none';
            return;
        }
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        petals.forEach(p => {
            p.update();
            p.draw();
        });
        
        requestAnimationFrame(animatePetals);
    }
    animatePetals();
}
