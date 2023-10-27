import React from "react";
import useAuth from "../../hooks/useAuth";
import PatientsListItem from "./PatientsListItem";

const PatientsList = ({ isPatientChecked, handleCheckPatient, search }) => {
  const { clinic } = useAuth();
  return (
    <ul>
      {clinic.patientsInfos
        .filter(
          (patient) =>
            patient.email.toLowerCase().includes(search.toLowerCase()) ||
            patient.chart_nbr.includes(search) ||
            patient.full_name.toLowerCase().includes(search.toLowerCase()) ||
            new Date(patient.date_of_birth).toISOString().includes(search) ||
            patient.address.toLowerCase().includes(search.toLowerCase()) ||
            patient.postal_code.toLowerCase().includes(search.toLowerCase()) ||
            patient.province_state
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            patient.city.toLowerCase().includes(search.toLowerCase()) ||
            patient.country.toLowerCase().includes(search.toLowerCase()) ||
            patient.cell_phone.toLowerCase().includes(search.toLowerCase()) ||
            patient.home_phone.toLowerCase().includes(search.toLowerCase()) ||
            patient.preferred_phone
              .toLowerCase()
              .includes(search.toLowerCase()) ||
            patient.health_insurance_nbr.includes(search)
        )
        .map((info) => (
          <PatientsListItem
            info={info}
            key={info.id}
            handleCheckPatient={handleCheckPatient}
            isPatientChecked={isPatientChecked}
            patientName={info.full_name}
          />
        ))}
    </ul>
  );
};

export default PatientsList;
