/* =========================================
   ALLIANZAAI — SCRIPT.JS
   Interactive functionality
========================================= */

/* ---------- CUSTOM CURSOR ---------- */
const cursorDot = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');
let ringX = 0, ringY = 0;
let dotX = 0, dotY = 0;

document.addEventListener('mousemove', (e) => {
    dotX = e.clientX;
    dotY = e.clientY;
    cursorDot.style.left = dotX + 'px';
    cursorDot.style.top = dotY + 'px';
});

function lerp(a, b, t) { return a + (b - a) * t; }

function animateCursorRing() {
    ringX = lerp(ringX, dotX, 0.12);
    ringY = lerp(ringY, dotY, 0.12);
    cursorRing.style.left = ringX + 'px';
    cursorRing.style.top = ringY + 'px';
    requestAnimationFrame(animateCursorRing);
}
animateCursorRing();

// Expand ring on interactive elements
const interactiveEls = document.querySelectorAll('.interactive, button, a, input');
interactiveEls.forEach(el => {
    el.addEventListener('mouseenter', () => {
        cursorRing.classList.add('hovering');
        cursorDot.style.width = '12px';
        cursorDot.style.height = '12px';
    });
    el.addEventListener('mouseleave', () => {
        cursorRing.classList.remove('hovering');
        cursorDot.style.width = '8px';
        cursorDot.style.height = '8px';
    });
});

/* ---------- NAV SCROLL ---------- */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    if (window.scrollY > 30) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
}, { passive: true });

/* ---------- MOBILE MENU ---------- */
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');

mobileMenuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => mobileMenu.classList.remove('open'));
});

/* ---------- SCROLL REVEAL ---------- */
const revealEls = document.querySelectorAll('.reveal');
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
            // Stagger siblings
            const siblings = entry.target.parentElement.querySelectorAll('.reveal');
            let delay = 0;
            siblings.forEach((sib, idx) => {
                if (sib === entry.target) delay = idx * 120;
            });
            setTimeout(() => {
                entry.target.classList.add('visible');
            }, delay);
            revealObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ---------- HERO PHONE CHAT LOOP ---------- */
const phoneMessages = document.getElementById('phoneMessages');

const chatLoop = [
    { type: 'guest', text: "Hi! What's the WiFi password?" },
    { type: 'ai', text: "The WiFi is CozyStay2024 on network CasaVerde_5G. Let me know if it doesn't work! 😊" },
    { type: 'guest', text: "What time is check-in?" },
    { type: 'ai', text: "Check-in is from 3:00 PM onwards. Early check-in may be available — just ask! 🏠" },
    { type: 'guest', text: "Is there parking?" },
    { type: 'ai', text: "Yes! Free street parking right in front. Space for up to 2 cars 🚗" },
    { type: 'guest', text: "What time is check-out?" },
    { type: 'ai', text: "Check-out is at 11:00 AM. Late checkout (1 PM) is $25 if available. 👋" },
];

let chatIndex = 0;
let isAnimating = false;

function addPhoneMessage(type, text) {
    return new Promise(resolve => {
        if (type === 'ai') {
            // Show typing indicator first
            const typing = document.createElement('div');
            typing.className = 'phone-typing';
            typing.innerHTML = '<span></span><span></span><span></span>';
            phoneMessages.appendChild(typing);
            scrollPhoneToBottom();

            setTimeout(() => {
                typing.remove();
                const msg = document.createElement('div');
                msg.className = `phone-msg ${type === 'ai' ? 'ai-msg' : 'guest-msg'}`;
                msg.textContent = text;
                phoneMessages.appendChild(msg);
                scrollPhoneToBottom();
                resolve();
            }, 1400);
        } else {
            const msg = document.createElement('div');
            msg.className = 'phone-msg guest-msg';
            msg.textContent = text;
            phoneMessages.appendChild(msg);
            scrollPhoneToBottom();
            resolve();
        }
    });
}

function scrollPhoneToBottom() {
    phoneMessages.scrollTop = phoneMessages.scrollHeight;
}

function keepMaxMessages() {
    const msgs = phoneMessages.querySelectorAll('.phone-msg');
    if (msgs.length > 6) {
        msgs[0].remove();
    }
}

