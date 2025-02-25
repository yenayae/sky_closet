import { useState, useEffect, useRef, useTransition } from "react";
import { useNavigate } from "react-router-dom";
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

export default function CreatePost() {
  useEffect(() => {
    document.title = "Create Post";
  }, []);

  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user === undefined) {
      navigate("/login");
      return;
    }
    if (!user) navigate("/login");
  }, [user, navigate]);

  const TITLE_CHARACTER_LIMIT = 50;

  const [imageUrls, setImageUrls] = useState([]);
  const [selectedCosmeticTags, setSelectedCosmeticTags] = useState([]);
  const [titleCharacterCount, setTitleCharacterCount] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //error handling variables
  const [titleError, setTitleError] = useState("");
  const [bodyError, setBodyError] = useState("");
  const [imageError, setImageError] = useState("");
  const [cosmeticTagError, setCosmeticTagError] = useState("");

  const sanitizeInput = (input) => DOMPurify.sanitize(input);
  const imageInputRef = useRef(null);
  const [showTagSearch, setShowTagSearch] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isDesktop, setIsDesktop] = useState(
    window.matchMedia("(min-width: 974px)").matches
  );

  useEffect(() => {
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

  const validateImages = (filesArray, imageUrls, setImageUrls) => {
    if (filesArray.length + imageUrls.length > 5) {
      setImageError("Maximum of 5 images allowed per post.");
      return;
    }

    console.log(filesArray);

    let hasError = false;
    const validImages = [];

    const promises = filesArray.map((file) => {
      return new Promise((resolve) => {
        const img = new Image();
        const objectURL = URL.createObjectURL(file);
        img.src = objectURL;

        img.onload = () => {
          const { width, height } = img;

          if (file.size > 25e6) {
            console.log("file size", file.size);
            setImageError("Image files must be under 25MB.");
            hasError = true;
            resolve(false);
          } else if (width < 200 || height < 300) {
            console.log("width", width, "height", height);
            setImageError(`Images must be at least 200x300 pixels.`);
            hasError = true;
            resolve(false);
          } else if (width / height > 4) {
            setImageError(`Image aspect ratio can not exceed 4:1.`);
            hasError = true;
            resolve(false);
          } else {
            console.log("valid image");
            validImages.push(objectURL);
            resolve(true);
          }
        };

        img.onerror = () => {
          console.log("invalid image");
          setImageError(`Invalid image file`);
          hasError = true;
          resolve(false);
        };
      });
    });

    Promise.all(promises).then((results) => {
      if (results.every(Boolean)) {
        setImageUrls([...imageUrls, ...validImages]);
        setImageError("");
      } else {
        console.log("Some images are invalid. No images were uploaded.");
      }
    });
  };

  /* validation functions end */

  const handleImageChange = (event) => {
    if (event.target.files) {
      const filesArray = Array.from(event.target.files);

      //validate images
      validateImages(filesArray, imageUrls, setImageUrls);
    }
  };

  const clearImages = () => {
    setImageUrls([]);
  };

  const calculateCharacterCount = (text) => {
    console.log(text.length);

    if (text.length > TITLE_CHARACTER_LIMIT) {
      return;
    }

    setTitleCharacterCount(text.length);
  };

  //submit function
  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const title = document.querySelector(".title-container input").value;
    const body = document.querySelector(".body-container textarea").value;

    if (!validateTitle(title) || !validateBody(body)) {
      setIsSubmitting(false);
      return;
    }

    if (title.length === 0 && body.length === 0 && imageUrls.length === 0) {
      console.log("No content to upload.");
      setIsSubmitting(false);
      return;
    }

    console.log("Uploading...");

    let urls = [];

    // Upload images first
    if (imageUrls.length > 0) {
      for (const url of imageUrls) {
        try {
          const imageFile = await convertBlobUrlToFile(url);
          const { imageUrl, error: uploadError } = await uploadImage({
            file: imageFile,
            bucket: "posts_images",
          });

          if (uploadError) {
            console.error("Error uploading image:", uploadError);
            continue; // Continue processing other images instead of stopping
          }

          urls.push(imageUrl);
        } catch (err) {
          console.error("Unexpected error in image upload:", err);
        }
      }
      setImageUrls([]); // Reset after all uploads are complete
    }

    try {
      // Insert post
      const { data: postData, error: postError } = await supabase
        .from("posts")
        .insert([{ user_id: user.id, title, body, likes: 0 }])
        .select(); // Ensure we get back the inserted data

      if (postError) {
        console.error("Error inserting post:", postError);
        setIsSubmitting(false);
        return;
      }

      const post_id = postData?.[0]?.id;
      if (!post_id) {
        console.error("Failed to retrieve post ID.");
        setIsSubmitting(false);
        return;
      }

      // Insert images
      if (urls.length > 0) {
        const imageInserts = urls.map((url, index) => ({
          post_id,
          image_url: url,
          is_thumbnail: index === 0,
        }));

        const { error: imageError } = await supabase
          .from("posts_images")
          .insert(imageInserts);
        if (imageError)
          console.error("Error inserting post images:", imageError);
      }

      // Insert cosmetic tags
      if (selectedCosmeticTags.length > 0) {
        const tagInserts = selectedCosmeticTags.map((tag) => ({
          post_id,
          cosmetic_id: tag.id,
        }));

        console.log(tagInserts);
        const { error: tagError } = await supabase
          .from("posts_cosmetic_tags")
          .insert(tagInserts);
        if (tagError) console.error("Error inserting cosmetic tags:", tagError);
      }

      console.log("Post uploaded successfully:", postData);

      setSelectedCosmeticTags([]);
      setIsSubmitting(false);

      //direct to blog page
      navigate("/blog");
    } catch (err) {
      console.error("Unexpected error:", err);
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
              disabled={isPending}
              onChange={handleImageChange}
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
                    ></textarea>

                    {bodyError.length > 0 ? (
                      <ErrorSpan message={bodyError} />
                    ) : (
                      ""
                    )}
                  </div>
                  {/* tags */}
                  {/* <div className="title-container">
              <span className="input-span">Tags</span>
              <input
                type="text"
                className={`text-input ${isDesktop ? "desktop" : "mobile"}`}
              />
            </div> */}

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
                  disabled={isPending}
                >
                  Upload
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
