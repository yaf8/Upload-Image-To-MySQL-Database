const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');
const mysql = require("mysql");
const cookieParser = require("cookie-parser");

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

const uploadDir = path.join(__dirname, 'uploads');

// Create the 'uploads' folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Function to generate the file name
const generateFileName = (file) => {
  const filename = (file.originalname + "_" + Date.now() + path.extname(file.originalname));
  console.log('Generated file name:', filename);
  return filename;
};

// Set up multer to handle file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, generateFileName(file)); // Call the function to generate the file name
  }
});

const upload = multer({ storage: storage });

// Handle POST requests with file uploads
app.post('/upload', upload.single('file'), (req, res) => {
  // Access the uploaded file using req.file
  if (req.file) {
    // File uploaded successfully
    const uploadedFilePath = path.join(uploadDir, req.file.filename);
    console.log('File uploaded successfully:', req.file.originalname);
    console.log('Uploaded file directory:', uploadedFilePath);
    res.status(200).json({ message: 'File uploaded successfully' });
  } else {
    // No file was provided
    res.status(400).json({ message: 'No file provided' });
  }
})

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
        res.status(500).json({ message: 'Error downloading file' });
      }

      console.log("File downloaded successfully");
    });
  } else {
    // If the file doesn't exist, return a 404 Not Found response
    res.status(404).json({ message: 'File not found' });
  }
});



app.post("/api/save-to-database", upload.single('file'), (req, res) => {
  try {
    // Access the uploaded file using req.file
    if (req.file) {
      const { pdf, image, json } = req.body; // Assuming you have other data along with the file

      // Read the file data from the uploaded file
      const fileData = fs.readFileSync(req.file.path);

      // Prepare the SQL query to insert the file data into the database
      const sql = "INSERT INTO files (pdf, image, json) VALUES (?, ?, ?)";
      
      // Execute the SQL query
      db.query(sql, [fileData, image, json], (err, result) => {
        if (err) {
          console.error("Error inserting file into database:", err);
          res.status(500).json({ message: 'Error saving file to database' });
        } else {
          console.log("File inserted into database successfully");
          res.status(200).json({ message: 'File saved to database successfully' });
        }
      });
    } else {
      // No file was provided
      res.status(400).json({ message: 'No file provided' });
    }
  } catch (error) {
    console.error("An error occurred while saving file to database:", error);
    res.status(500).json({ message: 'Error saving file to database' });
  }
});

app.get("/api/download-from-database", (req, res) => {
  const fileId = 12;

  // Query the database to retrieve the blob data based on the file ID
  const sql = "SELECT * FROM files WHERE id = ?";
  db.query(sql, [fileId], (err, result) => {
    if (err) {
      console.error("Error retrieving file from database:", err);
      return res.status(500).json({ message: 'Error retrieving file from database' });
    }

    if (result.length === 0) {
      // If no file is found with the provided ID, return a 404 Not Found response
      return res.status(404).json({ message: 'File not found' });
    }

    // Extract the blob data from the database result
    const fileData = result[0].pdf; // Assuming the file is stored in a column named 'pdf'

    // Set the appropriate content type header based on the file type
    res.setHeader('Content-Type', 'application/pdf'); // Adjust as needed for different file types

    // Send the blob data as the response body
    res.send(fileData);
  });
});


app.get("/", (req, res) => {
  res.send("Upload file ready!");
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
