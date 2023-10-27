export const staffIdToName = (staffInfos, staffId) => {
  if (!staffId) return "";
  return staffInfos.find(({ id }) => id === staffId)?.full_name;
};
