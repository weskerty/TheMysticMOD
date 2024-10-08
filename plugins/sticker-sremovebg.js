import { BackgroundRemoval } from '@imgly/background-removal-node'; // Importa la librería de fondo
import fs from 'fs'; // Para manejar los archivos temporales
import path from 'path'; // Para manejar rutas de archivos
import { sticker } from '../src/libraries/sticker.js'; // Asumiendo que ya tienes esta función para stickers

const tempDirectory = path.join(process.cwd(), 'src/tmp/');
const maxDownloads = 2;
let activeDownloads = 0;
const queue = [];

const generateTempFileName = () => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.]/g, ''); // Formato único de fecha y hora
  return `temp-${timestamp}.png`;
};

// Asegurar que la carpeta temporal exista
if (!fs.existsSync(tempDirectory)) {
  fs.mkdirSync(tempDirectory, { recursive: true });
}

async function handleBackgroundRemovalRequest(img, conn, m) {
  const inputPath = path.join(tempDirectory, generateTempFileName());
  const outputPath = path.join(tempDirectory, generateTempFileName());

  try {
    // Guardar la imagen descargada en la carpeta temporal
    fs.writeFileSync(inputPath, img);

    // Informar al usuario que el proceso ha comenzado
    await conn.reply(m.chat, '🛠️ Procesando imagen, por favor espera...', m);

    // Procesar la imagen para remover el fondo
    await BackgroundRemoval.fromFile(inputPath).toFile(outputPath);

    // Convertir la imagen a sticker
    const stickerResult = await sticker(false, outputPath, global.packname, global.author);

    // Enviar el sticker
    await conn.sendFile(m.chat, stickerResult, 'sticker.webp', '', m, { asSticker: true });

    // Limpiar archivos temporales
    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

  } catch (error) {
    console.error('Error durante la eliminación de fondo:', error);
    await conn.reply(m.chat, `❌ Error al procesar la imagen: ${error.message}`, m);
  } finally {
    activeDownloads--;
    processQueue();
  }
}

async function processQueue() {
  if (queue.length > 0 && activeDownloads < maxDownloads) {
    const { img, conn, m } = queue.shift();
    activeDownloads++;
    await handleBackgroundRemovalRequest(img, conn, m);
  }
}

const handler = async (m, { conn, text }) => {
  try {
    const q = m.quoted ? m.quoted : m; // Obtener mensaje citado o actual
    const mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.startsWith('image/')) {
      await conn.reply(m.chat, '❌ Proporcione una imagen válida.', m);
      return;
    }

    const img = await q.download(); // Descarga la imagen adjunta

    // Añadir el proceso a la cola y comenzar a procesar
    queue.push({ img, conn, m });
    processQueue();

  } catch (error) {
    await conn.reply(m.chat, `❌ Error: ${error.message}`, m);
  }
};

handler.command = /^sremovebg|rmbg$/i;
export default handler;
