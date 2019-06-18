<template>
  <section class="dm-wrap">
    <div class="pb22 clearfix">
      <el-date-picker class="w250" v-model="dateTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="refresh"></el-date-picker>
      <el-input v-model="listParams.searchParam" class="w300" placeholder="订单号/门店名称/导购姓名" clearable @change="refresh"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button class="fr" type="primary" icon="iconfont icon-icon_yunxiazai fz14" @click="exportExcel"> 下载Excel</el-button>
    </div>
    <el-table tooltipEffect="light" :data="tableList" style="width: 100%" v-loading="loading">
      <el-table-column :show-overflow-tooltip="true" width="100" align="left" prop="createTime" label="操作时间">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm', true).y }}<br />
            <span>{{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm', true).h }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" min-width="120" align="left" prop="orderNumber" label="订单流水号">
        <template slot-scope="scope">
          <p class="gray">{{ scope.row.orderNumber || '--' }}</p>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" min-width="120" header-align="left" align="left" prop="memberId" label="会员信息">
        <template slot-scope="scope">
          <img class="vertical-middle table__avatar--40" :src="scope.row.thirdImgUrl || defaultAvatar" width="60" height="60" />
          <div class="inline-block vertical-middle">
            <p class="table-name--ellipsis">{{ scope.row.memberName || '--' }}</p>
            <p class="fz13 gray">{{ scope.row.cardNum || '--' }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" width="140" align="left" prop="storeName" label="门店名称">
        <template slot-scope="scope">
          <p>{{ scope.row.storeName }}</p>
          <p class="gray">{{ scope.row.areaName }}</p>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" min-width="120" header-align="left" align="left" prop="clerkId" label="导购姓名">
        <template slot-scope="scope">
          <img class="vertical-middle table__avatar--40" :src="scope.row.imageUrl || defaultAvatar" width="60" height="60" />
          <div class="inline-block vertical-middle">
            <p class="table-name--ellipsis">{{ scope.row.clerkName || '--' }}</p>
            <p class="fz13 gray">{{ scope.row.storeName || '--' }}</p>
          </div>
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="false" width="120" align="left" prop="differenceValue" label="差额">
        <template slot-scope="scope">
          {{ (scope.row.differenceValue >= 0 ? ' +' : '-') + '￥' + Math.abs(parseInt(scope.row.differenceValue)).toFixed(2) }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="true" min-width="120" align="left" prop="errorMsg" label="错误原因"></el-table-column>
      <el-table-column width="100" align="left" prop="orderRemarks" label="备注内容">
        <template slot-scope="scope">
          <el-popover placement="top-start" title="备注内容" width="200" trigger="hover">
            <span class="break-word">{{ scope.row.orderRemarks }}</span>
            <el-button slot="reference" type="text">备注</el-button>
          </el-popover>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <vue-gic-export-excel :dialogVisible.sync="dialogVisible" :dataArr="tableList" :type="2" :excelUrl="excelUrl" :params="params" :projectName="projectName"></vue-gic-export-excel>
  </section>
</template>
<script>
import { coupcardCheckList, exportCoupcardCheckExcel } from '@/service/api/cardApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import talbeMethods from '@/mixins/tableMethods.js';
import filterAvater from '@/mixins/filterAvater.js';

export default {
  name: 'card-check',
  mixins: [talbeMethods, filterAvater],
  data() {
    return {
      formatDateTimeByType,
      dateTime: [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()],
      listParams: {
        beginTime: '',
        endTime: '',
        searchParam: '',
        currentPage: 1,
        pageSize: 20
      },
      total: 0,
      loading: false,
      tableList: [],
      projectName: 'marketing', // 当前项目名
      dialogVisible: false,
      excelUrl: '', // 下载数据的地址
      params: {} // 传递的参数
    };
  },
  created() {
    this.getTableList();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '卡券营销', path: '' }, { name: '核销纠错', path: '' }]);
  },
  methods: {
    // 加载列表
    async getTableList() {
      this.loading = true;
      this.dataTimeFormat();
      try {
        let res = await coupcardCheckList(this.listParams);
        this.tableList = res.result.result || [];
        this.total = res.result.totalCount || 0;
      } catch (err) {
        this.$tips({ type: 'error', message: '加载列表失败' });
      }
      this.loading = false;
    },
    // 导出列表
    exportExcel() {
      this.dialogVisible = true;
      this.excelUrl = exportCoupcardCheckExcel;
      this.dataTimeFormat();
      this.params = {
        searchParam: this.listParams.searchParam,
        beginTime: this.listParams.beginTime,
        endTime: this.listParams.endTime,
        requestProject: 'marketing'
      };
    },
    /**-------辅助方法---------- */
    dataTimeFormat() {
      if (this.dateTime) {
        this.listParams.beginTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
        this.listParams.endTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
      } else {
        this.listParams.beginTime = '';
        this.listParams.endTime = '';
      }
    }
  }
};
</script>
