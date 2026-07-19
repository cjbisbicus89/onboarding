# run-all.ps1
Write-Host 'Iniciando entorno de desarrollo completo (DB + Backend + Mobile)...' -ForegroundColor Cyan

# 0. Liberar puertos clave si estan ocupados por procesos locales
function Stop-ProcessUsingPort {
    param (
        [int]$Port
    )

    try {
        $connections = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        if ($connections) {
            $processIds = $connections | Select-Object -Property OwningProcess -Unique | ForEach-Object { $_.OwningProcess }
            foreach ($pid in $processIds) {
                try {
                    $process = Get-Process -Id $pid -ErrorAction SilentlyContinue
                    if ($process) {
                        Write-Host "Puerto $Port ocupado por processo: $($process.ProcessName) (PID $pid). Cerrando..." -ForegroundColor Yellow
                        $process.CloseMainWindow() | Out-Null
                        Start-Sleep -Milliseconds 500
                        if (-not $process.HasExited) {
                            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        }
                    }
                } catch {
                    Write-Host "No se pudo cerrar el proceso en puerto $Port (PID $pid): $_." -ForegroundColor Red
                }
            }
        }
    } catch {
        Write-Host "No se pudo verificar el puerto $Port (requiere permisos o no disponible)." -ForegroundColor Yellow
    }
}

$requiredPorts = @(3000, 5432, 8081, 8082)
Write-Host 'Verificando que los puertos requeridos esten disponibles...'
foreach ($port in $requiredPorts) {
    Stop-ProcessUsingPort -Port $port
}

# 0. Verificar dependencias (requerido para el primer arranque tras clonar)
function Check-NodeModules {
    param ([string]$Path)
    if (-not (Test-Path "$Path/node_modules")) {
        Write-Host "Instalando dependencias en $Path (solo la primera vez)..." -ForegroundColor Yellow
        # Ejecutamos npm install directamente para que el usuario vea el progreso y posibles errores
        Push-Location $Path
        npm install
        $exitCode = $LASTEXITCODE
        Pop-Location
        if ($exitCode -ne 0) {
            Write-Host "Error al instalar dependencias en $Path. Por favor, revisa los errores de npm arriba." -ForegroundColor Red
            exit 1
        }
    }
}

Check-NodeModules -Path '.'
Check-NodeModules -Path 'backend'
Check-NodeModules -Path 'mobile'

# 0. Limpieza previa
Write-Host 'Limpiando contenedores previos...'
docker-compose down

# 1. Levantar DB, Backend y pgweb
Write-Host 'Levantando contenedores (DB + Backend + pgweb)...'
docker-compose up -d postgres_db api_backend pgweb

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

# 3. Abrir Swagger y pgweb automaticamente
$swaggerUrl = 'http://localhost:3000/api-docs'
Write-Host 'Abriendo Swagger en ' $swaggerUrl '...'
Start-Process $swaggerUrl

$pgwebUrl = 'http://localhost:8082'
Write-Host 'Abriendo pgweb (base de datos) en ' $pgwebUrl '...'
Start-Process $pgwebUrl

# 4. Configurar tuneles ADB y Red
Write-Host 'Configurando comunicaciones con dispositivos Android...' -ForegroundColor Cyan

# Buscar adb en PATH, ANDROID_HOME y rutas comunes
$androidHome = $env:ANDROID_HOME
if (-not $androidHome) {
    $androidHome = $env:ANDROID_SDK_ROOT
}

$adbExe = $null
$adbInPath = Get-Command adb -ErrorAction SilentlyContinue
if ($adbInPath) {
    $adbExe = $adbInPath.Source
} else {
    $adbPaths = @()
    if ($androidHome) {
        $adbPaths += Join-Path $androidHome 'platform-tools\adb.exe'
    }
    $adbPaths += @(
        '$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe',
        'C:\Android\Sdk\platform-tools\adb.exe',
        'C:\Program Files (x86)\Android\android-sdk\platform-tools\adb.exe'
    )
    foreach ($path in $adbPaths) {
        $expandedPath = $ExecutionContext.InvokeCommand.ExpandString($path)
        if (Test-Path $expandedPath) {
            $adbExe = $expandedPath
            break
        }
    }
}

