const useFormatName = (name) => {
  let formattedName = name
    .split("_")
    .map((word) =>
      word
        .split("-")
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join("-")
    )
    .join(" "); // Join words with spaces

  // Handle specific cases like "Hide N Seek"
  formattedName = formattedName.replace(/Hide N Seek/g, "Hide'n'Seek");

  // Ensure "Of", "The", "A" are lowercase unless at the beginning
  formattedName = formattedName.replace(
    /\b(Of|The|A)\b/g,
    (match, p1, offset) => {
      return offset === 0
        ? p1.charAt(0).toUpperCase() + p1.slice(1)
        : p1.toLowerCase();
    }
  );

  return formattedName;
};

export default useFormatName;
