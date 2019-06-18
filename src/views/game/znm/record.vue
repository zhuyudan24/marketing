<template>
  <section class="dm-wrap">
    <el-tabs type="card" v-model="activeName">
      <!-- 排行榜 -->
      <el-tab-pane label="排行榜" name="first">
        <div class="pb22 clearfix">
          <el-input v-model="listParams.searchParam" class="w200" placeholder="会员昵称/手机号/卡号" clearable @change="znmReportList"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
          <el-button icon="iconfont icon-icon_yunxiazai fz14" type="primary" class="fr" @click="znmRankExcel"> 下载Excel</el-button>
        </div>
        <el-table tooltipEffect="light" :data="rankList" style="width:100%" v-loading="loading">
          <el-table-column width="60" align="left" label="名次" prop="ranking"></el-table-column>
          <el-table-column align="left" label="会员信息">
            <template slot-scope="scope">
              <a :href="'/member/#/wechatmemberDetail?memberId=' + scope.row.memberId" target="_blank">
                <img class="vertical-middle table__avatar--40" :src="filterAvatar(scope.row.memberPhotoUrl)" alt="" srcset="" />
                <div class="inline-block vertical-middle">
                  <p class="table-name--ellipsis">{{ scope.row.memberName || '--' }}</p>
                  <p class="gray fz13">{{ scope.row.memberNickName || '--' }}</p>
                </div>
              </a>
            </template>
          </el-table-column>
          <el-table-column v-for="(v, i) in rankHeader" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter"></el-table-column>
        </el-table>
        <el-pagination v-show="rankList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
      </el-tab-pane>
      <!-- 参与记录 -->
      <el-tab-pane label="参与记录" name="second">
        <div class="pb22 clearfix">
          <el-select class="dm-select" v-model="listParams1.gameStatus" placeholder="选择发送状态" @change="znmReportList1">
            <el-option v-for="(v, i) in gameStatusOptions" :key="i" :label="v.label" :value="v.value"></el-option>
          </el-select>
          <el-input v-model="listParams1.searchParam" class="w200" placeholder="会员昵称/手机号/卡号" clearable @change="znmReportList1"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
          <el-button icon="iconfont icon-icon_yunxiazai fz14" type="primary" class="fr" @click="znmRecordExcel"> 下载Excel</el-button>
        </div>
        <el-table tooltipEffect="light" :data="recordList" style="width:100%" v-loading="loading">
          <el-table-column align="left" label="会员信息">
            <template slot-scope="scope">
              <a :href="'/member/#/wechatmemberDetail?memberId=' + scope.row.memberId" target="_blank">
                <img class="vertical-middle table__avatar--40" :src="filterAvatar(scope.row.memberImage)" alt="" srcset="" />
                <div class="inline-block vertical-middle">
                  <p class="table-name--ellipsis">{{ scope.row.memberName || '--' }}</p>
                  <p class="gray fz13">{{ scope.row.memberNickName || '--' }}</p>
                </div>
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
    <vue-gic-export-excel :dialogVisible.sync="dialogVisible" :dataArr="dataArr" :type="2" :excelUrl="excelUrl" :params="params" :projectName="projectName"></vue-gic-export-excel>
  </section>
</template>
<script>
import { znmReportList, znmRankExcel, znmRecordExcel } from '@/service/api/gameApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import filterAvatar from '@/mixins/filterAvater.js';
export default {
  mixins: [filterAvatar],
  created() {
    this.znmReportList();
    this.znmReportList1();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '游戏营销', path: '/game' }, { name: '找你马', path: '/game/znm' }, { name: '找你马统计', path: '' }]);
  },
  data() {
    return {
      gameStatusOptions: [{ value: -1, label: '所有状态' }, { value: 2, label: '成功' }, { value: 1, label: '失败' }],
      activeName: 'first',
      loading: false,
      rankList: [],
      rankHeader: [
        {
          label: '手机号码',
          prop: 'memberPhone',
          align: 'left',
          formatter: row => {
            return row.memberPhone || '--';
          }
        },
        { label: '参与次数', prop: 'playTimes', align: 'left' },
        { label: '游戏成绩', prop: 'gameScore', align: 'left' }
      ],
      listParams: {
        tabName: 'rank',
        gameActivityId: this.$route.params.id,
        searchParam: '',
        gameStatus: '',
        currentPage: 1,
        pageSize: 20
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
        {
          label: '游戏状态',
          prop: 'getStatus',
          align: 'left',
          formatter: function(row) {
            return row.getStatus === 1 || row.getStatus === 2 ? '成功' : '失败';
          }
        },
        { label: '游戏成绩', prop: 'gameScore', align: 'left' },
        {
          label: '游戏成绩',
          prop: 'getStatus',
          align: 'left',
          formatter: function(row) {
            if (row.getStatus === 1) {
              return '未领取';
            } else if (row.getStatus === 2) {
              return '已领取';
            } else {
              return '--';
            }
          }
        }
      ],
      listParams1: {
        tabName: 'attendRecord',
        gameActivityId: this.$route.params.id,
        searchParam: '',
        gameStatus: '',
        currentPage: 1, //是	Number	当前页面
        pageSize: 20 //是	Number	每页显示条数
      },
      total1: 0,
      projectName: 'marketing', // 当前项目名
      dialogVisible: false,
      excelUrl: '', // 下载数据的地址
      params: {}, // 传递的参数
      dataArr: []
    };
  },
  methods: {
    formatDateTimeByType,
    //排名列表
    async znmReportList() {
      this.loading = true;
      let res = await znmReportList(this.listParams);
      this.rankList = res.result.result || [];
      this.total = res.result.totalCount;
      this.loading = false;
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.znmReportList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.znmReportList();
    },
    //记录列表
    async znmReportList1() {
      this.loading1 = true;
      let res = await znmReportList(this.listParams1);
      this.recordList = res.result.result || [];
      this.total1 = res.result.totalCount;
      this.loading1 = false;
    },
    handleSizeChange1(val) {
      this.listParams1.pageSize = val;
      this.znmReportList1();
    },
    handleCurrentChange1(val) {
      this.listParams1.currentPage = val;
      this.znmReportList1();
    },
    // 导出 游戏记录
    znmRecordExcel() {
      this.dialogVisible = true;
      this.dataArr = this.recordList;
      this.excelUrl = znmRecordExcel;
      this.params = {
        searchParam: this.listParams1.searchParam,
        gameActivityId: this.listParams1.gameActivityId,
        requestProject: 'marketing'
      };
    },
    // 导出排行
    znmRankExcel() {
      this.dialogVisible = true;
      this.dataArr = this.rankList;
      this.excelUrl = znmRankExcel;
      this.params = {
        searchParam: this.listParams.searchParam,
        gameActivityId: this.listParams.gameActivityId,
        requestProject: 'marketing'
      };
    }
  }
};
</script>
