import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { buildAdminPayload } from '../lib/admin-form';

test.describe('Portfolio public experience', () => {
  test('homepage renders with one primary heading and working navigation targets', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('.hero-studio-title')).toContainText('ZIHAD');
    await expect(page.locator('.hero-studio-title')).toContainText('BEYOND THE ORDINARY.');
    await expect(page.locator('.hero-studio-manifesto')).toHaveText('DRIVEN BY CURIOSITY.');
    await expect(page.locator('.hero-studio-description')).toContainText('Hi, I’m Zihad — founder of Black Flash Hades.');
    const anchors = await page.locator('nav a[href^="#"]').evaluateAll((items) => items.map((item) => item.getAttribute('href')).filter(Boolean));
    for (const href of anchors) await expect(page.locator(href as string)).toHaveCount(1);
  });
  test('experience and education stay compact until a pathway is expanded', async ({ page }) => {
    await page.goto('/');
    const experienceGroups = page.locator('#experience .career-group');
    const educationGroups = page.locator('#education .career-group');
    await expect(experienceGroups).toHaveCount(4);
    await expect(educationGroups).toHaveCount(4);
    await expect(page.locator('#experience .career-feature')).toContainText('Founder & Creator');
    await expect(page.locator('#education .education-current')).toContainText('Ongoing College Education');

    for (const width of [390, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const dimensions = await page.evaluate(() => ({
        scroll: document.documentElement.scrollWidth,
        client: document.documentElement.clientWidth,
      }));
      expect(dimensions.scroll, `career sections overflow at ${width}px`).toBeLessThanOrEqual(dimensions.client);
    }

    for (let index = 0; index < 4; index += 1) {
      await experienceGroups.nth(index).locator('summary').click();
      await educationGroups.nth(index).locator('summary').click();
    }
    await expect(page.locator('#experience .career-item')).toHaveCount(15);
    await expect(page.locator('#education .career-item')).toHaveCount(7);
    await expect(page.locator('#experience .career-item').filter({ hasText: 'Minecraft Plugin Development' })).toBeVisible();
    await expect(page.locator('#education .career-item').filter({ hasText: 'Bachelor\'s in Computer Science' })).toBeVisible();
  });
  test('skills explorer filters categories, searches, and expands the complete toolkit', async ({ page }) => {
    await page.goto('/');
    const explorer = page.locator('.skills-explorer');
    await expect(explorer).toBeVisible();
    await expect(explorer.locator('.skill-card')).toHaveCount(8);

    const categoryFilter = explorer.getByLabel('Filter skills by discipline');
    await expect(categoryFilter).toBeVisible();
    await expect(explorer.locator('.skills-category-grid')).toHaveCount(0);
    await categoryFilter.selectOption('Creator Skills');
    await expect(explorer.locator('.skills-results-head h3')).toHaveText('Creator Skills');
    await expect(explorer.locator('.skill-card')).toHaveCount(7);

    await explorer.getByRole('textbox', { name: 'Search skills' }).fill('Video Editing');
    await expect(explorer.locator('.skill-card')).toHaveCount(1);
    await expect(explorer.locator('.skill-card h4')).toHaveText('Video Editing');

    await categoryFilter.selectOption('All');
    await explorer.getByRole('textbox', { name: 'Search skills' }).fill('');
    await expect(explorer.locator('.skill-card')).toHaveCount(8);
    await explorer.getByRole('button', { name: 'Show all 29 skills' }).click();
    await expect(explorer.locator('.skill-card')).toHaveCount(29);
  });
  test('public CMS collections stay compact and can reveal every published entry', async ({ page }) => {
    await page.goto('/');

    const projects = page.locator('#work [data-expandable-grid]');
    await expect(projects.locator('.project-reveal')).toHaveCount(4);
    await expect(projects.locator('.collection-grid-toggle')).toHaveCount(0);

    const services = page.locator('#services [data-expandable-grid]');
    await expect(services.locator('article')).toHaveCount(4);
    const showAllServices = page.locator('#services .collection-grid-toggle');
    await expect(showAllServices).toHaveText(/View all 6 services/);
    await showAllServices.click();
    await expect(services.locator('article')).toHaveCount(6);
    await expect(page.locator('#services .collection-grid-toggle')).toHaveAttribute('aria-expanded', 'true');
    await page.locator('#services .collection-grid-toggle').click();
    await expect(services.locator('article')).toHaveCount(4);

    await expect(page.locator('#media-library [data-media-card]')).toHaveCount(1);
    await expect(page.locator('#media-library .collection-grid-toggle')).toHaveCount(0);
    await expect(page.locator('#experience .career-group')).toHaveCount(4);
    await expect(page.locator('#education .career-group')).toHaveCount(4);

    for (const width of [320, 390, 600, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const geometry = await page.evaluate(() => {
        const controls = document.querySelector('.skills-explorer-controls')!.getBoundingClientRect();
        const filter = document.querySelector('.skills-category-select-control select')!.getBoundingClientRect();
        const search = document.querySelector('.skills-search')!.getBoundingClientRect();
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          controlsWidth: controls.width,
          filterRight: filter.right,
          searchRight: search.right,
        };
      });
      expect(geometry.scrollWidth, `page overflow at ${width}px`).toBeLessThanOrEqual(geometry.clientWidth);
      expect(geometry.filterRight).toBeLessThanOrEqual(geometry.clientWidth + 1);
      expect(geometry.searchRight).toBeLessThanOrEqual(geometry.clientWidth + 1);
      expect(geometry.controlsWidth).toBeGreaterThan(0);
    }
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
  test('hero hierarchy stays balanced on desktop and mobile', async ({ page }) => {
    await page.goto('/');
    const copy = page.locator('.hero-studio-copy');
    const artwork = page.locator('.hero-art-column');
    await expect(copy).toBeVisible();
    await expect(artwork).toBeVisible();
    for (const width of [390, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const geometry = await page.evaluate(() => {
        const copyRect = document.querySelector('.hero-studio-copy')!.getBoundingClientRect();
        const artRect = document.querySelector('.hero-art-column')!.getBoundingClientRect();
        const titleLine = document.querySelector('.hero-studio-title em')!.getBoundingClientRect();
        return {
          copyTop: copyRect.top,
          copyLeft: copyRect.left,
          copyRight: copyRect.right,
          artTop: artRect.top,
          artLeft: artRect.left,
          titleRight: titleLine.right,
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
        };
      });
      expect(geometry.scrollWidth, `hero overflows at ${width}px`).toBeLessThanOrEqual(geometry.clientWidth);
      if (width <= 900) {
        expect(geometry.copyTop, 'mobile copy should appear before the signature artwork').toBeLessThan(geometry.artTop);
      } else {
        expect(geometry.copyLeft).toBeLessThan(geometry.artLeft);
        expect(geometry.titleRight, `headline overlaps artwork at ${width}px`).toBeLessThanOrEqual(geometry.artLeft + 8);
      }
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
    await expect(page.locator('html')).toHaveCSS('overflow', 'hidden');
    await expect(dialog.locator('.media-lightbox-close')).toBeFocused();
    await page.keyboard.press('Shift+Tab');
    await expect(dialog.getByRole('link', { name: /download image/i })).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(dialog.locator('.media-lightbox-close')).toBeFocused();
    const desktopGeometry = await dialog.evaluate((element) => {
      const overlay = element.getBoundingClientRect();
      const panel = element.querySelector('.media-lightbox-panel')!.getBoundingClientRect();
      return { position: getComputedStyle(element).position, overlayWidth: overlay.width, overlayHeight: overlay.height, panelCenterX: panel.left + panel.width / 2, panelCenterY: panel.top + panel.height / 2, panelWidth: panel.width, panelHeight: panel.height };
    });
    const viewport = page.viewportSize()!;
    expect(desktopGeometry.position).toBe('fixed');
    expect(Math.abs(desktopGeometry.panelCenterX - viewport.width / 2)).toBeLessThan(4);
    expect(Math.abs(desktopGeometry.panelCenterY - viewport.height / 2)).toBeLessThan(4);
    expect(desktopGeometry.panelWidth).toBeLessThanOrEqual(viewport.width);
    expect(desktopGeometry.panelHeight).toBeLessThanOrEqual(viewport.height);
    const pageScrollBeforeWheel = await page.evaluate(() => window.scrollY);
    await page.mouse.wheel(0, 700);
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(pageScrollBeforeWheel);
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveCSS('overflow', 'hidden');
    await expect(preview).toBeFocused();
    await expect(dialog).toHaveCount(0);
    await preview.click();
    await expect(dialog).toBeVisible();
    await page.locator('.media-lightbox').click({ position: { x: 4, y: 4 } });
    await expect(dialog).toHaveCount(0);
  });

  test('media preview stays inside the mobile viewport and locks background scrolling', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/qa-media-fixture');
    const preview = page.locator('.media-showcase-image-button').first();
    await expect(preview).toBeVisible();
    await preview.click();
    const dialog = page.getByRole('dialog', { name: /image details/i });
    await expect(dialog).toBeVisible();
    const geometry = await dialog.locator('.media-lightbox-panel').evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { left: rect.left, top: rect.top, right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height, scrollHeight: element.scrollHeight, clientHeight: element.clientHeight };
    });
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.top).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(390);
    expect(geometry.bottom).toBeLessThanOrEqual(844);
    expect(geometry.width).toBeLessThanOrEqual(390);
    expect(geometry.height).toBeLessThanOrEqual(844);
    await expect(page.locator('body')).toHaveCSS('overflow', 'hidden');
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.locator('body')).not.toHaveCSS('overflow', 'hidden');
  });

  test('homepage is never served from stale ISR cache after CMS changes', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
    expect(response.headers()['cache-control'] || '').toMatch(/no-store|no-cache/);
  });

  test('production security headers are present on public pages', async ({ request }) => {
    const response = await request.get('/');
    expect(response.status()).toBe(200);
    const headers = response.headers();
    expect(headers['x-content-type-options']).toBe('nosniff');
    expect(headers['x-frame-options']).toBe('DENY');
    expect(headers['referrer-policy']).toBe('strict-origin-when-cross-origin');
    expect(headers['permissions-policy']).toContain('camera=()');
    expect(headers['strict-transport-security']).toContain('max-age=31536000');
    expect(headers['content-security-policy']).toContain("base-uri 'self'");
    expect(headers['content-security-policy']).toContain("form-action 'self'");
    expect(headers['content-security-policy']).toContain("object-src 'none'");
    expect(headers['content-security-policy']).toContain("frame-ancestors 'none'");
  });

  test('Admin navigation URLs reject executable schemes but allow internal anchors', () => {
    expect(() => buildAdminPayload('navigation_items', { label: 'Unsafe', href: 'javascript:alert(1)' }))
      .toThrow('href: enter a valid web address.');
    expect(buildAdminPayload('navigation_items', { label: 'About', href: '#about' }).href).toBe('#about');
  });

  test('SEO metadata matches the current owner identity and portfolio focus', async ({ page }) => {
    await page.goto('/');
    const metadata = await page.evaluate(() => ({
      title: document.title,
      description: document.querySelector('meta[name="description"]')?.getAttribute('content') || '',
      openGraphTitle: document.querySelector('meta[property="og:title"]')?.getAttribute('content') || '',
    }));
    expect(metadata.title).toBe('Zihad | Creator & Developer');
    expect(metadata.description).toContain('Zihad’s digital projects');
    expect(metadata.openGraphTitle).toBe(metadata.title);
    expect(metadata.title).not.toContain('H.HADES');
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

test.describe('Contact form interaction', () => {
  test('shows success and resets fields after the API responds', async ({ page }) => {
    await page.route('**/api/contact', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ ok: true }),
    }));
    await page.goto('/');
    const form = page.locator('.contact-form');
    await form.locator('input[name="name"]').fill('Portfolio QA');
    await form.locator('input[name="email"]').fill('qa@example.invalid');
    await form.locator('textarea[name="message"]').fill('This is a successful contact form interaction test.');
    await form.getByRole('button', { name: /send message/i }).click();
    await expect(form.getByText(/your message has been sent/i)).toBeVisible();
    await expect(form.locator('input[name="name"]')).toHaveValue('');
    await expect(form.locator('input[name="email"]')).toHaveValue('');
    await expect(form.locator('textarea[name="message"]')).toHaveValue('');
    await expect(form.getByRole('button', { name: /send message/i })).toBeEnabled();
  });
});

