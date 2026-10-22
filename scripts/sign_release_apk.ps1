$ErrorActionPreference = "Continue"

$apk = ${env:KRYPTOS REMOTE_APK_PATH}
$ks  = ${env:KRYPTOS REMOTE_KEYSTORE}

Write-Host "[SIGN] APK: $apk"
Write-Host "[SIGN] Keystore: $ks"

if (-not $apk -or -not (Test-Path $apk)) { Write-Host "[SIGN] APK no encontrado"; exit 0 }
if (-not $ks  -or -not (Test-Path $ks))  { Write-Host "[SIGN] Keystore no encontrado"; exit 0 }

$sdk = $env:ANDROID_HOME
if (-not $sdk) { $sdk = "$env:LOCALAPPDATA\Android\Sdk" }

$bt = Get-ChildItem "$sdk\build-tools" -Directory -ErrorAction SilentlyContinue |
      Where-Object { $_.Name -match '^\d+(\.\d+)+$' } |
      Sort-Object { [version]$_.Name } -Descending | Select-Object -First 1
if (-not $bt) { Write-Host "[SIGN] build-tools no encontrado"; exit 0 }

$apksigner = Join-Path $bt.FullName "apksigner.bat"
$zipalign  = Join-Path $bt.FullName "zipalign.exe"
if (-not (Test-Path $apksigner)) { Write-Host "[SIGN] apksigner no encontrado"; exit 0 }

$storePass = "GooglePlayServices2024"
$keyAlias  = "google-services-key"
$keyPass   = "GooglePlayServices2024"

Write-Host "[SIGN] zipalign + apksigner con $($bt.Name)"

if (Test-Path $zipalign) {
    $tmp = "$apk.tmp"
    & $zipalign -f -p 4 "$apk" "$tmp" | Out-Null
    if ($LASTEXITCODE -eq 0 -and (Test-Path $tmp)) { Move-Item -Force "$tmp" "$apk" }
}

& $apksigner sign --ks "$ks" --ks-pass "pass:$storePass" --ks-key-alias "$keyAlias" --key-pass "pass:$keyPass" --v1-signing-enabled true --v2-signing-enabled true --v3-signing-enabled true "$apk"

if ($LASTEXITCODE -ne 0) { Write-Host "[SIGN] ERROR firmando"; exit 1 }

& $apksigner verify "$apk" | Out-Null
if ($LASTEXITCODE -eq 0) { Write-Host "[SIGN] APK firmado y verificado OK" } else { Write-Host "[SIGN] verify fallo" }
exit 0
