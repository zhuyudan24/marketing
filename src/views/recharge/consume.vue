<template>
  <section class="recharge">
    <div class="dm-wrap">日期：<el-date-picker v-model="dateTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="loadAll(false)"></el-date-picker></div>
    <div class="dm-form__wrap">
      <h3 class="dm-title__label">趋势分析图</h3>
      <div class="text-center fz16" v-if="$route.params.type === 'record'">{{ formatDateTimeByType(dateTime[0], 'yyyy-MM-dd') }}至{{ formatDateTimeByType(dateTime[1], 'yyyy-MM-dd') }} 成功存储：{{ sumCount || 0 }} 分钟 总计消费：{{ (sumFee / 100).toFixed(2) }} 元</div>
      <div class="text-center fz16" v-else>{{ formatDateTimeByType(dateTime[0], 'yyyy-MM-dd') }}至{{ formatDateTimeByType(dateTime[1], 'yyyy-MM-dd') }} 成功发送：{{ sumCount || 0 }} 条 总计消费：{{ (sumFee / 1000).toFixed(2) }} 元</div>
      <div>
        <div id="mountNode" ref="mountNode" v-show="list.length"></div>
        <div class="chart--nodata" v-show="!list.length"></div>
      </div>
    </div>
    <div class="dm-form__wrap">
      <div class="pb22" style="overflow:hidden;line-height:40px;">
        <!-- <el-select v-if="$route.params.type === 'call'" class="dm-select" v-model="taskType" placeholder="选择发送状态" @change="loadAll(true)">
          <el-option v-for="item in taskTypeOptions" :key="item.taskType" :label="item.ecmName" :value="item.taskType"></el-option>
        </el-select> -->
        <el-input v-model="listParams.searchParam" class="w250" :placeholder="placeholder" clearable @change="loadAll(true)"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      </div>
      <el-table tooltipEffect="light" :data="tableList" style="width:100%" v-loading="loading" v-if="$route.params.type === 'marketing'">
        <el-table-column align="left" width="170" prop="sendTime" label="发送时间">
          <template slot-scope="scope">
            <p class="cell-time">
              {{ formatDateTimeByType(scope.row.sendTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
              <span>{{ formatDateTimeByType(scope.row.sendTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column align="left" width="150" prop="telephone" label="接收号码"></el-table-column>
        <el-table-column align="left" width="100" prop="countNum" label="计费条数">
          <template slot-scope="scope">
            {{ scope.row.countNum }}条
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" min-width="180" prop="storeName" label="主门店">
          <template slot-scope="scope">
            <p>{{ scope.row.storeName }}</p>
            <p class="gray">{{ scope.row.storeGroupName }}</p>
          </template>
        </el-table-column>
        <el-table-column label="模板ID" align="left" width="100" prop="chartsDate"></el-table-column>
        <el-table-column label="短信内容" align="left" min-width="200" prop="remark">
          <template slot-scope="scope">
            <el-popover class="item" trigger="hover" width="200" v-if="scope.row.remark && scope.row.remark.length > 10" :content="scope.row.remark" placement="top-start">
              <span class="ellipsis" slot="reference">{{ scope.row.remark }}</span>
            </el-popover>
            <span v-else>{{ scope.row.remark }}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-table tooltipEffect="light" :data="tableList" style="width:100%" v-loading="loading" v-if="$route.params.type === 'sms'">
        <el-table-column align="left" width="170" prop="createTime" label="发送时间">
          <template slot-scope="scope">
            <p class="cell-time">
              {{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
              <span>{{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column align="left" width="150" prop="receivePhone" label="接收号码"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" min-width="180" prop="storeName" label="主门店">
          <template slot-scope="scope">
            <p>{{ scope.row.storeName }}</p>
            <p class="fz13 gray">{{ scope.row.storeGroupName }}</p>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" label="短信内容" align="left" min-width="200" prop="paramInfo">
          <template slot-scope="scope">
            您的验证码是：{{ scope.row.paramInfo }}
          </template>
        </el-table-column>
        <el-table-column label="状态" align="left" width="100" prop="status">
          <template slot-scope="scope">
            {{ scope.row.status === 1 ? '成功' : '失败' }}
          </template>
        </el-table-column>
      </el-table>
      <el-table tooltipEffect="light" :data="tableList" style="width:100%" v-loading="loading" v-if="$route.params.type === 'voice'">
        <el-table-column align="left" prop="createTime" label="发送时间" width="170px">
          <template slot-scope="scope">
            <p class="cell-time">
              {{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
              <span>{{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column align="left" prop="receivePhone" label="接收号码"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" min-width="180" prop="storeName" label="主门店">
          <template slot-scope="scope">
            <p>{{ scope.row.storeName }}</p>
            <p class="fz13 gray">{{ scope.row.storeGroupName }}</p>
          </template>
        </el-table-column>

        <el-table-column label="状态" align="left" prop="status">
          <template slot-scope="scope">
            {{ scope.row.status === 1 ? '成功' : '失败' }}
          </template>
        </el-table-column>
      </el-table>
      <!-- 不良评价回访 -->
      <el-table tooltipEffect="light" :data="tableList" style="width:100%" v-loading="loading" v-if="$route.params.type === 'call'">
        <el-table-column align="left" width="160" prop="createTime" label="呼叫时间">
          <template slot-scope="scope">
            <p class="cell-time">
              {{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
              <span>{{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" min-width="180" prop="storeName" label="主门店">
          <template slot-scope="scope">
            <p>{{ scope.row.storeName }}</p>
            <p class="fz13 gray">{{ scope.row.storeGroupName }}</p>
          </template>
        </el-table-column>
        <el-table-column align="left" width="150" prop="clerkName" label="主叫">
          <template slot-scope="scope">
            <p>{{ scope.row.clerkName || '--' }}</p>
            <p class="gray">{{ scope.row.sendPhone }}</p>
          </template>
        </el-table-column>
        <el-table-column align="left" width="150" prop="memberId" label="被叫(会员)">
          <template slot-scope="scope">
            <img :src="scope.row.memberPic || defaultAvatar" width="32" height="32" alt="" />
            <div class="inline-block">
              <p>{{ scope.row.memberName || '--' }}</p>
              <p class="fz13 gray">{{ scope.row.receivePhone || '--' }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" width="150" prop="status" label="通话状态">
          <template slot-scope="scope">
            {{ scope.row.callStatus === 1 ? '未接通' : scope.row.callStatus === 2 ? '接通' : '成功' }}
          </template>
        </el-table-column>
        <el-table-column align="left" width="150" prop="callTime" label="时间（秒）">
          <template slot-scope="scope">
            {{ scope.row.callTime }}秒
          </template>
        </el-table-column>
        <el-table-column align="left" width="150" prop="callFee" label="消费金额（元）">
          <template slot-scope="scope">
            {{ Number(scope.row.callFee / 1000).toFixed(2) }}元
          </template>
        </el-table-column>
      </el-table>
      <el-table tooltipEffect="light" :data="tableList" style="width:100%" v-loading="loading" v-if="$route.params.type === 'record'">
        <el-table-column align="left" width="160" prop="createTime" label="呼叫时间">
          <template slot-scope="scope">
            <p class="cell-time">
              {{ formatDateTimeByType(scope.row.callBeginTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
              <span>{{ formatDateTimeByType(scope.row.callBeginTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" align="left" min-width="180" prop="storeName" label="主门店">
          <template slot-scope="scope">
            <p>{{ scope.row.storeName }}</p>
            <p class="fz13 gray">{{ scope.row.storeGroupName }}</p>
          </template>
        </el-table-column>
        <el-table-column align="left" width="150" prop="clerkName" label="主叫">
          <template slot-scope="scope">
            <p>{{ scope.row.clerkName || '--' }}</p>
            <p class="gray">{{ scope.row.clerkPhoneNumber }}</p>
          </template>
        </el-table-column>
        <el-table-column align="left" width="150" prop="memberId" label="被叫(会员)">
          <template slot-scope="scope">
            <img :src="scope.row.memberImgUrl || defaultAvatar" width="32" height="32" alt="" />
            <div class="inline-block">
              <p>{{ scope.row.memberName || '--' }}</p>
              <p class="fz13 gray">{{ scope.row.memberPhoneNumber || '--' }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column align="left" width="150" prop="status" label="类型">
          <template slot-scope="scope">
            {{ scope.row.telTaskTitle }}
          </template>
        </el-table-column>
        <el-table-column align="left" width="150" prop="status" label="录音保存时长">
          <template slot-scope="scope">
            {{ scope.row.storageTypeRemark }}
          </template>
        </el-table-column>
        <el-table-column align="left" width="150" prop="callTime" label="时间（分钟）">
          <template slot-scope="scope">
            {{ scope.row.callTime }}分钟
          </template>
        </el-table-column>
        <el-table-column align="left" width="150" prop="callFee" label="消费金额（元）">
          <template slot-scope="scope">
            {{ Number(scope.row.storageFee / 100).toFixed(2) }}元
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    </div>
  </section>
</template>
<script>
import { messageMarketingChart, messageMarketingPage, smsData, voiceData, callData, recordData } from '@/service/api/rechargeApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import G2 from '@antv/g2';
export default {
  name: 'recharge-consume',
  data() {
    return {
      list: [],
      // eslint-disable-next-line
      defaultAvatar: require('../../assets/img/head_default.png'),
      formatDateTimeByType,
      dateTime: [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()],
      loading: false,
      tableList: [],
      listParams: {
        currentPage: 1,
        pageSize: 20,
        beginTime: '',
        endTime: '',
        searchParam: ''
      },
      total: 0,
      taskType: '',
      taskTypeOptions: [],
      sumFee: 0,
      sumCount: 0,
      placeholder: ''
    };
  },
  created() {
    this.loadAll();
    this.$store.commit('mutations_breadcrumb', [{ name: '企业管理', path: '' }, { name: '计费中心', path: '/recharge' }, { name: '消费详情', path: '' }]);
  },
  methods: {
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.loadAll();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.loadAll();
    },
    loadAll(onlyList = false) {
      if (this.dateTime) {
        this.listParams.beginTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
        this.listParams.endTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
      } else {
        this.listParams.beginTime = '';
        this.listParams.endTime = '';
      }
      if (this.$route.params.type === 'marketing') {
        this.placeholder = '输入手机号码/模板ID/内容';
        if (!onlyList) {
          this.marketingCharts();
        }
        this.marketingList();
      }
      if (this.$route.params.type === 'sms') {
        this.placeholder = '输入手机号码';
        if (!onlyList) {
          this.smsData('charts');
        }
        this.smsData('list');
      }
      if (this.$route.params.type === 'voice') {
        this.placeholder = '输入手机号码';
        if (!onlyList) {
          this.voiceData('charts');
        }
        this.voiceData('list');
      }
      if (this.$route.params.type === 'call') {
        this.placeholder = '输入手机号码';
        if (!onlyList) {
          this.callData('charts');
        }
        this.callData('list');
      }
      if (this.$route.params.type === 'record') {
        this.placeholder = '输入手机号码';
        if (!onlyList) {
          this.recordData('charts');
        }
        this.recordData('list');
      }
    },
    async marketingList() {
      this.loading = true;
      try {
        let resList = await messageMarketingPage(this.listParams);
        if (resList.errorCode === 0 && resList.result.result) {
          this.tableList = resList.result.result || [];
          this.total = resList.result.totalCount;
        } else {
          this.tableList = [];
        }
      } catch (err) {}
      this.loading = false;
    },
    async marketingCharts() {
      try {
        let res = await messageMarketingChart(this.listParams);
        this.sumCount = res.result.sumCount;
        this.sumFee = res.result.sumFee;
        let chartList = res.result.chartList || [];
        let list = [];
        chartList.map(v => {
          list.push({ day: v.chartsDate, name: '消费', temperature: v.fee ? (parseInt(v.fee) / 1000).toFixed(2) : 0 });
        });
        list.sort((a, b) => {
          return a.temperature - b.temperature;
        });
        this.list = list;
        this.$nextTick(_ => {
          this.initCharts(list, 'mountNode');
        });
      } catch (err) {}
    },
    async smsData(type = 'list') {
      this.loading = true;
      try {
        let res = await smsData(Object.assign({ ajaxType: type }, this.listParams));
        if (type === 'list') {
          if (res.errorCode === 0 && res.result.page.result) {
            this.tableList = res.result.page.result || [];
            this.total = res.result.page.totalCount;
          } else {
            this.tableList = [];
          }
        } else if (type === 'charts') {
          this.sumCount = res.result.sumCount;
          this.sumFee = res.result.sumFee;
          let chartList = res.result.chartList || [];
          let list = [];
          chartList.map(v => {
            list.push({ day: v.chartsDate, name: '消费', temperature: v.fee ? (parseInt(v.fee) / 1000).toFixed(2) : 0 });
          });
          list.sort((a, b) => {
            return a.temperature - b.temperature;
          });
          this.list = list;
          this.$nextTick(_ => {
            this.initCharts(list, 'mountNode');
          });
        }
      } catch (err) {}
      this.loading = false;
    },
    async voiceData(type = 'list') {
      this.loading = true;
      try {
        let res = await voiceData(Object.assign({ ajaxType: type }, this.listParams));
        if (type === 'list') {
          if (res.errorCode === 0 && res.result.page.result) {
            this.tableList = res.result.page.result || [];
            this.total = res.result.page.totalCount;
          } else {
            this.tableList = [];
          }
        } else if (type === 'charts') {
          this.sumCount = res.result.sumCount;
          this.sumFee = res.result.sumFee;
          let chartList = res.result.chartList || [];
          let list = [];
          chartList.map(v => {
            list.push({ day: v.chartsDate, name: '消费', temperature: v.fee ? (parseInt(v.fee) / 1000).toFixed(2) : 0 });
          });
          list.sort((a, b) => {
            return a.temperature - b.temperature;
          });
          this.list = list;
          this.$nextTick(_ => {
            this.initCharts(list, 'mountNode');
          });
        }
      } catch (err) {}
      this.loading = false;
    },
    async callData(type = 'list') {
      this.loading = true;
      try {
        let res = await callData(Object.assign({ ajaxType: type, taskType: type === 'list' ? this.taskType : '' }, this.listParams));
        if (type === 'list') {
          if (res.errorCode === 0 && res.result.page.result) {
            this.tableList = res.result.page.result || [];
            this.total = res.result.page.totalCount;
            this.taskTypeOptions = [{ taskType: '', ecmName: '全部' }, { taskType: 1, ecmName: '不良评价回访' }];
          } else {
            this.tableList = [];
          }
        } else if (type === 'charts') {
          this.sumCount = res.result.sumCount;
          this.sumFee = res.result.sumFee;
          let chartList = res.result.chartList || [];
          let list = [];
          chartList.map(v => {
            list.push({ day: v.chartsDate, name: '消费', temperature: v.fee ? (parseInt(v.fee) / 1000).toFixed(2) : 0 });
          });
          list.sort((a, b) => {
            return a.temperature - b.temperature;
          });
          this.list = list;
          this.$nextTick(_ => {
            this.initCharts(list, 'mountNode');
          });
        }
      } catch (err) {}
      this.loading = false;
    },
    async recordData(type = 'list') {
      this.loading = true;
      try {
        let res = await recordData(Object.assign({ ajaxType: type, taskType: type === 'list' ? this.taskType : '' }, this.listParams));
        if (type === 'list') {
          if (res.errorCode === 0 && res.result.page.result) {
            this.tableList = res.result.page.result || [];
            this.total = res.result.page.totalCount;
            this.taskTypeOptions = [{ taskType: '', ecmName: '全部' }, { taskType: 1, ecmName: '不良评价回访' }];
          } else {
            this.tableList = [];
          }
        } else if (type === 'charts') {
          this.sumCount = res.result.sumCallTime;
          this.sumFee = res.result.sumFee;
          let chartList = res.result.chartList || [];
          let list = [];
          chartList.map(v => {
            list.push({ day: v.chartsDate, name: '录音存储消费', temperature: v.fee ? (parseInt(v.fee) / 100).toFixed(2) : 0 });
          });
          list.sort((a, b) => {
            return a.temperature - b.temperature;
          });
          this.list = list;
          this.$nextTick(_ => {
            this.initCharts(list, 'mountNode');
          });
        }
      } catch (err) {}
      this.loading = false;
    },
    //生成折线图
    initCharts(data, nodeName) {
      //先清空原先图表
      const mountNode = this.$refs[nodeName];
      const mountNodeChilds = Array.from(mountNode.childNodes);
      mountNodeChilds.map(v => {
        mountNode.removeChild(v);
      });
      var chart = new G2.Chart({
        container: nodeName,
        forceFit: true,
        height: 400,
        padding: [20, 60, 80, 60]
      });
      chart.source(data, {
        day: {
          range: [0, 1]
        },
        temperature: {
          range: [0, 1]
        }
      });
      chart.tooltip({
        crosshairs: {
          type: 'line'
        }
      });
      chart.axis('temperature', {
        label: {
          formatter: function formatter(val) {
            // console.log(val);
            return (isNaN(val) ? '0.00' : val) + '元';
          }
        }
      });
      chart
        .line()
        .position('day*temperature')
        .color('name');
      chart
        .point()
        .position('day*temperature')
        .color('name')
        .size(4)
        .shape('circle')
        .style({
          stroke: '#fff',
          lineWidth: 1
        });
      chart.render();
    }
  }
};
</script>

<style lang="scss" scoped>
.recharge-today {
  &-item {
    padding: 20px;
    margin: 10px 20px;
    .fl {
      line-height: 24px;
    }
    .fr {
      line-height: 34px;
    }
  }
}
</style>
