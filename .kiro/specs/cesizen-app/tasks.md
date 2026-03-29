# Plan de Implementación: CESIZen

## Visión General

Implementación incremental de la plataforma CESIZen con Next.js 16.2.1 (App Router), PostgreSQL/Drizzle ORM, Tailwind CSS v4, Shadcn UI y NextAuth.js. Se construyen 3 módulos (Comptes utilisateurs, Informations, Tracker d'émotions) más aspectos transversales (responsive, RGPD, accesibilidad, interfaz en francés).

## Tareas

- [x] 1. Configuración del proyecto y dependencias base
  - [x] 1.1 Instalar dependencias del proyecto
    - Instalar Drizzle ORM (`drizzle-orm`, `drizzle-kit`, `pg`, `@types/pg`), NextAuth.js, Zod, bcrypt (`bcryptjs`, `@types/bcryptjs`), Shadcn UI y sus dependencias
    - Configurar `drizzle.config.ts` con la conexión PostgreSQL
    - Configurar `lib/db/index.ts` con el pool de conexión Drizzle
    - _Requisitos: 14.1, 14.2_

  - [x] 1.2 Configurar estructura de carpetas y layout raíz
    - Crear la estructura de carpetas: `app/(public)/`, `app/(auth)/`, `app/(admin)/`, `lib/db/schema/`, `lib/actions/`, `lib/validators/`, `components/ui/`, `components/forms/`, `components/layout/`, `components/tracker/`
    - Modificar `app/layout.tsx`: establecer `lang="fr"`, configurar metadata en francés, importar fuentes
    - Crear `lib/utils.ts` con función `cn()` para clases Tailwind y función `formatDateFR()` para formato JJ/MM/AAAA
    - _Requisitos: 16.1, 16.2, 16.3_

  - [x] 1.3 Configurar Jest y fast-check para testing
    - Instalar Jest (`jest`, `ts-jest`, `@types/jest`) y fast-check
    - Crear `jest.config.ts` con alias `@/` y entorno node
    - Crear `__tests__/setup.ts` con configuración base
    - Crear estructura de carpetas de tests: `__tests__/unit/`, `__tests__/properties/`, `__tests__/e2e/`
    - _Requisitos: Estrategia de Testing del diseño_

- [x] 2. Esquema de base de datos (Drizzle ORM)
  - [x] 2.1 Crear esquemas de tablas del módulo Comptes utilisateurs
    - Crear `lib/db/schema/users.ts` con tabla `users` (id UUID, name, email unique, password_hash, role enum, is_active, timestamps)
    - Crear `lib/db/schema/sessions.ts` con tabla `sessions` (id, user_id FK cascade, session_token unique, expires_at)
    - Crear `lib/db/schema/password-reset-tokens.ts` con tabla `password_reset_tokens` (id, user_id FK cascade, token unique, expires_at, used, created_at)
    - _Requisitos: 1.1, 1.4, 2.1, 4.2, 5.3_

  - [x] 2.2 Crear esquemas de tablas del módulo Informations
    - Crear `lib/db/schema/info-pages.ts` con tabla `info_pages` (id UUID, title, slug unique, content text, status enum published/draft, timestamps)
    - Crear `lib/db/schema/menu-items.ts` con tabla `menu_items` (id, label, page_id FK cascade, display_order, created_at)
    - _Requisitos: 6.1, 6.2, 7.1, 7.2_

  - [x] 2.3 Crear esquemas de tablas del módulo Tracker d'émotions
    - Crear `lib/db/schema/emotions.ts` con tablas `emotions_level1` (id, name unique, is_active, display_order) y `emotions_level2` (id, emotion_level1_id FK cascade, name, is_active, display_order)
    - Crear `lib/db/schema/emotion-logs.ts` con tabla `emotion_logs` (id, user_id FK cascade, emotion_level1_id FK, emotion_level2_id FK, log_date, note, timestamps)
    - _Requisitos: 8.1, 9.1, 9.2, 9.3, 12.1_

  - [x] 2.4 Crear archivo index de re-exportación y script de seed
    - Crear `lib/db/schema/index.ts` re-exportando todos los esquemas
    - Crear `lib/db/seed.ts` con las 6 emociones de base (Joie, Colère, Peur, Tristesse, Surprise, Dégoût) y sus ~7 emociones de nivel 2 cada una
    - Generar la migración inicial con `drizzle-kit generate`
    - _Requisitos: 9.1, 12.1_

- [x] 3. Esquemas de validación Zod
  - [x] 3.1 Crear validadores del módulo Comptes utilisateurs
    - Crear `lib/validators/auth.ts` con esquemas Zod para: registro (name, email, password con reglas de seguridad: min 8 chars, mayúscula, minúscula, número), login (email, password), reinicio de contraseña (email), nueva contraseña (token, password)
    - Crear validador de actualización de perfil (name, email opcionales)
    - _Requisitos: 1.1, 1.2, 1.3, 2.1, 3.2, 4.2_

  - [x] 3.2 Tests de propiedades para validación de contraseña
    - **Property 3: Validación de contraseña rechaza contraseñas débiles**
    - **Valida: Requisito 1.3**

  - [x] 3.3 Tests de propiedades para unicidad de email
    - **Property 2: Unicidad de email**
    - **Valida: Requisitos 1.2, 3.3**

  - [x] 3.4 Crear validadores del módulo Informations y Tracker
    - Crear `lib/validators/info-pages.ts` con esquemas para crear/actualizar página (title, content, status)
    - Crear `lib/validators/emotions.ts` con esquemas para crear/actualizar emociones (name, level)
    - Crear `lib/validators/tracker.ts` con esquemas para crear/actualizar entrada (emotionLevel1Id, emotionLevel2Id, logDate, note opcional)
    - _Requisitos: 7.2, 9.3, 9.5, 12.2_

  - [x] 3.5 Tests de propiedades para validación de entrada de emoción
    - **Property 26: La validación de entrada requiere ambos niveles de emoción**
    - **Valida: Requisito 9.5**

- [x] 4. Checkpoint — Verificar esquemas y validadores
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 5. Autenticación (NextAuth.js) y middleware
  - [x] 5.1 Configurar NextAuth.js con Credentials Provider
    - Crear `lib/auth.ts` con configuración NextAuth: Credentials Provider con verificación bcrypt, callbacks de sesión y JWT, adaptador de sesión en DB
    - Crear `app/api/auth/[...nextauth]/route.ts` como handler de NextAuth
    - Implementar lógica de verificación: email existe, cuenta activa, bcrypt.compare, retornar usuario con rol
    - _Requisitos: 2.1, 2.2, 2.4, 2.5, 14.2, 14.3, 14.5_

  - [x] 5.2 Implementar middleware de protección de rutas
    - Crear `middleware.ts` con lógica de protección:
      - Rutas públicas: `/`, `/login`, `/register`, `/reset-password`, `/info/*` → acceso libre
      - Rutas autenticadas: `/profile`, `/tracker/*` → requieren sesión válida, redirigir a `/login` si no
      - Rutas admin: `/admin/*` → requieren sesión + rol "administrateur", redirigir a `/` si no
      - API protegidas: `/api/tracker/*`, `/api/users/*` → verificar token, retornar 401 si inválido
    - _Requisitos: 14.5, 14.6_

  - [x] 5.3 Tests de propiedades para autenticación
    - **Property 5: Credenciales válidas producen sesión autenticada**
    - **Property 6: Credenciales inválidas producen error genérico**
    - **Valida: Requisitos 2.1, 2.2**

  - [x] 5.4 Tests de propiedades para protección de rutas y sesiones
    - **Property 33: Las rutas protegidas rechazan solicitudes no autenticadas**
    - **Property 34: Los tokens de sesión tienen expiración**
    - **Valida: Requisitos 14.5, 14.6**

- [x] 6. Módulo Comptes utilisateurs — Registro y Login
  - [x] 6.1 Implementar Server Action de registro
    - Crear `lib/actions/auth.ts` con función `registerUser`: validar datos con Zod, verificar email único, hashear contraseña con bcrypt (coste 10), insertar usuario con rol "utilisateur", retornar resultado
    - Manejar errores: email duplicado (409), validación (400), error DB (500)
    - _Requisitos: 1.1, 1.2, 1.3, 1.4, 1.5_

  - [x] 6.2 Tests de propiedades para registro
    - **Property 1: El registro crea un usuario válido**
    - **Property 4: Las contraseñas se almacenan como hash bcrypt**
    - **Valida: Requisitos 1.1, 1.4, 14.2**

  - [x] 6.3 Crear páginas y formularios de registro y login
    - Crear `components/forms/RegisterForm.tsx` con campos: nombre, email, contraseña, confirmación — validación client-side con Zod, mensajes de error en francés
    - Crear `app/(public)/register/page.tsx` con el formulario de registro
    - Crear `components/forms/LoginForm.tsx` con campos: email, contraseña — mensaje de error genérico "Email ou mot de passe incorrect"
    - Crear `app/(public)/login/page.tsx` con el formulario de login
    - Implementar redirección post-login: admin → `/admin`, usuario → `/`
    - _Requisitos: 1.1, 2.1, 2.2, 2.3, 16.1_

  - [x] 6.4 Test de propiedad para redirección admin
    - **Property 7: Login de administrador redirige al Back-Office**
    - **Valida: Requisito 2.3**

- [x] 7. Módulo Comptes utilisateurs — Perfil y Reinicio de contraseña
  - [x] 7.1 Implementar página de perfil y Server Actions
    - Crear `lib/actions/users.ts` con función `updateProfile`: validar datos, verificar email único si cambia, actualizar en DB
    - Crear `app/(auth)/profile/page.tsx` mostrando nombre, email, fecha de creación (formato JJ/MM/AAAA)
    - Crear `components/forms/ProfileForm.tsx` con edición de nombre y email
    - _Requisitos: 3.1, 3.2, 3.3, 16.3_

  - [x] 7.2 Tests de propiedades para perfil
    - **Property 8: El perfil muestra los datos correctos del usuario**
    - **Property 9: Round-trip de actualización de perfil**
    - **Valida: Requisitos 3.1, 3.2**

  - [x] 7.3 Implementar reinicio de contraseña
    - Crear `lib/actions/auth.ts` funciones `requestPasswordReset` y `confirmPasswordReset`: generar token UUID, guardar con expiración 1h, invalidar tokens anteriores, verificar token válido/no usado/no expirado, hashear nueva contraseña
    - Crear `app/(public)/reset-password/page.tsx` con formulario de solicitud de email
    - Crear `app/(public)/reset-password/confirm/page.tsx` con formulario de nueva contraseña (recibe token por query param)
    - Crear `components/forms/ResetPasswordForm.tsx` y `components/forms/NewPasswordForm.tsx`
    - Respuesta uniforme independientemente de si el email existe
    - _Requisitos: 4.1, 4.2, 4.3, 4.4_

  - [x] 7.4 Tests de propiedades para reinicio de contraseña
    - **Property 10: La respuesta de reinicio de contraseña es uniforme**
    - **Property 11: Round-trip de token de reinicio de contraseña**
    - **Property 12: Solo el último token de reinicio es válido**
    - **Valida: Requisitos 4.1, 4.2, 4.4**

- [x] 8. Checkpoint — Verificar módulo Comptes utilisateurs
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 9. Módulo Comptes utilisateurs — Administración de usuarios
  - [x] 9.1 Implementar API y Server Actions de administración de usuarios
    - Crear `app/api/users/route.ts` con GET (lista paginada) y POST (crear cuenta admin)
    - Crear `app/api/users/[id]/route.ts` con PATCH (desactivar/modificar) y DELETE (eliminar)
    - Implementar en `lib/actions/users.ts`: `toggleUserActive` (desactivar + eliminar sesiones), `deleteUser` (cascade a emotion_logs, impedir auto-eliminación), `createUserAsAdmin` (con rol especificado y contraseña temporal)
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_

  - [x] 9.2 Tests de propiedades para administración de usuarios
    - **Property 13: La lista de usuarios admin contiene todos los campos requeridos**
    - **Property 14: Cuentas creadas por admin tienen el rol especificado**
    - **Property 15: La desactivación de cuenta invalida sesiones**
    - **Property 16: La eliminación de usuario cascadea a datos asociados**
    - **Valida: Requisitos 5.1, 5.2, 5.3, 5.4**

  - [x] 9.3 Crear páginas de administración de usuarios (Back-Office)
    - Crear `app/(admin)/admin/layout.tsx` con sidebar de navegación admin
    - Crear `app/(admin)/admin/users/page.tsx` con tabla paginada de usuarios (nombre, email, rol, estado)
    - Crear `components/layout/AdminSidebar.tsx` con enlaces a secciones admin
    - Implementar acciones en la tabla: crear usuario, desactivar/activar, eliminar con confirmación
    - _Requisitos: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 10. Módulo Informations — CMS y menús dinámicos
  - [x] 10.1 Implementar API Routes y Server Actions del CMS
    - Crear `app/api/info-pages/route.ts` con GET (lista pública: solo published) y POST (admin: crear página)
    - Crear `app/api/info-pages/[slug]/route.ts` con GET (página por slug), PUT (admin: actualizar), DELETE (admin: eliminar con cascade a menu_items)
    - Crear `app/api/menu-items/route.ts` con GET (menú público) y PUT (admin: actualizar estructura completa)
    - Crear `lib/actions/info-pages.ts` con funciones CRUD para páginas y menú
    - Generar slug automático desde el título
    - _Requisitos: 6.1, 6.2, 7.1, 7.2, 7.3, 7.4, 7.5_

  - [x] 10.2 Tests de propiedades para CMS
    - **Property 17: Round-trip de contenido de página publicada**
    - **Property 18: Las páginas en borrador están ocultas del Front-Office**
    - **Property 19: Round-trip de actualización de menú**
    - **Valida: Requisitos 6.1, 6.2, 7.2, 7.3, 7.4**

  - [x] 10.3 Crear páginas públicas de información y navegación dinámica
    - Crear `components/layout/DynamicNav.tsx` que carga menú desde API y renderiza enlaces
    - Crear `app/(public)/layout.tsx` con header, DynamicNav, main y footer (HTML semántico)
    - Crear `app/(public)/info/[slug]/page.tsx` que carga y renderiza la página de contenido
    - Crear `app/(public)/page.tsx` como página de inicio con presentación de CESIZen
    - Manejar 404 para páginas inexistentes o en borrador
    - _Requisitos: 6.1, 6.2, 6.3, 6.4, 15.1, 16.1_

  - [x] 10.4 Crear páginas de administración del CMS (Back-Office)
    - Crear `app/(admin)/admin/info-pages/page.tsx` con lista de páginas (título, estado, fecha)
    - Crear `components/forms/InfoPageEditor.tsx` con editor de contenido (título, cuerpo, estado published/draft)
    - Crear `app/(admin)/admin/menu/page.tsx` con editor de menú (agregar, reordenar, eliminar elementos)
    - Crear `components/layout/MenuEditor.tsx` con reordenamiento por drag & drop o botones
    - _Requisitos: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 11. Checkpoint — Verificar módulos Comptes utilisateurs y Informations
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 12. Módulo Tracker d'émotions — CRUD de entradas
  - [x] 12.1 Implementar API Routes y Server Actions del tracker
    - Crear `app/api/tracker/route.ts` con GET (journal paginado, 20 por página, orden cronológico inverso) y POST (crear entrada)
    - Crear `app/api/tracker/[id]/route.ts` con PUT (actualizar entrada) y DELETE (eliminar entrada)
    - Crear `app/api/emotions/route.ts` con GET (referencial de emociones activas con nivel 2)
    - Crear `lib/actions/tracker.ts` con funciones CRUD: verificar propiedad de la entrada (userId), validar ambos niveles de emoción, preservar created_at en actualización
    - Implementar aislamiento de datos: cada usuario solo ve sus propias entradas
    - _Requisitos: 8.1, 8.2, 8.3, 9.3, 9.4, 9.5, 10.2, 10.3_

  - [x] 12.2 Tests de propiedades para el journal y CRUD
    - **Property 20: Las entradas del journal están en orden cronológico inverso**
    - **Property 21: La paginación limita las entradas por página**
    - **Property 22: Aislamiento de datos de usuario**
    - **Property 24: Round-trip de entrada de emoción**
    - **Property 25: La actualización de entrada preserva createdAt**
    - **Property 27: La eliminación remueve la entrada de la base de datos**
    - **Property 28: No se puede eliminar la entrada de otro usuario**
    - **Valida: Requisitos 8.1, 8.2, 8.3, 9.3, 9.4, 10.2, 10.3**

  - [x] 12.3 Crear páginas del tracker (Front-Office autenticado)
    - Crear `app/(auth)/layout.tsx` con navegación autenticada (perfil, tracker, logout)
    - Crear `app/(auth)/tracker/page.tsx` con componente `EmotionJournal` (lista paginada)
    - Crear `components/tracker/EmotionJournal.tsx` mostrando fecha (JJ/MM/AAAA), Émotion_Niveau_1, Émotion_Niveau_2, nota — con paginación
    - Crear `app/(auth)/tracker/new/page.tsx` con formulario de nueva entrada
    - Crear `app/(auth)/tracker/[id]/edit/page.tsx` con formulario de edición
    - Crear `components/tracker/EmotionEntryForm.tsx` con selector cascada: seleccionar Niveau 1 → filtrar Niveau 2 activas client-side
    - Crear `components/tracker/EmotionLevelSelector.tsx` como selector dinámico reutilizable
    - Implementar diálogo de confirmación para eliminación
    - _Requisitos: 8.1, 8.2, 9.1, 9.2, 9.3, 9.4, 9.5, 10.1, 10.2, 16.1, 16.3_

  - [x] 12.4 Test de propiedad para filtro cascada de emociones
    - **Property 23: Filtro cascada de emociones**
    - **Valida: Requisito 9.2**

- [x] 13. Módulo Tracker d'émotions — Reportes por período
  - [x] 13.1 Implementar lógica de reportes y API
    - Crear `app/api/tracker/report/route.ts` con GET (reporte por período: week, month, quarter, year)
    - Implementar en `lib/actions/tracker.ts` función `getDateRangeForPeriod`: week (lunes→domingo), month (1→último día), quarter (inicio→fin trimestre), year (1 enero→31 diciembre)
    - Implementar función `getEmotionReport`: query agrupado por emotion_level1_id, calcular conteo por categoría, identificar Émotion_Niveau_2 más frecuente por categoría, suma total = total entradas
    - Manejar período sin datos: retornar mensaje "Aucune donnée disponible pour cette période"
    - _Requisitos: 11.1, 11.2, 11.3, 11.4_

  - [x] 13.2 Tests de propiedades para reportes
    - **Property 29: Corrección de la agregación del reporte**
    - **Valida: Requisitos 11.1, 11.2**

  - [x] 13.3 Crear página de reportes (Front-Office autenticado)
    - Crear `app/(auth)/tracker/report/page.tsx` con componente `EmotionReport`
    - Crear `components/tracker/EmotionReport.tsx` con visualización gráfica de distribución (barras o donut)
    - Crear `components/tracker/PeriodSelector.tsx` con opciones: Semaine, Mois, Trimestre, Année
    - Mostrar conteo por Émotion_Niveau_1 y Émotion_Niveau_2 más frecuente por categoría
    - _Requisitos: 11.1, 11.2, 11.3_

- [x] 14. Módulo Tracker d'émotions — Configuración admin de emociones
  - [x] 14.1 Implementar API y Server Actions de configuración de emociones
    - Crear `app/api/emotions/route.ts` POST (admin: agregar emoción nivel 1 o 2)
    - Crear `app/api/emotions/[id]/route.ts` PUT (admin: modificar nombre), PATCH (admin: activar/desactivar)
    - Crear `lib/actions/emotions.ts` con funciones: crear emoción, modificar nombre (sin afectar historial), desactivar (ocultar del formulario, preservar historial), confirmación para desactivar nivel 1 con hijos
    - _Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5_

  - [x] 14.2 Tests de propiedades para configuración de emociones
    - **Property 30: Completitud del referencial de emociones**
    - **Property 31: Nueva emoción disponible en el tracker**
    - **Property 32: Las modificaciones de emociones preservan la integridad histórica**
    - **Valida: Requisitos 9.1, 12.1, 12.2, 12.3, 12.4**

  - [x] 14.3 Crear página de configuración de emociones (Back-Office)
    - Crear `app/(admin)/admin/emotions/page.tsx` con componente `AdminEmotionsConfig`
    - Mostrar lista de Émotion_Niveau_1 con sus Émotion_Niveau_2 asociadas
    - Implementar acciones: agregar, renombrar, activar/desactivar emociones
    - Diálogo de confirmación al desactivar Niveau 1 con hijos activos
    - _Requisitos: 12.1, 12.2, 12.3, 12.4, 12.5_

- [x] 15. Checkpoint — Verificar módulo Tracker d'émotions completo
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

- [x] 16. Componentes de layout, responsive y accesibilidad
  - [x] 16.1 Implementar componentes de layout compartidos
    - Crear `components/layout/Header.tsx` con logo, navegación principal y estado de sesión (login/logout)
    - Crear `components/layout/Footer.tsx` con información legal
    - Crear `components/layout/MobileNav.tsx` con menú hamburguesa para móvil
    - Integrar HTML semántico: `<header>`, `<nav>`, `<main>`, `<footer>`, `<section>`, `<article>`
    - _Requisitos: 13.3, 15.1, 16.1_

  - [x] 16.2 Implementar diseño responsive Mobile First
    - Aplicar breakpoints Tailwind: base (móvil < 768px), md (tablet 768-1024px), lg (escritorio > 1024px)
    - Menú hamburguesa en móvil, menú expandido en escritorio
    - Adaptar tablas admin, formularios y journal a pantallas pequeñas
    - Verificar ancho mínimo 320px
    - _Requisitos: 13.1, 13.2, 13.3, 13.4_

  - [x] 16.3 Implementar accesibilidad
    - Agregar `aria-label` y `aria-labelledby` en elementos interactivos sin texto visible
    - Asegurar navegación completa por teclado con foco visible
    - Verificar ratio de contraste mínimo 4.5:1 en todos los componentes
    - _Requisitos: 15.1, 15.2, 15.3, 15.4_

  - [x] 16.4 Tests de propiedades para UI y formato
    - **Property 35: HTML semántico en las páginas renderizadas**
    - **Property 36: Formateo de fechas en formato francés**
    - **Valida: Requisitos 15.1, 16.3**

- [x] 17. Integración final y wiring
  - [x] 17.1 Conectar todos los módulos y verificar flujos completos
    - Verificar que la navegación dinámica (DynamicNav) se actualiza al modificar el menú desde el Back-Office
    - Verificar que el selector cascada de emociones refleja cambios de configuración admin
    - Verificar que la desactivación de usuario cierra sesiones y bloquea acceso
    - Verificar que la eliminación de usuario cascadea a emotion_logs
    - Verificar que las páginas en borrador no aparecen en el Front-Office
    - _Requisitos: Todos los módulos_

  - [x] 17.2 Tests E2E con Playwright
    - Configurar Playwright con `playwright.config.ts`
    - Crear `__tests__/e2e/auth.spec.ts`: flujo Registro → Login → Perfil → Logout
    - Crear `__tests__/e2e/tracker.spec.ts`: flujo Login → Agregar emoción → Ver journal → Editar → Eliminar → Ver reporte
    - Crear `__tests__/e2e/cms.spec.ts`: flujo Login admin → Crear página → Publicar → Verificar Front-Office → Borrador
    - Crear `__tests__/e2e/admin.spec.ts`: flujo Login admin → Listar usuarios → Crear → Desactivar → Eliminar
    - _Requisitos: Todos los módulos_

- [x] 18. Checkpoint final — Verificar aplicación completa
  - Asegurar que todos los tests pasan, preguntar al usuario si surgen dudas.

## Notas

- Las tareas marcadas con `*` son opcionales y pueden omitirse para un MVP más rápido
- Cada tarea referencia requisitos específicos para trazabilidad
- Los checkpoints aseguran validación incremental
- Los tests de propiedades validan las 36 propiedades de corrección del diseño
- Los tests unitarios validan ejemplos específicos y edge cases
- La interfaz completa está en francés (lang="fr", mensajes, fechas JJ/MM/AAAA)
