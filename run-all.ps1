# run-all.ps1
Write-Host 'Iniciando entorno de desarrollo completo (DB + Backend + Mobile)...' -ForegroundColor Cyan

# 0. Limpieza previa
Write-Host 'Limpiando contenedores previos...'
docker-compose down

# 1. Levantar DB y Backend
Write-Host 'Levantando contenedores (DB + Backend)...'
docker-compose up -d postgres_db api_backend

# 2. Polling al healthcheck de backend
$healthUrl = 'http://localhost:3000/health'
$maxRetries = 30
$retryCount = 0
$backendReady = $false

Write-Host 'Esperando a que el backend este listo...' -NoNewline
while ($retryCount -lt $maxRetries) {
    try {
        $response = Invoke-WebRequest -Uri $healthUrl -Method Get -UseBasicParsing -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    } catch {
        # Backend no listo aun
    }
    $retryCount++
    Start-Sleep -Seconds 2
    Write-Host '.' -NoNewline
}

if (-not $backendReady) {
    Write-Host 'Error: El backend no respondio en 60 segundos.' -ForegroundColor Red
    docker-compose logs api_backend
    exit 1
}

Write-Host 'Backend listo!' -ForegroundColor Green

# 3. Abrir Swagger automaticamente
$swaggerUrl = 'http://localhost:3000/api-docs'
Write-Host 'Abriendo Swagger en ' $swaggerUrl '...'
Start-Process $swaggerUrl

# 4. Configurar tuneles ADB y Red
Write-Host 'Configurando comunicaciones con dispositivos Android...' -ForegroundColor Cyan
$adbPaths = @(
    '$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe',
    'C:\Android\Sdk\platform-tools\adb.exe',
    'C:\Program Files (x86)\Android\android-sdk\platform-tools\adb.exe'
)

$adbExe = ''
foreach ($path in $adbPaths) {
    $expandedPath = $ExecutionContext.InvokeCommand.ExpandString($path)
    if (Test-Path $expandedPath) {
        $adbExe = $expandedPath
        break
    }
}

$targetDeviceId = ''
$deviceFound = $false
$emulatorDeviceId = ''

if ($adbExe) {
    Write-Host 'Refrescando servidor ADB...' -ForegroundColor Gray
    & $adbExe kill-server
    & $adbExe start-server
    Start-Sleep -Seconds 2

    $devices = & $adbExe devices | Select-String -Pattern '\t(device|offline)$'
    foreach ($dev in $devices) {
        $id = $dev.ToString().Split("`t")[0]
        $status = $dev.ToString().Split("`t")[1]

        if ($status -eq 'offline') {
            Write-Host 'Dispositivo ' $id ' esta OFFLINE. Intenta reconectarlo o reiniciar el emulador.' -ForegroundColor Red
            continue
        }

        Write-Host 'Configurando puente (adb reverse) en: ' $id -ForegroundColor Green
        & $adbExe -s $id reverse tcp:3000 tcp:3000
        & $adbExe -s $id reverse tcp:8081 tcp:8081

        if (-not $id.Contains('emulator') -and -not $deviceFound) {
            $deviceFound = $true
            $targetDeviceId = $id
        }

        if ($id.Contains('emulator') -and -not $emulatorDeviceId) {
            $emulatorDeviceId = $id
        }
    }
}

# Si no se encontro fisico pero hay un emulador online, usarlo
if (-not $deviceFound -and $emulatorDeviceId) {
    $deviceFound = $true
    $targetDeviceId = $emulatorDeviceId
}

# 5. Lanzar App
Write-Host 'Lanzando App Mobile...' -ForegroundColor Cyan
if ($deviceFound) {
    Write-Host 'Priorizando celular fisico (' $targetDeviceId ')...' -ForegroundColor Yellow
    $cmd = 'cd mobile; npx react-native run-android --deviceId ' + $targetDeviceId
    Start-Process powershell -ArgumentList '-NoExit', '-Command', $cmd
} else {
    Write-Host 'NO SE ENCONTRO NINGUN DISPOSITIVO ANDROID EN LINEA.' -ForegroundColor Red
    Write-Host 'El comando npm run android fallara si no hay un dispositivo.' -ForegroundColor Red
    Write-Host 'Si usas celular fisico:' -ForegroundColor Yellow
    Write-Host '  1. Cambia el modo USB a Transferencia de archivos o Android Auto.' -ForegroundColor Yellow
    Write-Host '  2. Acepta el mensaje de Permitir depuracion USB en tu celular.' -ForegroundColor Yellow
    Write-Host '  3. Ve a Ajustes - Opciones de desarrollador - Activa Depuracion USB.' -ForegroundColor Yellow
    Write-Host 'Si usas emulador:' -ForegroundColor Yellow
    Write-Host '  1. Cierra el emulador completamente.' -ForegroundColor Yellow
    Write-Host '  2. Abre Android Studio - Device Manager y arranca el emulador limpio.' -ForegroundColor Yellow
    Write-Host '  3. Ejecuta: C:\Android\Sdk\platform-tools\adb.exe devices' -ForegroundColor Yellow
    Write-Host '     hasta que diga device (no offline).' -ForegroundColor Yellow
}

Write-Host '--------------------------------------------------------' -ForegroundColor Cyan
Write-Host 'Entorno iniciado exitosamente.' -ForegroundColor Green
Write-Host '- DB y Backend: Corriendo en Docker' -ForegroundColor Green
Write-Host '- Swagger: Abierto en el navegador' -ForegroundColor Green
Write-Host '- Mobile: Bundler iniciado en ventana aparte' -ForegroundColor Green
Write-Host '--------------------------------------------------------' -ForegroundColor Cyan