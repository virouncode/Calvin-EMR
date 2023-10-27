export const patientIdToName = (patientsInfos, patientId) => {
  if (!patientId) return "";
  return patientsInfos.find(({ id }) => id === patientId)?.full_name;
};
