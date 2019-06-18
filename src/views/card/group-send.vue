<template>
  <el-form :model="form" ref="form" :rules="rules" label-width="100px" v-loading="loading">
    <div class="dm-form__wrap">
      <h3 class="dm-title__label">基础设置</h3>
      <el-form-item label="活动名称" prop="putOnName">
        <dm-input class="w250" v-model="form.putOnName" :maxlength="9" :disabled="isInfo"></dm-input>
      </el-form-item>
      <el-form-item label="投放卡券">
        <el-input class="w250" v-model="form.cardName" disabled></el-input>
      </el-form-item>
      <el-form-item label="发送时间">
        <el-select class="w250" v-model="form.putOnType" :disabled="isInfo">
          <el-option v-for="(v, i) in putOnTypeOptions" :key="i" :value="v.value" :label="v.label"></el-option>
        </el-select>
        <el-date-picker :disabled="isInfo" class="w250" v-if="form.putOnType" v-model="form.putOnTime" type="datetime" placeholder="选择日期时间" align="right" :picker-options="pickerOptions"></el-date-picker>
      </el-form-item>
      <el-form-item label="营销场景">
        <el-select class="w250" v-model="form.sceneSettingId" :disabled="isInfo">
          <el-option v-for="(v, i) in sceneSettingOptions" :key="i" :value="v.sceneSettingId" :label="v.sceneName"></el-option>
        </el-select>
      </el-form-item>
    </div>
    <div class="dm-form__wrap">
      <h3 class="dm-title__label">会员设置</h3>
      <div class="pb20">
        <span class="dm-input_label pr10">选择会员</span>
        <el-radio :disabled="isInfo" v-model="form.memberType" :label="0">会员筛选</el-radio>
        <el-radio :disabled="isInfo" v-model="form.memberType" :label="1">指定会员</el-radio>
        <el-radio :disabled="isInfo" v-model="form.memberType" :label="2">会员分组</el-radio>
      </div>
      <div v-show="!form.memberType">
        <vue-gic-people :projectName="projectName" :isAdd="isAdd" :triggerReset="true" :useId="useId" :hasSearchData="hasSearchData" :sceneValue="sceneValue" ref="peopleFilter" @findFilter="findFilter" @getBackData="getBackData" @editHide="editHide" @editShow="editShow" @hideBtn="hideBtn" />
        <div class="gic-people--button" v-show="toggleTag">
          <el-button size="small" type="primary" @click="getData">确 定</el-button>
          <el-button size="small" @click="cancelFilter">取 消</el-button>
        </div>
      </div>
      <vue-gic-confirm-people v-show="form.memberType === 1" idType="memberId" sendType="card" @get-data="getConfirmData" :list="memberList"></vue-gic-confirm-people>
      <vue-gic-member-group v-if="form.memberType === 2" :defaltSelected="defaltSelected" :height="500" :projectName="projectName" :headerList="headerList" @handleDataTransferred="handleDataTransferred" @handleDataLeft="handleDataLeft"></vue-gic-member-group>
    </div>
    <!-- 只有存在卡券的情况下出现卡券通知方式 -->
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">卡券通知方式配置</h3>
      <el-form-item label="通知方式" class="is-required" prop="noticeType">
        <el-radio v-model="form.noticeType" :label="0" :disabled="!isEditTemplate || isInfo"
          >不通知
          <el-tooltip class="item" effect="dark" content="不通知用户，但用户可以在GIC卡券包查看到该卡券。建议线下发券使用，或使用其他通知方式代替（如小程序、短信等）" placement="top-start">
            <i class="iconfont icon-xinxixianshi pl5 gray"></i>
          </el-tooltip>
        </el-radio>
        <el-radio v-model="form.noticeType" :label="1" :disabled="!isEditTemplate || isInfo"
          >微信群发接口
          <el-tooltip placement="top-start" content="建议大规模发券、智能营销定时计划使用，占用每个会员每月4次的营销次数。">
            <i class="iconfont icon-xinxixianshi pl5 gray"></i>
          </el-tooltip>
        </el-radio>
        <el-radio v-model="form.noticeType" :label="2" :disabled="!isEditTemplate || isInfo || form.templateUseEnable === 0"
          >微信模板消息
          <el-tooltip placement="top-start">
            <span slot="content">建议小规模发券、智能营销实时计划使用，滥用可能导致模板消息被封。参考微信<a target="_blank" href="https://mp.weixin.qq.com/wiki?t=resource/res_main&id=mp1433751288">《模板消息运营规范》</a></span>
            <i class="iconfont icon-xinxixianshi pl5 gray"></i>
          </el-tooltip>
        </el-radio>
      </el-form-item>
      <!-- 模板消息选择 -->
      <el-form-item label="模板消息选择" v-show="form.noticeType === 2">
        <el-select style="width:262px;" :disabled="!isEditTemplate || isInfo" v-model="triggerCode" placeholder="请选择模板消息" @change="changeTemplate">
          <el-option v-for="(v, i) in templateOptions" :key="i" :label="v.templateName" :value="v.triggerCode"></el-option>
        </el-select>
      </el-form-item>
      <!-- 通知非 不通知-->
      <el-form-item label="效果预览" v-if="form.noticeType">
        <div class="mt20">
          <!-- 通知方式是微信群发接口 -->
          <item-card :item="cardInfo" class="mr20" v-if="form.noticeType === 1"></item-card>
          <!-- 模板消息预览 -->
          <!-- （如果时效是实时（0）并且通知方式是微信群发接口（1） 并且 勾选了补发设置 出现补发设置） 或者  通知方式是微信群发接口是模板消息  -->
          <div class="ecm-msg__preview" v-if="form.noticeType === 2">
            <div class="ecm-msg__preview--inner">
              <h4 class="pre-templateName">{{ template.templateName }}</h4>
              <p class="fz13 gray pre-updateTime">{{ template.updateTime | filterDate }}</p>
              <p class="pre-header" :style="'color:' + template.headerColor + ';'">{{ template.headerText }}</p>
              <p class="pre-keyName" v-for="(v, i) in template.templateKeyDataList" :key="i">
                <template v-if="v.keyName">
                  {{ v.keyName }}
                  <span :style="`color:${v.color}`">示例文字</span>
                </template>
              </p>
              <p class="pre-remark" :style="'color:' + template.remarkColor + ';'">{{ template.remarkText }}</p>
              <div class="pre-foot">
                <span class="fz13">详情</span>
                <i class="el-icon-arrow-right"></i>
              </div>
            </div>
            <div class="text-center">
              <el-button type="text" :disabled="!isEditTemplate || isInfo || form.templateUseEnable === 0" @click="editTemplatePre">修改</el-button>
              <el-button type="text" :disabled="!isEditTemplate || isInfo || form.templateUseEnable === 0" @click="resetTemplate">重置</el-button>
            </div>
          </div>
        </div>
        <!-- <div class="ecm-send__tips">
          <i class="el-icon-info pl5 gray"></i>
          <span class="fz13">若一个智能营销计划中添加多张卡券，{{form.noticeType === 1?'则会推送多条对话框卡券投放':'只会推送一条模板消息卡券领取'}}通知。</span>
        </div> -->
      </el-form-item>
    </section>
    <div class="btn-wrap_fixed" :class="{ on: asideShow }">
      <el-button v-if="!isInfo" type="primary" @click="submit('form')">提 交</el-button>
      <el-button @click="$router.go(-1)">返回</el-button>
    </div>
    <var-dialog :options="options" :show.sync="varShow" @get-data="insetVar"></var-dialog>
    <el-dialog title="修改模板消息" :visible.sync="editDialogShow" width="600px" :before-close="close">
      <div class="ecm-msg__edit">
        <div class="ecm-msg__edit--inner">
          <el-form-item label-width="100px" label="头部文案">
            <el-input type="textarea" :style="'color:' + copyTemplate.headerColor" v-model="copyTemplate.headerText" :rows="4" class="w450" :maxlength="200"></el-input>
            <div class="input-suffix clearfix">
              <el-color-picker class="ml10 vertical-middle" v-model="copyTemplate.headerColor"></el-color-picker>
              <el-button type="text" class="vertical-middle" @click="insetVarPre('headerText')">插入变量</el-button>
              <span class="gray fz13 fr mr10">{{ copyTemplate.headerText.length }}/200</span>
            </div>
          </el-form-item>
          <el-form-item label-width="100px" :label="v.keyName" v-for="(v, i) in copyTemplate.templateKeyDataList" :key="i">
            <div v-if="v.keyName">
              <span class="vertical-middle">显示接收人{{ v.keyName }}</span>
              <el-color-picker class="ml10 vertical-middle" v-model="v.color"></el-color-picker>
            </div>
          </el-form-item>
          <el-form-item label-width="100px" label="尾部文案">
            <el-input type="textarea" :style="'color:' + copyTemplate.remarkColor" v-model="copyTemplate.remarkText" :rows="4" class="w450" :maxlength="200"></el-input>
            <div class="input-suffix clearfix">
              <el-color-picker class="ml10 vertical-middle" v-model="copyTemplate.remarkColor"></el-color-picker>
              <el-button type="text" class="vertical-middle" @click="insetVarPre('remarkText')">插入变量</el-button>
              <span class="gray fz13 fr mr10">{{ copyTemplate.remarkText.length }}/200</span>
            </div>
          </el-form-item>
        </div>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogShow = false">取 消</el-button>
        <el-button type="primary" @click="editTemplate">确 定</el-button>
      </span>
    </el-dialog>
  </el-form>
