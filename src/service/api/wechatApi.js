import { requests } from './index';
const PREFIX = 'api-marketing/';
//发送记录
export const sendRecordList = params => requests(PREFIX + 'page-send-record', params);

//发送记录--新建保存群发
export const sendRecordSaveService = params => requests(PREFIX + 'save-update-wechat-marketing-record', params);

//获取营销场景
export const sceneSettingList = params => requests(PREFIX + 'scene-setting-list', params);

//查看数据
export const getWechatCardData = params => requests(PREFIX + 'get-wechat-card-data', params);

//发送记录操作: 删除
export const delWechatMarketingRecord = params => requests(PREFIX + 'del-wechat-marketing-record', params);

//发送记录操作: 失效
export const invalidWechatMarketingRecord = params => requests(PREFIX + 'invalid-wechat-marketing-record', params);

//素材库 图文 图文分页列表
export const loadImgTextList = params => requests(PREFIX + 'page-marketing-wechat-image-text', params);

//素材库 图文 删除图文素材信息
export const deleteImageText = params => requests(PREFIX + 'delete-image-text', params);

//素材库--图文--获取图文素材的同步信息 (同步状态, 微信侧图文总条数)
export const getSyncInfo = params => requests(PREFIX + 'get-sync-info', params);

//素材库--图文--同步微信侧 图文素材数据
export const syncWechatImageText = params => requests(PREFIX + 'sync-wechatImage-text', params);

//素材库--图片--图片分页列表
export const loadImgList = params => requests(PREFIX + 'page-marketing-wechat-image', params);

//素材库--图片--编辑图片名称
export const updateImgName = params => requests(PREFIX + 'update-marketing-wechat-image-titlename', params);

//素材库--图片--修改图片分组
export const updateGroupName = params => requests(PREFIX + 'update-marketing-wechat-image-group', params);

//素材库--图片--新建图片分组
export const addGroupService = params => requests(PREFIX + 'save-marketing-wechat-image-group', params);

//素材库--图片--删除图片分组
export const deleteGroupService = params => requests(PREFIX + 'delete-marketing-wechat-image-group', params);

//素材库--图片--批量删除图片
export const deleteImageService = params => requests(PREFIX + 'delete-batch-marketing-wechat-image', params);

//素材库--图片--移动分组
export const changeGroupService = params => requests(PREFIX + 'marketing-wechat-image-changeGroup', params);

//素材库--语音--语音分页列表
export const loadAudioList = params => requests(PREFIX + 'page-marketing-wechat-audio', params);

//素材库--语音--删除语音信息
export const delAudioService = params => requests(PREFIX + 'delete-marketing-wechat-audio', params);

//素材库--语音--新增/修改语音的弹窗回显信息
export const editAudioDetailService = params => requests(PREFIX + 'marketing-wechat-audio-edit', params);

//素材库--语音--新建语音--上传语音
export const uploadAudioService = params => requests(PREFIX + 'upload-marketing-audiosave', params);

//素材库--语音--新建/编辑 保存语音信息
export const saveAudioService = params => requests(PREFIX + 'save-update-marketing-wechat-audio', params);

//素材库--视频--视频分页列表
export const loadVideoList = params => requests(PREFIX + 'page-marketing-wechat-video', params);

//素材库--视频--删除视频信息
export const delVideoService = params => requests(PREFIX + 'delete-marketing-wechat-video', params);

//素材库--视频--新增/修改视频的弹窗回显信息
export const editVideoDetailService = params => requests(PREFIX + 'marketing-wechat-video-edit', params);

//素材库--视频--新建语音--上传视频
export const uploadVideoService = params => requests(PREFIX + 'upload-marketing-videosave', params);

//素材库--视频--新建/编辑 保存视频信息
export const saveVideoService = params => requests(PREFIX + 'save-update-marketing-wechat-video', params);

//素材库--图文--编辑图文信息 -- 回显图文信息
export const wechatImageTextEdit = params => requests(PREFIX + 'wechat-image-text-edit', params);

//素材库--图文--新增/更新 图文素材信息
export const saveUpdateWechatImageText = params => requests(PREFIX + 'save-update-wechat-image-text', params);

//素材库--图文--新增/更新 图文素材信息
export const getWechatMarketingDetail = params => requests(PREFIX + 'get-wechat-marketing-detail', params);

//获取公众号的appid
export const getMarketingUserInfo = params => requests(PREFIX + 'get-marketing-user-info', params);
