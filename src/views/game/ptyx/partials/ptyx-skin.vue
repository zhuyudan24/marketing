<template>
  <div class="ptyx-skin">
    <div class="ptyx-skin__header">
      <span class="ptyx-skin__header--line"></span>
      <span class="ptyx-skin__header--title">
        <i class="iconfont icon-zhankai- fz13 regular-font-color"></i>
        <span class="regular-font-color">智能选项</span>
        <i class="iconfont icon-xinxixianshi regular-font-color fz13"></i>
      </span>
      <span class="ptyx-skin__header--line"></span>
    </div>
    <div class="ptyx-skin__content">
      <!-- 入口页面 -->
      <div class="ptyx-skin__entry ptyx-skin__item">
        <div class="ptyx-skin__entry__text ptyx-skin__item__text">
          <h4>进入游戏</h4>
          <p>页面背景图尺寸：750*1206px，大小不超过1MB</p>
          <p>游戏banner尺寸：750*300px，格式为png，大小不超过200KB</p>
          <p>进入游戏按钮尺寸：530*136px，格式为png，大小不超过50KB</p>
          <p>排行榜按钮尺寸：260*98px，格式为png，大小不超过50KB</p>
          <p>查看奖品按钮尺寸：260*98px，格式为png，大小不超过50KB</p>
        </div>
        <div class="ptyx-skin__entry__main ptyx-skin__main">
          <div class="ptyx-skin__item--top"></div>
          <div class="ptyx-skin__item--body">
            <template v-for="(v, i) in skin.entry">
              <skin-upload :key="i" :obj.sync="v" levelOne="entry" :levelTwo="i" @skinUpload="skinUpload" @skinReset="skinReset"></skin-upload>
            </template>
            <p class="rule" :class="skinType === 2 ? 'orange' : 'white'">活动规则>></p>
          </div>
        </div>
      </div>
      <!-- 主页面 -->
      <div class="ptyx-skin__main ptyx-skin__item">
        <div class="ptyx-skin__main__text ptyx-skin__item__text">
          <h4>游戏页面</h4>
          <p>页面背景图尺寸：750*1206px，大小不超过1MB</p>
          <p>拼图游戏背景图尺寸：580*900px，格式为png，大小不超过200KB</p>
          <p>开始游戏按钮尺寸：530*136px，格式为png，大小不超过50KB</p>
          <p>分享得体力按钮尺寸：260*98px，格式为png，大小不超过50KB</p>
        </div>
        <div class="ptyx-skin__main__main ptyx-skin__main">
          <div class="ptyx-skin__item--top"></div>
          <div class="ptyx-skin__item--body">
            <template v-for="(v, i) in skin.main">
              <skin-upload :key="i" :obj.sync="v" levelOne="main" :levelTwo="i" @skinUpload="skinUpload" @skinReset="skinReset"></skin-upload>
            </template>
            <div class="ptyx-skin__main--poppver">
              <el-popover placement="bottom" width="246" trigger="hover">
                <div>
                  <skin-upload :obj.sync="skin.main.startBtn" levelOne="main" levelTwo="startBtn" @skinUpload="skinUpload" @skinReset="skinReset"></skin-upload>
                  <skin-upload :obj.sync="skin.main.tipBtn" levelOne="main" levelTwo="tipBtn" @skinUpload="skinUpload" @skinReset="skinReset"></skin-upload>
                  <skin-upload :obj.sync="skin.main.continueBtn" levelOne="main" levelTwo="continueBtn" @skinUpload="skinUpload" @skinReset="skinReset"></skin-upload>
                </div>
                <img :src="skin.main.startBtn.imgUrl" slot="reference" />
              </el-popover>
            </div>
          </div>
        </div>
      </div>
      <!-- 分享页面 -->
      <div class="ptyx-skin__share ptyx-skin__item">
        <div class="ptyx-skin__share__text ptyx-skin__item__text">
          <h4>分享页面</h4>
          <p>页面背景图尺寸：750*1206px，大小不超过1MB</p>
          <p>游戏banner尺寸：750*750px，格式为png，大小不超过200KB</p>
          <p>赠送体力按钮尺寸：530*136px，格式为png，大小不超过50KB</p>
        </div>
        <div class="ptyx-skin__share__main ptyx-skin__main">
          <div class="ptyx-skin__item--top"></div>
          <div class="ptyx-skin__item--body">
            <template v-for="(v, i) in skin.share">
              <skin-upload :key="i" :obj.sync="v" levelOne="share" :levelTwo="i" @skinUpload="skinUpload" @skinReset="skinReset"></skin-upload>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import skinObj from './skinImg.js';
