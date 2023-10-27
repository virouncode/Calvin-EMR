import LinearProgress from "@mui/joy/LinearProgress";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import {
  getPatientRecord,
  postPatientRecord,
  putPatientRecord,
} from "../../../api/fetchRecords";
import axiosXano from "../../../api/xano";
import useAuth from "../../../hooks/useAuth";
import { toLocalDateAndTimeWithSeconds } from "../../../utils/formatDates";
import { patientIdToName } from "../../../utils/patientIdToName";
import { onMessageVersions } from "../../../utils/socketHandlers/onMessageVersions";
import { staffIdToTitleAndName } from "../../../utils/staffIdToTitleAndName";
import { confirmAlert } from "../../Confirm/ConfirmGlobal";
import FakeWindow from "../../Presentation/FakeWindow";
import CalvinAI from "./CalvinAI/CalvinAI";
import ProgressNotesAttachments from "./ProgressNotesAttachments";
import ProgressNotesCardBody from "./ProgressNotesCardBody";
import ProgressNotesCardHeader from "./ProgressNotesCardHeader";
import ProgressNotesCardHeaderFolded from "./ProgressNotesCardHeaderFolded";
var _ = require("lodash");

const ProgressNotesCard = ({
  progressNote,
  progressNotes,
  setProgressNotes,
  patientId,
  checkedNotes,
  setCheckedNotes,
  setSelectAll,
  allBodiesVisible,
  patientInfos,
}) => {
  //hooks
  const [editVisible, setEditVisible] = useState(false);
  const [tempFormDatas, setTempFormDatas] = useState(null);
  const [formDatas, setFormDatas] = useState(null);
  const [versions, setVersions] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [bodyVisible, setBodyVisible] = useState(true);
  const bodyRef = useRef(null);
  const { auth, user, clinic, socket } = useAuth();
  const [popUpVisible, setPopUpVisible] = useState(false);

  useEffect(() => {
    if (!socket || !versions) return;
    const onMessage = (message) =>
      onMessageVersions(message, versions, setVersions, progressNote.id);
    socket.on("message", onMessage);
    return () => {
      socket.off("message", onMessage);
    };
  }, [progressNote.id, socket, versions]);

  useEffect(() => {
    if (progressNote) {
      setFormDatas(progressNote);
      setTempFormDatas(progressNote);
    }
  }, [progressNote]);

  useEffect(() => {
    setBodyVisible(allBodiesVisible);
  }, [allBodiesVisible]);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchVersions = async () => {
      try {
        const versionsResults = (
          await getPatientRecord(
            "/progress_notes_log",
            patientId,
            auth.authToken,
            abortController
          )
        ).filter(
          ({ progress_note_id }) => progress_note_id === progressNote.id
        );
        if (abortController.signal.aborted) return;
        versionsResults.forEach(
          (version) => (version.id = version.progress_note_id) //change id field value to progress_note_id value to match progress_notes fields
        );
        versionsResults.sort((a, b) => a.version_nbr - b.version_nbr);

        setVersions(versionsResults);
      } catch (err) {
        if (err.name !== "CanceledError")
          toast.error(`Error: unable to save versions: ${err.message}`, {
            containerId: "A",
          });
      }
    };
    fetchVersions();
    return () => {
      abortController.abort();
    };
  }, [auth.authToken, patientId, progressNote.id]);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchAttachments = async () => {
      try {
        const response = (
          await axiosXano.post(
            "/attachments_for_progress_note",
            { attachments_ids: progressNote.attachments_ids },
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${auth.authToken}`,
              },
              signal: abortController.signal,
            }
          )
        ).data;
        if (abortController.signal.aborted) return;
        setAttachments(
          response.sort((a, b) => a.date_created - b.date_created)
        );
      } catch (err) {
        if (err.name !== "CanceledError")
          toast.error(`Error: unable to fetch attachments: ${err.message}`, {
            containerId: "A",
          });
      }
    };
    fetchAttachments();
    return () => {
      abortController.abort();
    };
  }, [auth.authToken, progressNote.attachments_ids]);

  //HANDLERS
  const handleTriangleProgressClick = (e) => {
    setBodyVisible((v) => !v);
    bodyRef.current.classList.toggle(
      "progress-notes__card-body-container--active"
    );
  };

  const handleCalvinAIClick = () => {
    if (!patientInfos.ai_consent) {
      alert("The patient didn't give his/her consent to use AI for his record");
      return;
    }
    setPopUpVisible((v) => !v);
  };

  const handleEditClick = (e) => {
    setEditVisible(true);
  };
  const handleChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setTempFormDatas({ ...tempFormDatas, [name]: value });
  };

  const handleCancelClick = async (e) => {
    if (
      await confirmAlert({
        content: "Do you really want to cancel ? Your changes won't be saved",
      })
    ) {
      setEditVisible(false);
    }
  };
  const handleSaveClick = async (e) => {
    if (
      (_.isEqual(tempFormDatas, formDatas) &&
        (await confirmAlert({
          content: "You didn't change anything to the note, save anyway ?",
        }))) ||
      !_.isEqual(tempFormDatas, formDatas)
    ) {
      //First post the former progress note version to the progress note log tbl
      const logDatas = { ...formDatas };
      logDatas.progress_note_id = formDatas.id;
      if (formDatas.version_nbr !== 1) {
        logDatas.updated_by_id = formDatas.updated_by_id;
        logDatas.date_updated = formDatas.date_updated;
      }

      try {
        await postPatientRecord(
          "/progress_notes_log",
          user.id,
          auth.authToken,
          logDatas
        );
        //then put the new progress note version in the progress note tbl
        tempFormDatas.version_nbr = progressNote.version_nbr + 1; //increment version
        await putPatientRecord(
          "/progress_notes",
          progressNote.id,
          user.id,
          auth.authToken,
          tempFormDatas,
          socket,
          "PROGRESS NOTES"
        );
        setEditVisible(false);
        const versionsResults = (
          await getPatientRecord(
            "/progress_notes_log",
            patientId,
            auth.authToken
          )
        ).filter(
          ({ progress_note_id }) => progress_note_id === progressNote.id
        );

        versionsResults.forEach(
          (version) => (version.id = version.progress_note_id)
        );
        versionsResults.sort((a, b) => a.version_nbr - b.version_nbr);
        socket.emit("message", {
          route: "VERSIONS",
          content: { data: versionsResults },
        });
        // setVersions(versionsResults);
        toast.success("Progress note saved successfully", { containerId: "A" });
      } catch (err) {
        toast.error(`Error: unable to save progress note: ${err.message}`, {
          containerId: "A",
        });
      }
    }
  };

  const handleCheck = (e) => {
    const value = e.target.checked;
    let checkedNotesUpdated = [...checkedNotes];
    if (value) {
      if (checkedNotesUpdated.indexOf(progressNote.id) === -1) {
        checkedNotesUpdated.push(progressNote.id);
      }
    } else {
      if (checkedNotesUpdated.indexOf(progressNote.id) !== -1) {
        checkedNotesUpdated = checkedNotesUpdated.filter(
          (id) => id !== progressNote.id
        );
      }
    }
    setCheckedNotes(checkedNotesUpdated);
    if (checkedNotesUpdated.length === 0) {
      setSelectAll(false);
    } else if (checkedNotesUpdated.length === progressNotes.length) {
      setSelectAll(true);
    }
  };

  const handleVersionChange = async (e) => {
    const value = parseInt(e.target.value); //the choosen version
    let updatedProgressNotes = [...progressNotes];
    const index = _.findIndex(updatedProgressNotes, {
      id: progressNote.id,
    });
    if (value < versions.length + 1) {
      //former version
      updatedProgressNotes[index] = versions[value - 1];
    } else {
      //last version
      const response = await axiosXano.get(
        `/progress_notes/${progressNote.id}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${auth.authToken}`,
          },
        }
      );
      updatedProgressNotes[index] = response.data;
    }
    setProgressNotes(updatedProgressNotes);
  };

  const isChecked = (progressNoteId) => {
    return checkedNotes.includes(progressNoteId);
  };

  return tempFormDatas && versions ? (
    <div className="progress-notes__card">
      {bodyVisible ? (
        <ProgressNotesCardHeader
          patientInfos={patientInfos}
          isChecked={isChecked}
          handleCheck={handleCheck}
          progressNote={progressNote}
          tempFormDatas={tempFormDatas}
          editVisible={editVisible}
          versions={versions}
          handleVersionChange={handleVersionChange}
          handleEditClick={handleEditClick}
          handleCalvinAIClick={handleCalvinAIClick}
          handleSaveClick={handleSaveClick}
          handleCancelClick={handleCancelClick}
          handleChange={handleChange}
          handleTriangleProgressClick={handleTriangleProgressClick}
        />
      ) : (
        <ProgressNotesCardHeaderFolded
          tempFormDatas={tempFormDatas}
          handleTriangleProgressClick={handleTriangleProgressClick}
        />
      )}
      <div
        ref={bodyRef}
        className={
          bodyVisible
            ? "progress-notes__card-body-container progress-notes__card-body-container--active"
            : "progress-notes__card-body-container"
        }
      >
        <ProgressNotesCardBody
          tempFormDatas={tempFormDatas}
          editVisible={editVisible}
          handleChange={handleChange}
        />
        <ProgressNotesAttachments
          attachments={attachments}
          deletable={false}
          patientId={patientId}
        />
        {!editVisible && (
          <div className="progress-notes__card-sign">
            {tempFormDatas.updated_by_id ? (
              <p style={{ padding: "0 10px" }}>
                Updated by{" "}
                {staffIdToTitleAndName(
                  clinic.staffInfos,
                  tempFormDatas.updated_by_id,
                  true
                )}{" "}
                on {toLocalDateAndTimeWithSeconds(tempFormDatas.date_updated)}
              </p>
            ) : null}
            <p style={{ padding: "0 10px" }}>
              Created by{" "}
              {staffIdToTitleAndName(
                clinic.staffInfos,
                tempFormDatas.created_by_id,
                true
              )}{" "}
              on {toLocalDateAndTimeWithSeconds(tempFormDatas.date_created)}
            </p>
          </div>
        )}
      </div>
      {popUpVisible && (
        <FakeWindow
          title={`CALVIN AI talk about ${patientIdToName(
            clinic.patientsInfos,
            patientId
          )}`}
          width={1000}
          height={window.innerHeight}
          x={(window.innerWidth - 1000) / 2}
          y={0}
          color="#9CB9E4"
          setPopUpVisible={setPopUpVisible}
        >
          <CalvinAI
            attachments={attachments}
            initialBody={formDatas.body}
            patientInfos={patientInfos}
          />
        </FakeWindow>
      )}
    </div>
  ) : (
    <LinearProgress
      thickness={0.5}
      style={{ margin: "10px" }}
      color="#cececd"
    />
  );
};

export default ProgressNotesCard;
