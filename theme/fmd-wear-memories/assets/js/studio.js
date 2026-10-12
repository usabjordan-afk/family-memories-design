/* Family Memories Design — 3D apparel studio.
   Self-contained WebGL (no library): ~30 KB instead of a 600 KB engine, so it is fast on iPhone.
   - Built-in angular garment models (hoodie / crewneck / tee).
   - Optional .glb models from the Customizer (uncompressed glTF 2.0 binary).
   - Prints are projected onto the front and back of any model in the shader,
     so a logo, design, name and number work on the built-in and uploaded models alike. */

const TAU = Math.PI * 2;

/* ---------------------------------------------------------------- math */
const m4 = {
	ident() { const o = new Float32Array(16); o[0] = o[5] = o[10] = o[15] = 1; return o; },
	mul(a, b) {
		const o = new Float32Array(16);
		for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
			let s = 0;
			for (let k = 0; k < 4; k++) s += a[k * 4 + r] * b[c * 4 + k];
			o[c * 4 + r] = s;
		}
		return o;
	},
	persp(fovy, aspect, near, far) {
		const f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far), o = new Float32Array(16);
		o[0] = f / aspect; o[5] = f; o[10] = (far + near) * nf; o[11] = -1; o[14] = 2 * far * near * nf;
		return o;
	},
	lookAt(e, t, u) {
		let zx = e[0] - t[0], zy = e[1] - t[1], zz = e[2] - t[2];
		let l = Math.hypot(zx, zy, zz); zx /= l; zy /= l; zz /= l;
		let xx = u[1] * zz - u[2] * zy, xy = u[2] * zx - u[0] * zz, xz = u[0] * zy - u[1] * zx;
		l = Math.hypot(xx, xy, xz); xx /= l; xy /= l; xz /= l;
		const yx = zy * xz - zz * xy, yy = zz * xx - zx * xz, yz = zx * xy - zy * xx;
		const o = new Float32Array(16);
		o[0] = xx; o[1] = yx; o[2] = zx;
		o[4] = xy; o[5] = yy; o[6] = zy;
		o[8] = xz; o[9] = yz; o[10] = zz;
		o[12] = -(xx * e[0] + xy * e[1] + xz * e[2]);
		o[13] = -(yx * e[0] + yy * e[1] + yz * e[2]);
		o[14] = -(zx * e[0] + zy * e[1] + zz * e[2]);
		o[15] = 1;
		return o;
	},
	rotY(a) { const o = m4.ident(), c = Math.cos(a), s = Math.sin(a); o[0] = c; o[2] = -s; o[8] = s; o[10] = c; return o; },
	rotX(a) { const o = m4.ident(), c = Math.cos(a), s = Math.sin(a); o[5] = c; o[6] = s; o[9] = -s; o[10] = c; return o; },
	normal3(m) { return new Float32Array([m[0], m[1], m[2], m[4], m[5], m[6], m[8], m[9], m[10]]); },
	fromTRS(t, q, s) {
		const [x, y, z, w] = q, x2 = x + x, y2 = y + y, z2 = z + z;
		const xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
		const o = new Float32Array(16);
		o[0] = (1 - (yy + zz)) * s[0]; o[1] = (xy + wz) * s[0]; o[2] = (xz - wy) * s[0];
		o[4] = (xy - wz) * s[1]; o[5] = (1 - (xx + zz)) * s[1]; o[6] = (yz + wx) * s[1];
		o[8] = (xz + wy) * s[2]; o[9] = (yz - wx) * s[2]; o[10] = (1 - (xx + yy)) * s[2];
		o[12] = t[0]; o[13] = t[1]; o[14] = t[2]; o[15] = 1;
		return o;
	},
};

/* ------------------------------------------------------ polygon tools */
function area(p) { let a = 0; for (let i = 0; i < p.length; i++) { const [x1, y1] = p[i], [x2, y2] = p[(i + 1) % p.length]; a += x1 * y2 - x2 * y1; } return a / 2; }
function ccw(p) { return area(p) < 0 ? p.slice().reverse() : p; }
function mirrorHalf(half) {
	// half: right side points from top to bottom (x > 0). Returns a closed CCW outline.
	const left = half.slice().reverse().map(([x, y]) => [-x, y]);
	return ccw(half.concat(left));
}
function mirrorShape(p) { return ccw(p.map(([x, y]) => [-x, y])); }

function triangulate(pts) {
	const cross = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
	const inTri = (p, a, b, c) => cross(a, b, p) >= -1e-12 && cross(b, c, p) >= -1e-12 && cross(c, a, p) >= -1e-12;
	const idx = pts.map((_, i) => i), tris = [];
	let guard = 0;
	while (idx.length > 3 && guard++ < 10000) {
		let clipped = false;
		for (let i = 0; i < idx.length; i++) {
			const a = idx[(i + idx.length - 1) % idx.length], b = idx[i], c = idx[(i + 1) % idx.length];
			const pa = pts[a], pb = pts[b], pc = pts[c];
			if (cross(pa, pb, pc) <= 1e-10) continue;
			let inside = false;
			for (const j of idx) {
				if (j === a || j === b || j === c) continue;
				if (inTri(pts[j], pa, pb, pc)) { inside = true; break; }
			}
			if (inside) continue;
			tris.push([a, b, c]);
			idx.splice(i, 1);
			clipped = true;
			break;
		}
		if (!clipped) break;
	}
	if (idx.length === 3) tris.push(idx.slice());
	return tris;
}

