import axios from "axios";

// PINATA JWT TOKEN 
const PINATA_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIzNGM4NTgzMS1iY2M0LTQxNGEtYTNmNi0xY2QwNTEyZWQyZDUiLCJlbWFpbCI6Inlhc2hzcHB1MTlAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6ImRiY2RiYWYyOGU3NGQ3NTgxMjU4Iiwic2NvcGVkS2V5U2VjcmV0IjoiNDEwMmJlNzAzMWY0ZmVjOTk3ZjJmOWZhOTVhNTFmODk4ZDcxZmRlNmUxZTMxYzBjMTJiMGNjMjgyZGJmNmI4MCIsImV4cCI6MTc5NzM0MDc2N30.0p_srmYKr9NBo4xnNfOKAv4JMseT5yjemi6ssSzDpeo"; 

export const uploadToIPFS = async (file: File) => {
  if (!file) return null;

  const formData = new FormData();
  formData.append("file", file);

  const metadata = JSON.stringify({
    name: "License_Doc_" + Date.now(),
  });
  formData.append("pinataMetadata", metadata);

  const options = JSON.stringify({
    cidVersion: 0,
  });
  formData.append("pinataOptions", options);

  try {
    const res = await axios.post(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      formData,
      {
        headers: {
          // @ts-ignore
          "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          Authorization: `Bearer ${PINATA_JWT}`,
        },
      }
    );
    // Returns the full IPFS URL
    return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
  } catch (error) {
    console.error("Error uploading to IPFS: ", error);
    return null;
  }
};