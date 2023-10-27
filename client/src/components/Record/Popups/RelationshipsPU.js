import { CircularProgress } from "@mui/material";
import React, { useRef, useState } from "react";
import { ToastContainer } from "react-toastify";
import ConfirmGlobal, { confirmAlert } from "../../Confirm/ConfirmGlobal";
import RelationshipForm from "../Topics/Relationships/RelationshipForm";
import RelationshipItem from "../Topics/Relationships/RelationshipItem";

const RelationshipsPU = ({
  patientId,
  setPopUpVisible,
  datas,
  isLoading,
  errMsg,
}) => {
  //HOOKS
  const editCounter = useRef(0);
  const [addVisible, setAddVisible] = useState(false);
  const [errMsgPost, setErrMsgPost] = useState("");

  //HANDLERS
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
          <p className="relationships__err">{errMsg}</p>
        ) : (
          datas && (
            <>
              <h1 className="relationships__title">
                Patient relationships{" "}
                <i className="fa-solid fa-people-group"></i>
              </h1>
              {errMsgPost && (
                <div className="relationships__err">{errMsgPost}</div>
              )}
              <table className="relationships__table">
                <thead>
                  <tr>
                    <th style={{ textDecoration: "none" }}>Relation</th>
                    <th style={{ textDecoration: "none" }}>With Patient</th>
                    <th style={{ textDecoration: "none" }}>Created By</th>
                    <th style={{ textDecoration: "none" }}>Created On</th>
                    <th style={{ textDecoration: "none" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {addVisible && (
                    <RelationshipForm
                      editCounter={editCounter}
                      setAddVisible={setAddVisible}
                      patientId={patientId}
                      setErrMsgPost={setErrMsgPost}
                    />
                  )}
                  {datas.map((item) => (
                    <RelationshipItem
                      item={item}
                      key={item.id}
                      editCounter={editCounter}
                      setErrMsgPost={setErrMsgPost}
                    />
                  ))}
                </tbody>
              </table>
              <div className="relationships__btn-container">
                <button onClick={handleAdd} disabled={addVisible}>
                  Add Relationship
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

export default RelationshipsPU;
