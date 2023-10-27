import * as yup from "yup";

export const famHistorySchema = yup.object({
  description: yup.string().required("Event description field is required"),
  family_member_affected: yup
    .string()
    .required("Relative affected field is required"),
  date_of_event: yup
    .number("Invalid Date of event")
    .required("Date of event field is required"),
});
