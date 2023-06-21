import express from "express";
import path from "path";
const __dirname = path.resolve();

const app = express();
app.use(express.static(path.join(__dirname, "./public")));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/index.html");
});

app.listen(3000, async function () {
  console.log("PORT 3000 LISTENING!");
});
