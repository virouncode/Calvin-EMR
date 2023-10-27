import React from "react";
import useAuth from "../../hooks/useAuth";

const PatientsSelect = ({ handleChange, value, name, id, patientId = 0 }) => {
  const { clinic } = useAuth();
  return (
    <select name={name} onChange={handleChange} value={value} id={id}>
      <option value="" disabled>
        Choose a patient
      </option>
      {clinic.patientsInfos &&
        clinic.patientsInfos.length &&
        clinic.patientsInfos
          .filter(({ id }) => id !== patientId)
          .sort((a, b) => a.full_name.localeCompare(b.full_name))
          .map((patient) => (
            <option value={patient.id} key={patient.id}>
              {patient.full_name}
            </option>
          ))}
    </select>
  );
};

export default PatientsSelect;
