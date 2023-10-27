import { CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { putPatientRecord } from "../../../api/fetchRecords";
import axiosXano from "../../../api/xano";
import useAuth from "../../../hooks/useAuth";
import { firstLetterUpper } from "../../../utils/firstLetterUpper";
import { toLocalDate, toLocalDateAndTime } from "../../../utils/formatDates";
import { getAge } from "../../../utils/getAge";
import { staffIdToTitleAndName } from "../../../utils/staffIdToTitleAndName";
import { demographicsSchema } from "../../../validation/demographicsValidation";
import ConfirmGlobal, { confirmAlert } from "../../Confirm/ConfirmGlobal";
import CountriesList from "../../Lists/CountriesList";
import DoctorsList from "../../Lists/DoctorsLists";
import NursesList from "../../Lists/NursesList";
import NutritionistsList from "../../Lists/NutritionistsList";
import PhysiosList from "../../Lists/PhysiosList";
import PsychosList from "../../Lists/PsychosList";
import USTechsList from "../../Lists/USTechsList";
const BASE_URL = "https://xsjk-1rpe-2jnw.n7c.xano.io";

const DemographicsPU = ({ patientInfos, setPopUpVisible }) => {
  //get the avatar with a fetch

  //============================= STATES ==============================//
  const [editVisible, setEditVisible] = useState(false);
  const [errMsgPost, setErrMsgPost] = useState("");
  const [formDatas, setFormDatas] = useState(null);
  const { auth, user, clinic, socket } = useAuth();
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  useEffect(() => setFormDatas(patientInfos), [patientInfos]);

  const handleChange = (e) => {
    let value = e.target.value;
    const name = e.target.name;
    setErrMsgPost("");
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
    if (name === "health_card_expiry" || name === "date_of_birth") {
      value = !value ? null : Date.parse(new Date(value));
    }
    setFormDatas({ ...formDatas, [name]: value });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 20000000) {
      toast.error("File size exceeds 20Mbs, please choose another file", {
        containerId: "B",
      });
      return;
    }
    setIsLoadingFile(true);
    // setting up the reader
    let reader = new FileReader();
    reader.readAsDataURL(file);
    // here we tell the reader what to do when it's done reading...
    reader.onload = async (e) => {
      let content = e.target.result; // this is the content!
      try {
        let fileToUpload = await axiosXano.post(
          "/upload/attachment",
          {
            content: content,
          },
          {
            headers: {
              Authorization: `Bearer ${auth.authToken}`,
            },
          }
        );
        setFormDatas({ ...formDatas, avatar: fileToUpload.data });
        setIsLoadingFile(false);
      } catch (err) {
        toast.error(`Error: unable to load file: ${err.message}`, {
          containerId: "B",
        });
        setIsLoadingFile(false);
      }
    };
  };

  const handleClose = async (e) => {
    if (!editVisible) {
      setPopUpVisible(false);
    } else if (
      editVisible &&
      (await confirmAlert({
        content:
          "Do you really want to close the window ? Your changes will be lost",
      }))
    ) {
      setPopUpVisible(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    //Formatting
    const datasToPut = {
      ...formDatas,
      first_name: firstLetterUpper(formDatas.first_name),
      middle_name: firstLetterUpper(formDatas.middle_name),
      last_name: firstLetterUpper(formDatas.last_name),
      address: firstLetterUpper(formDatas.address),
      province_state: firstLetterUpper(formDatas.province_state),
      city: firstLetterUpper(formDatas.city),
    };
    datasToPut.middle_name !== ""
      ? (datasToPut.full_name =
          datasToPut.first_name +
          " " +
          datasToPut.middle_name +
          " " +
          datasToPut.last_name)
      : (datasToPut.full_name =
          datasToPut.first_name + " " + datasToPut.last_name);
    //Validation
    try {
      await demographicsSchema.validate(datasToPut);
    } catch (err) {
      setErrMsgPost(err.message);
      return;
    }

    //Submission
    try {
      await putPatientRecord(
        "/patients",
        patientInfos.id,
        user.id,
        auth.authToken,
        datasToPut
      );
      socket.emit("message", {
        route: "PATIENTS",
        action: "update",
        content: { id: datasToPut.id, data: datasToPut },
      });
      setEditVisible(false);

      // //update patientsInfos
      // const response2 = await axiosXano.get("/patients", {
      //   headers: {
      //     Authorization: `Bearer ${auth.authToken}`,
      //     "Content-Type": "application/json",
      //   },
      // });
      // setClinic({
      //   ...clinic,
      //   patientsInfos: response2.data.sort((a, b) =>
      //     a.last_name.localeCompare(b.last_name)
      //   ),
      // });
      // localStorage.setItem(
      //   "clinic",
      //   JSON.stringify({
      //     ...clinic,
      //     patientsInfos: response2.data.sort((a, b) =>
      //       a.last_name.localeCompare(b.last_name)
      //     ),
      //   })
      // );
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(
        `Error: unable to update patient demographics : ${err.message}`,
        {
          containerId: "B",
        }
      );
    }
  };

  return (
    <>
      {formDatas ? (
        <>
          <div className="demographics-card">
            <div className="demographics-card__header">
              <h1>
                Patient demographics <i className="fa-regular fa-id-card"></i>
              </h1>
              <div className="demographics-card__btns">
                {!editVisible ? (
                  <button onClick={(e) => setEditVisible((v) => !v)}>
                    Edit
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isLoadingFile}
                    onClick={handleSubmit}
                  >
                    Save
                  </button>
                )}
                <button onClick={handleClose}>Close</button>
              </div>
            </div>
            <form className="demographics-card__form">
              <div className="demographics-card__content">
                {errMsgPost && editVisible && (
                  <p className="demographics-card__err">{errMsgPost}</p>
                )}
                <p>
                  <label>First Name: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      required
                      value={formDatas.first_name}
                      onChange={handleChange}
                      name="first_name"
                      id="1"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.first_name
                  )}
                </p>
                <p>
                  <label>Middle Name: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.middle_name}
                      onChange={handleChange}
                      name="middle_name"
                      id="2"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.middle_name
                  )}
                </p>
                <p>
                  <label>Last Name: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      required
                      value={formDatas.last_name}
                      onChange={handleChange}
                      name="last_name"
                      id="3"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.last_name
                  )}
                </p>
                <p>
                  <label>Gender at birth: </label>
                  {editVisible ? (
                    <select
                      id="4"
                      value={formDatas.gender_at_birth}
                      onChange={handleChange}
                      name="gender_at_birth"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  ) : (
                    patientInfos.gender_at_birth
                  )}
                </p>
                <p>
                  <label>Gender identification: </label>
                  {editVisible ? (
                    <select
                      id="5"
                      value={formDatas.gender_identification}
                      onChange={handleChange}
                      name="gender_identification"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  ) : (
                    patientInfos.gender_identification
                  )}
                </p>
                <p>
                  <label>Chart Nbr: </label>
                  {patientInfos.chart_nbr}
                </p>
                <p>
                  <label>Health Insurance Nbr: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.health_insurance_nbr.toString()}
                      onChange={handleChange}
                      name="health_insurance_nbr"
                      id="7"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.health_insurance_nbr
                  )}
                </p>
                <p>
                  <label>Health Card Expiry: </label>
                  {editVisible ? (
                    <input
                      type="date"
                      value={
                        formDatas.health_card_expiry !== null
                          ? toLocalDate(formDatas.health_card_expiry)
                          : ""
                      }
                      onChange={handleChange}
                      name="health_card_expiry"
                      id="8"
                    />
                  ) : formDatas.health_card_expiry !== null ? (
                    toLocalDate(formDatas.health_card_expiry)
                  ) : (
                    ""
                  )}
                </p>
                <p>
                  <label>Date of birth: </label>
                  {editVisible ? (
                    <input
                      type="date"
                      required
                      value={
                        formDatas.date_of_birth !== null
                          ? toLocalDate(formDatas.date_of_birth)
                          : ""
                      }
                      onChange={handleChange}
                      name="date_of_birth"
                      id="9"
                      max={toLocalDate(new Date().toISOString())}
                    />
                  ) : formDatas.date_of_birth !== null ? (
                    toLocalDate(formDatas.date_of_birth)
                  ) : (
                    ""
                  )}
                </p>
                <p>
                  <label>Age: </label>
                  {formDatas.date_of_birth !== null
                    ? getAge(toLocalDate(formDatas.date_of_birth))
                    : ""}
                </p>
                <p>
                  <label>Email: </label>
                  {patientInfos.email}
                </p>
                <p>
                  <label>Cell Phone: </label>
                  {editVisible ? (
                    <input
                      type="tel"
                      value={formDatas.cell_phone}
                      onChange={handleChange}
                      name="cell_phone"
                      id="11"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.cell_phone
                  )}
                </p>
                <p>
                  <label>Home Phone: </label>
                  {editVisible ? (
                    <input
                      type="tel"
                      value={formDatas.home_phone}
                      onChange={handleChange}
                      name="home_phone"
                      id="12"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.home_phone
                  )}
                </p>
                <p>
                  <label>Preferred Phone: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.preferred_phone}
                      onChange={handleChange}
                      name="preferred_phone"
                      id="13"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.preferred_phone
                  )}
                </p>
                <p>
                  <label>Address: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.address}
                      onChange={handleChange}
                      name="address"
                      id="14"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.address
                  )}
                </p>
                <p>
                  <label>Postal Code: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.postal_code}
                      onChange={handleChange}
                      name="postal_code"
                      id="15"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.postal_code
                  )}
                </p>
                <p>
                  <label>Province/State: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.province_state}
                      onChange={handleChange}
                      name="province_state"
                      id="16"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.province_state
                  )}
                </p>
                <p>
                  <label>City: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.city}
                      onChange={handleChange}
                      name="city"
                      id="17"
                      autoComplete="off"
                    />
                  ) : (
                    patientInfos.city
                  )}
                </p>
                <p>
                  <label>Country: </label>
                  {editVisible ? (
                    <CountriesList
                      id="18"
                      handleChange={handleChange}
                      value={formDatas.country}
                      name="country"
                    />
                  ) : (
                    patientInfos.country
                  )}
                </p>
                <p>
                  <label>Assigned MD: </label>
                  {editVisible ? (
                    <DoctorsList
                      value={formDatas.assigned_md_id}
                      handleChange={handleChange}
                      name="assigned_md_id"
                      id="19"
                      staffInfos={clinic.staffInfos}
                    />
                  ) : (
                    staffIdToTitleAndName(
                      clinic.staffInfos,
                      formDatas.assigned_md_id,
                      true
                    )
                  )}
                </p>
                <p>
                  <label>Assigned Resident: </label>
                  {editVisible ? (
                    <DoctorsList
                      value={formDatas.assigned_resident_id}
                      handleChange={handleChange}
                      name="assigned_resident_id"
                      id="20"
                      staffInfos={clinic.staffInfos}
                    />
                  ) : (
                    patientInfos.assigned_resident_name?.full_name
                  )}
                </p>
                <p>
                  <label>Assigned Nurse: </label>
                  {editVisible ? (
                    <NursesList
                      value={formDatas.assigned_nurse_id}
                      handleChange={handleChange}
                      name="assigned_nurse_id"
                      id="22"
                      staffInfos={clinic.staffInfos}
                    />
                  ) : (
                    patientInfos.assigned_nurse_name?.full_name
                  )}
                </p>
                <p>
                  <label>Assigned Midwife: </label>
                  {editVisible ? (
                    <NursesList
                      value={formDatas.assigned_midwife_id}
                      handleChange={handleChange}
                      name="assigned_midwife_id"
                      id="23"
                      staffInfos={clinic.staffInfos}
                    />
                  ) : (
                    patientInfos.assigned_midwife_name?.full_name
                  )}
                </p>
                <p>
                  <label>Assigned Ultrasound Tech: </label>
                  {editVisible ? (
                    <USTechsList
                      value={formDatas.assigned_us_tech_id}
                      handleChange={handleChange}
                      name="assigned_us_tech_id"
                      id="24"
                      staffInfos={clinic.staffInfos}
                    />
                  ) : (
                    patientInfos.assigned_us_tech_name?.full_name
                  )}
                </p>
                <p>
                  <label>Assigned Physiotherapist: </label>
                  {editVisible ? (
                    <PhysiosList
                      value={formDatas.assigned_physio_id}
                      handleChange={handleChange}
                      name="assigned_physio_id"
                      id="25"
                      staffInfos={clinic.staffInfos}
                    />
                  ) : (
                    patientInfos.assigned_physio_name?.full_name
                  )}
                </p>
                <p>
                  <label>Assigned Psychologist: </label>
                  {editVisible ? (
                    <PsychosList
                      value={formDatas.assigned_psycho_id}
                      handleChange={handleChange}
                      name="assigned_psycho_id"
                      id="26"
                      staffInfos={clinic.staffInfos}
                    />
                  ) : (
                    patientInfos.assigned_psycho_name?.full_name
                  )}
                </p>
                <p>
                  <label>Assigned Nutritionist: </label>
                  {editVisible ? (
                    <NutritionistsList
                      value={formDatas.assigned_nutri_id}
                      handleChange={handleChange}
                      name="assigned_nutri_id"
                      id="27"
                      staffInfos={clinic.staffInfos}
                    />
                  ) : (
                    patientInfos.assigned_nutri_name?.full_name
                  )}
                </p>
              </div>
              <div className="demographics-card__img">
                {isLoadingFile ? (
                  <CircularProgress />
                ) : formDatas.avatar ? (
                  <img
                    src={`${BASE_URL}${formDatas.avatar.path}`}
                    alt="user-avatar"
                  />
                ) : (
                  <img
                    src="https://placehold.co/300x500/png?font=roboto&text=Profile\nPic"
                    alt="user-avatar-placeholder"
                  />
                )}
                {editVisible && (
                  <>
                    <p>Choose a picture</p>
                    <input
                      name="avatar"
                      type="file"
                      accept=".jpeg, .jpg, .png, .gif, .tif, .pdf, .svg"
                      onChange={handleAvatarChange}
                    />
                  </>
                )}
              </div>
            </form>
            <p className="demographics-card__sign">
              {patientInfos.updated_by_name ? (
                <em>
                  Updated by{" "}
                  {staffIdToTitleAndName(
                    clinic.staffInfos,
                    patientInfos.updated_by_id,
                    true
                  )}{" "}
                  on{" "}
                  {toLocalDateAndTime(
                    new Date(patientInfos.date_updated).toISOString()
                  )}
                </em>
              ) : (
                <em>
                  Created by{" "}
                  {staffIdToTitleAndName(
                    clinic.staffInfos,
                    patientInfos.created_by_id,
                    true
                  )}{" "}
                  on{" "}
                  {toLocalDateAndTime(
                    new Date(patientInfos.date_created).toISOString()
                  )}
                </em>
              )}
            </p>
          </div>
        </>
      ) : (
        <CircularProgress />
      )}
      <ConfirmGlobal />
      <ToastContainer
        enableMultiContainer
        containerId={"B"}
        position="bottom-right"
        autoClose={2000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={1}
      />
    </>
  );
};

export default DemographicsPU;
