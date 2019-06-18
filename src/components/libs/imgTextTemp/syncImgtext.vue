<template>
  <el-dialog class="sync-imgtext__dialog" title="同步微信图文" :visible.sync="show" width="30%" :before-close="close" v-loading="loading">
    <div class="gic-modal-bd text-center">
      <div class="gic-modal-content">
        <p class="fz16" style="margin-bottom:20px">
          微信图文共<span> {{ count }} </span>条<span @click="getSyncInfo" class="blue" style="margin-left:10px;">刷新</span>
        </p>
        <p class="gray fz12">同步全部图文可能会需要比较久的时间，请耐心等待</p>
      </div>
    </div>
    <div class="text-center pt20">
      <el-select class="w100" v-if="loadStatus === 1 && count !== 0" v-model="size" placeholder="选择群发类型">
        <el-option v-for="item in sizeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-button v-if="loadStatus === 1" type="primary" @click="syncWechat()">立即同步</el-button>
      <el-button v-if="loadStatus === 0" type="primary" :loading="true">同步中</el-button>
      <el-button v-if="loadStatus === 3" icon="el-icon-error" type="danger">同步失败</el-button>
    </div>
  </el-dialog>
</template>
<script>
import { getSyncInfo, syncWechatImageText } from '@/service/api/wechatApi.js';
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.getSyncInfo();
      }
    }
  },
  data() {
    return {
      loadStatus: 1,
      loading: false,
      count: 0,
      size: 5,
      sizeOptions: [{ label: '5条', value: 5 }, { label: '10条', value: 10 }, { label: '20条', value: 20 }, { label: '全部', value: 999999 }]
    };
  },
  methods: {
    close() {
      this.$emit('update:show', false);
    },
    async getSyncInfo() {
      this.loading = true;
      let res = await getSyncInfo();
      this.count = res.result.wechatCount;
      this.loadStatus = res.result.status;
      this.loading = false;
    },
    async syncWechat() {
      this.loadStatus = 0;
      const num = this.size === 999999 ? this.count : this.size;
      let res = await syncWechatImageText({ num });
      if (num <= 20 && res.errorCode === 0) {
        this.$tips({ type: 'success', message: '同步成功' });
        this.loadStatus = 1;
        this.close();
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.gic-modal-content {
  font-size: 18px;
  color: #333;
  margin-top: 30px;
  font-size: 16px;
}
</style>