function inset(p, d) {
	const n = p.length, out = [];
	for (let i = 0; i < n; i++) {
		const a = p[(i + n - 1) % n], b = p[i], c = p[(i + 1) % n];
		let e1x = b[0] - a[0], e1y = b[1] - a[1], l1 = Math.hypot(e1x, e1y); e1x /= l1; e1y /= l1;
		let e2x = c[0] - b[0], e2y = c[1] - b[1], l2 = Math.hypot(e2x, e2y); e2x /= l2; e2y /= l2;
		const n1x = -e1y, n1y = e1x, n2x = -e2y, n2y = e2x; // inward (left) normals for CCW
		let mx = n1x + n2x, my = n1y + n2y; const ml = Math.hypot(mx, my) || 1; mx /= ml; my /= ml;
		let k = d / Math.max(0.35, mx * n1x + my * n1y);
		k = Math.min(k, d * 2.4);
		out.push([b[0] + mx * k, b[1] + my * k]);
	}
	return out;
}

/* Extrude an outline into an angular slab with chamfered edges.
   Output: interleaved [x y z nx ny nz shade] per vertex, flat-shaded. */
function extrude(poly, { depth, chamfer, z = 0, shade = 1, faces = 'both' }, out) {
	const P = ccw(poly), I = inset(P, chamfer), h = depth / 2, hc = h - chamfer;
	const tris = triangulate(I);
	const push = (a, b, c, nx, ny, nz) => {
		// orient the computed normal towards the expected outward direction
		const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2];
		const vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
		let cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
		const l = Math.hypot(cx, cy, cz) || 1; cx /= l; cy /= l; cz /= l;
		if (cx * nx + cy * ny + cz * nz < 0) { cx = -cx; cy = -cy; cz = -cz; }
		for (const v of [a, b, c]) out.push(v[0], v[1], v[2], cx, cy, cz, shade);
	};
	if (faces !== 'back') for (const [a, b, c] of tris) push([...I[a], z + h], [...I[b], z + h], [...I[c], z + h], 0, 0, 1);
	if (faces !== 'front') for (const [a, b, c] of tris) push([...I[a], z - h], [...I[c], z - h], [...I[b], z - h], 0, 0, -1);
	const n = P.length;
	for (let i = 0; i < n; i++) {
		const j = (i + 1) % n;
		const ex = P[j][0] - P[i][0], ey = P[j][1] - P[i][1], el = Math.hypot(ex, ey) || 1;
		const ox = ey / el, oy = -ex / el; // outward
		const Of0 = [P[i][0], P[i][1], z + hc], Of1 = [P[j][0], P[j][1], z + hc];
		const Ob0 = [P[i][0], P[i][1], z - hc], Ob1 = [P[j][0], P[j][1], z - hc];
		const If0 = [I[i][0], I[i][1], z + h], If1 = [I[j][0], I[j][1], z + h];
		const Ib0 = [I[i][0], I[i][1], z - h], Ib1 = [I[j][0], I[j][1], z - h];
		push(Of0, Of1, Ob1, ox, oy, 0); push(Of0, Ob1, Ob0, ox, oy, 0);
		if (faces !== 'back') { push(If0, If1, Of1, ox, oy, 1); push(If0, Of1, Of0, ox, oy, 1); }
		if (faces !== 'front') { push(Ib0, Ob1, Ib1, ox, oy, -1); push(Ib0, Ob0, Ob1, ox, oy, -1); }
	}
	return out;
}

/* --------------------------------------------- built-in garment models */
const BODY = { depth: 0.3, chamfer: 0.065 };
const SH = { inner: 0.38, trim: 0.86, pocket: 0.95, cord: 1.12 };

function panel(out, shape, shade, layer, side = 'front', mirror = false) {
	const zf = BODY.depth / 2 + 0.008 + layer * 0.007;
	const opts = { depth: 0.016, chamfer: 0.006, shade };
	const shapes = mirror ? [shape, mirrorShape(shape)] : [shape];
	for (const s of shapes) {
		if (side === 'front' || side === 'both') extrude(s, { ...opts, z: zf, faces: 'front' }, out);
		if (side === 'back' || side === 'both') extrude(s, { ...opts, z: -zf, faces: 'back' }, out);
	}
}

