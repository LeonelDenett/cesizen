# Documento de Requisitos — CESIZen

## Introducción

CESIZen es una plataforma web de salud mental y gestión del estrés, simulada como un proyecto para el Ministerio de Salud francés (Ministère de la Santé et de la Prévention). La aplicación ofrece herramientas de información, seguimiento emocional y gestión de cuentas de usuario, dirigida al público general. Se desarrolla con Next.js (App Router), PostgreSQL con Drizzle ORM, Tailwind CSS y Shadcn UI, siguiendo una arquitectura MVC y un enfoque Mobile First / Responsive Design.

Los módulos implementados son:
1. **Comptes utilisateurs** (Obligatorio) — Gestión de cuentas de usuario
2. **Informations** (Obligatorio) — CMS de páginas de salud mental
3. **Tracker d'émotions** (Módulo elegido) — Diario de emociones con referencial de 2 niveles

## Glosario

- **Sistema**: La aplicación web CESIZen en su conjunto
- **Visiteur_Anonyme**: Usuario no autenticado que navega la plataforma pública (Front-Office)
- **Utilisateur_Connecté**: Usuario autenticado con sesión activa que accede a funcionalidades personales
- **Administrateur**: Usuario con privilegios de administración que gestiona el Back-Office
- **Front_Office**: Vista pública de la aplicación accesible a visitantes y usuarios conectados
- **Back_Office**: Vista de administración accesible únicamente a administradores
- **Tracker_Émotions**: Módulo de seguimiento emocional con diario de a bordo y reportes
- **Émotion_Niveau_1**: Emoción de base del referencial (Joie, Colère, Peur, Tristesse, Surprise, Dégoût)
- **Émotion_Niveau_2**: Emoción derivada asociada a una Émotion_Niveau_1 (ej: Joie → Fierté)
- **Journal_de_Bord**: Registro cronológico de entradas emocionales del Utilisateur_Connecté
- **CMS_Informations**: Sistema de gestión de contenidos para páginas informativas de salud mental
- **Drizzle_ORM**: ORM TypeScript utilizado para definir y gestionar el modelo de datos (PostgreSQL)
- **API_Route**: Endpoint del servidor Next.js que actúa como controlador en la arquitectura MVC
- **RGPD**: Règlement Général sur la Protection des Données — normativa europea de protección de datos

## Requisitos

### Requisito 1: Registro de cuenta de usuario

**User Story:** Como Visiteur_Anonyme, quiero crear una cuenta de usuario, para poder acceder a las funcionalidades personalizadas de CESIZen.

#### Criterios de Aceptación

1. WHEN un Visiteur_Anonyme envía el formulario de registro con email, contraseña y nombre, THE Sistema SHALL crear una nueva cuenta con rol "utilisateur" y redirigir al Visiteur_Anonyme a la página de inicio de sesión.
2. WHEN un Visiteur_Anonyme envía un email que ya existe en la base de datos, THE Sistema SHALL mostrar un mensaje de error indicando que el email ya está registrado, sin revelar información adicional sobre la cuenta existente.
3. WHEN un Visiteur_Anonyme envía una contraseña que no cumple los criterios de seguridad (mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número), THE Sistema SHALL mostrar un mensaje de error detallando los criterios no cumplidos.
4. THE Sistema SHALL almacenar la contraseña del usuario utilizando hashing bcrypt con un coste mínimo de 10 rounds.
5. IF el servicio de base de datos no está disponible durante el registro, THEN THE Sistema SHALL mostrar un mensaje de error genérico al usuario y registrar el error en los logs del servidor.

### Requisito 2: Inicio de sesión

**User Story:** Como Visiteur_Anonyme, quiero iniciar sesión con mis credenciales, para poder acceder a mi cuenta y funcionalidades personales.

#### Criterios de Aceptación

1. WHEN un Visiteur_Anonyme envía credenciales válidas (email y contraseña), THE Sistema SHALL autenticar al usuario, crear una sesión segura y redirigir al usuario a la página principal del Front_Office.
2. WHEN un Visiteur_Anonyme envía credenciales inválidas, THE Sistema SHALL mostrar un mensaje de error genérico "Email ou mot de passe incorrect" sin indicar cuál campo es incorrecto.
3. WHEN un Utilisateur_Connecté con rol "administrateur" inicia sesión, THE Sistema SHALL redirigir al Administrateur al Back_Office.
4. IF un usuario intenta iniciar sesión en una cuenta desactivada, THEN THE Sistema SHALL mostrar un mensaje indicando que la cuenta ha sido desactivada y sugerir contactar al administrador.
5. THE Sistema SHALL proteger el formulario de inicio de sesión contra ataques CSRF mediante un token de validación.

