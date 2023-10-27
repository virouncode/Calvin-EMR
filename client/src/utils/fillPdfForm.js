import { PDFDocument } from "pdf-lib";
import { toLocalDate } from "./formatDates";
import { getAge } from "./getAge";

export const fillPdfForm = async (url, patientInfos, doctorInfos) => {
  if (!patientInfos) return;
  const formUrl = url;
  const formPdfBytes = await fetch(formUrl).then((res) => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(formPdfBytes);
  const form = pdfDoc.getForm();

  if (form.getFieldMaybe("full_name")) {
    const fullNameField = form.getFieldMaybe("full_name");
    fullNameField.setText(patientInfos.full_name);
  }
  if (form.getFieldMaybe("first_name")) {
    const firstNameField = form.getFieldMaybe("first_name");
    firstNameField.setText(patientInfos.first_name);
  }
  if (form.getFieldMaybe("middle_name")) {
    const middleNameField = form.getFieldMaybe("middle_name");
    middleNameField.setText(patientInfos.middle_name);
  }
  if (form.getFieldMaybe("last_name")) {
    const lastNameField = form.getFieldMaybe("last_name");
    lastNameField.setText(patientInfos.last_name);
  }
  if (form.getFieldMaybe("gender")) {
    const genderField = form.getFieldMaybe("gender");
    genderField.setText(patientInfos.gender_identification);
  }
  if (form.getFieldMaybe("chart_nbr")) {
    const chartField = form.getFieldMaybe("chart_nbr");
    chartField.setText(patientInfos.chart_nbr.toString());
  }
  if (form.getFieldMaybe("health_insurance_nbr")) {
    const healthField = form.getFieldMaybe("health_insurance_nbr");
    healthField.setText(patientInfos.health_insurance_nbr);
  }
  if (form.getFieldMaybe("date_of_birth")) {
    const birthField = form.getFieldMaybe("date_of_birth");
    birthField.setText(toLocalDate(patientInfos.date_of_birth));
  }
  if (form.getFieldMaybe("age")) {
    const ageField = form.getFieldMaybe("age");
    ageField.setText(getAge(patientInfos.date_of_birth));
  }
  if (form.getFieldMaybe("email")) {
    const emailField = form.getFieldMaybe("email");
    emailField.setText(patientInfos.email);
  }
  if (form.getFieldMaybe("preferred_phone")) {
    const phoneField = form.getFieldMaybe("preferred_phone");
    phoneField.setText(patientInfos.preferred_phone);
  }
  if (form.getFieldMaybe("address")) {
    const addressField = form.getFieldMaybe("address");
    if (!form.getFieldMaybe("postal_code")) {
      addressField.setText(
        patientInfos.address +
          " " +
          patientInfos.postal_code +
          " " +
          patientInfos.province_state +
          " " +
          patientInfos.city +
          " " +
          patientInfos.country
      );
    } else {
      addressField.setText(patientInfos.address);
    }
  }
  if (form.getFieldMaybe("postal_code")) {
    const postalField = form.getFieldMaybe("postal_code");
    postalField.setText(patientInfos.postal_code);
  }
  if (form.getFieldMaybe("province_state")) {
    const provinceField = form.getFieldMaybe("province_state");
    provinceField.setText(patientInfos.province_state);
  }
  if (form.getFieldMaybe("city")) {
    const cityField = form.getFieldMaybe("city");
    cityField.setText(patientInfos.city);
  }
  if (form.getFieldMaybe("country")) {
    const countryField = form.getFieldMaybe("country");
    countryField.setText(patientInfos.country);
  }
  if (form.getFieldMaybe("doctor_full_name")) {
    const doctorNameField = form.getFieldMaybe("doctor_full_name");
    doctorNameField.setText("Dr. " + doctorInfos.full_name);
  }
  if (form.getFieldMaybe("doctor_phone")) {
    const doctorPhoneField = form.getFieldMaybe("doctor_phone");
    doctorPhoneField.setText(doctorInfos.phone);
  }

  if (form.getFieldMaybe("sign")) {
    const signUrl = doctorInfos.sign.url;
    const signImageBytes = await fetch(signUrl).then((res) =>
      res.arrayBuffer()
    );
    const signImage = await pdfDoc.embedPng(signImageBytes);
    const signImageField = form.getButton("sign");
    signImageField.setImage(signImage);
  }

  const pdfBytes = await pdfDoc.save();
  const docUrl = URL.createObjectURL(
    new Blob([pdfBytes], { type: "application/pdf" })
  );
  return docUrl;
};

export default fillPdfForm;
