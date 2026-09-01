/* ============================================================
   ANUPAMA & SHYNE — WEDDING INVITATION
   Vanilla JS — gate intro, countdown, scroll reveals
   ============================================================ */
(function () {
  "use strict";

  var gate = document.getElementById("gate");
  var gateButton = document.getElementById("gateButton");
  var invitation = document.getElementById("invitation");
  var scrollCue = document.getElementById("scrollCue");

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Open the gate → reveal invitation ---------- */
  function openGate() {
    if (!gate) return;

    // Start fading the gate out
    gate.classList.add("is-open");

    // Reveal the invitation immediately — it starts at opacity:0 and
    // cross-fades in via CSS transition, perfectly overlapping the gate fade.
    // This eliminates the white/dark gap between screens.
    window.setTimeout(function () {
      invitation.classList.add("is-visible");
      invitation.setAttribute("aria-hidden", "false");
      document.body.classList.remove("locked");

      // move focus into the invitation for accessibility
      var hero = document.getElementById("hero");
      if (hero) hero.setAttribute("tabindex", "-1");
      if (hero) hero.focus({ preventScroll: true });
    }, prefersReducedMotion ? 50 : 0);
  }

  if (gateButton) {
    document.body.classList.add("locked");
    gateButton.addEventListener("click", openGate);
    gateButton.addEventListener("keyup", function (e) {
      if (e.key === "Enter" || e.key === " ") openGate();
    });
  }

  if (scrollCue) {
    scrollCue.addEventListener("click", function () {
      var ayah = document.getElementById("ayah");
      if (ayah) ayah.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Countdown timer ---------- */
  // Wedding date: 12 September 2026, 5:30 PM Onwards
  var WEDDING_DATE = new Date("2026-09-12T17:30:00");

  var elDays = document.getElementById("cd-days");
  var elHours = document.getElementById("cd-hours");
  var elMins = document.getElementById("cd-mins");
  var elSecs = document.getElementById("cd-secs");

  function pad(n) {
    return String(n).padStart(2, "0");
  }

  function setCountdownNum(el, value) {
    if (!el || el.textContent === value) return;
    el.textContent = value;
    if (prefersReducedMotion) return;
    el.classList.remove("countdown__num--pulse");
    // force reflow so the animation can restart on rapid updates
    void el.offsetWidth;
    el.classList.add("countdown__num--pulse");
  }

  function tickCountdown() {
    var now = new Date();
    var diff = WEDDING_DATE.getTime() - now.getTime();

    if (diff <= 0) {
      setCountdownNum(elDays,  "00");
      setCountdownNum(elHours, "00");
      setCountdownNum(elMins,  "00");
      setCountdownNum(elSecs,  "00");
      return;
    }

    var days  = Math.floor(diff / (1000 * 60 * 60 * 24));
    var hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    var mins  = Math.floor((diff / (1000 * 60)) % 60);
    var secs  = Math.floor((diff / 1000) % 60);

    setCountdownNum(elDays,  pad(days));
    setCountdownNum(elHours, pad(hours));
    setCountdownNum(elMins,  pad(mins));
    setCountdownNum(elSecs,  pad(secs));
  }

  if (elDays && elHours && elMins && elSecs) {
    tickCountdown();
    window.setInterval(tickCountdown, 1000);
  }

  /* ---------- Gentle parallax on hero glyph (respects reduced motion) ---------- */
  var topGlyph = document.querySelector(".glyph--top");

  if (!prefersReducedMotion && topGlyph) {
    window.addEventListener(
      "scroll",
      function () {
        var y = window.scrollY;
        topGlyph.style.transform = "translateY(" + Math.min(y * 0.08, 30) + "px)";
      },
      { passive: true }
    );
  }

  /* ---------- Elegant scroll progress line ---------- */
  var progressBar = document.getElementById("scrollProgressBar");
  function updateProgress() {
    if (!progressBar) return;
    var scrollTop = window.scrollY;
    var docHeight = document.documentElement.scrollHeight - window.innerHeight;
    var pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = pct + "%";
  }
  window.addEventListener("scroll", updateProgress, { passive: true });
  window.addEventListener("resize", updateProgress);
  updateProgress();

  /* ---------- Subtle desktop-only hero parallax (background drifts slower than scroll) ---------- */
  var heroSection = document.querySelector(".hero");
  var desktopQuery = window.matchMedia("(min-width: 900px)");

  if (!prefersReducedMotion && heroSection) {
    window.addEventListener(
      "scroll",
      function () {
        if (!desktopQuery.matches) return;
        var offset = Math.min(window.scrollY * 0.15, 80);
        heroSection.style.backgroundPosition = "center calc(50% + " + offset + "px)";
      },
      { passive: true }
    );
  }

  /* ---------- Background music ---------- */
  var audio     = document.getElementById("bg-music");
  var muteBtn   = document.getElementById("mute-btn");
  var iconSound = document.getElementById("icon-sound");
  var iconMuted = document.getElementById("icon-muted");

  var musicStarted = false;

  function setMuteIcon(playing) {
    if (iconSound) iconSound.style.display = playing ? "" : "none";
    if (iconMuted) iconMuted.style.display = playing ? "none" : "";
  }

  function startMusic() {
    if (musicStarted || !audio) return;
    audio.volume = 0.45;
    audio.play().then(function () {
      musicStarted = true;
      setMuteIcon(true);
    }).catch(function () {
      // Browser blocked autoplay — muted icon stays, user can tap the button
    });
  }

  // Try immediate autoplay on load (works on some browsers / after reload)
  window.addEventListener("load", function () {
    startMusic();
  });

  // Fallback: start on first user interaction (gate button click counts)
  document.addEventListener("click",      startMusic, { once: true });
  document.addEventListener("touchstart", startMusic, { once: true });
  document.addEventListener("scroll",     startMusic, { once: true });

  // Mute / unmute toggle
  if (muteBtn && audio) {
    muteBtn.addEventListener("click", function (e) {
      e.stopPropagation(); // don't double-trigger startMusic via document click
      if (!musicStarted) {
        startMusic();
        return;
      }
      if (audio.paused) {
        audio.play();
        setMuteIcon(true);
      } else {
        audio.pause();
        setMuteIcon(false);
      }
    });
  }

  /* ---------- RSVP — attendance toggle, counter, and Google Sheet submission ---------- */
  (function () {
    var form     = document.getElementById("rsvpForm");
    if (!form) return;

    var btnYes   = document.getElementById("btnYes");
    var btnNo    = document.getElementById("btnNo");
    var minusBtn = document.getElementById("rsvpMinus");
    var plusBtn  = document.getElementById("rsvpPlus");
    var countEl  = document.getElementById("rsvpCount");
    var nameEl   = document.getElementById("rsvpName");
    var msgEl    = document.getElementById("rsvpMessage");

    // Paste the "Web app" URL you get after deploying the Apps Script
    // (see google-apps-script/Code.gs + SETUP_RSVP.md) here:
    var SHEET_ENDPOINT = "https://script.google.com/macros/s/AKfycbwBX6jG0cGceU6zNVjEQtFRLxfAdm6YD_dk7jtEcehktz81XdGRaIUQig-p6DyWQcfQOQ/exec";

    function submitToSheet(data) {
      if (!SHEET_ENDPOINT || SHEET_ENDPOINT.indexOf("PASTE_") === 0) {
        return Promise.resolve();
      }
      var body = new URLSearchParams(data);

      // Google Apps Script web apps don't send back CORS headers, so the
      // browser can never let us read the response (mode: 'cors' will
      // always fail here, even when the row is written successfully).
      // 'no-cors' is the standard, reliable way to POST to Apps Script:
      // it's fire-and-forget, but the request — and therefore doPost() —
      // still goes through.
      return fetch(SHEET_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        body: body.toString()
      }).catch(function (error) {
        // Only a genuine network failure (offline, blocked domain, etc.)
        // lands here — a successful write never reaches this branch.
        console.error("RSVP submission failed:", error);
      });
    }

    // ---- attendance toggle ----
    function setAttendance(attending) {
      if (btnYes) btnYes.classList.toggle("is-selected",  attending);
      if (btnNo)  btnNo.classList.toggle("is-selected",  !attending);
      if (btnYes) btnYes.querySelector("input").checked =  attending;
      if (btnNo)  btnNo.querySelector("input").checked  = !attending;
    }
    setAttendance(true); // default: yes

    if (btnYes) btnYes.addEventListener("click", function () { setAttendance(true);  });
    if (btnNo)  btnNo.addEventListener("click",  function () { setAttendance(false); });

    // ---- counter ----
    if (minusBtn) {
      minusBtn.addEventListener("click", function () {
        var v = parseInt(countEl.value, 10);
        if (v > 1) countEl.value = v - 1;
      });
    }
    if (plusBtn) {
      plusBtn.addEventListener("click", function () {
        var v = parseInt(countEl.value, 10);
        if (v < 10) countEl.value = v + 1;
      });
    }

    // ---- submit RSVP to Google Sheets ----
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // validate name
      var name = nameEl ? nameEl.value.trim() : "";
      if (!name) {
        if (nameEl) {
          nameEl.classList.add("is-error");
          nameEl.focus();
        }
        return;
      }
      if (nameEl) nameEl.classList.remove("is-error");

      var attending = btnYes ? btnYes.classList.contains("is-selected") : true;
      var count     = countEl ? (parseInt(countEl.value, 10) || 1) : 1;
      var message   = msgEl ? msgEl.value.trim() : "";

      // Save the RSVP to the Google Sheet (also emails the family)
      submitToSheet({
        name: name,
        attending: attending ? "Yes" : "No",
        guests: attending ? count : 0,
        message: message
      }).then(function () {
        form.reset();
        setAttendance(true);
        if (countEl) countEl.value = "1";
        if (nameEl) nameEl.value = "";
        if (msgEl) msgEl.value = "";
        window.alert("Thank you! Your RSVP has been submitted.");
      });
    });

    // clear error state on input
    if (nameEl) {
      nameEl.addEventListener("input", function () {
        nameEl.classList.remove("is-error");
      });
    }
  }());

})();

