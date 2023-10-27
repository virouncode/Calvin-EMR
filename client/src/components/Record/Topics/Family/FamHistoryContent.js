import { CircularProgress } from "@mui/material";
import React from "react";

const FamHistoryContent = ({ datas, isLoading, errMsg }) => {
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
                <li key={event.id}>
                  - {event.description} ({event.family_member_affected})
                </li>
              ))}
          </ul>
        ) : (
          "No family history"
        )}
      </div>
    )
  ) : (
    <CircularProgress size="1rem" style={{ margin: "5px" }} />
  );
};

export default FamHistoryContent;
