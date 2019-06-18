<template>
  <label :name="imgData.imageMediaId" class="dm-img-item" :class="{ active: active === imgData.imageId }" @click="chooseImg">
    <div class="dm-img-item_top">
      <img :src="imgData.qcloudImageUrl" alt="" srcset="" />
    </div>
    <div class="dm-img-item_center">
      <el-checkbox :label="imgData.imageMediaId">{{ imgData.imageTitle }}</el-checkbox>
    </div>
  </label>
</template>
<script>
export default {
  props: {
    imgData: {
      type: Object,
      default: () => {
        return {
          qcloudImageUrl: '',
          imageId: '',
          imageTitle: ''
        };
      }
    }
  },
  data() {
    return {
      active: ''
    };
  },
  methods: {
    chooseImg() {
      // eslint-disable-next-line
      $bus.$emit('img-temp-choose', this.imgData);
    }
  }
};
</script>

<style lang="scss" scoped>
@import '../../../assets/style/base/var.scss';
@import '../../../assets/style/mixin/index.scss';
.dm-img-item {
  width: 168px;
  margin: 20px 10px 0 10px;
  float: left;
  border: 1px solid #e4e7ed;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  &:hover {
    border: 1px solid #1890ff;
  }
  &_top {
    width: 168px;
    height: 168px;
    position: relative;
    img {
      width: 100%;
      height: 100%;
    }
  }
  &_center {
    border-top: 1px solid $border-color;
    height: 32px;
    display: flex;
    justify-content: left;
    align-items: center;
    padding-left: 10px;
    /deep/ .el-checkbox__label {
      @include ellipsis(130px);
      vertical-align: middle;
      padding-left: 10px;
    }
  }
  &_bottom {
    border-top: 1px solid $border-color;
    height: 32px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    background: $gray-color;
  }
}
</style>
