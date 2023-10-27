import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axiosXanoPatient from "../../../api/xanoPatient";
import useAuth from "../../../hooks/useAuth";
import { firstLetterUpper } from "../../../utils/firstLetterUpper";
import { toLocalDate } from "../../../utils/formatDates";
import { getAge } from "../../../utils/getAge";
import { onMessageUser } from "../../../utils/socketHandlers/onMessageUser";
import { staffIdToTitleAndName } from "../../../utils/staffIdToTitleAndName";
import { patientAccountSchema } from "../../../validation/patientAccountValidation";
import CountriesList from "../../Lists/CountriesList";
import DoctorsList from "../../Lists/DoctorsLists";
import NursesList from "../../Lists/NursesList";
import NutritionistsList from "../../Lists/NutritionistsList";
import PhysiosList from "../../Lists/PhysiosList";
import PsychosList from "../../Lists/PsychosList";
import USTechsList from "../../Lists/USTechsList";
const BASE_URL = "https://xsjk-1rpe-2jnw.n7c.xano.io";

const AccountPatientForm = () => {
  //HOOKS
  const { auth, user, clinic, setUser, socket } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [formDatas, setFormDatas] = useState(null);
  const [tempFormDatas, setTempFormDatas] = useState(null);
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate();
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    setFormDatas(user.demographics);
    setTempFormDatas(user.demographics);
  }, [user.demographics]);

  useEffect(() => {
    if (!socket) return;
    const onMessage = (message) => onMessageUser(message, user, setUser);
    socket.on("message", onMessage);
    return () => {
      socket.off("message", onMessage);
    };
  }, [setUser, socket, user]);

  //HANDLERS
  const handleChange = (e) => {
    setErrMsg("");
    let value = e.target.value;
    const name = e.target.name;
    if (
      name === "assigned_md_id" ||
      name === "assigned_resident_id" ||
      name === "assigned_nurse_id" ||
      name === "assigned_midwife_id" ||
      name === "assigned_us_tech_id" ||
      name === "assigned_physio_id" ||
      name === "assigned_psycho_id" ||
      name === "assigned_nutri_id"
    ) {
      value = parseInt(value);
    }
    setTempFormDatas({ ...tempFormDatas, [name]: value });
  };

  const handleChangeCredentials = (e) => {
    navigate("/patient/credentials");
  };
  const handleEdit = (e) => {
    setEditVisible(true);
  };

  const handleSave = async (e) => {
    try {
      const datasToPut = {
        ...tempFormDatas,
        address: firstLetterUpper(tempFormDatas.address),
        province_state: firstLetterUpper(tempFormDatas.province_state),
        city: firstLetterUpper(tempFormDatas.city),
      };
      setTempFormDatas({
        ...tempFormDatas,
        address: firstLetterUpper(tempFormDatas.address),
        province_state: firstLetterUpper(tempFormDatas.province_state),
        city: firstLetterUpper(tempFormDatas.city),
      });

      //Validation
      try {
        await patientAccountSchema.validate(datasToPut);
      } catch (err) {
        setErrMsg(err.message);
        return;
      }

      await axiosXanoPatient.put(`/patients/${user.id}`, datasToPut, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.authToken}`,
        },
      });
      socket.emit("message", {
        route: "PATIENTS",
        action: "update",
        content: { id: user.id, data: datasToPut },
      });
      socket.emit("message", {
        route: "USER",
        action: "update",
        content: { id: user.id, data: datasToPut },
      });
      setSuccessMsg("Infos changed successfully");
      setTimeout(() => setSuccessMsg(""), 2000);
      setEditVisible(false);
    } catch (err) {
      setErrMsg(`Error: unable to save infos: ${err.message}`);
    }
  };

  const handleCancel = (e) => {
    setTempFormDatas(formDatas);
    setEditVisible(false);
  };

  return (
    <div className="patient-account__container">
      {errMsg && <p className="patient-account__err">{errMsg}</p>}
      {successMsg && (
        <p className="patient-account__confirm">Infos changed successfully</p>
      )}
      {tempFormDatas && (
        <form className="patient-account__form">
          <div className="patient-account__form-content">
            <div className="patient-account__form-content-column">
              <div className="patient-account__form-content-column-img">
                {tempFormDatas.avatar ? (
                  <img
                    src={`${BASE_URL}${tempFormDatas.avatar.path}`}
                    alt="user-avatar"
                  />
                ) : (
                  <img
                    src="https://placehold.co/300x500/png?font=roboto&text=Profile\nPic"
                    alt="user-avatar-placeholder"
                  />
                )}
              </div>
            </div>
            <div className="patient-account__form-content-column">
              <div className="patient-account__form-content-row">
                <label>First Name*: </label>
                {tempFormDatas.first_name}
              </div>
              <div className="patient-account__form-content-row">
                <label>Middle Name: </label>
                {tempFormDatas.middle_name}
              </div>
              <div className="patient-account__form-content-row">
                <label>Last Name*: </label>
                {tempFormDatas.last_name}
              </div>
              <div className="patient-account__form-content-row">
                <label>Email*: </label>
                {tempFormDatas.email}
              </div>
              <div className="patient-account__form-content-row">
                <label>Gender at birth*: </label>
                {tempFormDatas.gender_at_birth}
              </div>
              <div className="patient-account__form-content-row">
                <label>Gender identification*: </label>
                {editVisible ? (
                  <select
                    value={tempFormDatas.gender_identification}
                    onChange={handleChange}
                    name="gender_identification"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                ) : (
                  tempFormDatas.gender_identification
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>Chart Nbr: </label>
                {tempFormDatas.chart_nbr}
              </div>
              <div className="patient-account__form-content-row">
                <label>Health Insurance Nbr: </label>
                {tempFormDatas.health_insurance_nbr}
              </div>
              <div className="patient-account__form-content-row">
                <label>Health Card Expiry: </label>
                {tempFormDatas.health_card_expiry !== null
                  ? toLocalDate(tempFormDatas.health_card_expiry)
                  : ""}
              </div>
              <div className="patient-account__form-content-row">
                <label>Date of birth*: </label>
                {toLocalDate(tempFormDatas.date_of_birth)}
              </div>
              <div className="patient-account__form-content-row">
                <label>Age: </label>
                {getAge(toLocalDate(tempFormDatas.date_of_birth))}
              </div>
              <div className="patient-account__form-content-row">
                <label>Cell Phone*: </label>
                {editVisible ? (
                  <input
                    type="tel"
                    value={tempFormDatas.cell_phone}
                    onChange={handleChange}
                    name="cell_phone"
                    id="9"
                    autoComplete="off"
                  />
                ) : (
                  tempFormDatas.cell_phone
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>Home Phone: </label>
                {editVisible ? (
                  <input
                    type="tel"
                    value={tempFormDatas.home_phone}
                    onChange={handleChange}
                    name="home_phone"
                    id="10"
                    autoComplete="off"
                  />
                ) : (
                  tempFormDatas.home_phone
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>Preferred Phone*: </label>
                {editVisible ? (
                  <input
                    type="text"
                    value={tempFormDatas.preferred_phone}
                    onChange={handleChange}
                    name="preferred_phone"
                    id="11"
                    autoComplete="off"
                  />
                ) : (
                  tempFormDatas.preferred_phone
                )}
              </div>
            </div>
            <div className="patient-account__form-content-column">
              <div className="patient-account__form-content-row">
                <label>Address*: </label>
                {editVisible ? (
                  <input
                    type="text"
                    value={tempFormDatas.address}
                    onChange={handleChange}
                    name="address"
                    id="12"
                    autoComplete="off"
                  />
                ) : (
                  tempFormDatas.address
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>Postal Code*: </label>
                {editVisible ? (
                  <input
                    type="text"
                    value={tempFormDatas.postal_code}
                    onChange={handleChange}
                    name="postal_code"
                    id="13"
                    autoComplete="off"
                  />
                ) : (
                  tempFormDatas.postal_code
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>Province/State: </label>
                {editVisible ? (
                  <input
                    type="text"
                    value={tempFormDatas.province_state}
                    onChange={handleChange}
                    name="province_state"
                    id="14"
                    autoComplete="off"
                  />
                ) : (
                  tempFormDatas.province_state
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>City*: </label>
                {editVisible ? (
                  <input
                    type="text"
                    value={tempFormDatas.city}
                    onChange={handleChange}
                    name="city"
                    id="15"
                    autoComplete="off"
                  />
                ) : (
                  tempFormDatas.city
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>Country*: </label>
                {editVisible ? (
                  <CountriesList
                    id="16"
                    handleChange={handleChange}
                    value={tempFormDatas.country}
                    name="country"
                  />
                ) : (
                  tempFormDatas.country
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>Assigned MD: </label>
                {editVisible ? (
                  <DoctorsList
                    value={tempFormDatas.assigned_md_id}
                    handleChange={handleChange}
                    name="assigned_md_id"
                    id="17"
                    staffInfos={clinic.staffInfos}
                  />
                ) : (
                  staffIdToTitleAndName(
                    clinic.staffInfos,
                    tempFormDatas.assigned_md_id,
                    true
                  )
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>Assigned Resident: </label>
                {editVisible ? (
                  <DoctorsList
                    value={tempFormDatas.assigned_resident_id}
                    handleChange={handleChange}
                    name="assigned_resident_id"
                    id="18"
                    staffInfos={clinic.staffInfos}
                  />
                ) : (
                  tempFormDatas.assigned_resident_name?.full_name
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>Assigned Nurse: </label>
                {editVisible ? (
                  <NursesList
                    value={tempFormDatas.assigned_nurse_id}
                    handleChange={handleChange}
                    name="assigned_nurse_id"
                    id="19"
                    staffInfos={clinic.staffInfos}
                  />
                ) : (
                  tempFormDatas.assigned_nurse_name?.full_name
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>Assigned Midwife: </label>
                {editVisible ? (
                  <NursesList
                    value={tempFormDatas.assigned_midwife_id}
                    handleChange={handleChange}
                    name="assigned_midwife_id"
                    id="20"
                    staffInfos={clinic.staffInfos}
                  />
                ) : (
                  tempFormDatas.assigned_midwife_name?.full_name
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>Assigned Ultrasound Tech: </label>
                {editVisible ? (
                  <USTechsList
                    value={tempFormDatas.assigned_us_tech_id}
                    handleChange={handleChange}
                    name="assigned_us_tech_id"
                    id="21"
                    staffInfos={clinic.staffInfos}
                  />
                ) : (
                  tempFormDatas.assigned_us_tech_name?.full_name
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>Assigned Physiotherapist: </label>
                {editVisible ? (
                  <PhysiosList
                    value={tempFormDatas.assigned_physio_id}
                    handleChange={handleChange}
                    name="assigned_physio_id"
                    id="22"
                    staffInfos={clinic.staffInfos}
                  />
                ) : (
                  tempFormDatas.assigned_physio_name?.full_name
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>Assigned Psychologist: </label>
                {editVisible ? (
                  <PsychosList
                    value={tempFormDatas.assigned_psycho_id}
                    handleChange={handleChange}
                    name="assigned_psycho_id"
                    id="23"
                    staffInfos={clinic.staffInfos}
                  />
                ) : (
                  tempFormDatas.assigned_psycho_name?.full_name
                )}
              </div>
              <div className="patient-account__form-content-row">
                <label>Assigned Nutritionist: </label>
                {editVisible ? (
                  <NutritionistsList
                    value={tempFormDatas.assigned_nutri_id}
                    handleChange={handleChange}
                    name="assigned_nutri_id"
                    id="24"
                    staffInfos={clinic.staffInfos}
                  />
                ) : (
                  tempFormDatas.assigned_nutri_name?.full_name
                )}
              </div>
              {editVisible && (
                <div className="patient-account__form-content-row">
                  <em>
                    If you want to change further informations please ask a
                    staff member
                  </em>
                </div>
              )}
            </div>
          </div>
        </form>
      )}
      <div className="patient-account__btns">
        {editVisible ? (
          <>
            <button onClick={handleSave}>Save</button>
            <button onClick={handleCancel}>Cancel</button>
          </>
        ) : (
          <>
            <button onClick={handleEdit}>Edit</button>
            <button onClick={handleChangeCredentials}>
              Change email/password
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AccountPatientForm;
