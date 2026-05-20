# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

# Ejemplos
## Ejecutar Node en archivos dentro de una carpeta

- node ./MongoDB_Conexion/server.js
- node ./MongoDB_Conexion/schema.js
- node ./MongoDB_Conexion/create.js


## Ejemplos probar con POSTMAN

### Login:
POST http://localhost:3000/api/auth/login
Body json
{      
    "Correo_Electronico": "jinjin@hotmail.com",
    "Contrasena": "jinjin123"
}

### Registrar
POST http://localhost:3000/api/auth/register
Body json
{      
    "Nombre_Completo": "jin eustacio",
    "Correo_Electronico": "jinjin@hotmail.com",
    "Contrasena": "jinjin123",
    "Telefono": "1234567890",
    "Es_Admin": false,
    "Esta_Activo": true
}

### Token
POST http://localhost:3000/api/auth/login
copiar el token que sale en respuesta
GET http://localhost:3000/api/auth/perfil
Autorizacion en Postman
Seleccionar tipo a Type: Bearer Token
Pegar Token en el campo
Enviar
