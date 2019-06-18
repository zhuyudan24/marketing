<template>
  <transition name="fade">
    <section class="preview-mask" @click="hideMask" v-show="show">
      <div class="wx_phone_preview" @click.stop="voidClick">
        <div class="wx_phone wx_phone_imgtext" v-show="contentHide">
          <div class="wx_phone_hd">图文预览</div>
          <div class="wx_phone_bd wx_phone_preview_card_wrp">
            <div class="msg_card wx_phone_preview_multi_card has_first_cover" id="wechat-item-preview-container">
              <div class="msg_card_inner msg_card_inner_single wechat-item-previe-div" data-index="0" style="display: block;" @click="preview(true)">
                <div class="card_cover_appmsg_title" style="margin: 6px;">
                  <p style="margin-bottom: 6px;" id="main-item-title">{{ firstImgText.titleName }}</p>
                  <p style="margin-bottom: 12px;color: #8c8c8c;font-size: 13px;">{{ formatDateTimeByType(firstImgText.updateTime, 'yyyy-MM-dd') }}</p>
                </div>
                <div class="card_appmsg_item">
                  <img style="width: 243px;height: 120px;" id="main-item-img" :src="firstImgText.qcloudImageUrl || ''" />
                </div>
                <div class="card_appmsg_item" v-if="imgTextList.length < 1">
                  <div class="card_appmsg_content" style="padding-bottom: 8px;font-size: 10px;" id="main-item-remark">{{ firstImgText.remark }}</div>
                  <div class="card_appmsg_original" style="border-top: 1px solid #DDDDDD;padding: 8px 0;position: relative;overflow: hidden;">
                    <p style="display: inline-block;float: left;">阅读原文</p>
                    <p class="card_appmsg_original_more"></p>
                  </div>
                </div>
              </div>
              <div @click="preview(false, v)" v-for="(v, i) in imgTextList" :key="i" class="card_appmsg_item card_appmsg_item_other wechat-item-previe-div" data-index="1">
                <img class="card_appmsg_thumb" :src="v.qcloudImageUrl" />
                <p class="card_appmsg_content ellipsis-l2">{{ v.titleName }}</p>
              </div>
            </div>
          </div>
        </div>
        <!--wx_phone图文消息 end-->
        <div class="wx_phone wx_phone_content" v-show="!contentHide">
          <div class="wx_phone_hd wx_phone_content_title">
            <div class="wx_phone_content_back fl" @click="contentHide = true">返回</div>
            <div class="wx_phone_content_center">{{ activeImgText.titleName }}</div>
          </div>
          <div class="wx_phone_bd">
            <div class="wx_phone_preview_appmsg appmsg_wap">
              <div class="rich_media">
                <div class="rich_media_area_primary">
                  <p class="rich_media_title"></p>
                  <div class="rich_media_meta_list">
                    <em class="rich_media_meta rich_media_meta_text">{{ formatDateTimeByType(activeImgText.updateTime, 'yyyy-MM-dd') }}</em> <em class="rich_media_meta rich_media_meta_text"></em> <span class="rich_media_meta rich_media_meta_link" id="content-authoer">{{ activeImgText.authorName }}</span>
                  </div>
                  <div class="rich_media_content" ref="richMediaContent" v-html="activeImgText.previewContent"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </transition>
</template>

<script>
import { formatDateTimeByType } from '@/utils/index.js';

export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    firstImgText: Object,
    imgTextList: Array
  },
  data() {
    return {
      formatDateTimeByType,
      activeImgText: {},
      contentHide: true
    };
  },
  methods: {
    preview(flag, item) {
      if (flag) {
        this.activeImgText = this.firstImgText;
      } else {
        this.activeImgText = item;
      }
      this.contentHide = false;
      this.activeImgText.previewContent = '';
      console.log(this.activeImgText);

      if (this.activeImgText.imageType) {
        this.activeImgText.previewContent = `<img src="${this.activeImgText.qcloudImageUrl}">` + this.activeImgText.content;
      } else {
        this.activeImgText.previewContent = this.activeImgText.content;
      }
    },
    voidClick() {
      //
    },
    hideMask() {
      this.$emit('update:show', false);
    }
  }
};
</script>
<style lang="scss" scoped>
.fade-enter-active,
.fade-leave-acitve {
  transition: opacity 0.5;
}
.fade-enter,
.fade-leave-to {
  opacity: 0;
}

.preview-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2000;
  background-color: rgba(0, 0, 0, 0.5);
}

