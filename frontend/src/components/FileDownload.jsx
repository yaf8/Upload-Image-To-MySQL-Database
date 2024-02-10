/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import axios from 'axios';
import RootURL from '../helper/URL/RootURL';

const FileDownload = () => {
  const [fileName, setFileName] = useState("");

  // Function to handle file download
  const downloadFile = async () => {
    try {
      const response = await axios.get(RootURL + `/download/${fileName}`, {
        responseType: 'blob', // Ensure response type is set to 'blob'
      });
      
      // Create a URL for the blob data
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName); // Set the download attribute
      document.body.appendChild(link);
      
      // Trigger the click event on the link to start the download
      link.click();
      
      // Cleanup: remove the temporary link and revoke the blob URL
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  // Function to handle input change
  const handleInputChange = (event) => {
    setFileName(event.target.value);
  };

  return (
    <div>
      <input
        type="text"
        value={fileName}
        onChange={handleInputChange}
        placeholder="Enter file name"
      />
      <button onClick={downloadFile}>Download File</button>
    </div>
  );
};

export default FileDownload;
