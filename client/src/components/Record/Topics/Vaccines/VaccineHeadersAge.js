import React from "react";

const VaccineHeadersAge = ({ name }) => {
  const H_STYLE = {
    minWidth: "100px",
    padding: "2px 5px",
    border: "solid 1px black",
  };
  const H_STYLE_GRADE_7 = {
    minWidth: "120px",
    padding: "2px 5px",
    border: "solid 1px black",
  };
  const H_STYLE_34_YEARS = {
    minWidth: "160px",
    padding: "2px 5px",
    border: "solid 1px black",
  };
  const H_STYLE_65_YEARS = {
    minWidth: "110px",
    padding: "2px 5px",
    border: "solid 1px black",
  };

  return name === "Grade 7" ? (
    <th style={H_STYLE_GRADE_7}>{name}</th>
  ) : name === ">= 34 Years" ? (
    <th style={H_STYLE_34_YEARS}>{name}</th>
  ) : name === "65 Years" ? (
    <th style={H_STYLE_65_YEARS}>{name}</th>
  ) : (
    <th style={H_STYLE}>{name}</th>
  );
};

export default VaccineHeadersAge;
