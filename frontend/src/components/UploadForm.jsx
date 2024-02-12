/* eslint-disable no-unused-vars */
import React, { useState } from "react";
import axios from "axios";
import RootURL from "../helper/URL/RootURL";

function UploadForm() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jsonData, setJsonData] = useState({});

  const handleFileInputChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Check if the file type starts with 'image/'
      if (file.type && file.type.startsWith("image/")) {
        setSelectedImage(file); // Set the file as the selected image
      } else {
        console.error("Selected file is not an image.");
        
        setSelectedImage(null);
        
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setJsonData({
        name: name,
        email: email,
      });
      const formData = new FormData();
      formData.append("image", selectedImage);
      formData.append("jsonData", JSON.stringify(jsonData));

      console.log(selectedImage);

      const response = await axios.post(RootURL + "/api/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      console.log(response.data);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };

  return (
    <div
      style={{
        marginBottom: 17,
        gap: "16px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <input
        type="text"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input type="file" onChange={handleFileInputChange} />
      <button onClick={handleSubmit}>Upload Data</button>
    </div>
  );
}

export default UploadForm;
