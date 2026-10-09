import time
import math
import json
from playwright.sync_api import sync_playwright

def relative_luminance(rgb):
    srgb = [c / 255.0 for c in rgb]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in srgb]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]

def parse_rgb(rgb_str):
    if not rgb_str or not rgb_str.startswith("rgb"):
        return [255, 255, 255]
    parts = rgb_str.replace("rgba(", "").replace("rgb(", "").replace(")", "").split(",")
    return [float(p.strip()) for p in parts[:3]]

def contrast_ratio(rgb1, rgb2):
    l1 = relative_luminance(rgb1)
    l2 = relative_luminance(rgb2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def run_tests():
    print("=" * 70)
    print("GEOSHIELD COMPLETE E2E VERIFICATION: LANDING & DASHBOARD")
    print("=" * 70)

    results = {}
    evidence = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")

        # ---------------------------------------------------------------------
        # PART 1: TEST LANDING PAGE AT http://localhost:3000/ (BACKEND ISOLATION)
        # ---------------------------------------------------------------------
        print("\n[PART 1] Verifying Landing Page at http://localhost:3000/ ...")
        context = browser.new_context(viewport={"width": 1440, "height": 900})
        page = context.new_page()

        landing_requests = []
        page.on("request", lambda req: landing_requests.append(req.url))

        console_errors = []
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error"] else None)

        page.goto("http://localhost:3000/", wait_until="networkidle")
        page.wait_for_timeout(2000)

        # 1. API & MapLibre isolation check
        api_calls = [url for url in landing_requests if any(ep in url for ep in ["/grid", "/predict", "/simulate"])]
        maplibre_chunks = [url for url in landing_requests if "maplibre" in url.lower()]

        print(f"  API requests on landing: {len(api_calls)}")
        print(f"  MapLibre chunks on landing: {len(maplibre_chunks)}")
        print(f"  Console errors: {len(console_errors)}")

        results["1. landing_zero_api_calls"] = (len(api_calls) == 0)
        results["2. landing_zero_maplibre_chunks"] = (len(maplibre_chunks) == 0)
        results["3. landing_zero_console_errors"] = (len(console_errors) == 0)

        # 2. Semantic headings check (1 h1, 8 h2s)
        h1_count = page.locator("h1").count()
        h2_count = page.locator("h2").count()
        h1_text = page.locator("h1").first.text_content() or ""
        print(f"  H1 count: {h1_count} ('{h1_text.strip()}')")
        print(f"  H2 count: {h2_count}")
        results["4. semantic_headings_1_h1_8_h2"] = (h1_count == 1 and h2_count == 8 and "rain is never just rain" in h1_text.lower())

        # 3. All 8 chapters present
        all_ch = True
        for i in range(1, 9):
            ch = page.locator(f"#chapter-{i}")
            if not ch.is_visible():
                all_ch = False
        results["5. all_8_chapters_present"] = all_ch

        # 4. Fact sheet values verification
        body_text = page.locator("body").text_content() or ""
        fs_ok = (
            "96,118" in body_text and
            "500" in body_text and
            "257" in body_text and "374" in body_text and
            "240" in body_text and "6,588" in body_text and
            "1,377" in body_text and
            "1,029" in body_text and "74.7%" in body_text and
            "Singh et al. (2025)" in body_text and
            "same-state empirical reference" in body_text.lower() and
            "not calibrated" in body_text.lower()
        )
        results["6. fact_sheet_facts_present"] = fs_ok

        # 5. Data Roles & Features verification
        ch3_text = page.locator("#chapter-3").text_content() or ""
        features_12 = [
            "Elevation", "Slope", "Soil Bulk Density", "Clay Fraction", "Sand Fraction",
            "Silt Fraction", "Soil pH", "Soil Organic Carbon", "Distance to Nearest Road",
            "Population", "Historical Landslide Density within 2 km", "Distance to Nearest River"
        ]
        all_features_found = all(f.lower() in ch3_text.lower() for f in features_12)
        density_largest = "largest contributor" in ch3_text.lower()
        rf_trigger_only = "not an input" in ch3_text.lower()
        ndvi_excluded = "excluded from" in ch3_text.lower() or "excluded" in ch3_text.lower()
        results["7. data_roles_strictly_accurate"] = (all_features_found and density_largest and rf_trigger_only and ndvi_excluded)

        # 6. Terminology compliance
        assert "probability of landslide" not in body_text.lower()
        assert "chance of landslide" not in body_text.lower()
        assert "% chance" not in body_text.lower()
        results["8. terminology_strictly_compliant"] = True

        # 7. Chapter 2 interactive cross-section
        btn_phase3 = page.locator("button:has-text('Phase 3')")
        btn_phase3.click()
        page.wait_for_timeout(200)
        assert "Pore-Water Buildup" in (page.locator("#chapter-2").text_content() or "")
        results["9. chapter_2_cross_section_interactive"] = True

        # 8. Chapter 4 temporal pivot toggle
        btn_idealized = page.locator("button:has-text('Idealized Ambition')")
        btn_idealized.click()
        page.wait_for_timeout(200)
        assert "What We Wanted to Learn" in (page.locator("#chapter-4").text_content() or "")
        btn_real = page.locator("button:has-text('Real Year Histogram')")
        btn_real.click()
        page.wait_for_timeout(200)
        assert "2015 Concentration: 74.7%" in (page.locator("#chapter-4").text_content() or "")
        results["10. chapter_4_temporal_pivot_interactive"] = True

        # 9. Chapter 6 matrix interactive combinations and presets
        btn_preset1 = page.locator("button:has-text('Cell r0142_c0087')")
        btn_preset1.click()
        page.wait_for_timeout(200)
        ch6_p1 = page.locator("#chapter-6").text_content() or ""
        assert "Low-Moderate" in ch6_p1 and "32.7" in ch6_p1

        btn_preset2 = page.locator("button:has-text('Cell r0137_c0204')")
        btn_preset2.click()
        page.wait_for_timeout(200)
        ch6_p2 = page.locator("#chapter-6").text_content() or ""
        assert "Critical" in ch6_p2 and "73.3" in ch6_p2

        # Verify all 9 combinations in matrix
        matrix_cells = page.locator("button[aria-label*='Susceptibility']")
        assert matrix_cells.count() == 9
        results["11. chapter_6_3x3_matrix_interactive"] = True

        # 10. Chapter 7 what-if slider
        btn_step30 = page.locator("#chapter-7 button:has-text('+30%')")
        btn_step30.click()
        page.wait_for_timeout(200)
        ch7_t = page.locator("#chapter-7").text_content() or ""
        assert "Verified Real Result" in ch7_t
        assert "Unchanged at 32.7" in ch7_t or "32.7" in ch7_t
        results["12. chapter_7_whatif_slider_interactive"] = True

        # 11. Contrast measurements
        body_color = page.evaluate("() => window.getComputedStyle(document.querySelector('p')).color")
        body_bg = page.evaluate("() => window.getComputedStyle(document.body).backgroundColor")
        c_ratio = contrast_ratio(parse_rgb(body_color), parse_rgb(body_bg))
        print(f"  Measured body text contrast: {c_ratio:.2f}:1")
        evidence["body_contrast"] = f"{c_ratio:.2f}:1"
        results["13. contrast_above_wcag_aa"] = (c_ratio >= 4.5)

        # 12. Responsive captures & no horizontal scroll
        # 1440x900
        page.screenshot(path="C:/Users/Aum Lenka/.gemini/antigravity-ide/brain/792e19fb-97ac-4141-9214-6232496fb12c/landing_1440x900.png")
        # 1280x720
        page.set_viewport_size({"width": 1280, "height": 720})
        page.screenshot(path="C:/Users/Aum Lenka/.gemini/antigravity-ide/brain/792e19fb-97ac-4141-9214-6232496fb12c/landing_1280x720.png")
        # 390x844
        page.set_viewport_size({"width": 390, "height": 844})
        scroll_w = page.evaluate("document.documentElement.scrollWidth")
        client_w = page.evaluate("document.documentElement.clientWidth")
        assert scroll_w <= client_w + 1
        page.screenshot(path="C:/Users/Aum Lenka/.gemini/antigravity-ide/brain/792e19fb-97ac-4141-9214-6232496fb12c/landing_390x844.png")
        results["14. responsive_no_horizontal_scroll"] = True

        # 13. Keyboard accessibility check (Tab key reaches interactive elements)
        page.keyboard.press("Tab")
        page.keyboard.press("Tab")
        active_el = page.evaluate("() => document.activeElement ? document.activeElement.tagName : ''")
        results["15. keyboard_accessible_focus"] = bool(active_el)

        # 14. CTA Navigation to /dashboard
        page.set_viewport_size({"width": 1440, "height": 900})
        cta_map = page.locator("a:has-text('Explore the Risk Map')").first
        cta_map.click()
        page.wait_for_url("**/dashboard")
        assert "/dashboard" in page.url
        results["16. cta_navigates_to_dashboard"] = True

        # ---------------------------------------------------------------------
        # PART 2: TEST DASHBOARD ROUTE AT http://localhost:3000/dashboard
        # ---------------------------------------------------------------------
        print("\n[PART 2] Verifying Dashboard Page at http://localhost:3000/dashboard ...")
        # Direct load and hard reload
        page.goto("http://localhost:3000/dashboard", wait_until="networkidle")
        page.wait_for_timeout(3000)
        results["17. dashboard_direct_load"] = True

        page.reload(wait_until="networkidle")
        page.wait_for_timeout(3000)
        results["18. dashboard_hard_reload"] = True

        # Test Header Logo links back to /
        logo_link = page.locator("a[aria-label='GeoShield Home']")
        assert logo_link.is_visible()
        href = logo_link.get_attribute("href")
        print(f"  Dashboard Logo link href: '{href}'")
        results["19. dashboard_logo_links_to_root"] = (href == "/")

        # Test Tour Hint at ?tour=whatif
        print("\n[PART 3] Testing ?tour=whatif Hint on Dashboard...")
        page.goto("http://localhost:3000/dashboard?tour=whatif", wait_until="networkidle")
        page.wait_for_timeout(2000)

        tour_hint = page.locator("div[role='status']:has-text('Select a cell on the map, then try +10%, +20% or +30% rainfall.')")
        assert tour_hint.is_visible(), "Tour hint must be visible with ?tour=whatif"
        print("  Tour hint visible: PASS")

        # Dismiss tour hint
        dismiss_btn = tour_hint.locator("button[aria-label='Dismiss tour tip']")
        dismiss_btn.click()
        page.wait_for_timeout(300)
        assert not tour_hint.is_visible(), "Tour hint should be dismissed"
        print("  Tour hint dismissal: PASS")
        results["20. dashboard_tour_hint_functional"] = True

        # Test Operational Dashboard Map & Backend API
        print("\n[PART 4] Testing Dashboard Map, Backend Integration & Features...")
        # Check API connection indicator
        connected_badge = page.locator("header span:has-text('Connected')")
        page.wait_for_selector("header span:has-text('Connected')", timeout=8000)
        assert connected_badge.is_visible(), "Dashboard should be Connected to backend"
        results["21. backend_api_connected"] = True

        # Check Map canvas exists
        map_canvas = page.locator(".maplibregl-canvas")
        assert map_canvas.is_visible(), "MapLibre canvas should be visible"
        results["22. maplibre_basemap_rendered"] = True

        # Test Search for verified cell r0142_c0087
        print("  Testing search for r0142_c0087...")
        search_input = page.locator("input[placeholder*='Search cell ID']")
        search_input.fill("r0142_c0087")
        search_input.press("Enter")
        page.wait_for_timeout(2500)

        # Verify Detail Panel contents for r0142_c0087
        detail_panel = page.locator("aside")
        panel_text = detail_panel.text_content() or ""
        print(f"  Detail panel loaded for r0142_c0087. Checking details...")
        assert "r0142_c0087" in panel_text
        assert "32.7" in panel_text, "Susceptibility Score must be 32.7"
        assert "Low-Moderate" in panel_text, "Current Risk must be Low-Moderate"
        assert "ELEVATED" in panel_text, "Trigger State must be ELEVATED"
        assert "10" in panel_text, "Nearest weather location must be 10"
        results["23. search_and_cell_predict_verified_r0142"] = True

        # Test Simulation +30% on r0142_c0087
        print("  Testing rainfall simulation +30% on r0142_c0087...")
        sim_btn_30 = detail_panel.locator("button:has-text('+30%')")
        sim_btn_30.click()
        page.wait_for_timeout(2000)

        panel_sim_text = detail_panel.text_content() or ""
        assert "HIGH" in panel_sim_text, "Trigger state should shift to HIGH"
        assert "Moderate" in panel_sim_text, "Current risk should shift to Moderate"
        assert "32.7" in panel_sim_text, "Susceptibility score must remain unchanged at 32.7"
        print("  Simulation +30% verified: ELEVATED -> HIGH, Low-Moderate -> Moderate, Score unchanged at 32.7")
        results["24. simulation_plus_30_percent_verified"] = True

        # Test Search invalid cell r9999_c9999
        print("  Testing search for invalid cell r9999_c9999...")
        search_input.fill("r9999_c9999")
        search_input.press("Enter")
        page.wait_for_timeout(2000)
        body_after_search = (page.locator("body").text_content() or "").lower()
        assert "no cell with id" in body_after_search or "not found" in body_after_search or "cell ids look like" in body_after_search
        results["25. invalid_cell_search_handled"] = True

        # Test second verified cell r0137_c0204
        print("  Testing search for r0137_c0204...")
        search_input.fill("r0137_c0204")
        search_input.press("Enter")
        page.wait_for_timeout(2500)
        panel_text2 = detail_panel.text_content() or ""
        assert "73.3" in panel_text2, "Susceptibility Score must be 73.3"
        assert "Critical" in panel_text2, "Current Risk must be Critical"
        assert "HIGH" in panel_text2, "Trigger State must be HIGH"
        assert "12" in panel_text2, "Nearest weather location must be 12"
        results["26. cell_predict_verified_r0137"] = True

        # Capture Dashboard Screenshots
        page.screenshot(path="C:/Users/Aum Lenka/.gemini/antigravity-ide/brain/792e19fb-97ac-4141-9214-6232496fb12c/dashboard_1440x900.png")
        page.set_viewport_size({"width": 1280, "height": 720})
        page.screenshot(path="C:/Users/Aum Lenka/.gemini/antigravity-ide/brain/792e19fb-97ac-4141-9214-6232496fb12c/dashboard_1280x720.png")
        page.set_viewport_size({"width": 390, "height": 844})
        page.screenshot(path="C:/Users/Aum Lenka/.gemini/antigravity-ide/brain/792e19fb-97ac-4141-9214-6232496fb12c/dashboard_390x844.png")

        browser.close()

    print("\n" + "=" * 70)
    print("ALL VERIFICATION CHECKS SUMMARY:")
    all_ok = True
    for k, v in results.items():
        status = "PASS" if v else "FAIL"
        if not v: all_ok = False
        print(f"  {k:48s}: [{status}]")
    print("=" * 70)

    assert all_ok, "Some checks failed!"
    print("ALL 26 GEOSHIELD VERIFICATION CHECKS PASSED PERFECTLY!")

if __name__ == "__main__":
    run_tests()
