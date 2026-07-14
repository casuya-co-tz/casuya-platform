# Simple direct test without cleanup in the same file
import re

# Simulate the optimized math injection logic
_LATEX_PATTERNS = [
    re.compile(r"\$\$[^$]+\$\$"),
    re.compile(r"\$[^$\n]+\$"),
    re.compile(r"\\\[[^\\]+\\\]"),
    re.compile(r"\\\([^\\]+\\\)"),
]

def _has_latex(html: str) -> bool:
    return any(p.search(html) for p in _LATEX_PATTERNS)

def _has_mathjax(html: str) -> bool:
    return any(
        marker in html
        for marker in ["mathjax", "MathJax", "tex-mml-chtml", "cdn.jsdelivr.net/npm/mathjax"]
    )

def _clean_mathjax_broken_katex(html: str) -> str:
    html = re.sub(r'<link[^>]*katex[^>]*>', '', html)
    html = re.sub(r'<script[^>]*katex[^>]*>.*?</script>', '', html, flags=re.DOTALL)
    return html

def _optimize_math_injection(html: str) -> str:
    if not _has_latex(html):
        return html

    if _has_mathjax(html):
        return _clean_mathjax_broken_katex(html)

    katex_css = '<link rel="stylesheet" href="/static/lib/katex/katex.min.css" crossorigin="anonymous">'
    katex_js = '<script src="/static/lib/katex/katex.min.js" crossorigin="anonymous"><\/script>'
    auto_render_js = '<script src="/static/lib/katex/contrib/auto-render.min.js" crossorigin="anonymous"><\/script>'
    render_call = (
        '<script>'
        'document.addEventListener("DOMContentLoaded",function(){'
        'if(typeof renderMathInElement==="function"){'
        'renderMathInElement(document.body,{delimiters:['
        '{left:"$$",right:"$$",display:true},'
        '{left:"$",right:"$",display:false},'
        '{left:"\\\\[",right:"\\\\]",display:true},'
        '{left:"\\\\(",right:"\\\\)",display:false}'
        ']});'
        '}'
        '});'
        '<\/script>'
    )

    if "<head>" not in html.lower():
        html = (
            "<!DOCTYPE html><html><head>"
            "<meta charset='UTF-8'>"
            "<meta name='viewport' content='width=device-width, initial-scale=1.0'>"
            + katex_css +
            "</head><body>"
            + html +
            katex_js + auto_render_js + render_call +
            "</body></html>"
        )
        return html

    if "<head>" in html.lower():
        html = html.replace("<head>", "<head>" + katex_css, 1)

    katex_scripts = katex_js + auto_render_js + render_call
    if "</body>" not in html.lower():
        html += katex_scripts
    else:
        html = html.replace("</body>", katex_scripts + "</body>", 1)

    return html

# Test cases
test_cases = [
    ("MathJax with MathJax CDN",
     "<html><head><script src=\"https://cdn.jsdelivr.net/npm/mathjax@3/dist/solid.js\"></script></head><body>$x^2$</body></html>",
     False),
    
    ("MathJax without KaTeX",
     "<html><head><script src=\"https://cdn.jsdelivr.net/npm/mathjax@3/dist/solid.js\"></script></head><body>Simple text</body></html>",
     False),
     
    ("KaTeX only",
     "<html><head></head><body>$$x^2 = y$$</body></html>",
     True),
     
    ("Mixed (broken) case",
     "<html><head><script src=\"https://cdn.jsdelivr.net/npm/mathjax@3/dist/solid.js\"></script><link rel=\"stylesheet\" href=\"/static/lib/katex/katex.min.css\"></head><body>$x^2$</body></html>",
     True),
     
    ("No math delimiters",
     "<html><head></head><body>Simple text without math</body></html>",
     False),
]

print("=" * 80)
print("TESTING KATEX LOGIC")
print("=" * 80)

perfect_scenarios = 0
total_scenarios = len(test_cases)

for name, html, expected_latex in test_cases:
    has_latex = _has_latex(html)
    has_mathjax = _has_mathjax(html)
    cleaned = _clean_mathjax_broken_katex(html)
    optimized = _optimize_math_injection(html)
    
    print(f"\n{name}:")
    print(f"  Has LaTeX: {has_latex} (expected: {expected_latex})")
    print(f"  Has MathJax: {has_mathjax}")
    
    has_katex_injection = any(katex_marker in optimized for katex_marker in ["katex.min.css", "katex.min.js", "auto-render.min.js"])
    print(f"  KaTeX injected: {has_katex_injection}")
    
    if has_mathjax:
        has_broken_katex = any(katex_marker in cleaned for katex_marker in ["katex.min.css", "katex.min.js", "auto-render.min.js"])
        print(f"  Cleaned KaTeX: {has_broken_katex}")
        
        if not has_broken_katex:
            print(f"  ✅ Result: PERFECT (cleaned)")
            perfect_scenarios += 1
        else:
            print(f"  ❌ Result: BROKEN (KaTeX remains)")
    else:
        if expected_latex and has_katex_injection:
            print(f"  ✅ Result: PERFECT (KaTeX injected as expected)")
            perfect_scenarios += 1
        elif not expected_latex and not has_katex_injection:
            print(f"  ✅ Result: PERFECT (no injection needed)")
            perfect_scenarios += 1
        else:
            print(f"  ❌ Result: BROKEN (unexpected state)")

print("\n" + "=" * 80)
print("FINAL RATING")
print("=" * 80)
print(f"Perfect scenarios: {perfect_scenarios}/{total_scenarios} ({perfect_scenarios/total_scenarios*100:.1f}%)")

if perfect_scenarios == total_scenarios:
    print("🎉 ALL SCENARIOS PERFECT - The logic is working correctly!")
else:
    print("⚠️  Some scenarios need review")

# Quick verification of the specific files
print("\n" + "=" * 80)
print("QUICK VERIFICATION OF RELEVANT FILES")
print("=" * 80)

# Check what we have in the storage
test_HTML_path = "C:\Users\Admin\Desktop\casuya-ecosytems\casuya-platform\storage\lesson-packages\qu\ad\quadratic-formula-63b6f4ff.html"
real_file_path = "C:\Users\Admin\Desktop\casuya-ecosytems\casuya-platform\storage\lesson-packages\qu\ad\quadratic-formula-0560edf1.html"

if os.path.exists(test_HTML_path):
    with open(test_HTML_path, 'r') as f:
        html = f.read()
        print(f"\n{os.path.basename(test_HTML_path)}:")
        print(f"  Has MathJax: {any(m in html for m in ['mathjax', 'MathJax'])}")
        print(f"  Has KaTeX: {any(k in html for k in ['/static/lib/katex'])}")

if os.path.exists(real_file_path):
    with open(real_file_path, 'r') as f:
        html = f.read()
        print(f"\n{os.path.basename(real_file_path)}:")
        print(f"  Has MathJax: {any(m in html for m in ['mathjax', 'MathJax'])}")
        print(f"  Has KaTeX: {any(k in html for k in ['/static/lib/katex'])}")
        
        if 'katex.min.css' in html:
            print(f"  ❌ CONTAINS BROKEN KATEX")
        else:
            print(f"  ✅ NO BROKEN KATEX")
