<template>
  <section class="card-record-cache">
    <!-- 条件筛选区 -->
    <div class="pb22">
      <el-input v-model="listParams.cardName" class="w250" placeholder="请输入卡券名称" @change="refresh"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-input v-model="listParams.nickName" class="w250" placeholder="请输入用户昵称" @change="refresh"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button class="fr" type="primary" icon="iconfont icon-icon_yunxiazai fz14" @click="exportTemplateReceivedExcel"> 导出记录</el-button>
    </div>
    <div class="filter--box">
      <el-select class="dm-select pl10" v-model="listParams.cardType" placeholder="选择卡券类型" @change="refresh">
        <el-option v-for="(item, index) in cardTypeOptions" :key="index" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-select class="dm-select" v-model="listParams.status" placeholder="选择卡券状态" @change="refresh">
        <el-option v-for="(item, index) in statusOptions" :key="index" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <span class="vertical-middle">领取时间：</span><el-date-picker v-model="dateTime" :clearable="false" @change="refresh" class="w250" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker> <span class="vertical-middle">关注时间：</span><el-date-picker v-model="dateTime2" @change="refresh" class="w250" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
    </div>
    <!-- 列表 -->
    <el-table tooltipEffect="light" :data="recordList" style="width: 100%" v-loading="recordLoading" @sort-change="sortList">
      <el-table-column width="120" align="left" prop="receiveTime" label="领取时间" fixed="left">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ formatDateTimeByType(scope.row.receiveTime, 'yyyy-MM-dd-HH-mm', true).y }}<br />
            <span>{{ formatDateTimeByType(scope.row.receiveTime, 'yyyy-MM-dd-HH-mm', true).h }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column width="120" align="left" prop="cardTypeExcel" label="卡券类型"> </el-table-column>
      <el-table-column min-width="120" align="left" prop="cardName" label="卡券名称"> </el-table-column>
      <el-table-column min-width="120" align="left" prop="cardCode" label="卡券券号"> </el-table-column>
      <el-table-column min-width="120" align="left" prop="dictName" label="卡券来源"> </el-table-column>
      <el-table-column min-width="120" align="left" prop="receiveTypeExcel" label="来源明细"> </el-table-column>
      <el-table-column min-width="120" align="left" prop="attentionStatus" label="关注状态"> </el-table-column>
      <el-table-column width="135" align="left" prop="transferDate" label="关注时间">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ scope.row.transferDate ? formatDateTimeByType(scope.row.transferDate, 'yyyy-MM-dd-HH-mm', true).y : '--' }}<br />
            <span>{{ formatDateTimeByType(scope.row.transferDate, 'yyyy-MM-dd-HH-mm', true).h }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" min-width="140" header-align="left" align="left" :key="Math.random()" prop="clerkId" label="会员信息">
        <template slot-scope="scope">
          <img class="vertical-middle table__avatar--40" :src="scope.row.imageUrl || defaultAvatar" width="60" height="60" />
          <div class="inline-block vertical-middle">
            <p class="table-name--ellipsis">{{ scope.row.nickName || '--' }}</p>
          </div>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="recordList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <vue-gic-export-excel :dialogVisible.sync="dialogVisible" :dataArr="recordList" :type="2" :excelUrl="excelUrl" :params="params" :projectName="projectName"></vue-gic-export-excel>
  </section>
</template>
<script>
import { formatDateTimeByType } from '@/utils/index.js';
import { templateReceiveCardPage, exportTemplateReceivedExcel } from '@/service/api/cardApi.js';
import tableMethods from '@/mixins/tableMethods.js';
import filterAvater from '@/mixins/filterAvater.js';

export default {
  name: 'record-get',
  mixins: [tableMethods, filterAvater],
  data() {
    return {
      formatDateTimeByType,
      dateTime: [Date.now() - 3 * 30 * 24 * 60 * 60 * 1000, Date.now()],
      dateTime2: ['', ''],
      statusOptions: [{ value: '', label: '全部关注状态' }, { value: 0, label: '已关注' }, { value: 1, label: '未关注' }],
      cardTypeOptions: [{ value: '', label: '全部卡券类型' }, { value: 0, label: '抵金券' }, { value: 1, label: '折扣券' }, { value: 2, label: '兑换券' }],
      recordLoading: false,
      recordList: [],
      listParams: {
        currentPage: 1,
        pageSize: 20,
        receiveBeginTime: '',
        receiveEndTime: '',
        cardName: '',
        nickName: '',
        status: '',
        attentionBeginTime: '',
        attentionEndTime: '',
        cardType: ''
      },
      total: 0,
      projectName: 'marketing', // 当前项目名
      dialogVisible: false,
      excelUrl: '', // 下载数据的地址
      params: {} // 传递的参数
    };
  },
  created() {
    this.getTableList();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '卡券营销', path: '' }, { name: '卡券记录', path: '' }, { name: '临时领取记录', path: '' }]);
    this.$store.commit(
      'mutations_layoutTips',
      `<div class="layout--tips">
          <i class="el-icon-info"></i>临时领取记录仅保存未关注公众号或未使用过小程序用户领券情况
      </div>`
    );
  },
  beforeDestroy() {
    this.$store.commit('mutations_layoutTips', '');
  },
  methods: {
    // 列表方法
    sortList(val) {
      this.listParams.sortBy = val.order === 'descending' ? val.prop + ' desc' : val.prop;
      this.getTableList();
    },
    // 领取列表
    async getTableList() {
      this.recordLoading = true;
      if (this.dateTime) {
        this.listParams.receiveBeginTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
        this.listParams.receiveEndTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
      } else {
        this.listParams.receiveBeginTime = '';
        this.listParams.receiveEndTime = '';
      }
      if (this.dateTime2) {
        this.listParams.attentionBeginTime = formatDateTimeByType(this.dateTime2[0], 'yyyy-MM-dd');
        this.listParams.attentionEndTime = formatDateTimeByType(this.dateTime2[1], 'yyyy-MM-dd');
      } else {
        this.listParams.attentionBeginTime = '';
        this.listParams.attentionEndTime = '';
      }
      let res = await templateReceiveCardPage(this.listParams);
      this.recordList = (res.result && res.result.result) || [];
      this.total = (res.result && res.result.totalCount) || 0;
      this.recordLoading = false;
    },
    // 导出记录
    exportTemplateReceivedExcel() {
      this.dialogVisible = true;
      this.excelUrl = exportTemplateReceivedExcel;
      if (this.dateTime) {
        this.listParams.receiveBeginTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
        this.listParams.receiveEndTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
      } else {
        this.listParams.receiveBeginTime = '';
        this.listParams.receiveEndTime = '';
      }
      if (this.dateTime2) {
        this.listParams.attentionBeginTime = formatDateTimeByType(this.dateTime2[0], 'yyyy-MM-dd');
        this.listParams.attentionEndTime = formatDateTimeByType(this.dateTime2[1], 'yyyy-MM-dd');
      } else {
        this.listParams.attentionBeginTime = '';
        this.listParams.attentionEndTime = '';
      }
      this.params = {
        cardName: this.listParams.cardName,
        nickName: this.listParams.nickName,
        receiveBeginTime: this.listParams.receiveBeginTime,
        receiveEndTime: this.listParams.receiveEndTime,
        attentionBeginTime: this.listParams.attentionBeginTime,
        attentionEndTime: this.listParams.attentionEndTime,
        status: this.listParams.status,
        cardType: this.listParams.cardType,
        requestProject: 'marketing'
      };
    },
    // 列表状态过滤器
    filterCardStatus(row) {
      let _content = '';
      if (row.status == 4) {
        let isOverdue = Date.now() >= row.limitTime + 24 * 60 * 60 * 1000;
        _content = `<div class="${isOverdue ? 'dm-status--info' : 'dm-status--primary'}">${isOverdue ? '已过期' : '待核销'}</div>`;
      } else if (row.status == 5) {
        _content = `<div class="dm-status--warning">已核销</div>`;
      } else if (row.status == 6) {
        _content = `<div class="dm-status--info">已过期</div>`;
      } else if (row.status == 7) {
        _content = `<div class="dm-status--error">已销毁</div>`;
      }
      return _content;
    }
  }
};
</script>
