import { CircularProgress } from "@mui/material";
import React from "react";

const PharmaciesContent = ({ datas, isLoading, errMsg }) => {
  return !isLoading ? (
    errMsg ? (
      <p className="topic-content__err">{errMsg}</p>
    ) : (
      <div className="topic-content">
        {datas && datas.length >= 1 ? (
          <ul>
            {datas
              .sort((a, b) => b.date_created - a.date_created)
              .map((pharmacy) => (
                <li key={pharmacy.id}>
                  - <strong>{pharmacy.name.toUpperCase()}, </strong>
                  {pharmacy.address}, {pharmacy.city}
                </li>
              ))}
          </ul>
        ) : (
          "No pharmacies"
        )}
      </div>
    )
  ) : (
    <CircularProgress size="1rem" style={{ margin: "5px" }} />
  );
};

export default PharmaciesContent;
