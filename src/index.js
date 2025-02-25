import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import reportWebVitals from "./reportWebVitals";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { supabase } from "./supabase/supabaseClient";
import Community from "./Pages/Community";
import Home from "./Pages/Home";
import PostDetails from "./Pages/PostDetails";
import CosmeticDetails from "./Pages/CosmeticDetails";
import ContactPage from "./Pages/ContactPage";
import SubmissionPage from "./Pages/SubmissionPage";
import CreatePost from "./Pages/CreatePost";
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import UserProfile from "./Pages/UserProfile";
import EditPost from "./Pages/EditPost";
import LikedPosts from "./Pages/LikedPosts";

import OutfitShrine from "./Pages/OutfitShrine";
import ProtectedRoute from "./Route/ProtectedRoute";

import { AuthProvider } from "./Hooks/authContext";
import useProcessPostImages from "./Hooks/useProcessPostImages";

const processPostImages = (posts) => {
  return posts.map((post) => {
    if (post.posts_images.length > 0) {
      post.posts_images = post.posts_images.map((image) => {
        const cleanPath = image.image_url.replace(
          /^\/storage\/v1\/object\/public\/posts_images\//,
          ""
        );

        return {
          ...image,
          public_url: supabase.storage
            .from("posts_images")
            .getPublicUrl(cleanPath).data.publicUrl,
        };
      });
    }
    return post;
  });
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },

  {
    path: "/login",
    element: <Login />,
  },

  {
    path: "/signup",
    element: <Signup />,
  },

  {
    path: "/passwordReset",
    element: <Signup />,
  },

  {
    path: "/cosmetics",
    element: <OutfitShrine />,
  },

  {
    path: "/cosmetics/:id",
    element: <CosmeticDetails />,
    loader: async ({ params }) => {
      const { data, error } = await supabase
        .from("cosmetics")
        .select(
          `
          *,
          cosmetic_types(*),
          cosmetic_images(image_url)
        `
        )
        .eq("id", params.id)
        .single();

      if (error) {
        throw new Response("Cosmetic not found", { status: 404 });
      }

      // determine folder names based on cosmetic type
      const typeName = data.cosmetic_types?.name?.toLowerCase() || "unknown";
      const iconFolder = typeName.includes("props")
        ? "props_icons"
        : `${typeName}_icons`;
      const viewFolder = typeName.includes("props")
        ? "props_view"
        : `${typeName}_view`;

      // generate public URL for the main icon
      const iconPublicUrl = supabase.storage
        .from("cosmetic_images")
        .getPublicUrl(`${iconFolder}/${data.icon}`).data.publicUrl;

      // generate public URLs for each cosmetic image
      const cosmeticImagesWithUrls = data.cosmetic_images.map((image) => ({
        ...image,
        public_url: supabase.storage
          .from("cosmetic_images")
          .getPublicUrl(`${viewFolder}/${image.image_url}`).data.publicUrl,
      }));

      return {
        ...data,
        icon: iconPublicUrl,
        cosmetic_images: cosmeticImagesWithUrls,
      };
    },
  },
  {
    path: "/blog",
    element: <Community />,
    loader: async () => {
      const { data, error } = await supabase
        .from("posts")
        .select("*, posts_images(image_url)")
        .eq("posts_images.is_thumbnail", true)
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        throw new Response("Cosmetic not found", { status: 404 });
      }

      return processPostImages(data);
    },
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/createPost",
        element: <CreatePost />,
      },

      {
        path: "/editPost/:id",
        element: <EditPost />,
        loader: async ({ params }) => {
          const { data, error } = await supabase
            .from("posts")
            .select(
              "*, posts_images(image_url), users(username), posts_cosmetic_tags(cosmetics(*, cosmetic_types(name)))"
            )
            .eq("id", params.id)
            .single();

          if (error) {
            throw new Response("Cosmetic not found", { status: 404 });
          }

          // Process post images
          if (data.posts_images.length > 0) {
            data.posts_images = processPostImages([data])[0].posts_images;
          }

          // Process cosmetic tags with proper folder structure
          data.posts_cosmetic_tags = data.posts_cosmetic_tags.map((tag) => {
            if (tag.cosmetics?.icon) {
              const typeName =
                tag.cosmetics.cosmetic_types?.name?.toLowerCase() || "unknown";
              const folder = typeName.includes("props")
                ? "props_icons"
                : `${typeName}_icons`;

              tag.cosmetics.icon = supabase.storage
                .from("cosmetic_images")
                .getPublicUrl(`${folder}/${tag.cosmetics.icon}`).data.publicUrl;
            }
            return tag;
          });

          return data;
        },
      },

      {
        path: "/profile/:username",
        element: <UserProfile />,
        loader: async ({ params }) => {
          const { data, error } = await supabase
            .from("users")
            .select("*, posts(*, posts_images(image_url))")
            .eq("username", params.username)
            .order("created_at", { referencedTable: "posts", ascending: false })
            .single();

          if (error) {
            throw new Response("User not found", { status: 404 });
          }

          if (data.posts.length > 0) {
            data.posts = processPostImages(data.posts);
          }

          return data;
        },
      },

      {
        path: "/blog/:id",
        element: <PostDetails />,
        loader: async ({ params }) => {
          const { data, error } = await supabase
            .from("posts")
            .select(
              `
                *, 
                posts_images(image_url), 
                users(username), 
                posts_comments(*, users(username, pfp)), 
                posts_cosmetic_tags(*)
              `
            )
            .eq("id", params.id)
            .single();

          if (error) {
            throw new Response("post not found", { status: 404 });
          }

          // Process images
          if (data.posts_images?.length > 0) {
            data.posts_images = processPostImages([data])[0].posts_images;
          }

          // Fetch related cosmetic posts
          const { data: cosmeticData, error: cosmeticError } = await supabase
            .from("posts_cosmetic_tags")
            .select(
              `
                *, 
                posts(*, posts_images(image_url))
              `
            )
            .in(
              "cosmetic_id",
              data.posts_cosmetic_tags.map((tag) => tag.cosmetic_id)
            );

          if (cosmeticError) {
            throw new Error(
              "Error fetching cosmetic posts: " + cosmeticError.message
            );
          }

          // Filter out the current post
          let posts = cosmeticData
            .map((entry) => entry.posts)
            .flat()
            .filter((post) => post.id !== data.id);

          posts = processPostImages(posts);

          // Return the data along with the cosmetic posts
          return { postDetails: data, cosmeticPosts: posts };
        },
      },
    ],
  },
]);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <AuthProvider>
    <React.StrictMode>
      <RouterProvider router={router} />
    </React.StrictMode>
  </AuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
