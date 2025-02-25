import { Link, useLoaderData } from "react-router-dom";
import React, { useState, useEffect } from "react";

import NavBar from "../Components/NavBar";
import { DisplayPosts } from "../Components/DisplayPosts";

import "../Styles/styles.css";

const Community = () => {
  useState(() => {
    document.title = "Community Blog";
  }, []);

  // Get posts from API
  const posts = useLoaderData();

  console.log(posts);

  // Search results
  const [searchResults, setSearchResults] = useState(posts);

  // Search by input
  const handleSearch = (query) => {
    const filtered = posts.filter((post) =>
      post.title.replace(/_/g, " ").toLowerCase().includes(query.toLowerCase())
    );
    setSearchResults(filtered);
  };

  console.log(searchResults);

  return (
    <div>
      <NavBar page={"communityPage"} onSearch={handleSearch}></NavBar>
      <DisplayPosts posts={searchResults} />
    </div>
  );
};

export default Community;
