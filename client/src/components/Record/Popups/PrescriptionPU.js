import { CircularProgress } from "@mui/material";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import printJS from "print-js";
import React, { useEffect, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { postPatientRecord } from "../../../api/fetchRecords";
import axiosXano from "../../../api/xano";
import logo from "../../../assets/img/logoRect.png";
import useAuth from "../../../hooks/useAuth";
import {
  toLocalDate,
  toLocalDateAndTimeWithSeconds,
} from "../../../utils/formatDates";
import formatName from "../../../utils/formatName";
import { patientIdToName } from "../../../utils/patientIdToName";
import AddressesList from "../../Lists/AddressesList";
const BASE_URL = "https://xsjk-1rpe-2jnw.n7c.xano.io";

const PrescriptionPU = ({ medsRx, patientInfos }) => {
  const { auth, user, clinic, socket } = useAuth();
  const [addNotes, setAddNotes] = useState("");
  const [progress, setProgress] = useState(false);
  const printRef = useRef();
  const [addressSelected, setAddressSelected] = useState("");
  const [sites, setSites] = useState([]);
  const [settings, setSettings] = useState();

  useEffect(() => {
    const abortController = new AbortController();
    const fetchSites = async () => {
      try {
        const response = await axiosXano.get(`/sites`, {
          headers: {
            Authorization: `Bearer ${auth.authToken}`,
          },
          signal: abortController.signal,
        });
        if (abortController.signal.aborted) return;
        setSites(response.data);
      } catch (err) {
        if (err.name !== "CanceledError")
          toast.error(`Error: unable to fetch clinic sites: ${err.message}`, {
            containerId: "B",
          });
      }
    };
    fetchSites();
    return () => abortController.abort();
  }, [auth.authToken]);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchAddress = async () => {
      try {
        const response = await axiosXano.get(`/settings?staff_id=${user.id}`, {
          headers: {
            Authorization: `Bearer ${auth.authToken}`,
          },
          signal: abortController.signal,
        });
        if (abortController.signal.aborted) return;
        setAddressSelected(response.data.clinic_address);
        setSettings(response.data);
      } catch (err) {
        if (err.name !== "CanceledError")
          toast.error(
            `Error: unable to fetch user preferred site address: ${err.message}`,
            { containerId: "B" }
          );
      }
    };
    fetchAddress();
    return () => abortController.abort();
  }, [auth.authToken, user.id]);

  const handleAddNotes = (e) => {
    const value = e.target.value;
    setAddNotes(value);
  };

  const handlePrint = async (e) => {
    if (!addressSelected) {
      alert("Please choose an address first");
      return;
    }
    setProgress(true);
    const element = printRef.current;
    const canvas = await html2canvas(element, {
      logging: true,
      letterRendering: 1,
      allowTaint: false,
      useCORS: true,
    });
    const dataURL = canvas.toDataURL("image/png");
    const pdf = new jsPDF("portrait", "pt", "a4");
    // const imgProperties = pdf.getImageProperties(dataURL);
    pdf.addImage(
      dataURL,
      "PNG",
      0,
      0,
      pdf.internal.pageSize.getWidth(),
      pdf.internal.pageSize.getHeight()
    );
    let fileToUpload = await axiosXano.post(
      "/upload/attachment",
      {
        content: pdf.output("dataurlstring"),
      },
      {
        headers: {
          Authorization: `Bearer ${auth.authToken}`,
        },
      }
    );
    setProgress(false);

    printJS(`${BASE_URL}${fileToUpload.data.path}`);
  };

  const handleAddToRecord = async (e) => {
    if (!addressSelected) {
      alert("Please choose an address first");
      return;
    }
    setProgress(true);
    const element = printRef.current;

    const canvas = await html2canvas(element, {
      logging: true,
      letterRendering: 1,
      allowTaint: false,
      useCORS: true,
    });
    const dataURL = canvas.toDataURL("image/png");
    const pdf = new jsPDF("portrait", "pt", "a4");
    // const imgProperties = pdf.getImageProperties(dataURL);
    pdf.addImage(
      dataURL,
      "PNG",
      0,
      0,
      pdf.internal.pageSize.getWidth(),
      pdf.internal.pageSize.getHeight()
    );
    let fileToUpload = await axiosXano.post(
      "/upload/attachment",
      {
        content: pdf.output("dataurlstring"),
      },
      {
        headers: {
          Authorization: `Bearer ${auth.authToken}`,
        },
      }
    );
    const datas = {
      patient_id: patientInfos.id,
      assigned_id: user.id,
      description: `Prescription ${toLocalDateAndTimeWithSeconds(new Date())}`,
      file: fileToUpload.data,
      acknowledged: true,
    };

    const datasAttachment = [
      {
        file: fileToUpload.data,
        alias: `Prescription ${patientIdToName(
          clinic.patientsInfos,
          patientInfos.id
        )} ${toLocalDateAndTimeWithSeconds(new Date())}`,
        date_created: Date.now(),
        created_by_id: user.id,
        created_by_user_type: "staff",
      },
    ];

    try {
      const response = await postPatientRecord(
        "/documents",
        user.id,
        auth.authToken,
        datas,
        socket,
        "DOCUMENTS"
      );
      socket.emit("message", {
        route: "DOCMAILBOX",
        action: "create",
        content: { data: response.data },
      });
      const attach_ids = (
        await postPatientRecord("/attachments", user.id, auth.authToken, {
          attachments_array: datasAttachment,
        })
      ).data;

      await postPatientRecord(
        "/progress_notes",
        user.id,
        auth.authToken,
        {
          patient_id: patientInfos.id,
          object: `Prescription ${toLocalDateAndTimeWithSeconds(new Date())}`,
          body: "See attachment",
          version_nbr: 1,
          attachments_ids: attach_ids,
        },
        socket,
        "PROGRESS NOTES"
      );

      setProgress(false);
      toast.success("Saved succesfully", { containerId: "C" });
    } catch (err) {
      setProgress(false);
      toast.error(
        `Error: unable to save prescription to progress notes: ${err.message}`,
        { containerId: "C" }
      );
    }
  };

  const handleFax = () => {};

  const handleAddressChange = async (e) => {
    setAddressSelected(e.target.value);
    try {
      await axiosXano.put(
        `/settings/${settings.id}`,
        { ...settings, clinic_address: e.target.value },
        {
          headers: {
            Authorization: `Bearer ${auth.authToken}`,
          },
        }
      );
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <>
      <div className="prescription__actions">
        <button onClick={handlePrint} disabled={progress}>
          Print
        </button>
        <button onClick={handleAddToRecord} disabled={progress}>
          Add To Patient Record
        </button>
        <button onClick={handleFax} disabled={progress}>
          Fax
        </button>
        <AddressesList
          handleAddressChange={handleAddressChange}
          addressSelected={addressSelected}
          sites={sites}
        />
        {progress && <CircularProgress />}
      </div>
      <div ref={printRef} className="prescription__page">
        <div className="prescription__container">
          <div className="prescription__header">
            <div className="prescription__logo">
              <img src={logo} alt="CalvinEMR-logo" />
            </div>
            <div className="prescription__doctor-infos">
              <p>
                Prescriber: Dr. {formatName(user.name)} (LIC. {user.licence_nbr}
                )
              </p>
              <p>{sites.find(({ name }) => name === addressSelected)?.name}</p>
              <p>
                {sites.find(({ name }) => name === addressSelected)?.address}{" "}
                {
                  sites.find(({ name }) => name === addressSelected)
                    ?.postal_code
                }{" "}
                {
                  sites.find(({ name }) => name === addressSelected)
                    ?.province_state
                }{" "}
                {sites.find(({ name }) => name === addressSelected)?.city}
              </p>
              <p>
                Phone:{" "}
                {sites.find(({ name }) => name === addressSelected)?.phone}
              </p>
              <p>
                Fax: {sites.find(({ name }) => name === addressSelected)?.fax}
              </p>
            </div>
          </div>
          <div className="prescription__subheader">
            <div className="prescription__patient-infos">
              <p>
                Patient:{" "}
                {patientInfos.gender_identification.toLowerCase() === "male"
                  ? "Mr."
                  : "Mrs."}{" "}
                {patientInfos.full_name}, born{" "}
                {new Date(patientInfos.date_of_birth).toLocaleDateString(
                  "en-CA",
                  {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }
                )}
              </p>
            </div>
            <p className="prescription__date">
              Date emitted: {toLocalDate(new Date())}
            </p>
          </div>
          <div className="prescription__body">
            <p className="prescription__body-title">Prescription</p>
            <div className="prescription__body-content">
              {medsRx.map((med) => (
                <p key={med.id}>
                  {med.name} {med.dose ? `, ${med.dose}` : ""}{" "}
                  {med.route_of_administration
                    ? `, ${med.route_of_administration}`
                    : ""}{" "}
                  {med.frequency ? `, ${med.frequency}` : ""}{" "}
                  {med.number_of_doses ? `, ${med.number_of_doses}` : ""}{" "}
                  {med.duration ? `, during ${med.duration}` : ""}{" "}
                </p>
              ))}
              <p style={{ whiteSpace: "pre-line", lineHeight: "1.7rem" }}>
                {addNotes}
              </p>
            </div>
          </div>
          <div className="prescription__sign">
            <p>Sign: </p>
            <div className="prescription__sign-image">
              <img
                src={user.sign?.url}
                alt="doctor sign"
                crossOrigin="Anonymous"
              />
            </div>
          </div>
        </div>
      </div>
      <div className="prescription__add">
        <label>Additional Notes: </label>
        <textarea
          name="addNotes"
          onChange={handleAddNotes}
          value={addNotes}
          placeholder="The text will appear in the prescription, under the medications"
        />
      </div>
      <ToastContainer
        enableMultiContainer
        containerId={"C"}
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

export default PrescriptionPU;
