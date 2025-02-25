import { useState, useEffect } from "react";
import { supabase } from "../supabase/supabaseClient";
import { useAuth } from "./authContext";

const useLike = (postID) => {
  const { user } = useAuth();

  const currentUserID = user?.id;

  const [isLiked, setIsLiked] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!user) {
      setIsLiked(false);
      return;
    }

    const checkIfLiked = async () => {
      const { data, error } = await supabase
        .from("liked_posts")
        .select("id")
        .eq("post_id", postID)
        .eq("user_id", currentUserID)
        .maybeSingle();

      if (error) {
        console.error("Error fetching liked status:", error);
      }
      setIsLiked(!!data);
    };

    checkIfLiked();
  }, [postID, currentUserID]);

  const handleLikeToggle = async () => {
    // prevent spamming by ignoring new requests if one is in progress
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      if (isLiked) {
        // remove like
        const { data, error } = await supabase
          .from("liked_posts")
          .select("id")
          .eq("post_id", postID)
          .eq("user_id", currentUserID)
          .single();

        if (error) {
          console.error("Error finding like entry:", error);
          return;
        }

        if (data) {
          const { error: deleteError } = await supabase
            .from("liked_posts")
            .delete()
            .eq("id", data.id);

          if (deleteError) {
            console.error("Error removing like:", deleteError);
          } else {
            const { removeLikeError } = await supabase.rpc("decrement_likes", {
              post_id: postID,
            });
            if (removeLikeError) {
              console.error("Error decrementing likes:", removeLikeError);
            }
            setIsLiked(false);
          }
        }
      } else {
        // add like
        const { error } = await supabase.from("liked_posts").insert([
          {
            post_id: postID,
            user_id: currentUserID,
          },
        ]);

        if (error) {
          console.error("Error adding like:", error);
        } else {
          const { addLikeError } = await supabase.rpc("increment_likes", {
            post_id: postID,
          });
          if (addLikeError) {
            console.error("Error incrementing likes:", addLikeError);
          }
          setIsLiked(true);
        }
      }
    } finally {
      setIsProcessing(false);
    }
  };

  return [isLiked, handleLikeToggle, isProcessing];
};

export default useLike;
