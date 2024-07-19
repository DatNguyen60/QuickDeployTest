import fs from "fs";
import cheerio from "cheerio";
import { exec } from "child_process";
import fetch from "node-fetch";

const commitMessage = "Automatic commit message";

// Hàm thực hiện một lệnh Git
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

// Hàm chính
const main = async () => {
  try {
    // Đọc nội dung HTML từ file
    const html = fs.readFileSync("indexRaw.html", "utf8");
    const $ = cheerio.load(html);

    // Fetch dữ liệu từ API
    const response = await fetch(
      "http://35.225.195.77:1337/api/message-of-the-day"
    );
    if (!response.ok) {
      throw new Error(`Fetch error: ${response.statusText}`);
    }
    const data = await response.json();

    // Cập nhật nội dung HTML
    $("#motd-text").text(data.data.attributes.message);
    const content =
      $.html().split("<!-- endOfPushPart -->")[0] + "</body></html>";
    fs.writeFileSync("index.html", content, "utf8");
    console.log("Nội dung đã được ghi vào index.html");

    // Thực hiện các lệnh Git
    await runCommand("git add .");
    await runCommand(`git commit -m "${commitMessage}"`);
    await runCommand("git push origin"); // Thay 'main' bằng nhánh chính của bạn nếu cần
    console.log("Commit và push thành công!");
  } catch (error) {
    console.error("Có lỗi xảy ra:", error);
  }
};

// Chạy hàm chính
main();
