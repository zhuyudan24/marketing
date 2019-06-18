<template>
  <div>
    <label class="el-button el-button--primary" :class="{ 'is-disabled': copyDisabled }" :style="labelStyle">
      <i v-if="icon" :class="icon"></i>
      {{ label }}
      <input type="file" style="display:none;" :disabled="copyDisabled" accept="image/gif, image/jpeg,image/png" ref="uploader" v-upload="this" />
    </label>
    <span class="fz12 gray" :style="tipsStyle"> {{ tips }}</span>
    <img v-if="model.imgUrl && showImg" :src="model.imgUrl || ''" :width="width" :class="className" class="upload-show-img" />
  </div>
</template>

<script>
export default {
  name: 'dm-upload',
  props: {
    model: {
      type: Object,
      default() {
        return {
          code: '',
          imgUrl: '',
          wxImg: '',
          mediaId: ''
        };
      }
    },
    width: {
      type: String,
      default: 'auto'
    },
    tips: {
      type: String,
      default: '图片建议尺寸：100*100'
    },
    className: {
      type: String,
      default: ''
    },
    label: {
      type: String,
      default: '上传'
    },
    fileType: {
      type: String,
      default: 'file'
    },
    showImg: {
      type: Boolean,
      default: true
    },
    tipsStyle: Object,
    size: String,
    url: {
      type: String,
      default: '/api-marketing/upload-game-image'
    },
    labelStyle: Object,
    icon: {
      type: String,
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    model: {
      handler(val) {
        this.$emit('update:model', this.model);
        this.$emit('backImg', this.model);
        this.copyDisabled = this.disabled;
      },
      deep: true
    }
  },
  data() {
    return {
      copyDisabled: false,
      loading: false
    };
  }
};
</script>

<style lang="scss" scoped>
.upload-show-img {
  height: 85px;
  display: block;
  margin-top: 10px;
  cursor: pointer;
}
</style>
