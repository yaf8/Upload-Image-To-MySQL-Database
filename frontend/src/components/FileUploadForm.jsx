/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import RootURL from '../helper/URL/RootURL';

function FileUploadForm() {
  const [file, setFile] = useState(null);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      console.log("Form Data:", formData);

      // Send the file to the server
      const response = await axios.post(RootURL + '/api/save-to-database', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log(response.data);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', marginTop: '10rem', gap: '16px' }}>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleSubmit}>Upload File</button>
    </div>
  );
}

export default FileUploadForm;
