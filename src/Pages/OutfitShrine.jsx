import NavBar from "../Components/NavBar";
import styled from "styled-components";
import Closet from "../Components/Closet";
import { useLoaderData, useSearchParams, useNavigate } from "react-router-dom";
import CosmeticIcon from "../Components/CosmeticIcon";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "../supabase/supabaseClient";
import Footer from "../Components/Footer";
import SubCategoryButton from "../Components/SubCategoryButton";
import "../Styles/components/loader.css";
import "../Styles/page_css/cosmeticsPage.css";

const OutfitShrine = () => {
  useState(() => {
    document.title = "Cosmetics Catalog";
  }, []);

  const ROUTE = "/cosmetics";

  const [searchParams] = useSearchParams();

  const navigate = useNavigate();
  const [cosmetics, setCosmetics] = useState([]);
  const [searchResults, setSearchResults] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [allLoaded, setAllLoaded] = useState(false);
  const [page, setPage] = useState(2);
  const [cosmeticTypes, setCosmeticTypes] = useState([]);
  const [subcategories, setSubcategories] = useState([]);

  //for load more states
  const [searchState, setSearchState] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");

  const LOAD_AMOUNT = 100;

  //general search results function
  const fetchCosmetics = async ({
    searchQuery,
    typeId,
    typeIds,
    offset = 0,
  }) => {
    if (loading) return;

    setLoading(true);

    let query = supabase.from("cosmetics").select(
      `
        *,
        cosmetic_types(*)
      `
    );

    // Apply filters dynamically
    if (searchQuery) {
      query = query.ilike("name", `%${searchQuery.trim()}%`);
    }
    if (typeId) {
      query = query.eq("type_id", typeId);
    }
    if (typeIds && typeIds.length > 0) {
      query = query.in("type_id", typeIds);
    }

    query = query.range(offset, offset + LOAD_AMOUNT - 1); // paginate results

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching cosmetics:", error);
    } else {
      // map over fetched cosmetics and update icon URLs
      const updatedCosmetics = data.map((item) => {
        const typeName = item.cosmetic_types?.name?.toLowerCase() || "unknown";
        const folder = typeName.includes("props")
          ? "props_icons"
          : `${typeName}_icons`;
        const publicUrl = supabase.storage
          .from("cosmetic_images")
          .getPublicUrl(`${folder}/${item.icon}`).data.publicUrl;

        return { ...item, icon: publicUrl };
      });

      // ensure no duplicates are added
      setCosmetics((prevCosmetics) => {
        const newCosmetics = updatedCosmetics.filter(
          (item) => !prevCosmetics.some((prevItem) => prevItem.id === item.id)
        );
        return [...prevCosmetics, ...newCosmetics];
      });

      setAllLoaded(data.length < LOAD_AMOUNT); // If less than LOAD_AMOUNT, we've loaded all
    }

    setLoading(false);
  };

  //load in cosmetic types for subcategories
  const fetchCosmeticTypes = async () => {
    const { data, error } = await supabase.from("cosmetic_types").select("*");
    if (error) {
      console.error("Error fetching cosmetic types:", error);
    } else {
      setCosmeticTypes(data);
    }
  };

  //first load: either normal or url search query
  useEffect(() => {
    const urlQuery = searchParams.get("search");
    let searchQuery = "";
    if (urlQuery) {
      searchQuery = urlQuery;
      setSearchQuery(urlQuery);
      setSearchState("search");
    }
    fetchCosmetics({ searchQuery: searchQuery });
    fetchCosmeticTypes();
  }, []); // empty array makes it run only once

  //reset page
  const resetPage = () => {
    navigate(ROUTE);
    setCosmetics([]);
    setSubcategories([]);

    setSearchState("default");
    setSelectedCategory(null);

    fetchCosmetics({ searchQuery: "" });
  };

  //search by input
  const handleSearch = (query) => {
    setSearchState("search");
    setSearchQuery(query);

    navigate(`${ROUTE}?search=${encodeURIComponent(query)}`);
    setCosmetics([]);

    fetchCosmetics({ searchQuery: query });
  };

  // filter results by category
  const handleCategorySelect = (category) => {
    // prevent reloading the same category
    if (searchState === "category" && selectedCategory === category) return;

    // clear URL query
    navigate(ROUTE);
    setCosmetics([]);

    // set search state to category and reset page + add permanent glow
    setSearchState("category");
    setSelectedCategory(category);

    // add the subcategories if present
    const subcategories = category
      ? cosmeticTypes.filter((item) => item.parent_type === category)
      : [];
    setSubcategories(subcategories);

    // dynamically generate category to type ID mapping
    const categoryToTypeIds = cosmeticTypes.reduce((acc, type) => {
      if (!acc[type.parent_type]) {
        acc[type.parent_type] = [];
      }
      acc[type.parent_type].push(type.id);
      return acc;
    }, {});

    // get the type IDs for the selected category
    const typeIds = categoryToTypeIds[category] || [];

    if (typeIds.length === 0) {
      console.warn("No matching type IDs found for category:", category);
      return;
    }

    fetchCosmetics({ typeIds: typeIds });
  };

  //monitor if category is selected and load more items

  // filter results by subcategory
  const handleSubCategorySelect = (subCategoryName) => {
    setSearchState("subCategory");
    setSelectedCategory(subCategoryName);

    setCosmetics([]);
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

    // fetch results based on subcategory ID
    fetchCosmetics({ typeId: subCategory.id });
  };

  const loadMoreCosmetics = async () => {
    if (loading || allLoaded) return;

    setPage((prev) => prev + 1);

    //searchbar or url search
    if (searchState === "search" && searchQuery) {
      fetchCosmetics({ searchQuery, offset: cosmetics.length });
    }

    //category search
    else if (searchState === "category" && selectedCategory) {
      const categoryToTypeIds = cosmeticTypes.reduce((acc, type) => {
        if (!acc[type.parent_type]) {
          acc[type.parent_type] = [];
        }
        acc[type.parent_type].push(type.id);
        return acc;
      }, {});

      const typeIds = categoryToTypeIds[selectedCategory] || [];
      fetchCosmetics({ typeIds, offset: cosmetics.length });
    }

    //subcategory search
    else if (searchState === "subCategory" && selectedCategory) {
      const subCategory = cosmeticTypes.find(
        (type) => type.name === selectedCategory
      );
      fetchCosmetics({ typeId: subCategory.id, offset: cosmetics.length });
    } else if (searchState === "default") {
      fetchCosmetics({ offset: cosmetics.length });
    }
  };

  //auto loading
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

    // clean up observer when component unmounts or dependencies change
    return () => {
      if (loadMoreElement) {
        observer.unobserve(loadMoreElement);
      }
    };
  }, [allLoaded, loadMoreCosmetics]);

  return (
    <div>
      <NavBar
        page="cosmeticPage"
        cosmeticPageReset={resetPage}
        onSearch={handleSearch}
      />
      <div>
        <div className="closet-select-section">
          <div className="closet-container">
            <Closet
              cosmeticCategory="outfit"
              onClick={() => handleCategorySelect("outfit")}
              isSelected={selectedCategory === "outfits"}
            ></Closet>
            <Closet
              cosmeticCategory="masks"
              onClick={() => handleCategorySelect("mask")}
              isSelected={selectedCategory === "masks"}
            ></Closet>
            <Closet
              cosmeticCategory="hair"
              onClick={() => handleCategorySelect("hair")}
              isSelected={selectedCategory === "hair"}
            ></Closet>
            <Closet
              cosmeticCategory="capes"
              onClick={() => handleCategorySelect("cape")}
              isSelected={selectedCategory === "capes"}
            ></Closet>
            <Closet
              cosmeticCategory="props"
              onClick={() => handleCategorySelect("props")}
              isSelected={selectedCategory === "props"}
            ></Closet>
          </div>
        </div>

        <div className="cosmetics-container">
          <div className="subcategory-container">
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

          {console.log(cosmetics)}

          <div className="cosmetic-results-container">
            {cosmetics.length === 0 ? (
              loading ? (
                <span className="loader">loading...</span>
              ) : (
                <span>No results!</span>
              )
            ) : (
              cosmetics.map((cosmetic, i) => {
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
            style={{ textAlign: "center", padding: "10px" }}
          ></div>
        </div>
      </div>
      <div>
        {!allLoaded ? <div className="loader">Loading...</div> : <Footer />}
      </div>
    </div>
  );
};

export default OutfitShrine;
