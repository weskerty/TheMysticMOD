import os from 'os';
import { exec } from 'child_process';
import fs from 'fs';

function formatUptime(uptime) {
  const seconds = Math.floor(uptime % 60);
  const minutes = Math.floor((uptime / 60) % 60);
  const hours = Math.floor((uptime / 3600) % 24);
  return `${hours} horas, ${minutes} minutos, ${seconds} segundos`;
}

function getVersions(callback) {
  exec('node -v', (err, nodeVersion) => {
    if (err) nodeVersion = '✖️';
    exec('npm -v', (err, npmVersion) => {
      if (err) npmVersion = '✖️';
      exec('ffmpeg -version', (err, ffmpegVersion) => {
        if (err) ffmpegVersion = '✖️';
        exec('python --version || python3 --version || py --version', (err, pythonVersion) => {
          if (err) pythonVersion = '✖️';
          exec('pip --version || pip3 --version', (err, pipVersion) => {
            if (err) pipVersion = '✖️';
            exec('choco -v', (err, chocoVersion) => {
              if (err) chocoVersion = '✖️';
              callback({ nodeVersion, npmVersion, ffmpegVersion, pythonVersion, pipVersion, chocoVersion });
            });
          });
        });
      });
    });
  });
}

function getLinuxInfo(callback) {
  exec('cat /etc/os-release', (err, osInfo) => {
    if (err) osInfo = '✖️';
    callback(osInfo.trim());
  });
}

function getStorageInfo() {
  const diskInfo = [];
  const drives = os.platform() === 'win32' ? 'wmic logicaldisk get size,freespace,caption' : 'df -h';
  
  exec(drives, (err, stdout) => {
    if (err) {
      console.error('Error al obtener la información de almacenamiento:', err);
    } else {
      diskInfo.push(stdout.trim());
    }
  });

  return diskInfo;
}

function getBatteryInfo(callback) {
  if (os.platform() === 'win32') {
    exec('WMIC PATH Win32_Battery Get EstimatedChargeRemaining', (err, stdout) => {
      if (err) return callback('Batería no disponible');
      const battery = stdout.trim();
      callback(`Carga estimada: ${battery}%`);
    });
  } else {
    exec('upower -i $(upower -e | grep BAT) | grep percentage', (err, stdout) => {
      if (err) return callback('Batería no disponible');
      const battery = stdout.split(':')[1].trim();
      callback(`Carga estimada: ${battery}`);
    });
  }
}

async function getSystemInfo(callback) {
  const systemInfo = {
    platform: os.platform(),
    cpuArch: os.arch(),
    cpus: os.cpus().length,
    totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB', // Total RAM en GB
    freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB',   // RAM libre en GB
    uptime: formatUptime(os.uptime()),                             // Tiempo de actividad
    osVersion: os.release(),                                       // Versión del SO
    loadAverage: os.loadavg().map(load => load.toFixed(2)).join(', ') // Carga promedio
  };

  getVersions((versions) => {
    getLinuxInfo((linuxInfo) => {
      getBatteryInfo((batteryInfo) => {
        const storageInfo = getStorageInfo();

        let infoMessage = `> *📊 Información del Sistema*\n\n`;
        infoMessage += `- 🌐 *Plataforma*: _${systemInfo.platform}_\n`;
        infoMessage += `- 💻 *Arquitectura CPU*: ${systemInfo.cpuArch}\n`;
        infoMessage += `- 🧠 *Núcleos CPU*: ${systemInfo.cpus}\n`;
        infoMessage += `- 🗄️ *Memoria Total*: ${systemInfo.totalMemory}\n`;
        infoMessage += `- 🗃️ *Memoria Libre*: ${systemInfo.freeMemory}\n`;
        infoMessage += `- ⏱️ *Tiempo de Actividad*: ${systemInfo.uptime}\n`;
        infoMessage += `- 📀 *Versión del SO*: ${systemInfo.osVersion}\n`;
        infoMessage += `- 📊 *Carga Promedio (1, 5, 15 min)*: ${systemInfo.loadAverage}\n\n`;

        infoMessage += `> *🔋 Batería*\n${batteryInfo}\n\n`;

        infoMessage += `> *💾 Almacenamiento*\n${storageInfo.join('\n')}\n\n`;

        infoMessage += `> *🛠️ Version Herramientas*\n\n`;
        infoMessage += `- ☕ *Node.js*: ${versions.nodeVersion.trim()}\n`;
        infoMessage += `- 📦 *NPM*: ${versions.npmVersion.trim()}\n`;
        infoMessage += `- 🎥 *FFmpeg*: ${versions.ffmpegVersion.split('\n')[0]}\n`; // Solo primera linea
        infoMessage += `- 🐍 *Python*: ${versions.pythonVersion.trim()}\n`;
        infoMessage += `- 📦 *PIP*: ${versions.pipVersion.trim()}\n`;
        infoMessage += `- 🍫 *Chocolatey*: ${versions.chocoVersion.trim()}\n\n`;

        if (os.platform() === 'linux') {
          infoMessage += `> *🐧 Distribución Linux*\n${linuxInfo}\n`;
        }

        callback(infoMessage);
      });
    });
  });
}

const handler = async (m, { conn }) => {
  getSystemInfo((infoMessage) => {
    conn.sendMessage(m.chat, { text: infoMessage });
  });
};

handler.command = ['alive', 'host', 'info']

export default handler;
