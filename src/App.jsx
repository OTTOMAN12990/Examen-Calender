import { useState } from "react";
import { Routes, Route, useNavigate, useParams } from "react-router-dom";
import { Calendar, dateFnsLocalizer } from "react-big-calendar";
import format from "date-fns/format";
import parse from "date-fns/parse";
import startOfWeek from "date-fns/startOfWeek";
import getDay from "date-fns/getDay";
import { nl } from "date-fns/locale";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './App.css';
import AddEventPage from "./components/AddEventPage";
const locales = { 'nl': nl };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const App = () => {
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Test-afspraak",
      start: new Date(2025, 7, 13, 12, 0),
      end: new Date(2025, 7, 13, 13, 0),
      category: "urgent"
    },
    {
      id: 2,
      title: "Andere afspraak",
      start: new Date(2025, 7, 13, 14, 0),
      end: new Date(2025, 7, 13, 15, 0),
      category: "ontspanning"
    },
    {
      id: 3,
      title: "Andere afspraak",
      start: new Date(2025, 7, 15, 18, 0),
      end: new Date(2025, 7, 13, 15, 0),
      category: "normaal"
    },
  ]);

  return (
    <Routes>
      <Route path="/" element={<CalendarPage events={events} setEvents={setEvents} />} />
      <Route path="/day/:date" element={<DayDetailPage events={events} setEvents={setEvents} />} />
      <Route path="/day/:date/add" element={<AddEventPage events={events} setEvents={setEvents} />} />
      <Route path="/event/:id" element={<EventDetailPage events={events} setEvents={setEvents} />} />
    </Routes>
  );
};

const CalendarPage = ({ events, setEvents }) => {
  const navigate = useNavigate();

  const handleAddEvent = (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value;
    const date = form.date.value;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;

    const start = new Date(date + "T" + startTime);
    const end = new Date(date + "T" + endTime);

    const newEvent = {
      id: Math.random(), // eenvoudige id
      title,
      start,
      end,
    };

    setEvents([...events, newEvent]);
    form.reset();
  };

  return (
    <div>
      <h1 style={{ textAlign: "center" }}>Mijn Agenda</h1>

      <form onSubmit={handleAddEvent} style={{ display: "flex", flexDirection: "column", maxWidth: "300px", margin: "auto" }}>
        <input type="text" name="title" placeholder="Title" required />
        <input type="date" name="date" required />
        <input type="time" name="startTime" required />
        <input type="time" name="endTime" required />
        <button type="submit" style={{ marginTop: "10px" }}>Add Event</button>
      </form>

      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 500, margin: "50px" }}
        selectable={true}
        onSelectEvent={(event) => navigate(`/event/${event.id}`)}
        onSelectSlot={(slotInfo) => {
          const dateStr = slotInfo.start.toISOString().split("T")[0];
          navigate(`/day/${dateStr}`);
        }}
eventPropGetter={(event) => {
  let backgroundColor = "#3174ad"; // standaard

  if (event.category === "urgent") backgroundColor = "#ff4d4d";
  else if (event.category === "ontspanning") backgroundColor = "#4caf50";
  else if (event.category === "normaal") backgroundColor = "#2196f3";

  return {
    style: {
      backgroundColor,
      borderRadius: "5px",
      color: "white",
      border: "none",
      padding: "5px"
    },
  };
}}
      />
    </div>
  );
};

const DayDetailPage = ({ events, setEvents }) => {
  const { date } = useParams();
  const navigate = useNavigate();

  // filter events voor die dag
  const dayEvents = events.filter(
    (event) =>
      event.start.toISOString().split("T")[0] === date 
  );

  return (
    <div>
      <h2>Afspraak overzicht voor: {date}</h2>
      <button onClick={() => navigate("/")}>Terug naar kalender</button>
      <ul>
        {dayEvents.length === 0 && <li>Geen afspraken op deze dag</li>}
        {dayEvents.map((event) => (
          <li key={event.id} onClick={() => navigate(`/event/${event.id}`)} style={{ cursor: "pointer", marginBottom: "10px" }}>
            {event.title} van {event.start.toLocaleTimeString()} tot {event.end.toLocaleTimeString()}
          </li>
        ))}
      </ul>
      <button onClick={() => navigate(`/day/${date}/add`)}>+ Nieuwe afspraak toevoegen</button>
      {/* Hier kun je een formulier of nieuwe route maken voor toevoegen */}
    </div>
  );
};

const EventDetailPage = ({ events, setEvents}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const event = events.find((e) => e.id.toString() === id);

  const [title, setTitle] = useState(event?.title || "");
  const [startTime, setStartTime] = useState(event ? event.start.toTimeString().slice(0, 5) : "");
  const [endTime, setEndTime] = useState(event ? event.end.toTimeString().slice(0, 5) : "");
  const [category, setCategory] = useState(event?.category || "");

  if (!event) return <p>Afspraak niet gevonden</p>;

  const handleUpdate = (e) => {
    e.preventDefault();
    
    const updatedEvent = {
      ...event,
      title,
      start: new Date(event.start.toISOString().split("T")[0] + "T" + startTime),
      end: new Date(event.end.toISOString().split("T")[0] + "T" + endTime),
      category,
    };

    const updatedEvents = events.map ((e) => (e.id === event.id ? updatedEvent : e));
    setEvents(updatedEvents);
    navigate(-1);
  };

return (
    <div>
      <h2>Bewerk afspraak</h2>
      <form onSubmit={handleUpdate} style={{ display: "flex", flexDirection: "column", maxWidth: "300px" }}>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        <input
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <input
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          required
        >
          <option value="">-- Kies Categorie --</option>
          <option value="urgent">🚨 Urgent</option>
          <option value="normaal">📅 Normaal</option>
          <option value="ontspanning">🌴 Ontspanning</option>
        </select>
        <button type="submit" style={{ marginTop: "10px" }}>Opslaan</button>
      </form>
      <button onClick={() => navigate(-1)} style={{ marginTop: "10px" }}>Annuleren</button>
    </div>
  );
};
export default App;
