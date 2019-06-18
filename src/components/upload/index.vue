<template>
  <div>
    <label class="el-button el-button--primary el-button--medium" :class="{ 'is-disabled': disabled }"
      >{{ disabled ? '上传中...' : label }}
      <input type="file" style="display:none;" :disabled="disabled" accept="image/gif, image/jpeg,image/png" ref="uploader" v-upload="this" />
    </label>
    <span class="fz12 gray"> {{ tips }}</span>
    <img v-if="model.imgUrl" :src="model.imgUrl || ''" :width="width" :class="className" class="upload-show-img" />
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
          wxImg: ''
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
    }
  },
  watch: {
    model: {
      handler(val) {
        this.$emit('update:model', this.model);
      },
      deep: true
    }
  },
  data() {
    return {
      disabled: false,
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
