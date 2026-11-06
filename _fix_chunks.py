import io
# 1) vite.config: separar vendor
p = r"C:\Users\user\kryptos\server\web-app\vite.config.ts"
s = io.open(p, encoding="utf-8", newline="").read()
if "manualChunks" not in s:
    s = s.replace("""  build: {
    outDir: '../web-dist',
    emptyOutDir: true,
  },""", """  build: {
    outDir: '../web-dist',
    emptyOutDir: true,
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          icons: ['lucide-react'],
        },
      },
    },
  },""")
    io.open(p, "w", encoding="utf-8", newline="").write(s)
    print("vite OK")
else:
    print("vite ya tiene manualChunks")

# 2) App.tsx: lazy loading de las paginas pesadas
p2 = r"C:\Users\user\kryptos\server\web-app\src\App.tsx"
a = io.open(p2, encoding="utf-8", newline="").read()
if "lazy(() =>" not in a:
    start = a.index("import LoginPage from './pages/LoginPage';")
    end = a.index("import BackgroundAnimation")
    lazy_block = """const LoginPage = lazy(() => import('./pages/LoginPage'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const DeviceControl = lazy(() => import('./pages/DeviceControl'));
const APKBuilder = lazy(() => import('./pages/APKBuilder'));
const APKBuilderSelect = lazy(() => import('./pages/APKBuilderSelect'));
const APKBuilderVisual = lazy(() => import('./pages/APKBuilderVisual'));
const APKStudio = lazy(() => import('./pages/APKStudio'));
const APKBypassIframePage = lazy(() => import('./pages/APKBypassIframePage'));
const AdminLogin = lazy(() => import('./pages/AdminLogin'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const WinBuilder = lazy(() => import('./pages/WinBuilder'));
const WinDeviceControl = lazy(() => import('./pages/WinDeviceControl'));
const LiveOverview = lazy(() => import('./pages/LiveOverview'));
"""
    a = a[:start] + lazy_block + a[end:]
    a = a.replace("import { useState, useEffect } from 'react';",
                  "import { useState, useEffect, lazy, Suspense } from 'react';")
    a = a.replace("      <Routes>", "      <Suspense fallback={<div className=\"min-h-screen bg-[#290903] flex items-center justify-center text-red-400 font-bold\">Cargando...</div>}>\n      <Routes>")
    a = a.replace("      </Routes>", "      </Routes>\n      </Suspense>")
    io.open(p2, "w", encoding="utf-8", newline="").write(a)
    print("App.tsx OK")
else:
    print("App.tsx ya tiene lazy")