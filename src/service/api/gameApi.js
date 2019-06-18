import { requests } from './index';
const PREFIX = 'api-marketing/';
import config from '@/config';
//游戏营销--拼图游戏分页列表
export const LoadPtyxList = params => requests(PREFIX + 'page-puzzle-game', params);

//游戏营销--拼图游戏--中奖记录--(排行榜/参与记录)
export const LoadPtyxRecordList = params => requests(PREFIX + 'load-game-puzzle-report-data', params);

//游戏营销--拼图游戏--中奖记录--排行榜-下载Excel
export const exportPtyxExcel = config.api + PREFIX + 'export-puzzle-game-rank-excel';

//游戏营销--拼图游戏--游戏详情/编辑回显
export const ptyxDetail = params => requests(PREFIX + 'puzzle-game-edit', params);

//游戏营销--拼图游戏--新建/修改/详情--保存游戏
export const savePtyx = params => requests(PREFIX + 'save-update-puzzle-game', params);

//游戏营销--拼图游戏--拼图配置--回显拼图配置信息
export const ptyxConfigDetail = params => requests(PREFIX + 'puzzle-game-setting-edit', params);

//游戏营销--拼图游戏--拼图配置--保存拼图配置信息
export const ptyxConfigSave = params => requests(PREFIX + 'save-puzzle-game-setting', params);

//游戏营销--拼图游戏--中奖记录--(参与人数.参与次数.新增关注人数)
export const ptyxCalcTitle = params => requests(PREFIX + 'load-game-puzzle-calculate-title', params);

//删除拼图游戏-找你马-口令福利
export const deleteGame = params => requests(PREFIX + 'delete-game-activity', params);

//游戏营销--找你马游戏分页列表
export const LoadZnmList = params => requests(PREFIX + 'page-znm-game', params);

//游戏营销--找你马--编辑--获取游戏详情
export const znmDetail = params => requests(PREFIX + 'game-activity-znm-edit', params);

//游戏营销--找你马--游戏详情(获取首次特殊策略)
export const znmStrategyList = params => requests(PREFIX + 'load-game-znm-strategy-list', params);

//游戏营销--找你马--编辑--游戏详情(点击首次/后续奖项设置,首次特殊策略 查询卡券列表)
export const znmCardInfo = params => requests(PREFIX + 'load-cardinfo-for-game', params);

//游戏营销--找你马--获取游戏详情(点击首次特殊策略--编辑)
export const znmStrategy = params => requests(PREFIX + 'load-game-znm-strategy', params);

//游戏营销--找你马--获取游戏详情(首次特殊策略--保存中奖策略信息)
export const znmStrategySave = params => requests(PREFIX + 'save-game-znm-strategy', params);

//游戏营销--找你马--获取游戏详情(点击首次特殊策略--排序)
export const znmStrategySort = params => requests(PREFIX + 'sort-game-strategy', params);

//游戏营销--找你马--获取游戏详情(点击首次特殊策略--删除)
export const znmStrategyDel = params => requests(PREFIX + 'delete-game-strategy', params);

//游戏营销--找你马--新增/修改--保存找你马游戏信息
export const znmSave = params => requests(PREFIX + 'save-update-znm-game', params);

//游戏营销--找你马--数据统计
export const znmReportList = params => requests(PREFIX + 'load-game-znm-report-info', params);

//游戏营销--找你马--导出排行榜Excel
export const znmRankExcel = config.api + PREFIX + 'export-znm-rank-list-excel';

//游戏营销--找你马--导出参与记录Excel
export const znmRecordExcel = config.api + PREFIX + 'export-znm-attend-record-excel';

//游戏营销--找你马游戏分页列表
export const LoadKlflList = params => requests(PREFIX + 'page-klfl-game', params);

//游戏营销--口令福利--生成游戏二维码
export const createQrCode = params => requests(PREFIX + 'create-klfl-games-qrcode', params);

//游戏营销--口令福利--生成游戏二维码
export const downloadQrCode = config.api + PREFIX + 'download-klfl-game-qrcode';

//游戏营销--口令福利--中奖记录--导出数据
export const klflRecordExcel = config.api + PREFIX + 'export-game-klfl-win-record-excel';

