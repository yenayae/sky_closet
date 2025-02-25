import "../Styles/contactPage.css";
import styled from "styled-components";
import NavBar from "../Components/NavBar";
import { useState } from "react";
import { useNavigate } from "react-router";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 1px solid #b9b2ac;
  border-radius: 5px;
  padding: 5px 20px;
  color: white;
  width: 60%;
  margin: 0 auto;
`;

const ContactInput = styled.input`
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #b9b2ac;
  color: #b9b2ac;
`;

const ContactTextarea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin-top: 5px;
  border: 1px solid #b9b2ac;
  color: #b9b2ac;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-bottom: 10px;
  width: 102%;
  font-size: 0.9em;
`;

const ContactPage = () => {
  useState(() => {
    document.title = "Contact Page";
  }, []);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "inquiry",
    message: "",
    contactMethod: "",
    terms: false,
  });

  const [errors, setErrors] = useState({});
  let navigate = useNavigate();

  const handleInputChange = (e) => {
    const { id, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [id]: type === "checkbox" ? checked : value,
    });
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "name is required.";
    if (!formData.email) newErrors.email = "email is required.";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "email is invalid.";
    }
    if (!formData.message) newErrors.message = "please leave a message!";

    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateForm();
    setErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      console.log("Form submitted successfully!");
      //send over to submission page
      navigate("/success");
    }
  };

  return (
    <div>
      <NavBar />
      <Container>
        <h1>Contact Me!</h1>

        <ContactForm onSubmit={handleSubmit}>
          <ContactInput
            id="name"
            type="text"
            placeholder="name"
            value={formData.name}
            onChange={handleInputChange}
          />
          {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}

          <ContactInput
            id="email"
            type="email"
            placeholder="email"
            value={formData.email}
            onChange={handleInputChange}
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}

          <select
            id="subject"
            name="subject"
            value={formData.subject}
            onChange={handleInputChange}
          >
            <option value="inquiry">general inquiry</option>
            <option value="feedback">feedback</option>
            <option value="support">support</option>
          </select>

          <ContactTextarea
            id="message"
            placeholder="leave a message <3!"
            value={formData.message}
            onChange={handleInputChange}
          />
          {errors.message && <ErrorMessage>{errors.message}</ErrorMessage>}

          <div id="radio-buttons">
            <label>are you an avid player of sky: children of the light?</label>
            <div>
              <input
                type="radio"
                id="yesPlayer"
                name="playerStatus"
                value="yes"
                onChange={handleInputChange}
              />
              <label htmlFor="yesPlayer">yes</label>
            </div>
            <div>
              <input
                type="radio"
                id="noPlayer"
                name="playerStatus"
                value="no"
                onChange={handleInputChange}
              />
              <label htmlFor="noPlayer">no</label>
            </div>
          </div>

          <div id="checkbox">
            <input
              type="checkbox"
              id="terms"
              name="terms"
              checked={formData.terms}
              onChange={handleInputChange}
            />
            <label htmlFor="terms">i prefer to be kept anonymous!</label>
          </div>
          {errors.terms && <ErrorMessage>{errors.terms}</ErrorMessage>}

          <input
            className="submit-button"
            id="submit"
            type="submit"
            value="Submit"
          />
        </ContactForm>
      </Container>
    </div>
  );
};

export default ContactPage;
