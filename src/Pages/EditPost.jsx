import { useState, useEffect, useRef, useTransition } from "react";
import { useNavigate, useLoaderData } from "react-router-dom";
import _ from "lodash";
import { convertBlobUrlToFile } from "../lib/utils";
import DOMPurify from "dompurify";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faXmark,
  faTriangleExclamation,
} from "@fortawesome/free-solid-svg-icons";
import "../Styles/page_css/CreatePostPage.css";

import { supabase } from "../supabase/supabaseClient";
import { uploadImage } from "../supabase/storageUpload";
import NavBar from "../Components/NavBar";
import Footer from "../Components/Footer";
import { SelectedCosmeticTagDisplay } from "../Components/SelectedCosmeticTagDisplay";
import { CosmeticsTagSearch } from "../Components/CosmeticsTagSearch";
import { ImageCarousel } from "../Components/ImageCarousel";
import { ErrorSpan } from "../Components/ErrorSpan";
import { useAuth } from "../Hooks/authContext";

export default function EditPost() {
  useEffect(() => {
    document.title = "Create Post";
  }, []);

  const { user } = useAuth();
  const postDetails = useLoaderData();
  console.log(postDetails);

  if (!user || !postDetails || user.id !== postDetails.user_id) {
    navigate("/blog");
  }

  const TITLE_CHARACTER_LIMIT = 50;

  //carry over post details
  const imagesArray = postDetails.posts_images.map((image) => {
    return image.public_url;
  });
  const cosmeticTags = postDetails.posts_cosmetic_tags.flatMap(
    (item) => item.cosmetics
  );

  console.log(cosmeticTags);

  const [imageUrls, setImageUrls] = useState([imagesArray]);
  const [title, setTitle] = useState(postDetails.title);
  const [body, setBody] = useState(postDetails.body);

  const [selectedCosmeticTags, setSelectedCosmeticTags] =
    useState(cosmeticTags);
  const [titleCharacterCount, setTitleCharacterCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //error handling variables
  const [titleError, setTitleError] = useState("");
  const [bodyError, setBodyError] = useState("");
  const [imageError, setImageError] = useState("");
  const [cosmeticTagError, setCosmeticTagError] = useState("");

  const navigate = useNavigate();
  const sanitizeInput = (input) => DOMPurify.sanitize(input);
  const imageInputRef = useRef(null);
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDesktop, setIsDesktop] = useState(
    window.matchMedia("(min-width: 974px)").matches
  );

  useEffect(() => {
    //initialize window change listener
    window
      .matchMedia("(min-width: 974px)")
      .addEventListener("change", (e) => setIsDesktop(e.matches));
  }, []);

  useEffect(() => {
    document.body.classList.toggle("no-scroll", showTagSearch);
    return () => document.body.classList.remove("no-scroll");
  }, [showTagSearch]);

  /* tag cosmetics functions start */
  const toggleTagSearch = () => {
    console.log("toggling");
    setShowTagSearch((prev) => !prev);
  };

  const addCosmeticTag = (cosmetic) => {
    if (selectedCosmeticTags.length >= 10) {
      setCosmeticTagError("Cosmetic tag limit reached.");
      return;
    }
    setCosmeticTagError("");
    setSelectedCosmeticTags((prev) =>
      prev.includes(cosmetic) ? prev : [...prev, cosmetic]
    );
  };

  const removeCosmeticTag = (cosmetic) => {
    setSelectedCosmeticTags((prev) =>
      prev.filter((tag) => tag.id !== cosmetic.id)
    );
  };
  /* tag cosmetics functions end */

  /* validation functions start */
  const validateTitle = (title) => {
    title = sanitizeInput(title);

    if (title.length > TITLE_CHARACTER_LIMIT) {
      setTitleError(
        `Title is too long (max ${TITLE_CHARACTER_LIMIT} characters)`
      );
      return false;
    }

    setTitleError("");
    return true;
  };

  const validateBody = (body) => {
    body = sanitizeInput(body);

    if (/<[^>]*script|<\/[^>]*script>/i.test(body)) {
      setBodyError("Post contains potentially unsafe content");
      return false;
    }

    setBodyError("");
    return true;
  };

  /* validation functions end */

  const clearImages = () => {
    setImageUrls([]);
  };

  const calculateCharacterCount = (text) => {
    if (text.length > TITLE_CHARACTER_LIMIT) {
      return;
    }

    setTitle(text);
    setTitleCharacterCount(text.length);
  };

  //submit function
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    if (!validateTitle(title) || !validateBody(body)) {
      setIsSubmitting(false);
      return;
    }

    console.log("Uploading...");

    let urls = [];
    let post_id = postDetails.id;

    if (user.id !== postDetails.user_id) {
      setIsSubmitting(false);
      return;
    }

    try {
      let postError;

      if (post_id) {
        // Update post if editing
        ({ error: postError } = await supabase
          .from("posts")
          .update({ title, body })
          .eq("id", post_id));

        if (postError) {
          console.error("Error updating post:", postError);
          setIsSubmitting(false);
          return;
        }

        console.log("Post updated successfully");
      }

      // Update cosmetic tags: remove old ones and insert new
      if (!_.isEqual(selectedCosmeticTags, cosmeticTags)) {
        console.log("Updating cosmetic tags...");
        await supabase
          .from("posts_cosmetic_tags")
          .delete()
          .eq("post_id", post_id);

        const tagInserts = selectedCosmeticTags.map((tag) => ({
          post_id,
          cosmetic_id: tag.id,
        }));

        const { error: tagError } = await supabase
          .from("posts_cosmetic_tags")
          .insert(tagInserts);

        if (tagError) console.error("Error inserting cosmetic tags:", tagError);
      }

      console.log("Post saved successfully");

      setSelectedCosmeticTags([]);
      setIsSubmitting(false);

      // Direct to blog page
      navigate("/blog");
    } catch (err) {
      console.error("Unexpected error:", err);
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <NavBar page="createPostPage" />
      <div className="post-page-body">
        <div>
          <div className="form-container">
            <input
              ref={imageInputRef}
              type="file"
              hidden
              multiple
              disabled={true}
            />
            <div
              className={`post-creation-container ${
                isDesktop ? "desktop" : "mobile"
              }`}
            >
              <div
                onClick={
                  imageUrls.length === 0
                    ? () => imageInputRef.current?.click()
                    : undefined
                }
                className="add-images"
              >
                <ImageCarousel
                  items={imageUrls}
                  pageContext={"postPage"}
                  errorMessage={imageError}
                ></ImageCarousel>
                <FontAwesomeIcon
                  style={{ display: imageUrls.length === 0 ? "none" : "block" }}
                  onClick={imageUrls.length === 0 ? undefined : clearImages}
                  className="x-icon"
                  icon={faXmark}
                />
              </div>

              <div className="upload-wrapper">
                <div className="inputs-container">
                  {/* title */}
                  <div className="title-container">
                    <span className="input-span">Title</span>
                    <input
                      type="text"
                      className={`text-input ${
                        isDesktop ? "desktop" : "mobile"
                      }`}
                      onChange={(e) => calculateCharacterCount(e.target.value)}
                      maxLength={TITLE_CHARACTER_LIMIT}
                      value={title}
                    />

                    <span className="title-character-count">
                      {titleCharacterCount}/{TITLE_CHARACTER_LIMIT}
                    </span>

                    {titleError.length > 0 ? (
                      <ErrorSpan message={titleError} />
                    ) : (
                      ""
                    )}
                  </div>
                  {/* body*/}
                  <div className="body-container">
                    <span className="input-span">Body</span>
                    <textarea
                      name=""
                      id=""
                      className={`textarea-input ${
                        isDesktop ? "desktop" : "mobile"
                      }`}
                      onChange={(e) => setBody(e.target.value)}
                      value={body}
                    ></textarea>

                    {bodyError.length > 0 ? (
                      <ErrorSpan message={bodyError} />
                    ) : (
                      ""
                    )}
                  </div>

                  {/* tag cosmetics */}
                  <div className="title-container">
                    <span className="input-span">Tag Cosmetics</span>
                    {selectedCosmeticTags.length === 0 ? (
                      <button
                        className="cosmetics-tag-button"
                        onClick={toggleTagSearch}
                      >
                        Add Cosmetics
                      </button>
                    ) : (
                      <SelectedCosmeticTagDisplay
                        selectedCosmeticTags={selectedCosmeticTags}
                        toggleFunction={toggleTagSearch}
                        removeFunction={removeCosmeticTag}
                      />
                    )}
                  </div>

                  {cosmeticTagError.length > 0 ? (
                    <span className="input-span cosmetic-tag-error">
                      <FontAwesomeIcon icon={faTriangleExclamation} />
                      {cosmeticTagError}
                    </span>
                  ) : (
                    ""
                  )}
                </div>
                <button
                  onClick={handleSubmit}
                  className="post-upload-button"
                  disabled={isSubmitting}
                >
                  Edit Post
                </button>
              </div>
            </div>
            <div
              className={`cosmetics-tag-container ${
                showTagSearch ? "slide-in" : "hidden"
              }`}
            >
              <CosmeticsTagSearch
                toggleFunction={toggleTagSearch}
                onTagSelect={addCosmeticTag}
              />
            </div>
          </div>
          <div className="post-upload-button-container"></div>
        </div>
        <Footer></Footer>
      </div>
    </div>
  );
}
