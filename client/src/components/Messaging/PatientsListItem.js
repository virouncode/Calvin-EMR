import React from "react";

const PatientsListItem = ({
  info,
  handleCheckPatient,
  isPatientChecked,
  patientName,
}) => {
  return (
    <li className="patients__list-item">
      <input
        id={info.id}
        type="checkbox"
        onChange={handleCheckPatient}
        checked={isPatientChecked(info.id)}
        name={patientName}
      />
      <label htmlFor={info.id}>{patientName}</label>
    </li>
  );
};

export default PatientsListItem;
