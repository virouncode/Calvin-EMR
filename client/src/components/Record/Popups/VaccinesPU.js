import { CircularProgress } from "@mui/material";
import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { putPatientRecord } from "../../../api/fetchRecords";
import useAuth from "../../../hooks/useAuth";
import { formatAge } from "../../../utils/formatAge";
import { vaccinesList } from "../../../utils/vaccines";
import ConfirmGlobal from "../../Confirm/ConfirmGlobal";
import SplittedHeader from "../../Presentation/SplittedHeader";
import VaccineCaption from "../Topics/Vaccines/VaccineCaption";
import VaccineHeadersAge from "../Topics/Vaccines/VaccineHeadersAge";
import VaccineItem from "../Topics/Vaccines/VaccineItem";

const VaccinesPU = ({
  datas,
  setDatas,
  isLoading,
  errMsg,
  setPopUpVisible,
  patientInfos,
}) => {
  //HOOKS
  const { auth, user, socket } = useAuth();
  const [editable, setEditable] = useState(true);
  const [editVisible, setEditVisible] = useState(false);
  const [errMsgPost, setErrMsgPost] = useState("");

  const handleChangeObs = (e) => {
    setErrMsgPost("");
    const value = e.target.value;
    setDatas({ ...datas, observations: value });
  };

  const handleEditClick = (e) => {
    setErrMsgPost("");
    setEditVisible(true);
  };

  const handleClose = () => {
    setPopUpVisible(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await putPatientRecord(
        "/vaccines",
        datas.id,
        user.id,
        auth.authToken,
        datas,
        socket,
        "VACCINES"
      );
      toast.success("Observations saved successfully", { containerId: "B" });
      setEditVisible(false);
    } catch (err) {
      toast.error(`Error: unable to save vaccine: ${err.message}`, {
        containerId: "B",
      });
    }
  };

  return (
    <>
      {!isLoading ? (
        errMsg ? (
          <p className="vaccines__err">{errMsg}</p>
        ) : (
          datas && (
            <>
              <h1 className="vaccines__title">
                Patient vaccines <i className="fa-solid fa-syringe"></i>
                <button onClick={handleClose}>Close</button>
              </h1>
              {errMsgPost && <div className="vaccines__err">{errMsgPost}</div>}
              <table className="vaccines__table">
                <thead>
                  <tr>
                    <SplittedHeader left="Vaccine" right="Age" />
                    {datas.ages.map((age) => (
                      <VaccineHeadersAge key={age} name={formatAge(age)} />
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {vaccinesList.map((vaccine, index) => (
                    <VaccineItem
                      key={vaccine.id}
                      vaccineId={vaccine.id}
                      item={datas[vaccine.name]}
                      dose={vaccine.dose}
                      ages={datas.ages}
                      name={vaccine.name}
                      type={vaccine.type}
                      description={vaccine.description}
                      datas={datas}
                      patientInfos={patientInfos}
                      setEditable={setEditable}
                      editable={editable}
                      setErrMsgPost={setErrMsgPost}
                    />
                  ))}
                </tbody>
              </table>
              <VaccineCaption />
              <div className="vaccines-obs">
                <p className="vaccines-obs__title">Observations</p>
                {editVisible ? (
                  <textarea
                    value={datas.observations}
                    onChange={handleChangeObs}
                    autoFocus
                  />
                ) : (
                  <p className="vaccines-obs__content">{datas.observations}</p>
                )}
                <div className="vaccines-obs__btn-container">
                  {!editVisible ? (
                    <button type="button" onClick={handleEditClick}>
                      Edit
                    </button>
                  ) : (
                    <button type="button" onClick={handleSave}>
                      Save
                    </button>
                  )}
                </div>
              </div>
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
          )
        )
      ) : (
        <CircularProgress />
      )}
    </>
  );
};

export default VaccinesPU;
