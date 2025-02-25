import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

import "../Styles/styles.css";

export const ErrorSpan = ({ message }) => {
  return (
    <span className="input-span error">
      <FontAwesomeIcon icon={faTriangleExclamation} /> {message}
    </span>
  );
};
