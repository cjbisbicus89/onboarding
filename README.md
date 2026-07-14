# Checkout App

Aplicación móvil de checkout con pagos con tarjeta de crédito, construida con **React Native** y **NestJS**. Incluye backend dockerizado, base de datos PostgreSQL, documentación Swagger y generación de APK.

## Tecnologías

- **Mobile:** React Native 0.76, Redux Toolkit, TypeScript
- **Backend:** NestJS 10, TypeORM, PostgreSQL
- **Infraestructura:** Docker, Docker Compose
- **Pasarela de pagos:** Sandbox (ambiente de pruebas)
- **Testing:** Jest

## Requisitos previos

- Node.js 18+
- Docker y Docker Compose
- Android SDK (si vas a usar emulador o celular físico)
- Git

## Cómo levantar todo el proyecto

El proyecto incluye un **comando único** que levanta la base de datos, el backend, abre Swagger e intenta instalar la app en un dispositivo Android:

```bash
npm run dev:all
```

Este comando hace lo siguiente:

1. Levanta PostgreSQL y el backend en Docker.
2. Espera a que el backend responda correctamente (`/health`).
3. Abre Swagger en el navegador: `http://localhost:3000/api-docs`.
4. Configura los puentes de red ADB para dispositivos Android.
5. Instala y lanza la app en el emulador o celular físico disponible.

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

> Si tu celular no es detectado por ADB, también puedes instalar la APK manualmente copiando el archivo `mobile/build/app-mobile.apk` al celular.

## Cómo generar la APK

```bash
docker-compose up mobile_builder
```

El APK se generará en:

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

## Documentación de la API

Una vez el backend esté arriba, accede a Swagger en:

```text
http://localhost:3000/api-docs
```

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
