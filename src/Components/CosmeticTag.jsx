import { useState } from "react";
import useFormatName from "../Hooks/formatName";

export const CosmeticTag = ({ cosmetic, onClick }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [iconLoaded, setIconLoaded] = useState(false);

  const iconUrl = cosmetic.icon;
  const displayUrl = cosmetic.cosmetic_images[0].public_url;
  const formattedName = useFormatName(cosmetic.name);

  return (
    <div
      className="cts-tag"
      style={{
        opacity: imageLoaded ? 1 : 0,
        transition: "opacity 0.3s ease",
      }}
      onClick={onClick}
    >
      <div className="cts-images">
        <img
          className="cts-icon"
          src={iconUrl}
          alt={`${formattedName} icon}`}
          onLoad={() => setIconLoaded(true)}
          style={{
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        />
        <img
          className="cts-display"
          src={displayUrl}
          alt={formattedName}
          onLoad={() => setImageLoaded(true)}
          style={{
            opacity: imageLoaded ? 1 : 0,
            transition: "opacity 0.2s ease",
          }}
        />
      </div>
      <span className="cts-name">{formattedName}</span>
    </div>
  );
};
