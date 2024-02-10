import "./App.css";
import FileDownload from "./components/FileDownload";
import FileUpload from "./components/FileUpload";

function App() {
  return (
    <>
    <div style={{display: "flex", flexDirection: "column", margin: "16px", gap: "16px"}}>

      <FileUpload />
      <FileDownload />
    </div>
    </>
  );
}

export default App;