/* ==========================================================================
   Floating Flowers — full-viewport falling petal animation
   Vanilla JS · no dependencies
   ========================================================================== */

function initFloatingFlowers() {
  var container = document.getElementById("floating-flowers");
  if (!container) return;

  // Respect user's motion preference — skip entirely
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  // Color palette — delicate lotus, blush, and rose gold tones matching desktop.png
  var colors = [
    "#E86A8D", // lotus pink
    "#F498B2", // soft lotus rose
    "#FADBE2", // pale blush
    "#D47A94", // rose gold
    "#FFF5F7", // petal white
    "#C44D74", // vibrant lotus
  ];

  // Fewer petals on smaller screens for performance
  var w = window.innerWidth;
  var PETAL_COUNT = w < 640 ? 6 : w < 1024 ? 9 : 14;

  function rand(min, max) {
    return min + Math.random() * (max - min);
  }

  function flowerSVG(color) {
    // 5-petal flower: each petal is an ellipse rotated around the centre
    return '<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">'
      + '<g fill="' + color + '">'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" opacity="0.9"/>'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(72 20 20)" opacity="0.9"/>'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(144 20 20)" opacity="0.9"/>'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(216 20 20)" opacity="0.9"/>'
      + '<ellipse cx="20" cy="10" rx="6" ry="10" transform="rotate(288 20 20)" opacity="0.9"/>'
      + '<circle cx="20" cy="20" r="4.5" fill="#FFF5F7"/>'
      + '</g></svg>';
  }

  for (var i = 0; i < PETAL_COUNT; i++) {
    var petal    = document.createElement("div");
    petal.className = "flower-petal";

    var size     = rand(12, 26);          // px
    var duration = rand(16, 28);          // seconds per full loop
    var delay    = -rand(0, duration);    // negative = already mid-animation on page load
    var color    = colors[Math.floor(Math.random() * colors.length)];
    var opacity  = rand(0.45, 0.80);

    petal.style.width             = size.toFixed(0) + "px";
    petal.style.height            = size.toFixed(0) + "px";
    petal.style.left              = rand(0, 100).toFixed(1) + "%";
    petal.style.animationDuration = duration.toFixed(1) + "s";
    petal.style.animationDelay   = delay.toFixed(1) + "s";
    petal.style.setProperty("--op", opacity.toFixed(2));

    petal.innerHTML = flowerSVG(color);
    container.appendChild(petal);
  }
}

