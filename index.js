const { Client, GatewayIntentBits, EmbedBuilder, Partials } = require('discord.js');
const axios = require('axios');
const schedule = require('node-schedule');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ],
  partials: [Partials.Channel]
});

// Configuración
let prefix = '/'; // Cambiado a '/' como solicitaste
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
  if (currentJob) {
    currentJob.cancel();
  }

  // Programar para la segunda semana de cada mes (días 8-14)
  currentJob = schedule.scheduleJob('0 0 8-14 * *', function() {
    const date = new Date();
    const startHour = 15; // 3 PM
    const endHour = 1;    // 1 AM (siguiente día)
    const currentHour = date.getHours();

    if (currentHour >= startHour || currentHour < endHour) {
      isConnected = true;
      console.log(`Conexión automática activada a las ${date}`);

      webPages.forEach(async url => {
        const result = await refreshWebPage(url);
        if (!result.success) {
          console.error(`Error al refrescar ${url}: ${result.error}`);
        }
      });
    }
  });

  isAutoScheduled = true;
  console.log('Programación mensual automática activada');
}

client.on('ready', () => {
  console.log(`✅ Bot conectado como ${client.user.tag}`);
  client.user.setActivity('Monitoreando webs', { type: 'WATCHING' });
  
  // Registrar comandos slash globales
  registerSlashCommands();
});

async function registerSlashCommands() {
  try {
    const commands = [
      {
        name: 'in-web',
        description: 'Conectar el bot a la página web'
      },
      {
        name: 'out-web',
        description: 'Desconectar el bot de la página web'
      },
      {
        name: 'programar',
        description: 'Activar manualmente las 7 conexiones mensuales'
      },
      {
        name: 'help',
        description: 'Muestra los comandos disponibles'
      },
      {
        name: 'conexion',
        description: 'Programar automáticamente las conexiones mensuales'
      },
      {
        name: 'out-conexion',
        description: 'Desconectar la programación permanente'
      },
      {
        name: 'informe',
        description: 'Muestra el estado actual del bot'
      },
      {
        name: 'introducir-html',
        description: 'Añadir una nueva página HTML para monitorear',
        options: [{
          name: 'url',
          type: 3, // STRING
          description: 'URL de la página web',
          required: true
        }]
      }
    ];

    // Usamos la API de Discord para registrar los comandos
    await client.application.commands.set(commands);
    console.log('✅ Comandos slash registrados correctamente');
  } catch (error) {
    console.error('❌ Error al registrar comandos slash:', error);
  }
}

// Manejar comandos slash
client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;

  try {
    switch (commandName) {
      case 'in-web':
        isConnected = true;
        await interaction.deferReply();
        const result = await refreshWebPage(webPages[0]);
        await interaction.editReply(
          result.success 
            ? '✅ Bot conectado y página refrescada con éxito.' 
            : `❌ Error al refrescar: ${result.error}`
        );
        break;

      case 'out-web':
        isConnected = false;
        await interaction.reply('✅ Bot desconectado de la página web.');
        break;

      case 'programar':
        await interaction.deferReply();
        await interaction.editReply('🔄 Programando las 7 conexiones mensuales...');
        for (let i = 0; i < 7; i++) {
          const res = await refreshWebPage(webPages[0]);
          await interaction.followUp(`Día ${i+1}: ${res.success ? '✅ Éxito' : '❌ Error: ' + res.error}`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        break;

      case 'help':
        const helpEmbed = new EmbedBuilder()
          .setTitle('🛠️ Comandos del Bot')
          .setDescription('Lista de comandos disponibles:')
          .addFields(
            { name: '/in-web', value: 'Conectar el bot a la página web' },
            { name: '/out-web', value: 'Desconectar el bot de la página web' },
            { name: '/programar', value: 'Activar manualmente las 7 conexiones mensuales' },
            { name: '/conexion', value: 'Programar automáticamente las conexiones mensuales' },
            { name: '/out-conexion', value: 'Desconectar la programación permanente' },
            { name: '/informe', value: 'Mostrar estado actual del bot' },
            { name: '/introducir-html [url]', value: 'Añadir una nueva página HTML para monitorear' }
          )
          .setColor('#5865F2');
        await interaction.reply({ embeds: [helpEmbed] });
        break;

      case 'conexion':
        scheduleMonthlyConnections();
        await interaction.reply('✅ Programación automática mensual activada. El bot se conectará durante la segunda semana de cada mes.');
        break;

      case 'out-conexion':
        if (currentJob) {
          currentJob.cancel();
          currentJob = null;
        }
        isAutoScheduled = false;
        await interaction.reply('✅ Programación automática desactivada.');
        break;

      case 'informe':
        const statusEmbed = new EmbedBuilder()
          .setTitle('📊 Informe de Estado')
          .addFields(
            { name: '🔌 Conexión actual', value: isConnected ? '🟢 Conectado' : '🔴 Desconectado' },
            { name: '⏰ Programación automática', value: isAutoScheduled ? '🟢 Activada' : '🔴 Desactivada' },
            { name: '🌐 Páginas monitoreadas', value: webPages.join('\n') || 'Ninguna' }
          )
          .setColor(isConnected ? '#57F287' : '#ED4245')
          .setTimestamp();
        await interaction.reply({ embeds: [statusEmbed] });
        break;

      case 'introducir-html':
        const url = options.getString('url');
        if (!url.startsWith('http')) {
          await interaction.reply('❌ Por favor, introduce una URL válida (debe comenzar con http o https).');
          return;
        }
        webPages.push(url);
        await interaction.reply(`✅ Página añadida: ${url}\n📝 Total de páginas: ${webPages.length}`);
        break;

      default:
        await interaction.reply('❌ Comando no reconocido. Usa /help para ver los comandos disponibles.');
    }
  } catch (error) {
    console.error(`Error al procesar el comando ${commandName}:`, error);
    await interaction.reply('❌ Ocurrió un error al procesar el comando.');
  }
});

// Manejar mensajes tradicionales (por si acaso)
client.on('messageCreate', async message => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  // Aquí puedes añadir el manejo de comandos por mensajes tradicionales
  // similar a como se hizo con los comandos slash
});

client.login(process.env.TOKEN);

// Activar programación automática al iniciar
scheduleMonthlyConnections();
