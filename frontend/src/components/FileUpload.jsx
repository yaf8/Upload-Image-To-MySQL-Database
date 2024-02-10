import { useState } from 'react';
import axios from 'axios';
import RootURL from '../helper/URL/RootURL';

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setUploadProgress(0); // Reset progress when a new file is selected
  };

  const handleFileUpload = async () => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      await axios.post(RootURL + '/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      console.log('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error.message);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload File</button>
      {uploadProgress > 0 && (
        <div>
          <p>Upload Progress: {uploadProgress}%</p>
          <progress value={uploadProgress} max="100"></progress>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
