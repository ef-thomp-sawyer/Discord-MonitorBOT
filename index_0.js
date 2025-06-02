const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const schedule = require('node-schedule');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

let prefix = '!';
let isConnected = false;
let isAutoScheduled = false;
let webPages = ['https://ejemplo.com/index_.html'];
let currentJob = null;

// Función para refrescar la página web
async function refreshWebPage(url) {
  try {
    console.log(`Refrescando página: ${url}`);
    const response = await axios.get(url);
    return {
      success: true,
      status: response.status,
      data: response.data
    };
  } catch (error) {
    console.error(`Error al refrescar la página: ${error.message}`);
    return {
      success: false,
      error: error.message
    };
  }
}

// Función para programar las conexiones mensuales
function scheduleMonthlyConnections() {
  // Cancelar cualquier trabajo existente
  if (currentJob) {
    currentJob.cancel();
  }

  // Programar para la segunda semana de cada mes (días 8-14)
  // Se ejecutará cada día de esa semana durante 15 minutos (ajustable)
  currentJob = schedule.scheduleJob('0 0 * * 1-7', function(fireDate) {
    const date = new Date();
    // Verificar si estamos en la segunda semana del mes (días 8-14)
    if (date.getDate() >= 8 && date.getDate() <= 14) {
      const startHour = 15; // 3 PM
      const endHour = 1;    // 1 AM (siguiente día)
      const currentHour = date.getHours();

      // Verificar si estamos dentro del rango horario
      if ((currentHour >= startHour) || (currentHour < endHour)) {
        isConnected = true;
        console.log(`Conexión automática activada a las ${date}`);

        // Refrescar todas las páginas web registradas
        webPages.forEach(url => {
          refreshWebPage(url).then(result => {
            if (!result.success) {
              console.error(`Error al refrescar ${url}: ${result.error}`);
            }
          });
        });
      }
    }
  });

  isAutoScheduled = true;
  console.log('Programación mensual automática activada');
}

client.on('ready', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
  client.user.setActivity('Monitoreando webs', { type: 'WATCHING' });
});

client.on('messageCreate', async message => {
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  switch (command) {
    case 'in-web':
      isConnected = true;
      message.reply('Bot conectado a la página web. Refrescando...');
      const result = await refreshWebPage(webPages[0]);
      if (result.success) {
        message.reply('Página refrescada con éxito.');
      } else {
        message.reply(`Error al refrescar: ${result.error}`);
      }
      break;

    case 'out-web':
      isConnected = false;
      message.reply('Bot desconectado de la página web.');
      break;

    case 'programar':
      message.reply('Programando las 7 conexiones mensuales...');
      // Ejecutar refresco diario por 7 días (simulado)
      for (let i = 0; i < 7; i++) {
        setTimeout(async () => {
          const res = await refreshWebPage(webPages[0]);
          message.channel.send(`Día ${i+1}: ${res.success ? 'Éxito' : 'Error: ' + res.error}`);
        }, i * 5000); // Espaciado de 5 segundos para demostración
      }
      break;

    case 'help':
      const helpEmbed = new EmbedBuilder()
        .setTitle('Comandos del Bot')
        .setDescription('Lista de comandos disponibles:')
        .addFields(
          { name: `${prefix}in-web`, value: 'Conectar el bot a la página web' },
          { name: `${prefix}out-web`, value: 'Desconectar el bot de la página web' },
          { name: `${prefix}programar`, value: 'Activar manualmente las 7 conexiones mensuales' },
          { name: `${prefix}conexión`, value: 'Programar automáticamente las conexiones mensuales' },
          { name: `${prefix}out-conexion`, value: 'Desconectar la programación permanente' },
          { name: `${prefix}informe`, value: 'Mostrar estado actual del bot' },
          { name: `${prefix}introducir-html [url]`, value: 'Añadir una nueva página HTML para monitorear' },
          { name: `${prefix}prefix [nuevo_prefijo]`, value: 'Cambiar el prefijo de comandos' }
        )
        .setColor('#0099ff');
      message.channel.send({ embeds: [helpEmbed] });
      break;

    case 'prefix':
      if (args.length > 0) {
        prefix = args[0];
        message.reply(`Prefijo cambiado a: ${prefix}`);
      } else {
        message.reply(`El prefijo actual es: ${prefix}`);
      }
      break;

    case 'conexión':
      scheduleMonthlyConnections();
      message.reply('Programación automática mensual activada. El bot se conectará durante la segunda semana de cada mes.');
      break;

    case 'out-conexion':
      if (currentJob) {
        currentJob.cancel();
        currentJob = null;
      }
      isAutoScheduled = false;
      message.reply('Programación automática desactivada.');
      break;

    case 'informe':
      const statusEmbed = new EmbedBuilder()
        .setTitle('Informe de Estado')
        .addFields(
          { name: 'Conexión actual', value: isConnected ? '🟢 Conectado' : '🔴 Desconectado' },
          { name: 'Programación automática', value: isAutoScheduled ? '🟢 Activada' : '🔴 Desactivada' },
          { name: 'Páginas monitoreadas', value: webPages.join('\n') || 'Ninguna' }
        )
        .setColor(isConnected ? '#00ff00' : '#ff0000')
        .setTimestamp();
      message.channel.send({ embeds: [statusEmbed] });
      break;

    case 'introducir-html':
      if (args.length > 0) {
        const newUrl = args[0];
        if (!newUrl.startsWith('http')) {
          message.reply('Por favor, introduce una URL válida (debe comenzar con http o https).');
          return;
        }
        webPages.push(newUrl);
        message.reply(`Página añadida: ${newUrl}\nTotal de páginas: ${webPages.length}`);
      } else {
        message.reply('Por favor, proporciona una URL después del comando.');
      }
      break;

    default:
      message.reply('Comando no reconocido. Usa !help para ver los comandos disponibles.');
  }
});

client.login(process.env.TOKEN);

// Activar programación automática al iniciar
scheduleMonthlyConnections();
