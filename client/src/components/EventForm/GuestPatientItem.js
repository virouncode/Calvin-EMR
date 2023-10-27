import React from "react";
import { NavLink } from "react-router-dom";

const GuestPatientItem = ({ guest, handleRemoveGuest }) => {
  return (
    <>
      <NavLink
        to={`patient-record/${guest.id}`}
        className="guest-patient-item"
        target="_blank"
      >
        {guest.full_name} (Patient){" "}
      </NavLink>
      <span data-key={guest.id} data-type="patient">
        <i
          className="fa-solid fa-trash"
          onClick={handleRemoveGuest}
          style={{ cursor: "pointer" }}
        />
      </span>
      ,{" "}
    </>
  );
};

export default GuestPatientItem;
