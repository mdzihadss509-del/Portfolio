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
  test('the full ZIHAD headline keeps its final D visible across breakpoints and themes', async ({ page }) => {
    await page.goto('/');
    const viewports = [320, 390, 768, 1024, 1440];

    for (const theme of ['dark', 'light'] as const) {
      await page.evaluate((value) => {
        document.documentElement.dataset.theme = value;
        document.documentElement.style.colorScheme = value;
      }, theme);

      for (const width of viewports) {
        await page.setViewportSize({ width, height: 900 });
        const geometry = await page.locator('.hero-studio-title > span').evaluate((element) => {
          const title = element as HTMLElement;
          const copy = title.closest('.hero-studio-copy') as HTMLElement | null;
          const textNode = title.firstChild;
          const lastGlyph = document.createRange();

          if (!copy || !textNode) throw new Error('The ZIHAD name or its copy container is missing.');

          lastGlyph.setStart(textNode, Math.max(0, textNode.textContent!.length - 1));
          lastGlyph.setEnd(textNode, textNode.textContent!.length);

          const spanRect = title.getBoundingClientRect();
          const copyRect = copy.getBoundingClientRect();
          const glyphRect = lastGlyph.getBoundingClientRect();
          const style = getComputedStyle(title);
          const fontSize = Number.parseFloat(style.fontSize);

          return {
            spanRight: spanRect.right,
            copyRight: copyRect.right,
            glyphWidth: glyphRect.width,
            glyphRight: glyphRect.right,
            letterSpacingRatio: Number.parseFloat(style.letterSpacing) / fontSize,
            rightPaddingRatio: Number.parseFloat(style.paddingRight) / fontSize,
            overflow: style.overflowX,
          };
        });

        expect(geometry.glyphWidth, `final D is missing at ${width}px in ${theme} mode`).toBeGreaterThan(0);
        expect(geometry.glyphRight, `final D exceeds its name box at ${width}px in ${theme} mode`).toBeLessThanOrEqual(geometry.spanRight + 1);
        expect(geometry.spanRight, `name box exceeds its copy column at ${width}px in ${theme} mode`).toBeLessThan(geometry.copyRight);
        expect(geometry.letterSpacingRatio).toBeGreaterThanOrEqual(-0.06);
        expect(geometry.rightPaddingRatio).toBeGreaterThanOrEqual(0.07);
        expect(geometry.overflow).toBe('visible');
      }
    }
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

    const categoryFilter = explorer.locator('.skills-discipline-trigger');
    await expect(categoryFilter).toBeVisible();
    await expect(explorer.locator('.skills-category-grid')).toHaveCount(0);
    await categoryFilter.click();
    await expect(explorer.getByRole('listbox', { name: 'Choose a discipline' })).toBeVisible();
    await explorer.getByRole('option', { name: /Creator Skills/ }).click();
    await expect(explorer.locator('.skills-discipline-panel')).toHaveCount(0);
    await expect(explorer.locator('.skills-results-head h3')).toHaveText('Creator Skills');
    await expect(explorer.locator('.skill-card')).toHaveCount(7);

    await explorer.getByRole('textbox', { name: 'Search skills' }).fill('Video Editing');
    await expect(explorer.locator('.skill-card')).toHaveCount(1);
    await expect(explorer.locator('.skill-card h4')).toHaveText('Video Editing');

    await categoryFilter.click();
    await explorer.getByRole('option', { name: /All disciplines/ }).click();
    await explorer.getByRole('textbox', { name: 'Search skills' }).fill('');
    await expect(explorer.locator('.skill-card')).toHaveCount(8);
    await explorer.getByRole('button', { name: 'Show all 29 skills' }).click();
    await expect(explorer.locator('.skill-card')).toHaveCount(29);

    await page.setViewportSize({ width: 390, height: 844 });
    await categoryFilter.click();
    const mobilePanel = explorer.locator('.skills-discipline-panel');
    await expect(mobilePanel).toBeVisible();
    const panelBounds = await mobilePanel.boundingBox();
    expect(panelBounds).not.toBeNull();
    expect(panelBounds!.x).toBeGreaterThanOrEqual(0);
    expect(panelBounds!.y).toBeGreaterThanOrEqual(0);
    expect(panelBounds!.x + panelBounds!.width).toBeLessThanOrEqual(390);
    expect(panelBounds!.y + panelBounds!.height).toBeLessThanOrEqual(844);
    await explorer.getByRole('option', { name: /Creator Skills/ }).click();
    await expect(explorer.locator('.skills-results-head h3')).toHaveText('Creator Skills');
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
        const filter = document.querySelector('.skills-discipline-trigger')!.getBoundingClientRect();
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
  test('both themes keep strong contrast, clear panel hierarchy and glow only on identity accents', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'dark' });
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('hades-theme'));
    await page.reload();

    const inspectTheme = async (theme: 'dark' | 'light', expected: string) => {
      await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
      await expect.poll(() => page.evaluate(() => getComputedStyle(document.body).backgroundColor), { timeout: 5_000 }).toBe(expected);
      const result = await page.evaluate(() => {
        const get = (selector: string) => {
          const element = document.querySelector(selector);
          return element ? getComputedStyle(element).backgroundColor : '';
        };
        const accent = getComputedStyle(document.querySelector('.section-no')!).color;
        const main = document.querySelector('main')!;
        const backgrounds = [
          getComputedStyle(main).backgroundImage,
          getComputedStyle(main, '::before').backgroundImage,
          getComputedStyle(document.querySelector('.hero-studio')!, '::before').backgroundImage,
          getComputedStyle(document.querySelector('.media-showcase')!, '::before').backgroundImage,
          getComputedStyle(document.querySelector('.creator-band')!).backgroundImage,
          getComputedStyle(document.querySelector('.creator-visual')!).backgroundImage,
          getComputedStyle(document.querySelector('.media-showcase-preview')!).backgroundImage,
        ];
        const backgroundGlow = backgrounds.some((background) => background.includes('radial-gradient'));
        const brandGlow = getComputedStyle(document.querySelector('.brand-mark')!).boxShadow;
        const textGlow = getComputedStyle(document.querySelector('.hero-studio-title em')!).filter;
        return {
          body: get('body'),
          main: get('main'),
          creator: get('.creator-band'),
          creatorBackgroundImage: getComputedStyle(document.querySelector('.creator-band')!).backgroundImage,
          ticker: get('.ticker'),
          tickerBackgroundImage: getComputedStyle(document.querySelector('.ticker')!).backgroundImage,
          panel: get('.project-card'),
          accent,
          redAccent: getComputedStyle(document.documentElement).getPropertyValue('--red').trim(),
          pageOverlay: getComputedStyle(main, '::before').display,
          backgroundGlow,
          brandGlow,
          textGlow,
        };
      });
      expect(result.body).toBe(expected);
      expect(result.main).toBe(expected);
      expect(result.creator).toBe(expected);
      expect(result.creatorBackgroundImage).toBe('none');
      expect(result.tickerBackgroundImage).toBe('none');
      expect(result.pageOverlay).toBe('none');
      expect(result.backgroundGlow).toBe(false);
      expect(result.brandGlow).not.toBe('none');
      expect(result.brandGlow).not.toContain('rgba(0, 0, 0, 0)');
      expect(result.textGlow).not.toBe('none');
      expect(result.textGlow).not.toContain('rgba(0, 0, 0, 0)');
      if (theme === 'dark') {
        expect(result.accent).toBe('rgb(167, 139, 250)');
        expect(result.redAccent).toBe('#e65c68');
        expect(result.ticker).toBe(expected);
      }
      if (theme === 'light') {
        expect(result.accent).toBe('rgb(37, 99, 235)');
        expect(result.redAccent).toBe('#b83d55');
        expect(result.ticker).toBe(expected);
        expect(result.panel).toBe('rgb(255, 255, 255)');
      }
    };

    await inspectTheme('dark', 'rgb(0, 0, 0)');
    await page.getByRole('button', { name: /toggle color theme/i }).click();
    await inspectTheme('light', 'rgb(255, 255, 255)');
  });

  test('uses the operating system theme by default and preserves a manual theme choice', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');

    await page.getByRole('button', { name: /toggle color theme/i }).click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.emulateMedia({ colorScheme: 'dark' });
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');

    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await page.evaluate(() => localStorage.removeItem('hades-theme'));
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('buttons provide hover and press feedback, while inputs show clear focus states in both themes', async ({ page }) => {
    await page.emulateMedia({ colorScheme: 'light' });
    await page.goto('/');
    const cta = page.locator('.nav-cta');
    await expect(cta).toBeVisible();
    const transition = await cta.evaluate((element) => getComputedStyle(element).transitionDuration);
    expect(transition.split(',').some((value) => Number.parseFloat(value) > 0)).toBe(true);

    await cta.hover();
    const hoverTransform = await cta.evaluate((element) => getComputedStyle(element).transform);
    expect(hoverTransform).not.toBe('none');
    const bounds = await cta.boundingBox();
    expect(bounds).not.toBeNull();
    await page.mouse.move(bounds!.x + bounds!.width / 2, bounds!.y + bounds!.height / 2);
    await page.mouse.down();
    await expect.poll(() => cta.evaluate((element) => getComputedStyle(element).transform)).not.toBe(hoverTransform);
    await page.mouse.up();

    const field = page.locator('.contact-form input').first();
    await field.focus();
    await expect.poll(() => field.evaluate((element) => getComputedStyle(element).borderColor)).toBe('rgb(33, 91, 216)');
    await expect.poll(() => field.evaluate((element) => getComputedStyle(element).outlineStyle)).toBe('solid');
    await page.getByRole('button', { name: /toggle color theme/i }).click();
    await field.blur();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
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
    await page.emulateMedia({ colorScheme: 'dark' });
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

  test('admin sign-in remains accessible in both system themes', async ({ page }) => {
    for (const theme of ['dark', 'light'] as const) {
      await page.emulateMedia({ colorScheme: theme });
      await page.goto('/admin');
      await page.locator('.login-card').evaluate(async (element) => {
        await Promise.all(element.getAnimations().map((animation) => animation.finished));
      });
      const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
      const serious = results.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact || ''));
      expect(serious, `${theme} admin sign-in: ${JSON.stringify(serious.map((item) => ({ id: item.id, help: item.help, nodes: item.nodes.length })), null, 2)}`).toEqual([]);
    }
  });

  test('delete confirmation traps focus, closes with Escape and restores focus', async ({ page }) => {
    const mockUserId = '00000000-0000-4000-8000-000000000001';
    await page.route('**/auth/v1/token*', (route) => route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'mock-access-token',
        token_type: 'bearer',
        expires_in: 3600,
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        refresh_token: 'mock-refresh-token',
        user: { id: mockUserId, aud: 'authenticated', role: 'authenticated', email: 'qa@example.test', app_metadata: { provider: 'email', providers: ['email'] }, user_metadata: {}, created_at: '2026-01-01T00:00:00.000Z' },
      }),
    }));
    await page.route('**/rest/v1/**', async (route) => {
      const url = new URL(route.request().url());
      if (url.pathname.endsWith('/user_roles')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ role: 'admin' }]) });
      } else if (url.pathname.endsWith('/projects')) {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([{ id: 'qa-project-1', title: 'QA only project', summary: 'Mock row for interface testing', published: true }]) });
      } else {
        await route.continue();
      }
    });

    await page.goto('/admin');
    await page.getByLabel(/email address/i).fill('qa@example.test');
    await page.getByLabel(/password/i).fill('mock-password');
    await page.getByRole('button', { name: /sign in securely/i }).click();
    await page.getByRole('button', { name: 'Projects', exact: true }).click();
    await expect(page.getByText('QA only project')).toBeVisible();

    const deleteTrigger = page.getByRole('button', { name: 'Delete' });
    await deleteTrigger.click();
    const dialog = page.getByRole('dialog', { name: 'Delete permanently?' });
    await expect(dialog).toBeVisible();
    const cancel = dialog.getByRole('button', { name: 'Cancel' });
    const confirm = dialog.getByRole('button', { name: 'Delete permanently' });
    await expect(cancel).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(confirm).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(cancel).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(deleteTrigger).toBeFocused();
  });
});

