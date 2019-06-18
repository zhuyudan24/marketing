<template>
  <section class="dm-wrap">
    <div class="game-ptyx-header pb10 clearfix">
      <span class="pr10">卡券共{{ total }}张</span>
      <el-button-group class="vertical-middle pr4">
        <el-button @click="sortList('col1')">创建时间<i class="el-icon--right" :class="listParams.sortBy === 'col1' ? 'el-icon-caret-top' : listParams.sortBy === 'col1 desc' ? 'el-icon-caret-bottom' : 'el-icon-d-caret'"></i></el-button>
        <el-button @click="sortList('col2')">领取量<i class="el-icon--right" :class="listParams.sortBy === 'col2' ? 'el-icon-caret-top' : listParams.sortBy === 'col2 desc' ? 'el-icon-caret-bottom' : 'el-icon-d-caret'"></i></el-button>
        <el-button @click="sortList('col3')">使用量<i class="el-icon--right" :class="listParams.sortBy === 'col3' ? 'el-icon-caret-top' : listParams.sortBy === 'col3 desc' ? 'el-icon-caret-bottom' : 'el-icon-d-caret'"></i></el-button>
        <el-button @click="sortList('col4')">核销率<i class="el-icon--right" :class="listParams.sortBy === 'col4' ? 'el-icon-caret-top' : listParams.sortBy === 'col4 desc' ? 'el-icon-caret-bottom' : 'el-icon-d-caret'"></i></el-button>
        <el-button @click="sortList('col5')">核销额<i class="el-icon--right" :class="listParams.sortBy === 'col5' ? 'el-icon-caret-top' : listParams.sortBy === 'col5 desc' ? 'el-icon-caret-bottom' : 'el-icon-d-caret'"></i></el-button>
      </el-button-group>
      <el-select class="dm-select" v-model="listParams.cardType" placeholder="选择卡券类型" @change="refresh">
        <el-option v-for="(item, index) in cardTypeOptions" :key="index" :label="item.label" :value="item.value"></el-option>
      </el-select>
      <el-input v-model="listParams.searchParam" class="w200 vertical-middle" placeholder="输入卡券名称/备注" clearable @change="refresh"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button class="fr" type="primary" @click="$router.push('/card/add')">新增卡券</el-button>
    </div>
    <ul class="clearfix" v-loading="loading" element-loading-text="拼命加载中">
      <card-item @adjust-stock="preAdjustStock" :item="v" v-for="(v, i) in tableList" :key="i" @delete-card="delData"></card-item>
    </ul>
    <div class="text-center" v-if="tableList.length === 0">
      <img class="block block-center pt100" width="60" height="60" src="../../assets/img/no-data_icon.png" alt="" />
      <el-button class="block block-center mt10" type="text" @click="$router.push('/card/add')">新增卡券</el-button>
    </div>
    <adjust-stock :show.sync="adjustStock" :totalCount="currentCard.couponStock" :coupCardId="currentCard.coupCardId" @refresh="delayRefresh"></adjust-stock>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
  </section>
</template>
<script>
import { cardPageList, deleteCard } from '@/service/api/cardApi.js';
import adjustStock from './partials/adjust-Stock';
import cardItem from './partials/card-item';
import tableMethods from '@/mixins/tableMethods.js';
export default {
  name: 'card-list',
  mixins: [tableMethods],
  data() {
    return {
      listParams: {
        shelfId: '',
        sortBy: '',
        searchParam: '',
        currentPage: 1,
        pageSize: 20,
        cardType: ''
      },
      total: 0,
      loading: false,
      tableList: [],
      cardTypeOptions: [{ value: '', label: '全部卡券类型' }, { value: 0, label: '抵金券' }, { value: 1, label: '折扣券' }, { value: 2, label: '兑换券' }],
      sortFlag: false,
      adjustStock: false,
      currentCard: {}
    };
  },
  components: {
    'adjust-stock': adjustStock,
    'card-item': cardItem
  },
  created() {
    window.scrollTo(0, 0);
    this.getTableList();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '卡券营销', path: '' }, { name: '卡券库', path: '' }]);
  },
  methods: {
    //编辑库存 前置
    preAdjustStock(val) {
      this.currentCard = val;
      this.adjustStock = true;
    },
    //修改库存后台异步  所以这边延迟刷新列表
    delayRefresh(val) {
      this.currentCard.couponStock = val;
    },
    sortList(val) {
      this.sortFlag = !this.sortFlag;
      this.listParams.sortBy = this.sortFlag ? val + ' desc' : val;
      this.refresh();
    },
    async getTableList() {
      this.loading = true;
      try {
        let res = await cardPageList(this.listParams);
        this.tableList = res.result.result;
        this.total = res.result.totalCount;
      } catch (err) {
        this.$tips({ type: 'error', message: '加载列表失败' });
      }
      this.loading = false;
    },
    delData(val) {
      this.$confirm('是否删除该卡券?', '提示', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.deleteCard(val);
        })
        .catch(() => {
          this.$tips({ type: 'info', message: '已取消删除' });
        });
    },
    async deleteCard(coupCardId) {
      await deleteCard({ coupCardId });
      this.$tips({ type: 'success', message: '删除成功!' });
      if (this.tableList.length === 1 && this.listParams.currentPage !== 1) {
        this.listParams.currentPage--;
      }
      this.getTableList();
    }
  }
};
</script>
