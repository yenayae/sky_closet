import { useCallback } from "react";
import { supabase } from "../supabase/supabaseClient";

const useProcessPostImages = () => {
  const processPostImages = useCallback((posts) => {
    return posts.map((post) => {
      if (post.posts_images?.length > 0) {
        post.posts_images = post.posts_images.map((image) => {
          const cleanPath = image.image_url.replace(
            /^\/storage\/v1\/object\/public\/posts_images\//,
            ""
          );

          return {
            ...image,
            public_url: supabase.storage
              .from("posts_images")
              .getPublicUrl(cleanPath).data.publicUrl,
          };
        });
      }
      return post;
    });
  }, []);

  return processPostImages;
};

export default useProcessPostImages;
