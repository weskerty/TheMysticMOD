import { BackgroundRemoval } from '@imgly/background-removal-node';
import fs from 'fs';
import uploadImage from '../src/libraries/uploadImage.js';
import { sticker } from '../src/libraries/sticker.js';

const handler = async (m, { conn, text }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.sticker_sremovebg;

  try {
    const q = m.quoted ? m.quoted : m;
    const mime = (q.msg || q).mimetype || '';
    const img = await q.download();

    const imagePath = './tmp/image.png';
    fs.writeFileSync(imagePath, img);

    const outputPath = './tmp/removed-bg.png'; 
    await BackgroundRemoval.fromFile(imagePath).toFile(outputPath);

    const stickerr = await sticker(false, outputPath, global.packname, global.author);

    conn.sendFile(m.chat, stickerr, 'sticker.webp', '', m, { asSticker: true });

    fs.unlinkSync(imagePath);
    fs.unlinkSync(outputPath);

  } catch (e) {
    console.error(e);
    m.reply(tradutor.texto1); 
  }
};

handler.command = /^sremovebg|rmbg$/i;
export default handler;
