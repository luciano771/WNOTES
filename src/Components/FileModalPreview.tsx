import React, { useRef, useEffect } from "react";
import Viewer from "viewerjs"; // Importar Viewer.js
import "viewerjs/dist/viewer.css"; // Estilos de Viewer.js

type FileModalPreviewProps = {
  show: boolean;
  fileName: string;
};

const FileModalPreview: React.FC<FileModalPreviewProps> = ({
  show,
  fileName,
}) => {
  const viewerRef = useRef<HTMLDivElement | null>(null); // Referencia al contenedor de Viewer.js
  const viewerInstanceRef = useRef<Viewer | null>(null); // Instancia de Viewer.js

  const fileExtension = fileName.split(".").pop()?.toLowerCase();

  // Inicializar Viewer.js
  useEffect(() => {
    if (viewerRef.current && show) {
      viewerInstanceRef.current = new Viewer(viewerRef.current, {
        inline: false, // Mostrar como modal
        navbar: false, // Ocultar barra de navegación
        toolbar: true, // Mostrar herramientas de zoom
        zoomable: true, // Habilitar zoom
        rotatable: true, // Habilitar rotación
        scalable: true, // Habilitar escalado
      });
    }
    viewerInstanceRef.current?.show(); // Mostrar directamente
    // Limpiar instancia al cerrar
    return () => {
      viewerInstanceRef.current?.destroy();
      viewerInstanceRef.current = null;
    };
  }, [show]);

  useEffect(() => {
    if (!["jpg", "jpeg", "png"].includes(fileExtension || "")) {
      // Abrir automáticamente el archivo en una nueva ventana si no es una imagen
      window.open(`./Chat/${fileName}`, "_blank");
    }
  }, [fileName, fileExtension]);

  return (
    <div>
      {["jpg", "jpeg", "png"].includes(fileExtension || "") && (
        <div ref={viewerRef}>
          {/* Imagen que será manejada por Viewer.js */}
          <img
            src={`./Chat/${fileName}`}
            alt={fileName}
            hidden={true} // La imagen permanece oculta
          />
        </div>
      )}
    </div>
  );
};

export default FileModalPreview;
