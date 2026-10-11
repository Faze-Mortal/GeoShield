import json
import urllib.request
import urllib.error
from playwright.sync_api import sync_playwright

def run_tests():
    print("=" * 75)
    print("GEOSHIELD PRODUCTION HARDENING, SECURITY & REGRESSION VERIFICATION")
    print("=" * 75)

    test_results = {}

    # -------------------------------------------------------------------------
    # TEST 1: BACKEND NEUTRALITY & CONTRACT INTEGRITY
    # -------------------------------------------------------------------------
    print("\n[TEST 1] Verifying Backend Contract Neutrality...")

    def api_req(path, method="GET", data=None, headers=None):
        req_headers = {"Content-Type": "application/json"} if data else {}
        if headers:
            req_headers.update(headers)
        body_bytes = json.dumps(data).encode("utf-8") if data else None
        req = urllib.request.Request(f"http://127.0.0.1:8000{path}", data=body_bytes, headers=req_headers, method=method)
        try:
            with urllib.request.urlopen(req) as resp:
                return resp.status, dict(resp.headers), json.loads(resp.read().decode())
        except urllib.error.HTTPError as e:
            return e.code, dict(e.headers), json.loads(e.read().decode())

    # Cell 1: r0142_c0087
    s_pred1, h_pred1, d_pred1 = api_req("/predict/r0142_c0087")
    print(f"  r0142_c0087: status={s_pred1}, score={d_pred1.get('susceptibility_score')}, trigger={d_pred1.get('trigger_state')}, risk={d_pred1.get('current_risk')}")
    pass_pred1 = (
        s_pred1 == 200
        and d_pred1.get("susceptibility_score") == 32.7
        and d_pred1.get("trigger_state") == "ELEVATED"
        and d_pred1.get("current_risk") == "Low-Moderate"
        and d_pred1.get("rainfall_location_id") == 10
    )
    test_results["backend.predict_r0142_c0087"] = pass_pred1

    # Cell 2: r0137_c0204
    s_pred2, h_pred2, d_pred2 = api_req("/predict/r0137_c0204")
    print(f"  r0137_c0204: status={s_pred2}, score={d_pred2.get('susceptibility_score')}, trigger={d_pred2.get('trigger_state')}, risk={d_pred2.get('current_risk')}")
    pass_pred2 = (
        s_pred2 == 200
        and d_pred2.get("susceptibility_score") == 73.3
        and d_pred2.get("trigger_state") == "HIGH"
        and d_pred2.get("current_risk") == "Critical"
        and d_pred2.get("rainfall_location_id") == 12
    )
    test_results["backend.predict_r0137_c0204"] = pass_pred2

    # Simulation: 0% and +30% for r0142_c0087
    s_sim0, _, d_sim0 = api_req("/simulate", "POST", {"cell_id": "r0142_c0087", "rainfall_adjustment_percent": 0.0})
    s_sim30, _, d_sim30 = api_req("/simulate", "POST", {"cell_id": "r0142_c0087", "rainfall_adjustment_percent": 30.0})
    print(f"  Simulate 0%: trigger={d_sim0.get('simulated_trigger_state')}, risk={d_sim0.get('simulated_current_risk')}")
    print(f"  Simulate +30%: trigger={d_sim30.get('simulated_trigger_state')}, risk={d_sim30.get('simulated_current_risk')}")
    pass_sim = (
        d_sim0.get("simulated_trigger_state") == "ELEVATED"
        and d_sim0.get("simulated_current_risk") == "Low-Moderate"
        and d_sim30.get("simulated_trigger_state") == "HIGH"
        and d_sim30.get("simulated_current_risk") == "Moderate"
        and d_sim30.get("susceptibility_score") == 32.7
    )
    test_results["backend.simulate_neutrality"] = pass_sim

    # 404 test
    s_404, _, d_404 = api_req("/predict/r9999_c9999")
    test_results["backend.predict_404"] = (s_404 == 404 and d_404.get("detail") == "Cell not found")

    # Grid bounding box
    s_grid, _, d_grid = api_req("/grid?min_lon=76.90&min_lat=31.47&max_lon=77.40&max_lat=31.72&limit=5")
    test_results["backend.grid_bbox"] = (s_grid == 200 and d_grid.get("type") == "FeatureCollection" and len(d_grid.get("features", [])) > 0)

    # -------------------------------------------------------------------------
    # TEST 2: CORS & SECURITY HEADERS
    # -------------------------------------------------------------------------
    print("\n[TEST 2] Verifying CORS and Security Headers...")
    # Allowed CORS
    _, h_cors_ok, _ = api_req("/", headers={"Origin": "http://localhost:3000"})
    test_results["cors.allowed_origin_accepted"] = (h_cors_ok.get("access-control-allow-origin") == "http://localhost:3000")

    # Disallowed CORS
    _, h_cors_bad, _ = api_req("/", headers={"Origin": "http://evil-origin.com"})
    test_results["cors.disallowed_origin_rejected"] = ("access-control-allow-origin" not in h_cors_bad)

    # Backend X-Robots-Tag
    test_results["backend.x_robots_tag_noindex"] = (h_cors_ok.get("x-robots-tag") == "noindex")

    # Frontend security headers
    fe_req = urllib.request.Request("http://localhost:3000/")
    with urllib.request.urlopen(fe_req) as fe_resp:
        fe_headers = {k.lower(): v for k, v in fe_resp.headers.items()}

    test_results["frontend.x_content_type_options"] = (fe_headers.get("x-content-type-options") == "nosniff")
    test_results["frontend.referrer_policy"] = (fe_headers.get("referrer-policy") == "strict-origin-when-cross-origin")
    test_results["frontend.x_frame_options"] = (fe_headers.get("x-frame-options") == "DENY")
    test_results["frontend.permissions_policy"] = ("camera=()" in fe_headers.get("permissions-policy", ""))
    test_results["frontend.csp_report_only"] = ("default-src 'self'" in fe_headers.get("content-security-policy-report-only", ""))

    # -------------------------------------------------------------------------
    # TEST 3: REAL BROWSER AUDIT & REGRESSION
    # -------------------------------------------------------------------------
    print("\n[TEST 3] Running Real Browser Regression in Chromium...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")

        # 3A: Landing page (/)
        print("  Checking Landing Page (/)...")
        ctx_landing = browser.new_context(viewport={"width": 1440, "height": 900})
        p_landing = ctx_landing.new_page()
        landing_reqs = []
        p_landing.on("request", lambda r: landing_reqs.append(r.url))
        landing_errors = []
        p_landing.on("console", lambda m: landing_errors.append(m.text) if m.type == "error" else None)

        p_landing.goto("http://localhost:3000/", wait_until="networkidle")
        p_landing.wait_for_timeout(1000)

        api_calls_landing = [u for u in landing_reqs if any(e in u for e in ["/grid", "/predict", "/simulate"])]
        maplibre_chunks = [u for u in landing_reqs if "maplibre" in u.lower()]

        test_results["browser.landing_zero_api"] = (len(api_calls_landing) == 0)
        test_results["browser.landing_zero_maplibre"] = (len(maplibre_chunks) == 0)
        test_results["browser.landing_zero_console_errors"] = (len(landing_errors) == 0)

        # 3B: Dashboard (/dashboard) at 1280x720
        print("  Checking Dashboard (/dashboard) at 1280x720...")
        ctx_dash = browser.new_context(viewport={"width": 1280, "height": 720})
        p_dash = ctx_dash.new_page()
        dash_reqs = []
        p_dash.on("request", lambda r: dash_reqs.append(r.url))
        dash_errors = []
        p_dash.on("console", lambda m: dash_errors.append(m.text) if m.type == "error" else None)

        p_dash.goto("http://localhost:3000/dashboard", wait_until="domcontentloaded")
        p_dash.wait_for_timeout(4000)

        # Verify notice bar presence
        notice = p_dash.locator("div[role='region'][aria-label='Research limitations notice']")
        test_results["browser.dashboard_notice_present"] = (notice.count() > 0)

        # Verify search box
        search_input = p_dash.locator("input[aria-label='Search cell ID']")
        test_results["browser.dashboard_search_input"] = (search_input.count() > 0)
        search_input.fill("r0142_c0087")
        p_dash.keyboard.press("Enter")
        p_dash.wait_for_timeout(2500)

        # Verify detail panel loaded
        detail_score = p_dash.locator("text=32.7")
        test_results["browser.dashboard_cell_selected"] = (detail_score.count() > 0)

        # Verify simulation +30%
        sim_btn = p_dash.locator("button:has-text('+30%')")
        test_results["browser.dashboard_sim_btn"] = (sim_btn.count() > 0)
        if sim_btn.count() > 0:
            sim_btn.click()
            p_dash.wait_for_timeout(2000)
            sim_res = p_dash.locator("div[role='region'][aria-label='Simulation results']")
            test_results["browser.dashboard_sim_executed"] = (sim_res.count() > 0)

        # Take screenshot of verified dashboard
        p_dash.screenshot(path="verified_dashboard_1280x720.png")
        print("  Captured verified_dashboard_1280x720.png")

        # 3C: Mobile Dashboard at 390x844
        print("  Checking Mobile Dashboard at 390x844...")
        ctx_mobile = browser.new_context(viewport={"width": 390, "height": 844})
        p_mobile = ctx_mobile.new_page()
        p_mobile.goto("http://localhost:3000/dashboard", wait_until="domcontentloaded")
        p_mobile.wait_for_timeout(3000)
        p_mobile.screenshot(path="verified_dashboard_390x844.png")
        print("  Captured verified_dashboard_390x844.png")

        # 3D: Privacy page (/privacy)
        print("  Checking Privacy Page (/privacy)...")
        p_priv = browser.new_page()
        p_priv.goto("http://localhost:3000/privacy", wait_until="domcontentloaded")
        p_priv.wait_for_timeout(1000)
        priv_title = p_priv.locator("h1:has-text('Privacy Notice')")
        test_results["browser.privacy_page_loaded"] = (priv_title.count() > 0)

        # 3E: Terms page (/terms#limitations)
        print("  Checking Terms Page (/terms#limitations)...")
        p_terms = browser.new_page()
        p_terms.goto("http://localhost:3000/terms#limitations", wait_until="domcontentloaded")
        p_terms.wait_for_timeout(1000)
        terms_limitations = p_terms.locator("#limitations")
        test_results["browser.terms_limitations_loaded"] = (terms_limitations.count() > 0)

        # 3F: 404 Custom page
        print("  Checking Custom 404 Route (/nonexistent-path-test)...")
        p_404 = browser.new_page()
        resp_404 = p_404.goto("http://localhost:3000/nonexistent-path-test", wait_until="domcontentloaded")
        p_404.wait_for_timeout(1000)
        test_results["browser.custom_404_status"] = (resp_404.status == 404)
        h1_404 = p_404.locator("h1:has-text('Terrain Unknown')")
        test_results["browser.custom_404_heading"] = (h1_404.count() > 0)

        browser.close()

    # -------------------------------------------------------------------------
    # PRINT SUMMARY
    # -------------------------------------------------------------------------
    print("\n" + "=" * 75)
    print("VERIFICATION RESULTS SUMMARY:")
    print("=" * 75)
    all_passed = True
    for test_name, passed in test_results.items():
        status = "[PASS]" if passed else "[FAIL]"
        if not passed:
            all_passed = False
        print(f"  {status.ljust(8)} {test_name}")
    print("=" * 75)
    if all_passed:
        print("ALL VERIFICATION SUITES PASSED PERFECTLY!\n")
    else:
        print("SOME TESTS FAILED!\n")

    return all_passed

if __name__ == "__main__":
    success = run_tests()
    exit(0 if success else 1)
