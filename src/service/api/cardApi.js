import { requests } from './index';
const PREFIX = 'api-marketing/';
import config from '@/config';
export const url = config.api + PREFIX;

//卡券营销--卡券库--卡券分页列表
export const cardPageList = params => requests(PREFIX + 'card-page', params);

//卡券营销--卡券库--卡券分页列表
export const updateCardStock = params => requests(PREFIX + 'update-card-stock', params);

//卡券营销--卡券库--删除卡券
export const deleteCard = params => requests(PREFIX + 'delete-card', params);

//卡券营销--卡券库--卡券报表--渠道分析
export const cardChannelAnalysis = params => requests(PREFIX + 'card-channel-analysis', params);

//卡券营销--卡券库--卡券报表/卡券展架--卡券报表趋势分析图
export const cardTrendEchart = params => requests(PREFIX + 'card-trend-echart', params);

//卡券营销--卡券库--新建/修改卡券--微盟商品适用类目
export const getCategoryList = params => requests(PREFIX + 'get-category-list', params);

//卡券营销--卡券库--新建/修改卡券--商品参数
export const getPropertyList = params => requests(PREFIX + 'get-property-list', params);

//卡券营销--卡券库--新建/修改卡券--商品参数值
export const getPropertyValueList = params => requests(PREFIX + 'get-property-value-list', params);

//卡券营销--卡券库--新建/修改卡券--放入卡券展架--所有展架集合
export const cardGetShelfs = params => requests(PREFIX + 'card-get-shelfs', params);

//卡券营销--卡券库--新建/编辑卡券/卡券记录-领取记录-点击卡券查看详情
export const getCardDetail = params => requests(PREFIX + 'get-card-detail', params);

//卡券营销--卡券库--保存卡券
export const saveUpdateCard = params => requests(PREFIX + 'save-update-card', params);

//卡券营销--卡券记录--投放记录/领取记录
export const cardRecordPage = params => requests(PREFIX + 'card-record-page', params);

//卡券营销--卡券记录--投放记录/领取记录 - 投放记录
export const cardPutOnRecord = params => requests(PREFIX + 'card-put-on-record', params);

//卡券营销--卡券记录--投放记录/领取记录 - 投放记录 - 导出
export const exportCardPutOnRecordExcel = config.api + PREFIX + 'export-card-put-on-record-excel';

//卡券营销--卡券记录--投放记录--删除记录
export const deleteCardPuton = params => requests(PREFIX + 'delete-card-puton', params);

//卡券营销--卡券记录--领取记录--核销--(1)获取满足核销条件的订单
export const listCoupcardOrder = params => requests(PREFIX + 'list-coupcard-order', params);

//卡券营销--卡券记录--领取记录--核销(2)(必须选择订单才能核销)
export const writeOffCard = params => requests(PREFIX + 'write-off-card', params);

//卡券营销--卡券记录--领取记录--销毁
export const coupcardDestroy = params => requests(PREFIX + 'coupcard-destroy', params);

//卡券营销--卡券展架--分页列表信息
export const pageCardShelfs = params => requests(PREFIX + 'page-card-shelfs', params);

//卡券营销--核销纠错--分页列表信息
export const coupcardCheckList = params => requests(PREFIX + 'coupcard-check-list', params);

//游戏营销--大转盘. 刮刮卡--导出中奖记录EXCEL
export const exportCoupcardCheckExcel = config.api + PREFIX + 'export-coupcard-check-excel';

//卡券营销--卡券记录--领取记录--导出订单
export const exportReceivedRecordExcel = config.api + PREFIX + 'export-received-record-excel';

//卡券营销--卡券展架--删除展架下的卡券
export const deleteShelfCard = params => requests(PREFIX + 'delete-shelf-card', params);

//卡券营销--卡券展架--展架添加卡券
export const saveShelfCard = params => requests(PREFIX + 'save-shelf-card', params);

//卡券营销--卡券库--投放--点击保存按钮(1)--校验保存筛选的会员
export const checkPutonMemberIds = params => requests(PREFIX + 'check-puton-memberIds', params);

//卡券营销--卡券库--投放--点击保存按钮(2)--新增/修改投放
export const saveUpdatePutonCard = params => requests(PREFIX + 'save-update-puton-card', params);

//卡券营销--卡券记录--投放记录--编辑/投放记录详情
export const getCardPutonDetail = params => requests(PREFIX + 'get-card-puton-detail', params);

// 商品查询
export const loadGoodsData = params => requests(PREFIX + 'load-goods-data', params);

// 卡券营销--复制卡券
export const copyCardDetailService = params => requests(PREFIX + 'copy-card-detail', params);

// 分页查询临时卡券记录
export const templateReceiveCardPage = params => requests(PREFIX + 'template-receive-card-page', params);

// 导出临时卡券记录
export const exportTemplateReceivedExcel = config.api + PREFIX + 'export-template-receive-excel';
