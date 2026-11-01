import os
import time
from playwright.sync_api import sync_playwright

OUT_DIR = "artifacts/after"
os.makedirs(OUT_DIR, exist_ok=True)

def run_captures():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # 1. Landing at key widths: 320, 360, 375, 390, 768, 1440, landscape
        landing_viewports = [
            ("landing_320", 320, 640),
            ("landing_360", 360, 800),
            ("landing_375", 375, 812),
            ("landing_390", 390, 844),
            ("landing_768", 768, 1024),
            ("landing_1440", 1440, 900),
            ("landing_landscape_812x375", 812, 375),
        ]
        for name, w, h in landing_viewports:
            ctx = browser.new_context(viewport={"width": w, "height": h}, is_mobile=(w < 600), has_touch=(w < 600))
            page = ctx.new_page()
            page.goto("http://localhost:3000/", wait_until="networkidle")
            page.screenshot(path=f"{OUT_DIR}/{name}.png", full_page=True)
            ctx.close()
            print(f"Captured {name}")

        # 1b. Eight chapters at 390 width
        chapters = [
            ("chapter_01_problem", "#chapter-1"),
            ("chapter_02_mechanics", "#chapter-2"),
            ("chapter_03_features", "#chapter-3"),
            ("chapter_04_temporal", "#chapter-4"),
            ("chapter_05_architecture", "#chapter-5"),
            ("chapter_06_matrix", "#chapter-6"),
            ("chapter_07_whatif", "#chapter-7"),
            ("chapter_08_boundaries", "#chapter-8"),
        ]
        ctx_ch = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        page_ch = ctx_ch.new_page()
        page_ch.goto("http://localhost:3000/", wait_until="networkidle")
        for ch_name, ch_selector in chapters:
            el = page_ch.locator(ch_selector)
            if el.count() > 0:
                el.scroll_into_view_if_needed()
                page_ch.wait_for_timeout(300)
                el.screenshot(path=f"{OUT_DIR}/390_{ch_name}.png")
                print(f"Captured 390_{ch_name}")
            else:
                print(f"Warning: selector {ch_selector} not found")
        ctx_ch.close()

        # 2. Supporting pages: Privacy, Terms, and 404 at 390 and 1440
        for page_name, route in [("privacy", "/privacy"), ("terms", "/terms"), ("not_found", "/not-a-real-page")]:
            for w, h in [(390, 844), (1440, 900)]:
                ctx = browser.new_context(viewport={"width": w, "height": h}, is_mobile=(w < 600), has_touch=(w < 600))
                page = ctx.new_page()
                page.goto(f"http://localhost:3000{route}", wait_until="networkidle")
                page.screenshot(path=f"{OUT_DIR}/{page_name}_{w}.png", full_page=True)
                ctx.close()
                print(f"Captured {page_name}_{w}")

        # 3. Dashboard base at key widths: 320, 390, 768, 1440, landscape
        dash_viewports = [
            ("dashboard_320", 320, 640),
            ("dashboard_390", 390, 844),
            ("dashboard_768", 768, 1024),
            ("dashboard_1440", 1440, 900),
            ("dashboard_landscape_812x375", 812, 375),
        ]
        for name, w, h in dash_viewports:
            ctx = browser.new_context(viewport={"width": w, "height": h}, is_mobile=(w < 600), has_touch=(w < 600))
            page = ctx.new_page()
            page.goto("http://localhost:3000/dashboard", wait_until="networkidle")
            page.wait_for_timeout(1500)
            page.screenshot(path=f"{OUT_DIR}/{name}.png")
            ctx.close()
            print(f"Captured {name}")

        # 4. Dashboard states: with cell detail open, simulation open (mobile 390 and desktop 1440)
        for w, h, prefix in [(390, 844, "dash_mobile_390"), (1440, 900, "dash_desktop_1440")]:
            ctx = browser.new_context(viewport={"width": w, "height": h}, is_mobile=(w < 600), has_touch=(w < 600))
            page = ctx.new_page()
            page.goto("http://localhost:3000/dashboard", wait_until="networkidle")
            page.wait_for_selector("header span:has-text('Connected')", timeout=8000)
            
            # Search cell r0142_c0087
            search_input = page.locator("input[placeholder*='Search cell ID']")
            search_input.fill("r0142_c0087")
            search_input.press("Enter")
            page.wait_for_selector("aside:has-text('r0142_c0087')", timeout=8000)
            page.wait_for_timeout(1000)
            page.screenshot(path=f"{OUT_DIR}/{prefix}_cell_detail.png")
            print(f"Captured {prefix}_cell_detail")

            # On mobile, expand the sheet if there is an expand button
            expand_btn = page.locator("aside button:has-text('Details & Sim')")
            if expand_btn.count() > 0 and expand_btn.is_visible():
                expand_btn.click()
                page.wait_for_timeout(500)

            # Click +30% simulation button
            sim_btn = page.locator("aside button:has-text('+30%')")
            if sim_btn.count() > 0:
                sim_btn.click()
                page.wait_for_timeout(1500)
                page.screenshot(path=f"{OUT_DIR}/{prefix}_sim_open.png")
                print(f"Captured {prefix}_sim_open")
            ctx.close()

        # 5. Dashboard backend waking state and error state (mobile 390 and desktop 1440)
        for w, h, prefix in [(390, 844, "dash_mobile_390"), (1440, 900, "dash_desktop_1440")]:
            ctx_wake = browser.new_context(viewport={"width": w, "height": h}, is_mobile=(w < 600), has_touch=(w < 600))
            page_wake = ctx_wake.new_page()
            
            first = [True]
            def handle_wake(route):
                if route.request.url.rstrip("/").endswith(":8000") and first[0]:
                    first[0] = False
                    route.fulfill(status=503, content_type="application/json", body='{"detail":"waking"}')
                else:
                    route.continue_()
            page_wake.route("**/", handle_wake)
            page_wake.goto("http://localhost:3000/dashboard", wait_until="domcontentloaded")
            page_wake.wait_for_selector("div[role='status']:has-text('Connecting to GeoShield API')", timeout=6000)
            page_wake.screenshot(path=f"{OUT_DIR}/{prefix}_waking_state.png")
            print(f"Captured {prefix}_waking_state")
            ctx_wake.close()

            # Error state simulation
            ctx_err = browser.new_context(viewport={"width": w, "height": h}, is_mobile=(w < 600), has_touch=(w < 600))
            page_err = ctx_err.new_page()
            page_err.route("**/", lambda r: r.abort("failed") if r.request.url.rstrip("/").endswith(":8000") else r.continue_())
            page_err.goto("http://localhost:3000/dashboard", wait_until="domcontentloaded")
            page_err.wait_for_timeout(35000)
            page_err.screenshot(path=f"{OUT_DIR}/{prefix}_error_state.png")
            print(f"Captured {prefix}_error_state")
            ctx_err.close()

        browser.close()
    print("All after screenshots successfully captured!")

if __name__ == "__main__":
    run_captures()

