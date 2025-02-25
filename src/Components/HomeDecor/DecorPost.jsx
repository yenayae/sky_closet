import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart } from "@fortawesome/free-solid-svg-icons";

import "../../Styles/components/home/decorPost.css";

const DecorPost = ({ image, width }) => {
  return (
    <div
      className="decor-post"
      style={{
        width: `${width}px`,
      }}
    >
      <img
        className="decor-post-image"
        src={image}
        alt="post image"
        style={{
          width: `${width}px`,
        }}
      />
      <FontAwesomeIcon icon={faHeart} className="decor-heart-icon" />
    </div>
  );
};

export default DecorPost;
