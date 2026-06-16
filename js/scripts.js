/* ENFOQUE — shared scripts.
   Every block guards on the elements it needs, so the file is safe to load
   on any page (homepage, project pages) without throwing. */

/* ------------------------------------------------------------------ */
/* WebGL background shader (deep obsidian base + soft glows + grain)    */
/* ------------------------------------------------------------------ */
(function initShader() {
  const canvas = document.getElementById("shader-bg");
  if (!canvas) return;
  const gl = canvas.getContext("webgl");
  if (!gl) return;

  const vsSource = `
        attribute vec4 aVertexPosition;
        varying vec2 v_texCoord;
        void main() {
            gl_Position = aVertexPosition;
            v_texCoord = aVertexPosition.xy * 0.5 + 0.5;
        }
    `;

  const fsSource = `
        precision highp float;
        varying vec2 v_texCoord;
        uniform float u_time;
        uniform vec2 u_resolution;

        float noise(vec2 p) {
            return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
        }

        void main() {
            vec2 uv = v_texCoord;
            float n = noise(uv + u_time * 0.01);

            vec2 center1 = vec2(0.2, 0.8);
            vec2 center2 = vec2(0.8, 0.2);
            float glow1 = smoothstep(0.5, 0.0, distance(uv, center1));
            float glow2 = smoothstep(0.4, 0.0, distance(uv, center2));

            vec3 color = vec3(0.04, 0.04, 0.04);
            color += vec3(0.1, 0.08, 0.06) * glow1;
            color += vec3(0.05, 0.07, 0.1) * glow2;
            color += (n - 0.5) * 0.03;

            gl_FragColor = vec4(color, 1.0);
        }
    `;

  function loadShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error("Shader compile error: " + gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    return shader;
  }

  const vertexShader = loadShader(gl, gl.VERTEX_SHADER, vsSource);
  const fragmentShader = loadShader(gl, gl.FRAGMENT_SHADER, fsSource);

  const shaderProgram = gl.createProgram();
  gl.attachShader(shaderProgram, vertexShader);
  gl.attachShader(shaderProgram, fragmentShader);
  gl.linkProgram(shaderProgram);

  const programInfo = {
    program: shaderProgram,
    attribLocations: {
      vertexPosition: gl.getAttribLocation(shaderProgram, "aVertexPosition"),
    },
    uniformLocations: {
      time: gl.getUniformLocation(shaderProgram, "u_time"),
      resolution: gl.getUniformLocation(shaderProgram, "u_resolution"),
    },
  };

  const positions = [-1.0, 1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0];
  const positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

  function resizeCanvasToDisplaySize(canvas) {
    // Render at half resolution; the shader is a soft blurred gradient so
    // the lower buffer is imperceptible once CSS stretches it to full size.
    const scale = 0.5;
    const displayWidth = Math.max(1, Math.floor(canvas.clientWidth * scale));
    const displayHeight = Math.max(1, Math.floor(canvas.clientHeight * scale));
    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }
  }

  function render(now) {
    now *= 0.001;
    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.useProgram(programInfo.program);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(programInfo.attribLocations.vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(programInfo.attribLocations.vertexPosition);
    gl.uniform1f(programInfo.uniformLocations.time, now);
    gl.uniform2f(programInfo.uniformLocations.resolution, gl.canvas.width, gl.canvas.height);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    requestAnimationFrame(render);
  }
  requestAnimationFrame(render);
})();

/* ------------------------------------------------------------------ */
/* Custom cursor with smooth lerp follow                               */
/* ------------------------------------------------------------------ */
(function initCursor() {
  const cursor = document.getElementById("custom-cursor");
  if (!cursor) return;

  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let cursorX = mouseX;
  let cursorY = mouseY;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  function updateCursor() {
    const amt = 0.15;
    cursorX += (mouseX - cursorX) * amt;
    cursorY += (mouseY - cursorY) * amt;
    cursor.style.left = cursorX + "px";
    cursor.style.top = cursorY + "px";
    requestAnimationFrame(updateCursor);
  }
  updateCursor();

  document.querySelectorAll(".interactive-el, a, button").forEach((el) => {
    el.addEventListener("mouseenter", () => cursor.classList.add("interactive"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("interactive"));
  });
})();

/* ------------------------------------------------------------------ */
/* Photography gallery — filter by category (cats / objects / people)  */
/* ------------------------------------------------------------------ */
(function initGalleryFilter() {
  const filterBar = document.querySelector("[data-gallery-filter]");
  const gallery = document.querySelector("[data-gallery]");
  if (!filterBar || !gallery) return;

  const buttons = filterBar.querySelectorAll("button[data-filter]");
  const items = gallery.querySelectorAll("[data-category]");

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const filter = btn.dataset.filter;
      buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
      items.forEach((item) => {
        const show = filter === "all" || item.dataset.category === filter;
        item.classList.toggle("hidden", !show);
      });
    });
  });
})();

