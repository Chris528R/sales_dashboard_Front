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