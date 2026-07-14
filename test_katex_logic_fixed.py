import re
from backend.config.security import create_access_token
from backend.config.database import get_db
from backend.models.user import User

# Simple test without database
from backend.services.lesson_service import _has_latex, _has_mathjax, _clean_mathjax_broken_katex, _optimize_math_injection

# Test the core logic
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
     
    ("Complex MathJax with other content",
     "<html><head><meta charset='utf-8'><title>Test</title><script src=\"https://cdn.jsdelivr.net/npm/mathjax@3/dist/tex-mml-chtml.js\"></script><script>window.MathJax = { config: {} }</script></head><body>$x^2 + y^2 = z^2$</body></html>",
     False),
]

print("=" * 80)
print("TESTING KATEX LOGIC")
print("=" * 80)

test_results = []

for name, html, expected_latex in test_cases:
    has_latex = _has_latex(html)
    has_mathjax = _has_mathjax(html)
    cleaned = _clean_mathjax_broken_katex(html)
    optimized = _optimize_math_injection(html)
    
    test_results.append({
        "name": name,
        "has_latex": has_latex,
        "has_mathjax": has_mathjax,
        "cleaned": cleaned,
        "optimized": optimized
    })
    
    print(f"\n{name}:")
    print(f"  Input HTML length: {len(html)}")
    print(f"  Has LaTeX: {has_latex} (expected: {expected_latex})")
    print(f"  Has MathJax: {has_mathjax}")
    
    # Check if KaTeX was injected
    has_katex_injection = any(katex_marker in optimized for katex_marker in ["katex.min.css", "katex.min.js", "auto-render.min.js"])
    print(f"  KaTeX injected: {has_katex_injection}")
    
    # Check clean-up for MathJax
    if has_mathjax:
        has_broken_katex = any(katex_marker in cleaned for katex_marker in ["katex.min.css", "katex.min.js", "auto-render.min.js"])
        print(f"  Cleaned KaTeX from MathJax: {has_broken_katex}")

print("\n" + "=" * 80)
print("RATING RESULTS")
print("=" * 80)

perfect_scenarios = 0
total_scenarios = len(test_results)

for result in test_results:
    name = result["name"]
    has_mathjax = result["has_mathjax"]
    has_katex_injection = any(katex_marker in result["optimized"] for katex_marker in ["katex.min.css", "katex.min.js", "auto-render.min.js"])
    
    if "MathJax" in name and has_mathjax:
        # MathJax cases should NOT have KaTeX injection
        if not has_katex_injection:
            print(f"✅ {name}: Clean (MathJax preserved)")
            perfect_scenarios += 1
        else:
            print(f"❌ {name}: BROKEN (MathJax with KaTeX injected)")
    elif "KaTeX" in name:
        # KaTeX cases SHOULD have injection
        if has_katex_injection:
            print(f"✅ {name}: Clean (KaTeX injected as expected)")
            perfect_scenarios += 1
        else:
            print(f"❌ {name}: BROKEN (KaTeX not injected)")
    elif "Mixed" in name:
        # Mixed cases should be cleaned
        has_broken_katex = any(katex_marker in result["cleaned"] for katex_marker in ["katex.min.css", "katex.min.js", "auto-render.min.js"])
        if not has_broken_katex:
            print(f"✅ {name}: Clean (broken KaTeX removed)")
            perfect_scenarios += 1
        else:
            print(f"❌ {name}: BROKEN (KaTeX still present)")

print(f"\nOverall: {perfect_scenarios}/{total_scenarios} scenarios passed ({perfect_scenarios/total_scenarios*100:.1f}%)")

if perfect_scenarios == total_scenarios:
    print("🎉 ALL TESTS PASSED - The logic is working correctly!")
else:
    print("⚠️  Some tests failed - need to review the logic")

# Clean up test files
import os
os.remove("C:\Users\Admin\Desktop\casuya-ecosytems\casuya-platform\test_both_lessons.py")
os.remove("C:\Users\Admin\Desktop\casuya-ecosytems\casuya-platform\list_lessons.py")
