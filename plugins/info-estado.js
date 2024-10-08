import os from 'os';
import { exec } from 'child_process';
import fs from 'fs';

// Función para formatear el uptime
function formatUptime(uptime) {
  const seconds = Math.floor(uptime % 60);
  const minutes = Math.floor((uptime / 60) % 60);
  const hours = Math.floor((uptime / 3600) % 24);
  return `${hours} horas, ${minutes} minutos, ${seconds} segundos`;
}

// Obtener las versiones de las herramientas instaladas
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

function getStorageInfo(callback) {
  if (os.platform() === 'win32') {
    exec('wmic logicaldisk get size,freespace,caption', (err, stdout) => {
      if (err) return callback('Error al obtener la información de almacenamiento.');
      
      // Formatear la salida
      const lines = stdout.trim().split('\n');
      const storage = lines.slice(1).map(line => {
        const [drive, free, total] = line.trim().split(/\s+/);
        const totalGB = (total / (1024 ** 3)).toFixed(2) + ' GB';
        const freeGB = (free / (1024 ** 3)).toFixed(2) + ' GB';
        return `Unidad ${drive}: ${freeGB} libres de ${totalGB}`;
      });
      callback(storage.join('\n'));
    });
  } else {
    exec('df -h', (err, stdout) => {
      if (err) return callback('✖️');
      
      // Formatear la salida
      const lines = stdout.trim().split('\n');
      const storage = lines.slice(1).map(line => {
        const parts = line.split(/\s+/);
        return `Dispositivo ${parts[0]}: ${parts[3]} libres de ${parts[1]}`;
      });
      callback(storage.join('\n'));
    });
  }
}

function getBatteryInfo(callback) {
  if (os.platform() === 'win32') {
    exec('WMIC PATH Win32_Battery Get EstimatedChargeRemaining', (err, stdout) => {
      if (err) return callback('✖️');
      const battery = stdout.trim();
      callback(`Carga estimada: ${battery}%`);
    });
  } else {
    exec('upower -i $(upower -e | grep BAT) | grep percentage', (err, stdout) => {
      if (err) return callback('✖️');
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
    totalMemory: (os.totalmem() / (1024 ** 3)).toFixed(2) + ' GB',
    freeMemory: (os.freemem() / (1024 ** 3)).toFixed(2) + ' GB',
    uptime: formatUptime(os.uptime()),
    osVersion: os.release(),
    loadAverage: os.loadavg().map(load => load.toFixed(2)).join(', ')
  };

  getVersions((versions) => {
    getLinuxInfo((linuxInfo) => {
      getBatteryInfo((batteryInfo) => {
        getStorageInfo((storageInfo) => {
          let infoMessage = `> *📊 Información del Sistema*\n\n`;
          infoMessage += `- 🌐 *Plataforma*: _${systemInfo.platform}_\n`;
          infoMessage += `- 💻 *Arquitectura CPU*: ${systemInfo.cpuArch}\n`;
          infoMessage += `- 🧠 *Núcleos CPU*: ${systemInfo.cpus}\n`;
          infoMessage += `- 🗄️ *Memoria Total*: ${systemInfo.totalMemory}\n`;
          infoMessage += `- 🗃️ *Memoria Libre*: ${systemInfo.freeMemory}\n`;
          infoMessage += `- ⏱️ *Tiempo de Actividad*: ${systemInfo.uptime}\n`;
          infoMessage += `- 📀 *Versión del SO*: ${systemInfo.osVersion}\n`;
          infoMessage += `- 📊 *Carga Promedio (1, 5, 15 min)*: ${systemInfo.loadAverage}\n\n`;

          infoMessage += `> *🔋 Información de Batería*\n${batteryInfo}\n\n`;

          infoMessage += `> *💾 Información de Almacenamiento*\n${storageInfo}\n\n`;

          infoMessage += `> *🛠️ Versiones de Herramientas*\n\n`;
          infoMessage += `- ☕ *Node.js*: ${versions.nodeVersion.trim()}\n`;
          infoMessage += `- 📦 *NPM*: ${versions.npmVersion.trim()}\n`;
          infoMessage += `- 🎥 *FFmpeg*: ${versions.ffmpegVersion.split('\n')[0]}\n`;
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
  });
}

const handler = async (m, { conn }) => {
  getSystemInfo((infoMessage) => {
    conn.sendMessage(m.chat, { text: infoMessage });
  });
};

handler.command = /^(sysinfo)$/i;

export default handler;
