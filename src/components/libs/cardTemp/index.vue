<template>
  <section class="sms-lib">
    <div class="clearfix" :class="pbSize">
      <div class="fl">
        <el-input v-model="listParams.searchParam" class="w200" clearable placeholder="请输入卡券名/备注名" @change="getCardList"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
        <span class="fz12 gray">{{ limitTips }}{{ total }}张。 </span>
      </div>
      <div class="fr">
        <el-button type="primary" @click="add">新建卡券</el-button>
        <el-button @click="refresh">刷新列表</el-button>
      </div>
    </div>
    <el-table tooltipEffect="light" :data="tableList" :height="tableHeight" style="width: 100%" v-loading="loading" @row-click="chooseCard">
      <el-table-column :show-overflow-tooltip="false" width="60" align="center" prop="coupCardId">
        <template slot-scope="scope">
          <div class="sms-record_left label-hidden">
            <el-radio v-if="cardIdName === 'wechatCardId'" v-model="selectedId" :label="scope.row.wechatCardId" class="pr10"></el-radio>
            <el-radio v-else v-model="selectedId" :label="scope.row.coupCardId" class="pr10"></el-radio>
          </div>
        </template>
      </el-table-column>
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
    <el-pagination v-show="tableList.length && showPagination" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, prev, pager, next" :total="total"></el-pagination>
  </section>
</template>

<script>
import { getCardList } from '@/service/api/commonApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
export default {
  props: {
    activeId: {
      type: String,
      default: ''
    },
    pbSize: {
      type: String,
      default: 'pb22'
    },
    cardIdName: {
      type: String,
      default: 'coupCardId'
    },
    tableHeight: {
      type: String,
      default: 'auto'
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    cardLimitType: {
      type: Number,
      default: 1
    },
    pageSize: {
      type: Number,
      default: 20
    }
  },
  computed: {
    limitTips() {
      if (this.cardLimitType === 2) {
        return '领取限制领取1~100的卡券，系统已过滤，符合条件共';
      } else if (this.cardLimitType === 3) {
        return '领取限制领取<100的卡券不支持选择，系统已过滤，符合条件共';
      } else {
        return '领取限制>1的卡券不支持选择，系统已过滤，符合条件共';
      }
    }
  },
  data() {
    return {
      formatDateTimeByType,
      listParams: {
        searchParam: '',
        currentPage: 1,
        pageSize: this.pageSize,
        requestProject: 'gic-web',
        cardLimitType: this.cardLimitType,
        cardType: ''
      },
      total: 0,
      tableList: [],
      selectedId: this.activeId
    };
  },
  watch: {
    selectedId(val) {
      let obj = {};
      if (this.cardIdName === 'wechatCardId') {
        this.tableList.map(v => {
          if (v.coupCardId === val) {
            val = v.wechatCardId;
            obj = v;
          }
        });
      } else {
        this.tableList.map(v => {
          if (v.coupCardId === val) {
            obj = v;
          }
        });
      }

      this.$emit('update:activeId', val);
      this.$emit('emitActiveObj', obj);
    },
    activeId(val) {
      this.selectedId = val;
    }
  },
  created() {
    this.selectedId = this.activeId;
    this.getCardList();
  },
  methods: {
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.getCardList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.getCardList();
    },
    async getCardList() {
      this.loading = true;
      let res = await getCardList(this.listParams);
      this.tableList = res.result.result || [];
      this.total = res.result.totalCount;
      this.loading = false;
    },
    reset() {
      this.listParams.searchParams = '';
      this.getCardList();
    },
    chooseCard(row) {
      this.selectedId = row.coupCardId;
      // eslint-disable-next-line
      $bus.$emit('card-temp-choose', row);
    },
    add() {
      window.open('/marketing/#/card/add');
    },
    refresh() {
      this.listParams.currentPage = 1;
      this.getCardList();
    }
  }
};
</script>