//游戏营销--口令福利--中奖记录
export const klflReportList = params => requests(PREFIX + 'load-game-klfl-win-record', params);

//游戏营销--口令福利--新建/编辑游戏回显
export const klflDetail = params => requests(PREFIX + 'get-game-klfl-edit', params);

//游戏营销--口令福利--新建/编辑游戏回显(2)(加载[首奖特殊策略]集合)
export const klflStrategyList = params => requests(PREFIX + 'load-game-klfl-strategy-list', params);

//游戏营销--口令福利--新建/编辑游戏回显(3)(加载[奖项设置]集合)
export const klflPrizeList = params => requests(PREFIX + 'load-klfl-game-prize-list', params);

//游戏营销--口令福利--新建/编辑游戏回显([首奖特殊策略] 新增策略/ 编辑策略)
export const klflStrategy = params => requests(PREFIX + 'get-game-klfl-strategy', params);

//游戏营销--口令福利--新建/编辑游戏回显([首奖特殊策略] 新增/编辑 保存)
export const klflStrategySave = params => requests(PREFIX + 'save-update-game-klfl-strategy', params);

//游戏营销--口令福利--新建/编辑游戏--保存游戏信息
export const klflSave = params => requests(PREFIX + 'save-update-game-klfl', params);

//游戏营销--口令福利--新建/编辑游戏回显(多口令 -- 下载导入模板示例.csv)
export const klflDownTemp = config.api + PREFIX + 'download-game-klfl-code-template';

//游戏营销--口令福利--新建/编辑游戏回显(多口令 -- 上传解析口令文件)
export const klflImportCode = params => requests(PREFIX + 'import-game-klfl-code', params);

//游戏营销--口令福利--新建/编辑游戏回显(奖项设置--加载口令列表)
export const klflCodeList = params => requests(PREFIX + 'load-game-klfl-code-list', params);

//游戏营销--口令福利--新建/修改游戏--首奖特殊策略/奖项 -- 更改数量
export const updatePrizeStock = params => requests(PREFIX + 'update-prize-stock', params);

//游戏营销--找你马--获取游戏详情(点击首次特殊策略--排序)
export const klflStrategySort = params => requests(PREFIX + 'sort-game-strategy', params);

//游戏营销--找你马--获取游戏详情(点击首次特殊策略--删除)
export const klflStrategyDel = params => requests(PREFIX + 'delete-game-strategy', params);

//游戏营销--抽奖游戏分页列表--(大转盘. 刮刮卡)
export const loadLotteryList = params => requests(PREFIX + 'page-lottery-game', params);

//游戏营销--大转盘. 刮刮卡--中奖记录
export const loadLotteryRecordList = params => requests(PREFIX + 'load-lottery-game-record-list', params);

//游戏营销--大转盘. 刮刮卡--导出中奖记录EXCEL
export const exportLotteryExcel = config.api + PREFIX + 'export-lottery-win-record-excel';

//游戏营销--大转盘. 刮刮卡--删除游戏
export const delLotteryService = params => requests(PREFIX + 'delete-lottery-game', params);

//游戏营销--大转盘. 刮刮卡--新建/修改/获取游戏详情
export const detailLottery = params => requests(PREFIX + 'get-lottery-game-detail', params);

//游戏营销--新建/修改 保存游戏信息(大转盘. 刮刮卡)
export const saveLottery = params => requests(PREFIX + 'save-update-lottery-game', params);

//游戏营销--口令福利--新建/修改游戏--首奖特殊策略--保存礼品
export const saveGift = params => requests(PREFIX + 'save-game-gift', params);

//游戏营销--获取系统预设的游戏音乐
export const getGameSystemMusic = params => requests(PREFIX + 'get-game-system-music', params);

//游戏营销--拼图游戏下载模板
export const downloadPtyxSkinPsd = config.api + PREFIX + 'download-tempskin-psd?requestProject=marketing';

// 游戏营销--大转盘/刮刮卡下载psd
export const downloadWheelSkinPsd = config.api + PREFIX + 'download_wheel_skin_psd?requestProject=marketing';
