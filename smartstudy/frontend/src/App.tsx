import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import { ThemeProvider } from "./contexts/ThemeContext";
import Layout from "./components/Layout";
import Home from "./pages/Home";
const Quiz = lazy(() => import("./pages/EnhancedQuiz"));
import Planner from "./pages/Planner";
import Focus from "./pages/Focus";
import Notes from "./pages/Notes";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Layout>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/planner" element={<Planner />} />
              <Route path="/focus" element={<Focus />} />
              <Route path="/notes" element={<Notes />} />
              <Route path="/analytics" element={<Analytics />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ThemeProvider>
  );
}

export default App;
