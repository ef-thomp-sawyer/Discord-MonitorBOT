# Discord-MonitorBOT
Discord Monitor BOT para URLS by Than & Wong

# Estructura del proyecto
```
Discord-MonitorBOT/
├── .env
├── package.json
└── index.js
```

# Configuración inicial
• Primero, crea un archivo ```.env``` en la raíz de tu proyecto con el siguiente contenido:

```.env```
```
TOKEN=tu_token_de_discord_aqui
CLIENT_ID=tu_client_id_de_discord_aqui
```

#Modificado
```
let prefix = '/'
let webPages = ['https://ejemplo.com/index_.html'];
```

# Características del Bot
## Conexión programada
Se conecta automáticamente durante la segunda semana de cada mes, de lunes a domingo, entre las 15:00 y 1:00 horas.

## Comandos Slash:
• ```/in-web```: Conecta el bot manualmente.
• ```/out-web```: Desconecta el bot manualmente.
• ```/programar```: Activa manualmente las 7 conexiones mensuales.
• ```/help```: Muestra todos los comandos disponibles.
• ```/prefix```: Permite cambiar el prefijo de comandos.
• ```/conexión```: Activa la programación automática permanente.
• ```/out-conexion```: Desactiva la programación automática.
• ```/informe```: Muestra un resumen del estado actual.
• ```/introducir-html```: Añade nuevas URLs para monitorear.

## Notas importantes:
•     El bot usa la librería node-schedule para manejar las tareas programadas.

•    Las conexiones se realizan mediante axios para hacer peticiones HTTP a las páginas web.

•    Puedes añadir múltiples URLs para monitorear usando el comando introducir-html.

•    El prefijo por defecto es !, pero puede cambiarse con el comando prefix.

•    El bot verifica automáticamente si está en la segunda semana del mes (días 8-14) para activar las conexiones.

## Requisitos:
• Node.js 16.9.0 o superior

• Token de Discord válido


# Instrucciones de uso
• Instala las dependencias:
```npm install discord.js axios node-schedule dotenv cheerio```

• Configura el archivo ```.env``` con tus credenciales

• Inicia el bot:
```npm start```

El bot registrará automáticamente los comandos slash y estará listo para interactuar en los canales donde se active con ```/in-web``` o ```/help```.

## Añadir al Servidor (OAuth2)
Personal DEMO
https://discord.com/oauth2/authorize?client_id=1378976473783734353&permissions=8&integration_type=0&scope=bot+applications.commands

## powered by wan & bolchas c
