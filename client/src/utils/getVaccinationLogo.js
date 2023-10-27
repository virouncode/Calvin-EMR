export const getVaccinationLogo = (type) => {
  let logo = "";
  switch (type) {
    case "intramuscular":
      logo = "\u25C6";
      break;
    case "intramuscular/subcutaneous":
      logo = `\u25C6/\u25A0`;
      break;
    case "subcutaneous":
      logo = "\u25A0";
      break;
    case "mouth":
      logo = "\u25B2";
      break;
    default:
      break;
  }
  return logo;
};

//diamond U25C6
//square U25A0
//triangle 25B2
//circle 25CF
