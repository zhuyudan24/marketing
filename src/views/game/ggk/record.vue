<template>
  <div v-loading="loading" class="dm-wrap">
    <div class="pb22 clearfix">
      <el-select class="dm-select" v-model="listParams.prizeType" placeholder="选择奖品类型" @change="loadLotteryRecordList">
        <el-option v-for="(v, i) in prizeTypeOptions" :key="i" :label="v.label" :value="v.value"></el-option>
      </el-select>
      <el-date-picker :default-time="['00:00:00', '23:59:59']" :picker-options="pickerOptions" class="w300" v-model="dateTime" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="loadLotteryRecordList"></el-date-picker>
      <el-input v-model="listParams.searchParam" class="w200" placeholder="会员昵称/手机号/卡号" clearable @change="loadLotteryRecordList"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
      <el-checkbox border class="pl10" v-model="listParams.freeFlag" :true-label="1" :false-label="0" @change="loadLotteryRecordList">免费抽奖</el-checkbox>
      <el-button icon="iconfont icon-icon_yunxiazai fz14" type="primary" class="fr" @click="exportLotteryExcel"> 下载Excel</el-button>
    </div>
    <el-table tooltipEffect="light" :data="recordList" style="width:100%" v-loading="loading">
      <el-table-column :min-width="150" align="left" label="中奖时间">
        <template slot-scope="scope">
          <p class="cell-time">
            {{ formatDateTimeByType(scope.row.winDate, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br />
            <span>{{ formatDateTimeByType(scope.row.winDate, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
          </p>
        </template>
      </el-table-column>
      <el-table-column :min-width="150" align="left" label="会员信息">
        <template slot-scope="scope">
          <div v-if="scope.row.memberDTO">
            <a :href="'/member/#/wechatmemberDetail?memberId=' + scope.row.memberDTO.memberId" target="_blank">
              <img class="vertical-middle table__avatar--40" :src="filterAvatar(scope.row.memberDTO.thirdImgUrl)" width="60" height="60" alt="" srcset="" />
              <div class="inline-block vertical-middle">
                <p class="table-name--ellipsis">{{ scope.row.memberDTO.memberName || '--' }}</p>
              </div>
            </a>
          </div>
          <div v-else>--</div>
        </template>
      </el-table-column>
      <el-table-column :min-width="150" align="left" label="性别">
        <template slot-scope="scope">
          <span v-if="scope.row.memberDTO">{{ scope.row.memberDTO.memberGender === 1 ? '男' : scope.row.memberDTO.memberGender === 2 ? '女' : '未知' }}</span>
          <div v-else>--</div>
        </template>
      </el-table-column>
      <el-table-column :min-width="150" align="left" label="会员状态">
        <template slot-scope="scope">
          <div v-if="scope.row.memberDTO">
            <i v-if="scope.row.memberDTO.status === 1" class="iconfont icon-weixin- success-color" title="已关注微信服务号"></i>
            <i v-if="scope.row.memberDTO.status !== 1" class="iconfont icon-weixin- info-color" title="未关注微信服务号"></i>
            <i v-if="scope.row.memberDTO.phoneNumber" class="iconfont icon-zujian-lunbo success-color" title="已绑定手机号码"></i>
            <i v-if="!scope.row.memberDTO.phoneNumber" class="iconfont icon-zujian-lunbo info-color" title="未绑定手机号码"></i>
            <i v-if="scope.row.memberDTO.authStatus === 1" class="iconfont icon-icon_huiyuanguanli success-color" title="微信信息已认证"></i>
            <i v-if="scope.row.memberDTO.authStatus !== 1" class="iconfont icon-icon_huiyuanguanli info-color" title="微信信息未认证"></i>
          </div>
          <div v-else>--</div>
        </template>
      </el-table-column>
      <el-table-column :min-width="150" align="left" label="会员等级">
        <template slot-scope="scope">
          <span v-if="scope.row.memberDTO">{{ scope.row.memberDTO.gradeName }}</span>
          <div v-else>--</div>
        </template>
      </el-table-column>
      <el-table-column :min-width="150" align="left" label="积分消耗" prop="costIntegral"></el-table-column>
      <el-table-column :min-width="150" align="left" label="奖品" prop="prizeName"></el-table-column>
    </el-table>
    <el-pagination v-show="recordList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    <vue-gic-export-excel :dialogVisible.sync="dialogVisible" :dataArr="recordList" :type="2" :excelUrl="excelUrl" :params="params" :projectName="projectName"></vue-gic-export-excel>
  </div>
</template>
<script>
import { loadLotteryRecordList, exportLotteryExcel } from '@/service/api/gameApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import filterAvatar from '@/mixins/filterAvater.js';
export default {
  mixins: [filterAvatar],
  data() {
    return {
      formatDateTimeByType,
      prizeTypeOptions: [{ value: '', label: '所有类型' }, { value: 1, label: '积分' }, { value: 2, label: '卡券' }],
      loading: false,
      listParams: {
        gameId: this.$route.params.id,
        gameType: 2,
        prizeType: '',
        searchParam: '',
        gameStatus: '',
        freeFlag: 0,
        startDate: '',
        endDate: '',
        currentPage: 1, //是	Number	当前页面
        pageSize: 20 //是	Number	每页显示条数
      },
      total: 0,
      recordList: [],
      recordHeader: [],
      dateTime: ['', ''],
      pickerOptions: {
        disabledDate(val) {
          return Date.now() >= val.getTime();
        }
      },
      projectName: 'marketing', // 当前项目名
      dialogVisible: false,
      excelUrl: '', // 下载数据的地址
      params: {} // 传递的参数
    };
  },
  created() {
    this.loadLotteryRecordList();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '游戏营销', path: '/game' }, { name: '刮刮卡', path: '/game/ggk' }, { name: '刮刮卡中奖记录', path: '' }]);
  },
  methods: {
    async loadLotteryRecordList() {
      this.loading = true;
      if (this.dateTime) {
        this.listParams.startDate = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd-HH-mm-ss');
        this.listParams.endDate = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd-HH-mm-ss');
      }
      let res = await loadLotteryRecordList(this.listParams);
      this.recordList = res.result.result || [];
      this.total = res.result.totalCount;
      this.loading = false;
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.loadLotteryRecordList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.loadLotteryRecordList();
    },
    exportLotteryExcel() {
      this.dialogVisible = true;
      this.excelUrl = exportLotteryExcel;
      if (!this.date) {
        this.listParams.startDate = this.listParams.endDate = '';
      } else {
        this.listParams.startDate = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd-HH-mm-ss');
        this.listParams.endDate = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd-HH-mm-ss');
      }
      this.params = {
        searchParam: this.listParams.searchParam,
        gameId: this.listParams.gameId,
        gameType: this.listParams.gameType,
        prizeType: this.listParams.prizeType,
        freeFlag: this.listParams.freeFlag,
        startDate: this.listParams.startDate,
        endDate: this.listParams.endDate,
        requestProject: 'marketing'
      };
    }
  }
};
</script>
