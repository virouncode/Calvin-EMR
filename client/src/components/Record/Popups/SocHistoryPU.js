import { CircularProgress } from "@mui/material";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { putPatientRecord } from "../../../api/fetchRecords";
import useAuth from "../../../hooks/useAuth";
import { firstLetterUpper } from "../../../utils/firstLetterUpper";
import { toLocalDateAndTime } from "../../../utils/formatDates";
import { staffIdToTitleAndName } from "../../../utils/staffIdToTitleAndName";
import ConfirmGlobal, { confirmAlert } from "../../Confirm/ConfirmGlobal";
import SocHistoryForm from "../Topics/Social/SocHistoryForm";

const SocHistoryPU = ({
  patientId,
  setPopUpVisible,
  datas,
  isLoading,
  errMsg,
}) => {
  //HOOKS
  const { auth, user, clinic, socket } = useAuth();
  const [editVisible, setEditVisible] = useState(false);
  const [errMsgPost, setErrMsgPost] = useState("");
  const [formDatas, setFormDatas] = useState(datas ? datas[0] : null);

  //STYLES
  const DIALOG_CONTAINER_STYLE = {
    height: "100vh",
    width: "200vw",
    fontFamily: "Arial",
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    top: "0px",
    left: "0px",
    background: "rgba(0,0,0,0.8)",
    zIndex: "100000",
  };

  //HANDLERS
  const handleChange = (e) => {
    setErrMsgPost("");
    let value = e.target.value;
    const name = e.target.name;
    setFormDatas({ ...formDatas, [name]: value });
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
    //Validation
    const formDatasForValidation = { ...formDatas };
    delete formDatasForValidation.created_by_id;
    delete formDatasForValidation.created_by_name;
    delete formDatasForValidation.created_by_title;
    delete formDatasForValidation.id;
    delete formDatasForValidation.patient_id;
    delete formDatasForValidation.date_created;
    if (
      !Object.values(formDatasForValidation).some((v) => v !== "") ||
      !formDatasForValidation
    ) {
      setErrMsgPost("Please fill at least one field");
      return;
    }

    //Formatting
    setFormDatas({
      ...formDatas,
      occupations: firstLetterUpper(formDatas.occupations),
      religion: firstLetterUpper(formDatas.religion),
      sexual_orientation: firstLetterUpper(formDatas.sexual_orientation),
      special_diet: firstLetterUpper(formDatas.special_diet),
      smoking: firstLetterUpper(formDatas.smoking),
      alcohol: firstLetterUpper(formDatas.alcohol),
      recreational_drugs: firstLetterUpper(formDatas.recreational_drugs),
    });
    const datasToPut = {
      ...formDatas,
      occupations: firstLetterUpper(formDatas.occupations),
      religion: firstLetterUpper(formDatas.religion),
      sexual_orientation: firstLetterUpper(formDatas.sexual_orientation),
      special_diet: firstLetterUpper(formDatas.special_diet),
      smoking: firstLetterUpper(formDatas.smoking),
      alcohol: firstLetterUpper(formDatas.alcohol),
      recreational_drugs: firstLetterUpper(formDatas.recreational_drugs),
    };
    try {
      await putPatientRecord(
        "/social_history",
        formDatas.id,
        user.id,
        auth.authToken,
        datasToPut,
        socket,
        "SOCIAL HISTORY"
      );
      setEditVisible(false);
      toast.success("Saved successfully", { containerId: "B" });
    } catch (err) {
      toast.error(
        `Error: unable to update patient social history: ${err.message}`,
        {
          containerId: "B",
        }
      );
    }
  };

  return (
    <>
      {!isLoading ? (
        errMsg ? (
          <p className="sochistory__err">{errMsg}</p>
        ) : formDatas ? (
          <>
            <div className="sochistory-card">
              <div className="sochistory-card__header">
                <h1>
                  Patient social history{" "}
                  <i className="fa-solid fa-champagne-glasses"></i>
                </h1>
                <div className="sochistory-card__btns">
                  {!editVisible ? (
                    <button onClick={() => setEditVisible((v) => !v)}>
                      Edit
                    </button>
                  ) : (
                    <input type="submit" value="Save" onClick={handleSubmit} />
                  )}
                  <button onClick={handleClose}>Close</button>
                </div>
              </div>
              <form className="sochistory-form">
                {errMsgPost && (
                  <div className="sochistory-form__err">{errMsgPost}</div>
                )}
                <p>
                  <label>Occupations: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.occupations}
                      name="occupations"
                      onChange={handleChange}
                      autoComplete="off"
                    />
                  ) : (
                    formDatas.occupations
                  )}
                </p>
                <p>
                  <label>Income: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.income}
                      name="income"
                      onChange={handleChange}
                      autoComplete="off"
                    />
                  ) : (
                    formDatas.income
                  )}
                </p>
                <p>
                  <label>Religion: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.religion}
                      name="religion"
                      onChange={handleChange}
                      autoComplete="off"
                    />
                  ) : (
                    formDatas.religion
                  )}
                </p>
                <p>
                  <label>Sexual orientation: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.sexual_orientation}
                      name="sexual_orientation"
                      onChange={handleChange}
                      autoComplete="off"
                    />
                  ) : (
                    formDatas.sexual_orientation
                  )}
                </p>
                <p>
                  <label>Special diet: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.special_diet}
                      name="special_diet"
                      onChange={handleChange}
                      autoComplete="off"
                    />
                  ) : (
                    formDatas.special_diet
                  )}
                </p>
                <p>
                  <label>Smoking: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.smoking}
                      name="smoking"
                      onChange={handleChange}
                      autoComplete="off"
                    />
                  ) : (
                    formDatas.smoking
                  )}
                </p>
                <p>
                  <label>Alcohol: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.alcohol}
                      name="alcohol"
                      onChange={handleChange}
                      autoComplete="off"
                    />
                  ) : (
                    formDatas.alcohol
                  )}
                </p>
                <p>
                  <label>Recreational drugs: </label>
                  {editVisible ? (
                    <input
                      type="text"
                      value={formDatas.recreational_drugs}
                      name="recreational_drugs"
                      onChange={handleChange}
                      autoComplete="off"
                    />
                  ) : (
                    formDatas.recreational_drugs
                  )}
                </p>
                <p
                  style={{
                    padding: "0 5px",
                    textAlign: "right",
                    fontSize: "0.6rem",
                  }}
                >
                  <em>
                    Created by{" "}
                    {staffIdToTitleAndName(
                      clinic.staffInfos,
                      formDatas.created_by_id,
                      true
                    )}{" "}
                    on{" "}
                    {toLocalDateAndTime(
                      new Date(formDatas.date_created).toISOString()
                    )}
                  </em>
                </p>
              </form>
            </div>
          </>
        ) : (
          <SocHistoryForm
            setPopUpVisible={setPopUpVisible}
            patientId={patientId}
          />
        )
      ) : (
        <CircularProgress />
      )}
      <ConfirmGlobal containerStyle={DIALOG_CONTAINER_STYLE} />
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

export default SocHistoryPU;
