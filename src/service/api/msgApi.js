import { requests } from './index';
const PREFIX = 'api-marketing/';
import config from '@/config';
export const url = config.api + PREFIX;

//模板消息--获取模板消息
export const syncWechatMessageTemplate = params => requests(PREFIX + 'sync-wechat-message-template', params);

//模板消息--获取模板消息分页列表
export const pageTemplateMessage = params => requests(PREFIX + 'page-template-message', params);

//模板消息--获取模板消息分页列表
export const getLatestSyncTime = params => requests(PREFIX + 'get-latest-sync-time', params);

//模板消息--获取模板消息分页列表
export const deleteTemplateAdvice = params => requests(PREFIX + 'delete-template-advice', params);

//模板消息--编辑获取模板消息详情
export const getTempDetail = params => requests(PREFIX + 'get-temp-detail', params);

//模板消息--编辑--获取模板变量集合
export const listTemplateVariables = params => requests(PREFIX + 'list-template-variables', params);

//模板消息--编辑--获取模板变量集合
export const updateTempAdvice = params => requests(PREFIX + 'update-temp-advice', params);
