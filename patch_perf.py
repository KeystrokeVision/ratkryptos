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

old_b = "        if _is_black and _tree_live:\n            self.maybe_render_tree(device_id)"
assert s.count(old_b) == 1
s = s.replace(old_b, "        if _is_black and _tree_live:\n            await self.maybe_render_tree(device_id)")

old_c = "    def store_screen_hierarchy(self, device_id: str):"
assert s.count(old_c) == 1
s = s.replace(old_c, "    async def store_screen_hierarchy(self, device_id: str):")

old_d = "        try:\n            self._persist_hierarchy(device_id, hierarchy_data if isinstance(hierarchy_data, str) else json.dumps(hierarchy_data))"
assert s.count(old_d) == 1
s = s.replace(old_d, "        try:\n            _hd = hierarchy_data if isinstance(hierarchy_data, str) else json.dumps(hierarchy_data)\n        except Exception:\n            _hd = \"\"\n        try:\n            await asyncio.to_thread(self._persist_hierarchy, device_id, _hd)")

old_e = "                self.maybe_render_tree(device_id)"
assert s.count(old_e) == 1
s = s.replace(old_e, "                await self.maybe_render_tree(device_id)")

old_f = "manager.store_screen_hierarchy(device_id, hierarchy_data)"
assert s.count(old_f) == 2
s = s.replace(old_f, "await manager.store_screen_hierarchy(device_id, hierarchy_data)")

open(M, "w", encoding="utf-8").write(s)
print("PARCHE PERF APLICADO")
print("=== referencias restantes ===")
for n, line in enumerate(open(M, encoding="utf-8"), 1):
    if "store_screen_hierarchy(" in line or "maybe_render_tree(" in line:
        print(n, line.rstrip()[:110])
