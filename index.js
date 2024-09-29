// app.js

const express = require("express");
const multer = require("multer");
const fs = require("fs");
const UglifyJS = require("uglify-js");
const path = require("path");

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse form data and JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve static files like CSS
app.use(express.static(path.join(__dirname, "public")));

// Your existing routes here...

// Set up multer for file upload
const upload = multer({ dest: "uploads/" });

// Serve the HTML form for file upload or pasting code
app.get("/", (req, res) => {
  res.send(`
  <!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>JavaScript Minifier</title>
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <header>
    <h1>JavaScript Minifier</h1>
    <p>Upload or paste your JavaScript code for minification.</p>
  </header>

  <main>
    <section>
      <h2>Upload JavaScript File</h2>
      <form id="uploadForm" action="/minify-file" method="post" enctype="multipart/form-data">
        <label for="jsFile">Choose a file to upload:</label><br>
        <input type="file" id="jsFile" name="jsFile" accept=".js" required><br><br>
        <button type="submit">Upload and Minify!</button>
      </form>
    </section>

    <section>
      <h3>OR</h3>
      <h2>Paste JavaScript Code</h2>
      <form id="pasteForm" action="/minify-text" method="post">
        <label for="jsCode">Enter your JavaScript code:</label><br>
        <textarea id="jsCode" name="jsCode" rows="10" cols="50" placeholder="Paste your code here..." required></textarea><br><br>
        <button type="submit">Minify Pasted Code!</button>
      </form>
    </section>
  </main>

  <footer>
    <p>&copy; 2024 JavaScript Minifier. All rights reserved.</p>
  </footer>
</body>
</html>
  `);
});

// Handle file upload and minification
app.post("/minify-file", upload.single("jsFile"), (req, res) => {
  const filePath = req.file.path;
  const originalName = req.file.originalname;
  const outputFileName = `${path.basename(originalName, ".js")}.min.js`;

  // Read the uploaded JavaScript file
  fs.readFile(filePath, "utf8", (err, code) => {
    if (err) {
      return res.status(500).send(`Error reading file: ${err.message}`);
    }

    // Minify the JavaScript code
    const result = UglifyJS.minify(code);

    if (result.error) {
      return res.status(500).send(`Error during minification: ${result.error}`);
    }

    // Send the minified code as a downloadable file
    res.setHeader(
      "Content-disposition",
      `attachment; filename=${outputFileName}`
    );
    res.setHeader("Content-type", "application/javascript");
    res.send(result.code);

    // Clean up the uploaded file
    fs.unlink(filePath, (err) => {
      if (err) console.error(`Error deleting file: ${err.message}`);
    });
  });
});

// Handle pasted text minification
app.post("/minify-text", (req, res) => {
  const jsCode = req.body.jsCode;

  if (!jsCode) {
    return res.status(400).send("No JavaScript code provided.");
  }

  // Minify the JavaScript code from textarea
  const result = UglifyJS.minify(jsCode);

  if (result.error) {
    return res.status(500).send(`Error during minification: ${result.error}`);
  }

  // Send the minified code as plain text
  res.setHeader("Content-disposition", "attachment; filename=minified.js");
  res.setHeader("Content-type", "application/javascript");
  res.send(result.code);
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
