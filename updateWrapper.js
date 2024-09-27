const cron = require("node-cron");
const { fetchAndUpdateSleeperStats } = require("./update_sleeper_stats");

// Function to check if it's Sunday
const isSunday = () => {
  return new Date().getDay() === 0;
};

// Schedule for 6 AM CT (11 AM UTC) every day except Sunday
cron.schedule("0 11 * * 1-6", () => {
  console.log("Running update at 6 AM CT");
  fetchAndUpdateSleeperStats();
});

// Schedule for 11 PM CT (5 AM UTC next day) every day except Sunday
cron.schedule("0 5 * * 2-7", () => {
  console.log("Running update at 11 PM CT");
  fetchAndUpdateSleeperStats();
});

// Schedule for every 30 minutes on Sunday
cron.schedule("*/30 * * * 0", () => {
  console.log("Running update (Sunday schedule)");
  fetchAndUpdateSleeperStats();
});

console.log("Update scheduler is running");
