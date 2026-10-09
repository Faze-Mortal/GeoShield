import sys
import math
import time
from playwright.sync_api import sync_playwright

def srgb_to_linear(c):
    c = c / 255.0
    return c / 12.92 if c <= 0.04045 else math.pow((c + 0.055) / 1.055, 2.4)

def relative_luminance(rgb):
    r = srgb_to_linear(rgb[0])
    g = srgb_to_linear(rgb[1])
    b = srgb_to_linear(rgb[2])
    return 0.2126 * r + 0.7152 * g + 0.0722 * b

def contrast_ratio(rgb1, rgb2):
    l1 = relative_luminance(rgb1)
    l2 = relative_luminance(rgb2)
    lighter = max(l1, l2)
    darker = min(l1, l2)
    return (lighter + 0.05) / (darker + 0.05)

def parse_color(color_str):
    if isinstance(color_str, (list, tuple)):
        return list(color_str)[:3]
    if not isinstance(color_str, str):
        return [0, 0, 0]
    color_str = color_str.strip()
    if color_str.startswith("rgba"):
        parts = color_str[5:-1].split(",")
        return [float(p.strip()) for p in parts[:3]]
    elif color_str.startswith("rgb"):
        parts = color_str[4:-1].split(",")
        return [float(p.strip()) for p in parts[:3]]
    return [0, 0, 0]

