export const getVaccinationInterval = (age, date_of_birth, name) => {
  let rangeStart = new Date();
  let rangeEnd = new Date();
  const dob = new Date(date_of_birth);

  switch (age) {
    case "2_months": {
      rangeStart = new Date(dob.setMonth(dob.getMonth() + 2));
      rangeEnd = new Date(dob.setMonth(dob.getMonth() + 1));
      break;
    }
    case "4_months": {
      rangeStart = new Date(dob.setMonth(dob.getMonth() + 4));
      rangeEnd = new Date(dob.setMonth(dob.getMonth() + 1));
      break;
    }
    case "6_months": {
      rangeStart = new Date(dob.setMonth(dob.getMonth() + 6));
      rangeEnd = new Date(dob.setMonth(dob.getMonth() + 1));
      break;
    }
    case "1_year": {
      rangeStart = new Date(dob.setFullYear(dob.getFullYear() + 1));
      rangeEnd = new Date(dob.setMonth(dob.getMonth() + 4));
      break;
    }
    case "15_months": {
      rangeStart = new Date(dob.setMonth(dob.getMonth() + 15));
      rangeEnd = new Date(dob.setMonth(dob.getMonth() + 1));
      break;
    }
    case "18_months": {
      rangeStart = new Date(dob.setMonth(dob.getMonth() + 18));
      rangeEnd = new Date(dob.setMonth(dob.getMonth() + 1));
      break;
    }
    case "4_years": {
      rangeStart = new Date(dob.setFullYear(dob.getFullYear() + 4));
      rangeEnd = new Date(dob.setFullYear(dob.getFullYear() + 1));
      break;
    }
    case "14_years": {
      rangeStart = new Date(dob.setFullYear(dob.getFullYear() + 14));
      rangeEnd = new Date(dob.setFullYear(dob.getFullYear() + 1));
      break;
    }
    case "24_years": {
      rangeStart = new Date(dob.setFullYear(dob.getFullYear() + 24));
      rangeEnd = new Date(dob.setFullYear(dob.getFullYear() + 1));
      break;
    }
    case "grade_7": {
      rangeStart = "";
      rangeEnd = new Date(dob.setFullYear(dob.getFullYear() + 15));
      break;
    }
    case "65_years": {
      rangeStart = new Date(dob.setFullYear(dob.getFullYear() + 65));
      rangeEnd = new Date(dob.setFullYear(dob.getFullYear() + 1));
      break;
    }
    default:
      break;
  }
  return {
    rangeStart: rangeStart,
    rangeEnd: rangeEnd,
  };
};
