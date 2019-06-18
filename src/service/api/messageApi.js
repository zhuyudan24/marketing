import { requests } from './index';
const PREFIX = 'api-marketing/';
import config from '@/config';
//短信群发列表
export const LoadMessageList = params => requests(PREFIX + 'page-marketing-message', params);

//查看详情
export const LoadMessageDetail = params => requests(PREFIX + 'get-market-message-detail', params);

//短信群发--查看详情--发送记录
export const LoadMessageDetailList = params => requests(PREFIX + 'market-message-detail-send-list', params);

//模板库--分页列表
export const LoadLibList = params => requests(PREFIX + 'page-message-template', params);

//模板库--分页列表 （有效）
export const LoadTempList = params => requests(PREFIX + 'load-message-templateList', params);

//模板库--新建或保存
export const saveTempService = params => requests(PREFIX + 'save-update-message-template', params);

//模板库--修改--回显短信模板信息
export const LoadTempInfo = params => requests(PREFIX + 'get-message-templateInfo', params);

//短信群发--失效
export const invalidsmsRecord = params => requests(PREFIX + 'stop-message-TimedTask', params);

//模板库--删除短信模板信息
export const delTempService = params => requests(PREFIX + 'delete-message-template', params);

//短信群发--查看详情--下载发送记录Excel
export const exportSmsExcel = config.api + PREFIX + 'export-sms-sendlog-excel';

//短信群发--保存群发
export const saveSendSmsService = params => requests(PREFIX + 'save-marketing-message', params);

//短信群发, 微信群发前查看筛选人数
export const checkMessageSendCount = params => requests(PREFIX + 'check-message-send-count', params);