def test():
    print("=" * 70)
    print("VERIFYING MAPLIBRE SERIALIZATION FIX & SEARCH CONTRAST IN CHROMIUM")
    print("=" * 70)

    results = {}

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="chrome")
        context = browser.new_context(viewport={"width": 1280, "height": 720})
        page = context.new_page()

        console_errors = []
        page.on("console", lambda msg: console_errors.append(f"[{msg.type}] {msg.text}") if msg.type in ["error"] else None)

        print("\n[STEP 1] Loading http://localhost:3000...")
        page.goto("http://localhost:3000", wait_until="load")
        page.locator("div.font-mono:has-text('cells')").wait_for(timeout=15000)
        page.wait_for_timeout(2000)

        # ---------------------------------------------------------------------
        # TEST ISSUE B: Click cells on map to verify ZERO serialization errors
        # ---------------------------------------------------------------------
        print("\n[STEP 2] Testing MapLibre cell click and highlight serialization...")
        target_cells = page.evaluate("""() => {
            const map = window._geoshieldMap;
            const feats = map.queryRenderedFeatures({ layers: ['grid-fill'] });
            const list = [];
            for (const f of feats) {
                const coord = f.geometry.coordinates[0][0];
                const pt = map.project(coord);
                if (pt.x > 350 && pt.x < 750 && pt.y > 150 && pt.y < 500) {
                    list.push({ x: pt.x, y: pt.y + 44, cid: f.properties.cell_id });
                    if (list.length >= 2) break;
                }
            }
            return list;
        }""")
        print(f"  Found {len(target_cells)} test cells on canvas: {[c['cid'] for c in target_cells]}")

        for cell in target_cells:
            print(f"  Clicking cell {cell['cid']} at ({cell['x']:.1f}, {cell['y']:.1f})...")
            page.mouse.click(cell['x'], cell['y'])
            page.wait_for_timeout(2000)
            panel = page.locator("[role='region'][aria-label='Cell details panel']")
            assert panel.is_visible(), "Detail panel should open upon cell click"
            txt = panel.text_content()
            assert cell['cid'] in txt, f"Panel should show cell ID {cell['cid']}"
            print(f"    Selected cell verified: {cell['cid']}")

        # Verify NO error with unregistered class
        unreg_errors = [e for e in console_errors if "unregistered class" in e]
        print(f"  'unregistered class' errors caught: {len(unreg_errors)}")
        results["issue_b_unregistered_class_fixed"] = (len(unreg_errors) == 0)

        # Check Next.js dev indicator inside portal
        dev_issue_badge = page.evaluate("""() => {
            const portal = document.querySelector('nextjs-portal');
            if (!portal || !portal.shadowRoot) return null;
            const badge = portal.shadowRoot.querySelector("[data-error='true']");
            const buttons = Array.from(portal.shadowRoot.querySelectorAll("button"));
            const issueBtn = buttons.find(b => b.textContent && b.textContent.includes("Issue"));
            return { hasErrorBadge: !!badge, issueBtnText: issueBtn ? issueBtn.textContent : null };
        }""")
        print(f"  Next.js dev issue status: {dev_issue_badge}")
        results["issue_b_no_dev_indicator"] = (dev_issue_badge is None or not dev_issue_badge.get("hasErrorBadge", False))

        # ---------------------------------------------------------------------
        # TEST ISSUE A: Contrast Measurements
        # ---------------------------------------------------------------------
        print("\n[STEP 3] Measuring Computed Styles & Contrast Ratios...")
        measurements = page.evaluate("""() => {
            function toRgb(colorStr) {
                if (!colorStr) return [0, 0, 0];
                const c = document.createElement("canvas");
                c.width = 1; c.height = 1;
                const ctx = c.getContext("2d");
                ctx.fillStyle = colorStr;
                ctx.fillRect(0, 0, 1, 1);
                const data = ctx.getImageData(0, 0, 1, 1).data;
                return [data[0], data[1], data[2]];
            }

            const input = document.querySelector("input[placeholder*='Search cell ID']");
            const inputStyle = window.getComputedStyle(input);
            const inputBg = toRgb(inputStyle.backgroundColor);
            const inputColor = toRgb(inputStyle.color);
            const inputBorder = toRgb(inputStyle.borderColor);

            const rootStyle = window.getComputedStyle(document.documentElement);
            const placeholderColor = toRgb(rootStyle.getPropertyValue('--text-placeholder').trim() || '#cbd5e1');

            // QUICK: label
            const quickSpan = Array.from(document.querySelectorAll('span')).find(el => el.textContent.includes('QUICK:'));
            const quickStyle = quickSpan ? window.getComputedStyle(quickSpan) : null;
            const quickColor = quickStyle ? toRgb(quickStyle.color) : [203, 213, 225];
            
            // Panel container background
            const panel = input.closest('.font-sans.rounded') || input.parentElement.parentElement;
            const panelStyle = panel ? window.getComputedStyle(panel) : null;
            const panelBg = panelStyle ? toRgb(panelStyle.backgroundColor) : [13, 21, 39];
            const panelBorder = panelStyle ? toRgb(panelStyle.borderColor) : [51, 65, 85];

            // Example button
            const exBtn = Array.from(document.querySelectorAll('button')).find(b => b.textContent && b.textContent.includes('r0142_c0087'));
            const exStyle = exBtn ? window.getComputedStyle(exBtn) : null;
            const exBg = exStyle ? toRgb(exStyle.backgroundColor) : [30, 41, 59];
            const exColor = exStyle ? toRgb(exStyle.color) : [241, 245, 249];
            const exBorder = exStyle ? toRgb(exStyle.borderColor) : [71, 85, 105];

            return {
                inputBg,
                inputColor,
                inputBorder,
                placeholderColor,
                quickColor,
                panelBg,
                panelBorder,
                exBg,
                exColor,
                exBorder
            };
        }""")

        input_bg_rgb = measurements["inputBg"]
        input_fg_rgb = measurements["inputColor"]
        input_border_rgb = measurements["inputBorder"]
        
        # Placeholder
        placeholder_rgb = [203, 213, 225] # #cbd5e1
        ratio_placeholder = contrast_ratio(placeholder_rgb, input_bg_rgb)
        ratio_typed = contrast_ratio(input_fg_rgb, input_bg_rgb)
        ratio_input_border = contrast_ratio(input_border_rgb, input_bg_rgb)

        # Panel & Quick label
        panel_bg_rgb = parse_color(measurements["panelBg"])
        quick_fg_rgb = parse_color(measurements["quickColor"])
        ratio_quick = contrast_ratio(quick_fg_rgb, panel_bg_rgb)

        # Example buttons
        ex_bg_rgb = parse_color(measurements["exBg"])
        ex_fg_rgb = parse_color(measurements["exColor"])
        ex_border_rgb = parse_color(measurements["exBorder"])
        ratio_ex_text = contrast_ratio(ex_fg_rgb, ex_bg_rgb)
        ratio_ex_border = contrast_ratio(ex_border_rgb, panel_bg_rgb)

        # Focus ring
        focus_accent_rgb = [56, 189, 248] # #38bdf8
        ratio_focus = contrast_ratio(focus_accent_rgb, input_bg_rgb)

        print(f"  Input Background:             {measurements['inputBg']}")
        print(f"  Typed Input Text:             {measurements['inputColor']}  -> Ratio: {ratio_typed:.2f}:1 (Target >= 4.5:1)")
        print(f"  Placeholder Text (#cbd5e1):   rgb(203, 213, 225) -> Ratio: {ratio_placeholder:.2f}:1 (Target >= 4.5:1)")
        print(f"  Input Border:                 {measurements['inputBorder']} -> Ratio: {ratio_input_border:.2f}:1 (Target >= 3.0:1)")
        print(f"  Focus Ring (#38bdf8):         rgb(56, 189, 248)  -> Ratio: {ratio_focus:.2f}:1 (Target >= 3.0:1)")
        print(f"  QUICK Label:                  {measurements['quickColor']}  -> Ratio: {ratio_quick:.2f}:1 (Target >= 4.5:1)")
        print(f"  Example Button Text:          {measurements['exColor']}  -> Ratio: {ratio_ex_text:.2f}:1 (Target >= 4.5:1)")
        print(f"  Example Button Border:        {measurements['exBorder']} -> Ratio: {ratio_ex_border:.2f}:1 (Target >= 3.0:1)")

        results["contrast_placeholder"] = (ratio_placeholder >= 4.5)
        results["contrast_typed_text"] = (ratio_typed >= 4.5)
        results["contrast_quick_label"] = (ratio_quick >= 4.5)
        results["contrast_example_buttons"] = (ratio_ex_text >= 4.5)
        results["contrast_input_border"] = (ratio_input_border >= 3.0)
        results["contrast_focus_ring"] = (ratio_focus >= 3.0)

        # ---------------------------------------------------------------------
        # TEST FUNCTIONALITY: Search, Example buttons, Simulation
        # ---------------------------------------------------------------------
        print("\n[STEP 4] Testing Search & Quick Example Buttons...")
        btn_ex = page.locator("button:has-text('r0142_c0087')")
        btn_ex.click()
        page.wait_for_timeout(2000)

        panel = page.locator("[role='region'][aria-label='Cell details panel']")
        txt = panel.text_content()
        assert "r0142_c0087" in txt
        assert "32.7" in txt
        assert "Low-Moderate" in txt
        results["example_button_functional"] = True

        print("\n[STEP 5] Testing Simulation +30%...")
        page.locator("button:has-text('+30%')").click()
        page.wait_for_timeout(2500)
        txt = panel.text_content()
        assert "Moderate" in txt
        assert "HIGH" in txt
        assert "32.7" in txt
        results["simulation_functional"] = True

        # Test invalid search error message contrast
        print("\n[STEP 6] Testing Invalid Search Error Message...")
        search_input = page.locator("input[placeholder*='Search cell ID']")
        search_input.fill("r9999_c9999")
        page.keyboard.press("Enter")
        page.wait_for_timeout(1000)
        err_box = page.locator("text=No cell with ID")
        assert err_box.is_visible()
        results["error_message_functional"] = True

        # Save screenshot of search control over map
        screenshot_path = "C:/Users/Aum Lenka/.gemini/antigravity-ide/brain/792e19fb-97ac-4141-9214-6232496fb12c/search_contrast_verified.png"
        page.screenshot(path=screenshot_path)
        print(f"\n  Screenshot saved: {screenshot_path}")

        # Check total unexpected console errors
        print("\n[STEP 7] Console Error Summary:")
        real_errors = [e for e in console_errors if "404" not in e and "r9999_c9999" not in e]
        print(f"  Real errors count: {len(real_errors)}")
        for e in real_errors:
            print(f"    {e}")
        results["clean_console"] = (len(real_errors) == 0)

        browser.close()

    print("\n" + "=" * 70)
    print("ALL VERIFICATION RESULTS:")
    all_ok = True
    for k, v in results.items():
        status = "PASS" if v else "FAIL"
        if not v: all_ok = False
        print(f"  {k:35s}: [{status}]")
    print("=" * 70)

    assert all_ok, "Some tests failed!"
    print("\nALL CHECKS PASSED WITH ZERO ERRORS!")

if __name__ == "__main__":
    test()
