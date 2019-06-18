<template>
  <el-form v-loading="loading">
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">场景设置</h3>
      <el-form-item label="营销场景">
        <el-select class="w250" v-model="info.sceneSettingId" placeholder="选择营销场景">
          <el-option v-for="item in sceneSettingIdOptions" :key="item.sceneSettingId" :label="item.sceneName" :value="item.sceneSettingId"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="发送时间">
        <el-select class="w250" v-model="info.sendType">
          <el-option v-for="(v, i) in sendTypeOptions" :key="i" :value="v.value" :label="v.label"></el-option>
        </el-select>
        <el-date-picker class="w250" v-if="info.sendType" v-model="info.sendTime" type="datetime" placeholder="选择日期时间" align="right" :picker-options="pickerOptions"></el-date-picker>
      </el-form-item>
    </section>
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">会员设置</h3>
      <div class="pt10 pb20">
        <span class="dm-input_label">选择会员：</span>
        <el-radio v-model="info.memberType" :label="0">会员筛选</el-radio>
        <el-radio v-model="info.memberType" :label="1">指定会员</el-radio>
        <el-radio v-model="info.memberType" :label="2">会员分组</el-radio>
      </div>
      <div v-show="info.memberType === 0">
        <vue-gic-people :projectName="projectName" :isAdd="true" :triggerReset="true" :useId="useId" :hasSearchData="hasSearchData" :sceneValue="sceneValue" ref="peopleFilter" @findFilter="findFilter" @getBackData="getBackData" @editHide="editHide" @editShow="editShow" @hideBtn="hideBtn" />
        <div class="gic-people--button" v-show="toggleTag">
          <el-button size="small" type="primary" @click="getData">确 定</el-button>
          <el-button size="small" @click="cancelFilter">取 消</el-button>
        </div>
      </div>
      <vue-gic-confirm-people v-if="info.memberType === 1" idType="memberId" sendType="message" @get-data="getConfirmData"></vue-gic-confirm-people>
      <vue-gic-member-group v-if="info.memberType === 2" :defaltSelected="defaltSelected" :height="500" :projectName="projectName" :headerList="headerList" @handleDataTransferred="handleDataTransferred" @handleDataLeft="handleDataLeft"></vue-gic-member-group>
    </section>
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">
        短信模板设置
        <div class="dm-title__label--tips"><i class="el-icon-info pr8 blue"></i>短信运营商限制：为避免骚扰用户，营销短信只允许在8点到22点发送</div>
      </h3>
      <div class="border-radius2" style="padding:15px;">
        <sms-temp pbSize="pb15" :activeId.sync="info.smsTemplateId" @emitSmsItemInfo="onSmsItemInfo"></sms-temp>
      </div>
    </section>
    <div class="btn-wrap_fixed" :class="{ on: asideShow }">
      <el-button type="primary" @click="sendSms">提 交</el-button>
      <el-button @click="$router.go(-1)">返 回</el-button>
    </div>
  </el-form>
</template>
<script>
import { saveSendSmsService, checkMessageSendCount } from '@/service/api/messageApi.js';
import { sceneSettingList } from '@/service/api/wechatApi.js';
import smsTemp from '@/components/libs/smsTemp';
import { formatDateTimeByType } from '@/utils/index.js';

