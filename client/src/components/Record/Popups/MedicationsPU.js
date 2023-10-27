import { CircularProgress } from "@mui/material";
import React, { useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import useAuth from "../../../hooks/useAuth";
import { patientIdToName } from "../../../utils/patientIdToName";
import ConfirmGlobal, { confirmAlert } from "../../Confirm/ConfirmGlobal";
import FakeWindow from "../../Presentation/FakeWindow";
import MedicationEvent from "../Topics/Medications/MedicationEvent";
import MedicationForm from "../Topics/Medications/MedicationForm";
import PrescriptionPU from "./PrescriptionPU";

const MedicationsPU = ({
  patientId,
  setPopUpVisible,
  patientInfos,
  datas,
  setDatas,
  isLoading,
  errMsg,
}) => {
  //HOOKS
  const { clinic } = useAuth();
  const editCounter = useRef(0);
  const [addVisible, setAddVisible] = useState(false);
  const [errMsgPost, setErrMsgPost] = useState("");
  const [presVisible, setPresVisible] = useState(false);
  const [columnToSort, setColumnToSort] = useState("start");
  const [medsRx, setMedsRx] = useState([]);
  const direction = useRef(false);

  //HANDLERS
  const handleSort = (columnName) => {
    direction.current = !direction.current;
    setColumnToSort(columnName);
    setDatas([...datas]);
  };

  const handleAdd = (e) => {
    setErrMsgPost("");
    editCounter.current += 1;
    setAddVisible((v) => !v);
  };

  const handleClose = async (e) => {
    if (
      editCounter.current === 0 ||
      (editCounter.current > 0 &&
        (await confirmAlert({
          content:
            "Do you really want to close the window ? Your changes will be lost",
        })))
    ) {
      setPopUpVisible(false);
    }
  };

  return (
    <>
      {!isLoading ? (
        errMsg ? (
          <p className="medications__err">{errMsg}</p>
        ) : (
          datas && (
            <>
              <h1 className="medications__title">
                Patient medications <i className="fa-solid fa-pills"></i>
              </h1>
              {errMsgPost && (
                <div className="medications__err">{errMsgPost}</div>
              )}
              <table className="medications__table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("active")}>Active</th>
                    <th onClick={() => handleSort("name")}>Medication Name</th>
                    <th onClick={() => handleSort("active_ingredients")}>
                      Active Ingredients
                    </th>
                    <th onClick={() => handleSort("route_of_administration")}>
                      Route
                    </th>
                    <th onClick={() => handleSort("dose")}>Dose</th>
                    <th onClick={() => handleSort("frequency")}>Frequency</th>
                    <th onClick={() => handleSort("number_of_doses")}>
                      Number of doses
                    </th>
                    <th onClick={() => handleSort("duration")}>Duration</th>
                    <th onClick={() => handleSort("created_by_id")}>
                      Created By
                    </th>
                    <th onClick={() => handleSort("date_created")}>
                      Created On
                    </th>
                    <th style={{ textDecoration: "none", cursor: "default" }}>
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {direction.current
                    ? datas
                        .filter((medication) => medication.active)
                        .sort((a, b) =>
                          a[columnToSort]
                            ?.toString()
                            .localeCompare(b[columnToSort]?.toString())
                        )
                        .map((medication) => (
                          <MedicationEvent
                            event={medication}
                            key={medication.id}
                            editCounter={editCounter}
                            presVisible={presVisible}
                            setPresVisible={setPresVisible}
                            setErrMsgPost={setErrMsgPost}
                            medsRx={medsRx}
                            setMedsRx={setMedsRx}
                          />
                        ))
                    : datas
                        .filter((medication) => medication.active)
                        .sort((a, b) =>
                          b[columnToSort]
                            ?.toString()
                            .localeCompare(a[columnToSort]?.toString())
                        )
                        .map((medication) => (
                          <MedicationEvent
                            event={medication}
                            key={medication.id}
                            editCounter={editCounter}
                            setErrMsgPost={setErrMsgPost}
                            presVisible={presVisible}
                            setPresVisible={setPresVisible}
                            medsRx={medsRx}
                            setMedsRx={setMedsRx}
                          />
                        ))}
                  {direction.current
                    ? datas
                        .filter((medication) => !medication.active)
                        .sort((a, b) =>
                          a[columnToSort]
                            ?.toString()
                            .localeCompare(b[columnToSort]?.toString())
                        )
                        .map((medication) => (
                          <MedicationEvent
                            event={medication}
                            key={medication.id}
                            editCounter={editCounter}
                            setErrMsgPost={setErrMsgPost}
                            presVisible={presVisible}
                            setPresVisible={setPresVisible}
                            medsRx={medsRx}
                            setMedsRx={setMedsRx}
                          />
                        ))
                    : datas
                        .filter((medication) => !medication.active)
                        .sort((a, b) =>
                          b[columnToSort]
                            ?.toString()
                            .localeCompare(a[columnToSort]?.toString())
                        )
                        .map((medication) => (
                          <MedicationEvent
                            event={medication}
                            key={medication.id}
                            editCounter={editCounter}
                            setErrMsgPost={setErrMsgPost}
                            presVisible={presVisible}
                            setPresVisible={setPresVisible}
                            medsRx={medsRx}
                            setMedsRx={setMedsRx}
                          />
                        ))}
                </tbody>
              </table>

              <div className="medications__btn-container">
                <button onClick={handleAdd} disabled={addVisible}>
                  Add Medication To Profile
                </button>
                <button onClick={handleClose}>Close</button>
              </div>
            </>
          )
        )
      ) : (
        <CircularProgress />
      )}
      {addVisible && (
        <MedicationForm
          patientId={patientId}
          setAddVisible={setAddVisible}
          editCounter={editCounter}
          setErrMsgPost={setErrMsgPost}
        />
      )}
      {presVisible && (
        <FakeWindow
          title={`NEW PRESCRIPTION to ${patientIdToName(
            clinic.patientsInfos,
            patientId
          )}`}
          width={800}
          height={600}
          x={(window.innerWidth - 800) / 2}
          y={(window.innerHeight - 600) / 2}
          color="black"
          setPopUpVisible={setPopUpVisible}
        >
          <PrescriptionPU medsRx={medsRx} patientInfos={patientInfos} />
        </FakeWindow>
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

export default MedicationsPU;
