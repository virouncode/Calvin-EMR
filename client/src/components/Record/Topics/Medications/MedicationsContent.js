import { CircularProgress } from "@mui/material";
import React from "react";

const MedicationsContent = ({ datas, isLoading, errMsg }) => {
  return !isLoading ? (
    errMsg ? (
      <p className="topic-content__err">{errMsg}</p>
    ) : (
      <div className="topic-content">
        {datas && datas.length >= 1 ? (
          <ul>
            {datas
              .filter((medication) => medication.active)
              .sort((a, b) => b.date_created - a.date_created)
              .map((medication) => (
                <li key={medication.id}>
                  - <strong>{medication.name}</strong>,{" "}
                  {medication.dose ? `${medication.dose}, ` : ""}
                  {medication.number_of_doses
                    ? `${medication.number_of_doses}, `
                    : ""}{" "}
                  during {medication.duration}, active
                </li>
              ))}
            {datas
              .filter((medication) => !medication.active)
              .sort((a, b) => b.date_created - a.date_created)
              .map((medication) => (
                <li key={medication.id}>
                  - <strong>{medication.name}</strong>,{" "}
                  {medication.dose ? `${medication.dose}, ` : ""}
                  {medication.number_of_doses
                    ? `${medication.number_of_doses}, `
                    : ""}
                  during {medication.duration},not active
                </li>
              ))}
          </ul>
        ) : (
          "No medications"
        )}
      </div>
    )
  ) : (
    <CircularProgress size="1rem" style={{ margin: "5px" }} />
  );
};

export default MedicationsContent;
