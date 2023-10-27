import { CircularProgress } from "@mui/material";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axiosXano from "../../../../api/xano";
import useAuth from "../../../../hooks/useAuth";
import fillPdfForm from "../../../../utils/fillPdfForm";
import EformsList from "../../../Lists/EformsList";

const Eform = ({
  setAddVisible,
  patientInfos,
  handleAddToRecord,
  isLoadingFile,
}) => {
  const { auth, user, clinic } = useAuth();
  const [eForms, setEforms] = useState([]);
  const [formSelected, setFormSelected] = useState("");
  const [formURL, setFormURL] = useState("");

  useEffect(() => {
    const abortController = new AbortController();
    const fetchEforms = async () => {
      try {
        const response = await axiosXano.get("/eforms_blank", {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
          signal: abortController.signal,
        });
        if (abortController.signal.aborted) return;
        setEforms(response.data);
      } catch (err) {
        if (err.name !== "CanceledError")
          toast.error(`Error: unable to fetch eforms: ${err.message}`, {
            containerId: "B",
          });
      }
    };
    fetchEforms();
    return () => abortController.abort();
  }, [auth.authToken]);

  const handleFormChange = async (e) => {
    setFormSelected(e.target.value);
    setFormURL(
      await fillPdfForm(
        eForms.find(({ name }) => name === e.target.value).file.url,
        patientInfos,
        {
          full_name: user.name,
          sign: user.sign,
          phone: clinic.staffInfos.find(({ id }) => id === user.id).cell_phone,
        }
      )
    );
  };

  const handleClose = () => {
    setAddVisible(false);
  };

  return (
    <>
      <div className="eforms__form">
        <div className="eforms__explainations">
          <ul>
            <li>
              1. Please choose an e-form in the following list:{" "}
              <EformsList
                handleFormChange={handleFormChange}
                formSelected={formSelected}
                eforms={eForms}
              />{" "}
            </li>
            <li>2. Fill-in the form with relevant informations</li>
            <li>
              3. Click on print icon <i className="fa-solid fa-print"></i>{" "}
              (upper-right corner) if you want to print the form
            </li>
            <li>
              4. To Add the completed form to the patient record:
              <ul>
                <li>
                  a. Click on download icon{" "}
                  <i className="fa-solid fa-download"></i> (upper-right corner),
                  name and save the document on your computer{" "}
                </li>
                <li>
                  b. Click{" "}
                  <button onClick={handleAddToRecord} disabled={isLoadingFile}>
                    Add To Record
                  </button>{" "}
                  {isLoadingFile && (
                    <CircularProgress size="1rem" style={{ margin: "5px" }} />
                  )}
                  button and upload the file you just saved
                </li>
              </ul>
            </li>
          </ul>
          <button onClick={handleClose} disabled={isLoadingFile}>
            Close
          </button>
        </div>

        <div className="eforms__content">
          {formURL && (
            <iframe src={formURL} title="form" width="800" height="1000" />
          )}
        </div>
      </div>
    </>
  );
};

export default Eform;
