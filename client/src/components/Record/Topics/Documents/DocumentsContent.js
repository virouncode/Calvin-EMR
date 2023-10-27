import { CircularProgress } from "@mui/material";
import React from "react";
import { toLocalDate } from "../../../../utils/formatDates";

const DocumentsContent = ({ showDocument, datas, isLoading, errMsg }) => {
  return !isLoading ? (
    errMsg ? (
      <p className="topic-content__err">{errMsg}</p>
    ) : (
      <div className="topic-content">
        {datas && datas.length >= 1 ? (
          <ul>
            {datas
              .filter(({ acknowledged }) => !acknowledged)
              .sort((a, b) => b.date_created - a.date_created)
              .map((document) => (
                <li
                  key={document.id}
                  onClick={() =>
                    showDocument(document.file.url, document.file.mime)
                  }
                  style={{
                    textDecoration: "underline",
                    color: "#327AE6",
                    cursor: "pointer",
                    fontWeight: "bold",
                  }}
                >
                  - {document.description} ({toLocalDate(document.date_created)}
                  )
                </li>
              ))}
            {datas
              .filter(({ acknowledged }) => acknowledged)
              .sort((a, b) => b.date_created - a.date_created)
              .map((document) => (
                <li
                  key={document.id}
                  onClick={() =>
                    showDocument(document.file.url, document.file.mime)
                  }
                  style={{
                    textDecoration: "underline",
                    color: "black",
                    cursor: "pointer",
                    fontWeight: "normal",
                  }}
                >
                  - {document.description} ({toLocalDate(document.date_created)}
                  )
                </li>
              ))}
          </ul>
        ) : (
          "No documents"
        )}
      </div>
    )
  ) : (
    <CircularProgress size="1rem" style={{ margin: "5px" }} />
  );
};

export default DocumentsContent;
