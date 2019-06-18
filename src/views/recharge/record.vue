<template>
  <section class="recharge dm-wrap">
    <div class="pb22"><el-date-picker v-model="dateTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="rechargeRecord"></el-date-picker></div>
    <el-table tooltipEffect="light" :data="tableList" style="width: 100%" v-loading="loading">
      <el-table-column align="left" prop="timeEnd" label="充值时间">
        <template slot-scope="scope">
          <p style="color:#606266;">{{ formatDateTimeByType(scope.row.timeEnd, 'yyyy-MM-dd-HH-mm-ss', true).y }}</p>
          <p style="color:#606266;">{{ formatDateTimeByType(scope.row.timeEnd, 'yyyy-MM-dd-HH-mm-ss', true).h }}</p>
        </template>
      </el-table-column>
      <el-table-column align="left" prop="transactionId" label="充值流水号"></el-table-column>
      <el-table-column align="left" prop="payType" label="充值方式">
        <template slot-scope="scope">
          {{ scope.row.payType | filterPayType }}
        </template>
      </el-table-column>
      <el-table-column label="金额" align="left" prop="totalFee">
        <template slot-scope="scope">
          {{ (scope.row.totalFee / 100).toFixed(2) }}元
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
  </section>
</template>
<script>
import { rechargeRecord } from '@/service/api/rechargeApi.js';
import { formatDateTimeByType } from '@/utils/index.js';

export default {
  name: 'recharge-record',
  data() {
    return {
      formatDateTimeByType,
      dateTime: [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()],
      loading: false,
      tableList: [],
      listParams: {
        currentPage: 1,
        pageSize: 20,
        beginTime: '',
        endTime: ''
      },
      total: 0
    };
  },
  created() {
    this.rechargeRecord();
    this.$store.commit('mutations_breadcrumb', [{ name: '企业管理', path: '' }, { name: '计费中心', path: '/recharge' }, { name: '充值记录', path: '' }]);
  },
  methods: {
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.rechargeRecord();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.rechargeRecord();
    },

    async rechargeRecord() {
      this.loading = true;
      if (this.dateTime) {
        this.listParams.beginTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
        this.listParams.endTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
      } else {
        this.listParams.beginTime = '';
        this.listParams.endTime = '';
      }
      try {
        let res = await rechargeRecord(this.listParams);
        if (res.errorCode === 0 && res.result.result) {
          this.tableList = res.result.result;
        } else {
          this.tableList = [];
        }
      } catch (err) {
        console.log(err);
      }
      this.loading = false;
    }
  },
  filters: {
    filterPayType(val) {
      let result = '';
      switch (val) {
        case 1:
          result = '微信';
          break;
        case 2:
          result = '支付宝';
          break;
        case 3:
          result = '线下充值';
          break;
        default:
          result = '未知';
          break;
      }
      return result;
    }
  }
};
</script>
