<template>
  <el-dialog title="趋势详情" :visible.sync="show" width="70%" :before-close="close">
    <store-group width="240" class="pb22" :model="storeGroupData" @commit-store="getStoreGroup"></store-group>
    <el-table tooltipEffect="light" :data="tableList" height="350" style="width: 100%" v-loading="loading" @sort-change="sortList">
      <el-table-column :show-overflow-tooltip="true" :min-width="140" align="left" prop="storeName" label="门店名称">
        <template slot-scope="scope">
          <p style="line-height:22px;">{{ scope.row.storeName || '--' }}</p>
          <p class="fz13 gray" style="line-height:20px;">{{ scope.row.areaName || '--' }}</p>
        </template>
      </el-table-column>
      <el-table-column v-for="(v, i) in tableHeader" :sortable="v.sortable" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter"></el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">关 闭</el-button>
    </span>
  </el-dialog>
</template>
<script>
import storeGroup from '@/components/storeGroup';
import { storeEvaluateDetail } from '@/service/api/evaluationApi.js';
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
  computed: {
    storeObj(val) {
      return this.$store.state.marketing.storeObj;
    }
  },
  watch: {
    show: {
      handler(val) {
        if (val) {
          this.listParams.currentStoreGroupId = this.id;
          this.storeEvaluateDetail();
        }
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
      tableHeader: [
        { label: '评价总数', prop: 'evaluateCount', sortable: 'custom', width: '120', align: 'left' },
        {
          label: '评价率',
          prop: 'pjl',
          width: '100',
          sortable: 'custom',
          tooltip: true,
          align: 'left',
          formatter(row) {
            return (row.pjl ? Number(row.pjl).toFixed(2) : '0.00') + '%';
          }
        },
        {
          label: '好评率',
          prop: 'hpl',
          width: '100',
          sortable: 'custom',
          tooltip: true,
          align: 'left',
          formatter(row) {
            return (row.hpl ? Number(row.hpl).toFixed(2) : '0.00') + '%';
          }
        },
        { label: '不良评价数', prop: '_badCount', width: '120', sortable: 'custom', align: 'left' }
      ],
      tableList: [],
      total: 0
    };
  },
  methods: {
    getStoreGroup(val) {
      this.listParams.currentStoreGroupId = val.storeGroupId;
      this.storeEvaluateDetail();
    },
    close() {
      this.$emit('update:show', false);
    },
    async storeEvaluateDetail() {
      this.loading = true;
      let res = await storeEvaluateDetail(this.listParams);
      this.tableList = res.result.result || [];
      this.total = res.result.totalCount;
      this.loading = false;
      console.log(res);
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.storeEvaluateDetail();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.storeEvaluateDetail();
    },
    //列表 排序
    sortList(obj) {
      this.listParams.sortType = obj.order === 'ascending' ? 'asc' : 'desc';
      this.listParams.storeDetailSortName = obj.prop || '';
      if (obj.prop === '_badCount') {
        this.listParams.storeDetailSortName = 'badCount';
      }
      this.storeEvaluateDetail();
    }
  }
};
</script>
