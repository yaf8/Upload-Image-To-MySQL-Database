const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
app.use(cors());
const port = 3009;

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

app.get("/", (req, res) => {
  res.send("Upload file ready!");
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
