<template>
  <section class="dm-alib">
    <div class="clearfix">
      <!-- <span>语音列表共{{total}}个</span> -->
    </div>
    <el-row :gutter="20" class="clearfix lib-audio__list" v-loading="loading">
      <el-col :span="6">
        <div @click="add" class="lib-audio--add"><i class="el-icon-plus"></i><span>新增语音</span></div>
      </el-col>
      <dm-audio-item class="fl" v-for="(v, i) in audioList" :key="i" :audioData="v" @edit="edit" @del="del"></dm-audio-item>
    </el-row>
    <dm-audio-dialog :show.sync="audioDialogShow" :voiceId="currentVoiceId" @refresh="loadAudioList"></dm-audio-dialog>
  </section>
</template>
<script>
import { loadAudioList, delAudioService } from '@/service/api/wechatApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import dmAudioItem from './audioItem';
import dmAudioDialog from './audioDialog';

export default {
  created() {
    this.loadAudioList();
  },
  data() {
    return {
      audioList: [],
      listParams: {
        currentPage: 1,
        pageSize: 999
      },
      total: 1,
      loading: false,
      audioDialogShow: false,
      currentVoiceId: ''
    };
  },
  components: {
    dmAudioItem,
    dmAudioDialog
  },
  methods: {
    handleSizeChange(val) {
      this.listParams.pageSize = val;
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
    },
    async loadAudioList() {
      this.loading = true;
      let res = await loadAudioList(this.listParams);
      this.total = res.result.totalCount;
      this.audioList = res.result.result || [];
      this.audioList.map(v => {
        if (typeof v.createTime === 'number') {
          v.createTimeStr = formatDateTimeByType(v.createTime, 'yyyy-MM-dd-HH-mm-ss');
        } else {
          v.createTimeStr = '';
        }
      });
      this.loading = false;
    },
    edit(val) {
      this.currentVoiceId = val;
      this.audioDialogShow = true;
    },
    add() {
      this.currentVoiceId = '';
      this.audioDialogShow = true;
    },
    async del(val) {
      try {
        this.loading = true;
        await delAudioService(val);
        this.$tips({ type: 'success', message: '删除成功' });
        this.loadAudioList();
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
.lib-audio__list {
  width: 100%;
  padding: 20px 4px 20px 24px;
}
.lib-audio--add {
  border: 1px dashed #e4e7ed;
  height: 148px;
  overflow: hidden;
  margin-bottom: 20px;
  background: #fff;
  cursor: pointer;
  text-align: center;
  &:hover {
    border: 1px dashed #1890ff;
    color: #1890ff;
  }
  i {
    line-height: 148px;
    font-size: 16px;
    vertical-align: middle;
  }
  span {
    vertical-align: middle;
    padding-left: 5px;
  }
}
</style>