function buildBuiltin(kind) {
	const out = [];
	let meta;
	if (kind === 'tee') {
		extrude(mirrorHalf([[0.25, 1.04], [0.6, 0.95], [1.02, 0.46], [0.8, 0.25], [0.575, 0.47], [0.585, -1.08]]), BODY, out);
		panel(out, [[-0.25, 1.0], [0.25, 1.0], [0.18, 0.88], [0, 0.83], [-0.18, 0.88]], SH.trim, 0);
		panel(out, [[-0.2, 0.995], [0.2, 0.995], [0.145, 0.915], [0, 0.875], [-0.145, 0.915]], SH.inner, 1);
		panel(out, [[-0.24, 0.985], [0.24, 0.985], [0.22, 0.94], [-0.22, 0.94]], SH.trim, 0, 'back');
		panel(out, [[0.84, 0.31], [0.97, 0.45], [0.93, 0.5], [0.8, 0.36]], SH.trim, 0, 'both', true);
		meta = { front: [0, 0.42, 0.3, 0.3], back: [0, 0.36, 0.42, 0.42] };
	} else if (kind === 'crew') {
		extrude(mirrorHalf([[0.24, 1.04], [0.6, 0.95], [0.96, 0.3], [1.1, -0.7], [0.87, -0.76], [0.7, -0.05], [0.6, 0.36], [0.6, -1.1]]), BODY, out);
		panel(out, [[-0.24, 1.0], [0.24, 1.0], [0.18, 0.87], [0, 0.82], [-0.18, 0.87]], SH.trim, 0);
		panel(out, [[-0.19, 0.995], [0.19, 0.995], [0.14, 0.91], [0, 0.87], [-0.14, 0.91]], SH.inner, 1);
		panel(out, [[-0.23, 0.985], [0.23, 0.985], [0.21, 0.94], [-0.21, 0.94]], SH.trim, 0, 'back');
		panel(out, [[-0.535, -1.035], [0.535, -1.035], [0.535, -0.92], [-0.535, -0.92]], SH.trim, 0, 'both');
		panel(out, [[0.905, -0.705], [1.045, -0.665], [1.03, -0.565], [0.885, -0.6]], SH.trim, 0, 'both', true);
		meta = { front: [0, 0.4, 0.3, 0.3], back: [0, 0.34, 0.4, 0.4] };
	} else {
		extrude(mirrorHalf([[0.17, 1.5], [0.33, 1.36], [0.38, 1.04], [0.64, 0.93], [1.0, 0.28], [1.14, -0.72], [0.9, -0.79], [0.73, -0.06], [0.63, 0.34], [0.63, -1.12]]), BODY, out);
		panel(out, [[0, 0.75], [0.24, 0.85], [0.28, 1.2], [0.14, 1.42], [-0.14, 1.42], [-0.28, 1.2], [-0.24, 0.85]], SH.trim, 0);
		panel(out, [[0, 0.81], [0.19, 0.89], [0.23, 1.18], [0.12, 1.36], [-0.12, 1.36], [-0.23, 1.18], [-0.19, 0.89]], SH.inner, 1);
		panel(out, [[0.085, 0.86], [0.115, 0.86], [0.12, 0.44], [0.09, 0.44]], SH.cord, 2, 'front', true);
		panel(out, [[-0.32, -0.3], [0.32, -0.3], [0.47, -0.6], [0.47, -0.9], [-0.47, -0.9], [-0.47, -0.6]], SH.pocket, 0);
		panel(out, [[-0.565, -1.055], [0.565, -1.055], [0.565, -0.94], [-0.565, -0.94]], SH.trim, 0, 'both');
		panel(out, [[0.935, -0.735], [1.085, -0.69], [1.07, -0.59], [0.915, -0.635]], SH.trim, 0, 'both', true);
		meta = { front: [0, 0.3, 0.28, 0.28], back: [0, 0.36, 0.4, 0.4] };
	}
	return {
		data: new Float32Array(out),
		zMid: 0,
		frontRect: meta.front,
		backRect: meta.back,
		height: kind === 'hoodie' ? 2.62 : 2.18,
		centerY: kind === 'hoodie' ? 0.19 : -0.02,
		radius: kind === 'tee' ? 1.32 : 1.42,
		glb: false,
	};
}

