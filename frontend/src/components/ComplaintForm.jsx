import { useState } from "react";
import { useAuth } from "../auth/AuthContext";

export default function ComplaintForm() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    priority: "Medium",
    isAnonymous: false,
  });

  const [loading, setLoading] = useState(false);
  const [complaintId, setComplaintId] = useState(null);
  const [error, setError] = useState("");
  const { token } = useAuth();

  function handleChange(event) {
    const { name, value, checked, type } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

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
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category.trim(),
          priority: formData.priority,
          is_anonymous: formData.isAnonymous,
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

      setFormData({
        title: "",
        description: "",
        category: "",
        priority: "Medium",
        isAnonymous: false,
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <title>Vishanti Petition</title>
      <form id="complaint-form" onSubmit={handleSubmit}>
        <div className="mb-3">
          <label className="form-label" htmlFor="Title">
            Title:
          </label>
          <input
            type="text"
            name="title"
            id="Title"
            className="form-control"
            value={formData.title}
            onChange={handleChange}
            maxLength={200}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="Description">
            Description:
          </label>
          <textarea
            id="Description"
            name="description"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label className="form-label" htmlFor="Category">
            Category:
          </label>
          <input
            type="text"
            name="category"
            id="Category"
            className="form-control"
            value={formData.category}
            onChange={handleChange}
            placeholder="Hostel"
            maxLength={100}
            required
          />
        </div>
        <div className="mb-3 dropdown">
          <label className="form-label me-3" htmlFor="Priority">
            Priority:
          </label>
          <select
            id="Priority"
            name="priority"
            className="dropdown-toggle form-select"
            value={formData.priority}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>
        <div className="mb-5 form-switch">
          <label className="form-check-label" htmlFor="IsAnonymous">
            Do you wish to be anonymous?
          </label>
          <input
            type="checkbox"
            name="isAnonymous"
            id="IsAnonymous"
            role="switch"
            className="form-check-input ms-2"
            checked={formData.isAnonymous}
            onChange={handleChange}
          />
        </div>
        <button
          className="btn btn-dark btn-lg"
          type="submit"
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </button>

        {complaintId !== null && (
          <div role="status" className="p-5">
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
