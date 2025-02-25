import React from "react";
import "../Styles/components/optionsMenu.css";

const OptionsMenu = React.memo(({ options, showOptionsMenu, pageContext }) => {
  if (!showOptionsMenu) return null; // Hide menu if showOptionsMenu is false

  return (
    <div className={`options-menu ${pageContext}`}>
      {options.map(({ label, action }, index) => (
        <span key={index} className="options-item" onClick={action}>
          {label}
        </span>
      ))}
    </div>
  );
});

export default OptionsMenu;
