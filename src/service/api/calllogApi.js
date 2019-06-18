import { requests } from './index';
const PREFIX = 'api-marketing/';

//智能营销--通话记录
export const callLogList = params => requests(PREFIX + 'call-log', params);
export const saveCallSetting = params => requests(PREFIX + 'save-call-setting', params); // 录音设置保存
export const getCallSetting = params => requests(PREFIX + 'get-call-setting', params); // 录音配置
