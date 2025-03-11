import styled from "styled-components";
import { useState, useEffect } from "react";

import UserPost from "./UserPost";
import "../Styles/components/displayPosts.css";

const POST_SIZE = 300;

const Container = styled.div`
  height: auto;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  justify-content: center;
`;

const Column = styled.div`
  height: 100%;
  min-width: ${POST_SIZE}px;
  margin: 5px;
`;

export const DisplayPosts = ({
  posts,
  loading = false,
  customMessage = "nothing to see here yet...",
}) => {
  console.log("in display posts", posts);

  // Constants for resize function
  const RESIZE_TIMEOUT = 200;
  const COLUMN_DIVISION = 320;

  // Store number of columns based on window size
  const [columns, setColumns] = useState([]);

  // Helper function to distribute posts into columns
  const distributePosts = (postList, columnNum) => {
    const columnsArray = Array.from({ length: columnNum }, () => []);
    postList.forEach((post, index) => {
      const columnIndex = index % columnNum;
      columnsArray[columnIndex].push(post);
    });
    setColumns(columnsArray);
  };

  //For resizing and distributing posts
  useEffect(() => {
    let resizeTimeout;

    const handleResize = () => {
      clearTimeout(resizeTimeout);

      resizeTimeout = setTimeout(() => {
        const columnNum = Math.max(
          1,
          Math.floor(window.innerWidth / COLUMN_DIVISION)
        );
        distributePosts(posts, columnNum);
      }, RESIZE_TIMEOUT);
    };

    window.addEventListener("resize", handleResize);

    // Initial column distribution
    const initialColumnNum = Math.max(
      1,
      Math.floor(window.innerWidth / COLUMN_DIVISION)
    );
    distributePosts(posts, initialColumnNum);

    return () => {
      clearTimeout(resizeTimeout);
      window.removeEventListener("resize", handleResize);
    };
  }, [posts]);

  return (
    <Container>
      {posts.length === 0 && !loading ? (
        <div className="empty-posts">
          <img
            className="empty-posts-image"
            src="/img/assets/lantern_pin.jpg"
            alt=""
          />
          <span>{customMessage}</span>
        </div>
      ) : (
        columns.map((columnPosts, colIndex) => (
          <Column key={colIndex}>
            {columnPosts.map((post) => (
              <UserPost key={post.id} postInfo={post} postWidth={POST_SIZE} />
            ))}
          </Column>
        ))
      )}
    </Container>
  );
};
