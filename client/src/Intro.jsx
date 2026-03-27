import { useNavigate } from "react-router-dom";
import "./Intro.css";

function Intro() {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate("/home");
  };

  return (
    <div className="intro-container">
      <div className="intro-content">
        <h1>☕ Welcome to Buy Me A Coffee</h1>
        <p>Support your favorite creators by buying them a coffee!</p>
        <button className="intro-button" onClick={handleGetStarted}>
          Get Started
        </button>
      </div>
    </div>
  );
}

export default Intro;
