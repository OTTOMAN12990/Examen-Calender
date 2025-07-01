import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

const AddEventPage = ({ events, setEvents }) => {
  const navigate = useNavigate();
  const { date } = useParams();

  const [title, setTitle] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [category, setCategory] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();

    const start = new Date(date + "T" + startTime);
    const end = new Date(date + "T" + endTime);

const newEvent = {
  id: Math.random(),
  title,
  start,
  end,
  category,
};

    setEvents([...events, newEvent]);
    navigate(`/day/${date}`);
  };

  return (
    <div>
      <h2>Nieuwe afspraak toevoegen voor {date}</h2>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", maxWidth: "300px" }}>
        <input
          type="text"
          placeholder="Titel"
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
        style={{ marginBottom: "10px" }}
        >
            <option value="">-- Kies Categorie --</option>
            <option value="urgent">-- 🚨 Urgent --</option>
            <option value="normaal">-- 📅 Normaal --</option>
            <option value="ontspanning">-- 🌴 Ontspanning --</option>
        </select>
        <button type="submit" style={{ marginTop: "10px" }}>
          Toevoegen
        </button>
      </form>
      <button onClick={() => navigate(`/day/${date}`)} style={{ marginTop: "10px" }}>
        Terug naar afspraken
      </button>
    </div>
  );
};



export default AddEventPage;
