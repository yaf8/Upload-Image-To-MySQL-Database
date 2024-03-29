/* eslint-disable no-unused-vars */
import "./App.css";
import FileDownload from "./components/FileDownload";
import FileDownloadDatabase from "./components/FileDownloadDatabase";
import FileUpload from "./components/FileUpload";
import FileUploadForm from "./components/FileUploadForm";
import UploadForm from "./components/UploadForm";

function App() {
  return (
    <>
    <div style={{ marginBottom: 6, paddin: 4, gap: 6 }}>
      <UploadForm />
    </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          margin: "16px",
          gap: "16px",
        }}
      >
        {/* <FileUpload /> */}
        {/* <FileDownload /> */}
        <FileUploadForm />
        <div style={{ margin: 4, gap: "16px" }}>
          <FileDownloadDatabase />
        </div>
      </div>
    </>
  );
}

export default App;