document.addEventListener("DOMContentLoaded", initFloatingFlowers);

/* ==========================================================================
   Gate — Interactive enhancements
   · Letter-by-letter name stagger
   · Mouse / touch parallax on the background layer
   · Gold particle canvas (twinkling stars)
   · Button click ripple
   ========================================================================== */

(function () {
  "use strict";

  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ------------------------------------------------------------------
     1. LETTER STAGGER — split "Anupama" and "Shyne" into individual
        <span class="gate__letter"> elements and animate each in with
        a cascading delay.
  ------------------------------------------------------------------ */
  function buildLetters(containerId, word, baseDelay) {
    var el = document.getElementById(containerId);
    if (!el) return;
    el.innerHTML = "";
    for (var i = 0; i < word.length; i++) {
      var span = document.createElement("span");
      span.className = "gate__letter";
      span.textContent = word[i] === " " ? "\u00A0" : word[i];
      // stagger: each letter 60 ms after the previous
      var delay = baseDelay + i * 0.06;
      span.style.animationDelay = delay.toFixed(2) + "s";
      el.appendChild(span);
    }
  }

  // name 1 starts at 1.9 s, name 2 starts at 2.6 s
  buildLetters("gateName1", "Anupama", 1.9);
  buildLetters("gateName2", "Shyne",   2.6);

  // After all letters have landed, add the subtle heartbeat glow
  var namesEl = document.querySelector(".gate__names");
  if (namesEl && !reduced) {
    window.setTimeout(function () {
      namesEl.classList.add("is-beating");
    }, 4000);
  }

  /* ------------------------------------------------------------------
     2. MOUSE / TOUCH PARALLAX — the .gate__parallax layer shifts
        subtly opposite to cursor position, giving a 3-D depth feel.
  ------------------------------------------------------------------ */
  var parallaxLayer = document.getElementById("gateParallax");
  var gate          = document.getElementById("gate");

  if (parallaxLayer && gate && !reduced) {
    // Reveal the parallax layer once page is loaded
    window.setTimeout(function () {
      parallaxLayer.classList.add("is-ready");
    }, 600);

    var tX = 0, tY = 0;   // target offsets
    var cX = 0, cY = 0;   // current (lerped) offsets
    var rafId = null;
    var MAX   = 14;        // max pixel shift

    function lerp(a, b, t) { return a + (b - a) * t; }

    function tickParallax() {
      cX = lerp(cX, tX, 0.06);
      cY = lerp(cY, tY, 0.06);
      parallaxLayer.style.transform =
        "translate3d(" + cX.toFixed(2) + "px," + cY.toFixed(2) + "px,0)";
      rafId = requestAnimationFrame(tickParallax);
    }
    rafId = requestAnimationFrame(tickParallax);

    function onMouseMove(e) {
      var cx = window.innerWidth  / 2;
      var cy = window.innerHeight / 2;
      tX = ((e.clientX - cx) / cx) * -MAX;
      tY = ((e.clientY - cy) / cy) * -MAX;
    }

    function onTouchMove(e) {
      if (!e.touches.length) return;
      var cx = window.innerWidth  / 2;
      var cy = window.innerHeight / 2;
      tX = ((e.touches[0].clientX - cx) / cx) * -(MAX * 0.5);
      tY = ((e.touches[0].clientY - cy) / cy) * -(MAX * 0.5);
    }

    gate.addEventListener("mousemove",  onMouseMove,  { passive: true });
    gate.addEventListener("touchmove",  onTouchMove,  { passive: true });

    // stop the RAF once gate is opened to save resources
    var gateBtn = document.getElementById("gateButton");
    if (gateBtn) {
      gateBtn.addEventListener("click", function () {
        cancelAnimationFrame(rafId);
        gate.removeEventListener("mousemove", onMouseMove);
        gate.removeEventListener("touchmove",  onTouchMove);
      }, { once: true });
    }
  }

  /* ------------------------------------------------------------------
     3. GOLD PARTICLE CANVAS — tiny glowing gold dots that twinkle
        independently, layered behind the content.
  ------------------------------------------------------------------ */
  var canvas = document.getElementById("gateCanvas");
  if (canvas && !reduced) {
    var ctx    = canvas.getContext("2d");
    var COLORS = ["rgba(232,106,141,", "rgba(244,152,178,", "rgba(255,220,230,", "rgba(212,122,148,"];
    var particles = [];
    var animFrameId;

    function resizeCanvas() {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas, { passive: true });

    // spawn a single particle at a random position
    function makeParticle() {
      return {
        x:       Math.random() * canvas.width,
        y:       Math.random() * canvas.height,
        r:       0.6 + Math.random() * 1.8,        // radius 0.6–2.4 px
        alpha:   0,
        maxAlpha:0.25 + Math.random() * 0.55,
        speed:   0.004 + Math.random() * 0.008,    // fade speed
        phase:   Math.random() * Math.PI * 2,      // sine offset
        color:   COLORS[Math.floor(Math.random() * COLORS.length)]
      };
    }

    // populate: fewer on mobile
    var COUNT = window.innerWidth < 640 ? 55 : window.innerWidth < 1024 ? 90 : 140;
    for (var i = 0; i < COUNT; i++) {
      var p = makeParticle();
      p.phase = Math.random() * Math.PI * 2;
      particles.push(p);
    }

    function drawParticles(time) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      var t = time * 0.001;
      for (var j = 0; j < particles.length; j++) {
        var pt = particles[j];
        // sine-driven alpha gives a natural twinkle
        pt.alpha = pt.maxAlpha * (0.5 + 0.5 * Math.sin(t * pt.speed * 60 + pt.phase));
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2);
        ctx.fillStyle = pt.color + pt.alpha.toFixed(3) + ")";
        ctx.fill();

        // occasional soft glow halo on larger particles
        if (pt.r > 1.4) {
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.r * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = pt.color + (pt.alpha * 0.18).toFixed(3) + ")";
          ctx.fill();
        }
      }
      animFrameId = requestAnimationFrame(drawParticles);
    }
    animFrameId = requestAnimationFrame(drawParticles);

    // stop canvas when gate closes
    var gateBtnForCanvas = document.getElementById("gateButton");
    if (gateBtnForCanvas) {
      gateBtnForCanvas.addEventListener("click", function () {
        window.setTimeout(function () {
          cancelAnimationFrame(animFrameId);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
        }, 1600);
      }, { once: true });
    }
  }

  /* ------------------------------------------------------------------
     4. BUTTON RIPPLE — on click, inject a .gate__ripple element that
        expands outward from the exact click/touch point.
  ------------------------------------------------------------------ */
  var gateButtonEl = document.getElementById("gateButton");
  if (gateButtonEl && !reduced) {
    gateButtonEl.addEventListener("click", function (e) {
      var rect   = gateButtonEl.getBoundingClientRect();
      var size   = Math.max(rect.width, rect.height);
      var x      = (e.clientX || rect.left + rect.width  / 2) - rect.left - size / 2;
      var y      = (e.clientY || rect.top  + rect.height / 2) - rect.top  - size / 2;
      var ripple = document.createElement("span");
      ripple.className = "gate__ripple";
      ripple.style.cssText =
        "width:" + size + "px;height:" + size + "px;left:" + x + "px;top:" + y + "px;";
      gateButtonEl.appendChild(ripple);
      // clean up after animation
      window.setTimeout(function () {
        if (ripple.parentNode) ripple.parentNode.removeChild(ripple);
      }, 750);
    });
  }

}());

