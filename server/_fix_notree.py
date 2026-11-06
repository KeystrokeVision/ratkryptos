import io
p = r"C:\Users\user\kryptos\server\main.py"
s = io.open(p, encoding="utf-8", newline="").read()
a = s.index("        if (_is_black and (_tree_live or _is_bank)) or _has_pwd:")
b = s.index("\n                return", a) + len("\n                return")
new = '''        if _is_black and _tree_live:
            self.maybe_render_tree(device_id)
            if self.device_screens.get(device_id):
                return'''
s = s[:a] + new + s[b:]
s = s.replace('setdefault("_TREE_IN_LIVE", True)', 'setdefault("_TREE_IN_LIVE", False)')
io.open(p, "w", encoding="utf-8", newline="").write(s)
print("OK notree")