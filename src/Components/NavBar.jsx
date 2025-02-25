import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHouse,
  faPlus,
  faHeart,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

import { useAuth } from "../Hooks/authContext";
import { supabase } from "../supabase/supabaseClient";

import styled from "styled-components";
import COLORS from "../Styles/theme";
import "../Styles/styles.css";

const SearchForm = styled.form`
  flex: 1;
  background-color: ${COLORS.secondary};
  padding: 0 20px;
  display: flex;
  height: 100%;
  border-radius: 10px;
`;
const SearchInput = styled.input`
  background-color: ${COLORS.secondary};
  width: 100%;
  height: 100%;
  border: none;
  padding: 0;

  &:focus {
    outline: none;
    border: none;
  }
`;

export default function NavBar({ page, cosmeticPageReset, onSearch }) {
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

  const handleCosmeticsClick = () => {
    if (cosmeticPageReset) {
      cosmeticPageReset();
    } else {
      navigate("/cosmetics", { replace: true });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const query = e.target.elements.searchInput.value.trim();
    onSearch(query);
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
        <Link to="/" style={{ height: "100%" }}>
          <button className="nav-button" data-testid="home-button">
            <FontAwesomeIcon icon={faHouse} />
          </button>
        </Link>
        <button
          className="nav-button"
          onClick={handleCosmeticsClick}
          data-testid="cosmetics-button"
        >
          Cosmetics
        </button>

        <Link to="/blog" style={{ height: "100%" }}>
          <button className="nav-button" data-testid="community-button">
            Community
          </button>
        </Link>

        <SearchForm className="search-form" onSubmit={handleSearch}>
          <SearchInput
            className="search-bar"
            name="searchInput"
            type="text"
            placeholder={
              page === "communityPage"
                ? "Search posts..."
                : page === "cosmeticPage"
                ? "Search cosmetics..."
                : "Search..."
            }
            data-testid="searchBar"
          />
          <button type="submit" style={{ display: "none" }}>
            Submit
          </button>
        </SearchForm>
        <Link to="/createPost" style={{ height: "100%" }}>
          <button className="nav-button" data-testid="post-button">
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </Link>
        <Link
          to={currentUser ? `/profile/${currentUser}` : "/login"}
          style={{ height: "100%" }}
        >
          <button className="nav-button" data-testid="likedPosts-button">
            <FontAwesomeIcon icon={faUser} />
          </button>
        </Link>
      </div>
    </div>
  );
}