/* ------------------------------------------------------------ GLB */
async function loadGLB(url, yawDeg, kind) {
	const res = await fetch(url, { credentials: 'same-origin' });
	if (!res.ok) throw new Error('GLB ' + res.status);
	const buf = await res.arrayBuffer();
	const dv = new DataView(buf);
	if (dv.getUint32(0, true) !== 0x46546c67) throw new Error('Not a .glb file');
	let off = 12, json = null, binOff = -1;
	while (off + 8 <= buf.byteLength) {
		const len = dv.getUint32(off, true), type = dv.getUint32(off + 4, true);
		if (type === 0x4e4f534a) json = JSON.parse(new TextDecoder().decode(new Uint8Array(buf, off + 8, len)));
		else if (type === 0x004e4942) binOff = off + 8;
		off += 8 + len;
	}
	if (!json) throw new Error('GLB has no JSON chunk');
	const req = json.extensionsRequired || [];
	if (req.length) throw new Error('GLB needs ' + req.join(', ') + ' — export without compression');

	const NC = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4, MAT4: 16 };
	const RD = {
		5120: [1, (o) => dv.getInt8(o), 127], 5121: [1, (o) => dv.getUint8(o), 255],
		5122: [2, (o) => dv.getInt16(o, true), 32767], 5123: [2, (o) => dv.getUint16(o, true), 65535],
		5125: [4, (o) => dv.getUint32(o, true), 1], 5126: [4, (o) => dv.getFloat32(o, true), 1],
	};
	const readAcc = (i) => {
		const a = json.accessors[i], comps = NC[a.type], [size, get, norm] = RD[a.componentType];
		const out = new Float32Array(a.count * comps);
		if (a.bufferView === undefined) return out;
		const bv = json.bufferViews[a.bufferView];
		if ((bv.buffer || 0) !== 0 || binOff < 0) throw new Error('GLB uses an external buffer');
		const stride = bv.byteStride || comps * size;
		const base = binOff + (bv.byteOffset || 0) + (a.byteOffset || 0);
		const scale = a.normalized ? 1 / norm : 1;
		for (let e = 0; e < a.count; e++) for (let c = 0; c < comps; c++) out[e * comps + c] = get(base + e * stride + c * size) * scale;
		return out;
	};

	const pos = [], nor = [];
	const yaw = m4.rotY((yawDeg || 0) * Math.PI / 180);
	const visit = (ni, parent) => {
		const node = json.nodes[ni];
		const local = node.matrix ? new Float32Array(node.matrix) : m4.fromTRS(node.translation || [0, 0, 0], node.rotation || [0, 0, 0, 1], node.scale || [1, 1, 1]);
		const world = m4.mul(parent, local);
		if (node.mesh !== undefined) {
			for (const prim of json.meshes[node.mesh].primitives) {
				if ((prim.mode ?? 4) !== 4 || prim.attributes.POSITION === undefined) continue;
				const P = readAcc(prim.attributes.POSITION);
				const N = prim.attributes.NORMAL !== undefined ? readAcc(prim.attributes.NORMAL) : null;
				const count = P.length / 3;
				const idx = prim.indices !== undefined ? readAcc(prim.indices) : Float32Array.from({ length: count }, (_, k) => k);
				const w = world;
				const tp = (k) => [
					w[0] * P[k * 3] + w[4] * P[k * 3 + 1] + w[8] * P[k * 3 + 2] + w[12],
					w[1] * P[k * 3] + w[5] * P[k * 3 + 1] + w[9] * P[k * 3 + 2] + w[13],
					w[2] * P[k * 3] + w[6] * P[k * 3 + 1] + w[10] * P[k * 3 + 2] + w[14],
				];
				const tn = (k) => {
					const x = w[0] * N[k * 3] + w[4] * N[k * 3 + 1] + w[8] * N[k * 3 + 2];
					const y = w[1] * N[k * 3] + w[5] * N[k * 3 + 1] + w[9] * N[k * 3 + 2];
					const z = w[2] * N[k * 3] + w[6] * N[k * 3 + 1] + w[10] * N[k * 3 + 2];
					const l = Math.hypot(x, y, z) || 1;
					return [x / l, y / l, z / l];
				};
				for (let t = 0; t + 2 < idx.length; t += 3) {
					const ks = [idx[t], idx[t + 1], idx[t + 2]];
					const vs = ks.map(tp);
					let ns;
					if (N) ns = ks.map(tn);
					else {
						const [a, b, c] = vs;
						const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2];
						let cx = uy * vz - uz * vy, cy = uz * vx - ux * vz, cz = ux * vy - uy * vx;
						const l = Math.hypot(cx, cy, cz) || 1;
						ns = [[cx / l, cy / l, cz / l], [cx / l, cy / l, cz / l], [cx / l, cy / l, cz / l]];
					}
					for (let q = 0; q < 3; q++) { pos.push(vs[q]); nor.push(ns[q]); }
				}
			}
		}
		(node.children || []).forEach((c) => visit(c, world));
	};
	const scene = json.scenes ? json.scenes[json.scene || 0] : { nodes: json.nodes.map((_, i) => i) };
	scene.nodes.forEach((n) => visit(n, yaw));
	if (!pos.length) throw new Error('GLB has no triangle meshes');

	// Normalise: centre and scale to the built-in garment height.
	const mn = [Infinity, Infinity, Infinity], mx = [-Infinity, -Infinity, -Infinity];
	for (const p of pos) for (let c = 0; c < 3; c++) { mn[c] = Math.min(mn[c], p[c]); mx[c] = Math.max(mx[c], p[c]); }
	const H = 2.2, s = H / ((mx[1] - mn[1]) || 1);
	const cx = (mn[0] + mx[0]) / 2, cy = (mn[1] + mx[1]) / 2, cz = (mn[2] + mx[2]) / 2;
	const data = new Float32Array(pos.length * 7);
	let r = 0;
	for (let i = 0; i < pos.length; i++) {
		const x = (pos[i][0] - cx) * s, y = (pos[i][1] - cy) * s, z = (pos[i][2] - cz) * s;
		r = Math.max(r, Math.hypot(x, y));
		data.set([x, y, z, nor[i][0], nor[i][1], nor[i][2], 1], i * 7);
	}
	const top = H / 2;
	// Print placement is per-garment: our GLB models have different proportions
	// (the hoodie's bounding box includes the tall hood, the crewneck/tee don't),
	// so one offset puts the print too low on the crewneck. Values = fraction of H
	// measured down from the top; tuned against front-view renders of each model.
	const dyF = ({ hoodie: 0.52, crew: 0.39, tee: 0.40 })[kind] ?? 0.52;
	const dyB = ({ hoodie: 0.54, crew: 0.41, tee: 0.42 })[kind] ?? 0.54;
	return {
		data,
		zMid: 0,
		frontRect: [0, top - dyF * H, 0.16 * H, 0.16 * H],
		backRect: [0, top - dyB * H, 0.2 * H, 0.2 * H],
		height: H,
		centerY: 0,
		radius: Math.max(r, 1.1),
		glb: true,
	};
}

