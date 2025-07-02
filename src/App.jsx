import { useState, useEffect } from "react";
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
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

const locales = { 'nl': nl };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

const App = () => {

  const location = useLocation();
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem("mijn_agenda_events");
    if (!saved) return [];
    const parsed = JSON.parse(saved);
    return parsed.map((event) => ({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end),
    }));
  });

  useEffect(() => {
    localStorage.setItem("mijn_agenda_events", JSON.stringify(events));
  }, [events]);

 return (
    <AnimatePresence exitBeforeEnter>
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<CalendarPage events={events} setEvents={setEvents} />} />
        <Route path="/day/:date" element={<DayDetailPage events={events} setEvents={setEvents} />} />
        <Route path="/day/:date/add" element={<AddEventPage events={events} setEvents={setEvents} />} />
        <Route path="/event/:id" element={<EventDetailPage events={events} setEvents={setEvents} />} />
      </Routes>
    </AnimatePresence>
  );
};

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

const CalendarPage = ({ events, setEvents }) => {
  const navigate = useNavigate();

  const [view, setView] = useState("month");
  const [date, setDate] = useState(new Date());

  const handleAddEvent = (e) => {
    e.preventDefault();
    const form = e.target;
    const title = form.title.value;
    const dateStr = form.date.value;
    const startTime = form.startTime.value;
    const endTime = form.endTime.value;

    const start = new Date(dateStr + "T" + startTime);
    const end = new Date(dateStr + "T" + endTime);

    const newEvent = {
      id: Math.random(),
      title,
      start,
      end,
    };

    setEvents([...events, newEvent]);
    form.reset();
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      <div className="calendar-container">
        <h1 style={{ textAlign: "center", color: "white", marginBottom: "20px" }}>Mijn Agenda</h1>

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
          style={{ height: 500 }}
          selectable={true}
          date={date}
          view={view}
          onNavigate={(newDate) => setDate(newDate)}
          onView={(newView) => setView(newView)}
          onSelectEvent={(event) => navigate(`/event/${event.id}`)}
          onSelectSlot={(slotInfo) => {
            const dateStr = slotInfo.start.toISOString().split("T")[0];
            navigate(`/day/${dateStr}`);
          }}
          eventPropGetter={(event) => {
            let backgroundColor = "#3174ad";

            if (event.category === "urgent") backgroundColor = "#ff4d4d";
            else if (event.category === "ontspanning") backgroundColor = "#4caf50";
            else if (event.category === "normaal") backgroundColor = "#2196f3";

            return {
              style: {
                backgroundColor,
                borderRadius: "8px",
                color: "white",
                border: "none",
                padding: "5px",
                boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
                transition: "all 0.2s ease"
              },
            };
          }}
        />
      </div>
    </motion.div>
  );
};
const DayDetailPage = ({ events, setEvents }) => {
  const { date } = useParams();
  const navigate = useNavigate();

  const dayEvents = events.filter(
    (event) =>
      event.start.toISOString().split("T")[0] === date 
  );

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
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
      </div>
    </motion.div>
  );
};


const EventDetailPage = ({ events, setEvents }) => {
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

    const updatedEvents = events.map((e) => (e.id === event.id ? updatedEvent : e));
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
      <button
        onClick={() => {
          const confirmed = confirm("Weet je zeker dat je deze afspraak wilt verwijderen");
          if (confirmed) {
            const updatedEvents = events.filter((e) => e.id !== event.id);
            setEvents(updatedEvents);
            navigate("/");
          }
        }}
        style={{
          marginTop: "10px",
          backgroundColor: "crimson",
          color: "white",
          border: "none",
          padding: "10px",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Verwijder afspraak
      </button>
    </div>
  );
};

export default App;
