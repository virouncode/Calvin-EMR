import React, { useEffect, useState } from "react";
import useAuth from "../../hooks/useAuth";

const HinSearch = ({ handleClickHin }) => {
  const [userInput, setUserInput] = useState("");
  const [results, setResults] = useState([]);
  const { clinic } = useAuth();

  useEffect(() => {
    setResults(
      clinic.patientsInfos.filter(({ full_name }) =>
        full_name.toLowerCase().includes(userInput.toLowerCase())
      )
    );
  }, [clinic.patientsInfos, userInput]);

  return (
    <>
      <div className="hin-search">
        <label htmlFor="">Enter a patient name</label>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
        />
      </div>
      {results.length > 0 ? (
        <ul className="hin-results">
          {results.map((result) => (
            <li
              className="hin-results__item"
              key={result.id}
              onClick={(e) => handleClickHin(e, result.health_insurance_nbr)}
            >
              <span className="hin-results__code">
                {result.health_insurance_nbr}
              </span>{" "}
              <span className="hin-results__name">{result.full_name}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </>
  );
};

export default HinSearch;
