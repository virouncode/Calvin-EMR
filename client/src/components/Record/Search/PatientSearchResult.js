import { CircularProgress } from "@mui/material";
import React from "react";
import { toLocalDate } from "../../../utils/formatDates";
import PatientResultItem from "./PatientResultItem";

const PatientSearchResult = ({ search, sortedPatientsInfos, handleSort }) => {
  return sortedPatientsInfos ? (
    <div className="patient-result">
      <table>
        <thead>
          <tr>
            <th onClick={() => handleSort("last_name")}>Last Name</th>
            <th onClick={() => handleSort("first_name")}>First Name</th>
            <th onClick={() => handleSort("middle_name")}>Middle Name</th>
            <th onClick={() => handleSort("date_of_birth")}>Date of birth</th>
            <th onClick={() => handleSort("date_of_birth")}>Age</th>
            <th onClick={() => handleSort("email")}>Email</th>
            <th onClick={() => handleSort("cell_phone")}>Cellphone</th>
            <th onClick={() => handleSort("home_phone")}>Homephone</th>
            <th onClick={() => handleSort("preferred_phone")}>
              Preferred phone
            </th>
            <th onClick={() => handleSort("health_insurance_nbr")}>
              Health Insurance Nbr
            </th>
            <th onClick={() => handleSort("address")}>Address</th>
            <th onClick={() => handleSort("postal_code")}>Postal Code</th>
            <th onClick={() => handleSort("province_state")}>Province/State</th>
            <th onClick={() => handleSort("city")}>City</th>
            <th onClick={() => handleSort("country")}>Country</th>
          </tr>
        </thead>
        <tbody>
          {sortedPatientsInfos
            .filter(
              (patient) =>
                patient.full_name
                  .toLowerCase()
                  .includes(search.name.toLowerCase()) &&
                patient.email
                  .toLowerCase()
                  .includes(search.email.toLowerCase()) &&
                (patient.cell_phone
                  .toLowerCase()
                  .includes(search.phone.toLowerCase()) ||
                  patient.home_phone
                    .toLowerCase()
                    .includes(search.phone.toLowerCase()) ||
                  patient.preferred_phone
                    .toLowerCase()
                    .includes(search.phone.toLowerCase())) &&
                toLocalDate(patient.date_of_birth).includes(search.birth) &&
                patient.chart_nbr.includes(search.chart) &&
                patient.health_insurance_nbr.includes(search.health)
            )
            .map((patient) => (
              <PatientResultItem patient={patient} key={patient.id} />
            ))}
        </tbody>
      </table>
    </div>
  ) : (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <CircularProgress />
    </div>
  );
};

export default PatientSearchResult;
