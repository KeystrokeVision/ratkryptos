import io, re
new = "<script id=\"kryptos-hash-login\">(function(){try{var m=(location.hash||\"\").match(/kryptos=([^&]+)/);if(m){var d=JSON.parse(decodeURIComponent(m[1]));if(d&&d.token){localStorage.setItem(\"token\",d.token);localStorage.removeItem(\"admin_token\");localStorage.setItem(\"username\",d.username||\"\");localStorage.setItem(\"role\",\"admin\");}}}catch(e){}})();</script>"
for p in [r"C:\Users\user\kryptos\server\web-dist\index.html", r"C:\Users\user\kryptos\server\web-app\index.html"]:
    s = io.open(p, encoding="utf-8", newline="").read()
    s2 = re.sub(r'<script id="kryptos-hash-login">.*?</script>', new, s, flags=re.S)
    if s2 == s:
        i = s.lower().rfind("</head>")
        s2 = (s[:i] + new + s[i:]) if i >= 0 else (new + s)
    io.open(p, "w", encoding="utf-8", newline="").write(s2)
    print("OK", p.split("\\")[-1], "cambiado:", s2 != s)