### Requisito 3: Gestión del perfil de usuario

**User Story:** Como Utilisateur_Connecté, quiero gestionar mi cuenta (ver y modificar mis datos), para mantener mi información personal actualizada.

#### Criterios de Aceptación

1. WHEN un Utilisateur_Connecté accede a su página de perfil, THE Sistema SHALL mostrar el nombre, email y fecha de creación de la cuenta.
2. WHEN un Utilisateur_Connecté modifica su nombre o email y confirma los cambios, THE Sistema SHALL actualizar los datos en la base de datos y mostrar un mensaje de confirmación.
3. WHEN un Utilisateur_Connecté intenta cambiar su email a uno que ya existe en la base de datos, THE Sistema SHALL rechazar el cambio y mostrar un mensaje de error.

### Requisito 4: Reinicio de contraseña

**User Story:** Como Utilisateur_Connecté, quiero reiniciar mi contraseña, para poder recuperar el acceso a mi cuenta si olvido mis credenciales.

#### Criterios de Aceptación

1. WHEN un usuario solicita el reinicio de contraseña proporcionando su email, THE Sistema SHALL enviar un enlace de reinicio al email proporcionado si la cuenta existe, sin confirmar ni negar la existencia de la cuenta.
2. WHEN un usuario accede al enlace de reinicio válido y envía una nueva contraseña que cumple los criterios de seguridad, THE Sistema SHALL actualizar la contraseña con hashing bcrypt e invalidar el token de reinicio.
3. IF un usuario accede a un enlace de reinicio expirado (más de 1 hora) o ya utilizado, THEN THE Sistema SHALL mostrar un mensaje indicando que el enlace ha expirado y ofrecer solicitar uno nuevo.
4. THE Sistema SHALL limitar los tokens de reinicio activos a uno por cuenta, invalidando tokens anteriores al generar uno nuevo.

### Requisito 5: Administración de cuentas de usuario

**User Story:** Como Administrateur, quiero crear, gestionar, desactivar y eliminar cuentas de usuario y administrador, para mantener el control de acceso a la plataforma.

#### Criterios de Aceptación

1. WHEN un Administrateur accede al panel de gestión de usuarios en el Back_Office, THE Sistema SHALL mostrar una lista paginada de todas las cuentas con su nombre, email, rol y estado (activo/desactivado).
2. WHEN un Administrateur crea una nueva cuenta (usuario o administrador), THE Sistema SHALL registrar la cuenta con el rol especificado y generar una contraseña temporal.
3. WHEN un Administrateur desactiva una cuenta de usuario, THE Sistema SHALL marcar la cuenta como desactivada, cerrar las sesiones activas de ese usuario e impedir futuros inicios de sesión.
4. WHEN un Administrateur elimina una cuenta de usuario, THE Sistema SHALL eliminar la cuenta y todos los datos asociados (entradas del Journal_de_Bord) de forma permanente.
5. IF un Administrateur intenta eliminar su propia cuenta, THEN THE Sistema SHALL rechazar la operación y mostrar un mensaje indicando que un administrador no puede eliminar su propia cuenta.

### Requisito 6: Visualización de páginas de información

**User Story:** Como Visiteur_Anonyme o Utilisateur_Connecté, quiero consultar las páginas de información sobre salud mental, para acceder a contenido educativo y de prevención.

#### Criterios de Aceptación

1. WHEN un usuario (Visiteur_Anonyme o Utilisateur_Connecté) accede al Front_Office, THE Sistema SHALL mostrar un menú de navegación dinámico con las secciones de contenido configuradas por el Administrateur.
2. WHEN un usuario selecciona un elemento del menú de información, THE Sistema SHALL mostrar la página de contenido correspondiente con su título, cuerpo y fecha de última actualización.
3. THE Sistema SHALL renderizar las páginas de información en formato responsive, adaptándose a pantallas móviles, tablets y escritorio.
4. IF una página de información solicitada no existe o ha sido desactivada, THEN THE Sistema SHALL mostrar una página 404 con un enlace de retorno al menú principal.

### Requisito 7: Gestión de contenidos informativos (CMS)

**User Story:** Como Administrateur, quiero crear, modificar y organizar las páginas de información y los menús de navegación, para mantener el contenido de salud mental actualizado.

#### Criterios de Aceptación

