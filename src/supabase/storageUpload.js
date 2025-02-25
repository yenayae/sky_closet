import { supabase } from "../supabase/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import imageCompression from "browser-image-compression";

export const uploadImage = async ({ file, bucket, folder }) => {
  const fileName = file.name;
  const fileExtension = fileName.slice(fileName.lastIndexOf(".") + 1);
  const path = `${folder ? folder + "/" : ""}${uuidv4()}.${fileExtension}`;

  try {
    file = await imageCompression(file, {
      maxSizeMB: 25,
    });
  } catch (error) {
    console.error(error);
    return { imageUrl: "", error: "Image compression failed" };
  }

  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file);

  if (error) {
    return { imageUrl: "", error: "Image upload failed" };
  }

  const imageUrl = `/storage/v1/object/public/${bucket}/${data?.path}`;

  return { imageUrl, error: "" };
};
