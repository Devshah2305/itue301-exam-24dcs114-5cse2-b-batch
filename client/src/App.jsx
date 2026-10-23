import { NavLink, Route, Routes } from "react-router-dom";
import Events from "./pages/Events";
import Register from "./pages/Register";
import Organisers from "./pages/Organisers";

function App() {
  return (
    <>
      <header>
        <h1>Campus Event Hub</h1>

        <nav>
          <NavLink to="/">Events</NavLink>{" "}
          |{" "}
          <NavLink to="/register">Register</NavLink>{" "}
          |{" "}
          <NavLink to="/organisers">Organisers</NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<Events />} />
        <Route path="/register" element={<Register />} />
        <Route path="/organisers" element={<Organisers />} />
      </Routes>
    </>
  );
}

export default App;