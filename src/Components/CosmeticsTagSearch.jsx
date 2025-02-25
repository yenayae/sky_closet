import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

import "../Styles/components/cosmeticsTagSearch.css";
import { useState } from "react";
import { supabase } from "../supabase/supabaseClient";

import { CosmeticTag } from "./CosmeticTag";

export const CosmeticsTagSearch = ({ toggleFunction, onTagSelect }) => {
  const [cosmeticTags, setCosmeticTags] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const query = e.target.elements.searchInput.value.trim();

    const { data, error } = await supabase
      .from("cosmetics")
      .select("*, cosmetic_images(image_url), cosmetic_types(name)")
      .ilike("name", `%${query}%`)
      .limit(20);

    if (error) {
      console.error("Error fetching cosmetics:", error);
      setLoading(false);
      return;
    }

    // Process each cosmetic to include public URLs
    const formattedData = data.map((cosmetic) => {
      const typeName =
        cosmetic.cosmetic_types?.name?.toLowerCase() || "unknown";
      const iconFolder = typeName.includes("props")
        ? "props_icons"
        : `${typeName}_icons`;
      const viewFolder = typeName.includes("props")
        ? "props_view"
        : `${typeName}_view`;

      // Generate public URL for the main icon
      const iconPublicUrl = supabase.storage
        .from("cosmetic_images")
        .getPublicUrl(`${iconFolder}/${cosmetic.icon}`).data.publicUrl;

      // Generate public URLs for each cosmetic image
      const cosmeticImagesWithUrls = cosmetic.cosmetic_images.map((image) => ({
        ...image,
        public_url: supabase.storage
          .from("cosmetic_images")
          .getPublicUrl(`${viewFolder}/${image.image_url}`).data.publicUrl,
      }));

      return {
        ...cosmetic,
        icon: iconPublicUrl,
        cosmetic_images: cosmeticImagesWithUrls,
      };
    });

    setCosmeticTags(formattedData);
    setLoading(false);
  };

  const handleTagClick = (cosmetic) => {
    onTagSelect(cosmetic);
    toggleFunction();
  };

  return (
    <div className="cts-container">
      <div className="cts-header">
        <span className="cts-header-name">Cosmetic Tags</span>
        <FontAwesomeIcon
          icon={faXmark}
          className="cts-close"
          onClick={toggleFunction}
        />
      </div>

      <div className="cts-search-wrapper">
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="searchInput"
            placeholder="Search for cosmetics..."
            className="cts-search-bar"
          />
        </form>
      </div>

      <div className="cts-results">
        {loading ? (
          <div className="loader">Loading...</div>
        ) : (
          <>
            <div className="cts-column">
              {cosmeticTags
                .filter((_, index) => index % 2 === 0)
                .map((cosmetic) => (
                  <CosmeticTag
                    key={cosmetic.id}
                    cosmetic={cosmetic}
                    onClick={() => handleTagClick(cosmetic)}
                  />
                ))}
            </div>

            <div className="cts-column">
              {cosmeticTags
                .filter((_, index) => index % 2 !== 0)
                .map((cosmetic) => (
                  <CosmeticTag
                    key={cosmetic.id}
                    cosmetic={cosmetic}
                    onClick={() => handleTagClick(cosmetic)}
                  />
                ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
