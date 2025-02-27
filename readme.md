# Buscador de Productos Sin Gluten

Aplicación web que permite buscar productos sin gluten disponibles en Chile, con datos proporcionados por la Fundación Coacel y la Fundación Convivir.

## Características

- Visualización de productos sin gluten en una tabla filtrable
- Gráficos de distribución por categoría y empresa
- Búsqueda por texto, categoría y empresa
- Selección de fuentes de datos (Coacel/Convivir)
- Interfaz responsiva y amigable

## Requisitos

- Node.js 14.x o superior
- npm 6.x o superior

## Instalación local

1. Clonar el repositorio
```
git clone <url-del-repositorio>
cd productos-sin-gluten-app
```

2. Instalar dependencias
```
npm install
```

3. Iniciar la aplicación en modo desarrollo
```
npm start
```

4. Construir la versión para producción
```
npm run build
```

## Despliegue en Render

Esta aplicación está configurada para ser desplegada en Render. Para hacerlo:

1. Crea una cuenta en [Render](https://render.com) si aún no tienes una
2. Conecta tu repositorio de GitHub/GitLab
3. Haz clic en "New Web Service"
4. Selecciona el repositorio
5. Render detectará automáticamente la configuración gracias al archivo `render.yaml`
6. Haz clic en "Create Web Service"

### Configuración manual en Render

Si prefieres configurar manualmente:

- **Environment**: Static Site
- **Build Command**: `npm install && npm run build`
- **Publish Directory**: `build`

## Datos

La aplicación carga datos desde dos fuentes:
- Fundación Coacel
- Fundación Convivir

Los datos se cargan desde hojas de cálculo públicas de Google Sheets. Si los datos no están disponibles por algún motivo, la aplicación utiliza datos de respaldo para funcionar correctamente.

## Nota sobre CORS

La aplicación utiliza un proxy de CORS para cargar los datos. Si experimentas problemas, puedes necesitar configurar tu propio proxy CORS o solicitar acceso a los datos directamente.