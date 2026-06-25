#!/usr/bin/env node
// 68836a41fde9ead1a57c0156
import puppeteer from "puppeteer";
import fs from "fs";

const LOGIN_URL_PRODUCTION = "https://nucleus.mind-mesh.com/login";
const LOGIN_URL_SANDBOX = "https://test.mind-mesh.com/Login";

const COOKIE_FILE = ".plugin_cookie";

async function startLogin(environment = "prod") {
  let loginUrl;

  if (environment === "prod" || environment === "production") {
    loginUrl = LOGIN_URL_PRODUCTION;
  } else if (environment === "sandbox") {
    loginUrl = LOGIN_URL_SANDBOX;
  } else {
    console.log("❌ Invalid environment. Use 'prod' or 'sandbox'");
    return;
  }

  console.log(`🚀 Opening browser for Nucleus ${environment} login...`);

  const browser = await puppeteer.launch({
    headless: false, // show browser
    defaultViewport: null,
    channel: "chrome", // use installed Google Chrome
  });

  const page = await browser.newPage();
  await page.goto(loginUrl, { waitUntil: "networkidle2" });
  console.log('Login URL:', loginUrl);
  console.log('Page URL:', page.url());
  console.log("📝 Please log in manually in the opened browser...");

  // Wait for navigation after successful login
  await page.waitForNavigation({ waitUntil: "networkidle2" });

  // Grab cookies after login
  const cookies = await page.cookies();
  fs.writeFileSync(COOKIE_FILE, JSON.stringify(cookies, null, 2));

  console.log(`✅ Login complete! Cookies saved to ${COOKIE_FILE}`);
  await browser.close();
}

// Detect CLI command
const args = process.argv.slice(2);

if (args[0] === "login") {
  const environment = args[1] || "prod"; // default to prod if not specified
  startLogin(environment);
}
else if (args[0] === "publish") {
  import("./publish.js");
}
else if (args[0] === "build") {
  import("./build.js");

} else {
  console.log("Unknown command. Try:");
  console.log("  nucleus login");
}
