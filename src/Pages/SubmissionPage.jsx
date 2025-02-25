import { Link } from "react-router-dom";
import NavBar from "../Components/NavBar";
import { useEffect, useState } from "react";

import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Styles/submissionPage.css";

const SubmissionPage = () => {
  useState(() => {
    document.title = "Success!";
  }, []);

  const notify = () => toast("Submitted successfully!");

  useEffect(() => {
    notify();
  }, []);

  return (
    <div>
      <NavBar></NavBar>
      <div className="submission-container">
        <ToastContainer />
        <h1>submission success!</h1>

        <p>thanks so much for the feedback!!</p>
        <img src="/img/assets/cute-cat.gif" alt="cat gif" />

        <Link to="/">
          <span>return to home!</span>
        </Link>
      </div>
    </div>
  );
};

export default SubmissionPage;
