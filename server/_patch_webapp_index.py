import io
p = r"C:\Users\user\kryptos\server\web-app\index.html"
s = io.open(p, encoding="utf-8", newline="").read()
if "kryptos-hash-login" in s:
    print("YA PARCHADO")
else:
    js = "<script id=\"kryptos-hash-login\">(function(){try{var m=(location.hash||\"\").match(/kryptos=([^&]+)/);if(m){var d=JSON.parse(decodeURIComponent(m[1]));if(d&&d.token){localStorage.setItem(\"token\",d.token);localStorage.setItem(\"admin_token\",d.token);localStorage.setItem(\"username\",d.username||\"\");localStorage.setItem(\"role\",\"admin\");}history.replaceState(null,\"\",location.pathname+location.search);location.reload();}}catch(e){}})();</script>"
    i = s.lower().rfind("</head>")
    s = (s[:i] + js + s[i:]) if i >= 0 else (js + s)
    io.open(p, "w", encoding="utf-8", newline="").write(s)
    print("PATCH OK web-app/index.html")