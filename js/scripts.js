/* ENFOQUE — shared scripts.
   Every block guards on the elements it needs, so the file is safe to load
   on any page (homepage, project pages) without throwing. */

/* ------------------------------------------------------------------ */
/* WebGL background shader (deep obsidian base + soft glows + grain)    */
/* ------------------------------------------------------------------ */
(function initShader() {
    const canvas = document.getElementById('shader-bg');
    if (!canvas) return;
    const gl = canvas.getContext('webgl');
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
            console.error('Shader compile error: ' + gl.getShaderInfoLog(shader));
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
            vertexPosition: gl.getAttribLocation(shaderProgram, 'aVertexPosition'),
        },
        uniformLocations: {
            time: gl.getUniformLocation(shaderProgram, 'u_time'),
            resolution: gl.getUniformLocation(shaderProgram, 'u_resolution'),
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
    const cursor = document.getElementById('custom-cursor');
    if (!cursor) return;

    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let cursorX = mouseX;
    let cursorY = mouseY;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function updateCursor() {
        const amt = 0.15;
        cursorX += (mouseX - cursorX) * amt;
        cursorY += (mouseY - cursorY) * amt;
        cursor.style.left = cursorX + 'px';
        cursor.style.top = cursorY + 'px';
        requestAnimationFrame(updateCursor);
    }
    updateCursor();

    document.querySelectorAll('.interactive-el, a, button').forEach((el) => {
        el.addEventListener('mouseenter', () => cursor.classList.add('interactive'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('interactive'));
    });
})();

/* ------------------------------------------------------------------ */
/* Photography gallery — filter by category (cats / objects / people)  */
/* ------------------------------------------------------------------ */
(function initGalleryFilter() {
    const filterBar = document.querySelector('[data-gallery-filter]');
    const gallery = document.querySelector('[data-gallery]');
    if (!filterBar || !gallery) return;

    const buttons = filterBar.querySelectorAll('button[data-filter]');
    const items = gallery.querySelectorAll('[data-category]');

    buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
            const filter = btn.dataset.filter;
            buttons.forEach((b) => b.classList.toggle('is-active', b === btn));
            items.forEach((item) => {
                const show = filter === 'all' || item.dataset.category === filter;
                item.classList.toggle('hidden', !show);
            });
        });
    });
})();

/* ------------------------------------------------------------------ */
/* Smooth scrolling + scroll-velocity squash & stretch on the cards    */
/* Needs GSAP + ScrollTrigger + ScrollSmoother and the                 */
/* #smooth-wrapper > #smooth-content structure. Skipped if absent or   */
/* if the user prefers reduced motion.                                 */
/* ------------------------------------------------------------------ */
(function initWarpScroll() {
    if (typeof gsap === 'undefined' || typeof ScrollSmoother === 'undefined') return;
    if (!document.getElementById('smooth-wrapper')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger, ScrollSmoother);

    ScrollSmoother.create({
        wrapper: '#smooth-wrapper',
        content: '#smooth-content',
        smooth: 1.4,
        effects: true,
        normalizeScroll: true,
    });

    const cards = gsap.utils.toArray('.project-card, [data-gallery] figure');
    if (!cards.length) return;

    gsap.set(cards, { transformOrigin: 'center center', force3D: true });

    // Squash & stretch: cards compress (or stretch) with scroll speed and
    // spring back on an elastic ease, giving a soft, spongy feel rather than
    // a one-directional slant.
    const clampSquash = gsap.utils.clamp(-0.16, 0.16);
    const proxy = { squash: 0 };

    const applySquash = () => {
        const scaleY = 1 - proxy.squash;
        const scaleX = 1 + proxy.squash * 0.5;
        cards.forEach((el) => {
            el.style.transform = `scale3d(${scaleX}, ${scaleY}, 1)`;
        });
    };

    ScrollTrigger.create({
        onUpdate: (self) => {
            const squash = clampSquash(self.getVelocity() / 2600);
            // React only when the new squash is stronger, then spring back.
            if (Math.abs(squash) > Math.abs(proxy.squash)) {
                proxy.squash = squash;
                gsap.to(proxy, {
                    squash: 0,
                    duration: 1.1,
                    ease: 'elastic.out(1, 0.45)',
                    overwrite: true,
                    onUpdate: applySquash,
                });
            }
        },
    });
})();
