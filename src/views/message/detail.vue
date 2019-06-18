<template>
  <div>
    <el-form class="dm-form__wrap" ref="form" :model="info" label-width="90px">
      <h3 class="dm-title__label">基本信息</h3>
      <el-row :gutter="20" class="message-detail__label">
        <el-col :span="8">
          <span class="primary-font-color">发送时间：</span>
          <span class="regular-font-color">{{ formatDateTimeByType(info.sendTime, 'yyyy-MM-dd-HH-mm-ss') }}</span>
        </el-col>
        <el-col :span="8">
          <span class="primary-font-color">发送人数：</span>
          <span class="regular-font-color">{{ info.sendCount }}</span>
        </el-col>
        <el-col :span="8">
          <span class="primary-font-color">发送条数：</span>
          <span class="regular-font-color">{{ info.countNum }}</span>
        </el-col>
        <el-col :span="8">
          <span class="primary-font-color">模板名称：</span>
          <span class="regular-font-color">{{ info.templateName }}(ID:{{ info.templateId }})</span>
        </el-col>
        <el-col :span="8">
          <span class="primary-font-color">模板类型：</span>
          <span class="regular-font-color">{{ info.sendType === 0 ? '普通短信' : '营销短信' }}</span>
        </el-col>
        <el-col :span="8">
          <span class="primary-font-color">营销场景：</span>
          <span class="regular-font-color">{{ info.sceneSettingName }}</span>
        </el-col>
        <el-col :span="24">
          <span class="primary-font-color">短信模板：</span>
          <span class="regular-font-color" style="max-width: 100%;overflow: auto;line-height:2;">{{ info.templateContent }}</span>
        </el-col>
      </el-row>
    </el-form>
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">会员设置</h3>
      <div class="pt10 pb20">
        <span class="dm-input_label">选择会员：</span>
        <el-radio v-model="info.memberType" :label="0" disabled>会员筛选</el-radio>
        <el-radio v-model="info.memberType" :label="1" disabled>指定会员</el-radio>
        <el-radio v-model="info.memberType" :label="2" disabled>会员分组</el-radio>
      </div>
      <div v-show="!info.memberType">
        <vue-gic-people :projectName="projectName" :isAdd="false" :useId="useId" :hasSearchData="hasSearchData" :sceneValue="sceneValue" ref="peopleFilter" @findFilter="findFilter" @getBackData="getBackData" @editHide="editHide" @editShow="editShow" @hideBtn="hideBtn" />
        <div class="gic-people--button" v-show="toggleTag">
          <el-button size="small" type="primary" @click="getData">确 定</el-button>
          <el-button size="small" @click="cancelFilter">取 消</el-button>
        </div>
      </div>
      <vue-gic-confirm-people v-if="info.memberType === 1" idType="memberId" :onlyWxMember="0" :isMessage="true" @get-data="getConfirmData" :list="memberList" :disabled="true"></vue-gic-confirm-people>
      <vue-gic-member-group v-if="info.memberType === 2" :defaltSelected="defaltSelected" :height="500" :projectName="projectName" :headerList="headerList" @handleDataTransferred="handleDataTransferred" @handleDataLeft="handleDataLeft"></vue-gic-member-group>
    </section>
    <section class="dm-form__wrap">
      <div class="clearfix pb22">
        <el-select class="dm-select" v-model="listParams.sendStatus" placeholder="选择发送状态" @change="LoadMessageDetailList"> <el-option v-for="(v, i) in sendStatusOptions" :key="i" :label="v.label" :value="v.value"></el-option></el-select>
        <el-input v-model="listParams.memberName" class="w200" placeholder="会员昵称/手机号/卡号" clearable @change="LoadMessageDetailList"><i slot="prefix" class="el-input__icon el-icon-search"></i></el-input>
        <el-button icon="iconfont icon-icon_yunxiazai fz14" type="primary" class="fr" @click="exportExcel"> 下载Excel</el-button>
      </div>
      <el-table tooltipEffect="light" :data="messageList" style="width: 100%" v-loading="messageLoading">
        <el-table-column min-width="150" align="left" label="会员信息">
          <template slot-scope="scope">
            <div class="sms-table_info">
              <img class="table__avatar--40 vertical-middle" :src="filterAvatar(scope.row.thirdImgUrl)" alt="" srcset="" />
              <div class="inline-block vertical-middle">
                <p class="table-name--ellipsis">{{ scope.row.memberName }}</p>
                <p class="fz13 gray">{{ scope.row.nickname }}</p>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column v-for="(v, i) in messageHeader" :show-overflow-tooltip="v.tooltip" :width="v.width" :min-width="v.minWidth" :align="v.align" :key="i" :prop="v.prop" :label="v.label" :formatter="v.formatter"></el-table-column>
        <el-table-column :min-width="80" align="left" label="错误码" prop="errorMsg">
          <template slot-scope="scope">
            <span v-if="scope.row.errorMsg == -1">--</span>
            <span v-else-if="scope.row.backStatus == '--' && scope.row.sendStatus !== 2">--</span>
            <el-button v-else type="text" @click="errorCodeShow = true">{{ scope.row.errorMsg }}</el-button>
          </template>
        </el-table-column>
        <el-table-column :min-width="100" align="left" label="上报时间" prop="backTime">
          <template slot-scope="scope">
            <p class="cell-time">
              {{ formatDateTimeByType(scope.row.backTime, 'yyyy-MM-dd-HH-mm-ss', true).y }}<br /><span>{{ formatDateTimeByType(scope.row.backTime, 'yyyy-MM-dd-HH-mm-ss', true).h }}</span>
            </p>
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="false" :min-width="150" align="left" label="短信内容" prop="remark">
          <template slot-scope="scope">
            <el-popover class="item" trigger="hover" width="300" v-if="scope.row.remark.length > 10" :content="scope.row.remark" placement="top-start">
              <span slot="reference" class="ellipsis">{{ scope.row.remark }}</span>
            </el-popover>
            <span v-else>{{ scope.row.remark }}</span>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination v-show="messageList.length" background class="dm-pagination" @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page="listParams.currentPage" :page-sizes="[20, 40, 60, 80]" :page-size="listParams.pageSize" layout="total, sizes, prev, pager, next" :total="total"></el-pagination>
    </section>
    <error-code-dialog :show.sync="errorCodeShow"></error-code-dialog>
    <vue-gic-export-excel :dialogVisible.sync="dialogVisible" :dataArr="messageList" :type="2" :excelUrl="excelUrl" :params="params" :projectName="projectName"></vue-gic-export-excel>
  </div>
