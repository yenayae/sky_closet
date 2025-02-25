export const FileCarouselItem = ({ item, itemIndex, height }) => {
  return (
    <div className={`file-carousel-item`} style={{ height: height }}>
      <img key={`${itemIndex}`} src={item} className="file-carousel-img" />
    </div>
  );
};
