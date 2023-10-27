import { CircularProgress } from "@mui/material";
import React from "react";
import avatar from "../../../../assets/img/avatar.png";
import useAuth from "../../../../hooks/useAuth";
import { toLocalDate } from "../../../../utils/formatDates";
import { getAge } from "../../../../utils/getAge";
import { staffIdToTitleAndName } from "../../../../utils/staffIdToTitleAndName";

const BASE_URL = "https://xsjk-1rpe-2jnw.n7c.xano.io";

const DemographicsContent = ({ patientInfos }) => {
  const { clinic } = useAuth();
  return patientInfos ? (
    <div className="topic-content topic-content--demographics">
      <div className="topic-content__infos">
        <p>
          <label>First Name: </label>
          {patientInfos.first_name}
        </p>
        <p>
          <label>Middle Name: </label>
          {patientInfos.middle_name}
        </p>
        <p>
          <label>Last Name: </label>
          {patientInfos.last_name}
        </p>
        <p>
          <label>Gender at birth: </label>
          {patientInfos.gender_at_birth}
        </p>
        <p>
          <label>Gender identification: </label>
          {patientInfos.gender_identification}
        </p>
        <p>
          <label>Chart Nbr: </label>
          {patientInfos.chart_nbr}
        </p>
        <p>
          <label>Health Insurance Nbr: </label>
          {patientInfos.health_insurance_nbr}
        </p>
        <p>
          <label>Health Card Expiry: </label>
          {toLocalDate(patientInfos.health_card_expiry)}
        </p>
        <p>
          <label>Date of birth: </label>
          {toLocalDate(patientInfos.date_of_birth)}
        </p>
        <p>
          <label>Age: </label>
          {getAge(patientInfos.date_of_birth)}
        </p>
        <p>
          <label>Email: </label>
          {patientInfos.email}
        </p>
        <p>
          <label>Cell Phone: </label>
          {patientInfos.cell_phone}
        </p>
        <p>
          <label>Home Phone: </label>
          {patientInfos.home_phone}
        </p>
        <p>
          <label>Preferred Phone: </label>
          {patientInfos.preferred_phone}
        </p>
        <p>
          <label>Address: </label>
          {patientInfos.address}
        </p>
        <p>
          <label>Postal Code: </label>
          {patientInfos.postal_code}
        </p>
        <p>
          <label>Province/State: </label>
          {patientInfos.province_state}
        </p>
        <p>
          <label>City: </label>
          {patientInfos.city}
        </p>
        <p>
          <label>Country: </label>
          {patientInfos.country}
        </p>
        <p>
          <label>Assigned MD: </label>
          {staffIdToTitleAndName(
            clinic.staffInfos,
            patientInfos.assigned_md_id,
            true
          )}
        </p>
        <p>
          <label>Assigned Resident: </label>
          {patientInfos.assigned_resident_name?.full_name}
        </p>
        <p>
          <label>Assigned Nurse: </label>
          {patientInfos.assigned_nurse_name?.full_name}
        </p>
        <p>
          <label>Assigned Midwife: </label>
          {patientInfos.assigned_midwife_name?.full_name}
        </p>
        <p>
          <label>Assigned Ultrasound Tech: </label>
          {patientInfos.assigned_us_tech_name?.full_name}
        </p>
        <p>
          <label>Assigned Physiotherapist: </label>
          {patientInfos.assigned_physio_name?.full_name}
        </p>
        <p>
          <label>Assigned Psychologist: </label>
          {patientInfos.assigned_psycho_name?.full_name}
        </p>
        <p>
          <label>Assigned Nutritionist: </label>
          {patientInfos.assigned_nutri_name?.full_name}
        </p>
      </div>
      <div className="topic-content__avatar">
        {patientInfos.avatar ? (
          <img
            src={`${BASE_URL}${patientInfos.avatar.path}`}
            alt="user-avatar"
          />
        ) : (
          <img src={avatar} alt="user-avatar-placeholder" />
        )}
      </div>
    </div>
  ) : (
    <CircularProgress size="1rem" style={{ margin: "5px" }} />
  );
};

export default DemographicsContent;
