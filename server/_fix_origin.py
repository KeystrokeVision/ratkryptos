import io
p = r"C:\Users\user\kryptos\server\kryptos_launcher.py"
s = io.open(p, encoding="utf-8").read()
old = '''    api = Api()
    webview.create_window(APP, html=html, js_api=api, width=1300, height=840,
                          min_size=(1000, 640), background_color="#140604")
    webview.start(debug=False)'''
new = '''    html = html.encode("utf-8")

    import http.server
    import socketserver
    import threading

    class _H(http.server.BaseHTTPRequestHandler):
        def do_GET(self):
            self.send_response(200)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Cache-Control", "no-cache")
            self.send_header("Content-Length", str(len(html)))
            self.end_headers()
            self.wfile.write(html)

        def log_message(self, *a):
            pass

    socketserver.TCPServer.allow_reuse_address = True
    srv = socketserver.TCPServer(("127.0.0.1", 0), _H)
    port = srv.server_address[1]
    threading.Thread(target=srv.serve_forever, daemon=True).start()

    api = Api()
    webview.create_window(APP, url="http://127.0.0.1:%d/" % port, js_api=api, width=1300, height=840,
                          min_size=(1000, 640), background_color="#140604")
    webview.start(debug=False)'''
assert old in s, "main no encontrado"
s = s.replace(old, new)
io.open(p, "w", encoding="utf-8", newline="\n").write(s)
print("OK server")