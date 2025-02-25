import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useLoaderData, BrowserRouter } from "react-router-dom";
import UserPost from "../Components/UserPost";
import PostDetails from "../Pages/PostDetails";
import Community from "../Pages/Community";
import { faHouse, faPlus, faHeart } from "@fortawesome/free-solid-svg-icons";

const mockPost = {
  id: "1",
  user_id: "0",
  title: "mock post!!",
  body: "this is a post dedicaated to the jest tests.",
  image: "picture.jpg",
  likes: 0,
};

const mockPostList = [
  {
    id: "1",
    user_id: "0",
    title: "mock post 1",
    body: "first mock post content body ",
    image: "image1.jpg",
    likes: 5,
  },
  {
    id: "2",
    user_id: "1",
    title: "mock post 2",
    body: "second mock post content body",
    image: "image2.jpg",
    likes: 3,
  },
  {
    id: "3",
    user_id: "2",
    title: "mock post 3",
    body: "third mock post content body",
    image: "image3.jpg",
    likes: 10,
  },
];

jest.mock("react-router-dom", () => ({
  ...jest.requireActual("react-router-dom"),
  useLoaderData: jest.fn(),
}));

//render a single user post seen in blog page
function renderUserPost() {
  //surrounding in browser router bc the post is surrounded by Link (?)
  render(
    <BrowserRouter>
      <UserPost postInfo={mockPost} />
    </BrowserRouter>
  );
}

//render the entire blog page (navabr + three userPosts)
function renderBlogPage() {
  useLoaderData.mockReturnValue(mockPostList);
  render(
    <BrowserRouter>
      <Community />
    </BrowserRouter>
  );
}

//render entire post details page
function renderPostDetails() {
  useLoaderData.mockReturnValue(mockPost);
  render(
    <BrowserRouter>
      <PostDetails />
    </BrowserRouter>
  );
}

function renderLikedPage() {}

//test 1
test("rendering posts on blog page", () => {
  renderUserPost();

  // assertions
  expect(screen.getByText("mock post!!")).toBeInTheDocument();
  expect(screen.getByAltText("picture.jpg")).toBeInTheDocument();

  const heartIcon = document.querySelector(".post-heart");
  expect(heartIcon).toHaveClass("post-heart");
});

//test 2
test("liking posts from blog page", async () => {
  renderUserPost();

  //expect the heart color to be #cccccc (grey)
  const heartIcon = document.querySelector(".post-heart");
  let color = heartIcon.getAttribute("color");
  expect(color).toBe("#cccccc");

  //click the heart
  fireEvent.click(heartIcon);

  //expect the heart color to be #d94e72 (red) after animation
  await waitFor(() => {
    color = heartIcon.getAttribute("color");
    expect(color).toBe("#d94e72");
  });
});

//test 3
test("render post details page", async () => {
  renderPostDetails();

  //assertions
  expect(screen.getByText(mockPost.title)).toBeInTheDocument();
  expect(screen.getByText(mockPost.body)).toBeInTheDocument();
  expect(screen.getByAltText(mockPost.image)).toHaveAttribute(
    "src",
    "/img/" + mockPost.image
  );
});

//test 4
test("liking post from post details page", async () => {
  renderPostDetails();

  //expect the heart color to be #cccccc (grey)
  const heartIcon = document.querySelector(".post-heart");
  let color = heartIcon.getAttribute("color");
  expect(color).toBe("#cccccc");

  //click the heart
  fireEvent.click(heartIcon);

  //expect the heart color to be #d94e72 (red) after animation
  await waitFor(() => {
    color = heartIcon.getAttribute("color");
    expect(color).toBe("#d94e72");
  });
});

//test 5
test("rendering three liked posts on blog page", async () => {
  renderBlogPage();

  //there should be three hearts total
  const hearts = await screen.findAllByTestId("like-button");
  expect(hearts).toHaveLength(3);

  //each should be unliked (grey)
  hearts.forEach((heart) => {
    expect(heart).toHaveAttribute("color", "#cccccc");
  });

  //click all three
  for (let i = 0; i < hearts.length; i++) {
    const heartIcon = hearts[i];
    fireEvent.click(heartIcon);

    // wait for the color to change to red (#d94e72)
    await waitFor(() => {
      const color = heartIcon.getAttribute("color");
      expect(color).toBe("#d94e72");
    });
  }
});

