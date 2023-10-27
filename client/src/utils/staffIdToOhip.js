export const staffIdToOhip = (staffInfos, staffId) => {
  if (staffId === 0) return "";
  return staffInfos.find(({ id }) => id === staffId)?.ohip_billing_nbr;
};