/* ------------------------------------------------------------------ */
/* Smooth scrolling (GSAP ScrollSmoother).                             */
/* Needs GSAP + ScrollSmoother and the #smooth-wrapper >               */
/* #smooth-content structure. Skipped if absent or reduced-motion.     */
/* ------------------------------------------------------------------ */
(function initSmoothScroll() {
  if (typeof gsap === "undefined" || typeof ScrollSmoother === "undefined") return;
  if (!document.getElementById("smooth-wrapper")) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

  const smoother = ScrollSmoother.create({
    wrapper: "#smooth-wrapper",
    content: "#smooth-content",
    smooth: 1.4,
    effects: true,
    // normalizeScroll is intentionally off — it caused noticeable scroll jank.
    normalizeScroll: false,
  });

  // Anchor links (#work, #about, #contact) don't scroll natively while the
  // content is transformed by ScrollSmoother, so the nav appeared "stuck".
  // Drive them through the smoother instead, and honour a hash on load (e.g.
  // arriving from a project page link like index.html#work).
  const scrollToHash = (hash, smooth) => {
    if (!hash || hash.length < 2) return;
    const target = document.querySelector(hash);
    if (target) smoother.scrollTo(target, smooth, "top top");
  };

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const hash = a.getAttribute("href");
      if (!hash || hash.length < 2 || !document.querySelector(hash)) return;
      e.preventDefault();
      scrollToHash(hash, true);
    });
  });

  if (window.location.hash) {
    requestAnimationFrame(() => scrollToHash(window.location.hash, false));
  }
})();

/* ------------------------------------------------------------------ */
/* Nav scroll-spy — highlight the link for the section in view         */
/* ------------------------------------------------------------------ */
(function initNavSpy() {
  if (typeof ScrollTrigger === "undefined") return;

  const ids = ["work", "about", "contact"];
  const links = {};
  ids.forEach((id) => {
    links[id] = document.querySelector(`a.nav-link[href="#${id}"]`);
  });

  const setActive = (activeId) => {
    ids.forEach((id) => {
      if (links[id]) links[id].classList.toggle("active", id === activeId);
    });
  };

  ids.forEach((id) => {
    const section = document.getElementById(id);
    if (!section || !links[id]) return;
    ScrollTrigger.create({
      trigger: section,
      start: "top center",
      end: "bottom center",
      onToggle: (self) => {
        if (self.isActive) setActive(id);
      },
    });
  });
})();

/* ------------------------------------------------------------------ */
/* Mobile menu — open/close the full-screen overlay                    */
/* ------------------------------------------------------------------ */
(function initMobileMenu() {
  const menu = document.querySelector("[data-mobile-menu]");
  const openBtn = document.querySelector("[data-menu-toggle]");
  const closeBtn = document.querySelector("[data-menu-close]");
  if (!menu || !openBtn) return;

  const close = () => menu.classList.remove("is-open");
  openBtn.addEventListener("click", () => menu.classList.add("is-open"));
  if (closeBtn) closeBtn.addEventListener("click", close);
  // Close after a link is tapped (the link's own handler does the scrolling).
  menu.querySelectorAll("[data-menu-link]").forEach((link) => link.addEventListener("click", close));
})();

/* ------------------------------------------------------------------ */
/* Skills — expanding-circle card hover + scroll-reactive marquee      */
/* ------------------------------------------------------------------ */
(function initSkills() {
  // Card reveal: set the circle origin (--x / --y) to where the cursor
  // enters/leaves so the dark layer grows from / collapses to that point.
  document.querySelectorAll(".skill-card").forEach((card) => {
    const setOrigin = (e) => {
      const r = card.getBoundingClientRect();
      card.style.setProperty("--x", ((e.clientX - r.left) / r.width) * 100 + "%");
      card.style.setProperty("--y", ((e.clientY - r.top) / r.height) * 100 + "%");
    };
    card.addEventListener("mouseenter", setOrigin);
    card.addEventListener("mouseleave", setOrigin);
  });

  // Marquee: it auto-scrolls; here we just flip its direction to match the
  // scroll direction. ScrollTrigger is used because ScrollSmoother makes the
  // native window scroll event unreliable; fall back to it if GSAP is absent.
  const track = document.querySelector(".skills-marquee__track");
  if (!track) return;

  if (typeof ScrollTrigger !== "undefined") {
    ScrollTrigger.create({
      onUpdate: (self) => {
        track.style.animationDirection = self.direction === 1 ? "normal" : "reverse";
      },
    });
  } else {
    let last = window.scrollY;
    window.addEventListener(
      "scroll",
      () => {
        track.style.animationDirection = window.scrollY > last ? "normal" : "reverse";
        last = window.scrollY;
      },
      { passive: true },
    );
  }
})();

