<template>
  <section class="card-record-get">
    <!-- 条件筛选区 -->
    <div class="pb22">
      <el-input v-model="listParams.search" class="w300" placeholder="请输入卡券名称/卡券代码/会员信息" @change="refresh"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button class="fr" type="primary" icon="iconfont icon-icon_yunxiazai fz14" @click="exportReceivedRecordExcel"> 导出订单</el-button>
    </div>
    <div class="filter--box">
      <el-select class="dm-select pl10" v-model="listParams.cardStatus" placeholder="选择卡券状态" @change="refresh">
        <el-option v-for="(item, index) in cardStatusOptions" :key="index" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <span class="vertical-middle">领取时间：</span><el-date-picker v-model="dateTime" :clearable="false" @change="refresh" class="w250" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker> <span class="vertical-middle">核销时间：</span><el-date-picker v-model="dateTime2" @change="refresh" class="w250" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
    </div>
    <!-- 列表 -->
    <el-table tooltipEffect="light" :data="recordList" style="width: 100%" v-loading="recordLoading" @sort-change="sortList">
      <el-table-column width="120" align="left" prop="receiveTime" label="领取时间" fixed="left" sortable="custom">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ scope.row.receiveTime ? formatDateTimeByType(scope.row.receiveTime, 'yyyy-MM-dd-HH-mm', true).y : '--' }}<br />
            <span>{{ formatDateTimeByType(scope.row.receiveTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column width="120" align="left" prop="writeOffTime" label="核销时间" fixed="left" sortable="custom">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ scope.row.useTime ? formatDateTimeByType(scope.row.useTime, 'yyyy-MM-dd-HH-mm', true).y : '--' }}<br />
            <span>{{ formatDateTimeByType(scope.row.useTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" min-width="120" header-align="left" align="left" :key="Math.random()" prop="clerkId" label="会员信息">
        <template slot-scope="scope">
          <a :href="'/member/#/wechatmemberDetail?memberId=' + scope.row.memberId" target="_blank">
            <img class="vertical-middle table__avatar--40" :src="scope.row.thirdimgurl || defaultAvatar" width="60" height="60" />
            <div class="inline-block vertical-middle">
              <p class="table-name--ellipsis">{{ scope.row.thirdName || scope.row.memberName || '--' }}</p>
              <p class="gray">{{ scope.row.phoneNum || '--' }}</p>
            </div>
          </a>
        </template>
      </el-table-column>
      <el-table-column width="120" align="left" prop="receiveTime" label="卡券类型">
        <template slot-scope="scope">
          {{ scope.row.cardType === 0 ? '抵金券' : scope.row.cardType === 1 ? '折扣券' : '兑换券' }}
        </template>
      </el-table-column>
      <el-table-column min-width="100" align="left" prop="receiveTime" label="卡券名称">
        <template slot-scope="scope">
          <p class="blue" @click="$router.push('/card/info/' + scope.row.coupCardId)">{{ scope.row.cardName }}</p>
        </template>
      </el-table-column>
      <el-table-column width="125" align="left" prop="receiveTime" label="卡券代码">
        <template slot-scope="scope">{{ scope.row.cardCode }}</template>
      </el-table-column>
      <el-table-column width="100" align="left" prop="status" label="卡券状态">
        <template slot-scope="scope">
          <span v-html="filterCardStatus(scope.row)"></span>
        </template>
      </el-table-column>
      <el-table-column min-width="80" align="left" prop="receiveName" label="投放来源"></el-table-column>
      <el-table-column width="100" align="left" prop="receiveName" label="来源明细">
        <template slot-scope="scope">
          {{ scope.row.receiveCode == 'RECEIVE_003' || scope.row.receiveCode == 'RECEIVE_005' || scope.row.receiveCode == 'RECEIVE_007' || scope.row.receiveCode == 'RECEIVE_004' || scope.row.receiveCode == 'RECEIVE_010' ? scope.row.receiveTypeExcel : '--' }}
        </template>
      </el-table-column>
      <el-table-column width="100" align="left" prop="receiveName" label="核销来源">
        <template slot-scope="scope">
          {{ scope.row.status === 5 ? (scope.row.checkSource === 0 ? '订单核销' : '手动核销') : '--' }}
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="120px" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.status === 4 && Date.now() < scope.row.limitTime + 24 * 60 * 60 * 1000" @click="orderData(scope.row)">核销</el-button>
          <el-button type="text" v-if="scope.row.status === 4 && Date.now() < scope.row.limitTime + 24 * 60 * 60 * 1000" @click="delData(scope.row)">销毁</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="recordList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <!-- 核销组件dialog -->
    <card-order :show.sync="cardOrderShow" :obj="currentObj"></card-order>
    <vue-gic-export-excel :dialogVisible.sync="dialogVisible" :dataArr="recordList" :type="2" :excelUrl="excelUrl" :params="params" :projectName="projectName"></vue-gic-export-excel>
  </section>
</template>
<script>
import { formatDateTimeByType } from '@/utils/index.js';
import { cardRecordPage, coupcardDestroy, exportReceivedRecordExcel } from '@/service/api/cardApi.js';
import cardOrder from './card-order';
import tableMethods from '@/mixins/tableMethods.js';
import filterAvater from '@/mixins/filterAvater.js';

export default {
  name: 'record-get',
  mixins: [tableMethods, filterAvater],
  components: {
    cardOrder
  },
  data() {
    return {
      formatDateTimeByType,
      dateTime: [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()],
      dateTime2: ['', ''],
      cardStatusOptions: [{ value: '', label: '全部卡券状态' }, { value: 4, label: '待核销' }, { value: 5, label: '已核销' }, { value: 6, label: '已过期' }, { value: 7, label: '已销毁' }, { value: 8, label: '已占用' }],
      recordLoading: false,
      recordList: [],
      listParams: {
        beginTime: '',
        endTime: '',
        cardStatus: '',
        recordType: 1,
        search: '',
        currentPage: 1,
        pageSize: 20,
        writeOffBeginTime: '',
        writeOffEndTime: '',
        sortBy: ''
      },
      total: 0,
      cardOrderShow: false,
      currentObj: {},
      projectName: 'marketing', // 当前项目名
      dialogVisible: false,
      excelUrl: '', // 下载数据的地址
      params: {} // 传递的参数
    };
  },
  created() {
    this.getTableList();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '卡券营销', path: '' }, { name: '卡券记录', path: '' }, { name: '领取记录', path: '' }]);
    this.$store.commit(
      'mutations_layoutTips',
      `<div class="layout--tips">
          <i class="el-icon-info"></i>当天的卡券领取记录数据可在隔天下载完整内容
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
        this.listParams.beginTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
        this.listParams.endTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
      } else {
        this.listParams.beginTime = '';
        this.listParams.endTime = '';
      }
      if (this.dateTime2) {
        this.listParams.writeOffBeginTime = formatDateTimeByType(this.dateTime2[0], 'yyyy-MM-dd');
        this.listParams.writeOffEndTime = formatDateTimeByType(this.dateTime2[1], 'yyyy-MM-dd');
      } else {
        this.listParams.writeOffBeginTime = '';
        this.listParams.writeOffEndTime = '';
      }
      let res = await cardRecordPage(this.listParams);
      this.recordList = res.result.result;
      this.total = res.result.totalCount;
      this.recordLoading = false;
    },
    // 发送记录操作: 删除
    delData(row) {
      this.$confirm('是否销毁该卡券，一旦销毁无法恢复?', '提示', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        type: 'warning'
      })
        .then(_ => {
          coupcardDestroy({ coupLogId: row.coupLogId, memberId: row.memberId })
            .then(res => {
              this.$tips({ type: 'success', message: '销毁成功!' });
              this.cardRecordPage();
            })
            .catch(err => {
              this.$tips({ type: 'error', message: '销毁失败!' });
            });
        })
        .catch(() => {
          this.$tips({ type: 'info', message: '已取消销毁' });
        });
    },
    // 核销弹窗
    orderData(row) {
      this.cardOrderShow = true;
      this.currentObj = row;
    },
    // 导出记录
    exportReceivedRecordExcel() {
      this.dialogVisible = true;
      this.excelUrl = exportReceivedRecordExcel;
      if (this.dateTime) {
        this.listParams.beginTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
        this.listParams.endTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
      } else {
        this.listParams.beginTime = '';
        this.listParams.endTime = '';
      }
      if (this.dateTime2) {
        this.listParams.writeOffBeginTime = formatDateTimeByType(this.dateTime2[0], 'yyyy-MM-dd');
        this.listParams.writeOffEndTime = formatDateTimeByType(this.dateTime2[1], 'yyyy-MM-dd');
      } else {
        this.listParams.writeOffBeginTime = '';
        this.listParams.writeOffEndTime = '';
      }
      this.params = {
        search: this.listParams.search,
        beginTime: this.listParams.beginTime,
        endTime: this.listParams.endTime,
        writeOffBeginTime: this.listParams.writeOffBeginTime,
        writeOffEndTime: this.listParams.writeOffEndTime,
        cardStatus: this.listParams.cardStatus,
        sortBy: this.listParams.sortBy,
        requestProject: 'marketing'
      };
    },

    // 列表状态过滤器
    filterCardStatus(row) {
      let _content = '';
      if (row.status == 4) {
        let isOverdue = Date.now() >= row.limitTime;
        _content = `<div class="${isOverdue ? 'dm-status--info' : 'dm-status--primary'}">${isOverdue ? '已过期' : '待核销'}</div>`;
      } else if (row.status == 5) {
        _content = `<div class="dm-status--warning">已核销</div>`;
      } else if (row.status == 6) {
        _content = `<div class="dm-status--info">已过期</div>`;
      } else if (row.status == 7) {
        _content = `<div class="dm-status--error">已销毁</div>`;
      } else if (row.status == 8) {
        _content = `<div class="dm-status--info">已占用</div>`;
      }
      return _content;
    }
  }
};
</script>
