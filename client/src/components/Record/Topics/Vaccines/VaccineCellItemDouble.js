import React, { useState } from "react";
import { toast } from "react-toastify";
import { putPatientRecord } from "../../../../api/fetchRecords";
import useAuth from "../../../../hooks/useAuth";
import { toLocalDate } from "../../../../utils/formatDates";
import { getVaccinationLogo } from "../../../../utils/getVaccinationLogo";
import { confirmAlert } from "../../../Confirm/ConfirmGlobal";
import VaccineFormFirstDose from "./VaccineFormFirstDose";
import VaccineFormSecondDose from "./VaccineFormSecondDose";

const VaccineCellItemDouble = ({
  age,
  name,
  type,
  vaccineInfos,
  patientInfos,
  datas,
  editable,
  setEditable,
  setErrMsgPost,
}) => {
  //HOOKS
  const { auth, user, socket } = useAuth();
  const [formVisibleFirstDose, setFormVisibleFirstDose] = useState(false);
  const [formVisibleSecondDose, setFormVisibleSecondDose] = useState(false);
  const [scrollPosition, setScrollPosition] = useState([0, 0]);

  //STYLES
  const INTERVAL_GRADE_7_STYLE = {
    color:
      new Date(
        new Date(patientInfos.date_of_birth).setFullYear(
          new Date(patientInfos.date_of_birth).getFullYear() + 15
        )
      ) < new Date()
        ? "crimson"
        : "black",
  };
  const INTERVAL_65_YEARS_STYLE = {
    color:
      new Date(
        new Date(patientInfos.date_of_birth).setFullYear(
          new Date(patientInfos.date_of_birth).getFullYear() + 70
        )
      ) < new Date()
        ? "crimson"
        : "black",
  };

  //HANDLERS
  const handleCheckFirstDose = async (e) => {
    setErrMsgPost("");
    const checked = e.target.checked;
    if (checked) {
      setFormVisibleFirstDose(true);
      setScrollPosition([
        e.nativeEvent.view.scrollX,
        e.nativeEvent.view.scrollY,
      ]);
      setEditable(false);
    } else {
      if (
        await confirmAlert({
          content:
            "Do you really want to remove this vaccination ? (vaccination date will be lost)",
        })
      ) {
        const newDatas = { ...datas };
        newDatas[name][age] = [];
        try {
          await putPatientRecord(
            "/vaccines",
            datas.id,
            user.id,
            auth.authToken,
            newDatas,
            socket,
            "VACCINES"
          );
          toast.success("Saved successfully", { containerId: "B" });
        } catch (err) {
          toast.error(`Error unable to save vaccine: ${err.message}`, {
            containerId: "B",
          });
        }
      }
    }
  };

  const handleCheckSecondDose = async (e) => {
    setErrMsgPost("");
    const checked = e.target.checked;
    if (checked) {
      if (!datas[name][age].length) {
        setErrMsgPost("Please check first dose before");
        return;
      } else {
        setFormVisibleSecondDose(true);
        setScrollPosition([
          e.nativeEvent.view.scrollX,
          e.nativeEvent.view.scrollY,
        ]);
        setEditable(false);
      }
    } else {
      if (
        await confirmAlert({
          content:
            "Do you really want to remove this vaccination ? (vaccination date will be lost)",
        })
      ) {
        const newDatas = { ...datas };
        newDatas[name][age].pop();
        try {
          await putPatientRecord(
            "/vaccines",
            datas.id,
            user.id,
            auth.authToken,
            newDatas,
            socket,
            "VACCINES"
          );
          toast.success("Saved successfully", { containerId: "B" });
        } catch (err) {
          toast.error(`Error unable to save vaccine: ${err.message}`, {
            containerId: "B",
          });
        }
      }
    }
  };

  const isFirstDoseChecked = () => {
    if (!vaccineInfos.length) return false;
    return vaccineInfos[0]?.vaccine_date ? true : false;
  };
  const isSecondDoseChecked = () => {
    if (vaccineInfos.length < 2) return false;
    return vaccineInfos[1]?.vaccine_date ? true : false;
  };
  return (
    <>
      <div className="vaccines-item__cell">
        <input
          type="checkbox"
          onChange={handleCheckFirstDose}
          name={name}
          checked={isFirstDoseChecked()}
          disabled={!editable}
        />
        {vaccineInfos.length && vaccineInfos[0]?.vaccine_date ? (
          <label className="vaccines-item__checked">
            {toLocalDate(vaccineInfos[0].vaccine_date)}{" "}
            {getVaccinationLogo(type)}
          </label>
        ) : (
          <label>
            {age === "grade_7" &&
              name !== "Tdap_pregnancy" && ( //not a pregnancy
                <span style={INTERVAL_GRADE_7_STYLE}>
                  Grade 7 to 12 &#40;til{" "}
                  {toLocalDate(
                    new Date(
                      new Date(patientInfos.date_of_birth).setFullYear(
                        new Date(patientInfos.date_of_birth).getFullYear() + 15
                      )
                    )
                  )}
                  &#41;
                </span>
              )}
            {age === "grade_7" &&
              name === "Tdap_pregnancy" &&
              `One dose in every pregnancy, ideally between 27-32 weeks of gestation`}
            {age === "34_years" && `Every 10 Years`}
            {age === "65_years" && (
              <span style={INTERVAL_65_YEARS_STYLE}>
                {toLocalDate(
                  new Date(
                    new Date(patientInfos.date_of_birth).setFullYear(
                      new Date(patientInfos.date_of_birth).getFullYear() + 65
                    )
                  )
                )}{" "}
                to{" "}
                {toLocalDate(
                  new Date(
                    new Date(patientInfos.date_of_birth).setFullYear(
                      new Date(patientInfos.date_of_birth).getFullYear() + 70
                    )
                  )
                )}{" "}
              </span>
            )}
            {age === "6_months" && `Every year in the fall *`}{" "}
            {getVaccinationLogo(type)}
          </label>
        )}
        {formVisibleFirstDose && (
          <VaccineFormFirstDose
            setFormVisible={setFormVisibleFirstDose}
            setEditable={setEditable}
            scrollPosition={scrollPosition}
            datas={datas}
            name={name}
            age={age}
          />
        )}
      </div>
      <div className="vaccines-item__cell">
        {name !== "Tdap_pregnancy" &&
          name !== "Inf" &&
          name !== "Td_booster" && (
            <>
              <input
                type="checkbox"
                onChange={handleCheckSecondDose}
                name={name}
                checked={isSecondDoseChecked()}
                disabled={!editable}
              />
              {vaccineInfos.length === 2 && vaccineInfos[1]?.vaccine_date ? (
                <label className="vaccines-item__checked">
                  {toLocalDate(vaccineInfos[1].vaccine_date)}{" "}
                  {getVaccinationLogo(type)}
                </label>
              ) : (
                <label>
                  <span style={{ color: "black" }}>
                    {age === "grade_7" &&
                      (vaccineInfos.length && vaccineInfos[0]?.vaccine_date ? (
                        <span
                          style={{
                            color:
                              new Date(
                                new Date(
                                  vaccineInfos[0]?.vaccine_date
                                ).setMonth(
                                  new Date(
                                    vaccineInfos[0]?.vaccine_date
                                  ).getMonth() + 7
                                )
                              ) < new Date()
                                ? "crimson"
                                : "black",
                          }}
                        >
                          {toLocalDate(
                            new Date(
                              new Date(vaccineInfos[0]?.vaccine_date).setMonth(
                                new Date(
                                  vaccineInfos[0]?.vaccine_date
                                ).getMonth() + 6
                              )
                            )
                          ) +
                            " to " +
                            toLocalDate(
                              new Date(
                                new Date(
                                  vaccineInfos[0]?.vaccine_date
                                ).setMonth(
                                  new Date(
                                    vaccineInfos[0]?.vaccine_date
                                  ).getMonth() + 7
                                )
                              )
                            )}
                        </span>
                      ) : (
                        `6 months after`
                      ))}
                    {age === "65_years" &&
                      (vaccineInfos.length && vaccineInfos[0]?.vaccine_date ? (
                        <span
                          style={{
                            color:
                              new Date(
                                new Date(
                                  vaccineInfos[0]?.vaccine_date
                                ).setMonth(
                                  new Date(
                                    vaccineInfos[0]?.vaccine_date
                                  ).getMonth() + 7
                                )
                              ) < new Date()
                                ? "crimson"
                                : "black",
                          }}
                        >
                          {toLocalDate(
                            new Date(
                              new Date(vaccineInfos[0]?.vaccine_date).setMonth(
                                new Date(
                                  vaccineInfos[0]?.vaccine_date
                                ).getMonth() + 2
                              )
                            )
                          ) +
                            " to " +
                            toLocalDate(
                              new Date(
                                new Date(
                                  vaccineInfos[0]?.vaccine_date
                                ).setMonth(
                                  new Date(
                                    vaccineInfos[0]?.vaccine_date
                                  ).getMonth() + 7
                                )
                              )
                            )}
                        </span>
                      ) : (
                        `2 to 6 months after`
                      ))}
                  </span>{" "}
                  {getVaccinationLogo(type)}
                </label>
              )}
            </>
          )}
        {formVisibleSecondDose && (
          <VaccineFormSecondDose
            setFormVisible={setFormVisibleSecondDose}
            setEditable={setEditable}
            scrollPosition={scrollPosition}
            datas={datas}
            name={name}
            age={age}
          />
        )}
      </div>
    </>
  );
};

export default VaccineCellItemDouble;
