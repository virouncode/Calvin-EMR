import React from "react";
import { toLocalDate } from "../../utils/formatDates";
import GuestPatientResultItem from "./GuestPatientResultItem";
import GuestStaffResultItem from "./GuestStaffResultItem";

const GuestsSearchResults = ({
  search,
  handleAddGuest,
  staffInfos,
  patientsInfos,
  staffGuestsInfos,
  patientsGuestsInfos,
  hostId,
}) => {
  return (
    <ul className="results">
      {patientsInfos
        .filter(
          (patient) =>
            patient.full_name
              .toLowerCase()
              .includes(search.name.toLowerCase()) &&
            patient.email.toLowerCase().includes(search.email.toLowerCase()) &&
            (patient.cell_phone.includes(search.phone) ||
              patient.home_phone.includes(search.phone) ||
              patient.preferred_phone.includes(search.phone)) &&
            toLocalDate(patient.date_of_birth).includes(search.birth) &&
            patient.chart_nbr.includes(search.chart) &&
            patient.health_insurance_nbr.includes(search.health) &&
            !patientsGuestsInfos.map(({ id }) => id).includes(patient.id)
        )
        .map((guest) => (
          <GuestPatientResultItem
            key={guest.id}
            guest={guest}
            handleAddGuest={handleAddGuest}
          />
        ))}
      {search.chart === "" &&
        search.health === "" &&
        search.birth === "" &&
        staffInfos
          .filter(
            (staff) =>
              staff.full_name
                .toLowerCase()
                .includes(search.name.toLowerCase()) &&
              staff.email.toLowerCase().includes(search.email.toLowerCase()) &&
              (staff.cell_phone.includes(search.phone) ||
                staff.backup_phone.includes(search.phone)) &&
              !staffGuestsInfos.map(({ id }) => id).includes(staff.id) &&
              staff.id !== hostId
          )
          .map((guest) => (
            <GuestStaffResultItem
              key={guest.id}
              guest={guest}
              handleAddGuest={handleAddGuest}
            />
          ))}
    </ul>
  );
};

export default GuestsSearchResults;