$devices = @()
if ($adbExe) {
    Write-Host "ADB encontrado en: $adbExe" -ForegroundColor Gray
    Write-Host 'Refrescando servidor ADB...' -ForegroundColor Gray
    & $adbExe start-server
    Start-Sleep -Seconds 2

    $rawDevices = & $adbExe devices | Select-String -Pattern '\t(device|offline|unauthorized)$'
    foreach ($dev in $rawDevices) {
        $parts = $dev.ToString().Split("`t")
        $id = $parts[0]
        $status = $parts[1]

        if ($status -eq 'offline') {
            Write-Host "Dispositivo $id esta OFFLINE. Intenta reconectarlo o reiniciar el emulador." -ForegroundColor Red
            continue
        }

        if ($status -eq 'unauthorized') {
            Write-Host "Dispositivo $id no autorizado. Acepta el mensaje de depuracion USB en el celular." -ForegroundColor Yellow
            continue
        }

        $type = if ($id.Contains('emulator')) { 'Emulador' } else { 'Fisico' }
        $devices += [PSCustomObject]@{ Id = $id; Type = $type }
    }
}

# Fallback: si no hay dispositivo, intentar iniciar un emulador
if ($adbExe -and $devices.Count -eq 0) {
    $emulatorExe = $null
    $emulatorPaths = @()
    if ($androidHome) {
        $emulatorPaths += Join-Path $androidHome 'emulator\emulator.exe'
    }
    $emulatorPaths += @(
        '$env:LOCALAPPDATA\Android\Sdk\emulator\emulator.exe',
        'C:\Android\Sdk\emulator\emulator.exe',
        'C:\Program Files (x86)\Android\android-sdk\emulator\emulator.exe'
    )
    foreach ($path in $emulatorPaths) {
        $expandedPath = $ExecutionContext.InvokeCommand.ExpandString($path)
        if (Test-Path $expandedPath) {
            $emulatorExe = $expandedPath
            break
        }
    }

    if ($emulatorExe) {
        Write-Host 'No se encontro dispositivo. Buscando emuladores disponibles...' -ForegroundColor Yellow
        $avds = @(& $emulatorExe -list-avds 2>$null | Where-Object { $_.Trim() -ne '' })
        if ($avds) {
            $selectedAvd = $null
            if ($avds.Count -eq 1) {
                $selectedAvd = $avds[0]
                Write-Host "Iniciando unico emulador disponible: $selectedAvd" -ForegroundColor Yellow
            } else {
                Write-Host 'Se encontraron multiples emuladores:' -ForegroundColor Cyan
                for ($i = 0; $i -lt $avds.Count; $i++) {
                    Write-Host "  [$i] $($avds[$i])" -ForegroundColor White
                }
                do {
                    $selection = Read-Host 'Selecciona el numero del emulador a iniciar'
                } while ($selection -notmatch '^\d+$' -or [int]$selection -lt 0 -or [int]$selection -ge $avds.Count)
                $selectedAvd = $avds[[int]$selection]
            }

            $existingEmulator = Get-Process | Where-Object { $_.ProcessName -like '*emulator*' -or $_.ProcessName -like '*qemu-system-x86_64*' } | Select-Object -First 1
            if ($existingEmulator) {
                Write-Host "Emulador $selectedAvd ya en ejecucion. Esperando a que ADB lo reconozca..." -ForegroundColor Yellow
            } else {
                Write-Host "Iniciando emulador $selectedAvd..." -ForegroundColor Cyan
                & $adbExe kill-server
                & $adbExe start-server
                Start-Sleep -Seconds 2
                Start-Process $emulatorExe -ArgumentList '-avd', $selectedAvd, '-no-snapshot' -WindowStyle Normal
            }

            Write-Host 'Esperando a que el emulador este listo' -NoNewline
            $maxRetries = 60
            $retryCount = 0
            while ($retryCount -lt $maxRetries -and $devices.Count -eq 0) {
                Start-Sleep -Seconds 2
                $rawDevices = & $adbExe devices | Select-String -Pattern '\t(device|offline|unauthorized)$'
                $devices = @()
                foreach ($dev in $rawDevices) {
                    $parts = $dev.ToString().Split("`t")
                    $id = $parts[0]
                    $status = $parts[1]
                    if ($status -eq 'device') {
                        $type = if ($id.Contains('emulator')) { 'Emulador' } else { 'Fisico' }
                        $devices += [PSCustomObject]@{ Id = $id; Type = $type }
                    }
                }
                Write-Host '.' -NoNewline
                $retryCount++
            }
            Write-Host ''
            if ($devices.Count -gt 0) {
                Write-Host 'Emulador listo!' -ForegroundColor Green
            } else {
                Write-Host 'El emulador no aparecio en adb devices. Intenta iniciarlo manualmente.' -ForegroundColor Red
            }
        } else {
            Write-Host 'No se encontro ningun AVD configurado. Crea uno en Android Studio > Device Manager.' -ForegroundColor Yellow
        }
    } else {
        Write-Host 'No se encontro el ejecutable emulator.exe.' -ForegroundColor Yellow
    }
}

