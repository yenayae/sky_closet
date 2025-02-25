import { useLoaderData } from "react-router";
import NavBar from "../Components/NavBar";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function LikedPosts() {
  useState(() => {
    document.title = "Liked Posts";
  }, []);

  const likedPosts = useLoaderData();
  const [likedPostDetails, setLikedPostDetails] = useState([]);

  useEffect(() => {
    const postIds = likedPosts.map((likedPost) => likedPost.post_id);

    fetch("http://localhost:3000/posts")
      .then((response) => response.json())
      .then((allPosts) => {
        const expandedPosts = likedPosts.map((likedPost) => {
          const postDetail = allPosts.find(
            (post) => post.id === likedPost.post_id
          );
          return {
            ...postDetail,
            date_liked: likedPost.date_liked,
          };
        });
        setLikedPostDetails(expandedPosts);
      })
      .catch((error) => {
        console.error("Error fetching posts:", error);
      });
  }, [likedPosts]);

  console.log(likedPosts);

  return (
    <div>
      <NavBar />
      <div style={{ padding: "10px" }}>
        <h1>Liked Posts</h1>
        {likedPostDetails.length > 0 ? (
          likedPostDetails.map((post) => (
            <Link to={`/blog/${post.id}`} style={{ textDecoration: "none" }}>
              <div key={post.id} className="liked-post">
                <hr
                  style={{
                    margin: "0",
                    width: "100%",
                    height: "1px",
                    border: "none",
                    backgroundColor: "#D3D3D3",
                  }}
                />
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    padding: "10px",
                  }}
                >
                  <div>
                    <h2>{post.title}</h2>
                    <p>{post.body}</p>
                    <span>
                      <strong>Date Liked:</strong>{" "}
                      {new Date(post.date_liked).toLocaleDateString("en-US")}
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    {post.image && (
                      <img
                        src={`/img/${post.image}`}
                        alt={post.title}
                        style={{
                          width: "200px",
                          height: "auto",
                          borderRadius: "10px",
                        }}
                      />
                    )}
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <p>No liked posts found.</p>
        )}
      </div>
    </div>
  );
}
