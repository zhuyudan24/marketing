<template>
  <section class="card-record-send">
    <div class="pb22">
      <el-select class="vertical-middle w150" v-model="listParams.putonType" placeholder="投放状态" @change="handleStatusChange">
        <el-option label="投放成功" :value="1"></el-option>
        <el-option label="投放失败" :value="0"></el-option>
      </el-select>
      <el-input class="w250" v-model="listParams.search" placeholder="输入会员姓名/卡号" @change="refresh"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button icon="iconfont icon-icon_yunxiazai fz14" class="fr" type="primary" @click="exportRecordSendInfoEvaluate"> 下载Excel</el-button>
    </div>
    <div class="filter--box pl10" v-show="listParams.putonType === 1">
      <el-select class="vertical-middle w150" v-model="listParams.cardStatus" placeholder="投放状态" @change="getTableList">
        <el-option v-for="(v, i) in cardStatusList" :key="i" :label="v.label" :value="v.value"></el-option>
      </el-select>
      <span class="vertical-middle">领取时间：</span><el-date-picker class="w280" v-model="receiveTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="refresh"></el-date-picker><span class="vertical-middle">核销时间：</span><el-date-picker class="w280" v-model="verifyTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="refresh"></el-date-picker>
    </div>
    <!-- 成功table -->
    <el-table v-show="listParams.putonType === 1" tooltipEffect="light" :data="recordList" style="width: 100%" row-key="putonTime" v-loading="loading">
      <el-table-column align="left" :min-width="200" prop="memberId" label="会员信息">
        <template slot-scope="scope">
          <member-info :row="{ memberId: scope.row.memberId, imageUrl: scope.row.thirdimgurl, memberName: scope.row.memberName, cardNum: scope.row.cardNum }"></member-info>
        </template>
      </el-table-column>
      <el-table-column min-width="100" align="left" prop="status" label="卡券状态">
        <template slot-scope="scope">
          <span v-html="formatStatus(scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column v-for="(v, i) in successHeader" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter"></el-table-column>
      <el-table-column min-width="100" align="left" prop="receiveTime" label="领取时间">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ formatDateTimeByType(scope.row.receiveTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
            <span>{{ formatDateTimeByType(scope.row.receiveTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column min-width="100" align="left" prop="useTime" label="核销时间">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ formatDateTimeByType(scope.row.useTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
            <span>{{ formatDateTimeByType(scope.row.useTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
          </p>
        </template>
      </el-table-column>
    </el-table>
    <!-- 失败table -->
    <el-table v-show="listParams.putonType === 0" tooltipEffect="light" :data="recordList" style="width: 100%" row-key="putonTime" v-loading="loading">
      <el-table-column align="left" :min-width="200" prop="memberId" label="会员信息">
        <template slot-scope="scope">
          <member-info :row="{ memberId: scope.row.memberId, imageUrl: scope.row.photoUrl, memberName: scope.row.memberName, cardNum: scope.row.cardNum }"></member-info>
        </template>
      </el-table-column>
      <el-table-column v-for="(v, i) in failHeader" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter"></el-table-column>
    </el-table>
    <el-pagination v-show="recordList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <vue-gic-export-excel :dialogVisible.sync="dialogVisible" :dataArr="recordList" :type="2" :excelUrl="excelUrl" :params="params" :projectName="projectName"></vue-gic-export-excel>
  </section>
</template>

<script>
import { cardPutOnRecord, exportCardPutOnRecordExcel, getCardPutonDetail } from '@/service/api/cardApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import memberInfo from '@/components/member-info/index.vue';
import tableMethods from '@/mixins/tableMethods.js';
export default {
  name: 'record-send',
  mixins: [tableMethods],
  data() {
    const that = this;
    return {
      formatDateTimeByType,
      cardStatusList: [{ value: 0, label: '全部卡券状态' }, { value: 3, label: '待领取' }, { value: 4, label: '待核销' }, { value: 5, label: ' 已核销' }, { value: 6, label: '已过期' }, { value: 7, label: '已销毁' }, { value: 8, label: '已占用' }],
      loading: false,
      recordList: [],
      receiveTime: ['', ''], // 领取时间
      verifyTime: ['', ''], // 核销时间
      successHeader: [
        { label: '卡券代码', prop: 'cardCode', tooltip: true, align: 'left' },
        {
          label: '卡券类型',
          prop: 'cardType',
          minWidth: '120',
          align: 'left',
          formatter(row) {
            return that.formatCardType(row.cardType);
          }
        },
        {
          label: '投放状态',
          prop: 'cardType',
          minWidth: '100',
          align: 'left',
          formatter() {
            return '成功';
          }
        },
        {
          label: '订单流水号',
          prop: 'orderNumber',
          tooltip: true,
          minWidth: '100',
          align: 'left',
          formatter(row) {
            return row.orderNumber ? row.orderNumber : '--';
          }
        }
      ],
      failHeader: [
        {
          label: '卡券类型',
          prop: 'cardType',
          minWidth: '120',
          align: 'left',
          formatter(row) {
            return that.formatCardType(row.cardType);
          }
        },
        {
          label: '投放状态',
          prop: 'cardType',
          minWidth: '100',
          align: 'left',
          formatter() {
            return '失败';
          }
        },
        { label: '备注', prop: 'remark', minWidth: '150', align: 'left' }
      ],
      listParams: {
        putonId: '',
        coupCardId: '',
        putOnName: '',
        beginTime: '',
        endTime: '',
        putOnTime: '',
        writeOffBeginTime: '',
        writeOffEndTime: '',
        cardStatus: 0,
        putonType: 1,
        search: '',
        currentPage: 1,
        pageSize: 20
      },
      total: 0,
      // excel
      dialogVisible: false,
      excelUrl: '', // 下载数据的地址
      params: {}, // 传递的参数
      projectName: 'marketing'
    };
  },
  components: {
    'member-info': memberInfo
  },
  created() {
    this.getCouponDetail(); // 获取卡券详情
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '卡券营销', path: '' }, { name: '卡券记录', path: '' }, { name: '投放记录', path: '/card/record/send' }, { name: '投放详情', path: '' }]);
  },
  methods: {
    formatStatus(row) {
      let _content = '';
      const { status } = row;
      if (status == 3) {
        _content = `<div class="dm-status--error">待领取</div>`;
      } else if (status == 4) {
        let isOverdue = Date.now() >= row.limitTime;
        _content = `<div class="${isOverdue ? 'dm-status--info' : 'dm-status--primary'}">${isOverdue ? '已过期' : '待核销'}</div>`;
      } else if (status == 5) {
        _content = `<div class="dm-status--warning">已核销</div>`;
      } else if (status == 6) {
        _content = `<div class="dm-status--info">已过期</div>`;
      } else if (status == 7) {
        _content = `<div class="dm-status--error">已销毁</div>`;
      } else if (status == 8) {
        _content = `<div class="dm-status--info">已占用</div>`;
      }
      return _content;
    },
    formatCardType(cardType) {
      let type;
      switch (cardType) {
        case 0:
          type = '抵金券';
          break;
        case 1:
          type = '折扣券';
          break;
        case 2:
          type = '兑换券';
          break;
        default:
      }
      return type;
    },
    // 获取卡券详情
    async getCouponDetail() {
      this.loading = true;
      let res = await getCardPutonDetail({ putonId: this.$route.params.id });
      this.loading = false;
      if (res.errorCode === 0) {
        if (res.result.puton.putOnTime < new Date('2019-05-24 00:00:00')) {
          this.$tips({ type: 'warning', message: '该条数据无记录' });
        }
        Object.assign(this.listParams, {
          putonId: this.$route.params.id,
          coupCardId: res.result.puton.cardId,
          putOnName: res.result.puton.putOnName,
          putOnTime: formatDateTimeByType(res.result.puton.putOnTime, 'yyyy-MM-dd HH:mm:ss')
        });
        this.getTableList();
      } else {
        this.$tips({ type: 'error', message: res.message || '数据错误' });
      }
    },
    //获取列表
    async getTableList() {
      this.loading = true;
      this.formatterTimeFunc(); // 处理时间
      const timeArr = ['beginTime', 'endTime', 'writeOffBeginTime', 'writeOffEndTime'];
      console.log(this.listParams.beginTime);
      let params = Object.assign({}, this.listParams);
      // 时间没有填的不传该字段
      for (let x in params) {
        if (timeArr.indexOf(x) !== -1 && params[x] === '') {
          delete params[x];
        }
      }
      delete params.putOnName;
      delete params.putOnTime;
      const res = await cardPutOnRecord(params);
      if (res.errorCode === 0) {
        this.recordList = res.result.result;
        this.total = res.result.totalCount;
      }
      this.loading = false;
    },
    // 清除筛选条件
    clear() {
      this.receiveTime = '';
      this.verifyTime = '';
      this.listParams.currentPage = 1;
    },
    handleStatusChange() {
      this.clear();
      this.getTableList();
    },
    // 处理时间
    formatterTimeFunc() {
      if (!this.receiveTime) {
        this.listParams.beginTime = this.listParams.endTime = '';
      } else {
        this.listParams.beginTime = formatDateTimeByType(this.receiveTime[0], 'yyyy-MM-dd');
        this.listParams.endTime = formatDateTimeByType(this.receiveTime[1], 'yyyy-MM-dd');
      }

      if (!this.verifyTime) {
        this.listParams.writeOffBeginTime = this.listParams.writeOffEndTime = '';
      } else {
        this.listParams.writeOffBeginTime = formatDateTimeByType(this.verifyTime[0], 'yyyy-MM-dd');
        this.listParams.writeOffEndTime = formatDateTimeByType(this.verifyTime[1], 'yyyy-MM-dd');
      }
    },
    // 导出excel
    exportRecordSendInfoEvaluate() {
      this.dialogVisible = true;
      this.excelUrl = exportCardPutOnRecordExcel;
      this.formatterTimeFunc();
      let params = Object.assign({}, this.listParams, {
        requestProject: 'gic-web'
      });
      // 时间没有填的不传该字段
      const timeArr = ['beginTime', 'endTime', 'writeOffBeginTime', 'writeOffEndTime'];
      for (let x in params) {
        if (timeArr.indexOf(x) !== -1 && params[x] === '') {
          delete params[x];
        }
      }
      this.params = params;
    }
  }
};
</script>
