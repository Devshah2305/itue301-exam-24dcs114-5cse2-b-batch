import { useCallback, useEffect, useState } from "react";

function Organisers() {
  const [organisers, setOrganisers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // useCallback so the function reference is stable and the
  // useEffect below fires exactly once on mount.
  const loadOrganisers = useCallback(async () => {
    setLoading(true);
    setError(false);

    try {
      const response = await fetch(
        "https://jsonplaceholder.typicode.com/users?_limit=10"
      );

      if (!response.ok) {
        throw new Error("Request failed");
      }

      const data = await response.json();

      const sorted = [...data].sort((a, b) =>
        a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        })
      );

      setOrganisers(sorted);
    } catch (err) {
      setError(true);
      setOrganisers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrganisers();
  }, [loadOrganisers]);

  if (loading) {
    return <p>Loading organisers...</p>;
  }

  if (error) {
    return (
      <main>
        <p>Could not load organisers</p>

        <button type="button" onClick={loadOrganisers}>
          Retry
        </button>
      </main>
    );
  }

  return (
    <main>
      <h1>Organisers</h1>

      <p>{organisers.length} organisers</p>

      <div>
        {organisers.map((organiser) => (
          <article key={organiser.id}>
            <h2>{organiser.name}</h2>

            <p>
              <strong>Company:</strong> {organiser.company.name}
            </p>

            <p>
              <strong>Email:</strong> {organiser.email}
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}

export default Organisers;
