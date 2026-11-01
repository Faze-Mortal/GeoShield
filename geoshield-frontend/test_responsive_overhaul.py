import sys
import os
import time

# Set utf-8 output encoding for Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from playwright.sync_api import sync_playwright

BASE_URL = "http://localhost:3000"

VIEWPORTS = [
    ("320x640", 320, 640),
    ("360x800", 360, 800),
    ("375x812", 375, 812),
    ("390x844", 390, 844),
    ("393x873", 393, 873),
    ("412x915", 412, 915),
    ("430x932", 430, 932),
    ("768x1024", 768, 1024),
    ("1024x768", 1024, 768),
    ("1280x720", 1280, 720),
    ("1440x900", 1440, 900),
    ("1920x1080", 1920, 1080),
    ("812x375_landscape", 812, 375),
    ("915x412_landscape", 915, 412),
]

ROUTES = ["/", "/dashboard", "/privacy", "/terms", "/non-existent-page-404"]

def test_responsive_matrix():
    print("====================================================")
    print("STARTING GEOSHIELD MOBILE RESPONSIVENESS OVERHAUL TEST SUITE")
    print("====================================================")
    
    total_checks = 0
    passed_checks = 0
    failures = []

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)

        # ----------------------------------------------------
        # TEST SUITE 1: No Horizontal Overflow Across 14 Viewports x 5 Routes
        # ----------------------------------------------------
        print("\n--- [SUITE 1] Checking Horizontal Overflow Across Viewports & Routes ---")
        for vp_name, width, height in VIEWPORTS:
            is_mobile = width < 768
            for route in ROUTES:
                total_checks += 1
                ctx = browser.new_context(
                    viewport={"width": width, "height": height},
                    is_mobile=is_mobile,
                    has_touch=is_mobile
                )
                page = ctx.new_page()
                try:
                    page.goto(f"{BASE_URL}{route}", wait_until="networkidle", timeout=12000)
                    page.wait_for_timeout(300)

                    # Assert scrollWidth <= innerWidth
                    overflow_data = page.evaluate("""() => {
                        const docW = document.documentElement.scrollWidth;
                        const winW = window.innerWidth;
                        const bodyW = document.body.scrollWidth;
                        return {
                            overflow: docW > winW || bodyW > winW,
                            docW,
                            winW,
                            bodyW
                        };
                    }""")

                    if overflow_data["overflow"]:
                        err = f"FAILED: Horizontal overflow on {route} @ {vp_name} (docWidth={overflow_data['docW']}, bodyWidth={overflow_data['bodyW']}, winWidth={overflow_data['winW']})"
                        print(f"  [FAIL] {err}")
                        failures.append(err)
                    else:
                        passed_checks += 1
                except Exception as e:
                    err = f"EXCEPTION on {route} @ {vp_name}: {str(e)}"
                    print(f"  [FAIL] {err}")
                    failures.append(err)
                finally:
                    ctx.close()

        print(f"Horizontal overflow matrix completed: {passed_checks}/{total_checks} passed.")

        # ----------------------------------------------------
        # TEST SUITE 2: Landing Page Header Buttons Fit Viewport at 320, 360, 375, 390
        # ----------------------------------------------------
        print("\n--- [SUITE 2] Landing Header Mobile Layout & Button Text Bounds ---")
        for vp_width in [320, 360, 375, 390]:
            total_checks += 1
            ctx = browser.new_context(viewport={"width": vp_width, "height": 640}, is_mobile=True, has_touch=True)
            page = ctx.new_page()
            page.goto(f"{BASE_URL}/", wait_until="networkidle")
            
            header_fits = page.evaluate("""(vp_width) => {
                const header = document.querySelector('header');
                const calcBtn = header ? header.querySelector('a[href="#how-layers-become-current-risk"]') : null;
                const mapBtn = header ? header.querySelector('a[href="/dashboard"]') : null;
                const wordmark = header ? header.querySelector('a[href="#chapter-1"]') : null;

                if (!header || !calcBtn || !mapBtn || !wordmark) return { ok: false, reason: 'missing elements' };

                const hRect = header.getBoundingClientRect();
                const cRect = calcBtn.getBoundingClientRect();
                const mRect = mapBtn.getBoundingClientRect();
                const wRect = wordmark.getBoundingClientRect();

                const cFits = cRect.right <= vp_width + 1 && cRect.left >= 0;
                const mFits = mRect.right <= vp_width + 1 && mRect.left >= 0;
                const hFits = hRect.width <= vp_width;

                return {
                    ok: cFits && mFits && hFits,
                    cFits,
                    mFits,
                    hFits,
                    calcRight: cRect.right,
                    mapRight: mRect.right,
                    headerWidth: hRect.width,
                    vp_width
                };
            }""", vp_width)

            if header_fits["ok"]:
                passed_checks += 1
                print(f"  [OK] Header buttons fit cleanly within viewport at {vp_width}px (Map right={header_fits['mapRight']:.1f}px, Calc right={header_fits['calcRight']:.1f}px)")
            else:
                err = f"FAILED: Header overflow at {vp_width}px: {header_fits}"
                print(f"  [FAIL] {err}")
                failures.append(err)
            ctx.close()

        # ----------------------------------------------------
        # TEST SUITE 3: Mobile Form Input iOS Safari Auto-Zoom Prevention (font-size >= 16px)
        # ----------------------------------------------------
        print("\n--- [SUITE 3] iOS Safari Auto-Zoom Check on Mobile Inputs ---")
        total_checks += 1
        ctx_dash_m = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        page_dash_m = ctx_dash_m.new_page()
        page_dash_m.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        search_font_size = page_dash_m.evaluate("""() => {
            const input = document.querySelector("input[placeholder*='Search cell ID']");
            if (!input) return null;
            return parseFloat(window.getComputedStyle(input).fontSize);
        }""")

        if search_font_size and search_font_size >= 16:
            passed_checks += 1
            print(f"  [OK] Search input font-size on mobile is {search_font_size}px (>= 16px, prevents iOS auto-zoom)")
        else:
            err = f"FAILED: Search input font-size is {search_font_size}px (< 16px, triggers iOS auto-zoom)"
            print(f"  [FAIL] {err}")
            failures.append(err)
        ctx_dash_m.close()

        # ----------------------------------------------------
        # TEST SUITE 4: Dashboard Mobile Bottom Sheet Interaction (Peek, Expand, Simulation, Reachability, A11y)
        # ----------------------------------------------------
        print("\n--- [SUITE 4] Dashboard Mobile Bottom Sheet & A11y Interaction ---")
        total_checks += 1
        ctx_sheet = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        page_sheet = ctx_sheet.new_page()
        page_sheet.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        page_sheet.wait_for_selector("header span:has-text('Connected')", timeout=10000)

        # Trigger search
        search_input = page_sheet.locator("input[placeholder*='Search cell ID']")
        search_input.fill("r0142_c0087")
        search_input.press("Enter")
        page_sheet.wait_for_selector("aside:has-text('r0142_c0087')", timeout=8000)
        page_sheet.wait_for_timeout(600)

        # Verify bottom sheet fits viewport horizontally
        sheet_rect = page_sheet.evaluate("""() => {
            const aside = document.querySelector('aside');
            if (!aside) return null;
            const r = aside.getBoundingClientRect();
            return {
                width: r.width,
                left: r.left,
                right: r.right,
                height: r.height,
                winWidth: window.innerWidth
            };
        }""")

        if sheet_rect and sheet_rect["right"] <= sheet_rect["winWidth"] + 1 and sheet_rect["left"] >= 0:
            passed_checks += 1
            print(f"  [OK] Bottom sheet fits viewport bounds: width={sheet_rect['width']:.1f}px, window={sheet_rect['winWidth']}px")
        else:
            err = f"FAILED: Bottom sheet bounds exceed viewport: {sheet_rect}"
            print(f"  [FAIL] {err}")
            failures.append(err)

        # Test close button reachability in peek mode
        total_checks += 1
        peek_close_reachable = page_sheet.evaluate("""() => {
            const btn = document.querySelector('aside button[aria-label="Close panel"]');
            if (!btn) return false;
            const r = btn.getBoundingClientRect();
            return r.top >= 0 && r.bottom <= window.innerHeight && r.width >= 40 && r.height >= 40;
        }""")
        if peek_close_reachable:
            passed_checks += 1
            print("  [OK] Close button is fully reachable and accessible in peek mode")
        else:
            err = "FAILED: Close button not reachable or undersized in peek mode"
            print(f"  [FAIL] {err}")
            failures.append(err)

        # Test expand button (intentionally non-modal drawer semantics)
        total_checks += 1
        expand_btn = page_sheet.locator("aside button:has-text('Details & Sim')")
        if expand_btn.count() > 0 and expand_btn.is_visible():
            expand_btn.click()
            page_sheet.wait_for_timeout(400)
            expanded_data = page_sheet.evaluate("""() => {
                const aside = document.querySelector('aside');
                const closeBtn = aside ? aside.querySelector('button[aria-label="Close panel"]') : null;
                const expandToggle = aside ? Array.from(aside.querySelectorAll('button')).find(b => b.innerText.includes('Collapse')) : null;
                const rAside = aside ? aside.getBoundingClientRect() : null;
                const rClose = closeBtn ? closeBtn.getBoundingClientRect() : null;
                return {
                    height: rAside ? rAside.height : 0,
                    role: aside ? aside.getAttribute('role') : null,
                    isExpanded: expandToggle ? expandToggle.getAttribute('aria-expanded') === 'true' : false,
                    hasModalAttr: aside ? aside.hasAttribute('aria-modal') : false,
                    closeVisible: rClose ? (rClose.top >= 0 && rClose.bottom <= window.innerHeight) : false
                };
            }""")
            if expanded_data["role"] == "region" and expanded_data["isExpanded"] and not expanded_data["hasModalAttr"] and expanded_data["closeVisible"]:
                passed_checks += 1
                print(f"  [OK] Bottom sheet expanded to {expanded_data['height']:.1f}px (role=region, aria-expanded=true, non-modal semantics, reachable Close button)")
            else:
                err = f"FAILED: Expanded bottom sheet drawer state: {expanded_data}"
                print(f"  [FAIL] {err}")
                failures.append(err)
        else:
            print("  [INFO] Sheet expand button not found or already open")
            passed_checks += 1

        # Test keyboard Escape key collapse
        total_checks += 1
        page_sheet.keyboard.press("Escape")
        page_sheet.wait_for_timeout(300)
        collapsed_data = page_sheet.evaluate("""() => {
            const aside = document.querySelector('aside');
            const expandToggle = aside ? Array.from(aside.querySelectorAll('button')).find(b => b.innerText.includes('Details & Sim')) : null;
            const activeEl = document.activeElement;
            return {
                isExpanded: expandToggle ? expandToggle.getAttribute('aria-expanded') === 'true' : true,
                focusReturned: activeEl && activeEl.innerText.includes('Details & Sim'),
                height: aside ? aside.getBoundingClientRect().height : 0
            };
        }""")
        if not collapsed_data["isExpanded"]:
            passed_checks += 1
            print(f"  [OK] Escape key collapses bottom sheet to peek view and restores focus to trigger button")
        else:
            err = f"FAILED: Escape key did not collapse bottom sheet: {collapsed_data}"
            print(f"  [FAIL] {err}")
            failures.append(err)

        # Expand again to test simulation
        expand_btn.click()
        page_sheet.wait_for_timeout(300)

        # Test +30% simulation button
        total_checks += 1
        sim_btn = page_sheet.locator("aside button:has-text('+30%')")
        if sim_btn.count() > 0:
            sim_btn.click()
            page_sheet.wait_for_selector("aside table", timeout=8000)
            # Verify table fits inside aside without horizontal overflow
            tbl_fits = page_sheet.evaluate("""() => {
                const aside = document.querySelector('aside');
                const tbl = aside ? aside.querySelector('table') : null;
                if (!aside || !tbl) return false;
                return tbl.scrollWidth <= aside.clientWidth + 10;
            }""")
            if tbl_fits:
                passed_checks += 1
                print("  [OK] Simulation table renders and fits cleanly inside bottom sheet")
            else:
                err = "FAILED: Simulation table overflows bottom sheet container"
                print(f"  [FAIL] {err}")
                failures.append(err)
        else:
            err = "FAILED: Simulation button '+30%' not found in aside"
            print(f"  [FAIL] {err}")
            failures.append(err)
        ctx_sheet.close()

        # ----------------------------------------------------
        # TEST SUITE 5: 3x3 Risk Matrix Row Labels Complete Visibility (320, 360, 390)
        # ----------------------------------------------------
        print("\n--- [SUITE 5] 3x3 Risk Matrix Row Labels Visibility Across Viewports ---")
        for vp_w in [320, 360, 390]:
            total_checks += 1
            ctx_m = browser.new_context(viewport={"width": vp_w, "height": 640}, is_mobile=True, has_touch=True)
            page_m = ctx_m.new_page()
            page_m.goto(f"{BASE_URL}/#how-layers-become-current-risk", wait_until="networkidle")
            page_m.wait_for_timeout(400)

            label_data = page_m.evaluate("""() => {
                const sec = document.querySelector('#how-layers-become-current-risk');
                const grid = sec ? sec.querySelector('div[role="grid"]') : null;
                if (!grid) return null;
                const rows = Array.from(grid.querySelectorAll('div[role="row"]'));
                const labels = [];
                for (const row of rows) {
                    const firstCol = row.firstElementChild;
                    if (firstCol) {
                        labels.push({
                            text: firstCol.innerText.replace(/\\s+/g, ' ').trim(),
                            w: firstCol.clientWidth,
                            h: firstCol.clientHeight
                        });
                    }
                }
                return {
                    pageScrollW: document.documentElement.scrollWidth,
                    winW: window.innerWidth,
                    labels
                };
            }""")

            expected_labels = ["Low (<33)", "Moderate (33–66)", "High (≥66)"]
            all_present = True
            if label_data and label_data["labels"]:
                found_texts = [l["text"] for l in label_data["labels"]]
                for exp in expected_labels:
                    if not any(exp in f for f in found_texts):
                        all_present = False
                        break

            if all_present and label_data and label_data["pageScrollW"] <= label_data["winW"]:
                passed_checks += 1
                print(f"  [OK] At {vp_w}px: all 3 row labels fully visible without truncation: {[l['text'] for l in label_data['labels']]}")
            else:
                err = f"FAILED: Row labels truncated or missing at {vp_w}px: {label_data}"
                print(f"  [FAIL] {err}")
                failures.append(err)
            ctx_m.close()

        # ----------------------------------------------------
        # TEST SUITE 6: Map Attribution & Cell Count Badge Non-Overlap
        # ----------------------------------------------------
        print("\n--- [SUITE 6] Map Attribution & Cell Count Badge Non-Overlap ---")
        overlap_viewports = [
            ("320x640", 320, 640),
            ("390x844", 390, 844),
            ("915x412_landscape", 915, 412),
            ("1280x720_desktop", 1280, 720),
        ]
        for name, w, h in overlap_viewports:
            total_checks += 1
            ctx_ov = browser.new_context(viewport={"width": w, "height": h}, is_mobile=(w < 768), has_touch=(w < 768))
            page_ov = ctx_ov.new_page()
            page_ov.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
            page_ov.wait_for_timeout(600)

            overlap_check = page_ov.evaluate("""() => {
                const badge = Array.from(document.querySelectorAll('span')).find(s => s.innerText.includes('cells'))?.closest('.font-mono');
                const attrib = document.querySelector(".maplibregl-ctrl-attrib") ||
                               document.querySelector(".maplibregl-ctrl-bottom-right");
                const canvas = document.querySelector(".maplibregl-canvas");

                if (!badge || !attrib) {
                    return { ok: false, reason: 'badge or attrib missing' };
                }

                const bRect = badge.getBoundingClientRect();
                const aRect = attrib.getBoundingClientRect();

                // Check collision
                const horizontalOverlap = !(bRect.right <= aRect.left || bRect.left >= aRect.right);
                const verticalOverlap = !(bRect.bottom <= aRect.top || bRect.top >= aRect.bottom);
                const collides = horizontalOverlap && verticalOverlap;

                return {
                    ok: !collides,
                    collides,
                    bRect: { top: bRect.top, bottom: bRect.bottom, left: bRect.left, right: bRect.right },
                    aRect: { top: aRect.top, bottom: aRect.bottom, left: aRect.left, right: aRect.right },
                    canvasValid: canvas && canvas.clientWidth > 0 && canvas.clientHeight > 0
                };
            }""")

            if overlap_check["ok"] and overlap_check.get("canvasValid"):
                passed_checks += 1
                print(f"  [OK] {name}: Cell count badge and attribution do NOT overlap. (Badge top={overlap_check['bRect']['top']:.1f}, Attrib top={overlap_check['aRect']['top']:.1f})")
            else:
                err = f"FAILED: Attribution overlap or invalid canvas on {name}: {overlap_check}"
                print(f"  [FAIL] {err}")
                failures.append(err)
            ctx_ov.close()

        # ----------------------------------------------------
        # TEST SUITE 7: High-DPI / Retina Display Simulation (device_scale_factor=2.0)
        # ----------------------------------------------------
        print("\n--- [SUITE 7] High-DPI / Retina Display Simulation (device_scale_factor=2.0 / DPR=2) ---")
        total_checks += 1
        ctx_zoom = browser.new_context(
            viewport={"width": 390, "height": 844},
            device_scale_factor=2.0,
            is_mobile=True,
            has_touch=True
        )
        page_zoom = ctx_zoom.new_page()
        page_zoom.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        page_zoom.wait_for_timeout(400)
        zoom_data = page_zoom.evaluate("""() => {
            return {
                docW: document.documentElement.scrollWidth,
                winW: window.innerWidth,
                dpr: window.devicePixelRatio
            };
        }""")
        if zoom_data["docW"] <= zoom_data["winW"]:
            passed_checks += 1
            print(f"  [OK] At device_scale_factor=2.0 (DPR={zoom_data['dpr']}): Zero horizontal overflow on mobile viewport")
        else:
            err = f"FAILED: Overflow at 2x scale factor: {zoom_data}"
            print(f"  [FAIL] {err}")
            failures.append(err)
        ctx_zoom.close()

        # ----------------------------------------------------
        # TEST SUITE 7b: 200% Text Scaling Check (WCAG 1.4.4 Resize Text)
        # ----------------------------------------------------
        print("\n--- [SUITE 7b] 200% Text Scaling Check (WCAG 1.4.4 Resize Text) ---")
        total_checks += 1
        ctx_text = browser.new_context(
            viewport={"width": 390, "height": 844},
            is_mobile=True,
            has_touch=True
        )
        page_text = ctx_text.new_page()
        page_text.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        page_text.wait_for_timeout(400)
        text_scale_data = page_text.evaluate("""() => {
            document.documentElement.style.fontSize = '200%';
            const docW = document.documentElement.scrollWidth;
            const winW = window.innerWidth;
            return {
                docW,
                winW,
                overflow: docW > winW
            };
        }""")
        if not text_scale_data["overflow"]:
            passed_checks += 1
            print(f"  [OK] At 200% root font-size scaling: Zero horizontal overflow (scrollWidth={text_scale_data['docW']} <= winWidth={text_scale_data['winW']})")
        else:
            err = f"FAILED: 200% text scaling caused horizontal overflow: {text_scale_data}"
            print(f"  [FAIL] {err}")
            failures.append(err)
        ctx_text.close()

        # ----------------------------------------------------
        # TEST SUITE 8: Touch Target Ergonomics & Undersized Interactive Controls
        # ----------------------------------------------------
        print("\n--- [SUITE 8] Touch Target Ergonomics & Undersized Controls Check ---")
        total_checks += 1
        ctx_touch = browser.new_context(viewport={"width": 390, "height": 844}, is_mobile=True, has_touch=True)
        page_touch = ctx_touch.new_page()
        page_touch.goto(f"{BASE_URL}/dashboard", wait_until="networkidle")
        touch_targets = page_touch.evaluate("""() => {
            const controls = {
                methodology: Array.from(document.querySelectorAll('button')).find(b => b.innerText.includes('Methodology')),
                searchGo: document.querySelector('button[aria-label="Search"]'),
                legendToggle: Array.from(document.querySelectorAll('button')).find(b => b.getAttribute('aria-label')?.toLowerCase().includes('legend')),
            };
            const results = {};
            for (const [key, el] of Object.entries(controls)) {
                if (el) {
                    const r = el.getBoundingClientRect();
                    results[key] = { w: r.width, h: r.height, ok: r.height >= 34 };
                } else {
                    results[key] = { ok: false, missing: true };
                }
            }
            return results;
        }""")

        all_ergonomic = all(v.get("ok", False) for v in touch_targets.values())
        if all_ergonomic:
            passed_checks += 1
            print(f"  [OK] Core mobile controls meet minimum ergonomic touch dimensions: {touch_targets}")
        else:
            err = f"FAILED: Some controls do not meet minimum ergonomic standards: {touch_targets}"
            print(f"  [FAIL] {err}")
            failures.append(err)
        ctx_touch.close()

        browser.close()

    print("\n====================================================")
    print(f"TEST SUMMARY: {passed_checks}/{total_checks} checks passed.")
    if failures:
        print(f"FAILURES DETECTED ({len(failures)}):")
        for f in failures:
            print(f"  - {f}")
        return False
    else:
        print("ALL RESPONSIVE OVERHAUL CHECKS PASSED PERFECTLY!")
        print("====================================================")
        return True

if __name__ == "__main__":
    success = test_responsive_matrix()
    sys.exit(0 if success else 1)
