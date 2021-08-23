import { get } from './index';

const getTeamDetails = async (data) => {
  try {
    return await get('/users.list', data);
  } catch (error) {
    throw error;
  }
};

export default getTeamDetails;
