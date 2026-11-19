import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Portfolio public experience', () => {
  test('homepage renders with one primary heading and working navigation targets', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('nav')).toBeVisible();
    const anchors = await page.locator('nav a[href^="#"]').evaluateAll((items) => items.map((item) => item.getAttribute('href')).filter(Boolean));
    for (const href of anchors) await expect(page.locator(href as string)).toHaveCount(1);
  });
  test('both themes use solid black or white with no neon glow', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('hades-theme'));
    await page.reload();
    const inspectTheme = async (theme: 'dark' | 'light', expected: string) => {
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor), { timeout: 5_000 }).toBe(expected);
      const result = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('html, body, main, .creator-band, .work-section, .media-showcase-card'));
        const glow = Array.from(document.querySelectorAll('body *')).some((element) => {
          const style = getComputedStyle(element);
          return style.boxShadow !== 'none' || style.textShadow !== 'none' || style.filter !== 'none';
        });
        return {
          backgrounds: elements.map((element) => getComputedStyle(element).backgroundColor),
          pageOverlay: getComputedStyle(document.querySelector('main')!, '::before').display,
          glow,
        };
      });
      expect(result.backgrounds.every((color) => color === expected || color === 'rgba(0, 0, 0, 0)' || color === 'rgb(7, 7, 7)'), JSON.stringify({ theme, expected, backgrounds: result.backgrounds })).toBe(true);
      expect(result.pageOverlay).toBe('none');
      expect(result.glow).toBe(false);
    };
    await inspectTheme('dark', 'rgb(0, 0, 0)');
    await page.getByRole('button', { name: /toggle color theme/i }).click();
    await inspectTheme('light', 'rgb(255, 255, 255)');
  });
  test('responsive layouts have no horizontal page overflow', async ({ page }) => {
    await page.goto('/');
    for (const width of [320, 390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
      expect(dimensions.scroll, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(dimensions.client);
    }
  });
  test('hero 3D tilt responds to pointer and respects reduced motion', async ({ page }) => {
    await page.goto('/');
    const emblem = page.locator('.emblem-interactive');
    await expect(emblem).toHaveClass(/motion-surface/);
    await emblem.hover({ position: { x: 18, y: 18 } });
    await page.waitForTimeout(300);
    const transform = await emblem.evaluate((element) => getComputedStyle(element).transform);
    expect(transform).not.toBe('none');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    await expect(page.locator('.emblem-interactive')).not.toHaveClass(/motion-surface/);
  });
  test('real homepage reveal, hero entrance and button hover animations are applied', async ({ page }) => {
    await page.goto('/');
    const heroTitle = page.locator('.hero-studio-title');
    await expect(heroTitle).toBeVisible();
    const heroAnimation = await heroTitle.locator('> span').evaluate((element) => getComputedStyle(element).animationName);
    expect(heroAnimation).toBe('hades-hero-arrive');

    const cta = page.locator('.nav-cta');
    await expect(cta).toBeVisible();
    await cta.hover();
    await expect.poll(() => cta.evaluate((element) => getComputedStyle(element).transform)).toContain(', -3)');

    const loader = await page.evaluate(() => {
      const form = document.createElement('form');
      form.className = 'contact-form';
      const button = document.createElement('button');
      button.disabled = true;
      form.append(button);
      document.body.append(form);
      const style = getComputedStyle(button, '::after');
      const result = { animation: style.animationName, width: style.width };
      form.remove();
      return result;
    });
    expect(loader.animation).toBe('hades-spinner');
    expect(loader.width).toBe('13px');

    const reveal = page.locator('#about .reveal').first();
    await reveal.scrollIntoViewIfNeeded();
    await expect.poll(() => reveal.evaluate((element) => element.classList.contains('is-visible'))).toBe(true);
    await expect.poll(() => reveal.evaluate((element) => getComputedStyle(element).opacity)).toBe('1');

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    const reduced = await page.locator('.hero-studio-title > span').evaluate((element) => ({
      animation: getComputedStyle(element).animationName,
      opacity: getComputedStyle(element).opacity,
      transform: getComputedStyle(element).transform,
    }));
    expect(reduced.animation).toBe('none');
    expect(reduced.opacity).toBe('1');
    expect(reduced.transform).toBe('none');
  });
  test('published media library assets render in the glass gallery and filters work', async ({ page }) => {
    await page.goto('/');
    const gallery = page.locator('#media-library');
    if (await gallery.count() === 0) {
      await expect(page.locator('nav a[href="#media-library"]')).toHaveCount(0);
      return;
    }
    await expect(gallery).toBeVisible();
    const assetCount = await gallery.locator('[data-media-card]').count();
    expect(assetCount).toBeGreaterThan(0);
    await expect(gallery.locator('.media-showcase-image img')).toHaveCount(await gallery.locator('.media-showcase-image').count());
    await expect(page.locator('nav a[href="#media-library"]')).toBeVisible();
    await gallery.locator('[data-media-filter="video"]').click();
    await expect(gallery.locator('[data-media-card]')).toHaveCount(0);
    await expect(gallery.getByText('NO ASSETS IN THIS FORMAT')).toBeVisible();
    await gallery.locator('[data-media-filter="all"]').click();
    await expect(gallery.locator('[data-media-card]')).toHaveCount(assetCount);
  });
  test('media image opens a detailed preview and closes from the panel or backdrop', async ({ page }) => {
    await page.goto('/');
    let gallery = page.locator('#media-library');
    let preview = gallery.locator('.media-showcase-image-button').first();
    if (await preview.count() === 0) {
      // Use a local SVG fixture when the real public library has no published image.
      await page.goto('/qa-media-fixture');
      gallery = page.locator('#media-library');
      preview = gallery.locator('.media-showcase-image-button').first();
    }
    await expect(preview).toBeVisible();
    await preview.click();
    const dialog = page.getByRole('dialog', { name: /image details/i });
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.media-lightbox-image-wrap img')).toBeVisible();
    await expect(dialog.getByText(/image \/ media library/i)).toBeVisible();
    await expect(dialog.getByRole('link', { name: /download image/i })).toHaveAttribute('download');
    await page.getByRole('button', { name: /close image preview/i }).click();
    await expect(dialog).toHaveCount(0);
    await preview.click();
    await expect(dialog).toBeVisible();
    await page.locator('.media-lightbox').click({ position: { x: 4, y: 4 } });
    await expect(dialog).toHaveCount(0);
  });

  test('homepage is never served from stale ISR cache after CMS changes', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control'] || '').toMatch(/no-store|no-cache/);
  });

  test('favicon and search crawler endpoints are available', async ({ request }) => {
    const favicon = await request.get('/favicon.svg');
    expect(favicon.status()).toBe(200);
    expect(favicon.headers()['content-type']).toContain('image/svg+xml');
    const robots = await request.get('/robots.txt');
    expect(robots.status()).toBe(200);
    expect(await robots.text()).toContain('Sitemap: https://hades-portfolio-amber.vercel.app/sitemap.xml');
    const sitemap = await request.get('/sitemap.xml');
    expect(sitemap.status()).toBe(200);
    expect(await sitemap.text()).toContain('https://hades-portfolio-amber.vercel.app');
  });

  test('homepage has no serious or critical automated accessibility violations in either theme', async ({ page }) => {
    await page.goto('/');
    const scanTheme = async (theme: 'dark' | 'light') => {
      const results = await new AxeBuilder({ page }).exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
      expect(serious, `${theme} theme: ${JSON.stringify(serious.map((item) => ({ id: item.id, help: item.help, nodes: item.nodes.length })), null, 2)}`).toEqual([]);
    };
    await scanTheme('dark');
    await page.getByRole('button', { name: /toggle color theme/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await scanTheme('light');
  });
});

test.describe('Admin entry', () => {
  test('admin route shows labelled sign-in fields and no public sign-up', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByRole('heading', { name: /admin access/i })).toBeVisible();
    await expect(page.getByLabel(/email address/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in securely/i })).toBeVisible();
    await expect(page.getByText(/no default password or public signup/i)).toBeVisible();
  });
});