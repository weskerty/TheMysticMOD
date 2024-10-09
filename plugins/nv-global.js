// Aquien sabe que tan eficiente sea agregar tantos... El que encuentre una manera de mejorarlo bienvenido. Buscar la palabra en el directorio creeria es aun peor.

const handler = (m) => m;

handler.all = async function(m, {conn}) {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.nv_global

  const chat = global.db.data.chats[m.chat];

  // if ((m.mtype === 'groupInviteMessage' || m.text.startsWith('https://chat') || m.text.startsWith('Abre este enlace')) && !m.isBaileys && !m.isGroup && !chat.isBanned && !m.fromMe) {
    // const join = `${tradutor.texto1[0]} @${m.sender.split('@')[0]}, ${tradutor.texto1[1]} https://chat.whatsapp.com/LjJbmdO0qSDEKgB60qivZj`.trim();
    // this.sendMessage(m.chat, {text: join.trim(), mentions: [...join.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net'), contextInfo: {forwardingScore: 9999999, isForwarded: true, mentionedJid: [...join.matchAll(/@([0-9]{5,16}|0)/g)].map((v) => v[1] + '@s.whatsapp.net'), "externalAdReply": {"showAdAttribution": true, "containsAutoReply": true, "renderLargerThumbnail": true, "title": global.titulowm2, "containsAutoReply": true, "mediaType": 1, "thumbnail": global.imagen1, "mediaUrl": `https://weskerty.github.io/MysticTools/`, "sourceUrl": `https://weskerty.github.io/MysticTools/`}}}, {quoted: m});
  // }


  if (!chat.isBanned && m.text.match(/(bye|chau)/gi)) { 
    if (!db.data.chats[m.chat].audios) return;
    if (!db.data.settings[this.user.jid].audios_bot && !m.isGroup) return;
    const vn = './src/assets/audio/bye.mp4'; 
    mconn.conn.sendPresenceUpdate('recording', m.chat);
    mconn.conn.sendMessage(m.chat, {video: {url: vn}, fileName: 'bye.mp4', mimetype: 'video/mp4', ptv: true}, {quoted: m});
  }

  if (!chat.isBanned && m.text.match(/(hola)/gi)) { 
    if (!db.data.chats[m.chat].audios) return;
    if (!db.data.settings[this.user.jid].audios_bot && !m.isGroup) return;
    const vn = './src/assets/audio/hola.mp4'; 
    mconn.conn.sendPresenceUpdate('recording', m.chat);
    mconn.conn.sendMessage(m.chat, {video: {url: vn}, fileName: 'hola.mp4', mimetype: 'video/mp4', ptv: true}, {quoted: m});
  }


  return !0;
};
export default handler;
