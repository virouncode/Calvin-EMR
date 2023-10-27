import React from "react";
import { ResizableBox } from "react-resizable";

const TestResizable = () => {
  return (
    <ResizableBox
      width={20}
      height={20}
      draggableOpts={{ grid: [25, 25] }}
      minConstraints={[100, 100]}
      maxConstraints={[300, 300]}
    >
      <div style={{ broder: "solid 1px black" }}>Contents</div>
    </ResizableBox>
  );
};

export default TestResizable;
