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
  useEffect(() => {
    const getUsername = async () => {
      if (!user) return; // Ensure user exists
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
        <Link to="/" style={{ height: "100%" }}>
          <button className="home-nav-button" data-testid="home-button">
            <FontAwesomeIcon icon={faHouse} />
          </button>
        </Link>
        <span>Home</span>

        <Link to="/cosmetics" style={{ height: "100%" }}>
          <button
            className="home-nav-button shrine"
            data-testid="cosmetics-button"
          >
            <img
              className="shrine-icon"
              src="/img/assets/home/outfit_shrine.png"
              alt=""
            />
          </button>
        </Link>

        <Link to="/blog" style={{ height: "100%" }}>
          <button className="home-nav-button" data-testid="community-button">
            <FontAwesomeIcon icon={faCompass} />
          </button>
        </Link>

        <Link
          to={currentUser ? `/profile/${currentUser}` : "/login"}
          style={{ height: "100%" }}
        >
          <button className="home-nav-button">
            <FontAwesomeIcon icon={faUser} />
          </button>
        </Link>
      </div>
    </div>
  );
}
