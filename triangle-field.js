/* Adapted from the existing Psy site triangleField.ts (识别 Shadertoy 粒子动效). Geometry, lighting and pointer physics preserved. */
const TAU = Math.PI * 2;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const smooth = (v) => { const t = clamp(v, 0, 1); return t * t * (3 - 2 * t); };
/** A continuously folding ribbon made entirely of independent, individually reactive triangles. */
export function createTriangleField(canvas, host, hero) {
    const context = canvas.getContext('2d');
    if (!context)
        return null;
    const ctx = context;
    let width = 0, height = 0, ratio = 0, clock = 0;
    let vertices = [];
    let facets = [];
    let copy = { left: 0, top: 0, right: 0, bottom: 0 };
    const pointer = { x: -10000, y: -10000, vx: 0, vy: 0, active: false };
    const wakes = [];
    function resize() {
        const bounds = host.getBoundingClientRect();
        const text = hero.querySelector('.hero-copy, h1')?.getBoundingClientRect();
        if (text)
            copy = { left: text.left - bounds.left, top: text.top - bounds.top, right: text.right - bounds.left, bottom: text.bottom - bounds.top };
        const nextRatio = Math.min(devicePixelRatio || 1, 2);
        if (width === bounds.width && height === bounds.height && ratio === nextRatio)
            return;
        width = bounds.width;
        height = bounds.height;
        ratio = nextRatio;
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
        const segments = width < 560 ? 58 : 88, rows = width < 560 ? 6 : 9;
        vertices = [];
        facets = [];
        for (let i = 0; i <= segments; i++)
            for (let j = 0; j <= rows; j++) {
                vertices.push({ u: i / segments * TAU, v: j / rows * 2 - 1, x: 0, y: 0, z: 0, px: 0, py: 0 });
            }
        const face = (a, b, c, i, j) => {
            const phase = (Math.sin(i * 127.1 + j * 311.7 + a) * 43758.5453) % 1;
            facets.push({ a, b, c, phase: Math.abs(phase) * TAU, tint: j / rows, x: 0, y: 0, vx: 0, vy: 0, spin: 0, spinVelocity: 0, cx: 0, cy: 0, depth: 0, light: 0, energy: 0 });
        };
        for (let i = 0; i < segments; i++)
            for (let j = 0; j < rows; j++) {
                const a = i * (rows + 1) + j, b = (i + 1) * (rows + 1) + j, c = a + 1, d = b + 1;
                if ((i + j) % 2 === 0) {
                    face(a, b, c, i, j);
                    face(b, d, c, i, j);
                }
                else {
                    face(a, b, d, i, j);
                    face(a, d, c, i, j);
                }
            }
    }
    function draw(dt, running) {
        if (running) {
            clock += dt / 60;
            for (let i = wakes.length - 1; i >= 0; i--) {
                wakes[i].age += dt;
                if (wakes[i].age > 50)
                    wakes.splice(i, 1);
            }
        }
        const mobile = width < 560;
        const pitch = (mobile ? .32 : .76) + Math.sin(clock * .11) * .10;
        const yaw = (mobile ? 1.02 : .20) + Math.sin(clock * .09) * .17;
        const roll = -.14 + Math.sin(clock * .07) * .08;
        const cp = Math.cos(pitch), sp = Math.sin(pitch), cy = Math.cos(yaw), sy = Math.sin(yaw), cr = Math.cos(roll), sr = Math.sin(roll);
        const scale = mobile ? height / 5.7 : Math.max(width / 6.9, height / 5.2);
        const entrance = 1 - Math.exp(-clock * 2);
        const zoom = running ? .96 + .04 * entrance : 1;
        for (const vertex of vertices) {
            const u = vertex.u + clock * .035, v = vertex.v;
            const widthAt = .82 + .10 * Math.sin(u * 3 + clock * .24);
            const r = 2.15 + v * widthAt * Math.cos(u * .5);
            let x = r * Math.cos(u), y = r * Math.sin(u), z = v * widthAt * Math.sin(u * .5);
            z += .12 * Math.sin(u * 3 + clock * .35) * (1 - v * v);
            y += .08 * Math.sin(u * 2 - clock * .22);
            const y1 = y * cp - z * sp, z1 = y * sp + z * cp;
            const x1 = x * cy + z1 * sy, z2 = -x * sy + z1 * cy;
            x = x1 * cr - y1 * sr;
            y = x1 * sr + y1 * cr;
            z = z2;
            const perspective = 7.5 / (7.5 - z);
            vertex.x = x;
            vertex.y = y;
            vertex.z = z;
            vertex.px = width * .5 + x * scale * perspective * zoom;
            vertex.py = height * .50 - y * scale * perspective * zoom;
        }
        for (const f of facets) {
            const a = vertices[f.a], b = vertices[f.b], c = vertices[f.c];
            f.cx = (a.px + b.px + c.px) / 3;
            f.cy = (a.py + b.py + c.py) / 3;
            f.depth = (a.z + b.z + c.z) / 3;
            const ux = b.x - a.x, uy = b.y - a.y, uz = b.z - a.z, vx = c.x - a.x, vy = c.y - a.y, vz = c.z - a.z;
            const nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx, len = Math.hypot(nx, ny, nz) || 1;
            f.light = Math.abs((nx * -.34 + ny * .5 + nz * .8) / len);
            if (running) {
                f.energy *= Math.pow(.96, dt);
                f.vx += (Math.sin(clock * .7 + f.phase) * .008 - f.x * .0038) * dt;
                f.vy += (Math.cos(clock * .6 + f.phase) * .008 - f.y * .0038) * dt;
                const dx = f.cx + f.x - pointer.x, dy = f.cy + f.y - pointer.y, d = Math.hypot(dx, dy), radius = mobile ? 115 : 175;
                if (pointer.active && d < radius) {
                    const p = (1 - d / radius) ** 2, force = p * (2.2 + Math.hypot(pointer.vx, pointer.vy) * .035) * dt;
                    f.vx += (dx / Math.max(1, d) * force + pointer.vx * p * .035 * dt);
                    f.vy += (dy / Math.max(1, d) * force + pointer.vy * p * .035 * dt);
                    f.spinVelocity += (pointer.vx - pointer.vy) * p * .0012 * dt;
                    f.energy = Math.min(1, f.energy + p * .16 * dt);
                }
                for (const wake of wakes) {
                    const dx = f.cx + f.x - wake.x, dy = f.cy + f.y - wake.y, d = Math.hypot(dx, dy);
                    if (d > 1 && d < 125) {
                        const p = (1 - d / 125) ** 2 * (1 - wake.age / 50) * .16 * dt;
                        f.vx += (dx / d - wake.vy * .02) * p;
                        f.vy += (dy / d + wake.vx * .02) * p;
                    }
                }
                f.vx *= Math.pow(.95, dt);
                f.vy *= Math.pow(.95, dt);
                f.x += f.vx * dt;
                f.y += f.vy * dt;
                f.spinVelocity -= f.spin * .002 * dt;
                f.spinVelocity *= Math.pow(.95, dt);
                f.spin += f.spinVelocity * dt;
            }
        }
        facets.sort((a, b) => a.depth - b.depth);
        ctx.clearRect(0, 0, width, height);
        ctx.lineJoin = 'round';
        for (const f of facets) {
            const source = [vertices[f.a], vertices[f.b], vertices[f.c]];
            const cos = Math.cos(f.spin), sin = Math.sin(f.spin);
            const separation = .91 - .08 * f.energy;
            const points = source.map(p => { const x = (p.px - f.cx) * separation, y = (p.py - f.cy) * separation; return [f.cx + f.x + x * cos - y * sin, f.cy + f.y + x * sin + y * cos]; });
            const dx = Math.max(copy.left - f.cx, 0, f.cx - copy.right), dy = Math.max(copy.top - f.cy, 0, f.cy - copy.bottom);
            const readability = .40 + .60 * smooth(Math.hypot(dx, dy) / 75);
            const front = clamp((f.depth + 2.6) / 5.2, 0, 1);
            const edge = Math.abs(f.tint - .5) * 2;
            const cobalt = smooth((edge - .38) / .62) * (.28 + .72 * f.light);
            const light = .6 + .4 * f.light;
            const blue = [12 + light * 15, 55 + light * 40, 190 + light * 55];
            const pearl = [158 + light * 84, 175 + light * 70, 204 + light * 46];
            const r = pearl[0] * (1 - cobalt) + blue[0] * cobalt, g = pearl[1] * (1 - cobalt) + blue[1] * cobalt, b = pearl[2] * (1 - cobalt) + blue[2] * cobalt;
            const alpha = (.75 + front * .24) * readability;
            ctx.beginPath();
            ctx.moveTo(...points[0]);
            ctx.lineTo(...points[1]);
            ctx.lineTo(...points[2]);
            ctx.closePath();
            const gradient = ctx.createLinearGradient(points[0][0], points[0][1], points[1][0], points[1][1]);
            gradient.addColorStop(0, `rgba(${r | 0},${g | 0},${b | 0},${alpha})`);
            gradient.addColorStop(1, `rgba(${Math.min(255, r + 20) | 0},${Math.min(255, g + 18) | 0},${Math.min(255, b + 15) | 0},${alpha * .62})`);
            ctx.fillStyle = gradient;
            ctx.fill();
            ctx.strokeStyle = `rgba(86,125,183,${alpha * .12})`;
            ctx.lineWidth = .45;
            ctx.stroke();
            if (f.light > .8 && front > .5) {
                ctx.beginPath();
                ctx.moveTo(...points[0]);
                ctx.lineTo(...points[1]);
                ctx.strokeStyle = `rgba(255,255,255,${alpha * .65})`;
                ctx.lineWidth = .65;
                ctx.stroke();
            }
        }
        if (running) {
            pointer.vx *= Math.pow(.83, dt);
            pointer.vy *= Math.pow(.83, dt);
        }
    }
    resize();
    return {
        resize, draw,
        movePointer(x, y) {
            const distance = Math.hypot(x - pointer.x, y - pointer.y);
            pointer.vx = pointer.active ? clamp(x - pointer.x, -32, 32) : 0;
            pointer.vy = pointer.active ? clamp(y - pointer.y, -32, 32) : 0;
            pointer.x = x;
            pointer.y = y;
            pointer.active = true;
            if (distance > 15) {
                wakes.push({ x, y, vx: pointer.vx, vy: pointer.vy, age: 0 });
                if (wakes.length > 9)
                    wakes.shift();
            }
        },
        clearPointer() { pointer.active = false; pointer.vx = 0; pointer.vy = 0; wakes.length = 0; },
    };
}
