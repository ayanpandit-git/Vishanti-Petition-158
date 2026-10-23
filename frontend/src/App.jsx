import { useState } from "react";
import "./App.css";

function App() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("Medium");
  const [isAnonymous, setIsAnonymous] = useState(false);

  const [loading, setLoading] = useState(false);
  const [complaintId, setComplaintId] = useState(null);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setComplaintId(null);

    try {
      const response = await fetch("http://localhost:8000/api/complaints", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          category: category.trim(),
          priority: priority,
          is_anonymous: isAnonymous,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (Array.isArray(data.detail)) {
          const messages = data.detail.map(
            (item) => `${item.loc.slice(1).join(".")}: ${item.msg}`,
          );

          throw new Error(messages.join("; "));
        }

        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Failed to submit the complaint.",
        );
      }

      setComplaintId(data.complaint_id);

      setTitle("");
      setDescription("");
      setCategory("");
      setPriority("Medium");
      setIsAnonymous(false);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <title>Vishanti Petition</title>
      <button
        type="button"
        onClick={() =>
          document
            .getElementById("complaint-form")
            ?.scrollIntoView({ behavior: "smooth" })
        }
      >
        File complaint
      </button>

      <form id="complaint-form" onSubmit={handleSubmit}>
        <h2>Complaint form</h2>
        <p>You can input your complaint details here</p>
        <label htmlFor="Title">Title:</label>
        <input
          type="text"
          id="Title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={200}
          required
        />
        <label htmlFor="Description">Description:</label>
        <textarea
          id="Description"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          required
        />
        <label htmlFor="Category">Category:</label>
        <input
          type="text"
          id="Category"
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          placeholder="Hostel"
          maxLength={100}
          required
        />
        <label htmlFor="Priority">Priority:</label>
        <select
          id="Priority"
          value={priority}
          onChange={(event) => setPriority(event.target.value)}
        >
          <option value="Low" selected>
            Low
          </option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <label htmlFor="IsAnonymous">Do you wish to be anonymous?</label>
        <input
          type="checkbox"
          id="IsAnonymous"
          checked={isAnonymous}
          onChange={(event) => setIsAnonymous(event.target.checked)}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Submitting..." : "Submit"}
        </button>

        {complaintId !== null && (
          <div role="status">
            <h3>Complaint filed successfully!</h3>
            <p>Your complaint ID is: {complaintId}</p>
            <p>Keep this ID for future reference.</p>
          </div>
        )}

        {error && (
          <div role="alert">
            <h3>Submission failed</h3>
            <p>{error}</p>
          </div>
        )}
      </form>
    </>
  );
}

export default App;
