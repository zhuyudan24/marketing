<template>
  <section class="recharge">
    <div class="dm-wrap">
      <h3 class="dm-title__label--outer">账户余额</h3>
      <span class="fz22 danger-color vertical-middle pr20">￥{{ (recharge.balance / 100) | amount }}</span>
      <el-button class="ml10 vertical-middle" size="mini" type="primary" @click="$router.push('/recharge/do')">充值</el-button>
      <el-button style="padding: 3px 0" type="text" @click="$router.push('/recharge/record')">充值记录</el-button>
    </div>
    <div class="dm-wrap">
      <h3 class="dm-title__label--outer">今日消费</h3>
      <el-row class="recharge-today" :gutter="20">
        <el-col :span="5">
          <div class="recharge-today-item border2 clearfix">
            <div class="text-center fl">
              <div class="icon-box">
                <i class="iconfont icon-tijianyi fz28"></i>
              </div>
              <p>文本短信</p>
            </div>
            <div class="text-center fr">
              <p class="text-right">
                <span class="fz30">{{ recharge.messageCount || 0 }}</span> 条
              </p>
              <p class="regular-font-color">合计费用：￥{{ (recharge.messageFee / 1000) | amount }}</p>
            </div>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="recharge-today-item border2 clearfix">
            <div class="text-center fl">
              <div class="icon-box color2">
                <i class="iconfont icon-shoujiyanzhengma fz30"></i>
              </div>
              <p>短信验证码</p>
            </div>
            <div class="text-center fr">
              <p class="text-right">
                <span class="fz30">{{ recharge.smsCount || 0 }}</span> 条
              </p>
              <p class="regular-font-color">合计费用：￥{{ (recharge.smsFee / 1000) | amount }}</p>
            </div>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="recharge-today-item border2 clearfix">
            <div class="text-center fl">
              <div class="icon-box color3">
                <i class="iconfont icon-yuyinxiaoxi fz30"></i>
              </div>
              <p>语音验证码</p>
            </div>
            <div class="text-center fr">
              <p class="text-right">
                <span class="fz30">{{ recharge.voiceCount || 0 }}</span> 条
              </p>
              <p class="regular-font-color">合计费用：￥{{ (recharge.voiceFee / 1000) | amount }}</p>
            </div>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="recharge-today-item border2 clearfix">
            <div class="text-center fl">
              <div class="icon-box color4">
                <i class="iconfont icon-shuangxianghujiao fz26"></i>
              </div>
              <p>双向呼叫</p>
            </div>
            <div class="text-center fr">
              <p class="text-right">
                <span class="fz30">{{ recharge.callTime || 0 }}</span> 分钟
              </p>
              <p class="regular-font-color">合计费用：￥{{ (recharge.callFee / 1000) | amount }}</p>
            </div>
          </div>
        </el-col>
        <el-col :span="5">
          <div class="recharge-today-item border2 clearfix">
            <div class="text-center fl">
              <div class="icon-box color5">
                <i class="iconfont icon-luyinzhong fz26"></i>
              </div>
              <p>通话录音</p>
            </div>
            <div class="text-center fr">
              <p class="text-right">
                <span class="fz30">{{ recharge.recordCallTime || 0 }}</span> 分钟
              </p>
              <p class="regular-font-color">合计费用：￥{{ (recharge.recordCallfee / 100) | amount }}</p>
            </div>
          </div>
        </el-col>
      </el-row>
    </div>
    <div class="dm-wrap">
      <div class="pb22">
        <div slot="header" class="clearfix">
          <el-date-picker v-model="dateTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="consumeRecord"></el-date-picker>
        </div>
      </div>
      <el-table tooltipEffect="light" :data="tableList" style="width: 100%" v-loading="loading">
        <el-table-column align="left" prop="name" label="计费项目"></el-table-column>
        <el-table-column align="left" prop="count" label="时长/条数">
          <template slot-scope="scope">
            <span>{{ scope.row.count }}</span>
            {{ scope.row.type === 'call' || scope.row.type === 'record' ? '分钟' : '条' }}
          </template>
        </el-table-column>
        <el-table-column align="left" prop="fee" label="费用">
          <template slot-scope="scope">
            <span>{{ (scope.row.fee / (scope.row.type === 'record' ? 100 : 1000)).toFixed(2) }}</span
            >元
          </template>
        </el-table-column>
        <el-table-column label="操作" align="left" width="220px" fixed="right">
          <template slot-scope="scope">
            <el-button type="text" @click="$router.push('/recharge/consume/' + scope.row.type)">详情</el-button>
          </template>
        </el-table-column>
      </el-table>
    </div>
  </section>
</template>

<script>
import { rechargeCenter, consumeRecord } from '@/service/api/rechargeApi.js';
import { formatDateTimeByType } from '@/utils/index.js';

export default {
  name: 'recharge',
  data() {
    return {
      dateTime: [Date.now(), Date.now()],
      loading: false,
      tableList: [],
      recharge: {},
      listParams: {
        beginTime: '',
        endTime: ''
      }
    };
  },
  created() {
    this.$store.commit('aside_handler', false);
    this.rechargeCenter();
    this.consumeRecord();
    this.$store.commit('mutations_breadcrumb', [{ name: '企业管理', path: '' }, { name: '计费中心', path: '' }]);
  },
  filters: {
    // 金额处理 保留2位小数
    amount: function(value) {
      if (!value) return '0.00';
      if (isNaN(value)) return value;
      return value.toFixed(2);
    }
  },
  methods: {
    async rechargeCenter() {
      try {
        let res = await rechargeCenter();
        this.recharge = res.result.account;
      } catch (err) {
        console.log(err);
      }
    },
    async consumeRecord() {
      this.loading = true;
      if (this.dateTime) {
        this.listParams.beginTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
        this.listParams.endTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
      } else {
        this.listParams.beginTime = '';
        this.listParams.endTime = '';
      }
      try {
        let res = await consumeRecord(this.listParams);
        const result = res.result;
        this.tableList = [{ name: '短信营销', type: 'marketing', fee: result.messageFee, count: result.messageCount }, { name: '短信验证码', type: 'sms', fee: result.smsFee, count: result.smsCount }, { name: '语音验证码', type: 'voice', fee: result.voiceFee, count: result.voiceCount }, { name: '双向呼叫', type: 'call', fee: result.callFee, count: result.callTime }, { name: '通话录音', type: 'record', fee: result.recordCallfee, count: result.recordCallTime }];
      } catch (err) {
        console.log(err);
      }
      this.loading = false;
    }
  }
};
</script>

<style lang="scss" scoped>
.recharge .box-card {
  margin: 24px;
}
.recharge-today {
  .el-col-5 {
    width: 20% !important;
  }
  &-item {
    padding: 20px;
    margin: 4px;
    .icon-box {
      width: 60px;
      height: 60px;
      background: rgba(240, 80, 80, 1);
      border-radius: 3px;
      &.color2 {
        background: #7366ba;
      }
      &.color3 {
        background: #23b7e5;
      }
      &.color4 {
        background: #4fa6f1;
      }
      &.color5 {
        background: #f39925;
      }
      i {
        line-height: 60px;
        color: #fff;
      }
    }
    .fl {
      line-height: 24px;
      p {
        color: #353944;
        margin-top: 5px;
      }
    }
    .fr {
      line-height: 40px;
      position: relative;
      top: 10px;
    }
    .iconfont {
      color: #fff;
    }
  }
}
</style>
