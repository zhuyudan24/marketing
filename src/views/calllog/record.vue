<template>
  <section class="dm-wrap" v-loading="loading" element-loading-text="数据保存中">
    <el-alert type="info" :closable="false" show-icon>
      <p slot="title" class="fz14 info-color line-height1_5">使用通话录音存储功能需开启通话录音存储服务，未开启则录音不作额外保存。开启后，仅支持保存从开启当天起的录音数据。选择不同保存时长收费标准不同，当前收费标准如下：1、三个月 {{ allUnitFee.storageThreeFee }}元/分钟 2、六个月 {{ allUnitFee.storageSixFee }}元/分钟 3、十二个月 {{ allUnitFee.storageTwelveFee }}元/分钟</p>
    </el-alert>
    <section class="mt20">
      <div class="mb20">
        <span class="dm-input_label mr10">开启录音服务</span>
        <el-switch v-model="openFlag"></el-switch>
      </div>
      <div v-show="openFlag">
        <span class="dm-input_label mr10">录音保存时长</span>
        <el-radio-group v-model="storageType">
          <el-radio :label="0">三个月</el-radio>
          <el-radio :label="1">六个月</el-radio>
          <el-radio :label="2">十二个月</el-radio>
        </el-radio-group>
      </div>
      <div class="mt30"><el-button type="primary" class="save" @click="submit">保存</el-button></div>
    </section>
  </section>
</template>

<script>
import { saveCallSetting, getCallSetting } from '@/service/api/calllogApi.js';

export default {
  name: 'record',
  data() {
    return {
      openFlag: false,
      storageType: 0,
      loading: false,
      // 录音收费
      allUnitFee: {
        storageThreeFee: 0,
        storageSixFee: 0,
        storageTwelveFee: 0
      }
    };
  },
  methods: {
    submit() {
      this.loading = true;
      const { openFlag, storageType } = this;
      saveCallSetting({ openFlag: Number(openFlag), storageType }).then(res => {
        this.loading = false;
        this.$tips({ type: 'success', message: res.result });
      });
    }
  },
  created() {
    this.$store.commit('aside_handler', false);
    this.$store.commit('mutations_breadcrumb', [{ name: '会员管理', path: '' }, { name: '通话记录', path: '/calllog/index' }, { name: '录音存储设置', path: '' }]);
    getCallSetting().then(res => {
      const { callSetting, unitFee } = res.result;
      if (callSetting) {
        this.openFlag = !!callSetting.openFlag;
        this.storageType = callSetting.storageType;
      }
      Object.keys(unitFee).map(v => {
        this.allUnitFee[v] = Number(unitFee[v]).toFixed(2) || '0.00';
      });
    });
  }
};
</script>

<style scoped>
.save {
  margin-left: 98px;
}
</style>
