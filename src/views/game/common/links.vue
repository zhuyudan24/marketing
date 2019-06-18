<template>
  <el-dialog title="游戏链接下载" :visible.sync="show" width="40%" :before-close="close" v-loading="loading">
    <div class="links__body">
      <div class="links__body--url">{{ obj.gameUrl }}</div>
      <div class="links__body--btn">
        <el-button v-clipboard:text="obj.gameUrl" type="text" icon="iconfont icon-lianjie fz14"> 复制链接</el-button>
      </div>
    </div>
    <div class="links__qr">
      <vue-qr id="qrWrap" :text="qcText" :size="200" :margin="0" :logoMargin="10"></vue-qr>
      <el-button class="links__qr--btn" type="text" icon="iconfont icon-icon_yunxiazai fz14" @click="downloadImg">二维码下载</el-button>
    </div>
  </el-dialog>
</template>
<script>
import VueQr from 'vue-qr';
import { formatDateTimeByType, downloadFile } from '@/utils/index.js';
export default {
  name: 'links',
  components: {
    VueQr
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    obj: {
      type: Object,
      default() {
        return {};
      }
    },
    gameTypeName: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      qcText: ''
    };
  },
  watch: {
    show(val) {
      if (val) {
        this.createQrImg();
      }
    }
  },
  methods: {
    createQrImg() {
      this.qcText = this.obj.gameUrl || '';
    },
    close() {
      this.$emit('update:show', false);
    },
    downloadImg() {
      const qrWrap = document.getElementById('qrWrap');
      const qrImg = qrWrap && qrWrap.childNodes[0].src;
      downloadFile(this.gameTypeName + '-' + this.obj.gameName + formatDateTimeByType(this.obj.gameStartTime, 'yyyy-MM-dd-HH-mm-ss') || '游戏链接', qrImg);
    }
  }
};
</script>
<style lang="scss" scoped>
.links__body {
  border: 1px solid #ddd;
  &--url {
    height: 80px;
    overflow-x: hidden;
    overflow-y: auto;
    word-break: break-all;
    padding: 10px;
  }
  &--btn {
    text-align: center;
    line-height: 2;
  }
}
.links__qr {
  padding: 20px 0;
  text-align: center;
  &--btn {
    margin: 20px 0;
  }
}
</style>
