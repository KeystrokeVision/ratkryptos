$t = "C:\Users\user\Downloads\Telegram Desktop\Btmob 4.6.1\Btmob 4.6.1\BTMOB_v4.6.1\Resources"
$apk = "$t\Apps\mantle.tropical.teacher.apk"
$out = "C:\Users\user\kryptos\_equipo\extraido"
New-Item -ItemType Directory -Force -Path $out | Out-Null
& "$t\tools\aapt.exe" dump xmltree $apk AndroidManifest.xml | Out-File "$out\manifiesto_full.txt" -Encoding utf8
& "$t\BTCache\7z.exe" l $apk | Out-File "$out\contenido_apk.txt" -Encoding utf8
$pat = "E: activity","E: service","E: receiver","E: permission","E: intent-filter","E: action","E: category","E: meta-data","A: android:name","A: android:exported","A: android:label","A: android:icon","A: android:permission","A: android:priority","A: android:resource","A: android:foregroundServiceType","A: android:targetActivity"
Select-String -Path "$out\manifiesto_full.txt" -Pattern $pat | ForEach-Object { $_.Line.Trim() } | Out-File "$out\manifiesto_filtrado.txt" -Encoding utf8
Select-String -Path "$out\contenido_apk.txt" -Pattern "res/xml/","res/layout/" | ForEach-Object { ($_.Line -split "\s+")[-1] } | Out-File "$out\recursos_ui.txt" -Encoding utf8
