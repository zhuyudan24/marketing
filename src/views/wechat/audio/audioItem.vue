<template>
  <el-col :span="6">
    <div class="audio-item">
      <div class="audio-item_top clearfix">
        <div class="audio-item_top__img fl">
          <i class="iconfont icon-yuyin"></i>
        </div>
        <div class="audio-item_top__desc fl">
          <h5 class="audio-item__title ellipsis-l2">{{ audioData.titleName || '未命名语音' }}</h5>
          <p class="gray fz12 ellipsis-100">创建于:{{ audioData.createTimeStr }}</p>
        </div>
      </div>
      <div class="audio-item_bottom">
        <i class="el-icon-edit" @click="edit"></i>
        <dm-delete @confirm="del" tips="确认删除该语音?">
          <i class="el-icon-delete"></i>
        </dm-delete>
      </div>
    </div>
  </el-col>
</template>

<script>
export default {
  props: {
    audioData: {
      type: Object,
      default: function() {
        return {};
      }
    }
  },
  methods: {
    edit() {
      this.$emit('edit', this.audioData.voiceId);
    },
    del() {
      this.$emit('del', { voiceId: this.audioData.voiceId, voiceMediaId: this.audioData.voiceMediaId });
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../../../assets/style/base/var.scss';
.audio-item {
  border: 1px solid #e4e7ed;
  border-radius: 2px;
  max-height: 150px;
  overflow: hidden;
  margin-bottom: 20px;
  background: #fff;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  &_top {
    padding: 24px;
    &__desc {
      padding-left: 16px;
      line-height: 20px;
      width: calc(100% - 88px);
    }
    &__img {
      width: 60px;
      height: 60px;
      background: #b9c7db;
      text-align: center;
      i {
        line-height: 60px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 30px;
      }
    }
  }
  &__title {
    height: 40px;
  }
  &_bottom {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 40px;
    background: #f7f9fa;
    border-top: 1px solid #e4e7ed;
    cursor: pointer;
    i {
      font-size: 16px;
      color: #909399;
      &:hover {
        color: #1890ff;
      }
      &.el-icon-delete {
        &:hover {
          color: $danger-color;
        }
      }
    }
  }
}
</style>
