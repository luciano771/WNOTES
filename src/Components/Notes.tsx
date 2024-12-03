import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css"; // Estilos de Bootstrap
import "react-datepicker/dist/react-datepicker.css"; // Estilos para el DatePicker
import DatePicker from "react-datepicker"; // DatePicker para seleccionar la fecha
import "./DatePicker.css";
import "./Notes.css";
import FilePreview from "./FilePreview"; // Importa el componente

// Tipos para los datos
type Chat = {
  date: string;
  time: string;
  name: string;
  content: string;
};

type Week = {
  [key: string]: Chat[];
};

type Data = {
  [key: string]: Week;
};

const Notas: React.FC = () => {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<string | null>(null); // Semana seleccionada
  const [selectedMonth, setSelectedMonth] = useState<string | null>(null); // Mes seleccionado
  const [selectedDate, setSelectedDate] = useState<Date | null>(null); // Fecha seleccionada
  const [filterText, setFilterText] = useState<string>(""); // Oración para filtrar las notas
  const [visibleCards, setVisibleCards] = useState<number>(0); // Controla cuántas tarjetas están visibles

  useEffect(() => {
    // Consumir la API
    fetch("http://127.0.0.1:3000/test/getChatGroupedByMonth")
      .then((response) => response.json())
      .then((json: Data) => {
        setData(json); // Guardar los datos en el estado
        setLoading(false); // Cambiar el estado de carga
        const lastMonth = Object.keys(json).sort().pop(); // Último mes disponible
        if (lastMonth) {
          setSelectedMonth(lastMonth); // Seleccionar automáticamente el último mes
        }
      })
      .catch((error) => console.error("Error al cargar los datos:", error));
  }, []);

  const triggerAnimation = (length: number) => {
    // Animar tarjetas gradualmente
    setVisibleCards(0); // Reiniciar el estado
    let delay = 0;
    const interval = setInterval(() => {
      setVisibleCards((prev) => prev + 1);
      delay += 1;
      if (delay >= length) {
        clearInterval(interval);
      }
    }, 150); // Retraso entre tarjetas
  };

  useEffect(() => {
    if (!loading && data) {
      // Disparar animación al cargar los datos iniciales
      triggerAnimation(Object.values(data).flat().length);
    }
  }, [loading, data]);

  // Función para manejar el cambio de fecha
  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    if (date) {
      const week = Math.ceil(
        (date.getDate() +
          new Date(date.getFullYear(), date.getMonth(), 1).getDay()) /
          7
      );
      const month = `${date.getMonth() + 1}/${date.getFullYear()}`;
      setSelectedWeek(week.toString());
      setSelectedMonth(month);
    }
    triggerAnimation(visibleCards); // Disparar animación al cambiar la fecha
  };

  // Función para manejar el cambio de filtro de texto
  const handleFilterTextChange = (text: string) => {
    setFilterText(text);
    triggerAnimation(visibleCards); // Disparar animación al aplicar el filtro de texto
  };

  if (loading) {
    return <p className="text-center">Cargando datos...</p>;
  }

  if (!data) {
    return <p className="text-center">No se encontraron datos.</p>;
  }

  // Recolectar todas las notas del histórico
  const allChats = Object.values(data).flatMap((weeks) =>
    Object.values(weeks).flat()
  );

  // Filtrar las notas según el texto ingresado
  const filteredChats = filterText
    ? allChats.filter((chat) =>
        chat.content.toLowerCase().includes(filterText.toLowerCase())
      )
    : null;

  // Obtener las notas del mes y semana seleccionados si no hay filtro de texto
  const monthData = data[selectedMonth!] || {};
  const weekChats = selectedWeek
    ? monthData[selectedWeek] || []
    : Object.values(monthData).flat();

  // Determinar las notas que se deben mostrar
  const chatsToDisplay = filteredChats || weekChats;

  // Organizar las notas por semana
  const notesByWeek: { [key: string]: Chat[] } = chatsToDisplay.reduce(
    (acc, chat) => {
      const week = Math.ceil(
        (new Date(chat.date).getDate() + new Date(chat.date).getDay()) / 7
      ).toString();
      acc[week] = acc[week] || [];
      acc[week].push(chat);
      return acc;
    },
    {} as { [key: string]: Chat[] }
  );

  return (
    <div className="container mt-4">
      <h1 className="text-center mb-4">Mis Notas</h1>

      <div className="mb-4 row justify-content-center">
        {/* DatePicker para seleccionar la fecha */}
        <div className="col-12 col-md-6 col-lg-3 mb-2 form-filtros">
          <label>Seleccionar Fecha:</label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            dateFormat="dd/MM/yyyy"
            placeholderText="Seleccionar fecha.." // Texto del placeholder
          />
        </div>

        {/* Filtro por texto */}
        <div className="col-12 col-md-6 col-lg-3 mb-2 form-filtros">
          <label>Filtrar por oración:</label>
          <input
            type="text"
            placeholder="Buscar en las notas..."
            value={filterText}
            onChange={(e) => handleFilterTextChange(e.target.value)}
          />
        </div>
      </div>

      <div className="row">
        {["1", "2", "3", "4"].map((week, index) => {
          const chats = notesByWeek[week] || []; // Obtener notas para la semana actual
          debugger;
          const allEmpty = Object.values(notesByWeek).every(
            (weekChats) => weekChats.length === 0
          );

          return (
            <div
              key={week}
              className="col-12 col-sm-6 col-lg-3 position-relative"
            >
              {/* Línea vertical solo si no están todos vacíos */}
              {!allEmpty && index > 0 && <div className="vertical-line"></div>}

              <h3 className="text-secondary text-center">Semana: {week}</h3>
              {chats.length === 0 ? (
                <p className="text-center">No hay datos</p>
              ) : (
                chats.map((chat, chatIndex) => (
                  <div
                    key={chatIndex}
                    className={`card mb-3 shadow-sm ${
                      visibleCards > chatIndex ? "visible" : "hidden"
                    }`}
                    style={{
                      transition: "opacity 0.5s ease, transform 0.5s ease",
                      opacity: visibleCards > chatIndex ? 1 : 0,
                      transform:
                        visibleCards > chatIndex
                          ? "translateY(0)"
                          : "translateY(20px)",
                    }}
                  >
                    <div className="card-body">
                      <h5 className="card-title">
                        Fecha: {chat.date} - Hora: {chat.time}
                      </h5>
                      {/* <h6 className="card-subtitle mb-2">
                        Fecha: {chat.date} - Hora: {chat.time}
                      </h6> */}
                      <p className="card-text">{chat.content}</p>
                      <FilePreview content={chat.content} />
                    </div>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Notas;