test.describe('Contact API validation', () => {
  test('rejects cross-origin requests before they can write', async ({ request }) => {
    const response = await request.post('/api/contact', {
      headers: { Origin: 'https://attacker.example' },
      data: { name: 'QA', email: 'qa@example.invalid', message: 'This is a rejected origin test.' },
    });
    expect(response.status()).toBe(403);
    expect((await response.json()).error).toBe('Invalid request origin.');
  });

  test('returns client errors for malformed, null and non-JSON request bodies', async ({ request }) => {
    const malformed = await request.post('/api/contact', {
      headers: { 'Content-Type': 'application/json' }, data: '{"name":',
    });
    expect(malformed.status()).toBe(400);

    const nullBody = await request.post('/api/contact', {
      headers: { 'Content-Type': 'application/json' }, data: 'null',
    });
    expect(nullBody.status()).toBe(400);

    const wrongType = await request.post('/api/contact', {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, data: 'name=qa',
    });
    expect(wrongType.status()).toBe(415);
  });

  test('rejects oversized payloads and quietly accepts the honeypot', async ({ request }) => {
    const oversized = await request.post('/api/contact', {
      headers: { 'Content-Type': 'application/json' },
      data: JSON.stringify({ name: 'QA', message: 'x'.repeat(17 * 1024) }),
    });
    expect(oversized.status()).toBe(413);

    const honeypot = await request.post('/api/contact', {
      data: { website: 'bot-filled-this', name: '', email: '', message: '' },
    });
    expect(honeypot.status()).toBe(200);
    expect(await honeypot.json()).toEqual({ ok: true });
  });

  test('valid contact submissions fail closed when the server-only token is missing', async ({ request }) => {
    const response = await request.post('/api/contact', {
      headers: { 'Content-Type': 'application/json' },
      data: { name: 'Portfolio QA', email: 'qa@example.invalid', message: 'This must not be stored without server auth.' },
    });
    expect(response.status()).toBe(503);
    expect((await response.json()).error).toBe('Contact form is not configured yet.');
  });

  test('contact API only accepts POST', async ({ request }) => {
    const response = await request.get('/api/contact');
    expect(response.status()).toBe(405);
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