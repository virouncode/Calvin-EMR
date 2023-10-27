import React from "react";
import { toLocalDate } from "../../../../utils/formatDates";

const VaccineHistory = ({ vaccineInfos, name }) => {
  const HISTORY_STYLE = {
    border: "solid 1px black",
    position: "absolute",
    bottom: "0",
    left: "5px",
    padding: "5px 10px",
    background: "#FEFEFE",
    borderRadius: "4px",
    width: "100px",
  };
  return vaccineInfos.length ? (
    <div style={HISTORY_STYLE}>
      <p style={{ padding: "0", margin: "0", marginBottom: "5px" }}>
        Vaccination history {`(${name})`}
      </p>
      <ul style={{ padding: "0", margin: "0", textAlign: "left" }}>
        {vaccineInfos
          .sort((a, b) => a.vaccine_date > b.vaccine_date)
          .map(({ vaccine_date }) => (
            <li
              key={vaccine_date}
              style={{ padding: "0", margin: "0", listStyle: "none" }}
            >
              {toLocalDate(vaccine_date)}
            </li>
          ))}
      </ul>
    </div>
  ) : (
    <div style={HISTORY_STYLE}>No vaccination history</div>
  );
};

export default VaccineHistory;
