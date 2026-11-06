import io
p = r"C:\Users\user\kryptos\server\kryptos_ui.html"
s = io.open(p, encoding="utf-8").read()
old = '''async function conn(id){
  var s=servers.filter(function(x){return x.id===id;})[0];
  if(!s)return;
  toast('Conectando...');
  var r=await pywebview.api.connect(id);
  if(!r||!r.ok){toast(r&&r.msg?r.msg:'Error');return;}
  openTab(id, s.name, r.url);
  toast(r.msg||'Conectado');
}'''
new = '''var two_sid=null, two_tft=null;
async function conn(id){
  var s=servers.filter(function(x){return x.id===id;})[0];
  if(!s)return;
  toast('Conectando...');
  var r=await pywebview.api.connect(id);
  if(!r){toast('Error');return;}
  if(r.need2fa){two_sid=id;two_tft=r.tft;document.getElementById('c2').value='';document.getElementById('mask2').classList.add('on');document.getElementById('c2').focus();return;}
  if(!r.ok){toast(r.msg||'Error');return;}
  openTab(id, s.name, r.url);
  toast(r.msg||'Conectado');
}
async function conn2(){
  var code=(document.getElementById('c2').value||'').trim();
  if(code.length<6){toast('Codigo de 6 digitos');return;}
  toast('Verificando...');
  var sv=servers.filter(function(x){return x.id===two_sid;})[0];
  var r=await pywebview.api.connect(two_sid, code, two_tft);
  if(!r||!r.ok){toast(r&&r.msg?r.msg:'Codigo incorrecto');return;}
  document.getElementById('mask2').classList.remove('on');
  openTab(two_sid, sv?sv.name:'', r.url);
  toast('Conectado');
}
function close2(){document.getElementById('mask2').classList.remove('on');}'''
assert old in s, "conn no encontrado"
s = s.replace(old, new)
modal = '''<div class="mask" id="mask2">
  <div class="modal" style="width:340px">
    <h2>Codigo <span>2FA</span></h2>
    <div class="f"><label>Codigo del autenticador (6 digitos)</label><input id="c2" maxlength="6" inputmode="numeric" placeholder="000000" onkeydown="if(event.key==='Enter')conn2()"></div>
    <div class="mfoot">
      <button class="btn" onclick="close2()">Cancelar</button>
      <button class="btn pri" onclick="conn2()">Verificar</button>
    </div>
  </div>
</div>
<div class="toast" id="toast"></div>'''
assert '<div class="toast" id="toast"></div>' in s
s = s.replace('<div class="toast" id="toast"></div>', modal, 1)
io.open(p, "w", encoding="utf-8", newline="\n").write(s)
print("OK html")