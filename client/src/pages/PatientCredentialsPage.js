import React, { useState } from "react";
import { Helmet } from "react-helmet";
import CredentialsFormPatient from "../components/PatientPortal/CredentialsPatient/CredentialsFormPatient";
import VerifyPasswordPatient from "../components/PatientPortal/CredentialsPatient/VerifyPasswordPatient";

const PatientCredentialsPage = () => {
  const [verified, setVerified] = useState(false);

  return (
    <>
      <Helmet>
        <title>Credentials</title>
      </Helmet>
      <section className="credentials-section">
        <h2 className="credentials-section-title">Change email/password</h2>
        {!verified ? (
          <VerifyPasswordPatient setVerified={setVerified} />
        ) : (
          <CredentialsFormPatient />
        )}
      </section>
    </>
  );
};

export default PatientCredentialsPage;