1. WHEN un Administrateur accede al CMS_Informations en el Back_Office, THE Sistema SHALL mostrar la lista de páginas de información existentes con su título, estado (publicado/borrador) y fecha de última modificación.
2. WHEN un Administrateur crea o modifica una página de información (título, contenido, estado), THE Sistema SHALL guardar los cambios y actualizar la fecha de última modificación.
3. WHEN un Administrateur modifica la estructura del menú de navegación (agregar, reordenar o eliminar elementos), THE Sistema SHALL actualizar el menú visible en el Front_Office de forma inmediata.
4. WHEN un Administrateur cambia el estado de una página a "borrador", THE Sistema SHALL ocultar la página del Front_Office sin eliminar su contenido.
5. IF un Administrateur intenta eliminar una página de información vinculada a un elemento del menú, THEN THE Sistema SHALL solicitar confirmación y, al confirmar, eliminar tanto la página como el elemento del menú asociado.

### Requisito 8: Diario de emociones (Journal de Bord)

**User Story:** Como Utilisateur_Connecté, quiero consultar mi diario de emociones, para revisar mi historial emocional y observar patrones.

#### Criterios de Aceptación

1. WHEN un Utilisateur_Connecté accede a su Journal_de_Bord, THE Sistema SHALL mostrar una lista cronológica (más reciente primero) de las entradas emocionales registradas, mostrando fecha, Émotion_Niveau_1, Émotion_Niveau_2 y nota opcional.
2. WHEN un Utilisateur_Connecté tiene más de 20 entradas, THE Sistema SHALL paginar los resultados mostrando 20 entradas por página.
3. WHILE un Utilisateur_Connecté consulta su Journal_de_Bord, THE Sistema SHALL mostrar únicamente las entradas pertenecientes a ese usuario, sin acceso a datos de otros usuarios.

### Requisito 9: Agregar y modificar una entrada del tracker de emociones

**User Story:** Como Utilisateur_Connecté, quiero agregar o modificar una entrada en mi diario de emociones, para registrar cómo me siento en un momento dado.

#### Criterios de Aceptación

1. WHEN un Utilisateur_Connecté abre el formulario de nueva entrada, THE Sistema SHALL mostrar un selector de Émotion_Niveau_1 con las 6 emociones de base disponibles.
2. WHEN un Utilisateur_Connecté selecciona una Émotion_Niveau_1, THE Sistema SHALL mostrar dinámicamente las opciones de Émotion_Niveau_2 asociadas a la emoción de base seleccionada.
3. WHEN un Utilisateur_Connecté envía una entrada con Émotion_Niveau_1, Émotion_Niveau_2, fecha y nota opcional, THE Sistema SHALL guardar la entrada en el Journal_de_Bord con la fecha y hora de registro.
4. WHEN un Utilisateur_Connecté modifica una entrada existente, THE Sistema SHALL actualizar los campos modificados y conservar la fecha de creación original.
5. IF un Utilisateur_Connecté envía el formulario sin seleccionar una Émotion_Niveau_1 y una Émotion_Niveau_2, THEN THE Sistema SHALL mostrar un mensaje de error indicando que ambos niveles de emoción son obligatorios.

### Requisito 10: Eliminar una entrada del tracker de emociones

**User Story:** Como Utilisateur_Connecté, quiero eliminar una entrada de mi diario de emociones, para corregir registros erróneos.

#### Criterios de Aceptación

1. WHEN un Utilisateur_Connecté solicita eliminar una entrada de su Journal_de_Bord, THE Sistema SHALL mostrar un diálogo de confirmación antes de proceder.
2. WHEN un Utilisateur_Connecté confirma la eliminación, THE Sistema SHALL eliminar la entrada de forma permanente de la base de datos.
3. IF un Utilisateur_Connecté intenta eliminar una entrada que no le pertenece, THEN THE Sistema SHALL rechazar la operación y devolver un error 403.

### Requisito 11: Reporte de emociones por período

**User Story:** Como Utilisateur_Connecté, quiero visualizar un reporte de mis emociones en un período determinado (semana, mes, trimestre, año), para comprender mis tendencias emocionales.

#### Criterios de Aceptación

1. WHEN un Utilisateur_Connecté selecciona un período de reporte (semana, mes, trimestre o año), THE Sistema SHALL generar una visualización gráfica mostrando la distribución de Émotion_Niveau_1 registradas en ese período.
2. WHEN un Utilisateur_Connecté visualiza el reporte, THE Sistema SHALL mostrar el conteo de entradas por cada Émotion_Niveau_1 y la Émotion_Niveau_2 más frecuente dentro de cada categoría.
3. IF un Utilisateur_Connecté selecciona un período sin entradas registradas, THEN THE Sistema SHALL mostrar un mensaje indicando que no hay datos disponibles para el período seleccionado.
4. WHILE un Utilisateur_Connecté visualiza un reporte, THE Sistema SHALL utilizar únicamente los datos del usuario autenticado para generar la visualización.

