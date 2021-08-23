import { get, post } from './index';

const getUserIdentity = async (data) => {
  try {
    return await get('/users.identity', data);
  } catch (error) {
    throw error;
  }
};

const updateUserStatus = async (data) => {
  try {
    return await post('/users.profile.set', data);
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
