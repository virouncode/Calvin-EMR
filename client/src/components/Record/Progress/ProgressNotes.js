import { CircularProgress } from "@mui/material";
import React, { useEffect, useRef, useState } from "react";
import NewWindow from "react-new-window";
import useAuth from "../../../hooks/useAuth";
import { useProgressNotes } from "../../../hooks/useProgressNotes";
import { toLocalDateAndTimeWithSeconds } from "../../../utils/formatDates";
import { onMessageProgressNotes } from "../../../utils/socketHandlers/onMessageProgressNotes";
import ProgressNotesPU from "../Popups/ProgressNotesPU";
import ProgressNotesCard from "./ProgressNotesCard";
import ProgressNotesForm from "./ProgressNotesForm";
import ProgressNotesHeader from "./ProgressNotesHeader";

const ProgressNotes = ({ patientInfos, allContentsVisible, patientId }) => {
  //hooks
  const { user, socket } = useAuth();
  const [addVisible, setAddVisible] = useState(false);
  const [popUpVisible, setPopUpVisible] = useState(false);
  const [search, setSearch] = useState("");
  const [checkedNotes, setCheckedNotes] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [allBodiesVisible, setAllBodiesVisible] = useState(false);
  const [order, setOrder] = useState(
    user.settings.progress_notes_order ?? "top"
  );
  const contentRef = useRef(null);
  const triangleRef = useRef(null);
  const [
    { datas: progressNotes, isLoading, errMsg },
    fetchRecord,
    setProgressNotes,
  ] = useProgressNotes("/progress_notes", patientId, order);

  const checkAllNotes = () => {
    const allNotesIds = progressNotes.map(({ id }) => id);
    setCheckedNotes(allNotesIds);
  };

  useEffect(() => {
    if (!socket) return;
    const onMessage = (message) =>
      onMessageProgressNotes(
        message,
        progressNotes,
        setProgressNotes,
        patientId,
        order
      );
    socket.on("message", onMessage);
    return () => {
      socket.off("message", onMessage);
    };
  }, [patientId, progressNotes, setProgressNotes, socket, order]);

  return (
    <div className="progress-notes">
      <ProgressNotesHeader
        patientInfos={patientInfos}
        allContentsVisible={allContentsVisible}
        contentRef={contentRef}
        triangleRef={triangleRef}
        addVisible={addVisible}
        setAddVisible={setAddVisible}
        search={search}
        setSearch={setSearch}
        checkedNotes={checkedNotes}
        setCheckedNotes={setCheckedNotes}
        checkAllNotes={checkAllNotes}
        setPopUpVisible={setPopUpVisible}
        selectAll={selectAll}
        setSelectAll={setSelectAll}
        progressNotes={progressNotes}
        allBodiesVisible={allBodiesVisible}
        setAllBodiesVisible={setAllBodiesVisible}
        order={order}
        setOrder={setOrder}
      />
      {popUpVisible && (
        <NewWindow
          title="Patient progress notes"
          features={{
            toolbar: "no",
            scrollbars: "no",
            menubar: "no",
            status: "no",
            directories: "no",
            width: 793.7,
            height: 1122.5,
            left: 320,
            top: 200,
          }}
          onUnload={() => setPopUpVisible(false)}
        >
          <ProgressNotesPU
            patientInfos={patientInfos}
            progressNotes={progressNotes}
            checkedNotes={checkedNotes}
          />
        </NewWindow>
      )}

      <div
        className={
          allContentsVisible
            ? "progress-notes__content progress-notes__content--active"
            : "progress-notes__content"
        }
        ref={contentRef}
      >
        {progressNotes && addVisible && (
          <ProgressNotesForm
            setAddVisible={setAddVisible}
            patientId={patientId}
            order={order}
          />
        )}
        {!isLoading ? (
          errMsg ? (
            <p className="progress-notes__err">{errMsg}</p>
          ) : progressNotes && progressNotes.length ? (
            progressNotes
              .filter(
                (note) =>
                  note.created_by_name?.full_name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                  note.updated_by_name?.full_name
                    .toLowerCase()
                    .includes(search.toLowerCase()) ||
                  note.object.toLowerCase().includes(search.toLowerCase()) ||
                  note.body.toLowerCase().includes(search.toLowerCase()) ||
                  toLocalDateAndTimeWithSeconds(note.date_created).includes(
                    search.toLowerCase()
                  ) ||
                  toLocalDateAndTimeWithSeconds(note.date_updated).includes(
                    search.toLowerCase()
                  )
              )
              .map((progressNote) => (
                <ProgressNotesCard
                  progressNote={progressNote}
                  progressNotes={progressNotes}
                  setProgressNotes={setProgressNotes}
                  order={order}
                  patientId={patientId}
                  key={progressNote.id}
                  checkedNotes={checkedNotes}
                  setCheckedNotes={setCheckedNotes}
                  setSelectAll={setSelectAll}
                  allBodiesVisible={allBodiesVisible}
                  patientInfos={patientInfos}
                />
              ))
          ) : (
            !addVisible && (
              <div style={{ padding: "5px" }}>No progress notes</div>
            )
          )
        ) : (
          <CircularProgress size="1rem" style={{ margin: "5px" }} />
        )}
      </div>
    </div>
  );
};

export default ProgressNotes;
