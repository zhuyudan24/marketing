import { requests } from './index';
const PREFIX = 'api-marketing/';

import config from '@/config';
export const url = config.api + PREFIX;

//智能营销--ECM营销引擎分页列表
export const loadEcmList = params => requests(PREFIX + 'page-ecm-list', params);

//智能营销--ECM营销引擎-- 删除
export const deleteEcm = params => requests(PREFIX + 'delete-ecm', params);

//智能营销--ECM营销引擎-- 新建/修改 回显智能引擎计划信息
export const getEcmInfo = params => requests(PREFIX + 'get-ecm-info', params);

// 智能营销--ECM营销引擎-- 新建/修改 [保存]计划信息
export const saveEcmInfo = params => requests(PREFIX + 'save-update-ecm', params);

// 智能营销--下线
export const offlineEcmPlan = params => requests(PREFIX + 'ecm-plan-offline', params);

// 智能营销--记录--批次记录页面
export const ecmBatchSendInfos = params => requests(PREFIX + 'ecm-batch-send-infos', params);

// 智能营销--记录--批次人员列表
export const ecmBatchSendDetails = params => requests(PREFIX + 'ecm-batch-send-details', params);

// 智能营销--实时发送记录类型
export const ecmCurrentSendInfos = params => requests(PREFIX + 'ecm-current-send-infos', params);

// 智能营销--实时发送人员列表
export const ecmCurrentSendDetails = params => requests(PREFIX + 'ecm-current-send-details', params);

// 智能营销--记录--批次人员列表 导出csv
export const exportBatchSendDetails = config.api + PREFIX + 'export-batch-send-details';

// 智能营销--实时人员列表--导出csv
export const exportCurrentSendDetails = config.api + PREFIX + 'export-current-send-details';