/* ------------------------------------------------------------------ */
/* About — image travels a diagonal path (top-right -> bottom-left)    */
/* while the stage is pinned. Desktop only; mobile shows it in flow.   */
/* ------------------------------------------------------------------ */
(function initAboutPath() {
  const scene = document.querySelector("[data-about-scene]");
  const stage = document.querySelector("[data-about-stage]");
  const img = document.querySelector("[data-about-path]");
  if (!scene || !stage || !img || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);

  // The photo also changes as you scroll. Preload them so swaps don't flicker.
  const photos = ["people2", "object3", "cat3", "people4"].map((name) => `assets/img/${name}.jpg`);
  photos.forEach((src) => {
    const pre = new Image();
    pre.src = src;
  });
  let currentPhoto = -1;
  const swapPhoto = (progress) => {
    const i = Math.min(photos.length - 1, Math.floor(progress * photos.length));
    if (i !== currentPhoto) {
      currentPhoto = i;
      img.src = photos[i];
    }
  };

  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px)", () => {
    // Keep the image centred on its own origin, then slide it diagonally.
    gsap.set(img, { xPercent: -50, yPercent: -50 });
    const tween = gsap.fromTo(
      img,
      { x: () => window.innerWidth * 0.32, y: () => -window.innerHeight * 0.26 },
      {
        x: () => -window.innerWidth * 0.32,
        y: () => window.innerHeight * 0.26,
        ease: "none",
        scrollTrigger: {
          trigger: scene,
          start: "top top",
          end: "+=150%",
          pin: stage,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => swapPhoto(self.progress),
        },
      },
    );

    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
      gsap.set(img, { clearProps: "all" });
    };
  });
})();

/* ------------------------------------------------------------------ */
/* Off-work — pinned horizontal scroll (GSAP ScrollTrigger).           */
/* The pin container is held in place while the photo track pans left  */
/* by the same distance you scroll. Desktop only; mobile stacks (CSS). */
/* ------------------------------------------------------------------ */
(function initOffworkScroll() {
  const pin = document.querySelector("[data-offwork-pin]");
  const track = document.querySelector("[data-offwork-track]");
  if (!pin || !track || typeof gsap === "undefined" || typeof ScrollTrigger === "undefined") return;

  gsap.registerPlugin(ScrollTrigger);
  const section = pin.closest(".offwork");
  const left = pin.querySelector(".offwork__left");

  const mm = gsap.matchMedia();
  mm.add("(min-width: 768px)", () => {
    // How far the track must travel so its last photo reaches the edge.
    const distance = () => Math.max(0, track.scrollWidth - (window.innerWidth - left.offsetWidth));

    const tween = gsap.to(track, {
      x: () => -distance(),
      ease: "none",
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: () => "+=" + distance(),
        pin: pin,
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
      gsap.set(track, { clearProps: "x" });
    };
  });
})();

/* ------------------------------------------------------------------ */
/* Hero — letter-by-letter intro + role fade-in                        */
/* ------------------------------------------------------------------ */
(function initHero() {
  const role = document.querySelector(".hero-role");

  // Wrap each character of the name in its own span so we can stagger them.
  const chars = [];
  document.querySelectorAll(".hero-name [data-split]").forEach((line) => {
    const text = line.textContent;
    line.textContent = "";
    for (const ch of text) {
      const span = document.createElement("span");
      span.className = "hero-name__char";
      span.textContent = ch;
      line.appendChild(span);
      chars.push(span);
    }
  });

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof gsap === "undefined") {
    // No animation: just make sure everything is visible.
    if (role) role.style.opacity = "1";
    return;
  }

  const tl = gsap.timeline();
  tl.from(chars, { opacity: 0, y: 20, duration: 0.6, ease: "power3.out", stagger: 0.05 });
  if (role) {
    tl.fromTo(role, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }, 0.5);
  }
})();