import skinUploadCom from './skin-upload.vue';
export default {
  name: 'ptyx-skin',
  components: {
    'skin-upload': skinUploadCom
  },
  props: {
    accessGame: {
      type: Object,
      default() {
        return {};
      }
    },
    startGame: {
      type: Object,
      default() {
        return {};
      }
    },
    shareGame: {
      type: Object,
      default() {
        return {};
      }
    },
    skinType: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      skin: JSON.parse(JSON.stringify(skinObj.skin1))
    };
  },
  methods: {
    init() {
      this.changeDefaultSkin(this.skinType);
      let entry = this.skin.entry;
      let main = this.skin.main;
      let share = this.skin.share;

      // entry
      if (this.accessGame.backgroundImgFieldCode) {
        entry.bg.code = this.accessGame.backgroundImgFieldCode;
        entry.bg.imgUrl = this.accessGame.backgroundImgUrl;
      }
      if (this.accessGame.bannerImgFieldCode) {
        entry.banner.code = this.accessGame.bannerImgFieldCode;
        entry.banner.imgUrl = this.accessGame.bannerImgUrl;
      }
      if (this.accessGame.accessButtonImgFieldCode) {
        entry.entryBtn.code = this.accessGame.accessButtonImgFieldCode;
        entry.entryBtn.imgUrl = this.accessGame.accessButtonImgUrl;
      }
      if (this.accessGame.rankingButtonImgFieldCode) {
        entry.rankBtn.code = this.accessGame.rankingButtonImgFieldCode;
        entry.rankBtn.imgUrl = this.accessGame.rankingButtonImgUrl;
      }
      if (this.accessGame.prizeButtonImgFieldCode) {
        entry.prizeBtn.code = this.accessGame.prizeButtonImgFieldCode;
        entry.prizeBtn.imgUrl = this.accessGame.prizeButtonImgUrl;
      }

      //main
      if (this.startGame.backgroundImgFieldCode) {
        main.bg.code = this.startGame.backgroundImgFieldCode;
        main.bg.imgUrl = this.startGame.backgroundImgUrl;
      }
      if (this.startGame.bannerImgFieldCode) {
        main.box.code = this.startGame.bannerImgFieldCode;
        main.box.imgUrl = this.startGame.bannerImgUrl;
      }
      if (this.startGame.startButtonImgFieldCode) {
        main.startBtn.code = this.startGame.startButtonImgFieldCode;
        main.startBtn.imgUrl = this.startGame.startButtonImgUrl;
      }
      if (this.startGame.tipButtonImgFieldCode) {
        main.tipBtn.code = this.startGame.tipButtonImgFieldCode;
        main.tipBtn.imgUrl = this.startGame.tipButtonImgUrl;
      }
      if (this.startGame.continueButtonImgFieldCode) {
        main.continueBtn.code = this.startGame.continueButtonImgFieldCode;
        main.continueBtn.imgUrl = this.startGame.continueButtonImgUrl;
      }
      if (this.startGame.shareButtonImgFieldCode) {
        main.shareBtn.code = this.startGame.shareButtonImgFieldCode;
        main.shareBtn.imgUrl = this.startGame.shareButtonImgUrl;
      }

      //share
      if (this.shareGame.backgroundImgFieldCode) {
        share.bg.code = this.shareGame.backgroundImgFieldCode;
        share.bg.imgUrl = this.shareGame.backgroundImgUrl;
      }
      if (this.shareGame.bannerImgFieldCode) {
        share.banner.code = this.shareGame.bannerImgFieldCode;
        share.banner.imgUrl = this.shareGame.bannerImgUrl;
      }
      if (this.shareGame.shareButtonImgFieldCode) {
        share.giveBtn.code = this.shareGame.shareButtonImgFieldCode;
        share.giveBtn.imgUrl = this.shareGame.shareButtonImgUrl;
      }
    },
    getSkin() {
      return {
        accessGame: {
          /** 页面背景图 **/
          backgroundImgUrl: this.skin.entry.bg.code ? this.skin.entry.bg.imgUrl : '',
          backgroundImgFieldCode: this.skin.entry.bg.code || '',
          /** banner图片url **/
          bannerImgUrl: this.skin.entry.banner.code ? this.skin.entry.banner.imgUrl : '',
          bannerImgFieldCode: this.skin.entry.banner.code || '',
          /** 进入游戏按钮url **/
          accessButtonImgUrl: this.skin.entry.entryBtn.code ? this.skin.entry.entryBtn.imgUrl : '',
          accessButtonImgFieldCode: this.skin.entry.entryBtn.code || '',
          /** 排行榜按钮url **/
          rankingButtonImgUrl: this.skin.entry.rankBtn.code ? this.skin.entry.rankBtn.imgUrl : '',
          rankingButtonImgFieldCode: this.skin.entry.rankBtn.code || '',
          /** 查看奖品按钮url **/
          prizeButtonImgUrl: this.skin.entry.prizeBtn.code ? this.skin.entry.prizeBtn.imgUrl : '',
          prizeButtonImgFieldCode: this.skin.entry.prizeBtn.code || ''
        },
        startGame: {
          /** 页面背景图 **/
          backgroundImgUrl: this.skin.main.bg.code ? this.skin.main.bg.imgUrl : '',
          backgroundImgFieldCode: this.skin.main.bg.code || '',
          /** 拼图游戏背景图 **/
          bannerImgUrl: this.skin.main.box.code ? this.skin.main.box.imgUrl : '',
          bannerImgFieldCode: this.skin.main.box.code || '',
          /** 开始游戏按钮图片 **/
          startButtonImgUrl: this.skin.main.startBtn.code ? this.skin.main.startBtn.imgUrl : '',
          startButtonImgFieldCode: this.skin.main.startBtn.code || '',
          /** 提示按钮图片 **/
          tipButtonImgUrl: this.skin.main.tipBtn.code ? this.skin.main.tipBtn.imgUrl : '',
          tipButtonImgFieldCode: this.skin.main.tipBtn.code || '',
          /** 继续按钮图片 **/
          continueButtonImgUrl: this.skin.main.continueBtn.code ? this.skin.main.continueBtn.imgUrl : '',
          continueButtonImgFieldCode: this.skin.main.continueBtn.code || '',
          /** 分享得体力按钮图片 **/
          shareButtonImgUrl: this.skin.main.shareBtn.code ? this.skin.main.shareBtn.imgUrl : '',
          shareButtonImgFieldCode: this.skin.main.shareBtn.code || ''
        },
        shareGame: {
          /** 页面背景图url **/
          backgroundImgUrl: this.skin.share.bg.code ? this.skin.share.bg.imgUrl : '',
          backgroundImgFieldCode: this.skin.share.bg.code || '',
          /** 页面banner图片url **/
          bannerImgUrl: this.skin.share.banner.code ? this.skin.share.banner.imgUrl : '',
          bannerImgFieldCode: this.skin.share.banner.code || '',
          /**  赠送体力按钮url **/
          shareButtonImgUrl: this.skin.share.giveBtn.code ? this.skin.share.giveBtn.imgUrl : '',
          shareButtonImgFieldCode: this.skin.share.giveBtn.code || ''
        }
      };
    },
    skinUpload(obj) {
      if (obj.code) {
        try {
          this.skin[obj.levelOne][obj.levelTwo].code = obj.code;
          this.skin[obj.levelOne][obj.levelTwo].imgUrl = obj.imgUrl;
        } catch (err) {
          this.$tips({ type: 'warning', message: '上传失败' });
        }
      }
    },
    skinReset(obj) {
      let currentObj = skinObj['skin' + (this.skinType + 1)][obj.levelOne][obj.levelTwo];
      this.skin[obj.levelOne][obj.levelTwo] = {
        code: '',
        imgUrl: currentObj.imgUrl
      };
      this.$tips({ type: 'success', message: '重置成功' });
    },
    changeDefaultSkin(type) {
      this.skin = JSON.parse(JSON.stringify(skinObj['skin' + (type + 1)]));
    }
  }
};
</script>