/* ---------------------------------------------------------- shaders */
const VS = `
attribute vec3 aPos; attribute vec3 aNor; attribute float aShade;
uniform mat4 uModel; uniform mat4 uViewProj; uniform mat3 uNormal;
varying vec3 vObj; varying vec3 vNObj; varying vec3 vNW; varying float vShade;
void main() {
	vObj = aPos; vNObj = aNor; vNW = uNormal * aNor; vShade = aShade;
	gl_Position = uViewProj * uModel * vec4(aPos, 1.0);
}`;
const FS = `
precision highp float;
uniform vec3 uColor; uniform sampler2D uFront; uniform sampler2D uBack;
uniform vec4 uFR; uniform vec4 uBR; uniform float uZMid; uniform float uGlb;
varying vec3 vObj; varying vec3 vNObj; varying vec3 vNW; varying float vShade;
vec3 lin(vec3 c) { return pow(c, vec3(2.2)); }
void main() {
	vec3 n = normalize(vNW);
	vec3 no = normalize(vNObj);
	float inside = 1.0;
	if (uGlb > 0.5 && !gl_FrontFacing) { n = -n; no = -no; inside = 0.55; }
	vec3 base = lin(uColor) * vShade;
	if (no.z > 0.3 && vObj.z > uZMid) {
		vec2 uv = vec2((vObj.x - uFR.x) / (2.0 * uFR.z) + 0.5, (uFR.y - vObj.y) / (2.0 * uFR.w) + 0.5);
		if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
			vec4 t = texture2D(uFront, uv);
			base = mix(base, lin(t.rgb), t.a * inside);
		}
	}
	if (no.z < -0.3 && vObj.z < uZMid) {
		vec2 uv = vec2((uBR.x - vObj.x) / (2.0 * uBR.z) + 0.5, (uBR.y - vObj.y) / (2.0 * uBR.w) + 0.5);
		if (uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0) {
			vec4 t = texture2D(uBack, uv);
			base = mix(base, lin(t.rgb), t.a * inside);
		}
	}
	vec3 L1 = normalize(vec3(0.45, 0.7, 0.85));
	vec3 L2 = normalize(vec3(-0.85, 0.15, 0.35));
	vec3 L3 = normalize(vec3(0.2, 0.35, -0.9));
	float k = max(dot(n, L1), 0.0), f = max(dot(n, L2), 0.0), b = max(dot(n, L3), 0.0);
	float hemi = 0.5 + 0.5 * n.y;
	vec3 lit = base * (0.26 + 0.22 * hemi + 0.66 * k + 0.2 * f + 0.14 * b) * inside;
	gl_FragColor = vec4(pow(lit, vec3(1.0 / 2.2)), 1.0);
}`;

/* ---------------------------------------------------------- helpers */
function hexToRgb(h) { const n = parseInt(h.slice(1), 16); return [(n >> 16 & 255) / 255, (n >> 8 & 255) / 255, (n & 255) / 255]; }
function luminance([r, g, b]) { const f = (c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)); return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); }
function loadImage(src) {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.decoding = 'async';
		if (!src.startsWith('data:') && !src.startsWith('blob:')) img.crossOrigin = 'anonymous';
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error('Image failed: ' + src));
		img.src = src;
	});
}
const INKS = { black: '#111111', white: '#F7F7F5', violet: '#7C3AED' };

