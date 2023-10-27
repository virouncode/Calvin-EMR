import React from "react";
import useAuth from "../../../hooks/useAuth";
import { toLocalDateAndTimeWithSeconds } from "../../../utils/formatDates";
import { staffIdToTitleAndName } from "../../../utils/staffIdToTitleAndName";
import TriangleButtonProgress from "../Buttons/TriangleButtonProgress";

const ProgressNotesCardHeader = ({
  patientInfos,
  isChecked,
  handleCheck,
  progressNote,
  tempFormDatas,
  editVisible,
  versions,
  handleVersionChange,
  handleEditClick,
  handleCalvinAIClick,
  handleSaveClick,
  handleCancelClick,
  handleChange,
  handleTriangleProgressClick,
}) => {
  const { clinic } = useAuth();

  return (
    <div className="progress-notes__card-header">
      <div className="progress-notes__card-header-row">
        <div className="progress-notes__card-author">
          <input
            className="progress-notes__card-check"
            type="checkbox"
            checked={isChecked(progressNote.id)}
            onChange={handleCheck}
          />
          <p>
            <strong>From: </strong>
            {staffIdToTitleAndName(
              clinic.staffInfos,
              tempFormDatas.updated_by_id,
              true
            ) ||
              staffIdToTitleAndName(
                clinic.staffInfos,
                tempFormDatas.created_by_id,
                true
              )}
            {tempFormDatas.updated_by_name?.full_name
              ? ` (${toLocalDateAndTimeWithSeconds(
                  tempFormDatas.date_updated
                )})`
              : ` (${toLocalDateAndTimeWithSeconds(
                  tempFormDatas.date_created
                )})`}
          </p>
        </div>
        <div className="progress-notes__card-version">
          <label>
            <strong style={{ marginRight: "5px" }}>Version: </strong>
          </label>
          {!editVisible ? (
            <select
              name="version_nbr"
              value={tempFormDatas.version_nbr.toString()}
              onChange={handleVersionChange}
            >
              {versions.map(({ version_nbr }) => (
                <option value={version_nbr.toString()} key={version_nbr}>
                  {"V" + version_nbr.toString()}
                </option>
              ))}
              <option value={(versions.length + 1).toString()}>
                {"V" + (versions.length + 1).toString()}
              </option>
            </select>
          ) : (
            <span style={{ marginRight: "10px" }}>{`V${
              versions.length + 2
            }`}</span>
          )}
          <div className="progress-notes__card-btns">
            {!editVisible ? (
              <>
                <button onClick={handleEditClick}>Edit</button>
                <button>
                  <a
                    href={`/billing/${patientInfos.health_insurance_nbr}/${
                      progressNote.date_updated ?? progressNote.date_created
                    }`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: "#FEFEFE" }}
                  >
                    Bill
                  </a>
                </button>
                <button onClick={handleCalvinAIClick}>CalvinAI</button>
              </>
            ) : (
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <button style={{ margin: "0 2px" }} onClick={handleSaveClick}>
                  Save
                </button>
                <button style={{ margin: "0 2px" }} onClick={handleCancelClick}>
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="progress-notes__card-header-row">
        <div className="progress-notes__card-object">
          <label>
            <strong>Subject: </strong>
          </label>
          {!editVisible ? (
            tempFormDatas.object
          ) : (
            <input
              type="text"
              value={tempFormDatas.object}
              onChange={handleChange}
              name="object"
              autoComplete="off"
            />
          )}
        </div>
        <div>
          <TriangleButtonProgress
            handleTriangleClick={handleTriangleProgressClick}
            color="dark"
            className={
              "triangle-progress-notes  triangle-progress-notes--active"
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ProgressNotesCardHeader;
