<template>
  <section class="dm-wrap">
    <div class="pb22">
      <store-group class="w200 pr4" :model="currentData" @commit-store="storeChange"></store-group>
      <el-input class="w300" v-model="listParams.searchParam" clearable placeholder="输入门店名称/代码/地区名" @change="refresh"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
    </div>
    <el-table tooltipEffect="light" :data="tableList" style="width: 100%" v-loading="loading" @sort-change="sortList">
      <el-table-column min-width="120" align="left" prop="shelfName" label="门店名称">
        <template slot-scope="scope">
          <p>{{ scope.row.shelfName }}</p>
          <p class="fz13 gray">{{ scope.row.addressFullName }}</p>
        </template>
      </el-table-column>
      <el-table-column min-width="100" align="left" prop="storeGroupFullName" label="所在分组" sortable="custom"></el-table-column>
      <el-table-column width="120" align="left" prop="cardSize" label="卡券数量" sortable="custom"></el-table-column>
      <el-table-column width="120" align="left" prop="getedQuantity" label="领取数量" sortable="custom"></el-table-column>
      <el-table-column width="120" align="left" prop="usageQuantity" label="使用数量" sortable="custom"></el-table-column>
      <el-table-column width="120" align="left" prop="col4" label="核销率" sortable="custom">
        <template slot-scope="scope">
          {{ ((scope.row.usageQuantity * 100) / (scope.row.getedQuantity === 0 ? 1 : scope.row.getedQuantity)).toFixed(2) }}%
        </template>
      </el-table-column>
      <el-table-column width="120" align="left" prop="saleAmount" label="销售额" sortable="custom"></el-table-column>
      <el-table-column label="操作" align="left" width="160px" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" @click="$router.push('/card/shelf/' + scope.row.shelfId)">卡券管理</el-button>
          <el-button type="text" @click="$router.push('/card/shelfanalysis/' + scope.row.shelfId)">查看报表</el-button>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
  </section>
</template>
<script>
import { pageCardShelfs } from '@/service/api/cardApi.js';
import storeGroup from '@/components/storeGroup/index';
import tableMethods from '@/mixins/tableMethods.js';
export default {
  name: 'card-record-send',
  mixins: [tableMethods],
  data() {
    return {
      loading: false,
      tableList: [],
      listParams: {
        sortBy: '',
        searchParam: '',
        storeGroupId: '',
        currentPage: 1,
        pageSize: 20
      },
      total: 0,
      currentData: { label: '', id: '' }
    };
  },
  components: {
    storeGroup
  },
  created() {
    this.getTableList();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '卡券营销', path: '' }, { name: '卡券展架', path: '' }]);
  },
  methods: {
    //门店回调
    storeChange(val) {
      console.log(val);
      this.currentData = val;
      if (val.id) {
        this.listParams.storeGroupId = val.id;
        this.refresh();
      }
    },
    async getTableList() {
      this.loading = true;
      try {
        let res = await pageCardShelfs(this.listParams);
        this.tableList = res.result.result || [];
        this.total = res.result.totalCount || 0;
        this.loading = false;
      } catch (err) {
        console.log(err);
      }
    },
    //列表 排序
    sortList(obj) {
      this.listParams.sortBy = obj.order === 'descending' ? obj.prop + ' desc' : obj.prop;
      this.getTableList();
    }
  }
};
</script>
