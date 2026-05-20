# Lista de Endpoints — InkReserve

**Base URL:** `http://localhost:3000/api` (en desarrollo)
**Comunicación:** JSON en ambas direcciones
**Autenticación:** Bearer Token JWT en el header `Authorization` (excepto donde se indique)

Convenciones de seguridad usadas en esta lista:

| Marca | Significado |
|---|---|
| 🌐 Público | No requiere token. Solo `login` y `register`, según indica la rúbrica. |
| 🔒 Token | Requiere `Authorization: Bearer <token>` válido. Cualquier usuario autenticado. |
| 👑 Admin | Requiere token Y que el usuario tenga `Es_Admin: true`. |

> **Nota de cumplimiento:** todos los endpoints están protegidos con token excepto `/auth/login` y `/auth/register`, **con la excepción de los GET de `/api/tatuadores`** que actualmente son públicos (heredado del diseño original). Si tu profesor lo objeta, basta con agregar `Token_Verificar` en `tatuadoresRoutes.js` antes de los tres `router.get(...)`. No requiere ningún otro cambio.

---

## 1. Autenticación — `/api/auth`

Gestión de sesiones y registro de cuentas.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/register` | 🌐 Público | Crea una cuenta nueva. La contraseña se hashea con bcrypt antes de guardar. Las cuentas nacen siempre como rol "Usuario" (no admin). |
| POST | `/api/auth/login` | 🌐 Público | Valida credenciales y devuelve un JWT de 1 hora de vigencia. Bloquea cuentas con `Esta_Activo: false`. Soporta migración automática de contraseñas legacy en texto plano al hash bcrypt. |
| GET | `/api/auth/perfil` | 🔒 Token | Devuelve los datos del usuario asociado al token actual. Útil para refrescar el rol y mostrar el nombre en la UI. |
| POST | `/api/auth/logout` | 🔒 Token | Endpoint cosmético: el JWT vive en el cliente, así que el "logout" formal solo le indica al frontend que descarte el token. |

---

## 2. Categorías de Tatuaje — `/api/servicios`

Catálogo de estilos (Blackwork, Realismo, etc.). Alimenta la selección de estilo en citas y de especialidades en tatuadores.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/servicios` | 🔒 Token | Lista todas las categorías ordenadas por título. |
| GET | `/api/servicios/:id` | 🔒 Token | Detalle de una categoría individual. |
| POST | `/api/servicios` | 👑 Admin | Crea una categoría nueva. Valida longitud (2–80 chars) y unicidad por título. |
| PUT | `/api/servicios/:id` | 👑 Admin | Renombra una categoría existente. Misma validación que `POST`. |
| DELETE | `/api/servicios/:id` | 👑 Admin | Elimina una categoría. Las citas y tatuadores que ya la usaban conservan el nombre como texto. |

---

## 3. Tatuadores — `/api/tatuadores`

CRUD de los artistas del estudio (collection `Tatuador`).

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/tatuadores` | 🌐 Público* | Lista todos los tatuadores ordenados por nombre. *Ver nota de cumplimiento arriba. |
| GET | `/api/tatuadores/disponibles` | 🌐 Público* | Filtra solo los tatuadores con `Esta_Disponible: true`. |
| GET | `/api/tatuadores/:id` | 🌐 Público* | Detalle individual del tatuador. |
| POST | `/api/tatuadores` | 🔒 Token | Crea un tatuador. Valida nombre, RFC mexicano, CURP, horarios `HH:MM`, días laborales, tarifa y salario ≥ 0, experiencia 0–80. |
| PUT | `/api/tatuadores/:id` | 🔒 Token | Actualiza datos del tatuador. Mismas validaciones que `POST` aplicadas en modo opcional. |
| DELETE | `/api/tatuadores/:id` | 🔒 Token | Elimina un tatuador por id. |

---

## 4. Citas — `/api/citas`

Núcleo del sistema: gestión de sesiones programadas.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/citas` | 🔒 Token | Lista todas las citas ordenadas por fecha y hora. |
| GET | `/api/citas/tatuador/:tatuadorId` | 🔒 Token | Filtra citas por el id numérico de un artista específico. |
| GET | `/api/citas/:id` | 🔒 Token | Detalle individual de una cita. |
| POST | `/api/citas` | 🔒 Token | Crea una cita. Valida: cliente, fecha `YYYY-MM-DD`, hora `HH:MM`, duración 1–12 h, total ≥ 0, status válido. **Rechaza traslapes**: si el artista ya tiene cita en ese horario, regresa `409` con detalle del conflicto. |
| PUT | `/api/citas/:id` | 🔒 Token | Actualiza una cita. Si se mueve fecha/hora/duración/artista, vuelve a verificar traslapes con la nueva ventana. |
| DELETE | `/api/citas/:id` | 🔒 Token | Elimina físicamente la cita. Las cancelaciones normales no usan este endpoint: se cambian al status `cancelled` vía `PUT` para conservar la trazabilidad. |

---

