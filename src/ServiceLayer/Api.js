import { postDoctorDataUrl, postPatientDataUrl, postHospitalDataUrl } from "./Constants";

const postData = async (url, payload, successMessage) => {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (res.ok) {
      message.success(successMessage);
      return data;
    } else {
      message.error(data.message || "Registration failed");
      return null;
    }
  } catch (err) {
    console.error("Error posting data:", err);
    message.error("Something went wrong");
    return null;
  }
};

export const postDoctorData = (payload) => postData(postDoctorDataUrl, payload, "Doctor registered");
export const postPatientData = (payload) => postData(postPatientDataUrl, payload, "Patient registered");
export const postHospitalData = (payload) => postData(postHospitalDataUrl, payload, "Hospital registered");
