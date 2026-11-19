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
  test('published media library assets render in the glass gallery and filters work', async ({ page }) => {
    await page.goto('/');
    const gallery = page.locator('#media-library');
    await expect(gallery).toBeVisible();
    await expect(gallery.locator('[data-media-card]')).toHaveCount(2);
    await expect(gallery.locator('.media-showcase-image img')).toHaveCount(2);
    await expect(page.locator('nav a[href="#media-library"]')).toBeVisible();
    await gallery.locator('[data-media-filter="video"]').click();
    await expect(gallery.locator('[data-media-card]')).toHaveCount(0);
    await expect(gallery.getByText('NO ASSETS IN THIS FORMAT')).toBeVisible();
    await gallery.locator('[data-media-filter="all"]').click();
    await expect(gallery.locator('[data-media-card]')).toHaveCount(2);
  });
  test('homepage has no serious or critical automated accessibility violations', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).exclude('iframe').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
    const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
    expect(serious, JSON.stringify(serious.map((item) => ({ id: item.id, help: item.help, nodes: item.nodes.length })), null, 2)).toEqual([]);
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