import React from "react";
import StatusOption from "./StatusOption";

const StatusList = ({
  handleChange,
  selectedStatus,
  statuses,
  label = true,
}) => {
  return (
    <>
      {label && <label>Status</label>}
      <select name="status" onChange={handleChange} value={selectedStatus}>
        {statuses.map((status) => (
          <StatusOption key={status} status={status} />
        ))}
      </select>
    </>
  );
};

export default StatusList;
