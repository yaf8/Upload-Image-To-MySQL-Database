/* eslint-disable no-unused-vars */
import React from 'react';

function FileDownloadDatabase() {
  const downloadFile = async () => {
    try {
      // Replace '1' with the actual file ID you want to download
      const fileId = 1;
      
      // Make a GET request to the endpoint that serves the file
      const response = await fetch(`/api/download`);
      
      // Check if the request was successful
      if (response.ok) {
        // Extract the file name from the response headers
        const fileName = response.headers.get('Content-Disposition').split('filename=')[1];
        
        // Convert the blob response to a blob object
        const blob = await response.blob();
        
        // Create a temporary URL for the blob object
        const url = window.URL.createObjectURL(blob);
        
        // Create an anchor element to trigger the download
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', fileName || 'file');
        
        // Append the anchor element to the document body and click it to trigger the download
        document.body.appendChild(link);
        link.click();
        
        // Remove the anchor element from the document body
        document.body.removeChild(link);
      } else {
        console.error('Failed to download file:', response.statusText);
      }
    } catch (error) {
      console.error('An error occurred while downloading file:', error);
    }
  };

  return (
    <div>
      <button onClick={downloadFile}>Download File</button>
    </div>
  );
}

export default FileDownloadDatabase;