/* ------------------------------------------------------------------ */
/* Hero — cursor image trail (hero section only, skipped on touch)     */
/* ------------------------------------------------------------------ */
(function initHeroTrail() {
  const hero = document.querySelector("[data-hero-trail]");
  if (!hero) return;
  if (window.matchMedia("(hover: none)").matches) return;

  // Every cat / people / object / animal photo, interleaved for variety.
  const photos = [
    "people1", "cat1", "object1", "animal",
    "people2", "cat1.2", "object2", "cat3",
    "people3", "object3", "cat3.2", "object",
    "people4", "cat5", "object4", "cat6",
    "object5", "cat7", "cat-old",
  ].map((name) => `assets/img/${name}.jpg`);
  let index = 0;

  // Density is driven by cursor speed: we spawn a photo every STEP pixels of
  // travel, so moving fast drops many and moving slowly drops few.
  const STEP = 90;
  let lastX = null;
  let lastY = null;
  let travelled = 0;

  hero.addEventListener("mousemove", (e) => {
    if (lastX === null) {
      lastX = e.clientX;
      lastY = e.clientY;
      return;
    }
    travelled += Math.hypot(e.clientX - lastX, e.clientY - lastY);
    lastX = e.clientX;
    lastY = e.clientY;
    if (travelled < STEP) return;
    travelled = 0;

    const rect = hero.getBoundingClientRect();
    const img = document.createElement("img");
    img.className = "hero-trail__img";
    img.alt = "";
    img.src = photos[index % photos.length];
    index++;
    const offsetX = Math.random() * 30 - 15; // +/-15px
    const offsetY = Math.random() * 30 - 15;
    img.style.left = e.clientX - rect.left + offsetX + "px";
    img.style.top = e.clientY - rect.top + offsetY + "px";
    img.style.setProperty("--r", Math.random() * 24 - 12 + "deg"); // -12..12deg
    hero.appendChild(img);

    setTimeout(() => img.remove(), 900);
  });

  hero.addEventListener("mouseleave", () => {
    lastX = null;
    lastY = null;
    travelled = 0;
  });
})();

/* ------------------------------------------------------------------ */
/* Hero — live date / time in the bottom metadata bar                  */
/* ------------------------------------------------------------------ */
(function initHeroClock() {
  const dateEl = document.getElementById("hero-date");
  const timeEl = document.getElementById("hero-time");
  if (!dateEl && !timeEl) return;

  const months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const tick = () => {
    const now = new Date();
    if (dateEl) dateEl.textContent = `${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`;
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
    }
  };
  tick();
  setInterval(tick, 1000);
})();

/* ------------------------------------------------------------------ */
/* Hero — subtle cursor parallax so the layers don't feel flat         */
/* Elements with data-hero-parallax="N" drift by N px towards the      */
/* cursor (negative N drifts the opposite way). Smoothed with a lerp.  */
/* ------------------------------------------------------------------ */
(function initHeroParallax() {
  const hero = document.querySelector("[data-hero-trail]");
  if (!hero) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const layers = Array.from(hero.querySelectorAll("[data-hero-parallax]")).map((el) => ({
    el,
    depth: parseFloat(el.dataset.heroParallax) || 0,
  }));
  if (!layers.length) return;

  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;
  const clamp = (v) => Math.max(-1, Math.min(1, v));

  // Smoothly ease the layers toward the target offset every frame.
  function loop() {
    currentX += (targetX - currentX) * 0.08;
    currentY += (targetY - currentY) * 0.08;
    layers.forEach(({ el, depth }) => {
      el.style.transform = `translate3d(${currentX * depth}px, ${currentY * depth}px, 0)`;
    });
    requestAnimationFrame(loop);
  }
  loop();

  const isTouch = window.matchMedia("(hover: none)").matches;

  if (!isTouch) {
    // Desktop: follow the cursor.
    window.addEventListener("mousemove", (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2; // -1..1
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    });
    return;
  }

  // Mobile: drive the parallax with the device gyroscope. The first reading
  // becomes the neutral baseline so it works at whatever angle you're holding.
  let baseGamma = null;
  let baseBeta = null;
  const onOrient = (e) => {
    if (e.gamma === null || e.beta === null) return;
    if (baseGamma === null) {
      baseGamma = e.gamma;
      baseBeta = e.beta;
    }
    targetX = clamp((e.gamma - baseGamma) / 25); // left/right tilt
    targetY = clamp((e.beta - baseBeta) / 25); // front/back tilt
  };
  const start = () => window.addEventListener("deviceorientation", onOrient);

  if (typeof DeviceOrientationEvent === "undefined") return;
  if (typeof DeviceOrientationEvent.requestPermission === "function") {
    // iOS 13+ requires permission, requested from a user gesture (a tap).
    const requestOnce = () => {
      DeviceOrientationEvent.requestPermission()
        .then((state) => {
          if (state === "granted") start();
        })
        .catch(() => {});
    };
    window.addEventListener("touchend", requestOnce, { once: true });
  } else {
    start();
  }
})();
