<template>
  <div class="dm-avatar">
    <label class="dm-avatar__upload " :class="{ 'is-disabled': disabled }" :style="`width:${width}px;height:${height}px;`" v-loading="loading">
      <input type="file" style="display:none;" :disabled="disabled" accept="image/gif, image/jpeg,image/png" ref="uploader" v-upload="this" />
      <img v-show="model.imgUrl && showImg" :src="model.imgUrl || ''" :class="className" class="dm-avatar__img" />
      <i class="el-icon-plus dm-avatar__icon" v-show="!model.imgUrl" :style="'line-height:' + height + 'px;'"></i>
    </label>
    <div class="dm-avatar__tips" :style="tipsStyle">{{ tips }}</div>
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
    height: {
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
    // 限制图片大小
    limit: {
      type: Object,
      default() {
        return {
          type: false,
          width: 100,
          height: 100
        };
      }
    }
  },
  data() {
    return {
      loading: false,
      disabled: false
    };
  },
  watch: {
    model: {
      handler(val) {
        this.$emit('update:model', this.model);
        this.$emit('backImg', this.model);
      },
      deep: true
    }
  }
};
</script>

<style lang="scss" scoped>
.dm-avatar {
  &__upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
    display: inline-block;
    text-align: center;
    outline: none;
    width: 178px;
    height: 178px;
    &:hover {
      box-shadow: 0 0 8px 0 rgba(232, 237, 250, 0.6), 0 2px 4px 0 rgba(232, 237, 250, 0.5);
      border-color: #1890ff;
    }
  }
  &__img {
    width: 100%;
    height: 100%;
    display: block;
  }
  &__icon {
    font-size: 28px;
    color: #8c939d;
    width: 100%;
    height: 100%;
    line-height: 178px;
    text-align: center;
  }
  &__tips {
    color: #909399;
    font-size: 12px;
    line-height: 1;
  }
}
</style>
