import express from "express";
import path from "path";
import dotenv from "dotenv";
import { getSilgum } from "./macro.js";

dotenv.config();

const __dirname = path.resolve();

const app = express();
app.use(express.static(path.join(__dirname, "./public")));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

// 저장 저장
app.post("/silgum", async (req, res) => {
  await getSilgum();
});

app.listen(7777, async function () {
  console.log("PORT 7777 LISTENING!");
});
