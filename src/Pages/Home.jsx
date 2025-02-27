import NavBar from "../Components/NavBar";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useState } from "react";

import { useAuth } from "../Hooks/authContext";

import HomeButton from "../Components/HomeDecor/HomeButton";
import DecorPost from "../Components/HomeDecor/DecorPost";
import HomeNavBar from "../Components/HomeDecor/HomeNavBar";

import "../Styles/contactButton.css";
import "../Styles/styles.css";
import "../Styles/page_css/home.css";

const Home = () => {
  const { user } = useAuth();
  const imagePath = "img/assets/home/";

  const decorIcons = ["head", "hair", "mask", "necklace", "cape", "outfit"];
  const [icons, setIcons] = useState([...decorIcons, ...decorIcons]);

  return (
    <div>
      <HomeNavBar />
      <div className="content">
        <div
          className="home-banner"
          style={{
            backgroundImage: `url("/img/assets/home/night_sky.png")`,
          }}
        >
          <div className="banner-content">
            <div className="logo-wrapper">
              <img
                className="sky-logo"
                src={`${imagePath}sky_logo.png`}
                alt="sky logo"
              />
              <span className="closet-span">sky closet</span>
            </div>
            <div className="home-button">
              <HomeButton
                toLink="/cosmetics"
                textContent={"to outfit shrine"}
              />
            </div>
          </div>
        </div>

        <div className="home-body card1">
          <div className="left-card">
            <div className="decor-posts">
              <div className="decor-post1">
                <DecorPost image={`${imagePath}color_post.jpg`} width={240} />
              </div>
              <div className="decor-post2">
                <DecorPost image={`${imagePath}dance_post.jpg`} width={300} />
              </div>
            </div>
          </div>
          <div className="right-card">
            <div className="home-card">
              <h2>explore other sky kids outfits</h2>
              <p>See how other Sky kids have decorated themselves</p>
              <div className="card1-button">
                <HomeButton toLink="/blog" textContent="explore posts" />
              </div>
            </div>
          </div>
        </div>

        <div className="home-body card2">
          <div className="left-card">
            <div className="home-card">
              <h2>join the community!</h2>
              <p>
                Share your own outfits and become a part of our cosmetics
                gallery
              </p>
              <div className="card1-button">
                <HomeButton toLink="/login" textContent="make an account" />
              </div>
            </div>
          </div>
          <div className="right-card">
            <div className="decor-icon-layout">
              {/* <img
                className="card2-image"
                src={`${imagePath}pink_outfit.jpg`}
                alt="img"
              /> */}

              <DecorPost
                image={`${imagePath}pink_outfit.jpg`}
                width={300}
                heart={false}
              />
              <div className="decor-icon-wrapper">
                <div className="decor-icon-slider">
                  {icons.map((icon) => (
                    <img
                      className="decor-icon"
                      src={`${imagePath}${icon}_icon.png`}
                      alt=""
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
