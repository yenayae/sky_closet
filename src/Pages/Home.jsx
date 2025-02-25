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

  return (
    <div>
      <HomeNavBar />
      <div className="content">
        <div
          className="home-banner"
          style={{
            backgroundImage: `url("/img/assets/home/night_sky.jpeg")`,
          }}
        >
          <div className="banner-content">
            <div className="logo-wrapper">
              <img
                className="sky-logo"
                src="/img/assets/home/sky_logo.png"
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
                <DecorPost
                  image="/img/assets/home/color_post.jpg"
                  width={240}
                />
              </div>
              <div className="decor-post2">
                <DecorPost
                  image="/img/assets/home/dance_post.jpg"
                  width={300}
                />
              </div>
            </div>
          </div>
          <div className="right-card">
            <div className="home-card">
              <h2>explore other sky kids outfits</h2>
              <div className="card1-button">
                <HomeButton toLink="/blog" textContent="explore posts" />
              </div>
            </div>
          </div>
        </div>

        <div className="home-body card2">
          <div className="left-card">
            <div className="home-card">
              <h2>share your own outfits!</h2>
              <div className="card1-button">
                <HomeButton toLink="/login" textContent="join the community" />
              </div>
            </div>
          </div>
          <div className="right-card">
            <img
              className="card2-image"
              src="/img/assets/home/pin.png"
              alt=""
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
