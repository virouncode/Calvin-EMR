import React, { useEffect, useState } from "react";
import ProgressNotesTitle from "./ProgressNotesTitle";
import ProgressNotesToolBar from "./ProgressNotesToolBar";

const ProgressNotesHeader = ({
  patientInfos,
  allContentsVisible,
  contentRef,
  triangleRef,
  addVisible,
  setAddVisible,
  search,
  setSearch,
  checkedNotes,
  setCheckedNotes,
  checkAllNotes,
  setPopUpVisible,
  selectAll,
  setSelectAll,
  progressNotes,
  allBodiesVisible,
  setAllBodiesVisible,
  order,
  setOrder,
}) => {
  const [selectAllDisabled, setSelectAllDisabled] = useState(true);
  useEffect(() => {
    if (!progressNotes) return;
    if (progressNotes.length === 0 || !allContentsVisible) {
      setSelectAllDisabled(true);
    } else {
      if (allContentsVisible) {
        setSelectAllDisabled(false);
      }
    }
  }, [progressNotes, allContentsVisible]);
  return (
    <div className="progress-notes__header">
      <ProgressNotesTitle
        patientInfos={patientInfos}
        allContentsVisible={allContentsVisible}
        contentRef={contentRef}
        triangleRef={triangleRef}
        setSelectAllDisabled={setSelectAllDisabled}
      />
      <ProgressNotesToolBar
        addVisible={addVisible}
        setAddVisible={setAddVisible}
        search={search}
        setSearch={setSearch}
        contentRef={contentRef}
        triangleRef={triangleRef}
        checkedNotes={checkedNotes}
        setCheckedNotes={setCheckedNotes}
        checkAllNotes={checkAllNotes}
        setPopUpVisible={setPopUpVisible}
        selectAllDisabled={selectAllDisabled}
        selectAll={selectAll}
        setSelectAll={setSelectAll}
        allBodiesVisible={allBodiesVisible}
        setAllBodiesVisible={setAllBodiesVisible}
        order={order}
        setOrder={setOrder}
      />
    </div>
  );
};

export default ProgressNotesHeader;
