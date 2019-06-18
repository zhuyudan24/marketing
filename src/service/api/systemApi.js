import { requests } from './index';

const PREFIX = 'api-auth/';

//登录前获取企业id
export const loginEid = params => {
  // debugger
  return requests(PREFIX + 'list-login-enterprise', params);
};

//登录
export const login = params => requests(PREFIX + 'do-login', params);
