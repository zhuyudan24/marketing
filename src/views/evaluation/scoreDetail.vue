<template>
  <el-dialog title="门店评分" :visible.sync="show" width="70%" :before-close="close">
    <store-group width="240" class="pb22" :model="storeGroupData" @commit-store="getStoreGroup"></store-group>
    <el-table tooltipEffect="light" :data="tableList" height="350" style="width: 100%" v-loading="loading" @sort-change="sortList">
      <el-table-column :show-overflow-tooltip="true" :min-width="140" align="left" prop="storeName" label="门店名称">
        <template slot-scope="scope">
          <p v-if="scope.row.totalCount" class="primary-color">{{ scope.row.totalCount }}</p>
          <div v-else>
            <p style="line-height:22px;">{{ scope.row.storeName || '--' }}</p>
            <p class="fz12 gray" style="line-height:20px;">{{ scope.row.areaName || '--' }}</p>
          </div>
        </template>
      </el-table-column>

      <el-table-column :width="130" align="left" prop="evaluateCount" label="累计评价次数">
        <template slot-scope="scope">
          <p :class="{ 'primary-color': !!scope.row.totalCount }">{{ scope.row.evaluateCount }}</p>
        </template>
      </el-table-column>
      <el-table-column :width="110" sortable="custom" align="left" prop="fwtdAvg" label="服务态度">
        <template slot-scope="scope">
          <p :class="{ 'primary-color': !!scope.row.totalCount }">{{ scope.row.fwtdAvg ? Number(scope.row.fwtdAvg).toFixed(2) : '0.00' }}</p>
        </template>
      </el-table-column>
      <el-table-column :width="110" sortable="custom" align="left" prop="zycdAvg" label="专业程度">
        <template slot-scope="scope">
          <p :class="{ 'primary-color': !!scope.row.totalCount }">{{ scope.row.zycdAvg ? Number(scope.row.zycdAvg).toFixed(2) : '0.00' }}</p>
        </template>
      </el-table-column>
      <el-table-column :width="110" sortable="custom" align="left" prop="mdhjAvg" label="门店环境">
        <template slot-scope="scope">
          <p :class="{ 'primary-color': !!scope.row.totalCount }">{{ scope.row.mdhjAvg ? Number(scope.row.mdhjAvg).toFixed(2) : '0.00' }}</p>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">关 闭</el-button>
    </span>
  </el-dialog>
</template>
<script>
import storeGroup from '@/components/storeGroup';
import { storeScoreDetail } from '@/service/api/evaluationApi.js';
export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    id: {
      type: String,
      default: ''
    }
  },
  components: {
    storeGroup
  },
  watch: {
    show(val) {
      if (val) {
        this.listParams.currentStoreGroupId = this.id;
        this.storeScoreDetail();
      }
    }
  },
  data() {
    return {
      storeGroupData: {},
      loading: false,
      listParams: {
        currentPage: 1,
        pageSize: 20,
        storeDetailSortName: '',
        ortType: '',
        currentStoreGroupId: '',
        isBad: 0
      },
      tableList: [],
      total: 0
    };
  },
  methods: {
    getStoreGroup(val) {
      this.listParams.currentStoreGroupId = val.storeGroupId || '';
      this.storeScoreDetail();
    },
    close() {
      this.$emit('update:show', false);
    },
    async storeScoreDetail() {
      this.loading = true;
      this.tableList = [];
      let res = await storeScoreDetail(this.listParams);
      this.tableList = res.result.result || [];
      this.total = res.result.totalCount;
      this.tableList.unshift({
        totalCount: '总计：' + this.tableList.length + '家',
        evaluateCount: res.result.params.totalCountValue,
        fwtdAvg: res.result.params.fwtdValue.toFixed(2),
        zycdAvg: res.result.params.zycdValue.toFixed(2),
        mdhjAvg: res.result.params.mdhjValue.toFixed(2)
      });
      this.loading = false;
      console.log(res);
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.storeScoreDetail();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.storeScoreDetail();
    },
    //列表 排序
    sortList(obj) {
      this.listParams.sortType = obj.order === 'ascending' ? 'asc' : 'desc';
      this.listParams.storeDetailSortName = obj.prop || '';
      if (obj.prop === '_badCount') {
        this.listParams.storeDetailSortName = 'badCount';
      }
      this.storeScoreDetail();
    }
  }
};
</script>
