import React from "react";
import useAuth from "../../../hooks/useAuth";
import { toLocalDateAndTimeWithSeconds } from "../../../utils/formatDates";
import { staffIdToTitleAndName } from "../../../utils/staffIdToTitleAndName";
import TriangleButtonProgress from "../Buttons/TriangleButtonProgress";

const ProgressNotesCardHeaderFolded = ({
  tempFormDatas,
  handleTriangleProgressClick,
}) => {
  const { clinic } = useAuth();
  return (
    <div className="progress-notes__card-header progress-notes__card-header--folded">
      <div className="progress-notes__card-header--folded-title">
        <label>
          <strong>From: </strong>
        </label>
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
          ? ` (${toLocalDateAndTimeWithSeconds(tempFormDatas.date_updated)})`
          : ` (${toLocalDateAndTimeWithSeconds(tempFormDatas.date_created)})`}
        {" / "}
        <label>
          <strong>Subject: </strong>
        </label>
        {tempFormDatas.object}
      </div>
      <div>
        <TriangleButtonProgress
          handleTriangleClick={handleTriangleProgressClick}
          color="dark"
          className={"triangle-progress-notes"}
        />
      </div>
    </div>
  );
};

export default ProgressNotesCardHeaderFolded;
