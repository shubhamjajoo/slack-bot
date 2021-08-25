import axios from "axios";

const getTeamDetails = async (token) => {
  try {
    const params = new URLSearchParams();
    params.append("token", token);

    return await axios.post(`/users.list`, params);
  } catch (error) {
    throw error;
  }
};

export default getTeamDetails;
