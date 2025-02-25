import "../Styles/components/starDivider.css";

const StarDivider = ({ sectionName }) => {
  return (
    <div className="star-divider">
      <img src="/img/assets/divider/moon_left.png" alt="divider" />
      <span className="divider-name">{sectionName}</span>
      <img src="/img/assets/divider/moon_right.png" alt="divider" />
    </div>
  );
};

export default StarDivider;