$targetDeviceId = $null
if ($devices.Count -eq 0) {
    Write-Host 'NO SE ENCONTRO NINGUN DISPOSITIVO ANDROID EN LINEA.' -ForegroundColor Red
    Write-Host 'Si usas celular fisico:' -ForegroundColor Yellow
    Write-Host '  1. Cambia el modo USB a Transferencia de archivos o Android Auto.' -ForegroundColor Yellow
    Write-Host '  2. Acepta el mensaje de Permitir depuracion USB en tu celular.' -ForegroundColor Yellow
    Write-Host '  3. Ve a Ajustes - Opciones de desarrollador - Activa Depuracion USB.' -ForegroundColor Yellow
    Write-Host 'Si usas emulador:' -ForegroundColor Yellow
    Write-Host '  1. Crea un AVD en Android Studio > Device Manager.' -ForegroundColor Yellow
    Write-Host '  2. Abre el emulador limpio.' -ForegroundColor Yellow
    Write-Host '  3. Ejecuta: adb devices' -ForegroundColor Yellow
    Write-Host '     hasta que diga device (no offline).' -ForegroundColor Yellow
    Write-Host 'Si prefieres no usar dispositivo, genera la APK manualmente:' -ForegroundColor Yellow
    Write-Host '  docker-compose up mobile_builder' -ForegroundColor Yellow
} elseif ($devices.Count -eq 1) {
    $targetDeviceId = $devices[0].Id
    Write-Host "Dispositivo seleccionado automaticamente: $targetDeviceId ($($devices[0].Type))" -ForegroundColor Green
} else {
    Write-Host 'Se encontraron multiples dispositivos:' -ForegroundColor Cyan
    for ($i = 0; $i -lt $devices.Count; $i++) {
        Write-Host "  [$i] $($devices[$i].Id) ($($devices[$i].Type))" -ForegroundColor White
    }
    do {
        $selection = Read-Host 'Selecciona el numero del dispositivo a usar'
    } while ($selection -notmatch '^\d+$' -or [int]$selection -lt 0 -or [int]$selection -ge $devices.Count)
    $targetDeviceId = $devices[[int]$selection].Id
    Write-Host "Dispositivo seleccionado: $targetDeviceId" -ForegroundColor Green
}

