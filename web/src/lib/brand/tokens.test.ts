import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { blend, contrast, hexToRgb, luminance, parseTokens, resolve } from './tokens.js';

describe('contrast helpers', () => {
	it('parses short and long hex', () => {
		expect(hexToRgb('#fff')).toEqual([255, 255, 255]);
		expect(hexToRgb('#16181d')).toEqual([22, 24, 29]);
		expect(() => hexToRgb('rgb(0 0 0)')).toThrow(/not a hex/);
	});

	it('matches the WCAG reference values', () => {
		expect(luminance('#000000')).toBe(0);
		expect(luminance('#ffffff')).toBeCloseTo(1);
		expect(contrast('#000', '#fff')).toBeCloseTo(21);
		expect(contrast('#fff', '#000')).toBeCloseTo(21);
		expect(contrast('#777777', '#ffffff')).toBeCloseTo(4.48, 2);
	});

	it('blends a translucent colour over an opaque one', () => {
		expect(blend('#ffffff', '#000000', 1)).toBe('#ffffff');
		expect(blend('#ffffff', '#000000', 0)).toBe('#000000');
		expect(blend('#ffffff', '#000000', 0.5)).toBe('#808080');
		expect(blend('#e8a33d', '#16181d', 0.25)).toBe('#4b3b25');
	});
});

describe('parseTokens / resolve', () => {
	const sample = `
		@import 'x';
		:root { --a: #111111; --b: var(--a); /* --c: #ignored; */ }
		.dark { --b: #eeeeee; }
		@layer utilities { button { --a: #ignored; } }
		.jl-on-dark { --d: #ignored; }`;

	it('splits light and dark, dark inherits the rest', () => {
		const { light, dark } = parseTokens(sample);
		expect(light).toEqual({ '--a': '#111111', '--b': 'var(--a)' });
		expect(dark).toEqual({ '--a': '#111111', '--b': '#eeeeee' });
	});

	it('follows var() chains and rejects unknown or circular names', () => {
		const { light } = parseTokens(sample);
		expect(resolve(light, '--b')).toBe('#111111');
		expect(() => resolve(light, '--nope')).toThrow(/unknown/);
		expect(() => resolve({ '--x': 'var(--y)', '--y': 'var(--x)' }, '--x')).toThrow(/circular/);
	});
});

