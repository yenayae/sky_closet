import { useState } from "react";

export const CosmeticCarouselItem = ({ item, width, cosmeticType }) => {
  const [loading, setLoading] = useState(true);

  if (cosmeticType.includes("props")) {
    cosmeticType = "props";
  }

  console.log(item);

  const handleImageLoad = () => {
    setLoading(false);
  };

  return (
    <div className="carousel-item" style={{ width: width }}>
      <div></div>
      <img
        key={item.id}
        src={item.public_url}
        alt={item.alt_caption}
        className="carousel-img"
        onLoad={() => handleImageLoad()}
        style={{
          opacity: loading ? 0 : 1,
          transition: "opacity 0.2s ease",
        }}
      />
    </div>
  );
};
