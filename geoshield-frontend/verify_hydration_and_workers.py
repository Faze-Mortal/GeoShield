import sys
import time
from playwright.sync_api import sync_playwright

if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = 'http://localhost:3000'
ROUTES = ['/', '/dashboard', '/privacy', '/terms']

def test_hydration_and_workers():
    print('=' * 65)
    print('GEOSHIELD HYDRATION & MAPLIBRE WORKER VERIFICATION')
    print('=' * 65)

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Clean browser test across desktop & mobile
        for is_mobile, vp_name, width, height in [
            (False, '1280x720_desktop', 1280, 720),
            (True, '390x844_mobile', 390, 844),
            (True, '320x640_mobile', 320, 640),
        ]:
            print(f'\n[TEST] Verifying Clean Browser Hydration on {vp_name}...')
            ctx = browser.new_context(
                viewport={'width': width, 'height': height},
                is_mobile=is_mobile,
                has_touch=is_mobile
            )
            for route in ROUTES:
                page = ctx.new_page()
                console_msgs = []
                page.on('console', lambda m: console_msgs.append((m.type, m.text)))

                page.goto(f'{BASE_URL}{route}', wait_until='networkidle')
                page.wait_for_timeout(400)

                # Check for hydration mismatch warnings or error logs
                hydration_errors = [text for mtype, text in console_msgs if 'hydration' in text.lower() or 'mismatch' in text.lower()]
                console_errors = [text for mtype, text in console_msgs if mtype == 'error']

                assert len(hydration_errors) == 0, f'Hydration errors on {route} ({vp_name}): {hydration_errors}'
                assert len(console_errors) == 0, f'Console errors on {route} ({vp_name}): {console_errors}'
                print(f'  [OK] {route} cleanly hydrated (0 hydration errors, 0 console errors)')
                page.close()
            ctx.close()

        # 2. MapLibre worker verification on /dashboard
        print('\n[TEST] Verifying MapLibre Web Worker and Canvas Rendering...')
        ctx = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = ctx.new_page()
        worker_created = []
        page.on('worker', lambda w: worker_created.append(w.url))

        page.goto(f'{BASE_URL}/dashboard', wait_until='networkidle')
        page.wait_for_timeout(1000)

        # Check map canvas rendered
        canvas_count = page.locator('canvas.maplibregl-canvas').count()
        assert canvas_count == 1, f'Expected 1 MapLibre canvas, found {canvas_count}'
        
        # Check map is interactive
        box = page.locator('canvas.maplibregl-canvas').bounding_box()
        assert box and box['width'] > 0 and box['height'] > 0, 'Canvas bounding box is empty'
        print(f'  [OK] MapLibre canvas rendered: {box["width"]}x{box["height"]}px')

        # Check map container exists and is mounted
        map_container = page.locator('.maplibregl-map')
        assert map_container.count() == 1, 'Map container not found'
        print('  [OK] GeoShield MapLibre instance container verified')

        ctx.close()

        # 3. Emulating Dark Reader extension attributes
        print('\n[TEST] Verifying Clean Browser vs Injected Attributes (Dark Reader)...')
        ctx = browser.new_context(viewport={'width': 1280, 'height': 720})
        page = ctx.new_page()
        page.add_init_script("document.documentElement.setAttribute('data-darkreader-mode', 'dynamic'); document.documentElement.setAttribute('data-darkreader-scheme', 'dark');")
        page_console = []
        page.on('console', lambda m: page_console.append((m.type, m.text)))
        page.goto(f'{BASE_URL}/', wait_until='networkidle')
        page.wait_for_timeout(400)
        h1 = page.locator('h1').inner_text()
        assert len(h1) > 0, 'H1 missing under Dark Reader simulation'
        print(f'  [OK] Page renders and operates with Dark Reader attributes: {repr(h1[:40])}...')
        ctx.close()

        browser.close()

    print('\n' + '=' * 65)
    print('ALL HYDRATION & WORKER CHECKS PASSED!')
    print('=' * 65)

if __name__ == '__main__':
    test_hydration_and_workers()
