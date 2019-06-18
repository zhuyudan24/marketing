<template>
  <section class="dm-wrap">
    <div class="game-ptyx-header pb10 clearfix">
      <span class="pr10">卡券共{{ total }}张</span>
      <el-input v-model="listParams.searchParam" class="w200" placeholder="输入名称/备注" clearable @change="cardPageList"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button class="fr" type="primary" @click="shelfAddShow = true">添加卡券</el-button>
    </div>
    <ul class="clearfix" v-loading="loading" element-loading-text="拼命加载中">
      <card-item :item="v" v-for="(v, i) in tableList" :shelfFlag="true" :key="i" @del-shelf="delShelf"></card-item>
    </ul>
    <div class="text-center" v-if="tableList.length === 0">
      <img class="block block-center pt100" width="60" height="60" src="../../assets/img/no-data_icon.png" alt="" />
      <el-button class="block block-center mt10" type="text" @click="shelfAddShow = true">添加卡券</el-button>
    </div>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <shelf-add :show.sync="shelfAddShow" @refresh="cardPageList"></shelf-add>
  </section>
</template>
<script>
import { cardPageList, deleteShelfCard } from '@/service/api/cardApi.js';
import cardItem from './partials/card-item';
import shelfAdd from './partials/shelf-add';
import tableMethods from '@/mixins/tableMethods.js';
export default {
  name: 'card-manager',
  mixins: [tableMethods],
  data() {
    return {
      listParams: {
        shelfId: this.$route.params.id,
        sortBy: '',
        searchParam: '',
        currentPage: 1,
        pageSize: 20
      },
      total: 0,
      loading: false,
      tableList: [],
      shelfAddShow: false
    };
  },
  components: {
    'card-item': cardItem,
    'shelf-add': shelfAdd
  },
  created() {
    this.getTableList();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '卡券营销', path: '' }, { name: '卡券展架', path: '/card/shelf' }, { name: '卡券展架管理', path: '' }]);
  },
  methods: {
    // 加载列表
    async getTableList() {
      this.loading = true;
      try {
        let res = await cardPageList(this.listParams);
        this.tableList = res.result.result || [];
        this.total = res.result.totalCount;
      } catch (err) {
        this.$tips({ type: 'error', message: '加载列表失败' });
      }
      this.loading = false;
    },
    //移除卡券
    delShelf(obj) {
      this.$confirm('是否移除该卡券?', '提示', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        type: 'warning'
      })
        .then(() => {
          deleteShelfCard({ shelfId: this.$route.params.id, coupCardId: obj.coupCardId }).then(res => {
            if (res.errorCode === 0) {
              this.$tips({ type: 'success', message: '删除成功' });
              this.getTableList();
            } else {
              this.$tips({ type: 'error', message: '删除失败' });
            }
          });
        })
        .catch(() => {
          this.$tips({ type: 'info', message: '已取消删除' });
        });
    }
  }
};
</script>
