import { requests } from './index';
const PREFIX = 'api-marketing/';
import config from '@/config';
export const url = config.api + PREFIX;

//计费中心--获取账号余额, 今日消费
export const rechargeCenter = params => requests(PREFIX + 'recharge-center', params);

//计费中心--消费记录查询列表 (默认一个月的时间)
export const consumeRecord = params => requests(PREFIX + 'consume-record', params);

//计费中心--充值记录分页列表
export const rechargeRecord = params => requests(PREFIX + 'recharge-record', params);

//计费中心--短信营销消费详情--营销图表
export const messageMarketingChart = params => requests(PREFIX + 'message-marketing-chart', params);

//计费中心--短信营销消费详情--列表
export const messageMarketingPage = params => requests(PREFIX + 'message-marketing-page', params);

//计费中心--短信验证码消费详情
export const smsData = params => requests(PREFIX + 'sms-data', params);

//计费中心--语音验证码消费详情
export const voiceData = params => requests(PREFIX + 'voice-data', params);

//计费中心--双向呼叫消费详情
export const callData = params => requests(PREFIX + 'call-data', params);

//计费中心--通话录音消费详情
export const recordData = params => requests(PREFIX + 'call-record-data', params);

//计费中心--点击充值后--第一步:获取余额, 各项服务单价
export const rechargeStep0 = params => requests(PREFIX + 'recharge-step-1', params);

//计费中心--点击充值后--第二步:获取二维码,支付金额信息
export const rechargeStep1 = params => requests(PREFIX + 'recharge-step-2', params);

//计费中心--点击充值后--第二步后进行定时刷新(判断是否充值成功)
export const rechargeStep2 = params => requests(PREFIX + 'recharge-step-3', params);

//获取账户状态 是否欠费
export const getAccountStateInfo = params => requests(PREFIX + 'account-state-info', params);
