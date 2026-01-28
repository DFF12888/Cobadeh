const { spawn } = require("child_process");

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startBot = (filename) => {

  console.log(`Menjalankan ${filename}...`);

  const bot = spawn("node", [filename], { stdio: "inherit" });

  bot.on("close", (code) => {

    console.log(`${filename} selesai dengan code ${code}`);

  });

};

const runBots = async () => {

  startBot("tpa1.js");

  await delay(3000);

  startBot("tpa2.js");

  await delay(3000);
  
  startBot("tpa3.js");

  await delay(3000);

  startBot("Jeriko1.js");

  await delay(3000);
  
   
};


runBots();
