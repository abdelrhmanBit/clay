import { exec } from 'child_process';

function runCommand(command, description) {
  return new Promise((resolve, reject) => {
    console.log(`Running : ${description}...`);

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ${description} :`, error);
        reject(error);
        return;
      }
      if (stderr) {
        console.error(`Stderr on execution ${description} :`, stderr);
      }
      console.log(`Result of ${description}:`, stdout);
      resolve(stdout);
    });
  });
}


async function installPythonDependencies() {
  try {
    await runCommand('pip install -U --pre "yt-dlp[default]"', 'Instalando YT-DLP');
  } catch (error) {
    console.error('Error Installing Optional Modules, Some Plugins Will Not Work.', error);
  }
}

installPythonDependencies();