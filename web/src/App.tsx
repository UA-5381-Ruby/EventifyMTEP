import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1 className="bg-mint-500">Home</h1>} />
      </Routes>
    </Router>
  );
}

export default App;