async function runChatLoop() {
    if (isAnimating) return;
    isAnimating = true;

    const pair = chatLoop[chatIndex % chatLoop.length];
    const nextAi = chatLoop[(chatIndex + 1) % chatLoop.length];

    await addPhoneMessage('guest', pair.text);
    keepMaxMessages();
    await sleep(600);
    await addPhoneMessage('ai', nextAi.text);
    keepMaxMessages();

    chatIndex += 2;
    isAnimating = false;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Kick off with first two messages immediately, then loop
(async function initChat() {
    await addPhoneMessage('guest', chatLoop[0].text);
    await sleep(600);
    await addPhoneMessage('ai', chatLoop[1].text);
    chatIndex = 2;
})();

setInterval(runChatLoop, 8000);

/* ---------- LIVE DEMO WIDGET ---------- */
const demoMessages = document.getElementById('demoMessages');
const demoInput = document.getElementById('demoInput');
const demoSend = document.getElementById('demoSend');
const demoTypingIndicator = document.getElementById('demoTyping');

const aiResponses = {
    keywords: [
        {
            keys: ['check-in', 'checkin', 'check in', 'arrive', 'arrival', 'get in', 'time in', 'when can i check'],
            response: "✅ Check-in is from **3:00 PM** onwards. If you'd like an early check-in, let us know the day before and we'll do our best to accommodate you! Come straight to the property — the code is in your booking confirmation. 🏡"
        },
        {
            keys: ['check-out', 'checkout', 'check out', 'leave', 'leaving', 'time out', 'when do i leave', 'what time do i have to leave'],
            response: "🚪 Check-out is at **11:00 AM**. Late check-out until 1:00 PM is available for $25 — just ask at least an hour before! Please make sure all keys are returned and doors are locked. 😊"
        },
        {
            keys: ['wifi', 'wi-fi', 'internet', 'password', 'network', 'connect'],
            response: "📶 WiFi Network: **CasaVerde_5G**\nPassword: **CozyStay2024**\n\nIf you have trouble connecting, try restarting the router in the living room (it's the black box near the TV). Still not working? Reply here and I'll sort it out! 😊"
        },
        {
            keys: ['park', 'parking', 'car', 'vehicle', 'drive'],
            response: "🚗 Great news — there's **free street parking** right in front of the property, no permit needed. You can park up to 2 vehicles. The spot directly in front of the white gate is ours too if you need it!"
        },
        {
            keys: ['pet', 'pets', 'dog', 'cat', 'animal', 'bring my'],
            response: "🐾 We do have a **pet-friendly** policy for well-behaved dogs and cats. A small pet fee of $25 per stay applies. Please keep pets off the furniture and clean up after them in the yard. Let us know how many pets you're bringing!"
        },
        {
            keys: ['restaurant', 'eat', 'food', 'dinner', 'lunch', 'breakfast', 'nearby', 'local', 'recommend'],
            response: "🍽️ Here are some of our favorite local spots:\n\n• **The Corner Bistro** (5 min walk) — amazing brunch\n• **Casa Morena** (8 min walk) — best tacos in town\n• **The Rooftop** (10 min drive) — great cocktails + views\n• **Green Bowl** (nearby) — fresh & healthy options\n\nHappy to share more or help with reservations! 🌟"
        },
        {
            keys: ['late checkout', 'late check-out', 'late check out', 'stay longer', 'extra time', 'extend'],
            response: "⏰ Late check-out until **1:00 PM** is available for **$25**. We'll need to confirm based on the next guest's arrival time — just ask us at least an hour before 11 AM and we'll let you know right away!"
        },
        {
            keys: ['early check', 'early in', 'come early', 'before 3'],
            response: "🌅 We'll try our best with early check-in! It depends on the previous guest's checkout. If you let us know the day before, we can often have the room ready by 1–2 PM. Standard early check-in fee is $20. We'll confirm by morning! 😊"
        },
        {
            keys: ['lockbox', 'key', 'door code', 'access', 'entry', 'get in', 'locked out', 'lock'],
            response: "🔑 Your lockbox code is **4829** — it's the silver box by the main front door. Turn the handle down after entering the code. Once you're in, we recommend locking the door from inside. Let me know if you have any trouble!"
        },
        {
            keys: ['heating', 'heat', 'cold', 'warm', 'ac', 'air conditioning', 'thermostat', 'temperature'],
            response: "🌡️ The thermostat is in the hallway — set it to your preferred temperature! We keep it at 68°F by default. In winter, there's also a cozy electric fireplace in the living room. Just press the remote button on the mantle! 🔥"
        },
        {
            keys: ['hello', 'hi', 'hey', 'good morning', 'good evening', 'howdy', 'greetings'],
            response: "👋 Hello! Welcome to the property — so excited to have you! I'm AllianzaAI, your 24/7 AI assistant. I can answer questions about check-in/out, WiFi, parking, local spots, and anything else about your stay. What can I help you with? 😊"
        },
        {
            keys: ['thank', 'thanks', 'thx', 'ty', 'appreciate', 'helpful', 'great', 'perfect', 'awesome'],
            response: "You're so welcome! 🌟 It's my pleasure to help make your stay amazing. Feel free to ask anything else — I'm here 24/7! Enjoy your stay! ❤️"
        }
    ],
    fallback: "That's a great question! This specific topic would be best handled by the host directly. I've flagged your message and the host will follow up with you shortly — usually within a few minutes. In the meantime, is there anything else I can help with? 😊"
};

function getAIResponse(userMsg) {
    const lower = userMsg.toLowerCase().trim();
    for (const item of aiResponses.keywords) {
        if (item.keys.some(k => lower.includes(k))) {
            return item.response;
        }
    }
    return aiResponses.fallback;
}

function formatMessage(text) {
    // Simple markdown: **bold**
    return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
}

function addDemoMessage(type, text) {
    return new Promise(resolve => {
        const msgEl = document.createElement('div');
        msgEl.className = `demo-msg ${type}-msg`;
        const bubble = document.createElement('div');
        bubble.className = 'msg-bubble';
        bubble.innerHTML = formatMessage(text);
        msgEl.appendChild(bubble);
        demoMessages.appendChild(msgEl);
        demoMessages.scrollTop = demoMessages.scrollHeight;
        resolve();
    });
}

async function handleDemoSend(userText) {
    if (!userText.trim()) return;
    demoInput.value = '';

    await addDemoMessage('guest', userText);

    // Show typing indicator
    demoTypingIndicator.style.display = 'flex';
    demoMessages.scrollTop = demoMessages.scrollHeight;

    await sleep(1300);

    demoTypingIndicator.style.display = 'none';

    const response = getAIResponse(userText);
    await addDemoMessage('ai', response);
    demoMessages.scrollTop = demoMessages.scrollHeight;
}

demoSend.addEventListener('click', () => {
    handleDemoSend(demoInput.value);
});

demoInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleDemoSend(demoInput.value);
});

