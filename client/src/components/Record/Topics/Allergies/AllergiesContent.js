import { CircularProgress } from "@mui/material";
import React from "react";

const AllergiesContent = ({ datas, isLoading, errMsg }) => {
  return !isLoading ? (
    errMsg ? (
      <p className="topic-content__err">{errMsg}</p>
    ) : (
      <div className="topic-content">
        {datas && datas.length >= 1 ? (
          <ul>
            {datas
              .sort((a, b) => b.date_created - a.date_created)
              .map((allergy) => (
                <li key={allergy.id}>- {allergy.allergy}</li>
              ))}
          </ul>
        ) : (
          "No allergies"
        )}
      </div>
    )
  ) : (
    <CircularProgress size="1rem" style={{ margin: "5px" }} />
  );
};

export default AllergiesContent;