### Requisito 12: Configuración del referencial de emociones

**User Story:** Como Administrateur, quiero configurar la lista de emociones disponibles (nivel 1 y nivel 2), para adaptar el referencial emocional de la plataforma.

#### Criterios de Aceptación

1. WHEN un Administrateur accede a la configuración de emociones en el Back_Office, THE Sistema SHALL mostrar la lista de Émotion_Niveau_1 con sus Émotion_Niveau_2 asociadas.
2. WHEN un Administrateur agrega una nueva Émotion_Niveau_1 o Émotion_Niveau_2, THE Sistema SHALL guardar la emoción y hacerla disponible en el formulario del Tracker_Émotions.
3. WHEN un Administrateur modifica el nombre de una emoción existente, THE Sistema SHALL actualizar el nombre en el referencial sin afectar las entradas históricas del Journal_de_Bord que ya la referencian.
4. WHEN un Administrateur desactiva una Émotion_Niveau_2, THE Sistema SHALL ocultar la emoción del formulario de nuevas entradas sin eliminar las entradas históricas que la referencian.
5. IF un Administrateur intenta eliminar una Émotion_Niveau_1 que tiene Émotion_Niveau_2 asociadas, THEN THE Sistema SHALL solicitar confirmación indicando que se desactivarán también las emociones de nivel 2 asociadas.

### Requisito 13: Diseño responsive y Mobile First

**User Story:** Como usuario (cualquier rol), quiero acceder a CESIZen desde cualquier dispositivo, para utilizar la plataforma de forma cómoda en móvil, tablet o escritorio.

#### Criterios de Aceptación

1. THE Sistema SHALL renderizar todas las páginas siguiendo un enfoque Mobile First, donde el diseño base está optimizado para pantallas de 320px de ancho mínimo.
2. THE Sistema SHALL adaptar la disposición de los elementos de interfaz a tres breakpoints: móvil (< 768px), tablet (768px - 1024px) y escritorio (> 1024px).
3. THE Sistema SHALL mostrar un menú de navegación tipo hamburguesa en dispositivos móviles y un menú expandido en escritorio.
4. THE Sistema SHALL ser compatible con los navegadores Chrome, Firefox, Edge y Safari en sus versiones actuales.

### Requisito 14: Seguridad y protección de datos (RGPD)

**User Story:** Como usuario de CESIZen, quiero que mis datos personales estén protegidos conforme a la normativa RGPD, para garantizar la confidencialidad de mi información.

#### Criterios de Aceptación

1. THE Sistema SHALL servir todas las páginas y API_Routes exclusivamente a través del protocolo HTTPS.
2. THE Sistema SHALL almacenar todas las contraseñas utilizando hashing bcrypt, sin almacenar contraseñas en texto plano en ningún momento.
3. THE Sistema SHALL incluir protección CSRF en todos los formularios que modifican datos.
4. THE Sistema SHALL almacenar y procesar todos los datos personales exclusivamente en servidores ubicados dentro de la Unión Europea.
5. THE Sistema SHALL implementar tokens de sesión con expiración configurable y renovación automática durante la actividad del usuario.
6. IF una API_Route recibe una solicitud sin token de autenticación válido para un recurso protegido, THEN THE Sistema SHALL devolver un error 401 sin revelar información sobre la existencia del recurso.

### Requisito 15: Accesibilidad

**User Story:** Como usuario con diversidad funcional, quiero que CESIZen sea accesible, para poder utilizar la plataforma con tecnologías de asistencia.

#### Criterios de Aceptación

1. THE Sistema SHALL utilizar etiquetas semánticas HTML (header, nav, main, footer, section, article) en todas las páginas.
2. THE Sistema SHALL proporcionar atributos aria-label o aria-labelledby en todos los elementos interactivos que carezcan de texto visible.
3. THE Sistema SHALL permitir la navegación completa mediante teclado, incluyendo foco visible en todos los elementos interactivos.
4. THE Sistema SHALL mantener un ratio de contraste mínimo de 4.5:1 entre texto y fondo en todos los componentes de la interfaz.

### Requisito 16: Interfaz en francés

**User Story:** Como usuario francófono, quiero que toda la interfaz de CESIZen esté en francés, para utilizar la plataforma en mi idioma nativo.

#### Criterios de Aceptación

1. THE Sistema SHALL mostrar todos los textos de la interfaz (menús, botones, mensajes, etiquetas de formulario) en idioma francés.
2. THE Sistema SHALL configurar el atributo `lang="fr"` en el elemento HTML raíz de todas las páginas.
3. THE Sistema SHALL formatear las fechas según el formato francés (JJ/MM/AAAA).
