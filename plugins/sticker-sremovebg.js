import { BackgroundRemoval } from '@imgly/background-removal-node'; 
import fs from 'fs'; 
import path from 'path'; 
import { sticker } from '../src/libraries/sticker.js'; 
const TempDirectory = path.join(process.cwd(), 'src/tmp/');

const generateTempFileName = () => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.]/g, ''); 
  return `temp-${timestamp}.png`;
};

if (!fs.existsSync(TempDirectory)) {
  fs.mkdirSync(TempDirectory, { recursive: true });
}

const handler = async (m, { conn, text }) => {
  try {
    await m.reply('🛠️ Generando sticker...');

    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';

    if (!mime || !mime.startsWith('image/')) {
      await conn.reply(m.chat, '❌ Por favor, envíe una imagen válida.', m);
      return;
    }

    const img = await q.download();

    const inputPath = path.join(TempDirectory, generateTempFileName());
    const outputPath = path.join(TempDirectory, generateTempFileName());

    fs.writeFileSync(inputPath, img);

    await BackgroundRemoval.fromFile(inputPath).toFile(outputPath);

    const stickerResult = await sticker(false, outputPath, global.packname, global.author);

    await conn.sendFile(m.chat, stickerResult, 'sticker.webp', '', m, { asSticker: true });

    fs.unlinkSync(inputPath);
    fs.unlinkSync(outputPath);

  } catch (error) {
    console.error('Error:', error); 
    await conn.reply(m.chat, `❌ Error al generar el sticker: ${error.message}`, m); 
  }
};

handler.command = /^sremovebg|rmbg$/i;
export default handler;
