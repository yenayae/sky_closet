const useFormatPrice = (costNum, costType) => {
  let formattedCostNum = costNum;
  let formattedCostType = costType;

  let formattedPrice = "";

  //if cost type is null, then unavailable
  if (costType === null) {
    formattedPrice = "Unavailable";
  }

  //if 0, then free
  else if (costNum === 0) {
    formattedPrice = "Free";
  }

  //if cost num is -1, then price is unknown (for now)
  else if (costNum === -1) {
    formattedPrice = "Cost Unknown";
  }
  //if cost type is USD, convert costNum to decimal
  else if (costType === "USD") {
    formattedCostNum = (costNum / 100).toFixed(2);
    formattedPrice = `$${formattedCostNum}`;
  }

  //else left: heart, candles, tickets
  else {
    if (costNum > 1) {
      formattedCostType += "s";
    }
    formattedPrice = `${formattedCostNum} ${formattedCostType}`;
  }

  return formattedPrice;
};

export default useFormatPrice;
