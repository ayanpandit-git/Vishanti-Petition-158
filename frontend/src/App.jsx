import { useState } from 'react'
import './App.css'

function App() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <>
      <title>Vishanti Petition</title>
      <button>File complaint</button>
      <form>
        <header>Complaint form</header>
        <div>You can input your complaint details here</div>
        <label for="Category">Category:</label>
        <select id="Category">
          <option value="Administration" selected>Adminsitration</option>
          <option value="Mess">Mess</option>
          <option value="Hostel">Hostel</option>
          <option value="Classroom">Classroom</option>
          <option value="Committee">Committee</option>
          <option value="Ragging">Ragging</option>
        </select>
        <label for="Priority">Priority:</label>
        <select id="Priority">
          <option value="Low" selected>Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
        </select>
        <button onClick={() => setSubmitted(!submitted)}>Submit</button>
        {submitted && <h1>Successfully submitted</h1>}
      </form> 
    </>
  )
}

export default App