// Chip clicks
document.querySelectorAll('.chip').forEach(chip => {
    chip.addEventListener('click', () => {
        const msg = chip.getAttribute('data-msg');
        handleDemoSend(msg);
    });
});

/* ---------- LIVE COUNTER COUNTER ANIMATION ---------- */
let liveCount = 1847;
const liveCountEl = document.getElementById('liveCount');

setInterval(() => {
    liveCount += Math.floor(Math.random() * 3) + 1;
    if (liveCountEl) {
        liveCountEl.textContent = liveCount.toLocaleString();
    }
}, 3000);

/* ---------- SMOOTH ANCHOR LINKS ---------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        const target = document.querySelector(targetId);
        if (target) {
            e.preventDefault();
            const navHeight = 72;
            const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight;
            window.scrollTo({ top: targetPosition, behavior: 'smooth' });
        }
    });
});

/* ---------- HERO SECTION PARALLAX (subtle) ---------- */
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const blobs = document.querySelectorAll('.blob');
    blobs.forEach((blob, i) => {
        const speed = (i + 1) * 0.04;
        blob.style.transform = `translateY(${scrollY * speed}px)`;
    });
}, { passive: true });

/* ---------- ACTIVE NAV LINK HIGHLIGHT ---------- */
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');

function updateActiveLink() {
    const scrollY = window.scrollY + 100;
    let currentSection = '';

    sections.forEach(section => {
        const top = section.offsetTop;
        const height = section.offsetHeight;
        if (scrollY >= top && scrollY < top + height) {
            currentSection = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        const href = link.getAttribute('href').replace('#', '');
        if (href === currentSection) {
            link.style.color = 'var(--primary)';
        } else {
            link.style.color = '';
        }
    });
}

window.addEventListener('scroll', updateActiveLink, { passive: true });

/* ---------- INPUT CURSOR FIX ---------- */
// Re-enable normal cursor for inputs
document.querySelectorAll('input, textarea').forEach(el => {
    el.style.cursor = 'text';
    el.addEventListener('mouseenter', () => {
        cursorDot.style.opacity = '0';
        cursorRing.style.opacity = '0';
    });
    el.addEventListener('mouseleave', () => {
        cursorDot.style.opacity = '1';
        cursorRing.style.opacity = '1';
    });
});

/* ---------- HERO BADGE ENTRANCE ---------- */
window.addEventListener('load', () => {
    document.querySelector('.hero-badge')?.classList.add('visible');
    document.querySelectorAll('.hero-text .reveal, .hero-visual .reveal').forEach((el, i) => {
        setTimeout(() => el.classList.add('visible'), 200 + i * 150);
    });
});

console.log('%c AllianzaAI ', 'background: #e63030; color: white; padding: 6px 12px; border-radius: 4px; font-size: 14px; font-weight: bold;', '\nThe AI guest experience layer for Airbnb hosts.\nhttps://allianzaai.com');
