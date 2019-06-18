import { getEcmInfo, saveEcmInfo } from '@/service/api/ecmApi.js';
import { listTemplateVariables } from '@/service/api/msgApi.js';
import { sceneSettingList } from '@/service/api/commonApi.js';
import { klflStrategy } from '@/service/api/gameApi.js'; // 会员等级列表接口
import marketingEvent from './marketing-event/index.vue';
import { formatDateTimeByType } from '@/utils/index.js';
import { isEmpty, numOfDecimal } from '@/utils/strlen.js';
import itemCard from './partials/item-card.vue';
import varDialog from './partials/variables.vue';
export default {
  name: 'ecm-manage',
  data() {
    return {
      ecmPlanId: '', // 必传,
      code: '1001',
      loading: false,
      effectActionOptions: [{ value: 'subscribe', label: '关注触发' }, { value: 'authentication', label: '认证触发' }, { value: 'consume', label: '消费触发' }, { value: 'upgrade', label: '会员卡升级触发' }, { value: 'degrade', label: '会员卡降级触发' }],
      marketingTimesTypeOptions: [{ value: 0, label: '总共触发' }, { value: 1, label: '每天触发' }, { value: 2, label: '每周触发' }, { value: 3, label: '每月触发' }, { value: 4, label: '每年触发' }, { value: -1, label: '无限次触发' }],
      dayOptions: Array(24)
        .fill()
        .map((v, i) => ({ value: i, label: i + ':00' })),
      sceneSettingIdOptions: [],
      // 消费触发错误提示
      // error_cost_info: '',
      // error_cost_count_info: '',
      form: {
        memberType: 0,
        ecmPlanName: '',
        effectType: 0,
        effectTime: 0,
        effectAction: 'subscribe',
        sceneSettingId: '',
        sceneSettingName: '',
        expireType: 0,
        cardId: '',
        mediaId: '',
        imageTextId: '',
        textContent: '',
        title: '',
        describe: '',
        lateDays: '',
        brithday_day: '',
        attention_day: '',
        lastCost_day: '',
        memberSearchDTO: '',
        memberGroupIds: '',
        beginDate: '',
        endDate: '',
        cardNoticeType: 2,
        templateNoticeFlag: 0,
        // 判断模板消息能否使用
        templateUseEnable: 1,
        marketingTimesType: 0,
        marketingTimes: 1,
        gradeIds: [],
        //消费触发
        lowest_cost: '',
        max_cost: '',
        lowest_cost_count: '',
        max_cost_count: '',
        store_mode: 0,
        order_store: ''
      },
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
      dateTime: ['', ''],
      endDatePickerOptions: {
        disabledDate(time) {
          return time.getTime() < Date.now() - 8.64e7;
        }
      },
      checked: [],
      rules: {
        ecmPlanName: { type: 'string', required: true, message: '计划名称不能为空', trigger: 'blur' }
      },
      isEdit: this.$route.meta.type === 'edit',
      isAdd: this.$route.meta.type === 'add',
      // 人群筛选器可传参数
      sceneValue: 'member', // 场景值
      useId: '', // 模板id
      hasSearchData: '', // 当前页回显的数据(接口返回)
      toggleTag: false, // 控制按钮显示的参数,仅供参考,可自行修改
      getSaveData: '',
      saveTag: false,

      enabledMessageState: 0, // 能否发送短信，接口获取
      showMessage: false, // 有效时间展示错误信息flag
      currentCard: {},
      varDialogShow: false, // 常量弹窗show
      currentTxet: '',
      options: [],
      editDialogShow: false,
      gradeList: [],
      // 会员分组可传参数
      defaltSelected: [], //  默认穿梭窗已选入数据
      projectName: 'marketing', // 默认是memberTag
      headerList: ['isRealTime', 'latestUpdateTime', 'updateType', 'effectiveStatus', 'effectiveDate'],
      effectiveStatus: 1, // 不传： 所有状态 1： 有效 0： 失效

      templateOptions: [],
      triggerCode: ''
    };
  },
  components: {
    'marketing-event': marketingEvent,
    'item-card': itemCard,
    'var-dialog': varDialog
  },
  watch: {
    checked(val) {
      switch (val[0]) {
        case 'brithday_day':
          if (!this.form.brithday_day) {
            this.form.brithday_day = 1;
          }
          this.form.attention_day = 0;
          this.form.lastCost_day = 0;
          break;
        case 'attention_day':
          if (!this.form.attention_day) {
            this.form.attention_day = 1;
          }
          this.form.brithday_day = 0;
          this.form.lastCost_day = 0;
          break;
        case 'lastCost_day':
          if (!this.form.lastCost_day) {
            this.form.lastCost_day = 1;
          }
          this.form.brithday_day = 0;
          this.form.attention_day = 0;
          break;
        default:
          this.form.brithday_day = 0;
          this.form.attention_day = 0;
          this.form.lastCost_day = 0;
          break;
      }
    }
  },
  computed: {
    asideShow() {
      return this.$store.state.marketing.asideShow;
    },
    marketingTimesTips() {
      let tips = '';
      switch (this.form.marketingTimesType) {
        case 0:
          tips = `总共对同个会员触发${this.form.marketingTimes}次`;
          break;
        case 1:
          tips = `在一天内对同个会员触发${this.form.marketingTimes}次，每天0:00刷新触发次数`;
          break;
        case 2:
          tips = `在一周内对同个会员触发${this.form.marketingTimes}次，每周一0:00刷新触发次数`;
          break;
        case 3:
          tips = `在一个月内对同个会员触发${this.form.marketingTimes}次，每月1号0:00刷新触发次数`;
          break;
        case 4:
          tips = `在一年内对同个会员触发${this.form.marketingTimes}次，每年1月1号0:00刷新触发次数`;
          break;
        case 5:
          tips = `对同个会员触发无限次`;
          break;
      }
      return tips;
    }
  },
  created() {
    // 设置面包屑
    let breadcrumbName = '智能营销编辑';
    if (this.isAdd) {
      this.sceneSettingList();
      breadcrumbName = '智能营销新增';
    }
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '智能营销', path: '/ecm' }, { name: breadcrumbName, path: '' }]);
    this.listTemplateVariables();
  },
  methods: {
    /* ----------------核心方法--------------- */
    // 获取变量列表
    async listTemplateVariables() {
      this.loading = true;
      try {
        let res = await listTemplateVariables();
        if (res.errorCode === 0) {
          const result = res.result;
          this.options = Object.keys(result).map(v => ({ label: result[v], value: v }));
        }
        this.getEcmInfo();
      } catch (err) {
        console.log(err);
      }
    },
    // 获取营销场景
    async sceneSettingList() {
      let res = await sceneSettingList();
      this.sceneSettingIdOptions = res.result || [];
    },
    // 获取ecm信息
    async getEcmInfo(isResetTemplate = false) {
      this.loading = true;
      let res = await getEcmInfo({ ecmPlanId: this.$route.params.id });
      this.loading = false;
      // 如果是模板重置不需要重置基本信息
      if (!isResetTemplate) {
        const result = res.result.ecmDTO;
        const commonScene = res.result.commonScene;
        const consumTrigger = res.result.consumTrigger;
        this.enabledMessageState = res.result.enabledMessageState || 0;
        if (result && this.isEdit) {
          this.ecmPlanId = this.form.ecmPlanId = result.ecmPlanId || '';
          this.form.ecmPlanName = result.ecmPlanName;
          this.form.effectType = result.effectType;
          this.form.effectTime = result.effectTime;
          this.form.effectAction = result.effectAction;
          this.form.sceneSettingId = result.sceneSettingId;
          this.form.sceneSettingName = result.sceneSettingName;
          this.form.memberType = result.memberType;
          this.form.expireType = result.expireType;
          //处理会员等级
          this.form.gradeIds = (result.gradeIds && result.gradeIds.split(',').filter(v => v)) || [];
          //营销次数配置
          this.form.marketingTimesType = result.marketingTimesType || 0;
          this.form.marketingTimes = result.marketingTimes || 1;
          //'0-不通知 1-微信对话框 2-模板消息   补发通知 0-不补发 1-补发'
          this.form.cardNoticeType = result.cardNoticeType || 0;
          this.form.templateNoticeFlag = result.templateNoticeFlag || 0;
          // 判断回显
          if (this.form.memberType === 0) {
            this.form.memberSearchDTO = result.filterJson;
          } else {
            //会员分组
            this.form.memberGroupIds = result.filterJson || '';
            this.defaltSelected = res.result.tagGroupList || [];
          }
          if (this.form.expireType) {
            this.form.beginDate = result.beginDate || '';
            this.form.endDate = result.endDate || '';
          }
          if (res.result.searchId) {
            this.useId = res.result.searchId || '';
            // console.log(this.useId, 'useid');
            this.hasSearchData = result.filterJson || '{}';
          }
          if (this.form.effectType === 1) {
            this.form.brithday_day = commonScene.brithday_day;
            this.form.attention_day = commonScene.attention_day;
            this.form.lastCost_day = commonScene.lastCost_day;
            if (this.form.brithday_day) {
              this.checked = ['brithday_day'];
            } else if (this.form.attention_day) {
              this.checked = ['attention_day'];
            } else if (this.form.lastCost_day) {
              this.checked = ['lastCost_day'];
            }
          }
        } else if (this.isAdd) {
          this.ecmPlanId = res.result.templateEcmPlanId || '';
        }
        this.form.templateUseEnable = res.result.templateUseEnable;
        this.$nextTick(_ => {
          this.effectActionChange(true);
        });
        // 处理消费触发
        if (consumTrigger) {
          const _mapConsumeArr = ['lowest_cost', 'max_cost', 'lowest_cost_count', 'max_cost_count'];
          _mapConsumeArr.map(v => {
            // 为空为null代表无限制
            if (isEmpty(consumTrigger[v])) {
              this.form[v] = undefined;
            } else {
              this.form[v] = consumTrigger[v];
            }
          });
          this.form.store_mode = consumTrigger.store_mode || 0; /** 门店类型: 0: 所有门店, 1: 部分(包含部分门店, 部分分组等) **/
          this.form.order_store = consumTrigger.order_store || ''; /** 消费门店key值 **/
        }
        // 触发门店初始化
        if (this.form.effectAction === 'consume' && this.form.store_mode) {
          this.$nextTick(_ => {
            this.$refs.storeCard.init();
          });
        }
      }
      if (!this.form.templateUseEnable) return;
      let template = null;
      this.templateOptions = res.result.marketingTemplateList || [];
      if (!this.isAdd) {
        template = res.result.customMarketingTemplate;
      } else {
        template = res.result.marketingTemplateList[0];
      }
      this.triggerCode = template.triggerCode;
      // 模板消息
      if (template) {
        this.templateInit(template);
      }
      // 新增给消费触发增加默认最小值
      if (this.isAdd) {
        this.form.lowest_cost = 1;
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
      this.varDialogShow = true;
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
      this.getEcmInfo(true);
    },
    // 变量弹窗关闭
    close() {
      this.editDialogShow = false;
    },

    // 保存 校验
    async submit(formName) {
      // // 这里强制获取人群筛选器的配置项
      // await this.$refs.peopleFilter.confirmSet();
      // 判断时间
      if (this.checkBeginEndTime()) return;
      const hasMessageInList = this.$refs.marketingEvent.hasMessageInList();
      // 判断是否能发送短信
      if (hasMessageInList && this.isMessageForbidden()) return;

      if (this.form.expireType && (!this.form.beginDate || !this.form.endDate)) {
        this.$tips({ type: 'warning', message: '固定期限不能为空' });
        return;
      }

      if (this.form.memberType === 0 && this.toggleTag && !this.getSaveData) {
        this.$tips({ type: 'warning', message: '人群筛选未保存条件' });
        return;
      }
      if (this.form.memberType === 1 && !this.form.memberGroupIds) {
        this.$tips({ type: 'warning', message: '会员分组不能为空' });
        return;
      }
      // 如果是消费触发
      // if (this.form.effectAction === 'consume') {
      //   const errorLowestCost = this.handleLowestCost();
      //   const errorLowestCostCount = this.handleLowestCostCount();
      //   if (errorLowestCost !== '' || errorLowestCostCount !== '') {
      //     this.$tips({ type: 'warning', message: '消费触发配置错误' });
      //     return;
      //   }
      // }

      let params = {
        ecmPlanId: this.form.ecmPlanId || '',
        templateEcmPlanId: this.isAdd ? this.ecmPlanId : '',
        ecmPlanName: this.form.ecmPlanName, //	是	int	计划名称不能为空,且最多9个汉字
        effectType: this.form.effectType, //是	int	时效: 实时: 0; 每天: 1
        effectTime: this.form.effectTime, //否	int	effectType = 1每天时必填, 时效为时间为0-23
        effectAction: this.form.effectAction, //	否	string	effectType = 0实时时必填, 关注触发: ‘subscribe’; 认证触发: ‘authentication’
        marketingType: this.form.marketingType, //是	String	营销方式: 卡券营销: ‘card’; 短信营销 : ‘message’; 图文营销: ‘teletext’; 文本营销: ‘text’; 话务: ‘teltask’; 微信图片: ‘image’
        memberType: this.form.memberType,
        memberSearchDTO: this.form.memberType ? this.form.memberGroupIds : this.form.memberSearchDTO,
        searchJson: this.getSaveData,
        expireType: this.form.expireType,
        beginDate: this.form.expireType ? formatDateTimeByType(this.form.beginDate, 'yyyy-MM-dd-HH-mm-ss') : '',
        endDate: this.form.expireType ? formatDateTimeByType(this.form.endDate, 'yyyy-MM-dd-HH-mm-ss') : '',

        cardNoticeType: this.form.cardNoticeType,
        templateNoticeFlag: this.form.templateNoticeFlag,
        gradeIds: this.form.gradeIds.join(',') || '',
        marketingTimesType: this.form.marketingTimesType,
        marketingTimes: this.form.marketingTimes
      };
      // 如果是消费触发
      // 不填代表没有上下限，不传该字段
      if (this.form.effectAction === 'consume') {
        const _mapConsumeArr = ['lowest_cost', 'max_cost', 'lowest_cost_count', 'max_cost_count'];
        let consumeObj = {
          store_mode: this.form.store_mode,
          order_store: this.form.order_store
        };
        _mapConsumeArr.map(v => {
          // 保存的消费触发上下限数据，没有填写的字段不传
          let val = this.form[v];
          if (!isEmpty(val)) {
            consumeObj[v] = val;
          }
        });
        params = Object.assign(params, consumeObj);
      }

      if (this.form.effectType) {
        params[this.checked[0]] = this.form[this.checked[0]] || 0;
      }

      if (this.isAdd) {
        params.sceneSettingId = this.form.sceneSettingId; //	否	String	营销场景
      }
      // 如果适用人群-人群筛选器可编辑：需要调用await this.$refs.threshold.triggerPeopleSet(); 强制触发回显，否则数据保存有错误
      // await this.triggerPeopleSet();
      /*  模板消息的处理 */
      if (this.currentCard.comName === 'item-card' && ((this.form.cardNoticeType === 1 && this.form.effectType === 0 && this.form.templateNoticeFlag === 1) || this.form.cardNoticeType === 2)) {
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

      // 这里判断部分门店是否为空
      if (this.form.store_mode) {
        let data = await this.$refs.storeCard.getRightList();
        if (!data.length) {
          this.$tips({ type: 'warning', message: '部分门店不能为空' });
          return;
        }
      }

      this.$refs[formName].validate(valid => {
        if (valid) {
          this.saveEcmInfo(params);
        } else {
          this.$tips({ type: 'warning', message: '表单填写不完整' });
          return false;
        }
      });
    },
    // 保存
    saveEcmInfo(params) {
      if (this.loading) {
        return;
      }
      this.loading = true;
      saveEcmInfo(params)
        .then(res => {
          this.loading = false;
          if (res.errorCode === 0) {
            if (this.isEdit) {
              this.$confirm('操作成功, 是否返回列表?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              })
                .then(() => {
                  this.$router.go(-1);
                })
                .catch(err => {
                  this.getEcmInfo();
                });
            } else {
              this.$router.go(-1);
            }
          } else {
            this.$tips({ type: 'error', message: res.message || '操作失败' });
          }
        })
        .catch(err => {
          this.loading = false;
        });
    },
    //加载会员卡等级
    getGradeList() {
      return new Promise((resolve, reject) => {
        klflStrategy({}).then(res => {
          if (res.errorCode === 0) {
            resolve(res.result.gradeList || []);
          }
          reject();
        });
      });
    },
    // 触发行为变化 会员卡升降级
    effectActionChange(isInit = false) {
      if (this.form.effectAction === 'upgrade') {
        if (isInit !== true) this.form.gradeIds = [];
        this.getGradeList().then(data => {
          this.gradeList = data.map((v, i) => {
            if (!i) {
              v.disabled = true;
            }
            return v;
          });
          //  console.log(this.gradeList)
        });
      } else if (this.form.effectAction === 'degrade') {
        if (isInit !== true) this.form.gradeIds = [];
        this.getGradeList().then(data => {
          this.gradeList = data.reverse().map((v, i) => {
            if (!i) {
              v.disabled = true;
            }
            return v;
          });
          // console.log(this.gradeList )
        });
      }
    },
    // 消费触发
    handleLowestCost() {
      const { lowest_cost, max_cost } = this.form;
      let info = '';
      if (isEmpty(lowest_cost) && isEmpty(max_cost)) {
        info = '消费金额上下限必填一个';
      } else if (lowest_cost > max_cost && max_cost) {
        info = '消费金额区间设置错误';
      } else if (numOfDecimal(lowest_cost) > 2 || numOfDecimal(max_cost) > 2) {
        info = '消费金额最多保留两位小数';
      }
      this.error_cost_info = info;
      return info;
    },
    handleLowestCostCount() {
      const { lowest_cost_count, max_cost_count } = this.form;
      let info = '';
      if (isEmpty(lowest_cost_count) && isEmpty(max_cost_count)) {
        info = '消费件数上下限必填一个';
      } else if (lowest_cost_count > max_cost_count && max_cost_count) {
        info = '消费件数区间设置错误';
      } else if (numOfDecimal(lowest_cost_count) > 0 || numOfDecimal(max_cost_count) > 0) {
        info = '消费件数必须为正整数';
      }
      this.error_cost_count_info = info;
      return info;
    },
    changeChecked(e) {
      console.log(e);
    },

    /* ----------------辅助方法--------------- */
    //  对比开始时间结束时间
    checkBeginEndTime() {
      let beginDate = this.form.beginDate && new Date(this.form.beginDate);
      let endDate = this.form.endDate && new Date(this.form.endDate);
      if (this.form.expireType && beginDate && endDate && beginDate.getTime() > endDate.getTime()) {
        this.$tips({ type: 'warning', message: '开始时间不能大于结束时间' });
        // this.form.beginDate = this.form.endDate;
        this.showMessage = true;
        return true;
      } else {
        this.showMessage = false;
        return false;
      }
    },
    // 是否禁止发短信 逻辑 => 当用户选择每天发送，且短信模板选择为营销短信时，需要判断定时发送时间是否在08:00至22:00之间，若否则停留在新建计划页面，禁止短信群发并进行提醒。
    isMessageForbidden() {
      // console.log(this.$refs.marketingEvent.hasMessageInList(),this.form.effectType === 1,this.form.effectTime)
      if (this.form.effectType === 1 && (this.form.effectTime >= 22 || this.form.effectTime <= 8)) {
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
        return true;
      } else {
        return false;
      }
    },
    // 接收的子方法 是否有卡券 value为卡券
    hasCard(value) {
      this.currentCard = value;
    },
    // 初始化门店左侧数据
    initStoreCardLeft() {
      if (this.form.store_mode) {
        if (this.isAdd) {
          // 这里新增的情况下也要初始化 门店组件
          this.$nextTick(_ => {
            this.$refs.storeCard.init();
          });
        } else {
          this.$nextTick(_ => {
            this.$refs.storeCard.initLeftList();
          });
        }
      }
    },
    /* ----------------人群筛选器的方法--------------- */
    // async triggerPeopleSet() {
    //   await this.$refs.peopleFilter.confirmSet();
    // },
    getData() {
      this.$refs.peopleFilter.confirmSet();
    },
    // 子组件触发父组件事件,返回过滤条件数据 -- 仅新增时保存
    findFilter(value) {
      if (this.isAdd) {
        this.form.memberSearchDTO = value;
      }
    },
    // 取消
    cancelFilter() {
      this.$refs.peopleFilter.cancelSet();
    },
    // 获取需要回显的数据, 供保存时候使用 -- 仅新增时保存
    getBackData(val) {
      return new Promise((resolve, reject) => {
        if (this.isAdd) {
          this.getSaveData = val;
        }
        // console.log(this.getSaveData, val);
        resolve();
      });
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
      // 只有新增时处理数据
      if (this.form.memberType === 1 && this.isAdd) {
        this.form.memberGroupIds = data
          .map(v => v.memberTagGroupId)
          .filter(v => v)
          .join(',');
      }
    },
    handleDataLeft(selectedData, selectionToRemove) {
      // 不可编辑 不做处理
      // console.log(selectedData, selectionToRemove);
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
