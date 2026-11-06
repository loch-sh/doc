import path from 'node:path';
import {test} from './fixtures';
import {scenes} from './scenes';

const locales = (process.env.LOCALES ?? 'en,fr').split(',');
const schemes = ['light', 'dark'] as const;
const only = process.env.SCENES?.split(',');
const outDir = path.resolve(__dirname, '../static/img/screenshots/panel/next');

for (const scene of scenes.filter((s) => !only || only.includes(s.id))) {
  for (const locale of locales) {
    for (const scheme of schemes) {
      test(`${scene.id} ${locale} ${scheme}`, async ({page, api, ws}) => {
        scene.setup?.(api, ws);
        if (scene.viewport) await page.setViewportSize(scene.viewport);
        await page.emulateMedia({colorScheme: scheme, reducedMotion: 'reduce'});
        // The interface reads the language from localStorage ("lang").
        await page.addInitScript((lang) => localStorage.setItem('lang', lang), locale);
        await page.goto(scene.path);
        await page.waitForLoadState('networkidle');
        await scene.ready?.(page);
        await page.waitForLoadState('networkidle');
        await page.evaluate(() => window.scrollTo(0, 0));
        // Let transitions (drawers, modals, counters) settle.
        await page.waitForTimeout(scene.settle ?? 600);
        const file = path.join(outDir, locale, `${scene.id}-${scheme}.png`);
        const target = scene.locator ? page.locator(scene.locator).first() : page;
        await target.screenshot({path: file, animations: 'disabled'});
      });
    }
  }
}