test.describe('Jitter-inspired motion system', () => {
  test('project masks, media reveals and compact section rhythm work with reduced-motion support', async ({ page }) => {
    await page.goto('/');
    const project = page.locator('.project-reveal').first();
    await expect(project).toHaveAttribute('data-reveal-variant', 'mask');
    await project.scrollIntoViewIfNeeded();
    await expect.poll(() => project.locator('.project-art').evaluate((element) => getComputedStyle(element).clipPath)).toBe('inset(0px)');

    const media = page.locator('.media-card-reveal').first();
    if (await media.count()) {
      await expect(media).toHaveAttribute('data-reveal-variant', 'grid');
      await media.scrollIntoViewIfNeeded();
      await expect.poll(() => media.locator('.media-showcase-image-button').evaluate((element) => getComputedStyle(element).clipPath)).toBe('inset(0px)');
    }

    const sectionSpacing = await page.locator('#about').evaluate((element) => Number.parseFloat(getComputedStyle(element).paddingTop));
    expect(sectionSpacing).toBeLessThanOrEqual(92);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.reload();
    const reduced = await page.locator('.project-reveal .project-art').first().evaluate((element) => ({
      clipPath: getComputedStyle(element).clipPath,
      transform: getComputedStyle(element).transform,
      transitionDuration: getComputedStyle(element).transitionDuration,
    }));
    expect(reduced.clipPath).toBe('none');
    expect(reduced.transform).toBe('none');
    expect(reduced.transitionDuration).toBe('0s');
  });
});