</template>
<script>
import { checkPutonMemberIds, saveUpdatePutonCard, getCardDetail, getCardPutonDetail } from '@/service/api/cardApi.js';
import { listTemplateVariables } from '@/service/api/msgApi.js';
import { sceneSettingList } from '@/service/api/commonApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import itemCard from './partials/item-card.vue';
import varDialog from './partials/variables.vue';
export default {
  name: 'card-group',
  components: {
    'item-card': itemCard,
    'var-dialog': varDialog
  },
  data() {
    return {
      loading: false,
      putOnTypeOptions: [{ value: 0, label: '立即发送' }, { value: 1, label: '选择时间发送' }],
      pickerOptions: {
        disabledDate(val) {
          return Date.now() >= val.getTime() + 24 * 60 * 60 * 1000;
        }
      },
      // 人群筛选器可传参数
      sceneValue: 'member', // 场景值
      useId: '', // 模板id
      hasSearchData: '', // 当前页回显的数据(接口返回)
      toggleTag: false, // 控制按钮显示的参数,仅供参考,可自行修改
      getSaveData: '',
      saveTag: false,
      form: {
        memberType: 0,
        sceneSettingId: '',
        putOnTime: '',
        putOnType: 0,
        memberSearchDTO: '',
        openIds: '',
        putOnName: '',
        sceneSettingName: '',
        cardId: this.$route.params.id,
        cardName: this.$route.query.name,
        noticeType: 1,
        templateNoticeFlag: 0,
        // 判断模板消息能否使用
        templateUseEnable: 1,
        memberGroupIds: ''
      },
      rules: {
        putOnName: { required: true, message: '活动名称不能为空', trigger: 'blur' }
      },
      cardInfo: {},
      template: {
        headerColor: '#173177',
        remarkColor: '#173177',
        headerText: '',
        remarkText: '',
        templateKeyDataList: []
      },
      copyTemplate: {
        headerColor: '#173177',
        remarkColor: '#173177',
        headerText: '',
        remarkText: '',
        templateKeyDataList: []
      },
      options: [],
      varShow: false,
      currentTxet: '',
      editDialogShow: false,
      sceneSettingOptions: [],
      memberList: [],
      isEdit: this.$route.meta.type === 'edit',
      isInfo: this.$route.meta.type === 'info',
      isAdd: this.$route.meta.type === 'send',
      defaltSelected: [],
      projectName: 'marketing',
      headerList: ['isRealTime', 'latestUpdateTime', 'updateType', 'effectiveStatus', 'effectiveDate'],
      effectiveStatus: 1, // 不传： 所有状态 1： 有效 0： 失效
      templateOptions: [],
      triggerCode: ''
    };
  },
  computed: {
    asideShow() {
      return this.$store.state.marketing.asideShow;
    },
    isEditTemplate() {
      //是否可以编辑 1.新增  2.编辑，选择时间发送，发送时间大于当前时间
      console.log(111);
      return this.isAdd || (this.isEdit && this.form.putOnType === 1 && this.form.putOnTime > Date.now());
    }
  },
  created() {
    this.listTemplateVariables();
    this.sceneSettingList();
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '卡券营销', path: '/card' }, { name: '卡券库', path: '/card/list' }, { name: '卡券群发', path: '' }]);
    this.$store.commit(
      'mutations_layoutTips',
      `<div class="layout--tips">
            <i class="el-icon-info"></i>
            风险提示：大规模投放卡券可能导致模板消息被封
        </div>
      `
    );
    setTimeout(_ => {
      this.$store.commit('mutations_layoutTips', '');
    }, 10000);
  },
  beforeDestroy() {
    this.$store.commit('mutations_layoutTips', '');
  },
  methods: {
    // 拉取营销场景
    async sceneSettingList() {
      let res = await sceneSettingList();
      if (res.errorCode === 0) {
        this.sceneSettingOptions = res.result || [];
      }
    },
    // 获取变量列表
    async listTemplateVariables() {
      try {
        let res = await listTemplateVariables();
        if (res.errorCode === 0) {
          const result = res.result;
          this.options = Object.keys(result).map(v => ({ label: result[v], value: v }));
        }
        this.getCardPutonDetail();
      } catch (err) {
        console.log(err);
      }
    },
    // 获取详情
    async getCardPutonDetail(isResetTemplate = false) {
      this.loading = true;
      let res = await getCardPutonDetail({ putonId: this.isAdd ? '' : this.$route.params.id });
      this.loading = false;
      if (res.errorCode === 0) {
        if (!isResetTemplate && !this.isAdd) {
          const form = res.result.puton;
          this.form.putOnName = form.putOnName;
          this.form.putOnType = form.putOnType;
          this.form.memberType = form.memberType;
          this.form.sceneSettingId = form.sceneSettingId;
          this.form.sceneSettingName = form.sceneSettingName;
          this.form.memberSearchDTO = form.searchParams;
          this.form.cardId = form.cardId;
          this.form.putOnTime = form.putOnTime;
          this.form.cardName = res.result.card.cardName;

          /** '0-不通知 1-微信对话框 2-模板消息' **/
          this.form.noticeType = form.noticeType || 0;
          // 会员设置回显
          if (this.form.memberType === 0) {
            this.useId = res.result.searchId;
            this.hasSearchData = form.searchParams;
            this.form.memberSearchDTO = form.searchParams;

            console.log(this.hasSearchData);
          } else if (this.form.memberType === 1) {
            this.memberList = res.result.memberList;
          } else if (this.form.memberType === 2) {
            this.defaltSelected = res.result.tagGroupList || [];
          }

          // 如果是编辑或者详情，从该接口获取卡券详情
          const card = res.result.card;
          this.cardInfo = {
            beginDate: card.beginDate,
            endDate: card.endDate,
            startDay: card.startDay || 0,
            limitDay: card.limitDay || 0,
            storeMode: card.storeMode === 0 ? 0 : 1,
            cardName: card.cardName || '',
            cardColor: card.cardColor,
            cardEffectiveMode: card.cardEffectiveMode,
            brandLogo: res.result.enterprise.qcloudImageUrl
          };
        }
        // 如果是新增，调用详情接口获取卡券详情
        if (this.isAdd) {
          this.getCardDetail(res.result.enterprise.qcloudImageUrl);
        }
        // 模板消息
        let template = null;
        this.templateOptions = res.result.marketingTemplateList || [];
        if (!this.isAdd) {
          template = res.result.customMarketingTemplate;
        } else {
          template = res.result.marketingTemplateList[0];
        }
        this.triggerCode = template.triggerCode;
        if (template) {
          this.templateInit(template);
        }
      }
    },
    //卡券详情
    async getCardDetail(logo) {
      let res = await getCardDetail({ coupCardId: this.$route.params.id });
      if (res.errorCode === 0) {
        if (res.result.card) {
          const card = res.result.card;
          this.cardInfo = {
            beginDate: card.beginDate,
            endDate: card.endDate,
            startDay: card.startDay || 0,
            limitDay: card.limitDay || 0,
            storeMode: card.storeMode === 0 ? 0 : 1,
            cardName: card.cardName || '',
            cardColor: card.cardColor,
            cardEffectiveMode: card.cardEffectiveMode,
            brandLogo: logo
          };
        }
      } else {
        this.$tips({ type: 'error', message: '初始化数据失败' });
      }
    },
    // 模板消息初始化
    templateInit(template) {
      this.template.templateKeyDataList = template.templateKeyDataList;
      this.template.templateKeyDataList.map((v, i) => {
        v.type = v.datas ? v.datas.split('#')[0] : '';
        v.color = v.datas ? '#' + (v.datas.split('#')[1] || '173177') : '#173177';
        this.$set(this.template.templateKeyDataList, i, {
          color: v.color,
          type: v.type,
          createTime: v.createTime,
          datas: v.datas,
          keyName: v.keyName,
          keywords: v.keywords,
          orders: v.orders,
          queryMap: v.queryMap,
          queryOrder: v.queryOrder,
          querySize: v.querySize,
          querySort: v.querySort,
          queryStart: v.queryStart,
          templateId: v.templateId,
          templateKeyDataId: v.templateKeyDataId,
          updateTime: v.updateTime
        });
      });
      this.template.weixinTemplateId = template.weixinTemplateId;
      this.template.templateBusiness = template.templateBusiness;
      this.template.typeCode = template.typeCode;
      this.template.templateName = template.templateName;
      this.template.title = template.title;
      this.template.urlType = template.urlType;
      this.template.header = template.header;
      this.template.remark = template.remark;
      this.template.headerText = this.template.header ? this.template.header.split('#')[0] : '';
      this.template.headerColor = this.template.header ? '#' + (this.template.header.split('#')[1] || '173177') : '#173177';
      this.template.remarkText = this.template.remark ? this.template.remark.split('#')[0] : '';
      this.template.remarkColor = this.template.remark ? '#' + (this.template.remark.split('#')[1] || '173177') : '#173177';
      this.template.updateTime = template.updateTime;
      this.template.jumpUrl = template.jumpUrl;
      this.template.jumpUrlInfo = template.jumpUrlInfo;
      this.template.triggerCode = template.triggerCode;

      this.options.map(v => {
        // console.log(this.template.headerText.indexOf(v.value) > -1);
        if (this.template.headerText.indexOf(v.value) > -1) {
          this.template.headerText = this.template.headerText.replace(v.value, v.label);
        }
        if (this.template.remarkText.indexOf(v.value) > -1) {
          this.template.remarkText = this.template.remarkText.replace(v.value, v.label);
        }
      });
    },
    // 下拉触发模板消息的改变
    changeTemplate() {
      let template = null;
      this.templateOptions.map(v => {
        if (this.triggerCode === v.triggerCode) {
          template = v;
        }
      });
      this.templateInit(template);
    },
    // 预修改模板
    editTemplatePre() {
      this.editDialogShow = true;
      this.copyTemplate = JSON.parse(JSON.stringify(this.template));
    },
    // 修改模板
    editTemplate() {
      this.editDialogShow = false;
      this.template = JSON.parse(JSON.stringify(this.copyTemplate));
    },
    // 预插入变量
    insetVarPre(val) {
      this.varShow = true;
      this.currentTxet = val;
    },
    // 插入变量
    insetVar(val) {
      console.log(val, this.copyTemplate[this.currentTxet]);
      if (typeof this.currentTxet === 'number') {
        this.copyTemplate.templateKeyDataList[this.currentTxet].type += val;
      }
      this.copyTemplate[this.currentTxet] += val;
    },
    // 重置模板
    resetTemplate() {
      this.getCardPutonDetail(true);
    },
    // 变量弹窗关闭
    close() {
      this.editDialogShow = false;
    },

    // 保存校验
    async submit(formName) {
      // console.log(this.form.memberSearchDTO)
      // // 这里强制获取人群筛选器的配置项
      // await this.$refs.peopleFilter.confirmSet();
      console.log(this.getSaveData);

      if (this.form.memberType === 0 && this.toggleTag && !this.getSaveData) {
        this.$tips({ type: 'warning', message: '人群筛选未保存条件' });
        return;
      }
      if (this.form.memberType === 2 && !this.form.memberGroupIds) {
        this.$tips({ type: 'warning', message: '会员分组不能为空' });
        return;
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          this.$confirm('是否群发卡券?', '提示', {
            confirmButtonText: '确定',
            cancelBUttonText: '取消',
            type: 'warning'
          })
            .then(() => {
              this.sendCard();
            })
            .catch(() => {
              this.$tips({ type: 'info', message: '已取消提交' });
            });
        } else {
          this.$tips({ type: 'warning', message: '表单未填写完整' });
          return false;
        }
      });
    },
    // 计算发送多少人
    async sendCard() {
      let params = {
        // memberSearchDTO:this.form.memberSearchDTO,
        memberSearchDTO: this.form.memberType ? this.form.memberGroupIds : this.form.memberSearchDTO,
        memberType: this.form.memberType,
        memberIds: this.form.openIds,
        cardId: this.form.cardId
      };
      let res = await checkPutonMemberIds(params);
      if (res.errorCode === 0) {
        let sumPerson = res.result.totalSendCount;
        this.$confirm(`合计发送${sumPerson}人，是否发送？`, '提示', {
          confirmButtonText: '确定',
          cancelBUttonText: '取消',
          type: 'warning'
        })
          .then(() => {
            this.saveUpdatePutonCard();
          })
          .catch(() => {
            this.$tips({ type: 'info', message: '已取消提交' });
          });
      } else {
        this.$tips({ type: 'error', message: '操作失败' });
      }
      console.log(res);
    },
    // 保存操作
    async saveUpdatePutonCard() {
      let params = {
        putOnName: this.form.putOnName, // 1.活动名称
        cardId: this.form.cardId, // 2.投放卡券,卡券主键ID
        sceneSettingId: this.form.sceneSettingId, // 3.营销场景
        memberType: this.form.memberType, // 4.选择会员类型: 会员筛选: 0; 指定会员: 1
        // memberSearchDTO:this.form.memberSearchDTO, // JSON.Stringify 人群筛选器
        memberSearchDTO: this.form.memberType ? this.form.memberGroupIds : this.form.memberSearchDTO,
        putOnType: this.form.putOnType, // 发送时间, 0:立即发送; 1:定时发送(定时必须选择时间)
        searchJson: this.getSaveData,
        noticeType: this.form.noticeType
      };

      /*  模板消息的处理 */
      if (this.form.noticeType === 2) {
        let marketingTemplate = {};
        let header = this.template.headerText;
        let remark = this.template.remarkText;
        this.options.map(v => {
          if (header.indexOf(v.label) > -1) {
            // console.log(new RegExp((v.label+'/g')))
            header = header.replace(v.label, v.value);
          }
          if (remark.indexOf(v.label) > -1) {
            remark = remark.replace(v.label, v.value);
          }
        });
        this.template.templateKeyDataList = this.template.templateKeyDataList.map(v => ({
          keyName: v.keyName,
          keywords: v.keywords,
          datas: v.type + v.color,
          orders: v.orders
        }));
        marketingTemplate = {
          weixinTemplateId: this.template.weixinTemplateId,
          templateBusiness: this.template.templateBusiness,
          typeCode: this.template.typeCode,
          templateName: this.template.templateName,
          title: this.template.title,
          urlType: this.template.urlType,
          jumpUrl: this.template.jumpUrl,
          jumpUrlInfo: this.template.jumpUrlInfo,
          triggerCode: this.template.triggerCode,
          header: header + this.template.headerColor,
          remark: remark + this.template.remarkColor,
          templateKeyDataList: this.template.templateKeyDataList
        };
        params.marketingTemplate = JSON.stringify(marketingTemplate);
      }

      if (this.form.memberType === 1) {
        params.memberIds = this.form.openIds; // 指定会员:memberType = 1, 多个会员memberId用逗号拼接
      }
      if (this.form.putOnType) {
        params.putOnTime = formatDateTimeByType(this.form.putOnTime, 'yyyy-MM-dd-HH-mm-ss');
      }
      if (this.$route.meta.type === 'edit') {
        params.coupCardPutOnId = this.$route.params.id; // 投放主键ID, 新建不传; 修改传
      }
      saveUpdatePutonCard(params)
        .then(res => {
          if (res.errorCode === 0) {
            if (this.isEdit) {
              this.$confirm('卡券投放成功, 是否返回列表?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              })
                .then(() => {
                  this.$router.go(-1);
                })
                .catch(err => {
                  this.getCardPutonDetail();
                });
            } else {
              this.$router.go(-1);
            }
          } else {
            this.$tips({ type: 'error', message: '操作失败' });
          }
        })
        .catch(err => {
          this.$tips({ type: 'error', message: '操作失败' });
        });
    },

    /*-------人群筛选器的方法-------*/
    getData() {
      this.$refs.peopleFilter.confirmSet();
    },
    // 子组件触发父组件事件,返回过滤条件数据
    findFilter(value) {
      this.form.memberSearchDTO = value;
    },
    // 取消
    cancelFilter() {
      this.$refs.peopleFilter.cancelSet();
    },
    // 获取需要回显的数据, 供保存时候使用
    getBackData(val) {
      console.log(val);
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
    //获取指定会员
    getConfirmData(val) {
      this.form.openIds = val;
    },
    // 会员分组方法
    handleDataTransferred(data) {
      // 会员分组 情况下 memberSearchDTO 传数组字符串
      if (this.form.memberType === 2) {
        this.form.memberGroupIds = data
          .map(v => v.memberTagGroupId)
          .filter(v => v)
          .join(',');
      }
    },
    handleDataLeft(selectedData, selectionToRemove) {
      console.log(selectedData, selectionToRemove);
    }
  },
  filters: {
    filterDate(val) {
      if (val) {
        return `${new Date(val).getMonth() + 1}月${new Date(val).getDate()}日`;
      } else {
        return '未知时间';
      }
    }
  }
};
</script>
<style lang="scss" scoped>
.ecm-msg__edit {
  display: inline-block;
  vertical-align: top;
  max-height: 400px;
  overflow: auto;
  &--inner {
    background: #fff;
    width: 566px;
    /deep/ .input-suffix {
      width: 448px;
      height: 40px;
      background: #f0f2f5;
      border: 1px solid #e4e7ed;
      border-top: none;
      border-radius: 0 0 4px 4px;
    }
    /deep/ .el-textarea__inner {
      color: inherit;
    }
    /deep/ .el-form-item {
      margin-bottom: 3px;
    }
  }
}
.ecm-msg__preview {
  position: relative;
  width: 320px;
  display: inline-block;
  vertical-align: middle;
  &--inner {
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    background: #fff;
    width: 320px;
    min-height: 100px;
    top: 103px;
    left: 37px;
    padding: 20px 10px 10px;

    .pre-templateName {
      font-size: 17px;
      font-weight: 700;
    }
    .pre-updateTime {
      font-size: 14px;
      line-height: 1.5;
    }
    .pre-header {
      font-size: 15px;
      margin: 10px 0;
    }
    .pre-keyName {
      font-size: 14px;
      line-height: 1.5;
    }
    .pre-remark {
      font-size: 15px;
      margin: 20px 0 10px 0;
    }
    .pre-foot {
      border-top: 1px solid #dcdfe6;
      padding-top: 5px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
  }
}
</style>
