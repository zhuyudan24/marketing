<template>
  <section class="dm-vlib">
    <el-row :gutter="20" class="clearfix lib-video__list" v-loading="loading" :style="scrollStyle">
      <el-col :span="8">
        <div class="lib-video--add">
          <div @click="$router.push('/wechat/temp/video/add')"><i class="el-icon-plus"></i><span>新增视频</span></div>
        </div>
      </el-col>
      <dm-video-item :chooseFlag="chooseFlag" class="fl" v-for="(v, i) in videoList" :key="i" :videoData="v" @edit="edit" @del="del"></dm-video-item>
    </el-row>
    <!-- <div class="text-center" v-if="videoList.length === 0"> -->
    <!-- <img class="block block-center pt100" width="60" height="60" src="../../../assets/img/no-data_icon.png" alt="">
      <el-button class="block block-center mt10" type="text" @click="$router.push('/wechat/temp/video/add')">新增视频</el-button> -->
    <!-- </div> -->
    <!-- <el-pagination v-show="videoList.length" background  class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination> -->
  </section>
</template>
<script>
import { loadVideoList, delVideoService } from '@/service/api/wechatApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import dmVideoItem from './videoItem';

export default {
  props: {
    mediaId: {
      type: String,
      default: ''
    },
    chooseFlag: {
      type: Boolean,
      default: false
    },
    scrollStyle: Object
  },
  created() {
    this.loadVideoList();
  },
  data() {
    return {
      videoList: [],
      listParams: {
        currentPage: 1,
        pageSize: 999
      },
      total: 1,
      loading: false
    };
  },
  components: {
    dmVideoItem
  },
  methods: {
    handleSizeChange(val) {
      this.listParams.pageSize = val;
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
    },
    async loadVideoList() {
      this.loading = true;
      let res = await loadVideoList(this.listParams);
      this.total = res.result.totalCount;
      this.videoList = res.result.result || [];
      this.videoList.map(v => {
        if (typeof v.createTime === 'number') {
          v.createTimeStr = formatDateTimeByType(v.createTime, 'yyyy-MM-dd-HH-mm-ss');
        } else {
          v.createTimeStr = '';
        }
      });
      this.loading = false;
    },
    edit(val) {
      this.$router.push('/wechat/temp/video/edit/' + val);
    },
    async del(val) {
      try {
        this.loading = true;
        await delVideoService(val);
        this.$tips({ type: 'success', message: '删除成功' });
        this.loadVideoList();
        this.loading = false;
      } catch (err) {
        this.$tips({ type: 'error', message: '删除失败' });
        this.loading = false;
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.dm-vlib {
  margin: 20px 0 20px 20px;
}
.lib-video__list {
  width: 100%;
}
.lib-video--add {
  border: 1px dashed #e4e7ed;
  // width: 290px;
  margin-bottom: 20px;
  height: 310px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  text-align: center;
  vertical-align: middle;
  &:hover {
    border: 1px dashed #1890ff;
    color: #1890ff;
  }
  i {
    line-height: 286px;
    font-size: 16px;
    vertical-align: middle;
  }
  span {
    vertical-align: middle;
    padding-left: 5px;
  }
}
</style>
