import React from "react";
import { getAge } from "../../../utils/getAge";
import ProgressNotesCardPrint from "../Progress/ProgressNotesCardPrint";

const ProgressNotesPU = ({ patientInfos, progressNotes, checkedNotes }) => {
  const handlePrint = (e) => {
    e.nativeEvent.view.print();
  };
  return (
    <div className="progress-notes__print-page">
      <p
        style={{
          fontSize: "0.85rem",
          fontFamily: "Arial",
          marginLeft: "5px",
        }}
      >
        <em>
          {patientInfos.full_name}, {patientInfos.gender_identification},{" "}
          {getAge(patientInfos.date_of_birth)}, Chart Nbr:{" "}
          {patientInfos.chart_nbr}, {patientInfos.email},{" "}
          {patientInfos.preferred_phone}
        </em>
      </p>
      {progressNotes
        .filter(({ id }) => checkedNotes.includes(id))
        .map((progressNote) => (
          <ProgressNotesCardPrint
            progressNote={progressNote}
            key={progressNote.id}
          />
        ))}
      <p style={{ textAlign: "center" }}>
        <button
          type="button"
          onClick={handlePrint}
          style={{ width: "100px" }}
          className="progress-notes__print-page-btn"
        >
          Print
        </button>
      </p>
    </div>
  );
};

export default ProgressNotesPU;