/* ============================================================ mount */
export async function mount(root, cfg) {
	const stage = root.querySelector('[data-stage]');
	const canvas = root.querySelector('[data-canvas]');
	const form = root.querySelector('[data-controls]');
	const $ = (s) => root.querySelector(s);

	const glOpts = { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: 'low-power' };
	const gl = canvas.getContext('webgl2', glOpts) || canvas.getContext('webgl', glOpts);
	if (!gl) throw new Error('WebGL is not available');
	const isGL2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;

	const sh = (type, src) => {
		const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
		if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
		return s;
	};
	const prog = gl.createProgram();
	gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
	gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
	gl.linkProgram(prog);
	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
	gl.useProgram(prog);
	const A = { pos: gl.getAttribLocation(prog, 'aPos'), nor: gl.getAttribLocation(prog, 'aNor'), shade: gl.getAttribLocation(prog, 'aShade') };
	const U = {};
	['uModel', 'uViewProj', 'uNormal', 'uColor', 'uFront', 'uBack', 'uFR', 'uBR', 'uZMid', 'uGlb'].forEach((n) => { U[n] = gl.getUniformLocation(prog, n); });

	gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.CULL_FACE);
	gl.clearColor(0, 0, 0, 0);

	/* render-loop state (declared first: everything below may invalidate the frame) */
	let yaw = -0.5, vel = 0, target = null, auto = true, dirty = true, visible = true, dragging = false, running = false;

	/* print textures */
	const SIZE = 1024;
	const makePrint = () => {
		const c = document.createElement('canvas'); c.width = c.height = SIZE;
		const tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		return { c, ctx: c.getContext('2d'), tex };
	};
	const front = makePrint(), back = makePrint();
	const upload = (p) => {
		gl.bindTexture(gl.TEXTURE_2D, p.tex);
		gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, p.c);
		gl.generateMipmap(gl.TEXTURE_2D);
		dirty = true;
		kick();
	};
	upload(front); upload(back);

	/* state */
	const designs = cfg.designs || [];
	const S = {
		garment: 'hoodie', color: '#161616', colorName: 'Black', ink: 'auto',
		design: designs[1] ? designs[1].id : (designs[0] && designs[0].id), logoImg: null, logoFile: null,
		name: '', number: '',
	};
	const models = {};
	let model = null, vcount = 0;
	const vbo = gl.createBuffer();

	const inkColor = () => {
		if (S.ink !== 'auto') return INKS[S.ink];
		return luminance(hexToRgb(S.color)) > 0.35 ? INKS.black : INKS.white;
	};
	const inkLabel = () => (S.ink === 'auto' ? 'Auto (' + (inkColor() === INKS.black ? 'black' : 'white') + ')' : S.ink[0].toUpperCase() + S.ink.slice(1));

	/* ---- front print ---- */
	let frontToken = 0;
	async function drawFront() {
		const token = ++frontToken;
		const { ctx } = front;
		let img = null, tint = false;
		if (S.logoImg) img = S.logoImg;
		else {
			const d = designs.find((x) => x.id === S.design);
			if (d) {
				try { img = await loadImage(d.src); } catch (e) { img = null; }
				tint = d.tint !== false;
			}
		}
		if (token !== frontToken) return;
		ctx.clearRect(0, 0, SIZE, SIZE);
		if (img) {
			const iw = img.naturalWidth || img.width || SIZE, ih = img.naturalHeight || img.height || SIZE;
			const box = SIZE * 0.96, k = Math.min(box / iw, box / ih);
			const w = iw * k, h = ih * k, x = (SIZE - w) / 2, y = (SIZE - h) / 2;
			if (tint) {
				const t = document.createElement('canvas'); t.width = t.height = SIZE;
				const tc = t.getContext('2d');
				tc.drawImage(img, x, y, w, h);
				tc.globalCompositeOperation = 'source-in';
				tc.fillStyle = inkColor();
				tc.fillRect(0, 0, SIZE, SIZE);
				ctx.drawImage(t, 0, 0);
			} else {
				ctx.drawImage(img, x, y, w, h);
			}
		}
		upload(front);
		const label = S.logoImg ? 'Your logo' : (designs.find((x) => x.id === S.design) ? 'Design ' + S.design : 'Blank');
		const fn = $('[data-front-name]'); if (fn) fn.textContent = label;
		document.dispatchEvent(new CustomEvent('fmd:front', { detail: { design: S.logoImg ? null : S.design } }));
	}

	/* ---- back print: name + number ---- */
	const FONT = '"Archivo", "Helvetica Neue", Arial, sans-serif';
	function fitText(ctx, text, weight, px, maxW, cx, baseline, squeeze) {
		ctx.font = `${weight} ${px}px ${FONT}`;
		const w = ctx.measureText(text).width || 1;
		const sx = Math.min(squeeze, maxW / w);
		ctx.save();
		ctx.translate(cx, baseline);
		ctx.scale(sx, 1);
		ctx.fillText(text, 0, 0);
		ctx.restore();
	}
	function drawBack() {
		const { ctx } = back;
		ctx.clearRect(0, 0, SIZE, SIZE);
		ctx.fillStyle = inkColor();
		ctx.textAlign = 'center';
		ctx.textBaseline = 'alphabetic';
		if (S.name) fitText(ctx, S.name, 800, 190, SIZE * 0.92, SIZE / 2, 230, 0.78);
		if (S.number) fitText(ctx, S.number, 800, 700, SIZE * 0.8, SIZE / 2, S.name ? 900 : 820, 0.82);
		upload(back);
	}

	/* ---- model ---- */
	let modelToken = 0;
	async function setGarment(kind) {
		S.garment = kind;
		const token = ++modelToken;
		const m = cfg.models && cfg.models[kind];
		const key = kind + (m && m.url ? ':glb' : '');
		if (!models[key]) {
			if (m && m.url) {
				try { models[key] = await loadGLB(m.url, m.yaw, kind); } catch (e) {
					console.warn('[fmd] using built-in ' + kind + ' model:', e.message);
					models[key] = models[kind] || (models[kind] = buildBuiltin(kind));
				}
			} else {
				models[key] = buildBuiltin(kind);
			}
		}
		if (token !== modelToken) return;
		model = models[key];
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.bufferData(gl.ARRAY_BUFFER, model.data, gl.STATIC_DRAW);
		vcount = model.data.length / 7;
		dirty = true;
		kick();
		const hud = $('[data-hud-garment]');
		if (hud) hud.textContent = { hoodie: 'Hoodie', crew: 'Crewneck', tee: 'T-shirt' }[kind];
		dirty = true;
	}

	/* ---- sizing ---- */
	let W = 1, H = 1;
	function resize() {
		const dpr = Math.min(window.devicePixelRatio || 1, 2);
		const r = canvas.getBoundingClientRect();
		W = Math.max(1, Math.round(r.width * dpr));
		H = Math.max(1, Math.round(r.height * dpr));
		if (canvas.width !== W || canvas.height !== H) { canvas.width = W; canvas.height = H; }
		dirty = true;
		kick();
	}
	if ('ResizeObserver' in window) new ResizeObserver(resize).observe(stage);
	else window.addEventListener('resize', resize);
	resize();

	/* ---- render ---- */
	function render() {
		if (!model) return;
		gl.viewport(0, 0, W, H);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		const aspect = W / H, fov = 26 * Math.PI / 180;
		const hfov = 2 * Math.atan(Math.tan(fov / 2) * aspect);
		const r = Math.max(model.radius, model.height / 2) * 1.14;
		const dist = Math.max(r / Math.sin(fov / 2), r / Math.sin(hfov / 2));
		// look slightly below centre so the garment clears the Front/Back buttons
		const ty = model.centerY - r * 0.08;
		const eye = [0, ty + dist * 0.06, dist];
		const view = m4.lookAt(eye, [0, ty, 0], [0, 1, 0]);
		const proj = m4.persp(fov, aspect, dist * 0.2, dist * 3);
		const modelM = m4.mul(m4.rotX(0.04), m4.rotY(yaw));
		gl.useProgram(prog);
		gl.uniformMatrix4fv(U.uModel, false, modelM);
		gl.uniformMatrix4fv(U.uViewProj, false, m4.mul(proj, view));
		gl.uniformMatrix3fv(U.uNormal, false, m4.normal3(modelM));
		gl.uniform3fv(U.uColor, hexToRgb(S.color));
		gl.uniform4fv(U.uFR, model.frontRect);
		gl.uniform4fv(U.uBR, model.backRect);
		gl.uniform1f(U.uZMid, model.zMid);
		gl.uniform1f(U.uGlb, model.glb ? 1 : 0);
		gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, front.tex); gl.uniform1i(U.uFront, 0);
		gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, back.tex); gl.uniform1i(U.uBack, 1);
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
		gl.enableVertexAttribArray(A.pos); gl.vertexAttribPointer(A.pos, 3, gl.FLOAT, false, 28, 0);
		gl.enableVertexAttribArray(A.nor); gl.vertexAttribPointer(A.nor, 3, gl.FLOAT, false, 28, 12);
		gl.enableVertexAttribArray(A.shade); gl.vertexAttribPointer(A.shade, 1, gl.FLOAT, false, 28, 24);
		gl.drawArrays(gl.TRIANGLES, 0, vcount);
	}

	const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	if (reduced) { auto = false; yaw = 0; }
	var last = performance.now();
	function frame(now) {
		const dt = Math.min(0.05, (now - last) / 1000); last = now;
		let moving = false;
		if (!dragging) {
			if (target !== null) {
				const d = target - yaw;
				if (Math.abs(d) < 0.002) { yaw = target; target = null; } else { yaw += d * Math.min(1, dt * 9); moving = true; }
			} else if (Math.abs(vel) > 0.01) {
				yaw += vel * dt; vel *= Math.pow(0.04, dt); moving = true;
			} else if (auto) {
				yaw += dt * 0.35; moving = true;
			}
		}
		if (moving || dirty || dragging) { render(); dirty = false; updateViewButtons(); }
		// Sleep when nothing moves: no idle GPU/battery use on phones.
		if (visible && (moving || dragging || target !== null || auto)) requestAnimationFrame(frame); else running = false;
	}
	function kick() { if (!running && visible) { running = true; last = performance.now(); requestAnimationFrame(frame); } }
	if ('IntersectionObserver' in window) {
		new IntersectionObserver((es) => { visible = es[0].isIntersecting; if (visible) { dirty = true; kick(); } }).observe(stage);
	}
	document.addEventListener('visibilitychange', () => { visible = !document.hidden; if (visible) { dirty = true; kick(); } });

	/* ---- view buttons ---- */
	const viewBtns = Array.from(root.querySelectorAll('[data-view]'));
	let lastFacing = '';
	function updateViewButtons() {
		const facing = Math.cos(yaw) >= 0 ? 'front' : 'back';
		if (facing === lastFacing) return;
		lastFacing = facing;
		viewBtns.forEach((b) => b.setAttribute('aria-pressed', b.dataset.view === facing ? 'true' : 'false'));
	}
	function turnTo(view) {
		auto = false; vel = 0;
		const base = view === 'back' ? Math.PI : 0;
		target = base + Math.round((yaw - base) / TAU) * TAU;
		if (reduced) { yaw = target; target = null; dirty = true; }
		kick();
	}
	viewBtns.forEach((b) => b.addEventListener('click', () => turnTo(b.dataset.view)));

	/* ---- drag to turn (horizontal only; vertical swipes keep scrolling the page) ---- */
	let px = 0, pt = 0, pid = null;
	canvas.addEventListener('pointerdown', (e) => {
		pid = e.pointerId; px = e.clientX; pt = performance.now();
		dragging = true; auto = false; target = null; vel = 0;
		try { canvas.setPointerCapture(pid); } catch (err) { /* noop */ }
		kick();
	});
	canvas.addEventListener('pointermove', (e) => {
		if (!dragging || e.pointerId !== pid) return;
		const now = performance.now(), dx = e.clientX - px;
		const d = (dx / Math.max(240, canvas.clientWidth)) * Math.PI * 1.6;
		yaw += d;
		vel = d / Math.max(0.008, (now - pt) / 1000);
		px = e.clientX; pt = now;
	});
	const end = (e) => {
		if (e.pointerId !== pid) return;
		dragging = false; pid = null;
		if (performance.now() - pt > 80) vel = 0;
		vel = Math.max(-12, Math.min(12, vel));
	};
	canvas.addEventListener('pointerup', end);
	canvas.addEventListener('pointercancel', end);

	/* ---- controls ---- */
	form.addEventListener('change', (e) => {
		const t = e.target;
		if (t.name === 'garment') { setGarment(t.value); }
		if (t.name === 'color') {
			S.color = t.dataset.hex; S.colorName = t.dataset.name;
			const n1 = $('[data-color-name]'); if (n1) n1.textContent = S.colorName;
			const n2 = $('[data-hud-color]'); if (n2) n2.textContent = S.colorName;
			if (S.ink === 'auto') { drawFront(); drawBack(); }
			dirty = true;
		}
		if (t.name === 'ink') { S.ink = t.value; drawFront(); drawBack(); }
		kick();
	});

	const logoInput = $('[data-logo-input]');
	const logoNote = $('[data-logo-note]');
	if (logoInput) logoInput.addEventListener('change', async () => {
		const file = logoInput.files && logoInput.files[0];
		if (!file) return;
		if (!/^image\/(png|jpeg|webp)$/.test(file.type)) { logoNote.textContent = 'Choose a PNG, JPG or WEBP image.'; return; }
		if (file.size > 15 * 1024 * 1024) { logoNote.textContent = 'That file is over 15 MB. Choose a smaller image.'; return; }
		const url = URL.createObjectURL(file);
		try {
			S.logoImg = await loadImage(url);
			S.logoFile = file;
			logoNote.textContent = file.name + ' is on the chest.';
			await drawFront();
			turnTo('front');
		} catch (err) {
			logoNote.textContent = 'This image could not be read. Try a PNG or JPG.';
		}
	});

	const nameIn = $('[data-back-name]'), numIn = $('[data-back-number]');
	if (nameIn) {
		nameIn.addEventListener('input', () => { S.name = nameIn.value.toUpperCase().replace(/[^A-Z0-9 .'\-]/g, '').slice(0, 12); drawBack(); kick(); });
		nameIn.addEventListener('focus', () => turnTo('back'));
	}
	if (numIn) {
		numIn.addEventListener('input', () => { numIn.value = numIn.value.replace(/\D/g, '').slice(0, 2); S.number = numIn.value; drawBack(); kick(); });
		numIn.addEventListener('focus', () => turnTo('back'));
	}

	/* ---- boot ---- */
	try { if (document.fonts && document.fonts.load) await document.fonts.load(`800 100px ${FONT}`); } catch (e) { /* fallback font is fine */ }
	await setGarment(S.garment);
	await drawFront();
	drawBack();
	resize();
	stage.classList.add('is-ready');
	kick();

	return {
		setDesign(id) {
			S.design = id; S.logoImg = null; S.logoFile = null;
			if (logoInput) logoInput.value = '';
			if (logoNote) logoNote.textContent = 'PNG with a transparent background works best.';
			drawFront().then(() => turnTo('front'));
		},
		summary() {
			const g = { hoodie: 'Hoodie', crew: 'Crewneck', tee: 'T-shirt' }[S.garment];
			const d = designs.find((x) => x.id === S.design);
			const frontTxt = S.logoFile ? 'Customer logo (' + S.logoFile.name + ')' : (d ? 'Design ' + d.id + ' ' + d.name : 'Blank');
			const backTxt = [S.name, S.number].filter(Boolean).join(' ') || 'Blank';
			return {
				text: `${g} / ${S.colorName} / Front: ${frontTxt} / Back: ${backTxt} / Ink: ${inkLabel()}`,
				logoFile: S.logoFile,
			};
		},
		_debug: { S, get yaw() { return yaw; }, set yaw(v) { yaw = v; auto = false; dirty = true; kick(); }, gl2: isGL2 },
	};
}
