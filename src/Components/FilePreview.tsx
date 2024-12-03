import React, { useState } from "react";
import FileModalPreview from "./FileModalPreview";

type FilePreviewProps = {
  content: string;
};

const FilePreview: React.FC<FilePreviewProps> = ({ content }) => {
  const [showModal, setShowModal] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const extractFileName = (text: string): string | null => {
    const match = text.match(/[\w.-]+\.(pdf|doc|docx|jpeg|jpg|png)/i);
    return match ? match[0] : null;
  };

  const fileNameExtracted = extractFileName(content);

  if (!fileNameExtracted) return null;

  const fileExtension = fileNameExtracted.split(".").pop()?.toLowerCase();

  const handlePreviewClick = () => {
    setFileName(fileNameExtracted);
    setShowModal(true);
  };

  return (
    <>
      {["jpg", "jpeg", "png"].includes(fileExtension || "") ? (
        <img
          src={`./Chat/${fileNameExtracted}`}
          alt={fileNameExtracted}
          style={{
            maxWidth: "100%",
            maxHeight: "200px",
            marginTop: "10px",
            cursor: "pointer",
            borderRadius: "5px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          onClick={handlePreviewClick}
        />
      ) : (
        <button
          className="btn btn-outline-primary btn-sm mt-2"
          onClick={handlePreviewClick}
        >
          Ver Archivo: {fileNameExtracted}
        </button>
      )}

      {fileName && <FileModalPreview show={showModal} fileName={fileName} />}
    </>
  );
};

export default FilePreview;
