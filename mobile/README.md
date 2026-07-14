# Cobertura de Pruebas Mobile

## Cierre de tarea — pruebas mobile

Cobertura final (una sola corrida, Paso 2.1):
statements 95.39% | branches 86.69% | functions 92.9% | lines 95.51%

Umbral 80% global: SUPERADO
CheckoutScreen individual (78.12% ramas): ACEPTADO COMO ESTÁ — no bloqueante

Validación de mutación §8.2:
- card.validator.spec.ts: FALLÓ correctamente
- cart.slice.spec.ts: FALLÓ correctamente
- checkout.screen.test.tsx: FALLÓ correctamente

Backdrop drag-to-close (Paso 1): REVERTIDO - pendiente, no bloqueante

Tests inestables detectados: ninguno

README.md actualizado: SÍ

ESTADO: CERRADO

## Matriz de cobertura final

```
All files                             |   95.39 |    86.69 |    92.9 |   95.51 |
 application/state/slices             |     100 |      100 |     100 |     100 |
  catalogSlice.ts                     |     100 |      100 |     100 |     100 |
  checkoutSlice.ts                    |     100 |      100 |     100 |     100 |
  customerSlice.ts                    |     100 |      100 |     100 |     100 |
 components/shared                    |     100 |    85.71 |     100 |     100 |
  error-boundary.component.styles.ts  |     100 |      100 |     100 |     100 |
  error-boundary.component.tsx        |     100 |      100 |     100 |     100 |
  toast.component.styles.ts           |     100 |      100 |     100 |     100 |
  toast.component.tsx                 |     100 |    66.66 |     100 |     100 | 55
 components/ui                        |   84.61 |    83.33 |   69.23 |   83.33 |
  backdrop.component.styles.ts        |     100 |      100 |     100 |     100 |
  backdrop.component.tsx              |      76 |     62.5 |      60 |      75 | 72-80,99
  card-brand-logo.component.styles.ts |     100 |      100 |     100 |     100 |
  card-brand-logo.component.tsx       |     100 |      100 |     100 |     100 |
 infrastructure/api                   |     100 |      100 |     100 |     100 |
  config.ts                           |     100 |      100 |     100 |     100 |
 navigation                           |     100 |      100 |     100 |     100 |
  navigator.styles.ts                 |     100 |      100 |     100 |     100 |
  root-navigator.tsx                  |     100 |      100 |     100 |     100 |
 screens/checkout                     |   85.88 |    78.12 |    87.5 |   85.18 |
  checkout.screen.tsx                 |   85.54 |    78.12 |    87.5 |   84.81 | 47,72-73,97-98,102-103,107-108,240-248
  checkout.styles.ts                  |     100 |      100 |     100 |     100 |
 screens/checkout/components          |   98.87 |     90.9 |     100 |   98.83 |
  card-form.component.styles.ts       |     100 |      100 |     100 |     100 |
  card-form.component.tsx             |     100 |    88.46 |     100 |     100 | 55-67,72
  customer-form.component.styles.ts   |     100 |      100 |     100 |     100 |
  customer-form.component.tsx         |   95.45 |    91.66 |     100 |   95.45 | 38
  payment-summary.component.styles.ts |     100 |      100 |     100 |     100 |
  payment-summary.component.tsx       |     100 |      100 |     100 |     100 |
 screens/home                         |   95.45 |      100 |      90 |      95 |
  home.screen.tsx                     |   95.23 |      100 |      90 |   94.73 | 42
  home.styles.ts                      |     100 |      100 |     100 |     100 |
 screens/product-detail               |   87.09 |    85.71 |   81.81 |   88.88 |
  product-detail.screen.tsx           |   85.18 |    85.71 |      80 |    87.5 | 40,61-62
  product-detail.styles.ts            |     100 |      100 |     100 |     100 |
 screens/result                       |     100 |     90.9 |     100 |     100 |
  result.screen.tsx                   |     100 |     90.9 |     100 |     100 | 91
  result.styles.ts                    |     100 |      100 |     100 |     100 |
 screens/splash                       |   97.22 |    82.14 |    92.3 |   98.55 |
  splash.screen.tsx                   |   96.72 |    82.14 |   91.66 |   98.27 | 97
  splash.styles.ts                    |     100 |      100 |     100 |     100 |
 services/api                         |     100 |    72.72 |     100 |     100 |
  checkout-client.service.ts          |     100 |    72.72 |     100 |     100 | 87-88,112
 store                                |     100 |      100 |     100 |     100 |
  hooks.ts                            |     100 |      100 |     100 |     100 |
 store/slices                         |     100 |    94.11 |     100 |     100 |
  cart.slice.ts                       |     100 |     90.9 |     100 |     100 | 55
  transaction.slice.ts                |     100 |      100 |     100 |     100 |
 theme                                |     100 |      100 |     100 |     100 |
  animation.ts                        |     100 |      100 |     100 |     100 |
  colors.ts                           |     100 |      100 |     100 |     100 |
  radius.ts                           |     100 |      100 |     100 |     100 |
  responsive.ts                       |     100 |      100 |     100 |     100 |
  shadows.ts                          |     100 |      100 |     100 |     100 |
  sizes.ts                            |     100 |      100 |     100 |     100 |
  spacing.ts                          |     100 |      100 |     100 |     100 |
  typography.ts                       |     100 |      100 |     100 |     100 |
 types                                |       0 |        0 |       0 |       0 |
  navigation.types.ts                 |       0 |        0 |       0 |       0 |
 validators                           |     100 |      100 |     100 |     100 |
  card.validator.ts                   |     100 |      100 |     100 |     100 |
```

## Resultado final de tests

```
Test Suites: 24 passed, 24 total
Tests:       140 passed, 140 total
Snapshots:   0 total
Time:        4.778 s
```

## Comandos útiles

```bash
npm run test              # Ejecuta toda la suite
npm run test -- --coverage  # Ejecuta con cobertura
npm run test:cov          # Alias de cobertura
npm run lint              # Ejecuta ESLint
```
