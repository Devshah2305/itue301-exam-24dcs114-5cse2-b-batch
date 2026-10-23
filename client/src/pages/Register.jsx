import { useEffect, useMemo, useState } from "react";

function calculateFee(eventFee, email) {
  const fee = Number(eventFee);

  if (email.toLowerCase().endsWith("@charusat.edu.in")) {
    return fee * 0.8;
  }

  return fee;
}

function Register() {
  const [events, setEvents] = useState([]);
  const [registrations, setRegistrations] = useState([]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [eventId, setEventId] = useState("");

  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadEvents() {
      try {
        const response = await fetch(
          "http://localhost:5001/api/v1/events"
        );

        if (!response.ok) {
          throw new Error("Failed to load events");
        }

        const data = await response.json();

        setEvents(data);

        if (data.length > 0) {
          setEventId(String(data[0].id || data[0]._id));
        }
      } catch (error) {
        setMessage("Could not load events");
      }
    }

    loadEvents();
  }, []);

  const selectedEvent = events.find(
    (event) => String(event.id || event._id) === String(eventId)
  );

  const seatsLeft = selectedEvent
    ? Math.max(
        0,
        Number(selectedEvent.seatsLeft ?? selectedEvent.capacity) -
          registrations.filter(
            (r) => String(r.eventId) === String(eventId)
          ).length
      )
    : 0;

  const totalPayable = useMemo(
    () => registrations.reduce((total, r) => total + r.feePayable, 0),
    [registrations]
  );

  function handleSubmit(e) {
    e.preventDefault();
    setMessage("");

    const cleanName = name.trim();
    const cleanEmail = email.trim();

    // Rule 1: both fields required
    if (!cleanName || !cleanEmail) {
      setMessage("Name and email are required");
      return;
    }

    // Rule 2: event must have seats (checked before email limit)
    if (seatsLeft <= 0) {
      setMessage("Event is full");
      return;
    }

    // Rule 3: same email max 3 registrations (case-insensitive)
    const emailCount = registrations.filter(
      (r) => r.email.toLowerCase() === cleanEmail.toLowerCase()
    ).length;

    if (emailCount >= 3) {
      setMessage("Limit of 3 registrations reached");
      return;
    }

    const feePayable = calculateFee(selectedEvent.fee, cleanEmail);

    const registration = {
      id: crypto.randomUUID(),
      name: cleanName,
      email: cleanEmail,
      eventId: String(selectedEvent.id || selectedEvent._id),
      eventTitle: selectedEvent.title,
      feePayable,
    };

    setRegistrations((prev) => [...prev, registration]);
    setName("");
    setEmail("");
    setMessage("Registration successful");
  }

  function cancelRegistration(id) {
    setRegistrations((prev) => prev.filter((r) => r.id !== id));
    setMessage("");
  }

  return (
    <main>
      <h1>Register for an Event</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="event">Event</label>

          <select
            id="event"
            value={eventId}
            onChange={(e) => {
              setEventId(e.target.value);
              setMessage("");
            }}
          >
            {events.map((event) => {
              const id = String(event.id || event._id);
              return (
                <option key={id} value={id}>
                  {event.title}
                </option>
              );
            })}
          </select>
        </div>

        <p>Seats left: {seatsLeft}</p>

        <button type="submit">Register</button>
      </form>

      {message && <p>{message}</p>}

      <p>
        <strong>Total payable: ₹{totalPayable.toFixed(2)}</strong>
      </p>

      <h2>Registrations</h2>

      {registrations.length === 0 ? (
        <p>No registrations yet.</p>
      ) : (
        <ul>
          {registrations.map((r) => (
            <li key={r.id}>
              <strong>{r.name}</strong>
              {" — "}
              {r.eventTitle}
              {" — "}
              ₹{r.feePayable.toFixed(2)}

              <button
                type="button"
                onClick={() => cancelRegistration(r.id)}
              >
                Cancel
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}

export default Register;
