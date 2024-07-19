import fs from "fs";
import cheerio from "cheerio";
import { exec } from "child_process";
import fetch from "node-fetch";
import express from "express";
const app = express();
const port = 3000;

const commitMessage = "Automatic commit message";

const runCommand = (command) => {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(`Error: ${stderr}`);
      } else {
        resolve(stdout);
      }
    });
  });
};

const main = async () => {
  try {
    const html = fs.readFileSync("indexRaw.html", "utf8");
    const $ = cheerio.load(html);

    const response = await fetch(
      "http://35.225.195.77:1337/api/message-of-the-day"
    );
    if (!response.ok) {
      throw new Error(`Fetch error: ${response.statusText}`);
    }
    const data = await response.json();

    $("#motd-text").text(data.data.attributes.message);
    const content = $.html();
    fs.writeFileSync("index.html", content, "utf8");
    console.log("Nội dung đã được ghi vào index.html");

    await runCommand("git add .");
    await runCommand(`git commit -m "${commitMessage}"`);
    await runCommand("git push origin");
    console.log("Commit và push thành công!");
  } catch (error) {
    console.error("Có lỗi xảy ra:", error);
  }
};

app.use(express.json());

app.post("/webhook", (req, res) => {
  const data = req.body;

  //   console.log("Received webhook data:", data);
  main();

  res.status(200).send("Webhook received");
});

app.listen(port, () => {
  console.log(`Server is listening on http://35.225.195.77:${port}`);
});
