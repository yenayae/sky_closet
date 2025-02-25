import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";
import "../Styles/components/userPost.css";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import useLike from "../Hooks/useLike";

export default function UserPost({ postInfo, postWidth }) {
  const imageLink =
    postInfo.posts_images.length > 0
      ? postInfo.posts_images[0].public_url
      : null;

  const title = postInfo.title;
  const caption = postInfo.body || "";
  const [isLiked, handleLikeToggle] = useLike(postInfo.id);
  const [imageLoaded, setImageLoaded] = useState(!imageLink);

  return (
    <div
      className="user-post"
      data-testid="user-post"
      style={{
        opacity: imageLoaded ? 1 : 0,
      }}
    >
      {/* render either image post or text post */}
      {imageLink ? (
        <div className="post">
          <Link
            to={`/blog/${postInfo.id}`}
            style={{ textDecoration: "none" }}
            onClick={() => {
              window.location.href = `/blog/${postInfo.id}`;
            }}
          >
            <img
              className="post-image"
              src={imageLink}
              alt={postInfo.image}
              onLoad={() => setImageLoaded(true)}
              style={{
                width: `${postWidth}px`,
              }}
            />
          </Link>
          <div className="post-items">
            <Link
              to={`/blog/${postInfo.id}`}
              style={{ textDecoration: "none" }}
              onClick={() => {
                window.location.href = `/blog/${postInfo.id}`;
              }}
            >
              <span className="post-title">{title}</span>
            </Link>
            <span className="hover-heart">
              <FontAwesomeIcon
                icon={faHeart}
                color={isLiked ? "#d94e72" : "#cccccc"}
                size="1x"
                onClick={handleLikeToggle}
                className="post-heart"
                data-testid="like-button"
              />
            </span>
          </div>
        </div>
      ) : (
        <div
          style={{
            textAlign: "left",
            borderRadius: "10px",
            width: `${postWidth}px`,
            // border: "1px solid #e2e2e2",
            backgroundColor: "#eeebeb",
            marginBottom: "15px",
          }}
          // className="post"
        >
          <Link to={`/blog/${postInfo.id}`} style={{ textDecoration: "none" }}>
            <h2 className="text-post-title">{title}</h2>

            <hr className="text-post-divider" />

            {caption && <p className="text-post-caption">{caption}</p>}
          </Link>
          <div className="text-post-heart">
            <span className="hover-heart">
              <FontAwesomeIcon
                icon={faHeart}
                color={isLiked ? "#d94e72" : "#cccccc"}
                size="1x"
                onClick={handleLikeToggle}
                className="post-heart"
              />
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
