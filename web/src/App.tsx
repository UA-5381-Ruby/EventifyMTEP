import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UIPreview } from '@/pages/UIPreview.tsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<h1 className="bg-emerald-500">Home</h1>} />
        <Route path="/test/preview" element={<UIPreview />}/>
      </Routes>
    </Router>
  );
}

export default App;
