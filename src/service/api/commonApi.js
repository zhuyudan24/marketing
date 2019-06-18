import { requests } from './index';
const MARKET_PREFIX = 'api-marketing/';
const PLUG_PREFIX = 'api-plug/';
const GOODS_PREFIX = 'api-admin/';

//获取营销场景
export const sceneSettingList = params => requests(MARKET_PREFIX + 'scene-setting-list', params);

//获取卡券列表
export const getCardList = params => requests(PLUG_PREFIX + 'get-coupon-list', params);

//所有门店分组
export const storeGroupList = params => requests(GOODS_PREFIX + 'store-group-list', params);
