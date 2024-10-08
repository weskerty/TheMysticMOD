import { execSync } from 'child_process';
import fs from 'fs';

const handler = async (m, { conn, text }) => {
  const datas = global;
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje;
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`));
  const tradutor = _translate.plugins.propietario_actualizar;

  await conn.reply(m.chat, '⌛Comprobando...', m);

  try {
    const stdout = execSync('git pull' + (m.fromMe && text ? ' ' + text : ''));
    let messager = stdout.toString();
    
    if (messager.includes('Already up to date.')) {
      messager = tradutor.texto1;
    }
    
    if (messager.includes('Updating')) {
      messager = tradutor.texto2 + stdout.toString();

      await conn.reply(m.chat, '⏳ Install', m);
      execSync('npm install --force');
    }

    conn.reply(m.chat, messager, m);
  } catch {
    try {
      const status = execSync('git status --porcelain');
      if (status.length > 0) {
        const conflictedFiles = status
          .toString()
          .split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            if (line.includes('.npm/') || line.includes('.cache/') || line.includes('tmp/') || line.includes('MysticSession/') || line.includes('npm-debug.log')) {
              return null;
            }
            return '*→ ' + line.slice(3) + '*';
          })
          .filter(Boolean);
        if (conflictedFiles.length > 0) {
          const errorMessage = `${tradutor.texto3} \n\n${conflictedFiles.join('\n')}.*`;
          await conn.reply(m.chat, errorMessage, m);
        }
      }
    } catch (error) {
      console.error(error);
      let errorMessage2 = tradutor.texto4;
      if (error.message) {
        errorMessage2 += '\n*- Mensaje de error:* ' + error.message;
      }
      await conn.reply(m.chat, errorMessage2, m);
    }
  }
};

handler.command = /^(update|actualizar|gitpull)$/i;
handler.rowner = true;

export default handler;
