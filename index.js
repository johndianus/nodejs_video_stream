const express = require("express");
const app = express();
const fs = require("fs");

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

app.get("/video", function (req, res) {
  // Get the range from the header
  const range = req.headers.range;
  console.log(range);
  if (!range) {
    return res.status(400).send("Requires Range header");
  }

  const videoPath = "sample.mp4";
  const videoSize = fs.statSync("sample.mp4").size;

  // Parse 1MB Range
  const CHUNK_SIZE = 10 ** 6; // 1MB
  const start = Number(range.replace(/\D/g, ""));
  const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

  // Create the headers
  const contentLength = end - start + 1;
  const headers = {
    "Content-Range": `bytes ${start}-${end}/${videoSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": contentLength,
    "Content-Type": "video/mp4",
  };

  // HTTP Status 206 with Partial Content
  res.writeHead(206, headers);

  // Create Video Read Stream for this Chunk
  const videoStream = fs.createReadStream(videoPath, { start, end });

  // Stream the Chunk to the client
  videoStream.pipe(res);
});

app.listen(8000, function () {
  console.log("Listening on port 8000!");
});