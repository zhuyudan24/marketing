import { requests } from './index';
const PREFIX = 'api-marketing/';
import config from '@/config';
export const url = config.api + PREFIX;

//服务监制--评价管理--最新评价列表
export const latestEvaluationList = params => requests(PREFIX + 'latest-evaluation-list', params);

//服务监制--评价管理--列表显示/隐藏服务号
export const changeShowStatus = params => requests(PREFIX + 'change-show-status', params);

//服务监制--评价管理--列表 立即回复
export const evaluationReply = params => requests(PREFIX + 'evaluation-reply', params);

//服务监制--评价管理--列表 先判断门店是否存在
export const evaluationStoreExists = params => requests(PREFIX + 'evaluation-store-exists', params);

//服务监制--评价管理--列表 分配/不分配
export const allocateEvaluation = params => requests(PREFIX + 'allocate-evaluation', params);

//服务监制--评价管理--列表--下载Excel
export const exportLatestEvaluate = config.api + PREFIX + 'export-latest-evaluate';
//服务监制--评价管理--评价概览(评价趋势, 各项评分概况, 正面/负面快评使用统计)
export const evaluateOverviewEchart = params => requests(PREFIX + 'evaluate-overview-echart', params);

//服务监制--评价管理--评价趋势--趋势详情
export const storeEvaluateDetail = params => requests(PREFIX + 'store-evaluate_detail', params);

//服务监制--评价管理--各项评分概况--评分详情
export const storeScoreDetail = params => requests(PREFIX + 'store-score-detail', params);

//服务监制--评价管理--负面快评使用统计--差评展示
export const evaluateBad = params => requests(PREFIX + 'evaluate-bad', params);

//投诉与建议-分页列表信息
export const pageSuggestionsList = params => requests(PREFIX + 'page-suggestions-list', params);

//投诉与建议-分页列表信息--操作:立即处理/已解决--详情
export const getSuggestionsDetail = params => requests(PREFIX + 'get-suggestions-detail', params);

//投诉与建议-分页列表信息--立即处理--保存
export const handleSuggestions = params => requests(PREFIX + 'handle-suggestions', params);

//投诉与建议-分页列表信息-导出csv
export const exportProblemsCsv = config.api + PREFIX + 'export-problems-csv';
