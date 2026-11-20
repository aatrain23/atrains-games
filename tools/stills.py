"""Screenshots each play of a day at its final frame + verdict, for a visual check. Usage: python3 tools/stills.py <day> <outdir>
Needs playwright and Chrome (/usr/bin/google-chrome). Skip if unavailable; run tools/check.js regardless."""
import sys, os, threading, http.server, functools
from playwright.sync_api import sync_playwright
day, out = int(sys.argv[1]), sys.argv[2]; os.makedirs(out, exist_ok=True)
root = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..")
h = functools.partial(http.server.SimpleHTTPRequestHandler, directory=root); h.log_message = lambda *a: None
srv = http.server.ThreadingHTTPServer(("127.0.0.1", 8765), h); threading.Thread(target=srv.serve_forever, daemon=True).start()
with sync_playwright() as p:
    b = p.chromium.launch(executable_path="/usr/bin/google-chrome"); pg = b.new_page(viewport={"width": 420, "height": 900}); errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto(f"http://127.0.0.1:8765/index.html?day={day}"); pg.wait_for_function("window.__ytr", timeout=15000)
    n = pg.evaluate("document.querySelectorAll('#dots .dot').length")
    for i in range(n):
        pg.evaluate("__ytr.skip()"); pg.wait_for_timeout(150); pg.screenshot(path=f"{out}/play{i+1}_end.png")
        pg.evaluate("__ytr.answer(0)"); pg.wait_for_timeout(150); pg.screenshot(path=f"{out}/play{i+1}_verdict.png", full_page=True); pg.click("#next"); pg.wait_for_timeout(300)
    print("day", pg.evaluate("document.getElementById('sub').textContent"), "plays", n, "errors", errs); b.close()
