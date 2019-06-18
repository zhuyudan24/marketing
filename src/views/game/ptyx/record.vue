<template>
  <div class="dm-wrap" v-loading="loading">
    <div class="pb20">
      <span class="bold fz14">统计</span><span class="pl20">参与人数：{{ dataObj.participateNum || '--' }} 参与次数：{{ dataObj.participateCount || '--' }} 新增关注人数：{{ dataObj.newfollowersNum || '--' }}</span>
    </div>
    <el-tabs v-model="activeName" type="card">
      <el-tab-pane label="排行榜" name="first">
        <div class="clearfix pb22">
          <el-select class="dm-select" v-model="listParams.gameStatus" placeholder="选择发送状态" @change="LoadPtyxRecordList">
            <el-option v-for="(v, i) in gameStatusOptions" :key="i" :label="v.label" :value="v.value"></el-option>
          </el-select>
          <el-input v-model="listParams.searchParam" class="w200" placeholder="会员昵称/手机号/卡号" clearable @change="LoadPtyxRecordList"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
          <el-button icon="iconfont icon-icon_yunxiazai fz14" type="primary" class="fr" @click="exportPtyxExcel"> 下载Excel</el-button>
        </div>
        <el-table tooltipEffect="light" :data="rankList" style="width:100%" v-loading="loading">
          <el-table-column width="60" align="left" label="名次" prop="ranking"></el-table-column>
          <el-table-column min-width="150" header-align="left" align="left" label="会员信息">
            <template slot-scope="scope">
              <a :href="'/member/#/wechatmemberDetail?memberId=' + scope.row.memberId" target="_blank">
                <img class="vertical-middle table__avatar--40" :src="filterAvatar(scope.row.memberPhotoUrl)" alt="" srcset="" />
                <p class="inline-block vertical-middle">{{ scope.row.memberName || '--' }}</p>
              </a>
            </template>
          </el-table-column>
          <el-table-column v-for="(v, i) in rankHeader" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter"></el-table-column>
        </el-table>
        <el-pagination v-show="rankList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
      </el-tab-pane>
      <el-tab-pane label="参与记录" name="second">
        <div class="clearfix pb22">
          <el-select class="dm-select" v-model="listParams1.gameStatus" placeholder="选择发送状态" @change="LoadPtyxRecordList1">
            <el-option v-for="(v, i) in gameStatusOptions" :key="i" :label="v.label" :value="v.value"></el-option>
          </el-select>
          <el-input v-model="listParams1.searchParam" class="w200" placeholder="会员昵称/手机号/卡号" clearable @change="LoadPtyxRecordList1"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
        </div>
        <el-table tooltipEffect="light" :data="recordList" style="width:100%" v-loading="loading">
          <el-table-column min-width="150" header-align="left" align="left" label="会员信息">
            <template slot-scope="scope">
              <a :href="'/member/#/wechatmemberDetail?memberId=' + scope.row.memberId" target="_blank">
                <img class="vertical-middle table__avatar--40" :src="filterAvatar(scope.row.memberImage)" alt="" srcset="" />
                <p class="fz12 inline-block vertical-middle">{{ scope.row.memberName }}</p>
              </a>
            </template>
          </el-table-column>
          <el-table-column :min-width="100" align="left" label="玩游戏时间" prop="createTime">
            <template slot-scope="scope">
              <p class="cell-time">
                {{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
                <span>{{ formatDateTimeByType(scope.row.createTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
              </p>
            </template>
          </el-table-column>
          <el-table-column v-for="(v, i) in recordHeader" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter"></el-table-column>
        </el-table>
        <el-pagination v-show="recordList.length" background class="dm-pagination" @size-change="handleSizeChange1" @current-change="handleCurrentChange1" :current-page="listParams1.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams1.pageSize" layout="total, sizes, prev, pager, next" :total="total1"></el-pagination>
      </el-tab-pane>
    </el-tabs>
    <vue-gic-export-excel :dialogVisible.sync="dialogVisible" :dataArr="rankList" :type="2" :excelUrl="excelUrl" :params="params" :projectName="projectName"></vue-gic-export-excel>
  </div>
</template>
<script>
import { LoadPtyxRecordList, exportPtyxExcel, ptyxCalcTitle } from '@/service/api/gameApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import filterAvatar from '@/mixins/filterAvater.js';
export default {
  mixins: [filterAvatar],
  data() {
    return {
      gameStatusOptions: [{ value: -1, label: '所有状态' }, { value: 2, label: '成功' }, { value: 1, label: '失败' }],
      activeName: 'first',
      loading: false,
      rankList: [],
      rankHeader: [{ label: '手机号码', prop: 'memberPhone', align: 'left' }, { label: '消耗方式', prop: 'costType', align: 'left' }, { label: '消耗数值', prop: 'costValue', align: 'left' }, { label: '参与次数', prop: 'playTimes', align: 'left' }, { label: '最佳时间', prop: 'opticalTime', align: 'left' }],
      listParams: {
        tabName: 'rank',
        gameActivityId: '',
        searchParam: '',
        gameStatus: -1,
        currentPage: 1, //是	Number	当前页面
        pageSize: 20 //是	Number	每页显示条数
      },
      total: 0,
      loading1: false,
      recordList: [],
      recordHeader: [
        // {
        //   label: '玩游戏时间',
        //   prop: 'createTime',
        //   align: 'left',
        //   formatter: function(row) {
        //     const date = formatDateTimeByType(row.createTime, 'yyyy-MM-dd-HH-mm-ss', true);
        //     return date.y + '\n' + date.h;
        //   }
        // },
        { label: '手机号码', prop: 'memberPhone', align: 'left' },
        { label: '消耗方式', prop: 'costType', align: 'left' },
        { label: '消耗数值', prop: 'costValue', align: 'left' },
        { label: '游戏状态', prop: 'gameStatus', align: 'left' },
        { label: '时间', prop: 'opticalTime', align: 'left' }
      ],
      listParams1: {
        tabName: 'attendRecord',
        gameActivityId: '',
        searchParam: '',
        gameStatus: -1,
        currentPage: 1, //是	Number	当前页面
        pageSize: 20 //是	Number	每页显示条数
      },
      total1: 0,
      dataObj: {},
      projectName: 'marketing', // 当前项目名
      dialogVisible: false,
      excelUrl: '', // 下载数据的地址
      params: {} // 传递的参数
    };
  },
  created() {
    this.LoadPtyxRecordList();
    this.LoadPtyxRecordList1();
    this.ptyxCalcTitle();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '游戏营销', path: '/game' }, { name: '拼图游戏', path: '/game/ptyx' }, { name: '拼图游戏统计', path: '' }]);
  },
  methods: {
    formatDateTimeByType,
    async ptyxCalcTitle() {
      let res = await ptyxCalcTitle({ gameActivityId: this.$route.params.id });
      if (res.errorCode === 0) {
        this.dataObj = res.result;
      }
    },
    async LoadPtyxRecordList() {
      this.loading = true;
      this.listParams.gameActivityId = this.$route.params.id;
      let res = await LoadPtyxRecordList(this.listParams);
      this.rankList = res.result.result || [];
      this.total = res.result.totalCount;
      this.loading = false;
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.LoadPtyxRecordList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.LoadPtyxRecordList();
    },
    exportPtyxExcel() {
      this.dialogVisible = true;
      this.excelUrl = exportPtyxExcel;
      this.params = {
        gameActivityId: this.listParams.gameActivityId,
        searchParam: this.listParams.searchParam,
        requestProject: 'marketing'
      };
    },
    async LoadPtyxRecordList1() {
      this.loading1 = true;
      this.listParams1.gameActivityId = this.$route.params.id;
      let res = await LoadPtyxRecordList(this.listParams1);
      this.recordList = res.result.result || [];
      this.total1 = res.result.totalCount;
      this.loading1 = false;
    },
    handleSizeChange1(val) {
      this.listParams1.pageSize = val;
      this.LoadPtyxRecordList1();
    },
    handleCurrentChange1(val) {
      this.listParams1.currentPage = val;
      this.LoadPtyxRecordList1();
    }
  }
};
</script>
<style lang="scss" scoped>
.ptyx /deep/ .el-tabs__content {
  margin: 0;
  background: #fff;
}
.ptyx /deep/ .el-tabs__content > div {
  margin: 0px;
}
</style>
