<template>
  <section class="dm-wrap">
    <div class="pb22 clearfix">
      <el-select class="dm-select" v-model="listParams.prizeReferType" placeholder="选择领取状态" @change="klflReportList">
        <el-option v-for="(v, i) in prizeReferTypeOptions" :key="i" :label="v.label" :value="v.value"></el-option>
      </el-select>
      <el-select class="dm-select" v-model="listParams.getStatus" placeholder="选择领取状态" @change="klflReportList">
        <el-option v-for="(v, i) in getStatusOptions" :key="i" :label="v.label" :value="v.value"></el-option>
      </el-select>
      <el-date-picker @change="klflReportList" v-model="date" class="w250" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      <el-input v-model="listParams.searchParam" class="w200" placeholder="会员昵称/手机号/卡号" clearable @change="klflReportList"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-button icon="iconfont icon-icon_yunxiazai fz14" type="primary" class="fr" @click="klflRecordExcel"> 下载Excel</el-button>
    </div>
    <el-table tooltipEffect="light" :data="rankList" style="width:100%" height="300" v-loading="loading">
      <el-table-column :min-width="150" align="left" label="会员信息">
        <template slot-scope="scope">
          <a :href="'/member/#/wechatmemberDetail?memberId=' + scope.row.memberId" target="_blank">
            <img class="vertical-middle table__avatar--40" width="60" height="60" :src="filterAvatar(scope.row.imgUrl)" alt="" srcset="" />
            <div class="inline-block vertical-middle">
              <p class="table-name--ellipsis">{{ scope.row.memberName || '--' }}</p>
            </div>
          </a>
        </template>
      </el-table-column>
      <el-table-column :min-width="100" align="left" label="中奖时间" prop="createTime">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
            <span>{{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column v-for="(v, i) in rankHeader" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter"></el-table-column>
    </el-table>
    <el-pagination v-show="rankList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <vue-gic-export-excel :dialogVisible.sync="dialogVisible" :dataArr="rankList" :type="2" :excelUrl="excelUrl" :params="params" :projectName="projectName"></vue-gic-export-excel>
  </section>
</template>
<script>
import { klflReportList, klflRecordExcel } from '@/service/api/gameApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import filterAvatar from '@/mixins/filterAvater.js';
export default {
  mixins: [filterAvatar],
  created() {
    this.klflReportList();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '游戏营销', path: '/game' }, { name: '口令福利', path: '/game/klfl' }, { name: '口令福利中奖记录', path: '' }]);
  },
  data() {
    return {
      prizeReferTypeOptions: [{ value: -1, label: '所有类型' }, { value: 1, label: '积分' }, { value: 2, label: '卡券' }, { value: 3, label: '礼品' }],
      getStatusOptions: [{ value: -1, label: '所有状态' }, { value: 1, label: '待领取' }, { value: 2, label: '已领取' }, { value: 3, label: '待核销' }, { value: 4, label: ' 已核销' }, { value: 5, label: '待完善信息' }, { value: 6, label: '待发货' }, { value: 7, label: '已发货' }],
      loading: false,
      rankList: [],
      rankHeader: [
        // {
        //   label: '中奖时间',
        //   prop: 'createTime',
        //   align: 'left',
        //   formatter: function(row) {
        //     const date = formatDateTimeByType(row.createTime, 'yyyy-MM-dd-HH-mm-ss', true);
        //     return date.y + '\n' + date.h;
        //   }
        // },
        { label: '手机号码', prop: 'phoneNumber', align: 'left' },
        { label: '口令', prop: 'winCode', align: 'left' },
        {
          label: '奖品类型',
          prop: 'prizeReferType',
          width: '80',
          align: 'left',
          formatter: row => {
            const prizeArr = ['x', '积分', '卡券', '礼品'];
            return prizeArr[row.prizeReferType];
          }
        },
        { label: '奖品', prop: 'prizeName', align: 'left' },
        {
          label: '领取状态',
          prop: 'getStatus',
          align: 'left',
          formatter: row => {
            const getStatusArr = ['x', '待领取', '已领取', '待核销', '已核销', '待完善信息', '待发货', '已发货'];
            return getStatusArr[row.getStatus];
          }
        }
      ],
      listParams: {
        prizeReferType: -1,
        gameActivityId: this.$route.params.id,
        searchParam: '',
        getStatus: -1,
        startDate: '',
        endDate: '',
        currentPage: 1, //是	Number	当前页面
        pageSize: 20 //是	Number	每页显示条数
      },
      total: 0,
      date: [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()],
      projectName: 'marketing', // 当前项目名
      dialogVisible: false,
      excelUrl: '', // 下载数据的地址
      params: {} // 传递的参数
    };
  },
  methods: {
    formatDateTimeByType,
    async klflReportList() {
      this.loading = true;
      if (!this.date) {
        this.listParams.startDate = this.listParams.endDate = '';
      } else {
        this.listParams.startDate = formatDateTimeByType(this.date[0], 'yyyy-MM-dd');
        this.listParams.endDate = formatDateTimeByType(this.date[1], 'yyyy-MM-dd');
      }
      let res = await klflReportList(this.listParams);
      this.rankList = res.result.result || [];
      this.total = res.result.totalCount;
      this.loading = false;
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.klflReportList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.klflReportList();
    },
    klflRecordExcel() {
      this.dialogVisible = true;
      this.excelUrl = klflRecordExcel;
      if (!this.date) {
        this.listParams.startDate = this.listParams.endDate = '';
      } else {
        this.listParams.startDate = formatDateTimeByType(this.date[0], 'yyyy-MM-dd');
        this.listParams.endDate = formatDateTimeByType(this.date[1], 'yyyy-MM-dd');
      }
      this.params = {
        searchParam: this.listParams.searchParam,
        gameActivityId: this.listParams.gameActivityId,
        prizeReferType: this.listParams.prizeReferType,
        getStatus: this.listParams.getStatus,
        startDate: this.listParams.startDate,
        endDate: this.listParams.endDate,
        requestProject: 'marketing'
      };
    }
  }
};
</script>
