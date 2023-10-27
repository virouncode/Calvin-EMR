import React from "react";

const ProgressNotesCardBody = ({
  tempFormDatas,
  editVisible,
  handleChange,
}) => {
  return (
    <div className="progress-notes__card-body">
      {!editVisible ? (
        <p>{tempFormDatas.body}</p>
      ) : (
        <textarea
          name="body"
          cols="90"
          rows="20"
          onChange={handleChange}
          value={tempFormDatas.body}
        />
      )}
    </div>
  );
};

export default ProgressNotesCardBody;
