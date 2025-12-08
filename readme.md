Para empezar a usar el proyecto, ejecuta los siguientes comandos:

npm install


* Para levantar el servidor de desarrollo, utilizamos webpack-dev-server.

Ejecuta el siguiente comando:

npm start
Ejecuta webpack serve --mode development.

Levanta un servidor local en el puerto 8080.

Abre automáticamente tu navegador predeterminado.

Habilita HMR (Hot Module Replacement): Si guardas cambios en el código, la página se recargará sola sin perder el estado.

Si no se abre automáticamente, visita: http://localhost:8080/

npm run build
Esto generará:

Una carpeta /dist.

Un archivo index.html minificado.

Un archivo main.js con todo el código de React empaquetado y optimizado por Webpack.

📂 Estructura del Proyecto

/
├── dist/               # Archivos generados para producción (se crea al hacer build)
├── public/
│   └── index.html      # Plantilla HTML base
├── src/
│   ├── index.js        # Punto de entrada (Entry point)
│   ├── App.jsx         # Componente principal
│   └── components/     # Dashboard, Login, etc.
├── package.json        # Dependencias y scripts
├── webpack.config.js   # Configuración de Webpack (Reglas, Loaders, Plugins)
└── .gitignore          # Archivos ignorados por Git