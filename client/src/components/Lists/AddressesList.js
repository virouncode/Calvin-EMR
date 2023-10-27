import React from "react";

const AddressesList = ({ handleAddressChange, addressSelected, sites }) => {
  return (
    <select
      onChange={handleAddressChange}
      style={{ marginLeft: "10px" }}
      value={addressSelected}
    >
      <option value="" disabled>
        Choose an address...
      </option>
      {sites.map(({ name }) => (
        <option key={name} value={name}>
          {name}
        </option>
      ))}
    </select>
  );
};

export default AddressesList;
