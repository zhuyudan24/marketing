<template>
  <el-dialog title="选择卡券" :visible.sync="show" width="800px" :before-close="close">
    <div class="pb10 clearfix">
      <div class="fl">
        <el-input v-model="listParams.searchParam" class="w200" placeholder="请输入卡券名/备注名" clearable @change="cardPageList"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
        <span class="fz12 gray">领取限制>1的卡券不支持选择，系统已过滤，符合条件共{{ total }}张。</span>
      </div>
      <div class="fr">
        <el-button type="primary" @click="add">新建卡券</el-button>
        <el-button @click="refresh">刷新列表</el-button>
      </div>
    </div>
    <el-table tooltipEffect="light" ref="multipleTable" :data="tableList" style="width: 100%;cursor:pointer;" @row-click="rowClick" v-loading="loading" @selection-change="handleSelectionChange">
      <el-table-column type="selection" align="center" label="选择"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" :min-width="100" align="left" prop="cardName" label="卡券名称"></el-table-column>
      <el-table-column :show-overflow-tooltip="true" :min-width="100" align="left" prop="subName" label="备注名"></el-table-column>
      <el-table-column prop="" label="有效期" :min-width="100" :show-overflow-tooltip="false">
        <template slot-scope="scope">
          <div v-if="scope.row.cardEffectiveMode == 0">固定日期：{{ formatDateTimeByType(scope.row.beginDate, 'yyyy-MM-dd') + '至' + formatDateTimeByType(scope.row.endDate, 'yyyy-MM-dd') }}</div>
          <div v-if="scope.row.cardEffectiveMode == 1">领取后{{ (scope.row.startDay === 0 ? '当' : scope.row.startDay) + '天，有效天数' + scope.row.limitDay }}天</div>
        </template>
      </el-table-column>
      <el-table-column prop="cardLimit" :show-overflow-tooltip="false" label="领取限制" width="90">
        <template slot-scope="scope">
          {{ scope.row.cardLimit }}张/人
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="false" :width="90" align="left" prop="storeMode" label="适用门店">
        <template slot-scope="scope">
          {{ scope.row.storeMode === 0 ? '所有门店' : scope.row.storeMode === 1 ? '部分分组' : '部分门店' }}
        </template>
      </el-table-column>
      <el-table-column :show-overflow-tooltip="false" :width="100" align="left" prop="couponStock" label="库存"></el-table-column>
    </el-table>
    <el-pagination v-show="tableList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[5, 10, 20, 30]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <span slot="footer" class="dialog-footer">
      <span class="pr10" v-show="multipleSelection.length > 0">已选择{{ multipleSelection.length }}张卡券</span>
      <el-button @click="close">取 消</el-button>
      <el-button type="primary" @click="submit">确 定</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { cardPageList, saveShelfCard } from '@/service/api/cardApi.js';
import { formatDateTimeByType, throttle } from '@/utils/index.js';
export default {
  name: 'shelf-add',
  props: {
    obj: {
      type: Object,
      default() {
        return {
          memberId: '',
          coupCardId: ''
        };
      }
    },
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      throttle,
      formatDateTimeByType,
      loading: false,
      listParams: {
        currentPage: 1,
        pageSize: 5,
        searchParam: '',
        sortBy: '',
        limitOne: 1,
        selected: 1,
        shelfId: this.$route.params.id
      },
      total: 0,
      tableList: [],
      multipleSelection: []
    };
  },
  watch: {
    selectedId(val) {
      this.$emit('submit-order', this.selectedId);
    },
    show(val) {
      if (val) this.cardPageList();
    }
  },
  methods: {
    rowClick(row, event, column) {
      this.$refs.multipleTable.toggleRowSelection(row);
    },
    handleSelectionChange(val) {
      this.multipleSelection = val;
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.cardPageList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.cardPageList();
    },
    async cardPageList() {
      this.loading = true;
      let res = await cardPageList(this.listParams);
      this.tableList = res.result.result;
      this.total = res.result.totalCount;
      this.loading = false;
    },
    close() {
      this.$emit('update:show', false);
    },
    // 提交添加
    submit() {
      if (this.multipleSelection.length === 0) {
        this.tips({ type: 'warning', message: '未选择卡券' });
      } else {
        saveShelfCard({ shelfId: this.$route.params.id, cardIds: this.multipleSelection.map(v => v.coupCardId) })
          .then(res => {
            if (res.errorCode === 0) {
              this.$tips({ type: 'success', message: '添加卡券成功' });
              this.close();
              this.$emit('refresh');
            } else {
              this.$tips({ type: 'error', message: '添加卡券失败' });
            }
          })
          .catch(err => {
            this.$tips({ type: 'error', message: '添加卡券失败' });
          });
      }
    },
    add() {
      window.open('/marketing/#/card/add');
    },
    refresh() {
      this.listParams.currentPage = 1;
      this.cardPageList();
    }
  },
  filters: {
    filterUseCondition(val) {
      var _useCondition = JSON.parse(val);
      return (typeof _useCondition.sale_limit === 'undefined' ? '' : (typeof _useCondition.sale_limit.fee === 'undefined' ? '' : '最低消费满' + _useCondition.sale_limit.fee + '；') + (typeof _useCondition.sale_limit.goods === 'undefined' ? '' : '消费指定商品' + _useCondition.sale_limit.goods + '；')) + (typeof _useCondition['goods'] === 'undefined' ? '' : (typeof _useCondition.goods.ok === 'undefined' ? '' : '适用商品（' + _useCondition.goods.ok + ')；') + (typeof _useCondition.goods.no === 'undefined' ? '' : '不适用商品（' + _useCondition.goods.no + ')；')) + (typeof _useCondition.only === 'undefined' ? '' : '不可与其他优惠共享');
    }
  }
};
</script>