</template>
<script>
import { LoadMessageDetail, LoadMessageDetailList, exportSmsExcel } from '@/service/api/messageApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import errorCodeDialog from './errorCode';
import filterAvatar from '@/mixins/filterAvater.js';
export default {
  mixins: [filterAvatar],
  data() {
    return {
      formatDateTimeByType,
      info: {
        searchParams: '',
        memberType: 0
      },
      memberList: [],
      messageList: [],
      messageLoading: false,
      messageHeader: [
        { label: '手机号码', prop: 'telephone', width: '120', align: 'left' },
        {
          label: '发送状态',
          prop: 'sendStatus',
          width: '80',
          align: 'left',
          formatter: function(row) {
            return row.sendStatus === 0 ? '成功' : row.sendStatus === 1 ? '未发送' : '失败';
          }
        },
        {
          label: '回执状态',
          prop: 'backStatus',
          width: '80',
          align: 'left',
          formatter: function(row) {
            // eslint-disable-next-line
            return row.backStatus === 0 && row.backTime === null ? '--' : (row.backStatus ? '接收成功' : '接收失败')
          }
        }
        // {
        //   label: '上报时间',
        //   prop: 'backTime',
        //   minWidth: '100',
        //   tooltip: true,
        //   align: 'left',
        //   formatter: function(row) {
        //     const date = formatDateTimeByType(row.backTime, 'yyyy-MM-dd-HH-mm-ss', true);
        //     return row.backTime ? date.y + '\n' + date.h : '';
        //   }
        // },
      ],
      listParams: {
        sendStatus: '',
        smsId: this.$route.params.id,
        memberName: '',
        currentPage: 1,
        pageSize: 20
      },
      total: 0,
      sendStatusOptions: [{ value: '', label: '所有状态' }, { value: 0, label: '成功' }, { value: 1, label: '未发送' }, { value: 2, label: '失败' }],
      errorCodeShow: false,
      // 人群筛选器可传参数
      sceneValue: 'member', // 场景值
      useId: '', // 模板id
      hasSearchData: '', // 当前页回显的数据(接口返回)
      toggleTag: true, // 控制按钮显示的参数,仅供参考,可自行修改
      getSaveData: '',
      // 会员分组可传参数
      defaltSelected: [], //  默认穿梭窗已选入数据
      headerList: ['effectiveStatus'], // 表头配置，默认全部，分组名称默认显示不可配置
      projectName: 'marketing', // 当前项目名
      dialogVisible: false,
      excelUrl: '', // 下载数据的地址
      params: {} // 传递的参数
    };
  },
  created() {
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '短信营销', path: '/message' }, { name: '短信群发', path: '/message/record' }, { name: '短信群发详情', path: '' }]);
    this.LoadMessageDetail(this.$route.params.id);
    this.LoadMessageDetailList();
  },
  computed: {
    asideShow() {
      return this.$store.state.marketing.asideShow;
    }
  },
  components: {
    errorCodeDialog
  },
  methods: {
    async LoadMessageDetail(id) {
      let params = { smsId: id };
      let res = await LoadMessageDetail(params);
      console.log(res);
      this.useId = res.result.searchId || '';
      this.info = res.result.smsDTO || {};
      this.info.memberType = res.result.smsDTO.memberType;

      if (this.info.memberType === 0) {
        this.info.searchParams = res.result.smsDTO.searchParams;
        this.hasSearchData = res.result.smsDTO.searchParams;
      } else if (this.info.memberType === 1) {
        this.$nextTick(_ => {
          this.memberList = res.result.memberList || [];
        });
      } else if (this.info.memberType === 2) {
        this.defaltSelected = res.result.tagGroupList || [];
      }
    },
    async LoadMessageDetailList() {
      this.messageLoading = true;
      let res = await LoadMessageDetailList(this.listParams);
      this.messageList = res.result.result || [];
      this.total = res.result.totalCount;
      this.messageLoading = false;
    },
    handleSizeChange(val) {
      this.listParams.pageSize = val;
      this.LoadMessageDetailList();
    },
    handleCurrentChange(val) {
      this.listParams.currentPage = val;
      this.LoadMessageDetailList();
    },
    // exportExcel() {
    //   let data = {  };
    //   exportSmsExcel(data).then(res => {
    //     const downLoadUrl = url + res.result;
    //     window.location = downLoadUrl;
    //   });
    // },
    exportExcel() {
      this.dialogVisible = true;
      this.excelUrl = exportSmsExcel;
      this.params = {
        smsId: this.listParams.smsId,
        sendStatus: this.listParams.sendStatus,
        memberName: this.listParams.memberName,
        requestProject: 'marketing'
      };
    },

    /** ----------人群筛选器的方法----------- */
    //获取指定会员
    getConfirmData(val) {
      this.info.openIds = val;
    },
    getData() {
      this.$refs.peopleFilter.confirmSet();
    },
    // 子组件触发父组件事件,返回过滤条件数据
    findFilter(value) {
      console.log(value);
      this.info.searchParams = value;
    },
    // 取消
    cancelFilter() {
      this.$refs.peopleFilter.cancelSet();
    },
    // 获取需要回显的数据, 供保存时候使用
    getBackData(val) {
      this.getSaveData = val;
    },
    // 显示编辑,保存按钮隐藏,确认按钮显示 (子组件会调用)
    editShow() {
      this.toggleTag = true;
      this.saveTag = false;
    },
    // 显示保存按钮,隐藏确认按钮显示  (子组件会调用)
    editHide() {
      this.toggleTag = false;
      this.saveTag = true;
    },
    // 隐藏保存按钮和确认按钮  (子组件会调用)
    hideBtn() {
      this.toggleTag = false;
      this.saveTag = false;
    },
    handleDataTransferred(data) {
      //
    },
    handleDataLeft(selectedData, selectionToRemove) {
      console.log(selectedData, selectionToRemove);
    }
  }
};
</script>

<style lang="scss" scoped>
.message-detail__label {
  /deep/ .el-col {
    margin: 0 0 16px;
    line-height: 22px;
  }
}
</style>
