import React from "react";
import formatName from "../../../utils/formatName";
import { staffIdToName } from "../../../utils/staffIdToName";
import { staffIdToTitleAndName } from "../../../utils/staffIdToTitleAndName";

const AssignedPracticiansList = ({
  assignedStaff,
  handlePracticianChange,
  practicianSelectedId,
  staffInfos,
}) => {
  return (
    <div className="assigned-practicians-list">
      <label>With: </label>
      <select
        style={{ marginLeft: "10px" }}
        onChange={handlePracticianChange}
        value={practicianSelectedId}
      >
        <option value="" disabled>
          Choose a practician...
        </option>
        {assignedStaff.map((staff) => (
          <option key={staff.id} value={staff.id}>
            {staff.category === "Doctor"
              ? staffIdToTitleAndName(staffInfos, staff.id, true)
              : formatName(staffIdToName(staffInfos, staff.id)) +
                `(${staff.category})`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AssignedPracticiansList;