## 5. Clientes — `/api/clientes`

CRUD de los clientes del estudio (collection `Cliente`).

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/clientes` | 🔒 Token | Lista todos los clientes ordenados por nombre. |
| GET | `/api/clientes/:id` | 🔒 Token | Detalle individual del cliente. |
| POST | `/api/clientes` | 🔒 Token | Crea un cliente. Valida nombre (2–100 chars), fecha de nacimiento parseable y no futura, números no negativos. |
| PUT | `/api/clientes/:id` | 🔒 Token | Actualiza datos del cliente. |
| DELETE | `/api/clientes/:id` | 🔒 Token | Elimina al cliente. |

---

## 6. Ventas — `/api/ventas`

CRUD de las ventas (collection `Venta`). Cada venta referencia a una cita, un cliente y un tatuador.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/ventas` | 🔒 Token | Lista todas las ventas con populate de cita, cliente y tatuador. |
| GET | `/api/ventas/:id` | 🔒 Token | Detalle individual de una venta. |
| POST | `/api/ventas` | 🔒 Token | Crea una venta. Valida ObjectIds de las referencias, precio > 0, anticipo ≤ precio, estado de pago en enum `[0, 1, 2]`. |
| PUT | `/api/ventas/:id` | 🔒 Token | Actualiza datos de una venta. |
| DELETE | `/api/ventas/:id` | 🔒 Token | Elimina una venta. Valida formato del ObjectId antes de borrar. |

---

## 7. Reportes — `/api/reportes`

Consultas agregadas para el panel de Reportes del admin. Todas las queries devuelven indicadores listos para visualizar.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/reportes/ganancias` | 🔒 Token | Suma `total_precio` de las citas con `status: 'completed'`. Acepta query params `?inicio=YYYY-MM-DD&fin=YYYY-MM-DD` para filtrar por periodo. Devuelve `{ Total_Ganancias, Total_Anticipos, Total_Ventas }`. |
| GET | `/api/reportes/servicios` | 🔒 Token | Ranking de estilos más solicitados. Agrupa citas por `style` y suma cantidad e ingreso por cada uno. |
| GET | `/api/reportes/citas-por-mes` | 🔒 Token | Distribución temporal de citas. Agrupa por año y mes a partir del campo `date`. |
| GET | `/api/reportes/clientes-frecuentes` | 🔒 Token | Top 20 clientes por número de citas y gasto total acumulado. Agrupa por `clientName`. |

---

## 8. Gestión de Usuarios — `/api/usuarios`

Panel administrativo de cuentas del sistema. La contraseña **nunca** sale al frontend (proyección `-Contrasena` en todas las queries). No se puede modificar correo ni contraseña desde aquí.

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| GET | `/api/usuarios` | 👑 Admin | Lista todos los usuarios sin contraseña, ordenados por nombre. |
| GET | `/api/usuarios/:id` | 👑 Admin | Detalle individual del usuario. |
| PUT | `/api/usuarios/:id` | 👑 Admin | Actualiza campos administrativos: `Nombre_Completo`, `Telefono`, `Es_Admin`, `Esta_Activo`. Bloquea que el admin se quite a sí mismo el rol o se desactive. |

> **Por qué no hay DELETE:** preservar integridad referencial. Las bajas son soft-delete vía `Esta_Activo: false`. Esta exclusión es válida según la rúbrica.

---

## Resumen estadístico

| Recurso | Total endpoints | CRUD completo |
|---|---|---|
| Auth | 4 | N/A (no es un recurso CRUD) |
| Servicios (Categorías) | 5 | ✅ |
| Tatuadores | 6 | ✅ |
| Citas | 6 | ✅ |
| Clientes | 5 | ✅ |
| Ventas | 5 | ✅ |
| Reportes | 4 | N/A (solo lectura) |
| Usuarios | 3 | Sin DELETE (justificado) |
| **TOTAL** | **38** | |

---

## Códigos de respuesta más comunes

| Código | Significado | Cuándo se devuelve |
|---|---|---|
| 200 | OK | Operación exitosa que devuelve datos. |
| 201 | Created | Recurso creado exitosamente. |
| 400 | Bad Request | Validación fallida (formato, longitud, rango). |
| 401 | Unauthorized | Falta el token o es inválido. |
| 403 | Forbidden | Token válido pero sin permisos (típicamente, no es admin). También: cuenta desactivada en login. |
| 404 | Not Found | El recurso solicitado no existe. |
| 409 | Conflict | Conflicto de negocio (ejemplo: traslape de citas). |
| 500 | Internal Server Error | Excepción no controlada. Queda registrada en `MongoDB_Conexion/logs/app.log`. |

---

## Headers requeridos en peticiones autenticadas

```
Content-Type: application/json
Authorization: Bearer <jwt_token>
```

El token se obtiene del endpoint `POST /api/auth/login` en el campo `token` de la respuesta.

---

*Documento generado para el Diseño Técnico — Programación Web II, Grupo 056, Enero–Junio 2026.*