<style lang="scss">
.ptyx-skin {
  &__header {
    width: 100%;
    &--line {
      display: inline-block;
      width: calc(50% - 54px);
      background: #dcdfe6;
      height: 1px;
      vertical-align: middle;
    }
    &--title {
      text-align: center;
      display: inline-block;
      width: 100px;
      vertical-align: middle;
    }
  }

  &__content {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
  }
  &__item {
    width: 345px;
    &__text {
      min-height: 120px;
      h4 {
        color: #303133;
        font-size: 14px;
        font-weight: 500;
        line-height: 30px;
      }
      p {
        color: #606266;
        font-size: 12px;
        line-height: 17px;
      }
    }
    &--top {
      margin-top: 10px;
      background: url('../img/common/mould_nav.png') no-repeat;
      width: 345px;
      height: 60px;
      border: 1px solid #dcdfe6;
      border-bottom: none;
    }
    &--body {
      width: 345px;
      height: 555px;
      border: 1px solid #dcdfe6;
      border-top: none;
      position: relative;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }

  &__entry {
    &--bg {
      width: 345px;
      height: 555px;
      position: absolute;
      z-index: 1;
      left: 0;
      top: 0;
    }
    &--banner {
      width: 345px;
      height: 138px;
      position: absolute;
      z-index: 2;
      left: 0;
      top: 100px;
    }
    &--entryBtn {
      width: 244px;
      height: 62px;
      position: absolute;
      z-index: 2;
      left: 50px;
      top: 300px;
    }
    &--rankBtn {
      width: 120px;
      height: 45px;
      position: absolute;
      z-index: 2;
      left: 40px;
      top: 380px;
    }
    &--prizeBtn {
      width: 120px;
      height: 45px;
      position: absolute;
      z-index: 2;
      left: 184px;
      top: 380px;
    }
  }

  &__main {
    &--bg {
      width: 345px;
      height: 555px;
      position: absolute;
      z-index: 1;
      left: 0;
      top: 0;
    }
    &--box {
      width: 267px;
      height: 400px;
      position: absolute;
      z-index: 2;
      left: 40px;
      top: 80px;
    }
    &--shareBtn {
      width: 120px;
      height: 45px;
      position: absolute;
      z-index: 2;
      right: 36px;
      top: 484px;
    }
    &--poppver {
      width: 244px;
      height: 62px;
      position: absolute;
      z-index: 3;
      left: 50px;
      top: 386px;
    }
    &--startBtn,
    &--tipBtn,
    &--continueBtn {
      position: relative;
      width: 244px;
      height: 62px;
      margin-bottom: 10px;
      img {
        width: 100%;
        height: 100%;
      }
    }
  }

  &__share {
    &--bg {
      width: 345px;
      height: 555px;
      position: absolute;
      z-index: 1;
      left: 0;
      top: 0;
    }
    &--giveBtn {
      width: 244px;
      height: 62px;
      position: absolute;
      z-index: 2;
      left: 50px;
      top: 423px;
    }
    &--banner {
      width: 345px;
      height: 345px;
      position: absolute;
      z-index: 2;
      left: 0px;
      top: 68px;
    }
  }

  &__btn {
    position: absolute;
    top: 0;
    right: 0px;
    width: 12px;
    height: 25px;
    font-size: 0px;
    color: #fff;
    &--upload {
      width: 12px;
      height: 12px;
      line-height: 12px;
      display: inline-block;
      background: #1890ff;
      border-bottom: 1px solid #fff;
      text-align: center;
      cursor: pointer;
      i {
        font-size: 12px;
      }
    }
    &--reset {
      width: 12px;
      height: 12px;
      line-height: 12px;
      display: inline-block;
      background: #7f8699;
      text-align: center;
      cursor: pointer;
      i {
        font-size: 10px;
      }
    }
  }
  .rule {
    cursor: default;
    position: absolute;
    bottom: 10%;
    z-index: 999;
    width: 100%;
    text-align: center;
  }
  .white {
    color: rgba(255, 255, 255, 0.8);
  }
  .orange {
    color: rgba(240, 88, 50, 0.6);
  }
}
</style>
