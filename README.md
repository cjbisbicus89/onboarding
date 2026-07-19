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

Con un solo comando se levanta la base de datos, el backend, se abre Swagger, se configuran los puentes ADB y se intenta instalar/arrancar la app en un dispositivo Android:

```bash
npm run dev:all
```

### Requisitos antes de ejecutarlo

- **Docker Desktop** debe estar abierto y corriendo.
- Abre el emulador de Android Studio o conecta un celular físico *antes* de ejecutar el comando (ver secciones más abajo).
- El backend y la base de datos PostgreSQL corren dentro de contenedores Docker.
- El script intenta liberar los puertos `3000`, `5432`, `8081` y `8082` si estaban ocupados. Si no puede cerrarlos, avisará para que los liberes manualmente.

### Qué hace `npm run dev:all`

1. Libera puertos si es necesario.
2. Levanta PostgreSQL, el backend y pgweb en Docker.
3. Espera a que el backend responda correctamente (`/health`).
4. Abre Swagger y pgweb en el navegador.
5. Detecta si hay un emulador o celular Android conectado por ADB:
   - Si hay uno, configura `adb reverse` e instala/arranca la app.
   - Si no hay ninguno, construye el APK automáticamente en `mobile/build/app-mobile.apk`.

### Tiempo estimado

- Backend y base de datos: ~20 segundos.
- Instalación en Android/emulador: 1 a 5 minutos adicionales.

## Cómo usar el emulador

El emulador debe estar encendido *antes* de ejecutar `npm run dev:all`:

1. Abre Android Studio.
2. Ve a **Device Manager** y arranca tu emulador (por ejemplo, `Pixel_6_API_34`).
3. Espera a que termine de cargar por completo.
4. Ejecuta desde la raíz del proyecto:

```bash
npm run dev:all
```

El script detectará el emulador por ADB, configurará los puentes de red (`adb reverse`) e instalará/arrancará la app automáticamente.

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

> **Nota:** Si es la primera vez que vas a correr pruebas, instala las dependencias locales de cada subproyecto:
>
> ```bash
> cd backend && npm install
> cd ../mobile && npm install
> cd ..
> ```

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

## Video de la aplicación

En el siguiente enlace puedes ver un video de cómo funciona la aplicación:

[Video del proyecto - Google Drive](https://drive.google.com/drive/folders/1L-Lm6uGODshEv7GTfISujFbY0asrCIjo)

## Licencia

Proyecto privado para fines de evaluación técnica.
