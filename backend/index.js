const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const mysql = require("mysql");
const cookieParser = require("cookie-parser");
const mysql2 = require("mysql2/promise");

const app = express();
const port = 4002;

app.use(express.json());
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "http://localhost:5175",
      "http://localhost:5176",
      "http://localhost:5177",
    ],
    methods: ["POST", "GET", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(cookieParser());

//local database
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "upload_blob",
});

try {
  db.connect((err) => {
    if (err) {
      console.error("Database connection error: " + err.stack);
      return;
    }
    console.log("Connected to MySQL database");
  });
} catch (err) {
  console.log("Database connection error: " + err.stack);
}

// Create a connection pool
const pool = mysql2.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "upload_blob",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const uploadDir = path.join(__dirname, "uploads");

// Create the 'uploads' folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Function to generate the file name
const generateFileName = (file) => {
  const filename =
    file.originalname + "_" + Date.now() + path.extname(file.originalname);
  console.log("Generated file name:", filename);
  return filename;
};

// Set up multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, generateFileName(file)); // Call the function to generate the file name
  },
});

const upload = multer({ storage: storage });

// Handle POST requests with file uploads
app.post("/upload", upload.single("file"), (req, res) => {
  // Access the uploaded file using req.file
  if (req.file) {
    // File uploaded successfully
    const uploadedFilePath = path.join(uploadDir, req.file.filename);
    console.log("File uploaded successfully:", req.file.originalname);
    console.log("Uploaded file directory:", uploadedFilePath);
    res.status(200).json({ message: "File uploaded successfully" });
  } else {
    // No file was provided
    res.status(400).json({ message: "No file provided" });
  }
});

app.get("/download/:fileName", (req, res) => {
  const fileName = req.params.fileName;
  const filePath = path.join(uploadDir, fileName);

  // Check if the file exists
  if (fs.existsSync(filePath)) {
    // Send the file as a response
    res.download(filePath, fileName, (err) => {
      if (err) {
        // If an error occurs while sending the file, log the error
        console.error("Error downloading file:", err);
        res.status(500).json({ message: "Error downloading file" });
      }

      console.log("File downloaded successfully");
    });
  } else {
    // If the file doesn't exist, return a 404 Not Found response
    res.status(404).json({ message: "File not found" });
  }
});

app.post("/api/save-to-database", upload.single("file"), async (req, res) => {
  try {
    // Access the uploaded file using req.file
    if (req.file) {
      const { pdf, image, json } = req.body; // Assuming you have other data along with the file

      // Read the file data from the uploaded file
      const fileData = fs.readFileSync(req.file.path);

      // Prepare the SQL query to insert the file data into the database
      const sql = "INSERT INTO files (image, pdf,  json) VALUES (?, ?, ?)";

      const connection = await pool.getConnection();

      const [result] = await connection.query(sql, [fileData, image, json]);

      console.log("File inserted into database successfully", result);
      return res
        .status(200)
        .json({
          message: "File saved to database successfully : " + result.insertId,
        });
    } else {
      // No file was provided
      res.status(400).json({ message: "No file provided" });
    }
  } catch (error) {
    console.error("An error occurred while saving file to database:", error);
    res.status(500).json({ message: "Error saving file to database" });
  }
});

app.get("/api/download-from-database/:fileId", async (req, res) => {
  try {
    const fileId = req.params.fileId;

    // Query the database to retrieve the blob data based on the file ID
    const sql = "SELECT * FROM files WHERE id = ?";

    const connection = await pool.getConnection();

    const [result] = await connection.query(sql, [fileId]);

    connection.release();

    console.log("File retrieved from database successfully");

    if (result.length === 0) {
      // If no file is found with the provided ID, return a 404 Not Found response
      return res.status(404).json({ message: "File not found" });
    }

    // Extract the blob data from the database result
    const fileData = result[0].image; // Assuming the file is stored in a column named 'image'

    // Set the appropriate content type header based on the file type
    res.setHeader("Content-Type", "image/jpeg"); // Adjust as needed for different file types

    // Send the blob data as the response body
    return res.send(fileData);
  } catch (err) {
    console.error("Error retrieving file from database:", err);
    return res
      .status(500)
      .json({ message: "Error retrieving file from database" });
  }
});

//WORKING API (can receive file and data from frontend)
app.post(
  "/api/upload",
  upload.fields([{ name: "image" }, { name: "jsonData" }]),
  async (req, res) => {
    try {
      const imageFile = req.files["image"][0]; // Access the image file
      const jsonData = JSON.parse(req.body.jsonData); // Access the JSON data

      // Your logic to handle the image file and JSON data

      console.log("jsonData:", jsonData);
      console.log("imageFile:", imageFile); // Log the image file path and buffer to the console
      console.log("name : ", jsonData.name); // Log the name

      console.log("fieldNames:", imageFile.fieldname);
      console.log("originalName:", imageFile.originalname);
      console.log("size:", imageFile.size);
      console.log("mimetype:", imageFile.mimetype);

      const fileData = fs.readFileSync(imageFile.path);

      console.log("fileData:", fileData);

      const connection = await pool.getConnection();
      const userQuery = "INSERT INTO users (name, email) VALUES (?, ?)";
      try {
        const [result] = await connection.query(userQuery, [
          jsonData.name,
          jsonData.email,
        ]);

        const userId = result.insertId;

        const fileQuery =
          "INSERT INTO files_meta (file_data, file_name, mime_type, user_id) VALUES (?, ?, ?, ?)";
        const [fileResult] = await connection.query(fileQuery, [
          fileData,
          imageFile.originalname,
          imageFile.mimetype,
          userId,
        ]);
        console.log("fileResult:", fileResult);

        res
          .status(200)
          .json({ message: "File and JSON data uploaded successfully" });
      } catch (error) {
        console.error("Error saving file to database:", error);
        res.status(500).json({ message: "Error saving file to database" });
      } finally {
        connection.release();
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.post("/api/upload-form", upload.single("file"), async (req, res) => {
  const { name, email } = req.body;
  const file = req.file;

  console.log("Received data:", { name, email, file });

  // Process the received data further (e.g., save to database)

  res.sendStatus(200);
});

app.get("/", (req, res) => {
  res.send("Upload file ready!");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
