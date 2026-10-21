const { spawn } = require('child_process');

const mysqldPath = 'C:\\Program Files\\MariaDB 13.0\\bin\\mysqld.exe';

console.log('Iniciando MariaDB Server...');
const db = spawn(mysqldPath, ['--console'], {
  stdio: 'inherit',
});

db.on('error', (err) => {
  console.error('Falha ao iniciar MariaDB:', err.message);
});

db.on('exit', (code) => {
  console.log('MariaDB finalizado com código:', code);
});

process.on('SIGINT', () => {
  db.kill();
  process.exit();
});

process.on('SIGTERM', () => {
  db.kill();
  process.exit();
});
