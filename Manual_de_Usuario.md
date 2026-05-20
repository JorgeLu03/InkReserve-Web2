# Manual de Usuario — InkReserve

**Gestor de reservas para estudio de tatuajes**

Versión 1.0 · Programación Web II · Grupo 056 · Enero–Junio 2026
Licenciatura en Multimedia y Animación Digital · FCFM · UANL

---

## Índice

1. [Introducción](#1-introducción)
2. [Acceso al sistema](#2-acceso-al-sistema)
   - 2.1 [Pantalla de Inicio de Sesión](#21-pantalla-de-inicio-de-sesión)
   - 2.2 [Pantalla de Registro](#22-pantalla-de-registro)
3. [Área operativa (recepcionista)](#3-área-operativa-recepcionista)
   - 3.1 [Dashboard](#31-dashboard)
   - 3.2 [Calendario](#32-calendario)
   - 3.3 [Nueva Cita](#33-nueva-cita)
   - 3.4 [Confirmación de Cita](#34-confirmación-de-cita)
   - 3.5 [Detalle de Cita](#35-detalle-de-cita)
4. [Área administrativa](#4-área-administrativa)
   - 4.1 [Panel de Administración](#41-panel-de-administración)
   - 4.2 [Artistas (Lista)](#42-artistas-lista)
   - 4.3 [Perfil de Artista](#43-perfil-de-artista)
   - 4.4 [Nuevo Artista](#44-nuevo-artista)
   - 4.5 [Clientes](#45-clientes)
   - 4.6 [Agenda Semanal y Mensual](#46-agenda-semanal-y-mensual)
   - 4.7 [Gestión de Usuarios](#47-gestión-de-usuarios)
   - 4.8 [Categorías de Tatuaje](#48-categorías-de-tatuaje)
   - 4.9 [Reportes](#49-reportes)
5. [Preguntas frecuentes](#5-preguntas-frecuentes)
6. [Apéndice](#6-apéndice)
   - 6.1 [Cuentas de prueba](#61-cuentas-de-prueba-datos-del-seed)
   - 6.2 [Glosario](#62-glosario-de-términos)
   - 6.3 [Roles y permisos](#63-resumen-de-roles-y-permisos)
   - 6.4 [Soporte](#64-soporte)

---

## 1. Introducción

InkReserve es una aplicación web diseñada para la gestión integral de reservas, agenda y administración de un estudio de tatuajes. El sistema está pensado para ser utilizado exclusivamente por el personal del estudio (recepcionistas y administradores); los clientes finales no interactúan directamente con la plataforma.

Este manual describe el uso de cada una de las pantallas que componen la aplicación, las acciones disponibles para cada perfil de usuario, las validaciones que el sistema aplica y los mensajes que el operador puede encontrar durante su trabajo cotidiano.

### 1.1 Público objetivo

Este manual va dirigido a dos perfiles de usuario:

- **Usuario normal (recepcionista):** persona encargada del día a día del estudio. Puede registrar y consultar citas, gestionar la información de las sesiones programadas y operar la agenda.
- **Administrador:** además de todo lo anterior, gestiona el catálogo de tatuadores, las categorías de estilos, los usuarios del sistema y consulta los reportes ejecutivos.

### 1.2 Convenciones del documento

A lo largo del manual se utilizan los siguientes recursos visuales para guiar la lectura:

- Las rutas (URLs internas) aparecen como `/ejemplo`. Aplican sobre el dominio donde esté desplegada la aplicación.
- Los nombres de campos o botones se indican entre comillas (por ejemplo: el botón "Guardar cita").
- Los bloques con el ícono 📷 señalan dónde se recomienda insertar una captura de pantalla, con la descripción de lo que la captura debe mostrar.
- Las pantallas accesibles solo para el rol Administrador se marcan explícitamente al inicio de cada sección.

### 1.3 Requisitos para el operador

El usuario que utilice la aplicación necesita:

- Un navegador moderno actualizado (Google Chrome, Mozilla Firefox o Microsoft Edge).
- Una cuenta de usuario previamente registrada en el sistema.
- Conexión estable a internet o a la red local donde corre el servidor.

### 1.4 Estructura general de la interfaz

La aplicación se organiza alrededor de dos grandes áreas:

- **Área operativa (recepcionista):** inicia en el Dashboard y se enfoca en consultar y crear citas, navegar el calendario y revisar el detalle de cada sesión.
- **Área administrativa (admin):** inicia en el Panel de Administración e incluye gestión de Artistas, Clientes, Agenda Semanal y Mensual, Usuarios, Categorías y Reportes.

El sistema detecta automáticamente el rol del usuario al iniciar sesión y lo redirige a la pantalla inicial que corresponde. Si un usuario sin permisos intenta acceder por URL directa a una pantalla administrativa, el sistema lo redirige a su panel correspondiente.

---

## 2. Acceso al sistema

### 2.1 Pantalla de Inicio de Sesión

**Ruta:** `/`
**Acceso:** Pública (no requiere sesión iniciada).

#### Propósito

Permite a los usuarios registrados acceder al sistema. Es la única pantalla pública: cualquier ruta protegida redirige aquí mientras no exista una sesión válida. Esta pantalla representa la primera barrera de seguridad de la aplicación.

#### Cómo acceder

Al abrir la aplicación en el navegador, esta es la pantalla inicial. También se llega aquí automáticamente al cerrar sesión desde cualquier otra pantalla o al expirar el token de autenticación (una hora después del último login).

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Campo "Correo electrónico" | Caja de texto donde el usuario escribe el correo con el que está registrado en el sistema. |
| Campo "Contraseña" | Caja de texto enmascarada que recibe la contraseña. Los caracteres se muestran como puntos para proteger la privacidad. |
| Botón "Iniciar sesión" | Envía las credenciales al servidor. Si son correctas, redirige al Dashboard o al Panel de Administración según el rol. |
| Enlace "Regístrate" | Lleva a la pantalla de registro para crear una cuenta nueva. |

#### Cómo usarla (paso a paso)

1. Escribir el correo electrónico registrado.
2. Escribir la contraseña.
3. Hacer clic en "Iniciar sesión".
4. Si las credenciales son correctas, el sistema redirige automáticamente al Dashboard (recepcionista) o al Panel de Administración (administrador).

#### Validaciones

- El correo electrónico debe tener formato válido (`texto@dominio.extensión`).
- La contraseña debe tener al menos 5 caracteres.
- El usuario debe existir en la base de datos.
- La cuenta debe estar activa: las cuentas dadas de baja por un administrador no pueden iniciar sesión hasta ser reactivadas.

#### Mensajes de error posibles

- **"Usuario no existe":** el correo no está registrado en el sistema.
- **"Contraseña incorrecta":** el correo existe pero la contraseña no coincide.
- **"Tu cuenta ha sido desactivada. Contacta al administrador.":** la cuenta existe pero fue dada de baja.
- **"Formato de correo electrónico inválido":** el campo no respeta la estructura de un correo.

#### Notas y tips

- El token de sesión se guarda en el almacenamiento local del navegador (`localStorage`) y tiene una vigencia de una hora.
- Las contraseñas se almacenan en la base de datos cifradas con `bcrypt`; ni siquiera el administrador puede recuperarlas en texto plano.
- Si la sesión expira mientras se está usando otra pantalla, el sistema redirige automáticamente al inicio de sesión.

> 📷 **Captura sugerida:** Pantalla completa de Login mostrando los dos campos (correo y contraseña) y el botón "Iniciar sesión".

> 📷 **Captura sugerida:** Ejemplo de mensaje de error "Contraseña incorrecta" después de un intento fallido.

---

### 2.2 Pantalla de Registro

**Ruta:** `/register`
**Acceso:** Pública (no requiere sesión iniciada).

#### Propósito

Permite crear una cuenta nueva en el sistema. Todas las cuentas creadas desde aquí inician como rol "Usuario" (recepcionista). Solo un administrador puede ascender una cuenta a administrador, desde el panel de Gestión de Usuarios.

#### Cómo acceder

Desde la pantalla de Login, haciendo clic en el enlace "Regístrate". También accesible directamente por URL.

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Campo "Nombre completo" | Nombre del nuevo usuario. Se usará en la barra superior y en los registros de auditoría. |
| Campo "Correo electrónico" | Correo único para el inicio de sesión. No puede repetirse con otro usuario. |
| Campo "Teléfono" | Número de teléfono de contacto. Diez dígitos, sin guiones ni espacios. |
| Campo "Contraseña" | Contraseña con la que el usuario iniciará sesión a futuro. |
| Campo "Confirmar contraseña" | Se ingresa la misma contraseña para reducir errores de tipeo. |
| Botón "Registrarse" | Envía el formulario al servidor y crea la cuenta. |
| Enlace "Inicia sesión" | Regresa a la pantalla de Login para usuarios ya registrados. |

#### Cómo usarla (paso a paso)

1. Completar el nombre completo (mínimo 5 caracteres).
2. Escribir el correo electrónico con formato válido.
3. Escribir el teléfono (10 dígitos exactos).
4. Definir la contraseña (mínimo 5 caracteres) y confirmarla.
5. Hacer clic en "Registrarse".
6. Tras el alta exitosa, el sistema redirige al Login para iniciar sesión con la nueva cuenta.

#### Validaciones

- Nombre completo: mínimo 5 caracteres, máximo 100.
- Correo electrónico: formato válido y único en la base de datos.
- Teléfono: exactamente 10 dígitos numéricos.
- Contraseña: mínimo 5 caracteres. Se guarda cifrada con bcrypt al instante.
- La contraseña y su confirmación deben coincidir.

#### Mensajes de error posibles

- **"Usuario ya existe":** el correo electrónico ya está registrado.
- **"Formato de correo electrónico inválido":** el campo no respeta la estructura email.
- **"El teléfono debe tener exactamente 10 dígitos":** el campo contiene letras, espacios o no son 10 dígitos.
- **"Las contraseñas no coinciden":** la confirmación es distinta a la contraseña.

#### Notas y tips

- Las cuentas creadas desde esta pantalla siempre nacen como rol Usuario (recepcionista). Para crear directamente un administrador es necesario que otro administrador cambie el rol después.
- Por defecto las cuentas nuevas se crean activas y pueden iniciar sesión inmediatamente.

> 📷 **Captura sugerida:** Pantalla completa de Registro con todos los campos visibles.

> 📷 **Captura sugerida:** Pantalla mostrando un error de validación (por ejemplo, teléfono con formato inválido).

---

## 3. Área operativa (recepcionista)

Las siguientes pantallas son las que utiliza diariamente el recepcionista del estudio. Son también accesibles para el administrador, ya que cualquier administrador puede ejercer las funciones de un recepcionista. La diferencia es que el administrador, además, cuenta con un panel exclusivo descrito en la sección 4.

### 3.1 Dashboard

**Ruta:** `/dashboard`
**Acceso:** Usuario (recepcionista) y Administrador.

#### Propósito

Es la pantalla principal del recepcionista. Muestra de un vistazo las citas del día y los accesos rápidos a las acciones más frecuentes: ver el calendario, crear una nueva cita o revisar el detalle de una cita existente. Funciona como punto de partida de la jornada laboral.

#### Cómo acceder

Aparece automáticamente al iniciar sesión como usuario normal. También se llega haciendo clic en el botón principal de navegación o usando el enlace "Dashboard" desde otras pantallas.

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Encabezado | Saludo personalizado con el nombre del usuario que inició sesión y botón de cerrar sesión. |
| Resumen del día | Tarjetas con indicadores rápidos: número de citas del día, citas pendientes, próximas confirmadas. |
| Lista de próximas citas | Tarjetas individuales con los datos clave de cada cita: cliente, artista asignado, hora, estilo y estado actual. |
| Botón "Nueva cita" | Atajo destacado para crear una nueva cita sin necesidad de pasar por el calendario. |
| Botón "Ver calendario" | Lleva a la vista completa del calendario. |

#### Cómo usarla (paso a paso)

1. Al iniciar sesión, revisar la lista de citas del día para preparar la agenda.
2. Hacer clic en cualquier tarjeta de cita para ver y editar su detalle.
3. Usar el botón "Nueva cita" cuando un cliente confirma su sesión por teléfono o presencialmente.
4. Usar el botón de cerrar sesión al terminar la jornada para invalidar el token de seguridad.

#### Notas y tips

- Las tarjetas se actualizan en cuanto se crea, modifica o cancela una cita; no es necesario refrescar la página manualmente.
- Si el estudio aún no tiene citas registradas, la lista muestra un estado vacío con un llamado a la acción para crear la primera.

> 📷 **Captura sugerida:** Vista completa del Dashboard con varias citas listadas.

> 📷 **Captura sugerida:** Estado vacío del Dashboard cuando no hay citas registradas.

---

### 3.2 Calendario

**Ruta:** `/calendar`
**Acceso:** Usuario (recepcionista) y Administrador.

#### Propósito

Vista de calendario que permite explorar todas las citas registradas organizadas por fecha. Es la herramienta principal para tener una visión panorámica de la ocupación del estudio y detectar huecos disponibles o picos de demanda.

#### Cómo acceder

Desde el Dashboard, haciendo clic en "Ver calendario" o en cualquier botón equivalente de navegación.

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Navegación de mes | Botones para avanzar o retroceder entre meses, y botón para regresar al mes actual. |
| Cuadrícula de días | Cada celda representa un día del mes y muestra de forma compacta cuántas citas hay programadas. |
| Marcador de día actual | El día de hoy se resalta visualmente para servir de referencia. |
| Detalle por día | Al hacer clic en un día específico, se expande con la lista de citas de esa fecha. |

#### Cómo usarla (paso a paso)

1. Navegar al mes deseado usando los botones de avance y retroceso.
2. Identificar los días con mayor o menor actividad por la intensidad o cantidad de marcadores.
3. Hacer clic sobre un día específico para ver sus citas.
4. Hacer clic sobre una cita individual para abrir su detalle completo.

#### Notas y tips

- El calendario respeta la zona horaria local del navegador del operador.
- Las citas canceladas aparecen visualmente atenuadas o marcadas con un estado distinto, para que no se confundan con citas activas.

> 📷 **Captura sugerida:** Vista mensual del calendario con varios días marcados.

> 📷 **Captura sugerida:** Detalle expandido de un día con varias citas.

---

### 3.3 Nueva Cita

**Ruta:** `/cita/nueva`
**Acceso:** Usuario (recepcionista) y Administrador.

#### Propósito

Formulario para agendar una nueva cita en el estudio. Está estructurado en cuatro pasos lógicos que pueden completarse en cualquier orden. Aplica validaciones inteligentes que evitan agendar a un artista fuera de su horario laboral o que ya tiene otra cita en el mismo horario.

#### Cómo acceder

Desde el botón "Nueva cita" del Dashboard, o tecleando la ruta directamente.

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Paso 1 — Cliente y estilo | Campo de texto para el nombre del cliente y selector tipo "chips" con los estilos de tatuaje (categorías) disponibles. |
| Paso 2 — Artista | Tarjetas con los artistas registrados. Cada tarjeta muestra avatar con iniciales, color identificativo, badge de estado e ícono de información. |
| Botón de información del artista | Pequeño icono "i" en la esquina superior derecha de cada tarjeta. Al pulsarlo abre un modal con los datos completos del artista. |
| Paso 3 — Fecha y horario | Selector de fecha (calendario nativo), selector de hora (modal con franjas horarias) y selector numérico para la duración estimada (entre 1 y 12 horas). |
| Paso 4 — Detalles | Campos para dimensiones del tatuaje, costo total, notas internas e imágenes de referencia (hasta 6 archivos JPG/PNG). |
| Indicador de progreso | Barra superior que muestra cuántos de los 4 pasos están completados. |
| Tarjeta de resumen | Resumen dinámico al pie del formulario que se actualiza conforme se completan los campos. |
| Botón "Guardar cita" | Envía el formulario al servidor. Solo se habilita cuando todos los campos obligatorios están llenos. |

#### Cómo usarla (paso a paso)

1. Completar el nombre del cliente y seleccionar uno de los estilos disponibles (paso 1).
2. Seleccionar uno de los artistas activos. Para conocer sus especialidades o tarifas, hacer clic en el icono "i" de su tarjeta para abrir el modal de información (paso 2).
3. Elegir la fecha, la hora de inicio y la duración estimada (paso 3). Si el artista no trabaja en esa fecha o esa hora cae fuera de su horario, su tarjeta queda deshabilitada con la razón.
4. Completar las dimensiones, el total a cobrar, notas internas y opcionalmente subir imágenes de referencia (paso 4).
5. Revisar el resumen al pie del formulario y hacer clic en "Guardar cita" para confirmar.
6. Si la operación es exitosa, el sistema redirige a la pantalla de Confirmación de cita.

#### Validaciones

- Nombre del cliente: obligatorio, mínimo 2 caracteres.
- Estilo: obligatorio. La lista se carga dinámicamente desde las categorías que el administrador haya registrado.
- Artista: obligatorio. Si el artista seleccionado deja de estar disponible por cambio de fecha o de hora, el sistema lo deselecciona automáticamente y muestra un aviso.
- Fecha: formato `YYYY-MM-DD`. Debe respetar el día de trabajo del artista escogido.
- Hora: formato `HH:MM` en 24 horas, dentro del horario laboral del artista.
- Duración: número entre 1 y 12. La suma de hora + duración no puede exceder el cierre del artista.
- Total: número mayor a cero.
- Imágenes de referencia: máximo 6, solo formatos JPG, JPEG y PNG.
- No puede haber traslape con otra cita activa del mismo artista en la misma fecha. El backend valida esto como segunda capa y rechaza con un mensaje específico si encuentra conflicto.

#### Mensajes de error posibles

- **"clientName, date y time son obligatorios.":** al intentar guardar sin completar los pasos requeridos.
- **"Traslape: el artista ya tiene cita el [fecha] a las [hora]":** ya existe otra cita del mismo artista en el horario solicitado.
- **"Artista no disponible":** al intentar seleccionar un artista que no trabaja en la fecha u hora indicada.
- **"Formato de date inválido" / "Formato de time inválido":** el campo no respeta el formato.
- **"hours debe ser un número entre 1 y 12".**
- **"total debe ser un número mayor o igual a 0".**

#### Notas y tips

- El sistema reordena automáticamente el orden en el que se completan los pasos: puedes elegir primero la fecha, luego el artista, o cualquier otra combinación.
- El botón de información del artista permite tomar decisiones informadas: muestra especialidades, horario, tarifa por hora, salario mensual y estado actual.
- Las imágenes se guardan codificadas en base64 dentro de la cita, no en un servicio externo, para mantener la simplicidad del sistema.
- Si todavía no hay categorías registradas, el paso 1 muestra un estado vacío indicando que el administrador debe crearlas primero.
- Si todavía no hay artistas registrados, el paso 2 muestra un mensaje similar.

> 📷 **Captura sugerida:** Formulario completo de Nueva Cita con los cuatro pasos visibles.

> 📷 **Captura sugerida:** Modal de información del artista abierto, mostrando especialidades, horario y tarifa.

> 📷 **Captura sugerida:** Tarjeta de artista deshabilitada con el tooltip "No trabaja en Dom" o "Ocupado con otra cita".

> 📷 **Captura sugerida:** Mensaje de aviso de deselección automática del artista al cambiar la fecha.

---

### 3.4 Confirmación de Cita

**Ruta:** `/cita/nueva` (vista interna después de guardar)
**Acceso:** Usuario (recepcionista) y Administrador.

#### Propósito

Pantalla de resultado exitoso que se muestra inmediatamente después de guardar una cita. Confirma al operador que la información fue persistida y le ofrece próximos pasos lógicos: ver el calendario, crear otra cita o salir del flujo.

#### Cómo acceder

Aparece automáticamente al completar exitosamente el formulario de Nueva Cita.

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Mensaje de éxito | Confirmación visual y textual de que la cita se guardó correctamente. |
| Resumen final | Resumen de los datos guardados: cliente, artista, fecha, hora, estilo y total. |
| Botón "Ver calendario" | Lleva a la vista de calendario con la cita ya reflejada. |
| Botón "Nueva cita" | Limpia el formulario y permite agendar otra cita inmediatamente. |

#### Cómo usarla (paso a paso)

1. Verificar visualmente que los datos resumidos coinciden con lo que se quería agendar.
2. Elegir entre regresar al calendario o crear otra cita.

#### Notas y tips

- Esta pantalla solo aparece después de un guardado exitoso. Si hay un error al guardar, el formulario permanece abierto con el mensaje del error.
- El sistema asigna automáticamente un identificador interno a la cita; ese ID se usa para referenciarla en el calendario y en los reportes.

> 📷 **Captura sugerida:** Vista completa de la pantalla de Confirmación con el resumen de una cita recién creada.

---

### 3.5 Detalle de Cita

**Ruta:** `/cita/:id`
**Acceso:** Usuario (recepcionista) y Administrador.

#### Propósito

Pantalla individual de una cita ya creada. Permite consultar toda la información, modificarla, cambiar el estado (confirmar, marcar en progreso, completar o cancelar) y aplicar cargos por cancelación cuando aplique.

#### Cómo acceder

Haciendo clic en cualquier tarjeta de cita desde el Dashboard, el Calendario o la Agenda administrativa.

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Información del cliente | Nombre, iniciales y color identificativo asignados a la cita. |
| Información del artista | Avatar y nombre del tatuador asignado. |
| Fecha y horario | Fecha de la sesión, hora de inicio y duración estimada. |
| Detalles técnicos | Estilo, dimensiones, total acordado y notas internas. |
| Galería de referencias | Miniaturas de las imágenes que se subieron como referencia visual. |
| Estado de la cita | Etiqueta con el estado actual: Pendiente, Confirmada, En progreso, Completada o Cancelada. Cambiable mediante un control. |
| Botón "Guardar cambios" | Aplica las modificaciones realizadas. |
| Botón "Cancelar cita" | Marca la cita como cancelada y opcionalmente aplica un cargo por cancelación. |

#### Cómo usarla (paso a paso)

1. Abrir la cita desde cualquiera de las vistas que la listan.
2. Modificar los campos editables que se desee actualizar (estilo, dimensiones, notas, etc.).
3. Cambiar el estado conforme avance la sesión: confirmar el día previo, marcar "En progreso" al iniciar la sesión, y "Completada" al finalizar.
4. Si la cita debe cancelarse, usar el botón correspondiente y el sistema calculará automáticamente el cargo según el estado en el que se encontraba.
5. Hacer clic en "Guardar cambios" para persistir las modificaciones.

#### Validaciones

- El estado debe ser uno de los cinco valores válidos.
- Las modificaciones de fecha y hora vuelven a evaluar la disponibilidad del artista; si se generan conflictos, el backend rechaza el cambio.
- El cargo por cancelación debe ser un número mayor o igual a cero.

#### Notas y tips

- Marcar una cita como "Completada" la incluye automáticamente en el reporte de Ganancias del periodo.
- Las citas canceladas se conservan en la base de datos por trazabilidad; no se eliminan físicamente.
- Si la cita tiene cargo por cancelación, este se refleja también en los reportes.

> 📷 **Captura sugerida:** Vista completa de Detalle de Cita con todos los datos visibles.

> 📷 **Captura sugerida:** Control de cambio de estado con las opciones desplegables.

---

## 4. Área administrativa

Las siguientes pantallas están reservadas para los usuarios con rol de Administrador. Si un usuario sin permisos intenta acceder a estas rutas directamente, el sistema lo redirige automáticamente al Dashboard. Adicionalmente, todos los endpoints administrativos del backend están protegidos por un middleware específico que valida el rol del token; no es posible saltarse la restricción manipulando la interfaz.

### 4.1 Panel de Administración

**Ruta:** `/admin`
**Acceso:** Solo Administrador.

#### Propósito

Es la pantalla principal del administrador. Funciona como concentrador: muestra indicadores generales del estudio y atajos hacia las distintas secciones administrativas (Artistas, Clientes, Agenda, Usuarios, Categorías y Reportes).

#### Cómo acceder

Aparece automáticamente al iniciar sesión con una cuenta administrador. También accesible mediante el enlace correspondiente en la barra de navegación.

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Saludo y barra superior | Identifica al administrador conectado e incluye el botón de cerrar sesión. |
| Tarjetas de indicadores | Resumen rápido del estado del estudio: total de citas activas, artistas, clientes, etc. |
| Accesos rápidos | Botones grandes hacia las secciones administrativas más usadas. |

#### Cómo usarla (paso a paso)

1. Revisar de un vistazo los indicadores generales.
2. Hacer clic en el acceso rápido correspondiente para abrir la sección deseada.

#### Notas y tips

- Los indicadores se calculan en tiempo real con base en los datos de la base. Si el conteo no cuadra con lo esperado, es buen punto de partida para validar la consistencia de la información.

> 📷 **Captura sugerida:** Vista completa del Panel de Administración con todos los indicadores visibles.

---

### 4.2 Artistas (Lista)

**Ruta:** `/admin/employees`
**Acceso:** Solo Administrador.

#### Propósito

Listado de todos los tatuadores registrados en el estudio. Permite consultar de manera rápida los datos esenciales (nombre, especialidades, estado de turno) y navegar al perfil completo de cualquiera para editarlo. También ofrece el botón para registrar un artista nuevo.

#### Cómo acceder

Desde el menú lateral del panel administrativo, pulsando la opción "Artistas".

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Tarjeta por artista | Muestra avatar, nombre, especialidades resumidas y badge de estado (fichado / fuera de turno). |
| Botón "Nuevo artista" | Lleva al formulario de alta de artista. |
| Filtros y búsqueda | Permiten filtrar la lista por estado o buscar por nombre. |

#### Cómo usarla (paso a paso)

1. Recorrer visualmente la lista para identificar al artista deseado.
2. Usar la búsqueda si la lista es extensa.
3. Hacer clic sobre la tarjeta del artista para abrir su perfil completo.
4. Pulsar "Nuevo artista" para iniciar el alta de un tatuador nuevo.

#### Notas y tips

- Solo los artistas registrados aquí aparecerán como opciones en el formulario de Nueva Cita.
- El estado "fichado" se controla desde el detalle individual del artista.

> 📷 **Captura sugerida:** Vista completa de la lista de Artistas con varias tarjetas.

---

### 4.3 Perfil de Artista

**Ruta:** `/admin/employees` → detalle
**Acceso:** Solo Administrador.

#### Propósito

Detalle completo de un artista. Permite consultar y editar toda su información profesional, gestionar su horario y especializaciones, ver su historial de citas y controlar si está fichado (disponible para nuevas citas) o no.

#### Cómo acceder

Haciendo clic sobre la tarjeta del artista deseado desde la lista de Artistas.

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Datos personales | Nombre, fecha de nacimiento, RFC, CURP, fotografía y currículum. |
| Especialidades | Chips seleccionables con las categorías de tatuaje que domina el artista. |
| Horario laboral | Hora de inicio, hora de fin y días de la semana en que trabaja. |
| Compensación | Tarifa por hora y salario mensual. |
| Portafolio | Imágenes de trabajos representativos del artista. |
| Control de fichaje | Conmutador para indicar si el artista está activo (puede recibir nuevas citas) o no. |
| Historial de citas | Lista de citas pasadas y futuras del artista. |
| Botón "Guardar cambios" | Persiste las modificaciones realizadas. |

#### Cómo usarla (paso a paso)

1. Modificar los campos que se deseen actualizar.
2. Marcar o desmarcar especialidades según corresponda. La lista de opciones proviene de las Categorías registradas por el administrador.
3. Ajustar el horario laboral. Las validaciones de Nueva Cita usan estos datos.
4. Hacer clic en "Guardar cambios".

#### Validaciones

- RFC: formato mexicano (4 letras + 6 dígitos + 3 alfanuméricos).
- CURP: formato mexicano (18 caracteres con patrón específico).
- Hora de inicio menor a hora de fin.
- Tarifa por hora y salario mensual: números mayores o iguales a cero.
- Años de experiencia: entero entre 0 y 80.

#### Mensajes de error posibles

- **"RFC con formato inválido."**
- **"CURP con formato inválido."**
- **"Horario_Inicio debe ser menor que Horario_Fin."**
- **"Tarifa_Hora debe ser un número >= 0."**

#### Notas y tips

- Las especialidades que se elijan aquí determinan la información que se muestra en el modal de información del artista durante la creación de citas.
- Si se modifica el horario de un artista, las citas existentes no se invalidan; pero las futuras sí respetarán el horario nuevo.

> 📷 **Captura sugerida:** Vista completa del Perfil de Artista con todos los campos visibles.

> 📷 **Captura sugerida:** Sección de especialidades con varios chips marcados.

---

### 4.4 Nuevo Artista

**Ruta:** `/admin/createEmployee`
**Acceso:** Solo Administrador.

#### Propósito

Formulario para registrar un tatuador nuevo en el estudio. Una vez creado, el artista aparece automáticamente como opción en el formulario de Nueva Cita y queda disponible para que se le agende sesiones.

#### Cómo acceder

Desde la lista de Artistas, pulsando el botón "Nuevo artista".

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| ID interno | Identificador asignado automáticamente al artista. No es editable. |
| Datos personales | Nombre, fecha de nacimiento, RFC, CURP. |
| Avatar | Foto del artista (opcional). Color asignado automáticamente. |
| Especialidades | Chips con las categorías de tatuaje que domina. |
| Horario laboral | Hora de inicio, hora de fin y días de la semana. |
| Compensación | Tarifa por hora y salario mensual. |
| Botón "Guardar artista" | Crea el registro en la base de datos. |
| Botón "Cancelar" | Descarta los cambios y vuelve a la lista. |

#### Cómo usarla (paso a paso)

1. Completar los datos personales del nuevo artista.
2. Marcar las especialidades que domina. Si las categorías deseadas no aparecen, primero hay que crearlas en la sección de Categorías.
3. Definir el horario laboral. Es recomendable revisar dos veces este paso porque afecta la disponibilidad en el formulario de Nueva Cita.
4. Establecer la tarifa y el salario mensual.
5. Pulsar "Guardar artista".

#### Validaciones

- Nombre: obligatorio, mínimo 2 caracteres.
- Mínimo una especialidad.
- Mínimo un día laboral seleccionado.
- Validaciones de RFC y CURP si se llenan.

#### Notas y tips

- El artista se crea por defecto como "fichado" (activo y disponible para recibir citas). Esto puede cambiarse después desde su perfil.
- Si en la sección de Categorías no hay registros, el formulario mostrará un mensaje indicándolo y no se podrán marcar especialidades.

> 📷 **Captura sugerida:** Formulario completo de Nuevo Artista con datos de ejemplo.

> 📷 **Captura sugerida:** Mensaje cuando no hay categorías registradas.

---

### 4.5 Clientes

**Ruta:** `/admin/clients`
**Acceso:** Solo Administrador.

#### Propósito

Lista de todos los clientes que han pasado por el estudio. Permite consultar su historial de citas, sus preferencias, sus notas importantes y el total que han gastado a lo largo del tiempo.

#### Cómo acceder

Desde el menú lateral del panel administrativo, pulsando la opción "Clientes".

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Lista de clientes | Cada cliente se muestra con su nombre, número de citas anteriores y gasto total acumulado. |
| Búsqueda | Filtro por nombre. |
| Detalle del cliente | Al hacer clic, se expanden o navegan los datos completos: fecha de nacimiento, preferencias, notas, historial. |

#### Cómo usarla (paso a paso)

1. Buscar al cliente por nombre.
2. Hacer clic sobre su tarjeta para ver el detalle completo.
3. Consultar el historial de citas anteriores, preferencias y notas registradas.

#### Notas y tips

- Los datos del cliente se actualizan automáticamente conforme se crean nuevas citas a su nombre.
- Esta pantalla es solo de consulta; el alta de clientes se realiza implícitamente al crear citas.

> 📷 **Captura sugerida:** Lista de Clientes con varios registros y la búsqueda en uso.

---

### 4.6 Agenda Semanal y Mensual

**Ruta:** `/admin/week` y `/admin/month`
**Acceso:** Solo Administrador.

#### Propósito

Vistas tipo planificador que permiten al administrador analizar la carga del estudio. La agenda semanal cruza los días de la semana contra las horas del día; la mensual ofrece un panorama de un mes completo. Ambas muestran las citas distribuidas por artista, con código de color para identificarlos visualmente.

#### Cómo acceder

Desde el menú lateral, opciones "Agenda Semanal" y "Agenda Mensual".

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Cuadrícula | Eje horizontal: días; eje vertical: horas (en la vista semanal). En la mensual, una celda por día. |
| Bloques de citas | Cada cita aparece como un bloque coloreado con el avatar del artista asignado. |
| Navegación | Botones para avanzar y retroceder entre semanas o meses. |
| Leyenda de artistas | Identifica qué color corresponde a cada tatuador. |

#### Cómo usarla (paso a paso)

1. Seleccionar la vista deseada (Semanal o Mensual).
2. Navegar al periodo de interés con los botones de avance/retroceso.
3. Hacer clic sobre un bloque de cita para abrir su detalle.
4. Usar la leyenda para identificar al artista de cada bloque por color.

#### Notas y tips

- La agenda muestra todas las citas activas (no canceladas) del periodo.
- Si dos citas se traslapan en el mismo artista, el sistema impide que esto suceda al crearlas (validación tanto en el frontend como en el backend), por lo que esta pantalla no debería mostrar conflictos.

> 📷 **Captura sugerida:** Vista de Agenda Semanal con varias citas distribuidas a lo largo de la semana.

> 📷 **Captura sugerida:** Vista de Agenda Mensual con citas en distintos días.

---

### 4.7 Gestión de Usuarios

**Ruta:** `/admin/users`
**Acceso:** Solo Administrador.

#### Propósito

Pantalla para administrar las cuentas de usuario del sistema. Permite consultar todas las cuentas registradas, ver su detalle, cambiar el rol (Usuario / Administrador), dar de baja o reactivar cuentas. Es la herramienta para mantener el control de quién puede entrar al sistema.

#### Cómo acceder

Desde el menú lateral, opción "Usuarios".

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Encabezado con estadísticas | Total de usuarios, administradores, activos e inactivos. |
| Búsqueda | Filtra por nombre o correo. |
| Filtro por rol | Todos, Admin o Usuario. |
| Filtro por estado | Todos, Activos o Inactivos. |
| Tabla de usuarios | Cada fila muestra avatar, nombre, correo, badge de rol y badge de estado. |
| Botón "Hacer/Quitar admin" | Cambia el rol de la cuenta. Pide confirmación. |
| Botón "Dar de baja / Reactivar" | Cambia el estado activo de la cuenta. Pide confirmación. |
| Panel lateral de detalle | Al hacer clic sobre un usuario, abre un panel con su información completa: teléfono, fecha de registro y última actualización. |

#### Cómo usarla (paso a paso)

1. Localizar al usuario mediante búsqueda o filtros.
2. Hacer clic sobre la fila para ver el detalle completo en el panel lateral.
3. Usar el botón "Hacer admin" para elevar a un recepcionista al rol de administrador. Confirmar la acción en el cuadro de diálogo.
4. Usar el botón "Dar de baja" para impedir el acceso de una cuenta sin eliminarla físicamente.
5. Usar el botón "Reactivar" para devolver el acceso a una cuenta dada de baja.

#### Validaciones

- Un administrador no puede quitarse a sí mismo el rol de administrador (protección contra bloqueos accidentales).
- Un administrador no puede desactivar su propia cuenta.
- Las acciones que afectan a la propia cuenta del administrador aparecen deshabilitadas con la etiqueta "tú".

#### Mensajes de error posibles

- **"Un administrador no puede quitarse a sí mismo el rol":** al intentar quitarse permisos.
- **"Un administrador no puede desactivar su propia cuenta".**

#### Notas y tips

- Las cuentas dadas de baja no pueden iniciar sesión. Si intentan, ven el mensaje específico durante el login.
- El correo electrónico no se puede modificar desde esta pantalla por seguridad. Si un usuario necesita cambiarlo, el administrador debe darlo de baja y pedirle que se registre con el nuevo correo.
- Las contraseñas tampoco se modifican desde aquí. El sistema no permite ver ni cambiar contraseñas ajenas; cada usuario es responsable de la suya.

> 📷 **Captura sugerida:** Vista completa de Gestión de Usuarios con varios usuarios listados.

> 📷 **Captura sugerida:** Panel lateral de detalle abierto.

> 📷 **Captura sugerida:** Confirmación al hacer clic en "Dar de baja".

---

### 4.8 Categorías de Tatuaje

**Ruta:** `/admin/categories`
**Acceso:** Solo Administrador.

#### Propósito

Pantalla para administrar el catálogo de estilos (categorías) que se ofrecen en el estudio. Estas categorías alimentan tanto el formulario de Nueva Cita (donde se eligen como estilo de la sesión) como el formulario de alta de Artistas (donde se marcan como especialidades). Si una categoría no existe aquí, no puede ser usada en ningún otro lugar del sistema.

#### Cómo acceder

Desde el menú lateral, opción "Categorías".

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Encabezado con contador | Muestra el total de categorías registradas. |
| Formulario de creación | Caja de texto para escribir el nombre de la nueva categoría y botón "Agregar". |
| Búsqueda | Filtra el listado por nombre de la categoría. |
| Lista de categorías | Cada elemento muestra el nombre y dos botones: "Editar" y "Eliminar". |
| Modo edición | Al pulsar "Editar", el nombre se convierte en una caja de texto editable con los botones "Guardar" y "Cancelar". |
| Mensaje flotante | Confirmaciones y errores aparecen brevemente en la parte superior. |

#### Cómo usarla (paso a paso)

1. Para crear: escribir el nombre en el formulario superior y pulsar "Agregar".
2. Para editar: pulsar "Editar" en la categoría deseada, modificar el nombre y pulsar "Guardar".
3. Para eliminar: pulsar "Eliminar" y confirmar la advertencia.
4. Para buscar: escribir parte del nombre en la búsqueda; el listado se filtra automáticamente.

#### Validaciones

- El nombre debe tener entre 2 y 80 caracteres.
- No puede haber dos categorías con el mismo nombre (validación de unicidad en backend).

#### Mensajes de error posibles

- **"El título debe tener al menos 2 caracteres."**
- **"El título no puede exceder 80 caracteres."**
- **"Ya existe un servicio con ese título."**

#### Notas y tips

- Al eliminar una categoría, las citas y los tatuadores que la usaban conservan el nombre como texto (porque se almacena como cadena, no como referencia). Sin embargo, la categoría dejará de aparecer en las listas de selección de nuevas citas y nuevos artistas.
- Si todavía no hay categorías, el formulario de Nueva Cita y el de Nuevo Artista mostrarán mensajes explicando que el administrador debe crearlas primero.

> 📷 **Captura sugerida:** Vista completa de Categorías con varias creadas.

> 📷 **Captura sugerida:** Modo edición activado en una categoría.

> 📷 **Captura sugerida:** Confirmación al pulsar "Eliminar".

---

### 4.9 Reportes

**Ruta:** `/admin/reports`
**Acceso:** Solo Administrador.

#### Propósito

Tablero ejecutivo del estudio. Presenta cuatro reportes principales basados en consultas reales a la base de datos, además de un panel superior con cuatro indicadores resumidos (KPIs). Es la herramienta de toma de decisiones del administrador para identificar tendencias, evaluar rendimiento y planear acciones.

#### Cómo acceder

Desde el menú lateral, opción "Reportes".

#### Elementos de la pantalla

| Elemento | Descripción |
|---|---|
| Filtro de periodo | Botones "Hoy", "Semana", "Mes", "Año" y "Todo". Aplica al Reporte 1 (Ingresos). |
| Tarjetas de KPI (4) | Ingresos del periodo, Citas registradas, Ticket promedio y Servicio más solicitado. |
| Reporte 1 — Resumen Financiero | Ganancia total, anticipos cobrados y número de servicios cobrados. Insight automático con el ticket promedio. |
| Reporte 2 — Estilos más solicitados | Ranking de los estilos de tatuaje con más sesiones realizadas y su ingreso asociado. |
| Reporte 3 — Citas por mes | Gráfico de barras con la cantidad de citas mes a mes, con colores según intensidad. |
| Reporte 4 — Clientes frecuentes | Tabla con los clientes top: visitas, gasto total y ticket promedio. |

#### Cómo usarla (paso a paso)

1. Al abrir la pantalla, todos los reportes se cargan automáticamente desde el backend.
2. Cambiar el filtro de periodo (clic en alguno de los botones) recalcula el Reporte 1 y los KPIs financieros para el rango seleccionado.
3. Los reportes 2, 3 y 4 muestran datos históricos completos y no se ven afectados por el filtro de periodo.
4. Cada indicador se calcula dinámicamente; no hay valores hardcoded.

#### Notas y tips

- El Reporte 1 (Ganancias) suma el campo `total_precio` de todas las citas con estado "Completada" en el periodo seleccionado. Para que se reflejen ingresos, las citas deben marcarse como completadas desde el Detalle de Cita.
- El Reporte 2 (Estilos) agrupa por el campo `style` de las citas. Si una cita tiene el estilo en blanco, no aparece en el ranking.
- El Reporte 4 (Clientes frecuentes) agrupa por el nombre del cliente que se escribió en la cita.
- Si la base de datos está vacía o no hay datos para el periodo, cada reporte muestra un estado vacío amigable indicándolo.
- Todos los datos se leen en vivo desde la base; un refresco de la pantalla actualiza la información al instante.

> 📷 **Captura sugerida:** Vista completa de Reportes con datos cargados.

> 📷 **Captura sugerida:** Detalle de la tarjeta de Resumen Financiero.

> 📷 **Captura sugerida:** Tabla de Clientes frecuentes ordenada por visitas.

> 📷 **Captura sugerida:** Estado vacío de un reporte cuando no hay datos para el periodo.

---

## 5. Preguntas frecuentes

### 5.1 No puedo iniciar sesión aunque escribo bien el correo y la contraseña

Verifica que tu cuenta no haya sido dada de baja por un administrador. Si recibes el mensaje "Tu cuenta ha sido desactivada", contacta al administrador para que la reactive desde la pantalla de Gestión de Usuarios.

### 5.2 Al crear una cita no aparece el artista que necesito

Posibles causas:

- El artista no está registrado en el sistema. Pide al administrador que lo dé de alta desde "Nuevo Artista".
- El artista existe pero no trabaja en la fecha seleccionada. Cambia la fecha o consulta su horario desde el modal de información del artista (icono "i").
- El artista trabaja ese día pero la hora cae fuera de su jornada o ya tiene otra cita que se traslapa. El sistema lo señala con un badge y un tooltip explicativo.

### 5.3 No aparece el estilo de tatuaje que el cliente pide

Solo aparecen como opción los estilos registrados en la sección Categorías. Si la categoría no existe, pide al administrador que la agregue. Una vez creada, aparecerá automáticamente en el formulario de Nueva Cita y en el de Nuevo Artista.

### 5.4 El Reporte de Ingresos muestra $0 a pesar de que sí hay citas

El reporte cuenta únicamente las citas con estado "Completada". Asegúrate de cambiar el estado de las citas finalizadas desde el Detalle de Cita; mientras estén en "Pendiente", "Confirmada" o "En progreso", no entran en el cálculo.

### 5.5 Mi sesión se cerró sola

Por seguridad, el token de sesión expira automáticamente una hora después del inicio de sesión. Si esto ocurre durante el uso de la aplicación, el sistema redirige al Login y solo es necesario iniciar sesión de nuevo. La información que estabas viendo no se pierde mientras esté guardada.

---

## 6. Apéndice

### 6.1 Cuentas de prueba (datos del seed)

La aplicación incluye un script de carga inicial de datos (`npm run seed`) que crea tres cuentas de ejemplo para facilitar la evaluación:

| Cuenta | Detalle |
|---|---|
| `admin@inkreserve.com` / `admin123` | Rol Administrador. Acceso completo a todas las secciones, incluyendo el panel administrativo. |
| `recepcion@inkreserve.com` / `recepcion123` | Rol Usuario. Acceso solo al área operativa (Dashboard, Calendario, Crear Cita, Detalle de Cita). |
| `inactivo@inkreserve.com` / `inactivo123` | Rol Usuario, pero con la cuenta dada de baja. Sirve para demostrar el bloqueo de cuentas inactivas durante el login. |

### 6.2 Glosario de términos

| Término | Significado |
|---|---|
| Token JWT | Cadena cifrada que el servidor emite al iniciar sesión y que el cliente debe enviar en cada petición para identificarse. |
| Fichado | Estado de un tatuador que indica si está activo y disponible para recibir nuevas citas. |
| Categoría | Estilo de tatuaje registrado en el sistema. Alimenta tanto el formulario de Nueva Cita como el de Nuevo Artista. |
| Anticipo | Pago parcial que el cliente realiza al agendar una cita; se aplica al total al completar el servicio. |
| KPI | Indicador clave de desempeño. En esta aplicación, los KPI son los cuatro recuadros principales del panel de Reportes. |
| Traslape | Situación en la que dos citas del mismo artista coinciden total o parcialmente en horario. El sistema impide guardarlas. |

### 6.3 Resumen de roles y permisos

| Acción | Quién puede |
|---|---|
| Iniciar sesión / registrarse | Cualquier persona con datos válidos. |
| Ver Dashboard, Calendario y citas | Usuario y Administrador. |
| Crear, editar y cancelar citas | Usuario y Administrador. |
| Ver y modificar artistas, clientes y agenda | Solo Administrador. |
| Crear y modificar categorías | Solo Administrador. |
| Cambiar roles y dar de baja usuarios | Solo Administrador. |
| Ver reportes ejecutivos | Solo Administrador. |

### 6.4 Soporte

Para incidencias técnicas, contactar al equipo de desarrollo a través del repositorio de GitHub del proyecto. Para dudas operativas (cómo hacer X tarea), consultar primero este manual y, en caso de no encontrar la respuesta, contactar al administrador del estudio.

---

*Documento generado para el Diseño Técnico — Programación Web II, Grupo 056, Enero–Junio 2026.*
