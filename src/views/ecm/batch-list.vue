<template>
  <section class="dm-wrap">
    <div class="pb22 clearfix">
      <el-date-picker class="w250" v-model="dateTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="search"></el-date-picker>
      <el-select class="dm-select" clearable v-model="listParams.type" placeholder="选择上线状态" @change="search">
        <el-option v-for="(v, i) in typeOptions" :key="i" :label="v.label" :value="v.value"></el-option>
      </el-select>
      <el-input v-model="listParams.title" class="w200" placeholder="输入营销内容标题" clearable @change="search"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
    </div>
    <el-table tooltipEffect="light" :data="tableList" style="width: 100%" v-loading="loading" element-loading-text="拼命加载中">
      <el-table-column v-for="(v, i) in tableHeader" :fixed="v.fixed" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter">
        <template slot-scope="scope">
          <span v-if="v.formatter" v-html="v.formatter(scope.row)"></span>
          <component v-else-if="v.component" :is="v.component"></component>
          <span v-else>{{ scope.row[v.prop] }}</span>
        </template>
      </el-table-column>
      <el-table-column label="批次时间" align="left" width="120" prop="execTime">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ formatDateTimeByType(scope.row.execTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
            <span>{{ formatDateTimeByType(scope.row.execTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="220" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="toDialog(scope.row)">批次人数</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <batch-dialog :show.sync="dialogShow" :id="dialogId" :execTime="dialogExecTime" :ecmPlanName="dialogEcmPlanName"></batch-dialog>
  </section>
</template>
<script>
import { ecmBatchSendInfos } from '@/service/api/ecmApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import batchDialog from './batch-dialog';

export default {
  name: 'ecm-batch-list',
  components: {
    'batch-dialog': batchDialog
  },
  data() {
    let that = this;
    return {
      dateTime: [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()],
      typeOptions: [{ value: '', label: '所有营销方式' }, { value: 'teletext', label: '图文' }, { value: 'text', label: '文本' }, { value: 'image', label: '图片' }, { value: 'card', label: '卡券' }, { value: 'wxa', label: '小程序' }, { value: 'message', label: '短信' }, { value: 'teltask', label: '话务' }],
      listParams: {
        ecmPlanId: this.$route.params.id,
        beginTime: '',
        endTime: '',
        type: '',
        title: '',
        currentPage: 1,
        pageSize: 20
      },
      total: 0,
      loading: false,
      tableHeader: [
        // {
        //   label: '批次时间',
        //   prop: 'execTime',
        //   minWidth: '150',
        //   align: 'left',
        //   fixed: 'left',
        //   formatter(row) {
        //     const date = formatDateTimeByType(row.execTime, 'yyyy-MM-dd-HH-mm', true);
        //     return date.y + '\n' + date.h;
        //     // return formatDateTimeByType(row.execTime, 'yyyy-MM-dd-HH-mm');
        //   }
        // },
        {
          label: '营销方式',
          prop: 'marketingType',
          minWidth: '200',
          align: 'left',
          formatter(row) {
            let result = '--';
            that.typeOptions.map(v => {
              if (v.value === row.marketingType) {
                result = v.label;
              }
            });
            return result;
          }
        },
        { label: '营销内容', prop: 'title', minWidth: '160', align: 'left', fixed: 'left' },
        { label: '批次人次', prop: 'totalCount', width: '160', align: 'left' },
        { label: '预计发送人次', prop: 'filterCount', width: '160', align: 'left' },
        { label: '实际送达人次', prop: 'successCount', width: '160', align: 'left' }
      ],
      tableList: [],
      dialogShow: false,
      dialogId: '',
      dialogExecTime: '',
      dialogEcmPlanName: ''
    };
  },
  created() {
    this.ecmBatchSendInfos();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '智能营销', path: '/ecm' }, { name: this.$route.params.name + ' - 批次记录', path: '' }]);
    this.$store.commit(
      'mutations_layoutTips',
      `<div class="layout--tips">
            <i class="el-icon-info"></i>
            历史数据限制：2018年11月15日之前的历史营销计划，没有详细数据
        </div>
      `
    );
    setTimeout(_ => {
      this.$store.commit('mutations_layoutTips', '');
    }, 5000);
  },
  beforeDestroy() {
    this.$store.commit('mutations_layoutTips', '');
  },
  methods: {
    formatDateTimeByType,
    search() {
      this.listParams.currentPage = 1;
      this.ecmBatchSendInfos();
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.ecmBatchSendInfos();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.ecmBatchSendInfos();
    },
    async ecmBatchSendInfos() {
      this.loading = true;
      if (this.dateTime) {
        this.listParams.beginTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
        this.listParams.endTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
      } else {
        this.listParams.beginTime = this.listParams.senendTimedEndTime = '';
      }
      let res = await ecmBatchSendInfos(this.listParams);
      console.log(res);
      this.tableList = res.result.result || [];
      this.total = res.result.totalCount;
      this.loading = false;
    },
    //批次人数
    toDialog(row) {
      this.dialogShow = true;
      this.dialogId = row.ecmPlanQuartzLogId;
      this.dialogEcmPlanName = this.$route.params.name;
      this.dialogExecTime = formatDateTimeByType(row.execTime, 'yyyy-MM-dd-HH-mm-ss');
      console.log(this.dialogId);
    }
  }
};
</script>