.wx_phone_preview {
  position: fixed;
  top: 50%;
  left: 50%;
  margin-top: -365px;
  margin-left: -180px;
  z-index: 9997;
  width: 360px;
  height: 680px;
  background: url(../../assets/img/wx_phone_preview_z2ac3d8.png) 0 0 no-repeat;
}
.btn_default {
  background-color: #fff;
  background-image: -moz-linear-gradient(top, #fff 0, #fff 100%);
  background-image: -webkit-gradient(linear, 0 0, 0 100%, from(#fff), to(#fff));
  background-image: -webkit-linear-gradient(top, #fff 0, #fff 100%);
  background-image: -o-linear-gradient(top, #fff 0, #fff 100%);
  background-image: linear-gradient(to bottom, #fff 0, #fff 100%);
  border-color: #e7e7eb;
  color: #222;
  line-height: 32px;
}
.btn_phone_preview_closed {
  position: absolute;
  left: -138px;
  bottom: 90px;
}
.btn_phone_preview_closed,
.btn_wx_phone_preview {
  padding: 0;
  min-width: 120px;
}
.wx_phone {
  padding: 84px 56px 0 17px;
}
.wx_phone_hd {
  text-align: center;
  color: #fff;
  line-height: 38px;
  height: 38px;
  width: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
  padding: 0 20px;
}
.wx_phone_bd {
  position: relative;
  overflow: auto;
  background-color: #fff;
  height: 470px;
}
.wx_phone_preview_card_wrp {
  background-color: #f2f2f2;
}
.wx_phone_preview_multi_card {
  padding: 15px;
  cursor: pointer;
}
.msg_card_inner {
  overflow: hidden;
  border: 1px solid #e7e7eb;
}
.msg_card_inner {
  border-radius: 3px;
  -moz-border-radius: 3px;
  -webkit-border-radius: 3px;
}
.msg_card_inner {
  background-color: #fff;
}
.wx_phone_preview_multi_card .card_cover_appmsg_item {
  margin: 6px;
  position: relative;
}
.wx_phone_preview_multi_card .card_cover_appmsg_inner {
  position: relative;
  height: 140px;
  overflow: hidden;
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
}
.wx_phone_preview_multi_card .card_cover_title {
  font-weight: 400;
}
.wx_phone_preview_multi_card.has_first_cover .card_cover_title {
  position: absolute;
  max-height: 42px;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.5) !important;
  filter: progid:DXImageTransform.Microsoft.gradient(GradientType=0,startColorstr='#80000000',endcolorstr = '#80000000');
  color: #fff;
  padding: 5px 6px;
}
.wx_phone_preview_multi_card .card_appmsg_item {
  overflow: hidden;
  padding: 6px;
  /*border-top: 1px solid #e7e7eb;*/
}
.card_appmsg_original_more {
  display: inline-block;
  float: right;
  -webkit-transform: rotate(45deg);
  transform: rotate(45deg);
  border-right: 2px solid #dddddd;
  border-top: 2px solid #dddddd;
  width: 10px;
  height: 10px;
  background-color: #fff;
  margin-top: 5px;
  margin-right: 5px;
}
.rich_media_content strong {
  font-weight: bolder;
}
.rich_media_content em {
  font-style: italic;
}
.rich_media_content /deep/ img {
  max-width: 100%;
}
.wx_phone_preview_multi_card .card_appmsg_thumb {
  float: right;
  margin-left: 10px;
  width: 45px;
  height: 45px;
}
.wx_phone_preview_multi_card .card_appmsg_content {
  overflow: hidden;
}
.wx_phone_preview_multi_card .card_appmsg_item {
  overflow: hidden;
  padding: 6px;
  // border-top: 1px solid #e7e7eb;
}
.wx_phone_preview_multi_card .card_appmsg_content {
  overflow: hidden;
}
.wx_view_list {
  line-height: 40px;
  border-radius: 5px;
  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  text-align: center;
  overflow: hidden;
  position: absolute;
  right: 105%;
  top: 90px;
  width: 150px;
}
.wx_view_item {
  background-color: #f0eff4;
  border-bottom: 1px solid #dfdfe4;
  white-space: nowrap;
  cursor: pointer;
  min-width: 120px;
}
.wx_view_item.selected {
  background-color: #47b54a;
  color: #fff;
  border-bottom-color: #5bab5e;
}
.btn_wx_phone_preview_wrp {
  position: absolute;
  bottom: 130px;
  text-align: center;
  left: -138px;
}
.btn_phone_preview_closed,
.btn_wx_phone_preview {
  padding: 0;
  min-width: 120px;
}
.wx_phone_preview_appmsg {
  padding: 15px 10px;
}
.appmsg_wap * {
  margin: 0;
  padding: 0;
}
.appmsg_wap h1,
.appmsg_wap h2,
.appmsg_wap h3,
.appmsg_wap h4,
.appmsg_wap h5,
.appmsg_wap h6 {
  font-weight: 400;
  font-size: 16px;
}
.appmsg_wap .rich_media_title {
  margin-bottom: 12px;
  line-height: 1.4;
  font-weight: 400;
  font-size: 16px;
  word-wrap: break-word;
}
.appmsg_wap .rich_media_meta_list {
  margin-bottom: 18px;
  line-height: 20px;
  font-size: 0;
}
.appmsg_wap .rich_media_meta {
  display: inline-block;
  vertical-align: middle;
  margin-right: 8px;
  margin-bottom: 10px;
  font-size: 14px;
}
.appmsg_wap .rich_media_meta_text {
  color: #8c8c8c;
  font-weight: 400;
  font-style: normal;
}
.appmsg_wap .rich_media_meta_link {
  color: #607fa6;
  cursor: pointer;
}
.appmsg_wap .rich_media_content {
  word-wrap: break-word;
  word-break: break-all;
}
.appmsg_wap .rich_media_content {
  overflow: hidden;
  color: #3e3e3e;
}
.appmsg_wap .rich_media_content p {
  clear: both;
  min-height: 1em;
  white-space: pre-wrap;
}
.wx_phone_preview_moments {
  overflow: hidden;
  padding: 15px;
}
.wx_phone_preview_moments .moments_user_avatar {
  width: 28px;
  height: 28px;
  float: left;
  margin-right: 12px;
}
.wx_phone_preview_moments .moments_content_wrp {
  overflow: hidden;
}
.wx_phone_preview_moments .moments_nickname {
  font-size: 12px;
  padding-bottom: 5px;
}
.wx_phone_preview_moments .moments_content {
  overflow: hidden;
  background-color: #f0eff4;
  padding: 8px 10px;
  cursor: pointer;
}
.wx_phone_preview_moments .moments_appmsg_thumb {
  float: left;
  width: 30px;
  height: 30px;
  margin-right: 5px;
}
.wx_phone_preview_moments .moments_appmsg_title {
  width: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
}
.wx_phone_preview_chat_wrp {
  background-color: #f2f2f2;
}
.wx_phone_preview_chat {
  overflow: hidden;
  padding: 15px;
}
.wx_phone_preview_chat .chat_user_avatar {
  float: left;
  width: 28px;
  height: 28px;
}
.wx_phone_preview_chat .chat_content {
  overflow: hidden;
  padding-left: 12px;
  padding-right: 30px;
}
.wx_phone_preview_chat .chat_appmsg_msg {
  position: relative;
  background-color: #fff;
  padding: 8px 10px;
  border: 1px solid #e7e7eb;
  border-radius: 5px;
  -moz-border-radius: 5px;
  -webkit-border-radius: 5px;
  cursor: pointer;
}
.wx_phone_preview_chat .chat_appmsg_title {
  padding-bottom: 5px;
  width: auto;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  word-wrap: normal;
}
.wx_phone_preview_chat .chat_appmsg_content {
  overflow: hidden;
}
.wx_phone_preview_chat .chat_appmsg_thumb {
  float: left;
  width: 40px;
  height: 40px;
  margin-right: 5px;
}
.wx_phone_preview_chat .chat_appmsg_desc {
  font-size: 12px;
  color: #8d8d8d;
  margin-top: 3px;
  max-height: 3.2em;
  overflow: hidden;
}
.wx_phone_preview_chat .chat_arrow_wrp {
  position: absolute;
  left: -6px;
  top: 6px;
}
.wx_phone_preview_chat .chat_arrow {
  position: absolute;
  display: inline-block;
  width: 0;
  height: 0;
  border-width: 6px;
  border-style: dashed;
  border-color: transparent;
  border-left-width: 0;
  border-right-color: #e7e7eb;
  border-right-style: solid;
}
.wx_phone_preview_chat .arrow_in {
  left: 1px;
  border-right-color: #fff;
}

.card_appmsg_item_other {
  border: 1px solid #e7e7eb;
  border-top: none;
  background: #fff;
}
</style>
