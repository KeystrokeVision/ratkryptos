import shutil
M = r"C:\Users\user\kryptos\server\main.py"
shutil.copyfile(M, M + ".bak_perf")
s = open(M, encoding="utf-8").read()
assert "_TREE_HASH" not in s, "ya parcheado"

i = s.index("    def maybe_render_tree(self, device_id: str):")
j = s.index("    def _is_black_jpeg", i)
NEW = '''    async def maybe_render_tree(self, device_id: str):
        """Troca frame preto pela arvore renderizada (throttle 250ms + so se mudou)."""
        now = time.time()
        ts = globals().setdefault("_TREE_RENDER_TS", {})
        if now - ts.get(device_id, 0) < 0.25:
            return
        ts[device_id] = now
        raw = self.device_screen_hierarchies.get(device_id)
        if not raw:
            return
        try:
            _key = raw if isinstance(raw, str) else json.dumps(raw, sort_keys=True)
            _hh = hash(_key)
        except Exception:
            _hh = None
        if _hh is not None:
            _hs = globals().setdefault("_TREE_HASH", {})
            if _hs.get(device_id) == _hh and self.device_screens.get(device_id):
                return
            _hs[device_id] = _hh
        try:
            img = await asyncio.to_thread(self.render_tree_image, device_id, raw)
        except Exception as _e:
            logger.warning("maybe_render_tree thread err: " + str(_e))
            img = None
        if not img:
            return
        self.device_screens[device_id] = img
        try:
            await asyncio.to_thread(self._persist_frame, device_id, img)
        except Exception:
            pass
        try:
            await self._broadcast_frame(device_id, img)
        except Exception:
            pass

'''
s = s[:i] + NEW + s[j:]

def rep(old, new, expect):
    global s
    c = s.count(old)
    assert c == expect, "esperaba %d, hay %d -> %r" % (expect, c, old[:60])
    s = s.replace(old, new)

rep("        if _is_black and _tree_live:\n            self.maybe_render_tree(device_id)",
    "        if _is_black and _tree_live:\n            await self.maybe_render_tree(device_id)", 1)

rep("    def store_screen_hierarchy(self, device_id: str, hierarchy_data: str):",
    "    async def store_screen_hierarchy(self, device_id: str, hierarchy_data: str):", 1)

rep("        try:\n            self._persist_hierarchy(device_id, hierarchy_data if isinstance(hierarchy_data, str) else json.dumps(hierarchy_data))",
    "        try:\n            _hd = hierarchy_data if isinstance(hierarchy_data, str) else json.dumps(hierarchy_data)\n        except Exception:\n            _hd = \"\"\n        try:\n            await asyncio.to_thread(self._persist_hierarchy, device_id, _hd)", 1)

rep("                self.maybe_render_tree(device_id)",
    "                await self.maybe_render_tree(device_id)", 1)

rep("manager.store_screen_hierarchy(device_id, hierarchy_data)",
    "await manager.store_screen_hierarchy(device_id, hierarchy_data)", 2)

open(M, "w", encoding="utf-8").write(s)
print("PARCHE PERF APLICADO")
print("=== referencias restantes ===")
for n, line in enumerate(open(M, encoding="utf-8"), 1):
    if "store_screen_hierarchy(" in line or "maybe_render_tree(" in line:
        print(n, line.rstrip()[:105])
