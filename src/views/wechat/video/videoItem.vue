<template>
  <el-col :span="8">
    <div class="video-item" :class="{ active: currentId === mediaId }" @click="choose">
      <div class="video-item_top clearfix">
        <div>
          <h5 class="ellipsis-100">{{ videoData.titleName || '未命名视频' }}</h5>
          <p class="gray fz12 ellipsis-100">{{ videoData.createTimeStr }}</p>
        </div>
      </div>
      <div class="video-item_center clearfix">
        <div class="video-item_center__img">
          <i class="iconfont icon-shipin1"></i>
        </div>
        <p class="fl gray fz12 ellipsis-100">{{ videoData.remark }}</p>
      </div>
      <div class="video-item_bottom" v-if="!chooseFlag">
        <i class="el-icon-edit" @click="edit"></i>
        <dm-delete @confirm="del" tips="确认删除该视频?">
          <i class="el-icon-delete"></i>
        </dm-delete>
      </div>
    </div>
  </el-col>
</template>

<script>
export default {
  props: {
    videoData: {
      type: Object,
      default: function() {
        return {};
      }
    },
    chooseFlag: {
      type: Boolean,
      default: false
    },
    mediaId: String
  },
  data() {
    return {
      currentId: ''
    };
  },
  methods: {
    choose() {
      // eslint-disable-next-line
      $bus.$emit('video-temp-choose', this.videoData);
    },
    edit() {
      this.$emit('edit', this.videoData.videoId);
    },
    del() {
      this.$emit('del', { videoId: this.videoData.videoId, videoIdMediaId: this.videoData.videoIdMediaId });
    }
  }
};
</script>
<style lang="scss" scoped>
@import '../../../assets/style/base/var.scss';
.video-item {
  background: #fff;
  border: 1px solid #e4e7ed;
  // width: 290px;
  margin-bottom: 20px;
  // margin:0 10px;
  overflow: hidden;
  cursor: pointer;
  vertical-align: middle;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  &.active {
    border: 2px solid $danger-color;
  }
  &_top {
    padding: 20px 24px 0 24px;
    line-height: 20px;
  }
  &_center {
    padding: 10px 24px;
    height: 190px;
    &__img {
      width: 100%;
      height: 160px;
      background: #b9c7db;
      text-align: center;
      i {
        line-height: 160px;
        color: rgba(255, 255, 255, 0.8);
        font-size: 48px;
      }
    }
    & > p {
      line-height: 40px;
    }
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
