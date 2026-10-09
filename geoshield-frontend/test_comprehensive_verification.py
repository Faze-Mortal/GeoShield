import sys
import json
import time
from playwright.sync_api import sync_playwright

def run_tests():
    print("=" * 70)
    print("STARTING GEOSHIELD COMPREHENSIVE BROWSER VERIFICATION (REAL CHROMIUM)")
    print("=" * 70)

    results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        console_logs = []
        network_requests = []

        page.on("console", lambda msg: console_logs.append({
            "type": msg.type,
            "text": msg.text,
            "location": msg.location
        }))

        page.on("response", lambda res: network_requests.append({
            "url": res.url,
            "status": res.status,
            "content_type": res.headers.get("content-type", "")
        }))

        # ---------------------------------------------------------------------
        # TEST 1 & 2 & 3: Initial Load, Worker check, Basemap & Grid request
        # ---------------------------------------------------------------------
        print("\n[STEP 1] Navigating to http://localhost:3000...")
        t0 = time.time()
        page.goto("http://localhost:3000", wait_until="load")

        # Wait for grid load (cells visible in status chip)
        chip_loc = page.locator("div.font-mono:has-text('cells')")
        chip_loc.wait_for(timeout=20000)
        chip_text = chip_loc.text_content()
        print(f"  Status chip rendered: '{chip_text}' (took {time.time()-t0:.2f}s)")

        # Verify Worker request
        worker_reqs = [r for r in network_requests if "maplibre-gl-worker" in r["url"]]
        print(f"  Worker requests: {len(worker_reqs)}")
        for wr in worker_reqs:
            print(f"    URL: {wr['url']}, Status: {wr['status']}, MIME: {wr['content_type']}")
        
        worker_failed = any("Worker failed to load" in l["text"] for l in console_logs)
        results["item_1_worker_error"] = not worker_failed and len(worker_reqs) > 0 and worker_reqs[0]["status"] == 200

        # Verify Basemap style request
        style_reqs = [r for r in network_requests if "cartocdn.com" in r["url"] or "dark-matter" in r["url"]]
        print(f"  Basemap requests: {len(style_reqs)} (sample status: {style_reqs[0]['status'] if style_reqs else 'none'})")
        results["item_2_basemap"] = len(style_reqs) > 0 and style_reqs[0]["status"] == 200

        # Verify /grid request details
        grid_reqs = [r for r in network_requests if "/grid?" in r["url"]]
        print(f"  /grid requests captured: {len(grid_reqs)}")
        if grid_reqs:
            first_grid = grid_reqs[0]
            print(f"    First /grid URL: {first_grid['url']}")
            print(f"    Status: {first_grid['status']}, MIME: {first_grid['content_type']}")
            results["item_3_grid_request"] = (first_grid["status"] == 200 and "min_lon" in first_grid["url"] and "limit=10000" in first_grid["url"])
        else:
            results["item_3_grid_request"] = False

        # ---------------------------------------------------------------------
        # TEST 4: Grid polygons rendered (check layer and rendered features)
        # ---------------------------------------------------------------------
        print("\n[STEP 2] Verifying GeoJSON source and layers on map instance...")
        page.wait_for_timeout(2000)
        layer_info = page.evaluate("""() => {
            if (!window._geoshieldMap) return { hasSrc: false, hasLyr: false, renderedCount: -1 };
            const src = window._geoshieldMap.getSource('geoshield-grid');
            const lyr = window._geoshieldMap.getLayer('grid-fill');
            const rendered = window._geoshieldMap.queryRenderedFeatures({ layers: ['grid-fill'] });
            return {
                hasSrc: !!src,
                hasLyr: !!lyr,
                renderedCount: rendered.length
            };
        }""")
        print(f"  Map source exists: {layer_info['hasSrc']}, Layer exists: {layer_info['hasLyr']}, Rendered features: {layer_info['renderedCount']}")
        results["item_4_polygons_rendered"] = (layer_info['hasSrc'] and layer_info['hasLyr'] and layer_info['renderedCount'] > 0)

        # ---------------------------------------------------------------------
        # TEST 5 & 7 & 8: Search r0142_c0087 (Low-Moderate)
        # ---------------------------------------------------------------------
        print("\n[STEP 3] Searching cell r0142_c0087...")
        search_input = page.locator("input[placeholder*='Search cell ID']")
        search_input.fill("r0142_c0087")
        page.keyboard.press("Enter")
        page.wait_for_timeout(2000)

        panel = page.locator("[role='region'][aria-label='Cell details panel']")
        assert panel.is_visible()
        panel_text = panel.text_content()

        has_score_32_7 = "32.7" in panel_text
        has_risk_low_mod = "Low-Moderate" in panel_text
        has_trigger_elevated = "ELEVATED" in panel_text
        print(f"  r0142_c0087 panel: Score 32.7 ({has_score_32_7}), Risk Low-Mod ({has_risk_low_mod}), Trigger ELEVATED ({has_trigger_elevated})")
        results["item_7_click_or_select_predict"] = (has_score_32_7 and has_risk_low_mod and has_trigger_elevated)

        # ---------------------------------------------------------------------
        # TEST 9: Simulation +30% on r0142_c0087
        # ---------------------------------------------------------------------
        print("\n[STEP 4] Testing simulation +30%...")
        btn_30 = panel.locator("button:has-text('+30%')")
        btn_30.click()
        page.wait_for_timeout(2500)

        sim_panel_text = panel.text_content()
        sim_has_moderate = "Moderate" in sim_panel_text
        sim_has_high = "HIGH" in sim_panel_text
        sim_has_unchanged = "32.7" in sim_panel_text and "unchanged" in sim_panel_text.lower()
        print(f"  Sim +30%: Moderate ({sim_has_moderate}), Trigger HIGH ({sim_has_high}), Score unchanged ({sim_has_unchanged})")
        results["item_9_simulation"] = (sim_has_moderate and sim_has_high and sim_has_unchanged)

        # ---------------------------------------------------------------------
        # TEST 5 & 8 (cont): Search r0137_c0204 (Critical cell)
        # ---------------------------------------------------------------------
        print("\n[STEP 5] Searching cell r0137_c0204 (Critical)...")
        search_input.fill("r0137_c0204")
        page.keyboard.press("Enter")
        page.wait_for_timeout(2000)

        panel_text_crit = panel.text_content()
        has_score_73_3 = "73.3" in panel_text_crit
        has_risk_critical = "Critical" in panel_text_crit
        print(f"  r0137_c0204 panel: Score 73.3 ({has_score_73_3}), Risk Critical ({has_risk_critical})")
        results["item_5_risk_color_spot_check"] = (has_risk_low_mod and has_risk_critical)

        # ---------------------------------------------------------------------
        # TEST 8 (cont): Search invalid cell r9999_c9999 (404 handling)
        # ---------------------------------------------------------------------
        print("\n[STEP 6] Searching invalid ID r9999_c9999...")
        search_input.fill("r9999_c9999")
        page.keyboard.press("Enter")
        page.wait_for_timeout(1000)
        err_loc = page.locator("text=No cell with ID")
        assert err_loc.is_visible()
        print(f"  Inline 404 message correctly displayed: '{err_loc.text_content()}'")
        results["item_8_search_and_404"] = True

        # ---------------------------------------------------------------------
        # TEST 6: Zoom out below MIN_GRID_ZOOM (z9) -> Zoom hint, no fetch
        # ---------------------------------------------------------------------
        print("\n[STEP 7] Zooming out below MIN_GRID_ZOOM (z9)...")
        prev_grid_count = len([r for r in network_requests if "/grid?" in r["url"]])
        page.evaluate("() => window._geoshieldMap && window._geoshieldMap.setZoom(8.5)")
        page.wait_for_timeout(1500)

        zoom_hint = page.locator("text=Zoom in to view the 500m risk grid")
        zoom_hint_visible = zoom_hint.is_visible()
        new_grid_count = len([r for r in network_requests if "/grid?" in r["url"]])
        no_new_fetch = (new_grid_count == prev_grid_count)
        print(f"  Below min zoom hint visible: {zoom_hint_visible}, No new fetch sent: {no_new_fetch}")

        # Click Zoom to Grid button
        zoom_btn = page.locator("button:has-text('Zoom to Grid')")
        zoom_btn.click()
        page.wait_for_timeout(4000)
        zoom_after = page.evaluate("() => window._geoshieldMap.getZoom()")
        print(f"  Zoom restored to: {zoom_after:.1f}")
        results["item_6_zoom_gating"] = (zoom_hint_visible and no_new_fetch and zoom_after >= 11)

        # ---------------------------------------------------------------------
        # TEST 10: Check console for unexpected errors
        # ---------------------------------------------------------------------
        print("\n[STEP 8] Auditing console output...")
        unexpected_errors = [
            l for l in console_logs 
            if l["type"] == "error" and "r9999_c9999" not in l["text"] and "404" not in l["text"]
        ]
        print(f"  Unexpected runtime errors logged: {len(unexpected_errors)}")
        for err in unexpected_errors:
            print(f"    ERROR: {err['text']}")
        results["item_10_clean_console"] = (len(unexpected_errors) == 0)

        # Save desktop screenshot
        desktop_screenshot_path = "geoshield-frontend/desktop_verified.png"
        page.screenshot(path=desktop_screenshot_path)
        print(f"  Desktop screenshot saved: {desktop_screenshot_path}")

        # ---------------------------------------------------------------------
        # TEST 12: Mobile Viewport (390 x 844)
        # ---------------------------------------------------------------------
        print("\n[STEP 9] Testing mobile viewport (390 x 844)...")
        context_mobile = browser.new_context(viewport={"width": 390, "height": 844})
        page_mobile = context_mobile.new_page()
        page_mobile.goto("http://localhost:3000", wait_until="load")
        page_mobile.locator("div.font-mono:has-text('cells')").wait_for(timeout=15000)

        # Check search on mobile
        mob_search = page_mobile.locator("input[placeholder*='Search cell ID']")
        mob_search.fill("r0142_c0087")
        page_mobile.keyboard.press("Enter")
        page_mobile.wait_for_timeout(2000)

        mob_panel = page_mobile.locator("[role='region'][aria-label='Cell details panel']")
        mob_panel_visible = mob_panel.is_visible()
        print(f"  Mobile bottom sheet visible: {mob_panel_visible}")
        mobile_screenshot_path = "geoshield-frontend/mobile_verified.png"
        page_mobile.screenshot(path=mobile_screenshot_path)
        print(f"  Mobile screenshot saved: {mobile_screenshot_path}")
        results["item_12_responsive"] = mob_panel_visible
        context_mobile.close()

        # ---------------------------------------------------------------------
        # TEST 1: Hard reload check
        # ---------------------------------------------------------------------
        print("\n[STEP 10] Testing hard reload...")
        page.reload(wait_until="load")
        page.locator("div.font-mono:has-text('cells')").wait_for(timeout=15000)
        reloaded_info = page.evaluate("""() => {
            return {
                layers: window._geoshieldMap.getStyle().layers.length,
                rendered: window._geoshieldMap.queryRenderedFeatures({ layers: ['grid-fill'] }).length
            };
        }""")
        print(f"  Hard reload completed cleanly! Layers: {reloaded_info['layers']}, Rendered cells: {reloaded_info['rendered']}")

        browser.close()

    print("\n" + "=" * 70)
    print("VERIFICATION SUMMARY:")
    all_passed = True
    for k, v in results.items():
        status = "PASS" if v else "FAIL"
        if not v:
            all_passed = False
        print(f"  {k:32s}: [{status}]")
    print("=" * 70)
    
    assert all_passed, "Some verification items failed!"
    print("\nALL VERIFICATIONS PASSED SUCCESSFULLY!")

if __name__ == "__main__":
    run_tests()
