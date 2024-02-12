import React from "react";
import axios from "axios";
import RootURL from "../helper/URL/RootURL";

function FileDownloadDatabase() {
  const [imageSrc, setImageSrc] = React.useState(null);
  const [dbId, setDbId] = React.useState(0);

  const downloadFile = async () => {
    try {
      // Make a GET request to the endpoint that serves the image file
      const response = await axios.get(
        `${RootURL}/api/download-from-database/${dbId}`,
        {
          responseType: "blob", // Set the response type to blob
        }
      );

      // Check if the request was successful
      if (response.status === 200) {
        // Create a temporary URL for the blob object
        const url = window.URL.createObjectURL(new Blob([response.data]));
        setImageSrc(url);
      } else {
        console.error("Failed to download file:", response.statusText);
      }
    } catch (error) {
      console.error("An error occurred while downloading file:", error);
    }
  };

  return (
    <div>
      <input
        type="number"
        value={dbId}
        onChange={(e) => setDbId(e.target.value)}
      />
      <button onClick={downloadFile}>Download Image</button>
      <br />
      {imageSrc && (
        <img
          src={imageSrc}
          style={{ width: "200px", height: "200px" }}
          alt="Downloaded Image"
        />
      )}
    </div>
  );
}

export default FileDownloadDatabase;
