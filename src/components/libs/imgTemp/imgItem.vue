<template>
  <label :name="imgData.imageId" class="dm-img-item">
    <div class="dm-img-item_top" @mouseover="optShow = true" @mouseout="optShow = false">
      <img :src="imgData.qcloudImageUrl" alt="" srcset="" />
      <div class="dm-img-item_opt" v-show="optShow">
        <i class="fz14 el-icon-edit cursor" @click.stop.prevent="edit"></i>
        <i class="iconfont icon-fenzu cursor" @click.stop.prevent="move"></i>
        <i class="fz14 el-icon-delete cursor" @click.stop.prevent="del"></i>
      </div>
    </div>
    <div class="dm-img-item_center">
      <el-checkbox :label="imgData.imageId">{{ imgData.imageTitle }}</el-checkbox>
    </div>
  </label>
</template>

<script>
import { updateImgName } from '@/service/api/wechatApi.js';
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
      optShow: false
    };
  },
  methods: {
    edit() {
      this.$prompt('', '修改图片名称', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        inputPattern: /\S/,
        inputPlaceholder: '请输入新名称',
        inputErrorMessage: '名称不能为空',
        inputValue: this.imgData.imageTitle
      })
        .then(({ value }) => {
          this.updateImgName(value);
        })
        .catch(() => {
          this.$tips({
            type: 'info',
            message: '取消修改'
          });
        });
    },
    del(val) {
      this.$emit('delSingleImg', this.imgData.imageId);
    },
    move() {
      this.$emit('moveSingleImg', this.imgData.imageId);
    },
    async updateImgName(val) {
      await updateImgName({ imageId: this.imgData.imageId, imageTitle: val });
      this.$tips({ type: 'success', message: '修改成功' });
      this.$emit('refresh');
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
    position: relative;
    width: 168px;
    height: 168px;
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
      text-overflow: ellipsis;
      overflow: hidden;
      max-width: 130px;
      white-space: nowrap;
      word-wrap: normal;
      width: auto;
      vertical-align: middle;
      padding-left: 10px;
    }
  }
  &_opt {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    // border-top:1px solid $border-color;
    background: rgba(0, 0, 0, 0.5);
    height: 32px;
    display: flex;
    justify-content: space-around;
    align-items: center;
    color: #fff;
    i {
      &:hover {
        color: #1890ff;
      }
    }
    .el-icon-delete {
      &:hover {
        color: #f56c6c;
      }
    }
  }
}
</style>
