import { CircularProgress } from "@mui/material";
import React, { useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import ConfirmGlobal, { confirmAlert } from "../../Confirm/ConfirmGlobal";
import ConcernForm from "../Topics/Concerns/ConcernForm";
import ConcernItem from "../Topics/Concerns/ConcernItem";

const ConcernsPU = ({
  patientId,
  setPopUpVisible,
  datas,
  setDatas,
  isLoading,
  errMsg,
}) => {
  //HOOKS
  const editCounter = useRef(0);
  const [addVisible, setAddVisible] = useState(false);
  const [errMsgPost, setErrMsgPost] = useState("");
  const [columnToSort, setColumnToSort] = useState("date_created");
  const direction = useRef(false);

  //HANDLERS
  const handleSort = (columnName) => {
    direction.current = !direction.current;
    setColumnToSort(columnName);
    setDatas([...datas]);
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

  const handleAdd = (e) => {
    setErrMsgPost("");
    editCounter.current += 1;
    setAddVisible((v) => !v);
  };

  return (
    <>
      {!isLoading ? (
        errMsg ? (
          <p className="concerns__err">{errMsg}</p>
        ) : (
          datas && (
            <>
              <h1 className="concerns__title">
                Ongoing concerns{" "}
                <i className="fa-solid fa-person-circle-question"></i>
              </h1>
              {errMsgPost && <div className="concerns__err">{errMsgPost}</div>}
              <table className="concerns__table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort("description")}>Concern</th>
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
                  {addVisible && (
                    <ConcernForm
                      editCounter={editCounter}
                      setAddVisible={setAddVisible}
                      patientId={patientId}
                      setErrMsgPost={setErrMsgPost}
                    />
                  )}
                  {direction.current
                    ? datas
                        .sort((a, b) =>
                          a[columnToSort]
                            ?.toString()
                            .localeCompare(b[columnToSort]?.toString())
                        )
                        .map((concern) => (
                          <ConcernItem
                            item={concern}
                            key={concern.id}
                            editCounter={editCounter}
                            setErrMsgPost={setErrMsgPost}
                          />
                        ))
                    : datas
                        .sort((a, b) =>
                          b[columnToSort]
                            ?.toString()
                            .localeCompare(a[columnToSort]?.toString())
                        )
                        .map((concern) => (
                          <ConcernItem
                            item={concern}
                            key={concern.id}
                            setDatas={setDatas}
                            editCounter={editCounter}
                            setErrMsgPost={setErrMsgPost}
                          />
                        ))}
                </tbody>
              </table>
              <div className="concerns__btn-container">
                <button onClick={handleAdd} disabled={addVisible}>
                  Add Concern
                </button>
                <button onClick={handleClose}>Close</button>
              </div>
            </>
          )
        )
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

export default ConcernsPU;
