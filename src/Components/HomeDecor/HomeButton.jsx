import { Link } from "react-router-dom";

import "../../Styles/components/home/fancyButton.css";

const HomeButton = ({ toLink, textContent }) => {
  return (
    <Link to={toLink}>
      <div className="cta-wrapper2">
        <div className="cta-wrapper">
          <button class="cta">
            <span class="hover-underline-animation"> {textContent} </span>
          </button>
        </div>
      </div>
    </Link>
  );
};

export default HomeButton;