export default {
  name: 'add-record',
  data() {
    return {
      sceneSettingIdOptions: [],
      loading: false,
      sendTypeOptions: [{ value: 0, label: '立即发送' }, { value: 1, label: '选择时间发送' }],
      smsTempList: [],
      pickerOptions: {
        shortcuts: [
          {
            text: '今天',
            onClick(picker) {
              picker.$emit('pick', new Date());
            }
          },
          {
            text: '昨天',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24);
              picker.$emit('pick', date);
            }
          },
          {
            text: '一周前',
            onClick(picker) {
              const date = new Date();
              date.setTime(date.getTime() - 3600 * 1000 * 24 * 7);
              picker.$emit('pick', date);
            }
          }
        ],
        disabledDate(val) {
          return Date.now() >= val.getTime() + 24 * 60 * 60 * 1000;
        }
      },
      // 人群筛选器可传参数
      sceneValue: 'member', // 场景值
      useId: '', // 模板id
      hasSearchData: '', // 当前页回显的数据(接口返回)
      toggleTag: true, // 控制按钮显示的参数,仅供参考,可自行修改
      getSaveData: '',
      info: {
        memberType: 0,
        sceneSettingId: '',
        sendTime: '',
        sendType: 0,
        memberSearchDTO: '',
        openIds: '',
        smsTemplateId: ''
      },
      smsType: 0, // 短信类型   1为营销短信 营销短信要做判断

      // 会员分组可传参数
      defaltSelected: [], //  默认穿梭窗已选入数据
      projectName: 'marketing', // 默认是memberTag
      headerList: ['isRealTime', 'latestUpdateTime', 'updateType', 'effectiveStatus', 'effectiveDate'],
      effectiveStatus: 1 // 不传： 所有状态 1： 有效 0： 失效
    };
  },
  components: {
    smsTemp
  },
  computed: {
    asideShow() {
      return this.$store.state.marketing.asideShow;
    }
  },
  created() {
    this.sceneSettingList();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '短信营销', path: '' }, { name: '短信群发', path: '/message/record' }, { name: '新建群发', path: '' }]);
  },
  methods: {
    async sceneSettingList() {
      let res = await sceneSettingList();
      this.sceneSettingIdOptions = res.result || [];
    },
    onSmsItemInfo(val) {
      this.smsType = val.type;
      console.log(val);
    },
    //提交表单验证人数  人员筛选和会员分组 需要
    async checkMessageSendCount() {
      if (this.info.memberType === 0 || this.info.memberType === 2) {
        const params = {
          memberSearchDTO: this.info.memberSearchDTO,
          marketingType: 0,
          // 区分人员筛选和会员分组，需要传这个flag
          groupType: this.info.memberType === 0 ? 0 : 1
        };
        const res = await checkMessageSendCount(params);
        if (res.errorCode === 0) {
          this.$confirm(
            `<div>
              <div class="inline-block w300 vertical-middle ">
                <p>短信按67字/条分割成多条并按条计费</p>
                <p>合计发送${res.result}人</p>
                <p>是否发送?</p>
              </div>
            </div>`,
            '提示',
            {
              dangerouslyUseHTMLString: true,
              confirmButtonText: '确定',
              cancelBUttonText: '取消',
              type: 'warning'
            }
          )
            .then(() => {
              this.saveSendSmsService();
            })
            .catch(() => {
              this.$tips({ type: 'info', message: '已取消发送' });
            });
        }
      } else {
        this.saveSendSmsService();
      }
    },
    //提交接口
    saveSendSmsService() {
      this.$confirm('是否发送短信?', '提示', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = {
            sceneSettingId: this.info.sceneSettingId,
            memberType: this.info.memberType,
            smsTemplateId: this.info.smsTemplateId,
            sendType: this.info.sendType,
            memberSearchDTO: this.info.memberSearchDTO,
            searchJson: this.getSaveData
          };
          console.log(params);
          // return;
          if (this.info.memberType === 1) {
            params.openIds = this.info.openIds;
          }
          if (this.info.sendType) {
            params.sendTime = formatDateTimeByType(this.info.sendTime, 'yyyy-MM-dd-HH-mm-ss');
          }
          saveSendSmsService(params)
            .then(res => {
              if (res.errorCode === 0) {
                this.$router.go(-1);
                this.$tips({ type: 'success', message: '提交成功' });
              } else {
                this.$tips({ type: 'error', message: '提交失败' });
              }
            })
            .catch(err => {
              this.$tips({ type: 'error', message: '提交失败' });
            });
        })
        .catch(() => {
          this.$tips({ type: 'info', message: '已取消提交' });
        });
    },
    //提交表单
    async sendSms() {
      // // 这里强制获取人群筛选器的配置项
      // await this.$refs.peopleFilter.confirmSet();

      if (this.checkAccountState()) return;
      let nowHour = null;
      if (this.info.sendType) {
        nowHour = new Date(this.info.sendTime).getHours();
      } else {
        nowHour = new Date().getHours();
      }
      //  编辑情况下的判断
      if (this.smsType === 1 && (nowHour >= 22 || nowHour < 8)) {
        this.$alert(
          `<div>
          <i class="el-icon-warning warning-color fz30 vertical-middle mr20"></i>
          <p class="inline-block vertical-middle w300">短信运营商限制：为避免骚扰用户，营销短信只允许在8点到22点发送</p>
          </div>`,
          '提示',
          {
            dangerouslyUseHTMLString: true,
            showCancelButton: true,
            showConfirmButton: false,
            cancelButtonText: '关闭'
          }
        );
        return;
      }

      if (!this.info.memberType && this.toggleTag && !this.getSaveData) {
        this.$tips({ type: 'warning', message: '人群筛选未保存条件' });
        return;
      }
      if (!this.info.smsTemplateId) {
        this.$tips({ type: 'warning', message: '请选择短信模板' });
        return;
      }
      if (this.info.memberType === 1 && !this.info.openIds) {
        this.$tips({ type: 'warning', message: '指定会员不能为空' });
        return;
      }
      if (this.info.memberType === 2 && !this.info.memberSearchDTO) {
        this.$tips({ type: 'warning', message: '会员分组不能为空' });
        return;
      }
      this.checkMessageSendCount();
    },
    checkAccountState() {
      if (localStorage.getItem('accountStatus') == 3) {
        this.$alert(
          `<div>
          <i class="el-icon-warning warning-color fz30 vertical-middle mr20"></i>
          <p class="inline-block vertical-middle w300">当前账户已欠费，无法正常使用短信服务。为了保障您的权益，请及时充值。</p>
          </div>`,
          '提示',
          {
            dangerouslyUseHTMLString: true,
            confirmButtonText: '前往充值中心',
            customClass: 'message-box--btn-center'
          }
        ).then(res => {
          if (res === 'confirm') {
            this.$router.push('/recharge/do');
          }
        });
        return true;
      }
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
      this.info.memberSearchDTO = value;
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
      // 会员分组 情况下 memberSearchDTO 传数组字符串
      if (this.info.memberType === 2) {
        this.info.memberSearchDTO = data
          .map(v => v.memberTagGroupId)
          .filter(v => v)
          .join(',');
      }
      // console.log(data);
    },
    handleDataLeft(selectedData, selectionToRemove) {
      console.log(selectedData, selectionToRemove);
    }
  }
};
</script>

<style lang="scss" scoped>
.dm-record_box {
  max-height: 400px;
  overflow: auto;
}
.dm-record_text {
  .gray-bg {
    height: 30px;
    line-height: 30px;
  }
}
.sms-record-item {
  height: 60px;
  line-height: 60px;
  border-bottom: 1px solid #e4e7ed;
  padding: 0 10px;
  &_title {
    line-height: 30px;
  }
  &_content {
    position: relative;
    top: 10px;
  }
}
.grid {
  display: grid;
  grid-template-columns: 30px 100px 100px auto;
}
.sms-table_header {
  height: 40px;
  line-height: 40px;
  padding: 0 10px;
}
</style>
