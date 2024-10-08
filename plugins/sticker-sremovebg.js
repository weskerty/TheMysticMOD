import { BackgroundRemoval } from '@imgly/background-removal-node'; 
import fs from 'fs'; 
import path from 'path'; 
import { sticker } from '../src/libraries/sticker.js'; // remover


const TempDirectory = path.join(process.cwd(), 'src/tmp/');


const generateTempFileName = () => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.]/g, ''); /
  return `temp-${timestamp}.png`;
};

const handler = async (m, { conn, text }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.sticker_sremovebg;

  try {
    
    await m.reply(tradutor.texto2 || 'Generando sticker...');

    const q = m.quoted ? m.quoted : m; 
    const mime = (q.msg || q).mimetype || '';


    if (!mime || !mime.startsWith('image/')) {
      throw new Error(tradutor.texto1 || 'No se proporcionó una imagen válida');
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

  } catch (e) {
    console.error(e); 

    await m.reply(`Error al generar el sticker: ${e.message || 'Error desconocido'}`);
  }
};

handler.command = /^sremovebg|rmbg$/i;
export default handler;
