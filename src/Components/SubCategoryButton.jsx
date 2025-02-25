import "../Styles/styles.css";
import styled from "styled-components";
import { useState } from "react";
import useFormatName from "../Hooks/formatName";

const SubButton = styled.button`
  cursor: pointer;
  height: auto;
  width: 150px;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-bottom: 5px solid rgba(20, 18, 14, 0);
  background: none;
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(20, 18, 14, 0.5);
    color: white;
  }
`;

const SubButtonImg = styled.img`
  height: 45px;
`;

const Tooltip = styled.div`
  position: absolute;
  background-color: black;
  color: white;
  padding: 5px 10px;
  border-radius: 2px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s;
  z-index: 10;
  transform: translate(12px, 19px); /* Center above cursor */

  ${(props) =>
    props.show &&
    `
    opacity: 1;
    pointer-events: auto;
  `}
`;

export default function SubCategoryButton({
  categoryName,
  onClick,
  isSelected,
}) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const displayCategoryName = useFormatName(categoryName);

  return (
    <div>
      <SubButton
        className={`${isSelected ? "selected" : ""}`}
        onClick={onClick}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onMouseMove={(e) => setTooltipPos({ x: e.clientX, y: e.clientY })}
      >
        <SubButtonImg
          src={`/img/closet_icons/subcategories/${categoryName}_icon.png`}
          alt={`${categoryName} icon`}
        />
        {showTooltip && (
          <Tooltip
            show={showTooltip}
            style={{
              top: tooltipPos.y,
              left: tooltipPos.x,
              position: "fixed", // Ensure it follows the cursor globally
            }}
          >
            {displayCategoryName}
          </Tooltip>
        )}
      </SubButton>
    </div>
  );
}
