import axios from "axios";
import { post } from "./index";

const getUserIdentity = async (token) => {
  try {
    const params = new URLSearchParams();
    params.append("token", token);

    return await axios.post("/users.identity", params);
  } catch (error) {
    throw error;
  }
};

const updateUserStatus = async (data) => {
  try {
    return await post("/users.profile.set", data);
  } catch (error) {
    throw error;
  }
};

const getUserInfo = async (userId, data) => {
  try {
    return await post(`/users.info?user=${userId}`, data);
  } catch (error) {
    throw error;
  }
};

export { getUserIdentity, updateUserStatus, getUserInfo };