//test 6
test("rendering navbar on blog page", async () => {
  renderBlogPage();

  //has home button
  const homeButton = screen.getByTestId("home-button");
  expect(homeButton).toBeInTheDocument();
  expect(homeButton.querySelector("svg")).toHaveAttribute(
    "data-icon",
    faHouse.iconName
  );

  //has community button
  const communityButton = screen.getByTestId("community-button");
  expect(communityButton).toBeInTheDocument();
  expect(communityButton).toHaveTextContent("Community");

  //has cosmetics button
  const cosmeticsButton = screen.getByTestId("cosmetics-button");
  expect(cosmeticsButton).toBeInTheDocument();
  expect(cosmeticsButton).toHaveTextContent("Cosmetics");

  //has post (plus) icon
  const plusButton = screen.getByTestId("post-button");
  expect(plusButton).toBeInTheDocument();
  expect(plusButton.querySelector("svg")).toHaveAttribute(
    "data-icon",
    faPlus.iconName
  );

  //has heart icon
  const heartButton = screen.getByTestId("likedPosts-button");
  expect(heartButton).toBeInTheDocument();
  expect(heartButton.querySelector("svg")).toHaveAttribute(
    "data-icon",
    faHeart.iconName
  );

  //has searchbar
  const searchBar = screen.getByTestId("searchBar");
  expect(searchBar).toBeInTheDocument();
  expect(searchBar).toHaveAttribute("placeholder", "Search posts...");
});

//test 7
test("unliking posts on blog page", async () => {
  renderUserPost();

  //expect the heart color to be #cccccc (grey)
  const heartIcon = document.querySelector(".post-heart");
  let color = heartIcon.getAttribute("color");
  expect(color).toBe("#cccccc");

  //click the heart
  fireEvent.click(heartIcon);

  //expect the heart color to be #d94e72 (red) after animation
  await waitFor(() => {
    color = heartIcon.getAttribute("color");
    expect(color).toBe("#d94e72");
  });

  //click again to unlike
  fireEvent.click(heartIcon);

  //color should be grey again
  await waitFor(() => {
    color = heartIcon.getAttribute("color");
    expect(color).toBe("#cccccc");
  });
});

//test 8
test("unliking posts in post details page", async () => {
  renderPostDetails();

  //expect the heart color to be #cccccc (grey)
  const heartIcon = document.querySelector(".post-heart");
  let color = heartIcon.getAttribute("color");
  expect(color).toBe("#cccccc");

  //click the heart
  fireEvent.click(heartIcon);

  //expect the heart color to be #d94e72 (red) after animation
  await waitFor(() => {
    color = heartIcon.getAttribute("color");
    expect(color).toBe("#d94e72");
  });

  //click again to unlike
  fireEvent.click(heartIcon);

  //color should be grey again
  await waitFor(() => {
    color = heartIcon.getAttribute("color");
    expect(color).toBe("#cccccc");
  });
});

//test 9
test("searching for a post", async () => {
  renderBlogPage();

  //search for the second post
  const searchBar = screen.getByTestId("searchBar");
  fireEvent.change(searchBar, { target: { value: "mock post 2" } });

  //expect only the second post to be displayed
  const posts = await screen.findAllByTestId("user-post");
  expect(posts).toHaveLength(1);
  expect(posts[0]).toHaveTextContent("mock post 2");
});

//test 10
test("being able to edit post as the owner in post details", async () => {
  renderPostDetails();

  //edit post button should be present
  const editButton = screen.getByText("edit post");
  expect(editButton).toBeInTheDocument();
  fireEvent.click(editButton);

  //expect to be redirected to edit post page
  expect(window.location.pathname).toBe("/editPost/1");
});
