import { CircularProgress } from "@mui/material";
import React from "react";

const MedHistoryContent = ({ datas, isLoading, errMsg }) => {
  return !isLoading ? (
    errMsg ? (
      <p className="topic-content__err">{errMsg}</p>
    ) : (
      <div className="topic-content">
        {datas && datas.length >= 1 ? (
          <ul>
            {datas
              .sort((a, b) => b.date_of_event - a.date_of_event)
              .map((event) => (
                <li key={event.id}>- {event.description}</li>
              ))}
          </ul>
        ) : (
          "No medical history"
        )}
      </div>
    )
  ) : (
    <CircularProgress size="1rem" style={{ margin: "5px" }} />
  );
};

export default MedHistoryContent;
