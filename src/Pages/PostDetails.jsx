import { useLoaderData } from "react-router-dom";
import NavBar from "../Components/NavBar";
import OptionsMenu from "../Components/OptionsMenu";
import styled from "styled-components";
import COLORS from "../Styles/theme";
import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHeart,
  faEllipsis,
  faXmark,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useNavigate } from "react-router-dom";

import { ImageCarousel } from "../Components/ImageCarousel";
import { DisplayPosts } from "../Components/DisplayPosts";

import { supabase } from "../supabase/supabaseClient";
import useLike from "../Hooks/useLike";
import { useAuth } from "../Hooks/authContext";
import useProcessPostImages from "../Hooks/useProcessPostImages";

import "../Styles/page_css/postDetails.css";

const PostDetails = () => {
  const { user } = useAuth();

  useEffect(() => {
    document.title = "Post Details";
  }, []);

  const postData = useLoaderData();
  const postDetails = postData.postDetails;
  const navigate = useNavigate();
  const processPostImages = useProcessPostImages();

  console.log(postData.cosmeticPosts);

  //post details metadata
  const postID = postDetails.id;
  const imagesArray = postDetails.posts_images.map((image) => {
    return image.public_url;
  });
  const title = postDetails.title;
  const body = postDetails.body;

  const CAROUSEL_WIDTH = 400;
  const [firstImageHeight, setFirstImageHeight] = useState(null);
  useEffect(() => {
    if (imagesArray.length > 0) {
      const firstImg = new Image();
      firstImg.src = imagesArray[0];
      firstImg.onload = () => {
        const aspectRatio = firstImg.height / firstImg.width;
        const scaledHeight = CAROUSEL_WIDTH * aspectRatio;
        setFirstImageHeight(scaledHeight);
      };
    }
  }, [imagesArray]);

  //comments
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState(postDetails.posts_comments);

  //check if liked by getting current userID
  const [isLiked, handleLikeToggle, isProcessing] = useLike(postID);
  const [likes, setLikes] = useState(postDetails.likes);
  const [isLikedUI, setIsLikedUI] = useState(isLiked);

  useEffect(() => {
    setIsLikedUI(isLiked);
  }, [isLiked]);

  const [cosmeticPosts, setCosmeticPosts] = useState(postData.cosmeticPosts);
  const [fetchingPosts, setFetchingPosts] = useState(true);

  //fetch explore page posts (similarly tagged posts)
  const cosmeticTagsIDs = postDetails.posts_cosmetic_tags
    .map((tag) => tag.cosmetic_id)
    .flat();

  // useEffect(() => {
  //   const fetchCosmeticPosts = async () => {
  //     setFetchingPosts(true);
  //     const { data, error } = await supabase
  //       .from("posts_cosmetic_tags")
  //       .select(
  //         `
  //           *,
  //           posts(*, posts_images(image_url))
  //         `
  //       )
  //       .in("cosmetic_id", cosmeticTagsIDs);
  //     if (error) {
  //       throw new Error("Error fetching posts: " + error.message);
  //     }

  //     console.log("pre filter", data);
  //     console.log(postDetails.id);

  //     let posts = data
  //       .map((entry) => entry.posts)
  //       .flat()
  //       .filter((post) => post.id !== postDetails.id);

  //     posts = processPostImages(posts);
  //     console.log(posts);

  //     setCosmeticPosts(posts);
  //     setFetchingPosts(false);
  //   };

  //   fetchCosmeticPosts();
  // }, []);

  //report
  const [showReportForm, setShowReportForm] = useState(false);
  const [reportReason, setReportReason] = useState("");

  //options menu functions
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const toggleMenu = () => {
    setShowOptionsMenu(!showOptionsMenu);
  };

  const handleDelete = async () => {
    if (!user) {
      console.error("User is not authenticated.");
      return;
    }

    if (user.id !== postDetails.user_id) {
      return;
    }

    const { error: deleteError } = await supabase
      .from("posts")
      .delete()
      .eq("id", postID);

    if (deleteError) {
      console.error("Error deleting post:", deleteError);
    } else {
      console.log("Post deleted successfully");
    }

    navigate("/blog");
  };

  const handleEdit = () => {
    navigate(`/editPost/${postID}`);
  };

  const handleDownload = async () => {
    if (!postDetails.posts_images.length) {
      return;
    }

    try {
      const downloadPromises = postDetails.posts_images.map(
        async (image, index) => {
          const imageUrl = image.public_url;
          const response = await fetch(imageUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${imageUrl}`);
          }
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);

          // Create a temporary link element
          const a = document.createElement("a");
          a.href = url;
          a.download = `image_${index + 1}.jpg`; // Naming the file
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);

          // Clean up
          URL.revokeObjectURL(url);
        }
      );

      await Promise.all(downloadPromises);
      console.log("All images downloaded successfully!");
    } catch (error) {
      console.error("Error downloading images:", error);
    }
  };

  const handleReport = () => {
    setShowReportForm(true); // Open the report form
  };

  const closeReport = () => {
    setShowReportForm(false);
    setReportReason("");
  };

  const submitReport = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    if (!reportReason.trim()) {
      console.error("Report reason is empty.");
      return;
    }
    const { error } = await supabase.from("post_reports").insert([
      {
        post_id: postID,
        reported_by: user.id,
        reason: reportReason,
        status: "pending",
        created_at: new Date(),
      },
    ]);

    closeReport();
  };

  const handleLike = () => {
    if (isProcessing) return;

    // optimistically update ui
    setIsLikedUI((prev) => !prev);
    setLikes((prevLikes) => (isLikedUI ? prevLikes - 1 : prevLikes + 1));

    // call async handler
    handleLikeToggle().catch((error) => {
      console.error(error);
      setIsLikedUI(isLiked);
      setLikes((prevLikes) => (isLiked ? prevLikes + 1 : prevLikes - 1));
    });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      navigate("/login"); // Redirect to login if not authenticated
      return;
    }

    if (!comment.trim()) return; // Prevent empty comments

    const { data, error } = await supabase
      .from("posts_comments")
      .insert([
        {
          post_id: postID,
          user_id: user.id,
          content: comment,
        },
      ])
      .select(
        "id, content, post_id, user_id, created_at, users(pfp, username)"
      );

    if (error) {
      console.error("Error adding comment:", error);
    } else {
      setComments([...comments, ...data]);
      setComment("");
    }
  };

  const removeComment = async (commentID) => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Delete comment from Supabase
    const { error } = await supabase
      .from("posts_comments")
      .delete()
      .eq("id", commentID);

    if (error) {
      console.error("Error removing comment:", error);
      return;
    }

    // Update state to remove the comment
    setComments(comments.filter((comment) => comment.id !== commentID));
  };

  return (
    <div>
      <NavBar></NavBar>

      {showReportForm && (
        <div
          className="report-modal-overlay"
          onClick={() => setShowReportForm(false)}
        >
          <div
            className="report-modal-box"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>Report Post</h2>
            <textarea
              placeholder="Why are you reporting this post?"
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
            ></textarea>
            <button onClick={closeReport}>Cancel</button>
            <button onClick={submitReport}>Submit</button>
          </div>
        </div>
      )}

      <div className="post-details-container">
        <div className="post-details-box">
          <div className="post-container">
            {imagesArray.length > 0 && (
              <ImageCarousel items={imagesArray} pageContext={"postPage"} />
            )}

            <div
              className="text-details-box"
              style={{
                width: imagesArray.length > 0 ? "300px" : "550px",
              }}
            >
              <div className="content-details-box">
                <h1 className="post-details-title">{postDetails.title}</h1>
                <div className="post-details-user">
                  <img
                    className="post-details-pfp"
                    src="/img/default_pfp.jpg"
                    alt="profile picture"
                  />

                  <span className="username">{postDetails.users.username}</span>
                </div>

                <div className="post-caption">
                  <p
                    style={{
                      margin: "0",
                    }}
                  >
                    {body}
                  </p>
                </div>
                <div>
                  {comments.length > 0 && <hr />}

                  <div
                    className="comments-container"
                    style={{
                      maxHeight: firstImageHeight
                        ? `${firstImageHeight - 210}px`
                        : "auto",
                      overflowY: "auto",
                    }}
                  >
                    {comments.map((comment) => (
                      <div className="comment">
                        {(comment.user_id === user.id ||
                          postDetails.user_id === user.id) && (
                          <FontAwesomeIcon
                            icon={faXmark}
                            className="comment-x"
                            onClick={() => removeComment(comment.id)}
                          />
                        )}
                        <img
                          className="post-details-pfp"
                          src={
                            comment.users.pfp
                              ? comment.users.pfp
                              : "/img/default_pfp.jpg"
                          }
                          alt="comment user profile"
                        />
                        <div
                          className="comment-content-wrapper"
                          style={{
                            maxWidth: imagesArray.length > 0 ? "75%" : "90%",
                          }}
                        >
                          <span className="username">
                            {comment.users.username}
                          </span>
                          <span className="comment-content">
                            {comment.content}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="items-container">
                {showOptionsMenu && (
                  <OptionsMenu
                    className="post-options-menu"
                    showOptionsMenu={showOptionsMenu} // Toggle menu visibility
                    options={[
                      { label: "Download image(s)", action: handleDownload },
                      { label: "Report post", action: handleReport },
                      ...(user?.id === postDetails.user_id
                        ? [
                            { label: "Edit post", action: handleEdit },
                            { label: "Delete post", action: handleDelete },
                          ]
                        : []),
                    ]}
                    pageContext={"post-details"}
                  />
                )}

                <div className="items-details">
                  <span className="num-likes">
                    {likes} {likes === 1 ? "like" : "likes"}
                  </span>
                  <div className="icons-container">
                    <FontAwesomeIcon
                      className="post-heart postDetails-heart"
                      icon={faHeart}
                      color={isLikedUI ? "#d94e72" : "#cccccc"}
                      // size="2x"
                      onClick={handleLike}
                    />

                    <FontAwesomeIcon
                      icon={faEllipsis}
                      className="post-options"
                      onClick={toggleMenu}
                      style={{
                        backgroundColor: showOptionsMenu
                          ? "rgb(182, 182, 182)"
                          : "transparent",
                        color: showOptionsMenu ? "white" : "#b3b3b3",
                      }}
                    />
                  </div>
                </div>
                <div className="comment-container">
                  <textarea
                    className="comment-box"
                    type="text"
                    placeholder="Add a comment..."
                    style={{
                      width: imagesArray.length > 0 ? "258px" : "508px",
                    }}
                    onChange={(e) => setComment(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleCommentSubmit(e);
                      }
                    }}
                    value={comment}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: "10px" }}>
        {cosmeticPosts.length > 0 ? (
          <DisplayPosts posts={cosmeticPosts} />
        ) : (
          <div></div>
        )}
      </div>
    </div>
  );
};

export default PostDetails;
