const { exec } = require("child_process");
const path = require("path");

module.exports = async (req, res) => {
  try {
    const scriptPath = path.join(process.cwd(), "api", "ktc_db_dly_load.py");
    exec(`python ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        return res.status(500).json({ error: error.message });
      }
      if (stderr) {
        console.error(`stderr: ${stderr}`);
        return res.status(500).json({ error: stderr });
      }
      console.log(`stdout: ${stdout}`);
      res
        .status(200)
        .json({ message: "Script executed successfully", output: stdout });
    });
  } catch (error) {
    console.error("Failed to execute script:", error);
    res.status(500).json({ error: "Failed to execute script" });
  }
};
