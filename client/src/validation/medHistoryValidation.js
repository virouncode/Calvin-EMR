import * as yup from "yup";

export const medHistorySchema = yup.object({
  description: yup.string().required("Event description field is required"),
  date_of_event: yup
    .number("Invalid Date of event")
    .required("Date of event field is required"),
});