describe('junkerlabs.css', () => {
	// read from disk: vitest hands CSS imports (also ?raw) back empty, and under jsdom
	// import.meta.url is no file: URL. vitest runs from web/.
	const css = readFileSync('src/lib/brand/junkerlabs.css', 'utf8');
	const { light, dark } = parseTokens(css);

	// every colour the shadcn components and app.css map in @theme
	const REQUIRED = [
		'background', 'foreground', 'card', 'card-foreground', 'popover', 'popover-foreground',
		'primary', 'primary-foreground', 'secondary', 'secondary-foreground', 'muted',
		'muted-foreground', 'accent', 'accent-foreground', 'destructive', 'border', 'input',
		'ring', 'link', 'header', 'header-foreground', 'header-muted', 'header-ring', 'logo-ink',
		'logo-dot', 'logo-muted', 'glass', 'shape-amber', 'shape-ink'
	];

	it.each(['light', 'dark'] as const)('defines every semantic token (%s)', (mode) => {
		const tokens = mode === 'light' ? light : dark;
		for (const name of REQUIRED) expect(() => resolve(tokens, `--${name}`)).not.toThrow();
	});

	// brand/README.md: ink, off-white paper, amber as the single accent, logo colours
	it('uses the junkerlabs palette for the brand-carrying tokens', () => {
		expect(resolve(light, '--foreground')).toBe('#16181d');
		expect(resolve(light, '--background')).toBe('#f4f4f1');
		expect(resolve(light, '--primary')).toBe('#16181d');
		expect(resolve(light, '--header')).toBe('#16181d');
		expect(resolve(light, '--header-foreground')).toBe('#f4f4f1');
		expect(resolve(light, '--header-muted')).toBe('#b9bbc0');
		expect(resolve(light, '--muted-foreground')).toBe('#5a5d63');
		expect(resolve(light, '--jl-amber')).toBe('#e8a33d');
		expect(resolve(dark, '--ring')).toBe('#e8a33d');
		expect([resolve(light, '--logo-ink'), resolve(light, '--logo-dot'), resolve(light, '--logo-muted')])
			.toEqual(['#16181d', '#d48a1c', '#5a5d63']);
		expect([resolve(dark, '--logo-ink'), resolve(dark, '--logo-dot'), resolve(dark, '--logo-muted')])
			.toEqual(['#f4f4f1', '#e8a33d', '#b9bbc0']);
	});

	// links are ink, only the underline is amber (no coloured link text)
	it.each(['light', 'dark'] as const)('keeps links in the text colour (%s)', (mode) => {
		const tokens = mode === 'light' ? light : dark;
		expect(resolve(tokens, '--link')).toBe(resolve(tokens, '--foreground'));
	});

	// focus ring and other non-text UI: WCAG 1.4.11 asks for 3:1 against the surface
	it.each(['light', 'dark'] as const)('keeps the focus ring visible (%s)', (mode) => {
		const tokens = mode === 'light' ? light : dark;
		for (const bg of ['background', 'card']) {
			expect(contrast(resolve(tokens, '--ring'), resolve(tokens, `--${bg}`))).toBeGreaterThanOrEqual(3);
		}
		expect(contrast(resolve(tokens, '--header-ring'), resolve(tokens, '--header'))).toBeGreaterThanOrEqual(3);
	});

	// text on its surface must reach WCAG AA (4.5:1) in both modes
	const TEXT_PAIRS: [string, string][] = [
		['foreground', 'background'],
		['card-foreground', 'card'],
		['popover-foreground', 'popover'],
		['primary-foreground', 'primary'],
		['secondary-foreground', 'secondary'],
		['muted-foreground', 'muted'],
		['muted-foreground', 'background'],
		['muted-foreground', 'card'],
		['accent-foreground', 'accent'],
		['link', 'background'],
		['link', 'card'],
		['destructive', 'card'],
		['destructive', 'background'],
		['header-foreground', 'header'],
		['header-muted', 'header']
	];

	it.each(['light', 'dark'] as const)('keeps text readable (%s)', (mode) => {
		const tokens = mode === 'light' ? light : dark;
		const failing = TEXT_PAIRS.map(([fg, bg]) => ({
			pair: `${fg} on ${bg}`,
			ratio: contrast(resolve(tokens, `--${fg}`), resolve(tokens, `--${bg}`))
		})).filter((p) => p.ratio < 4.5);
		expect(failing).toEqual([]);
	});

	// overdue badge in the nav (todos/NavCounter.svelte): white on red in light,
	// background colour on the light red in dark
	it.each([
		['light', '#ffffff'],
		['dark', '--background']
	] as const)('keeps the overdue badge readable (%s)', (mode, fg) => {
		const tokens = mode === 'light' ? light : dark;
		const text = fg.startsWith('--') ? resolve(tokens, fg) : fg;
		expect(contrast(text, resolve(tokens, '--destructive'))).toBeGreaterThanOrEqual(4.5);
	});

	// glass keeps text at 4.5:1 or more (brand/README.md, Glass): worst case is the glass
	// straight over the full shape colour (the shapes are blurred and fainter in reality)
	it.each(['light', 'dark'] as const)('keeps text readable on glass (%s)', (mode) => {
		const tokens = mode === 'light' ? light : dark;
		const alpha = parseFloat(tokens['--glass-opacity']) / 100;
		expect(alpha).toBeGreaterThan(0);
		const failing = [];
		for (const shape of ['shape-amber', 'shape-ink', 'background']) {
			const surface = blend(resolve(tokens, '--glass'), resolve(tokens, `--${shape}`), alpha);
			for (const fg of ['foreground', 'muted-foreground']) {
				const ratio = contrast(resolve(tokens, `--${fg}`), surface);
				if (ratio < 4.5) failing.push({ pair: `${fg} on glass over ${shape}`, ratio });
			}
		}
		expect(failing).toEqual([]);
	});
});
