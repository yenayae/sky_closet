import styled, { keyframes } from "styled-components";
import "../Styles/temp.css";

const fadeIn = keyframes`
  0% {
    opacity: 0;
    transform: translateY(10px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const FooterContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: grey;

  animation: ${fadeIn} 0.5s ease-out;
`;

// const FooterIcon = styled.img`
//   height: 150px;
//   width: auto;
// `;

const FooterDivider = styled.hr`
  overflow: visible; /* For IE */
  padding: 0;
  border: none;
  border-top: medium double grey;
  color: grey;
  text-align: center;
  width: 100%;

  &:after {
    content: "✧";
    display: inline-block;
    position: relative;
    top: -0.8em;
    font-size: 1em;
    padding: 0 0.75em;
    background: white;
    z-index: 1;
  }
`;

export default function Footer() {
  return (
    <FooterContainer>
      {/* <img
        className="footer-icon"
        src="/img/assets/Soulmates_in_Sky_Pins.webp"
        alt="footer icon"
      /> */}

      <FooterDivider />
      {/* <span>&copy; Sky: Children of the Light</span> */}
    </FooterContainer>
  );
}
