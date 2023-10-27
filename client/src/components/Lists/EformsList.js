import React from "react";

const EformsList = ({ handleFormChange, formSelected, eforms }) => {
  return (
    <select
      onChange={handleFormChange}
      style={{ marginLeft: "10px" }}
      value={formSelected}
    >
      <option value="" disabled>
        Choose an e-form...
      </option>
      {eforms.map(({ name }) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
};

export default EformsList;
