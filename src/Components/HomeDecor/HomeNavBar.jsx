import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHouse, faCompass, faUser } from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAuth } from "../../Hooks/authContext";
import { supabase } from "../../supabase/supabaseClient";

import "../../Styles/styles.css";
import "../../Styles/components/home/navbar.css";

export default function HomeNavBar() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [currentUser, setCurrentUsername] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const getUsername = async () => {
      if (!user) return;
      const { data, error } = await supabase
        .from("users")
        .select("username")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Error fetching user:", error);
      } else {
        setCurrentUsername(data.username);
      }
    };

    getUsername();
  }, [user]);

  const handleMouseEnter = (text) => {
    setTooltipText(text);
    setShowTooltip(true);
  };

  const handleMouseMove = (e) => {
    setTooltipPos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div style={{ padding: "10px" }}>
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          height: "50px",
          width: "100%",
        }}
      >
        <div className="home-nav-wrapper">
          <Link to="/" style={{ height: "100%" }}>
            <button
              className="home-nav-button"
              data-testid="home-button"
              onMouseEnter={() => handleMouseEnter("Home")}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <FontAwesomeIcon icon={faHouse} />
            </button>
          </Link>
        </div>

        <div className="home-nav-wrapper">
          <Link to="/cosmetics" style={{ height: "100%" }}>
            <button
              className="home-nav-button shrine"
              data-testid="cosmetics-button"
              onMouseEnter={() => handleMouseEnter("Cosmetics")}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <img
                className="shrine-icon"
                src="/img/assets/home/outfit_shrine.png"
                alt=""
              />
            </button>
          </Link>
        </div>

        <div className="home-nav-wrapper">
          <Link to="/blog" style={{ height: "100%" }}>
            <button
              className="home-nav-button"
              data-testid="community-button"
              onMouseEnter={() => handleMouseEnter("Explore")}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <FontAwesomeIcon icon={faCompass} />
            </button>
          </Link>
        </div>

        <div className="home-nav-wrapper">
          <Link
            to={currentUser ? `/profile/${currentUser}` : "/login"}
            style={{ height: "100%" }}
          >
            <button
              className="home-nav-button"
              onMouseEnter={() => handleMouseEnter("Profile")}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <FontAwesomeIcon icon={faUser} />
            </button>
          </Link>
        </div>
      </div>

      {showTooltip && (
        <div
          className="home-nav-tooltip"
          style={{
            position: "fixed",
            top: tooltipPos.y + 19,
            left: tooltipPos.x + 9,
            opacity: showTooltip ? 1 : 0,
            pointerEvents: "none",
          }}
        >
          {tooltipText}
        </div>
      )}
    </div>
  );
}