/* ==========================================================================
   SCRATCH-TO-REVEAL HEART + CONFETTI POPPERS
   ========================================================================== */
(function () {
  "use strict";

  var canvas     = document.getElementById("scratchCanvas");
  var hint       = document.getElementById("scratchHint");
  var subText    = document.getElementById("scratchSub");
  var confCanvas = document.getElementById("confettiCanvas");

  if (!canvas || !confCanvas) return;

  var W = 380, H = 400;
  canvas.width  = W;
  canvas.height = H;
  confCanvas.width  = window.innerWidth;
  confCanvas.height = window.innerHeight;

  window.addEventListener("resize", function () {
    confCanvas.width  = window.innerWidth;
    confCanvas.height = window.innerHeight;
  });

  var ctx = canvas.getContext("2d");

  /* ── Paint scratch surface (gold gradient + label) ── */
  function paintScratchSurface() {
    ctx.clearRect(0, 0, W, H);

    // Solid luxury rose gold & pink fill
    var bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0,    "#FADBE2");
    bg.addColorStop(0.3,  "#E8A5B6");
    bg.addColorStop(0.65, "#D47A94");
    bg.addColorStop(1,    "#A84A68");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // Subtle luxury diagonal highlight
    var shine = ctx.createLinearGradient(W * 0.15, H * 0.05, W * 0.65, H * 0.6);
    shine.addColorStop(0,   "rgba(255,245,247,0)");
    shine.addColorStop(0.45,"rgba(255,245,247,0.25)");
    shine.addColorStop(1,   "rgba(255,245,247,0)");
    ctx.fillStyle = shine;
    ctx.fillRect(0, 0, W, H);

    // "✦ SCRATCH TO REVEAL ✦" label
    ctx.fillStyle = "rgba(90, 26, 46, 0.92)";
    ctx.font = '600 13px "Cinzel", serif';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("✦  SCRATCH TO REVEAL  ✦", W / 2, H * 0.42);

    // Heart ♡ hint
    ctx.fillStyle = "rgba(90, 26, 46, 0.55)";
    ctx.font = "32px serif";
    ctx.fillText("♡", W / 2, H * 0.58);
  }

  paintScratchSurface();
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (!started && !revealed) paintScratchSurface();
    });
  }

  var isDrawing = false;
  var brushR    = 42;
  var revealed  = false;
  var started   = false;

  function getPos(e, el) {
    var r = el.getBoundingClientRect();
    var t = e.touches ? e.touches[0] : e;
    var scaleX = W / r.width;
    var scaleY = H / r.height;
    return {
      x: (t.clientX - r.left) * scaleX,
      y: (t.clientY - r.top)  * scaleY
    };
  }

  var scratchReveal = document.getElementById("scratchReveal");

  function scratch(e) {
    if (!isDrawing) return;
    if (scratchReveal && !scratchReveal.classList.contains("revealing")) {
      scratchReveal.classList.add("revealing");
    }
    var p = getPos(e, canvas);

    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    ctx.beginPath();
    ctx.arc(p.x, p.y, brushR, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    if (!started) {
      started = true;
      if (hint) hint.classList.add("hidden");
    }

    checkReveal();
  }

  function checkReveal() {
    if (revealed) return;
    var data   = ctx.getImageData(0, 0, W, H).data;
    var total  = 0, transparent = 0;
    for (var i = 3; i < data.length; i += 4) {
      total++;
      if (data[i] < 128) transparent++;
    }
    if (transparent / total > 0.45) {
      revealed = true;
      if (scratchReveal) scratchReveal.classList.add("revealed");
      // Wipe remaining canvas smoothly
      setTimeout(function () {
        ctx.clearRect(0, 0, W, H);
      }, 250);

      if (subText) {
        setTimeout(function () {
          subText.textContent = "✦ You're Invited to Celebrate with Us ✦";
          subText.classList.add("revealed");
        }, 500);
      }

      // Fire confetti!
      setTimeout(launchConfetti, 350);
    }
  }

  canvas.addEventListener("mousedown",  function (e) { isDrawing = true; scratch(e); });
  canvas.addEventListener("mousemove",  function (e) { scratch(e); });
  canvas.addEventListener("mouseup",    function ()  { isDrawing = false; });
  canvas.addEventListener("mouseleave", function ()  { isDrawing = false; });
  canvas.addEventListener("touchstart", function (e) { e.preventDefault(); isDrawing = true; scratch(e); }, { passive: false });
  canvas.addEventListener("touchmove",  function (e) { e.preventDefault(); scratch(e); }, { passive: false });
  canvas.addEventListener("touchend",   function ()  { isDrawing = false; });

  /* ── Confetti animation ── */
  function launchConfetti() {
    confCanvas.classList.add("active");
    var cctx   = confCanvas.getContext("2d");
    var cW     = confCanvas.width;
    var cH     = confCanvas.height;
    var pieces = [];
    var colors = ["#E86A8D", "#F498B2", "#D47A94", "#FFFFFF", "#FADBE2", "#C44D74", "#FFB6C1", "#8C2849", "#FFF0F4"];

    var origins = [
      { x: 0.1,  vy: -22, spread: 55 },
      { x: 0.5,  vy: -28, spread: 80 },
      { x: 0.9,  vy: -22, spread: 55 }
    ];

    origins.forEach(function (o) {
      for (var i = 0; i < 65; i++) {
        var angle = (Math.random() * o.spread - o.spread / 2) * (Math.PI / 180);
        pieces.push({
          x:  o.x * cW,
          y:  cH,
          vx: Math.sin(angle) * (6 + Math.random() * 10),
          vy: o.vy - Math.random() * 8,
          rot: Math.random() * 360,
          rotSpeed: (Math.random() - 0.5) * 12,
          color: colors[Math.floor(Math.random() * colors.length)],
          w: 7 + Math.random() * 7,
          h: 4 + Math.random() * 4,
          alpha: 1,
          shape: Math.random() > 0.45 ? "rect" : "circle"
        });
      }
    });

    var gravity   = 0.55;
    var frame     = 0;
    var maxFrames = 220;

    function animate() {
      if (frame >= maxFrames) {
        cctx.clearRect(0, 0, cW, cH);
        confCanvas.classList.remove("active");
        return;
      }
      frame++;
      cctx.clearRect(0, 0, cW, cH);

      pieces.forEach(function (p) {
        p.x   += p.vx;
        p.y   += p.vy;
        p.vy  += gravity;
        p.vx  *= 0.99;
        p.rot += p.rotSpeed;
        if (frame > 140) p.alpha -= 0.012;
        p.alpha = Math.max(0, p.alpha);

        cctx.save();
        cctx.globalAlpha = p.alpha;
        cctx.translate(p.x, p.y);
        cctx.rotate(p.rot * Math.PI / 180);
        cctx.fillStyle = p.color;

        if (p.shape === "circle") {
          cctx.beginPath();
          cctx.arc(0, 0, p.w / 2, 0, Math.PI * 2);
          cctx.fill();
        } else {
          cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        }
        cctx.restore();
      });

      requestAnimationFrame(animate);
    }

    animate();
  }

})();

