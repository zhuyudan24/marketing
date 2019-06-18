<template>
  <section class="card-record-send">
    <div class="pb22">
      <el-input class="w300" v-model="listParams.search" placeholder="输入卡券名称/备注名/活动名" @change="refresh"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
    </div>
    <el-table tooltipEffect="light" :data="recordList" style="width: 100%" row-key="putonTime" v-loading="loading">
      <el-table-column width="120" align="left" prop="putonTime" label="投放时间" fixed="left">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ formatDateTimeByType(scope.row.putonTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
            <span>{{ formatDateTimeByType(scope.row.putonTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column min-width="120" align="left" prop="cardName" label="卡券名称">
        <template slot-scope="scope">
          <p style="line-height:22px;">{{ scope.row.cardName }}</p>
          <p class="fz13 gray" style="line-height:20px;">{{ scope.row.subName }}</p>
        </template>
      </el-table-column>
      <el-table-column v-for="(v, i) in recordHeader" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter"></el-table-column>
      <el-table-column width="150" align="left" prop="cardName" label="状态">
        <template slot-scope="scope">
          <div v-if="scope.row.putonStatus === 2"><span class="dm-status--primary--flash"></span><span>正在发送</span></div>
          <span v-else :class="'dm-status--' + filterStatus(scope.row.putonStatus).type">{{ filterStatus(scope.row.putonStatus).label }}</span>
          <div v-if="scope.row.putonStatus === 1">
            <time-counts class="primary-color fz12" :defaultVal="scope.row.putonTime" :autoStart="true"></time-counts>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="left" width="150px" fixed="right">
        <template slot-scope="scope">
          <el-button type="text" v-if="scope.row.putonStatus === 2 || scope.row.putonStatus === 3" @click="$router.push('/card/groupinfo/' + scope.row.putonId)">详情</el-button>
          <el-button type="text" v-if="scope.row.putonStatus !== 2 && scope.row.putonStatus !== 3" @click="$router.push('/card/groupsend/' + scope.row.putonId)">编辑</el-button>
          <el-button type="text" v-if="scope.row.putonTime > nowDate" @click="$router.push('/card/record/sendInfo/' + scope.row.putonId)">记录</el-button>
          <dm-delete v-if="scope.row.putonStatus !== 2" @confirm="delData(scope.row)" tips="是否删除该投放记录?">
            <el-button type="text">删除</el-button>
          </dm-delete>
        </template>
      </el-table-column>
    </el-table>
    <el-pagination v-show="recordList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
  </section>
</template>
<script>
import { cardRecordPage, deleteCardPuton } from '@/service/api/cardApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import timeCounts from '@/components/timeCount/index.vue';
import tableMethods from '@/mixins/tableMethods.js';

const nowDate = new Date('2019-05-24 00:00:00'); // 该日期之前无操作-记录按钮
export default {
  name: 'record-send',
  mixins: [tableMethods],
  components: {
    timeCounts
  },
  data() {
    return {
      nowDate,
      formatDateTimeByType,
      loading: false,
      recordList: [],
      recordHeader: [
        { label: '活动名称', prop: 'putonName', minWidth: 120, tooltip: true, align: 'left' },
        { label: '投放人数', prop: 'issuingQuantity', width: '100', align: 'left' },
        { label: '领取数量', prop: 'getedQuantity', width: '100', align: 'left' },
        {
          label: '领取率',
          prop: 'getedQuantity',
          width: '100',
          align: 'left',
          formatter(row) {
            return ((row.getedQuantity * 100) / (row.issuingQuantity === 0 ? 1 : row.issuingQuantity)).toFixed(2) + '%';
          }
        },
        { label: '使用数量', prop: 'usageQuantity', width: '100', align: 'left' },
        {
          label: '核销率',
          prop: 'usageQuantity',
          width: '100',
          align: 'left',
          formatter(row) {
            return ((row.usageQuantity * 100) / (row.getedQuantity === 0 ? 1 : row.getedQuantity)).toFixed(2) + '%';
          }
        },
        { label: '销售额', prop: 'saleAmount', width: '100', align: 'left' }
      ],
      listParams: {
        beginTime: '',
        endTime: '',
        cardStatus: '',
        recordType: 0,
        search: '',
        currentPage: 1,
        pageSize: 20
      },
      total: 0
    };
  },
  created() {
    this.$store.commit(
      'mutations_layoutTips',
      `<div class="layout--tips">
          <i class="el-icon-info"></i>
          历史数据限制：${formatDateTimeByType(nowDate, 'yyyy-MM-dd')}之前的卡券投放计划未保存详细投放录。
      </div>
    `
    );
    this.getTableList();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '卡券营销', path: '' }, { name: '卡券记录', path: '' }, { name: '投放记录', path: '' }]);
  },
  beforeDestroy() {
    this.$store.commit('mutations_layoutTips', '');
  },
  methods: {
    //获取列表
    getTableList() {
      this.loading = true;
      cardRecordPage(this.listParams).then(res => {
        if (res.errorCode === 0) {
          this.recordList = res.result.result;
          this.total = res.result.totalCount;
        }
        this.loading = false;
      });
    },
    //发送记录操作: 删除
    delData(row) {
      deleteCardPuton({ putonId: row.putonId })
        .then(res => {
          if (res.errorCode === 0) {
            this.$tips({ type: 'success', message: '删除成功!' });
            if (this.recordList.length === 1 && this.listParams.currentPage !== 1) {
              this.listParams.currentPage--;
            }
            this.getTableList();
          } else {
            this.$tips({ type: 'error', message: '删除失败!' });
          }
        })
        .catch(err => {
          this.$tips({ type: 'error', message: '删除失败!' });
        });
    },
    filterStatus(val) {
      let result = { label: '执行错误', type: 'danger' };
      switch (val) {
        case 1:
          result = { label: '待发送', type: 'warning' };
          break;
        case 2:
          result = { label: '正在发送', type: 'primary--flash' };
          break;
        case 3:
          result = { label: '已发送', type: 'success' };
          break;
        case 4:
          result = { label: '无接收人', type: 'info' };
          break;
        case 5:
          result = { label: '库存不足', type: 'info' };
          break;
        default:
          result = { label: '投放错误', type: 'danger' };
          break;
      }
      return result;
    }
  }
};
</script>
