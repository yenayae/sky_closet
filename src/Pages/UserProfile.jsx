import { useAuth } from "../Hooks/authContext";
import { useLoaderData, useNavigate, useParams } from "react-router";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGear } from "@fortawesome/free-solid-svg-icons";

import { supabase } from "../supabase/supabaseClient";
import useProcessPostImages from "../Hooks/useProcessPostImages";

import Logout from "../Components/LogOut";
import NavBar from "../Components/NavBar";
import { DisplayPosts } from "../Components/DisplayPosts";
import OptionsMenu from "../Components/OptionsMenu";

import "../Styles/page_css/userProfilePage.css";

export default function UserProfile() {
  const userInfo = useLoaderData();
  const { username } = useParams();

  const { user } = useAuth();
  const navigate = useNavigate();
  const processPostImages = useProcessPostImages();

  const [contentTabSelected, setContentTabSelected] = useState("posts");
  const [userPosts, setUserPosts] = useState(userInfo.posts);
  const [likedPosts, setLikedPosts] = useState([]);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);

  const followers = userInfo.followers;
  const following = userInfo.following;

  useEffect(() => {
    if (user === undefined) return; // Ensure we don't trigger unnecessary renders
    if (!user) navigate("/login");
  }, [user, navigate]);

  const fetchLikedPosts = async () => {
    console.log("liked posts");
    const { data, error } = await supabase
      .from("users")
      .select(
        `
      id,
      liked_posts (
        post_id,
        created_at,
        posts (
          *,
          posts_images(image_url)
        )
      )
    `
      )
      .eq("username", username)
      .order("created_at", { referencedTable: "liked_posts", ascending: false }) // Sort liked_posts by latest
      .single();
    if (error) {
      console.error("Error fetching lked posts:", error);
    } else {
      // setLikedPosts(data.posts);
      let likedPosts = data.liked_posts.map((post) => post.posts);
      likedPosts = processPostImages(likedPosts);
      setLikedPosts(likedPosts);
    }
  };

  const fetchUserPosts = async () => {
    const { data, error } = await supabase
      .from("users")
      .select("*, posts(*, posts_images(image_url))")
      .order("created_at", { referencedTable: "posts", ascending: false })
      .eq("username", username);
    if (error) {
      console.error("Error fetching user posts:", error);
    } else {
      let userPosts = data.flatMap((user) => user.posts);
      userPosts = processPostImages(userPosts);
      setUserPosts(userPosts);
    }
  };

  useEffect(() => {
    fetchLikedPosts();
  }, []);

  const handlePostCategoryClick = () => {
    setContentTabSelected("posts");
    fetchUserPosts();
  };

  const handleLikeCategoryClick = () => {
    setContentTabSelected("likes");
    fetchLikedPosts();
  };

  const handleOptionsClick = () => {
    setShowOptionsMenu(!showOptionsMenu);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const handleReportProfile = () => {
    console.log("report profile!");
  };

  console.log(userInfo);

  return (
    <div>
      <NavBar />
      <div>
        <div className="profile-header">
          <div className="profile-user-info">
            <img className="profile-image" src="/img/assets/kiry.png" alt="" />
            <div className="profile-user-details">
              <div className="username-container">
                <h1 className="profile-username">{userInfo.username}</h1>
                <OptionsMenu
                  showOptionsMenu={showOptionsMenu} // Toggle menu visibility
                  options={[
                    { label: "Report Profile", action: handleReportProfile },
                    { label: "Log out", action: handleLogout },
                  ]}
                  pageContext="profile"
                />
                <FontAwesomeIcon
                  className="profile-options"
                  icon={faGear}
                  onClick={handleOptionsClick}
                  style={{
                    backgroundColor: showOptionsMenu
                      ? "rgb(182, 182, 182)"
                      : "transparent",
                    color: showOptionsMenu ? "white" : "#929292",
                  }}
                />
              </div>
              <div className="profile-followers">
                <span>{followers} followers</span>
                <span>{following} following</span>
              </div>
            </div>
          </div>

          {/* <Logout /> */}
        </div>

        <div className="profile-content-container">
          <div className="profile-content-header">
            <span
              className={`profile-content-tab ${
                contentTabSelected === "posts" && "selected"
              }`}
              onClick={handlePostCategoryClick}
            >
              Posts
            </span>
            <span
              className={`profile-content-tab ${
                contentTabSelected === "likes" && "selected"
              }`}
              onClick={handleLikeCategoryClick}
            >
              Likes
            </span>
          </div>

          <div className="profile-content">
            {contentTabSelected === "posts" && (
              <div>
                <DisplayPosts posts={userPosts} />
              </div>
            )}
            {contentTabSelected === "likes" && (
              <div>
                <DisplayPosts posts={likedPosts} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
