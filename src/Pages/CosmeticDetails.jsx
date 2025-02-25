import { useLoaderData, useNavigate } from "react-router";
import { useEffect, useState } from "react";
import styled from "styled-components";

import NavBar from "../Components/NavBar";
import CosmeticIcon from "../Components/CosmeticIcon";
import { ImageCarousel } from "../Components/ImageCarousel";
import { DisplayPosts } from "../Components/DisplayPosts";
import StarDivider from "../Components/StarDivider";

import { supabase } from "../supabase/supabaseClient";
import useFormatName from "../Hooks/formatName";
import useFormatPrice from "../Hooks/formatPrice";
import useProcessPostImages from "../Hooks/useProcessPostImages";

import "../Styles/page_css/cosmeticDetails.css";

function extractName(name) {
  return name
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const CosmeticDetails = () => {
  const cosmeticInfo = useLoaderData();
  const navigate = useNavigate();
  const processPostImages = useProcessPostImages();

  const cosmeticImages = cosmeticInfo.cosmetic_images;
  const cosmeticType = cosmeticInfo.cosmetic_types.name;

  const [cosmeticPosts, setCosmeticPosts] = useState([]);
  const [fetchingPosts, setFetchingPosts] = useState(true);

  console.log(cosmeticInfo);

  //any user posts with cosmetic tag
  useEffect(() => {
    const fetchCosmeticPosts = async () => {
      setFetchingPosts(true);
      const { data, error } = await supabase
        .from("posts_cosmetic_tags")
        .select(
          `
          *,
          posts(*, posts_images(image_url))
        `
        )
        .eq("cosmetic_id", cosmeticInfo.id);

      if (error) {
        throw new Error("Error fetching posts: " + error.message);
      }

      console.log(data);

      const posts = data.map((entry) => entry.posts).flat();
      processPostImages(posts);

      setCosmeticPosts(posts);
      setFetchingPosts(false);
    };

    fetchCosmeticPosts();
  }, []);

  //set tab name to cosmetic name
  const cosmeticName = extractName(cosmeticInfo.name);
  useState(() => {
    document.title = cosmeticName;
  }, []);

  //for navbar search redirect
  const handleSearchRedirect = (searchTerm) => {
    navigate(`/cosmetics?search=${encodeURIComponent(searchTerm)}`);
  };

  return (
    <div>
      <NavBar page="cosmeticDetails" onSearch={handleSearchRedirect}></NavBar>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div className="cosmetic-details">
          <ImageCarousel
            items={cosmeticImages}
            cosmeticType={cosmeticType}
            pageContext={"cosmeticDetails"}
          />

          <div className="cosmetic-details-container">
            <div className="cosmetic-details-header">
              <h1 className="cosmetic-details-name">
                {useFormatName(cosmeticName)}
              </h1>
            </div>
            <div>
              <CosmeticIcon
                key={cosmeticInfo.id}
                cosmetic={cosmeticInfo}
                index={10}
              ></CosmeticIcon>
              <p>
                Price:{" "}
                {useFormatPrice(cosmeticInfo.costNum, cosmeticInfo.costType)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {cosmeticPosts.length > 0 && (
        <div>
          <StarDivider sectionName={"sky kids gallery"} />
          <div className="relevant-posts">
            <DisplayPosts posts={cosmeticPosts} loading={fetchingPosts} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CosmeticDetails;
