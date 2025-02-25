import NavBar from "../../Components/NavBar";
import styled from "styled-components";
import Closet from "../../Components/Closet";
import { useLoaderData, useSearchParams, useNavigate } from "react-router-dom";
import CosmeticIcon from "../../Components/CosmeticIcon";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../supabase/supabaseClient";
import Footer from "../../Components/Footer";
import SubCategoryButton from "../../Components/SubCategoryButton";
import "../Styles/components/loader.css";

const ClosetContainer = styled.div`
  background-color: rgba(16, 17, 36, 0.8);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-around;
  width: 95%;
  border-radius: 10px;
`;

const ClosetSelectSection = styled.div`
  background-image: url("/img/assets/night.png");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center center;
  width: 100%;
  padding: 30px 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Cosmetics = () => {
  useState(() => {
    document.title = "Cosmetics Catalog";
  }, []);

  const initialCosmetics = useLoaderData();
  let initialSearchResults = initialCosmetics;

  const [searchParams] = useSearchParams();
  const urlQuery = searchParams.get("search");

  const navigate = useNavigate();
  const [cosmetics, setCosmetics] = useState(initialCosmetics);
  const [searchResults, setSearchResults] = useState(initialSearchResults);
  const [searchState, setSearchState] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [page, setPage] = useState(2);
  const [cosmeticTypes, setCosmeticTypes] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  const LOAD_AMOUNT = 100;

  useEffect(() => {
    if (urlQuery) {
      console.log("urlQuery:", urlQuery);

      const fetchSearchResults = async () => {
        const { data, error } = await supabase
          .from("cosmetics")
          .select(
            `
            *,
            cosmetic_types(*)
          `
          )
          .ilike("name", `%${urlQuery.trim()}%`);

        if (error) {
          console.error("Error fetching search results:", error);
          return;
        }

        setCosmetics(data);
        setSearchResults(data);
        setAllLoaded(true);
      };

      fetchSearchResults();
    }
  }, []); // empty array makes it run only once

  useEffect(() => {
    const fetchCosmeticTypes = async () => {
      const { data, error } = await supabase.from("cosmetic_types").select("*");
      if (error) {
        console.error("Error fetching cosmetic types:", error);
      } else {
        setCosmeticTypes(data);
      }
    };

    fetchCosmeticTypes();
  }, []);

  //reset page
  const resetPage = () => {
    navigate("/cosmetics", { replace: true });
    setSearchState("default");
    setSearchQuery("");
    setSelectedCategory(null);
    setSubcategories([]);

    setSearchResults([]);
    setPage(1);

    setAllLoaded(false);
  };

  // fetch more cosmetics when user scrolls near bottom
  const loadMoreCosmetics = useCallback(async () => {
    if (allLoaded) return; //cancel if all items are loaded
    if (loading) return; //cancel if already loading in a batch
    setLoading(true);

    console.log("loading more stuff");
    try {
      let query = supabase.from("cosmetics").select(
        `
        *,
        cosmetic_types(*)
      `
      );

      console.log(selectedCategory);
      console.log(searchState);

      //redirect state from cosmeticIcon
      const urlQuery = searchParams.get("search");
      console.log("urlquery", urlQuery);
      if (urlQuery && searchState !== "category") {
        query = query.ilike("name", `%${urlQuery.toLowerCase()}%`);
      }

      // search bar query
      else if (searchQuery && searchState === "searchbar") {
        console.log("searchbar query", searchQuery);
        query = query.ilike("name", `%${searchQuery.toLowerCase()}%`);
      }

      // category filter selected
      else if (selectedCategory && searchState === "category") {
        console.log("selectedCategory", selectedCategory);
        //convert category to id (potentially replace in the future)
        const categoryToTypeIds = {
          outfits: [1, 2],
          masks: [3, 4, 5],
          hair: [6, 7, 8],
          capes: [9],
          props: [10, 11, 12],
        };
        const typeIds = categoryToTypeIds[selectedCategory.toLowerCase()] || [];
        console.log("typeIds", typeIds);

        if (typeIds.length > 0) {
          query = query.in("type_id", typeIds);
        }
      }

      // subcategory filter selected
      else if (selectedCategory && searchState === "subCategory") {
        console.log("subCategory", selectedCategory);
        // find the subcategory object from cosmeticTypes
        const subCategory = cosmeticTypes.find(
          (type) => type.name.toLowerCase() === selectedCategory.toLowerCase()
        );

        if (subCategory) {
          // filter by the subcategory's ID
          query = query.eq("type_id", subCategory.id);
        } else {
          console.error("Subcategory not found for:", selectedCategory);
        }
      }

      // fetch LOAD_AMOUNT items per page
      const { data, error } = await query.range(
        (page - 1) * LOAD_AMOUNT,
        page * LOAD_AMOUNT - 1
      );

      if (error) {
        throw new Error("Error fetching cosmetics: " + error.message);
      }

      // ensure no duplicates are added
      setCosmetics((prevCosmetics) => {
        const newCosmetics = data.filter(
          (item) => !prevCosmetics.some((prevItem) => prevItem.id === item.id)
        );
        return [...prevCosmetics, ...newCosmetics];
      });

      // + sort cosmetics by id
      setSearchResults((prevResults) => {
        const newResults = data.filter(
          (item) => !prevResults.some((prevItem) => prevItem.id === item.id)
        );
        return [...prevResults, ...newResults].sort((a, b) => a.id - b.id);
      });

      if (data.length === 0) {
        setAllLoaded(true);
      }

      setPage((prevPage) => prevPage + 1);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [
    loading,
    searchQuery,
    searchState,
    selectedCategory,
    page,
    cosmeticTypes,
    allLoaded,
    searchParams,
  ]);

  // detect if there's space at the bottom and load more cosmetics
  useEffect(() => {
    if (allLoaded) return;

    let lastLoadedTime = Date.now();

    // check if loadMore element is visible
    const checkForMoreSpace = () => {
      const loadMoreElement = document.getElementById("loadMore");
      if (!loadMoreElement) return;

      const bounding = loadMoreElement.getBoundingClientRect();
      const isVisible =
        bounding.top < window.innerHeight && bounding.bottom >= 0;

      console.log("isVisible", isVisible);

      if (isVisible && Date.now() - lastLoadedTime >= 100) {
        lastLoadedTime = Date.now();
        loadMoreCosmetics();
      }
    };

    // IntersectionObserver to track visibility of loadMore
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          checkForMoreSpace();
        }
      },
      { threshold: 1.0 } // Trigger when loadMore is fully in view
    );

    const loadMoreElement = document.getElementById("loadMore");
    if (loadMoreElement) {
      observer.observe(loadMoreElement);
    }

    const loadUntilNotVisible = () => {
      const interval = setInterval(() => {
        const isVisible = checkForMoreSpace();
        if (!isVisible) {
          clearInterval(interval); // stop the interval once loadMore is not visible
        }
      }, 1000); // check every 500ms
    };

    // initial check for visibility in case loadMore is already in view
    loadUntilNotVisible();

    // clean up observer when component unmounts or dependencies change
    return () => {
      if (loadMoreElement) {
        observer.unobserve(loadMoreElement);
      }
    };
  }, [allLoaded, loadMoreCosmetics]);

  //search by input
  const handleSearch = (query) => {
    navigate(`/cosmetics?search=${encodeURIComponent(query)}`);
    setSubcategories([]);
    setSearchState("searchbar");
    setSearchQuery(query);

    setPage(1);

    const filtered = cosmetics.filter((cosmetic) =>
      cosmetic.name
        .replace(/_/g, " ")
        .toLowerCase()
        .includes(query.toLowerCase())
    );
    setSearchResults(filtered);

    // Allow more items to be loaded EDIT: dont need this bc loadmore now checks for load regardless
    // setAllLoaded(false);
  };

  useEffect(() => {
    const query = searchParams.get("search");
    if (query) {
      setSearchQuery(query);
      setAllLoaded(false);
    }
  }, [searchParams]);

  // filter results by category
  const handleCategorySelect = (category) => {
    console.log("click category", category);

    //prevent reloading same categories
    if (searchState === "category" && selectedCategory === category) return;
    console.log("not repeat?");

    //clear url query
    navigate(`/cosmetics`);
    setSearchQuery("");

    //set search state to category and reset page + add permanent glow
    setSearchState("category");
    setSelectedCategory(category);
    setPage(1);

    //add the subcategories if present
    const subcategories = category
      ? cosmeticTypes.filter((item) => item.parent_type === category)
      : [];
    setSubcategories(subcategories);
    console.log("sub", subcategories);

    //results from currently loaded cosmetics
    const filtered = cosmetics.filter(
      (cosmetic) => cosmetic.cosmetic_types.parent_type === category
    );
    setSearchResults(filtered);

    // allow more items to be loaded
    setAllLoaded(false);
  };

  //monitor if category is selected and load more items
  useEffect(() => {
    if (searchState === "category" && !allLoaded) {
      loadMoreCosmetics();
    }
  }, [
    searchState,
    selectedCategory,
    searchResults,
    allLoaded,
    loadMoreCosmetics,
  ]);

  // filter results by subcategory
  const handleSubCategorySelect = (subCategoryName) => {
    console.log("click");
    console.log("Selected subcategory:", subCategoryName);
    setSearchState("subCategory");
    setSelectedCategory(subCategoryName);
    setPage(1);

    // find the corresponding subcategory object from cosmeticTypes
    const subCategory = cosmeticTypes.find(
      (type) => type.name === subCategoryName
    );

    if (!subCategory) {
      console.error("Subcategory not found");
      setSearchResults([]);
      return;
    }

    // filter cosmetics by the subcategory's id
    const filtered = cosmetics.filter(
      (cosmetic) => cosmetic.type_id === subCategory.id
    );
    setSearchResults(filtered);

    // allow more items to be loaded
    setAllLoaded(false);
  };

  return (
    <div>
      <NavBar
        page="cosmeticPage"
        cosmeticPageReset={resetPage}
        onSearch={handleSearch}
      />
      <div>
        <ClosetSelectSection>
          <ClosetContainer>
            <Closet
              cosmeticCategory="outfit"
              onClick={() => handleCategorySelect("outfits")}
              isSelected={selectedCategory === "outfits"}
            ></Closet>
            <Closet
              cosmeticCategory="masks"
              onClick={() => handleCategorySelect("masks")}
              isSelected={selectedCategory === "masks"}
            ></Closet>
            <Closet
              cosmeticCategory="hair"
              onClick={() => handleCategorySelect("hair")}
              isSelected={selectedCategory === "hair"}
            ></Closet>
            <Closet
              cosmeticCategory="capes"
              onClick={() => handleCategorySelect("capes")}
              isSelected={selectedCategory === "capes"}
            ></Closet>
            <Closet
              cosmeticCategory="props"
              onClick={() => handleCategorySelect("props")}
              isSelected={selectedCategory === "props"}
            ></Closet>
          </ClosetContainer>
        </ClosetSelectSection>

        <div
          style={{
            height: "auto",
            minHeight: "55vh",
            padding: "15px 15px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "flex-start",
            // backgroundColor: "rgba(16, 17, 36, 0.8)",
          }}
        >
          <div
            style={{
              display: "flex",
              marginBottom: "15px",
              backgroundColor: "rgba(20, 18, 14, 0.5)",
              borderRadius: "5px",
            }}
          >
            {subcategories.length <= 1
              ? ""
              : subcategories.map((sub) => (
                  <SubCategoryButton
                    key={sub.id}
                    categoryName={sub.name}
                    onClick={() => handleSubCategorySelect(sub.name)}
                    isSelected={
                      selectedCategory === sub.name &&
                      searchState === "subCategory"
                    }
                  ></SubCategoryButton>
                ))}
          </div>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              width: "80%", //keep this below 80% or a horizontal scrollbar will appear
            }}
          >
            {searchResults.length === 0 ? (
              !allLoaded ? (
                ""
              ) : (
                <span>No results!</span>
              )
            ) : (
              searchResults.map((cosmetic, i) => {
                return (
                  <CosmeticIcon
                    key={cosmetic.id}
                    cosmetic={cosmetic}
                    cosmeticTypes={cosmeticTypes}
                    index={i % LOAD_AMOUNT}
                  ></CosmeticIcon>
                );
              })
            )}
          </div>
          <div
            id="loadMore"
            style={{
              textAlign: "center",
              padding: "5px",
              cursor: loading ? "not-allowed" : "pointer",
            }}
          ></div>
        </div>
      </div>
      <div>
        {!allLoaded ? <div className="loader">Loading...</div> : <Footer />}
      </div>
    </div>
  );
};

export default Cosmetics;
