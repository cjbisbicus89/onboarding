# Checkout App

Aplicación móvil de checkout con pagos con tarjeta de crédito, construida con **React Native** y **NestJS**. Incluye backend dockerizado, base de datos PostgreSQL, documentación Swagger y generación de APK.

## Tecnologías

- **Mobile:** React Native 0.76, Redux Toolkit, TypeScript
- **Backend:** NestJS 10, TypeORM, PostgreSQL
- **Infraestructura:** Docker, Docker Compose
- **Pasarela de pagos:** Sandbox (ambiente de pruebas)
- **Testing:** Jest

## Requisitos previos

- [Node.js 18+](https://nodejs.org/en/download)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (incluye Docker y Docker Compose)
- [Android Studio](https://developer.android.com/studio) (incluye Android SDK y emulador; recomendado para crear el AVD)
- [Git](https://git-scm.com/downloads)
- [JDK 17 de Temurin (Adoptium)](https://adoptium.net/es/temurin/releases/?version=17) (requerido por Android y Gradle)
- [Android SDK command line tools](https://developer.android.com/studio#command-tools) (alternativa si no instalas Android Studio completo)

## Cómo levantar todo el proyecto

1. Instala las dependencias de los proyectos:

```bash
npm install
cd backend && npm install
cd ../mobile && npm install
```

2. Ejecuta el comando único que levanta la base de datos, el backend, abre Swagger e intenta instalar la app en un dispositivo Android:

```bash
npm run dev:all
```

Este comando hace lo siguiente:

1. **Libera los puertos 3000, 5432, 8081 y 8082** si estaban ocupados por procesos locales anteriores.
2. Levanta PostgreSQL, el backend y pgweb en Docker.
3. Espera a que el backend responda correctamente (`/health`).
4. Abre Swagger y pgweb en el navegador.
5. Si detecta un celular o emulador Android, configura los puentes ADB e instala/arranca la app.
6. Si **no detecta** ningún dispositivo, **construye la APK automaticamente** con `mobile_builder` y espera unos segundos por si conectas un dispositivo para instalarla.

### Requisitos previos para el comando único

- **Docker Desktop debe estar abierto y corriendo** en tu equipo antes de ejecutar `npm run dev:all`.
- El backend y la base de datos PostgreSQL se ejecutan dentro de contenedores Docker.
- El script intenta cerrar automáticamente procesos que ocupen los puertos `3000`, `5432`, `8081` y `8082` para evitar conflictos. Si no puede cerrarlos, se mostrará un aviso y podrás liberarlos manualmente.

### Tiempo estimado

Aproximadamente **20 segundos** para que el backend y la DB estén listos. La instalación en Android puede tomar unos minutos adicionales.

## Cómo usar el emulador

1. Abre Android Studio.
2. Ve a **Device Manager** y arranca tu emulador (por ejemplo, `Pixel_6_API_34`).
3. Espera que el emulador esté completamente encendido.
4. Ejecuta:

```bash
npm run dev:all
```

La app se instalará y abrirá automáticamente en el emulador.

## Cómo usar un celular físico

1. Conecta tu celular por USB.
2. En tu celular, activa:
   - **Opciones de desarrollador** (tocar 7 veces "Número de compilación").
   - **Depuración USB**.
   - Modo USB en **"Transferencia de archivos"** o **"Android Auto"**.
3. Acepta el mensaje **"¿Permitir depuración USB?"** en tu celular.
4. Ejecuta:

```bash
npm run dev:all
```

> Si tu celular no es detectado por ADB, `npm run dev:all` generará la APK en `mobile/build/app-mobile.apk` para que puedas instalarla. También puedes generarla manualmente con:

## Cómo generar la APK

```bash
docker-compose up mobile_builder
```

`npm run dev:all` también genera la APK automaticamente si no detecta un dispositivo Android. El APK se deja en:

```text
mobile/build/app-mobile.apk
```

## Cómo ejecutar pruebas

### Backend

```bash
npm run test:backend
```

### Mobile

```bash
npm run test:mobile
```

### Todas las pruebas

```bash
npm run test:all
```

### Cobertura de pruebas

El proyecto mantiene cobertura de pruebas unitarias superior al 80% en ambos proyectos:

| Proyecto | Stmts | Branch | Funcs | Lines |
|---|---|---|---|---|
| Backend | 97.8% | 93.52% | 91.34% | 98.1% |
| Mobile | 95.24% | 86.82% | 92.94% | 95.35% |

*Resultados obtenidos con `npm run test:all`.*

## Documentación de la API

Una vez el backend esté arriba, accede a Swagger en:

```text
http://localhost:3000/api-docs
```

## Base de datos

`npm run dev:all` levanta automáticamente **pgweb** (interfaz web para PostgreSQL) en:

```text
http://localhost:8082
```

Ahí puedes explorar las tablas y registros sin escribir credenciales. Si prefieres conectarte manualmente, los datos son:

| Campo | Valor |
|---|---|
| Host | `localhost` |
| Puerto | `5432` |
| Usuario | `postgres` |
| Contraseña | `postgres_secure_password_2026` |
| Base de datos | `ecommerce_db` |

## Tarjetas de prueba para pagos

Usa estas tarjetas en el ambiente Sandbox:

| Campo | Valor |
|---|---|
| Número | `4012888888881881` (Visa, válida por Luhn) |
| CVV | `123` |
| Expiración | `12/30` |
| Titular | `Test User` |

## Estructura del proyecto

```text
.
├── backend/          # API NestJS
├── mobile/           # App React Native
├── shared/           # DTOs y utilidades compartidas
├── docker-compose.yml
├── run-all.ps1
└── README.md
```

## Notas importantes

- El proyecto usa **ambiente Sandbox** para pagos. No se procesa dinero real.
- La app mobile está configurada para conectarse al backend usando la IP local de la máquina.
- Asegúrate de que tu celular o emulador estén en la **misma red Wi-Fi** que tu PC si usas la APK o una IP local.

## Licencia

Proyecto privado para fines de evaluación técnica.