test.describe('Clean canvas and identity accents', () => {
  test('keeps ambient glow off page backdrops while preserving restrained logo and type accents', async ({ page }) => {
    await page.goto('/');
    const styles = await page.evaluate(() => {
      const main = document.querySelector('main')!;
      const brand = document.querySelector('.brand-mark')!;
      const brandText = document.querySelector('.brand > span:last-child')!;
      const titleAccent = document.querySelector('.hero-studio-title em')!;
      const hero = document.querySelector('.hero-studio')!;
      const media = document.querySelector('.media-showcase');
      return {
        pageBackground: getComputedStyle(main).backgroundImage,
        pageBackdrop: getComputedStyle(main, '::before').backgroundImage,
        heroBackdrop: getComputedStyle(hero, '::before').backgroundImage,
        mediaBackdrop: media ? getComputedStyle(media, '::before').content : 'none',
        brandGlow: getComputedStyle(brand).boxShadow,
        brandTextGlow: getComputedStyle(brandText).textShadow,
        titleGlow: getComputedStyle(titleAccent).filter,
      };
    });
    expect(styles.pageBackground).toBe('none');
    expect(styles.pageBackdrop).toBe('none');
    expect(styles.heroBackdrop).not.toContain('radial-gradient');
    expect(styles.mediaBackdrop).toBe('none');
    expect(styles.brandGlow).not.toBe('none');
    expect(styles.brandGlow).not.toContain('rgba(0, 0, 0, 0)');
    expect(styles.brandTextGlow).not.toBe('none');
    expect(styles.brandTextGlow).not.toContain('rgba(0, 0, 0, 0)');
    expect(styles.titleGlow).not.toBe('none');
    expect(styles.titleGlow).not.toContain('rgba(0, 0, 0, 0)');

    await page.emulateMedia({ colorScheme: 'light' });
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await expect(page.locator('main')).toHaveCSS('background-image', 'none');

    await page.goto('/admin');
    await expect(page.locator('.admin-login')).toBeVisible();
    await expect(page.locator('.admin-login')).toHaveCSS('background-image', 'none');
  });
});