if ($targetDeviceId) {
    Write-Host "Configurando puente (adb reverse) en: $targetDeviceId" -ForegroundColor Green
    & $adbExe -s $targetDeviceId reverse tcp:3000 tcp:3000
    & $adbExe -s $targetDeviceId reverse tcp:8081 tcp:8081
}

# 5. Lanzar App
$mobileLaunched = $false
$apkBuilt = $false
$apkPath = 'mobile/build/app-mobile.apk'

if ($targetDeviceId) {
    Write-Host 'Lanzando App Mobile...' -ForegroundColor Cyan
    Write-Host "Usando dispositivo: $targetDeviceId" -ForegroundColor Yellow
    $cmd = 'cd mobile; npx react-native run-android --deviceId ' + $targetDeviceId
    Start-Process powershell -ArgumentList '-NoExit', '-Command', $cmd
    $mobileLaunched = $true
} else {
    Write-Host 'No se detecto dispositivo Android. Construyendo APK automaticamente...' -ForegroundColor Cyan
    Write-Host 'Puedes conectar un dispositivo durante el build para que se instale automaticamente.' -ForegroundColor Yellow
    docker-compose up mobile_builder

    if (Test-Path $apkPath) {
        $apkBuilt = $true
        Write-Host "APK generada correctamente: $apkPath" -ForegroundColor Green

        if ($adbExe) {
            Write-Host 'Esperando unos segundos por si conectas un dispositivo...' -NoNewline
            $maxWait = 15
            $waitCount = 0
            $apkDeviceId = $null
            while ($waitCount -lt $maxWait -and -not $apkDeviceId) {
                Start-Sleep -Seconds 2
                $rawDevices = & $adbExe devices | Select-String -Pattern '\tdevice$'
                if ($rawDevices) {
                    $apkDeviceId = $rawDevices[0].ToString().Split("`t")[0]
                }
                Write-Host '.' -NoNewline
                $waitCount++
            }
            Write-Host ''

            if ($apkDeviceId) {
                Write-Host "Dispositivo detectado ($apkDeviceId). Instalando APK..." -ForegroundColor Green
                & $adbExe -s $apkDeviceId install -r $apkPath
                if ($LASTEXITCODE -eq 0) {
                    Write-Host 'APK instalada. Intentando abrir la app...' -ForegroundColor Green
                    & $adbExe -s $apkDeviceId shell am start -n com.stableapp/.MainActivity
                    $mobileLaunched = $true
                } else {
                    Write-Host 'No se pudo instalar la APK. Intenta instalarla manualmente con:' -ForegroundColor Red
                    Write-Host "  adb install $apkPath" -ForegroundColor Yellow
                }
            } else {
                Write-Host 'No se detecto dispositivo para instalar la APK. Conecta uno y usa:' -ForegroundColor Yellow
                Write-Host "  adb install $apkPath" -ForegroundColor Yellow
            }
        }
    } else {
        Write-Host 'No se pudo generar la APK. Revisa los logs de mobile_builder.' -ForegroundColor Red
    }
}

Write-Host '--------------------------------------------------------' -ForegroundColor Cyan
Write-Host 'Entorno iniciado exitosamente.' -ForegroundColor Green
Write-Host '- DB y Backend: Corriendo en Docker' -ForegroundColor Green
Write-Host '- Swagger: Abierto en el navegador' -ForegroundColor Green
Write-Host '- pgweb: Base de datos en http://localhost:8082' -ForegroundColor Green
if ($mobileLaunched) {
    Write-Host '- Mobile: App lanzada correctamente' -ForegroundColor Green
} elseif ($apkBuilt) {
    Write-Host "- Mobile: APK generada en $apkPath. Conecta un dispositivo para instalarla automaticamente." -ForegroundColor Yellow
} else {
    Write-Host '- Mobile: NO se pudo lanzar ni generar APK. Revisa la deteccion de dispositivos Android.' -ForegroundColor Red
}
Write-Host '--------------------------------------------------------' -ForegroundColor Cyan