/**
 * 卡券新增编辑
 */
import dmUploadImg from '@/components/upload/img';
import imgTextDrag from './partials/imgtext-drag';
import { formatDateTimeByType } from '@/utils/index.js';
import { cardGetShelfs, getCardDetail, saveUpdateCard, copyCardDetailService, getCategoryList, getPropertyList, getPropertyValueList } from '@/service/api/cardApi.js';
import dmGoodsInput from '@/components/goods-input/index.vue';
const initForm = {
  auditingStatus: '',
  cardType: 0, // 1.卡券类型: 抵金券: 0; 折扣券: 1; 兑换券: 2
  cardName: '', // 2.卡券名称
  cardApplyChannel: [], // 卡券适用渠道
  subName: '', // 3.备注名
  subTitle: '', // 4.卡券副标题
  erpDemoCode: '', // demo券号
  cardColor: '#1890ff', //5.卡券颜色
  useCondition: null, // 6. 抵金券 减免金额; 折扣券 折扣额度
  cardLimit: 1,
  useCustomCode: 0,
  cardCodeCount: 100000,
  customCodeBegin: '',
  customCodeEnd: '',
  customCodePrefix: '',
  customCodeSuffix: '',
  useCodePrefix: 0,
  useCodeSuffix: 0,
  cardEffectiveMode: 0,
  dateTime: [],
  costValue: 0, //成本费用
  startDay: 0,
  limitDay: null,
  cardExplain: '',
  image: {
    imgUrl: '',
    code: ''
  },
  coverDescript: '',
  useDescript: '',
  shelfIds: [],
  verificationType: 0,
  cardDenomination: 0,
  proNoList: [],
  discount_amount_upper_limit: 0,
  goods_discounts_number_upper_limit: 0,
  products_exchange_number: 0
};
const sale_limit = { fee: 0, goods: '', flag: false, type: 0 }; //最低消费
const goods = { ok: '', no: '', flag: false };
export default {
  data() {
    return {
      requestProject: 'marketing',
      uuid: '',
      loading: false,
      submitLoading: false,
      cardShelfsLoading: false, //卡券展架loading
      form: JSON.parse(JSON.stringify(initForm)),
      sale_limit: JSON.parse(JSON.stringify(sale_limit)),
      goods: JSON.parse(JSON.stringify(goods)),
      only: false,
      cardLimitRadio: 1,
      rules: {
        cardApplyChannel: { required: true, type: 'array', message: '请选择卡券渠道', trigger: 'change' },
        cardName: { required: true, message: '请输入卡券名称', trigger: 'blur' },
        subName: { required: true, message: '请输入备注名称', trigger: 'blur' },
        subTitle: { required: true, message: '请输入卡券副标题', trigger: 'blur' },
        costValue: { required: true, type: 'number', min: 0, message: '请输入成本费用', trigger: 'blur' },
        cardDenomination: { required: true, type: 'number', message: '此项不能为空', trigger: 'blur' },
        cardExplain: { required: true, message: '适用门店说明不能为空', trigger: 'blur' },
        useDescript: { required: true, message: '使用说明不能为空', trigger: 'blur' }
      },
      startDayOptions: [],
      cardApplyChannelOptions: [],
      imgTextList: [],
      cardShelfsList: [],
      sendChildData: {
        storeType: 0,
        storeGroupIds: '',
        storeIds: []
      },
      pickerOptions: {
        disabledDate(val) {
          return Date.now() >= val.getTime() + 24 * 60 * 60 * 1000;
        }
      },
      isEdit: this.$route.meta.type === 'edit',
      isInfo: this.$route.meta.type === 'info',
      isCopy: this.$route.meta.type === 'copy',
      isAdd: this.$route.meta.type === 'add',
      storeMode: 0,
      // 兑换商品货号是否展示
      products_exchange_number_show: false,

      goodsDiscountCheck: true,
      discountAmountCheck: true,
      // ----微盟适用商品----
      f1: [], // 一层的list
      wmloading: false,
      goodsList: [
        {
          v1: '', // id
          v1name: '',
          f2: [], // 二层的数据
          v2: '',
          v2name: '',
          f3: [], // 三层的数据
          v3: '',
          v3name: []
        }
      ],
      coupGoodsWeimobList: []
      // ----微盟适用商品结束----
    };
  },
  watch: {
    'sale_limit.flag'(val) {
      if (!val) {
        this.sale_limit.type = 0;
        this.sale_limit.goods = null;
        this.sale_limit.fee = null;
      }
    },
    'form.proNoList'(val) {
      this.products_exchange_number_show = !!val.length;
      this.form.products_exchange_number = val.length ? 1 : 0;
    },
    discountAmountCheck(val) {
      if (val) {
        this.form.discount_amount_upper_limit = 0;
      } else if (this.form.discount_amount_upper_limit <= 0) {
        this.form.discount_amount_upper_limit = 1;
      }
    },
    goodsDiscountCheck(val) {
      if (val) {
        this.form.goods_discounts_number_upper_limit = 0;
      } else if (this.form.goods_discounts_number_upper_limit <= 0) {
        this.form.goods_discounts_number_upper_limit = 1;
      }
    },
    'form.discount_amount_upper_limit': {
      handler(val) {
        this.discountAmountCheck = val <= 0;
      },
      immediate: true
    },
    'form.goods_discounts_number_upper_limit': {
      handler(val) {
        this.goodsDiscountCheck = val <= 0;
      },
      immediate: true
    }
  },
  components: {
    'dm-upload-img': dmUploadImg,
    'img-text-drag': imgTextDrag,
    'dm-goods-input': dmGoodsInput
  },
  created() {
    this.cardGetShelfs();
    this.getCardDetail();
    this.getCategoryList(); // 获取适用商品第一层数据
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '卡券营销', path: '' }, { name: '卡券库', path: '/card/list' }, { name: '卡券详情', path: '' }]);
  },
  mounted() {
    if (this.isAdd) {
      this.$refs.storeCard.init();
    }
  },
  computed: {
    asideShow() {
      return this.$store.state.marketing.asideShow;
    }
  },
  methods: {
    //切换卡券类型  表单置为默认值
    reset(e) {
      this.form = JSON.parse(JSON.stringify(initForm));
      this.sale_limit = JSON.parse(JSON.stringify(sale_limit));
      this.goods = JSON.parse(JSON.stringify(goods));
      this.form.cardType = e;
      this.$nextTick(_ => {
        this.$refs.storeCard.initLeftList();
      });
      this.goodsList = [{ v1: '', f2: [], v2: '', f3: [], v3: [], list: [] }];
      // 新增情况下，如果配置了线下门店，默认选中线下门店
      if (this.isAdd && this.cardApplyChannelOptions.some(v => v.value === 'offlineStore')) {
        this.form.cardApplyChannel = ['offlineStore'];
      }
    },
    //卡券营销--卡券库--新建/修改卡券--放入卡券展架--所有展架集合
    cardGetShelfs() {
      this.cardShelfsLoading = true;
      cardGetShelfs({ cardGetShelfs: '' }).then(res => {
        let list = res.result;
        list.map(v => {
          v.key = v.shelfId;
          v.label = v.shelfName;
        });
        this.cardShelfsList = list;
        this.cardShelfsLoading = false;
      });
    },
    //卡券展架方法
    filterMethod(query, item) {
      return item.label.indexOf(query) > -1;
    },
    //卡券营销--卡券库--新建/编辑卡券/卡券记录-领取记录-点击卡券查看详情
    async getCardDetail() {
      this.loading = true;
      let res = null;
      if (this.isCopy) {
        res = await copyCardDetailService({ coupCardId: this.$route.params.id });
      } else {
        res = await getCardDetail({ coupCardId: this.$route.params.id });
      }
      if (res.errorCode === 0) {
        // 拉取卡券适用渠道的列表
        if (this.isAdd || this.isCopy) {
          this.cardApplyChannelOptions = res.result.systemCoupChannelList;
        } else {
          this.cardApplyChannelOptions = res.result.allChannelList;
        }

        // 新增情况下，如果配置了线下门店，默认选中线下门店
        if (this.isAdd && this.cardApplyChannelOptions.some(v => v.value === 'offlineStore')) {
          this.form.cardApplyChannel = ['offlineStore'];
        }
        //处理有效期下拉选项
        const dicMap = res.result.dicMap;
        this.startDayOptions = Object.keys(dicMap).map(key => ({ label: dicMap[key].dictName == '0' ? '当天' : '第' + dicMap[key].dictName + '天', value: parseInt(dicMap[key].dictName) }));
        if (res.result.card) {
          const card = res.result.card;
          this.storeMode = card.storeMode === 0 ? 0 : 1;
          this.form.cardApplyChannel = card.cardApplyChannel ? card.cardApplyChannel.split(',') : [];
          this.form.auditingStatus = card.auditingStatus || '';
          this.form.coupCardId = this.isCopy ? '' : card.coupCardId;
          this.form.cardType = card.cardType;
          this.form.cardName = card.cardName || '';
          this.form.subName = card.subName || '';
          this.form.subTitle = card.subTitle || '';
          this.form.erpDemoCode = card.erpDemoCode || '';
          this.form.cardColor = card.cardColor;
          this.form.cardDenomination = card.cardDenomination || 0;
          if (card.useCondition) {
            const useCondition = (this.form.useCondition = JSON.parse(card.useCondition));
            this.sale_limit.fee = useCondition.sale_limit ? useCondition.sale_limit.fee || 0 : 0;
            this.sale_limit.goods = useCondition.sale_limit ? useCondition.sale_limit.goods || '' : '';
            this.sale_limit.flag = this.sale_limit.fee || this.sale_limit.goods;
            if (this.sale_limit.fee) {
              this.sale_limit.type = 1;
              this.sale_limit.flag = true;
            } else if (this.sale_limit.goods) {
              this.sale_limit.type = 2;
            } else {
              this.sale_limit.type = 0;
            }
            this.goods.ok = useCondition.goods ? useCondition.goods.ok || '' : '';
            this.goods.no = useCondition.goods ? useCondition.goods.no || '' : '';
            this.form.goods_discounts_number_upper_limit = useCondition.goods_discounts_number_upper_limit || 0;
            this.form.discount_amount_upper_limit = useCondition.discount_amount_upper_limit || 0;
            this.form.products_exchange_number = useCondition.products_exchange_number || 0;
            if (this.goods.ok || this.goods.no) {
              this.goods.flag = true;
            }
            this.only = !!useCondition.only || false;
            this.form.proNoList = useCondition.proNo ? [{ name: useCondition.proNo, id: useCondition.proNo }] : [];
          }

          // 微盟适用商品
          // isCopy则第二三层不能编辑除非第一层变动;
          if ((card.cardType === 0 || card.cardType === 1) && this.form.cardApplyChannel.indexOf('WMmicroMall') !== -1 && card.coupGoodsWeimobList && card.coupGoodsWeimobList.length) {
            this.goodsList = card.coupGoodsWeimobList.map(v => {
              const f3Arr = JSON.parse(v.propValues); // 第三层的数据
              let f2 = [
                {
                  id: v.propId,
                  title: v.propName
                  // outPropertyId
                }
              ];
              const f3 =
                f3Arr.map(y => {
                  f2[0].outPropertyId = y.relationIds.split('_')[0];
                  return {
                    id: y.valueId,
                    title: y.valueName,
                    outValueId: y.relationIds.split('_')[1]
                  };
                }) || [];
              return {
                isCopy: this.isCopy,
                v1: v.categoryId,
                v1name: v.categoryName,
                f2,
                v2: v.propId,
                v2name: v.propName,
                f3,
                v3: f3Arr.map(y1 => y1.valueId) || [],
                v3name: f3Arr || []
              };
            });
            this.coupGoodsWeimobList = card.coupGoodsWeimobList;
          }

          this.form.cardLimit = card.cardLimit;
          if (this.form.cardLimit === 1) {
            this.cardLimitRadio = 1;
          } else if (this.form.cardLimit === 100) {
            this.cardLimitRadio = 100;
          } else {
            this.cardLimitRadio = 0;
          }
          this.form.useCustomCode = card.useCustomCode;
          if (this.isCopy && this.form.useCustomCode === 1) {
            this.form.customCodeBegin = '';
            this.form.customCodeEnd = '';
            this.form.customCodePrefix = '';
            this.form.customCodeSuffix = '';
            this.form.useCodePrefix = 0;
            this.form.useCodeSuffix = 0;
          } else {
            this.form.customCodeBegin = card.customCodeBegin;
            this.form.customCodeEnd = card.customCodeEnd;
            this.form.customCodePrefix = card.customCodePrefix;
            this.form.customCodeSuffix = card.customCodeSuffix;
            this.form.useCodePrefix = card.useCodePrefix || 0;
            this.form.useCodeSuffix = card.useCodeSuffix || 0;
          }
          this.form.cardCodeCount = card.cardCodeCount;
          this.form.cardEffectiveMode = card.cardEffectiveMode;
          this.form.dateTime = [card.beginDate || '', card.endDate || ''];
          this.form.costValue = card.costValue || 0;
          this.form.startDay = card.startDay || 0;
          this.form.limitDay = card.limitDay || 0;
          this.form.cardExplain = card.cardExplain || '';
          this.form.useDescript = card.useDescript || '';
          this.form.coverDescript = card.coverDescript || '';
          this.uuid = card.storeWidgetKey || '';
          this.$nextTick(_ => {
            this.$refs.storeCard.init();
          });
          this.form.image = {
            imgUrl: card.qcloudImageUrl || '',
            code: card.imageFieldCode || ''
          };
          this.imgTextList = [];
          if (card.teletexts.length > 0) {
            card.teletexts.map(v => {
              this.imgTextList.push({
                imgUrl: v.imageUrl,
                imgCode: v.imageFieldCode,
                text: v.teletextContent,
                cardTeletextId: v.cardTeletextId,
                flag: true,
                maskShow: false,
                copyImgUrl: '',
                copyText: '',
                copyImgCode: ''
              });
            });
          }
          this.form.shelfIds = card.shelfIds || [];
          this.form.verificationType = card.verificationType || 0;
        }
      } else {
        this.$tips({ type: 'error', message: '初始化数据失败' });
      }
      this.loading = false;
    },
    checkErpDemoCode() {
      this.form.erpDemoCode = this.form.erpDemoCode.replace(/[^\w\.\/]/gi, '');
    },
    //提交保存
    async submitForm(formName) {
      // 验证微盟适用商品 勾选适用商品
      if ((this.form.cardType === 0 || this.form.cardType === 1) && this.form.cardApplyChannel.indexOf('WMmicroMall') !== -1) {
        let wmProduct = await this.handleCombine();
        if (wmProduct === 1) {
          this.coupGoodsWeimobList = [];
        } else if (wmProduct) {
          this.coupGoodsWeimobList = wmProduct;
        } else {
          return;
        }
      }

      // 验证 减免金额 和 折扣额度
      if (this.form.cardType === 0) {
        if (Number(this.form.cardDenomination) <= 0) {
          this.$tips({ type: 'warning', message: '减免金额不能小于0' });
          return;
        }
      } else if (this.form.cardType === 1) {
        if (Number(this.form.cardDenomination) < 1) {
          this.$tips({ type: 'warning', message: '最低折扣不能小于1' });
          return;
        }
      }
      if (this.form.costValue <= 0 && this.form.cardType !== 1) {
        this.$tips({ type: 'warning', message: '成本必须大于0' });
        return;
      }

      // 验证号段  不能为空 起始号段和结尾号段必须位数一致
      if (this.form.useCustomCode) {
        if (!this.form.customCodeBegin || !this.form.customCodeEnd) {
          this.$tips({ type: 'warning', message: '起始号段和结尾号段不能为空' });
          return;
        }
        if (this.form.customCodeBegin.toString().length !== this.form.customCodeEnd.toString().length) {
          this.$tips({ type: 'warning', message: 'code起始号段和结尾号段必须位数一致' });
          return;
        }
        if (this.form.customCodeEnd - this.form.customCodeBegin + 1 > 100000) {
          this.$tips({ type: 'warning', message: '创建数量不能大于100,000张' });
          // this.form.customCodeEnd  = this.form.customCodeBegin  = 0;
          return;
        }
      }
      //验证有效期
      if (this.form.cardEffectiveMode) {
        if (!this.form.limitDay) {
          this.$tips({ type: 'warning', message: '有效期必填' });
          return;
        }
      } else {
        if (!this.form.dateTime || !this.form.dateTime[0]) {
          this.$tips({ type: 'warning', message: '有效期必填' });
          return;
        }
      }

      this.$refs[formName].validate(valid => {
        if (valid) {
          this.saveUpdateCard();
        } else {
          this.$tips({ type: 'warning', message: '表单提交错误，请检查表单是否填写完整' });
          return false;
        }
      });
    },
    //卡券营销--卡券库--保存卡券
    async saveUpdateCard() {
      if (this.submitLoading) {
        return;
      }

      let card = {};
      let params = {};
      card.cardApplyChannel = this.form.cardApplyChannel.join(',');
      card.coupCardId = this.form.coupCardId;
      card.cardType = this.form.cardType;
      card.cardName = this.form.cardName;
      card.subName = this.form.subName;
      card.subTitle = this.form.subTitle;
      card.erpDemoCode = this.form.erpDemoCode;
      card.cardColor = this.form.cardColor;
      card.cardDenomination = this.form.cardDenomination;
      card.coverDescript = this.form.coverDescript;
      card.useCodePrefix = this.form.useCodePrefix;
      card.useCodeSuffix = this.form.useCodeSuffix;
      //卡券条件
      //抵金券 sale_limit.fee 最低消费;  goods.ok 适用商品, goods.no 不适应商品, only: 1 不与其他优惠共享(不勾选only不传)
      if (this.form.cardType === 0) {
        card.useCondition = {
          sale_limit: {
            fee: this.sale_limit.fee
          },
          goods: {
            ok: this.goods.ok,
            no: this.goods.no
          }
        };
        if (this.only) {
          card.useCondition.only = Number(this.only);
        }
        //[折扣券]:  goods.ok 适用商品, goods.no 不适应商品, only: 1 不与其他优惠共享(不勾选only不传)
      } else if (this.form.cardType === 1) {
        card.useCondition = {
          goods: {
            ok: this.goods.ok,
            no: this.goods.no
          },
          only: Number(this.only),
          discount_amount_upper_limit: this.form.discount_amount_upper_limit,
          goods_discounts_number_upper_limit: this.form.goods_discounts_number_upper_limit
        };
        if (this.only) {
          card.useCondition.only = Number(this.only);
        }
        // sale_limit.fee 消费金额满,sale_limit.goods 消费指定商品;  goods.ok 适用商品, goods.no 不适应商品, only: 1 不与其他优惠共享(不勾选only不传)
      } else if (this.form.cardType === 2) {
        card.useCondition = {
          sale_limit: {
            fee: this.sale_limit.fee,
            goods: this.sale_limit.goods
          },
          goods: {
            ok: this.goods.ok,
            no: this.goods.no
          },
          only: Number(this.only),
          proNo: this.form.proNoList.length ? this.form.proNoList[0].id : '',
          products_exchange_number: this.form.proNoList.length ? this.form.products_exchange_number : 0
        };
        if (this.only) {
          card.useCondition.only = Number(this.only);
        }
      }

      // 微盟适用商品
      if ((this.form.cardType === 0 || this.form.cardType === 1) && this.form.cardApplyChannel.indexOf('WMmicroMall') !== -1 && this.coupGoodsWeimobList.length !== 0) {
        card.coupGoodsWeimobList = this.coupGoodsWeimobList;
      }
      console.log(card.coupGoodsWeimobList);
      //卡券限制
      if (this.cardLimitRadio === 1) {
        card.cardLimit = 1;
      } else if (this.cardLimitRadio === 100) {
        card.cardLimit = 100;
      } else {
        card.cardLimit = this.form.cardLimit;
      }

      card.useCustomCode = this.form.useCustomCode;
      card.costValue = this.form.costValue || 0;
      //自定义号段
      if (card.useCustomCode === 1) {
        card.customCodeBegin = this.form.customCodeBegin;
        card.customCodeEnd = this.form.customCodeEnd;
        if (this.form.useCodePrefix) {
          card.customCodePrefix = this.form.customCodePrefix;
        }
        if (this.form.useCodeSuffix) {
          card.customCodeSuffix = this.form.customCodeSuffix;
        }
        card.cardCodeCount = this.form.customCodeEnd - this.form.customCodeBegin + 1;
      } else {
        card.cardCodeCount = this.form.cardCodeCount;
      }
      //时间判断
      card.cardEffectiveMode = this.form.cardEffectiveMode;
      if (card.cardEffectiveMode === 0) {
        if (!this.form.dateTime) {
          card.beginDate = card.endDate = '';
        } else {
          card.beginDate = formatDateTimeByType(this.form.dateTime[0], 'yyyy-MM-dd');
          card.endDate = formatDateTimeByType(this.form.dateTime[1], 'yyyy-MM-dd');
        }
      } else {
        card.startDay = this.form.startDay || 0;
        card.limitDay = this.form.limitDay || 0;
      }

      card.cardExplain = this.form.cardExplain;
      card.useDescript = this.form.useDescript;

      //封面
      card.qcloudImageUrl = this.form.image.imgUrl;
      card.imageFieldCode = this.form.image.code;

      //图文提交
      let teletextList = [];
      if (this.imgTextList.length > 0) {
        this.imgTextList.map((v, i) => {
          teletextList.push({
            imageUrl: v.imgUrl,
            imageFieldCode: v.imgCode,
            teletextContent: v.text,
            cardTeletextId: v.cardTeletextId,
            sort: i
          });
        });
      }

      card.teletexts = teletextList;
      if (card.cardType === 2) {
        card.verificationType = this.form.verificationType || 0;
      }
      card.isDisable = true;
      card.notApplicableMode = 0;
      card.notApplicableProMode = 0;
      card.notApplicableStoreProMode = 0;
      card.proMode = 0;
      card.customCodeSync = 0;
      card.changeStock = 0;
      card.channelType = 1;
      card.checkSource = 0;
      card.applicableMode = 0;
      card.storeProMode = 0;
      card.storeMode = this.storeMode;
      card.storeWidgetKey = this.uuid;

      // 这里判断部分门店是否为空
      if (card.storeMode) {
        let data = await this.$refs.storeCard.getRightList();
        console.log('1' + data.length);
        if (!data.length) {
          this.$tips({ type: 'warning', message: '部分门店不能为空' });
          return;
        }
      }

      // 门店展架
      params.shelfIds = JSON.stringify(this.form.shelfIds);
      params.card = JSON.stringify(card);
      this.submitLoading = true;
      // console.log(params);
      saveUpdateCard(params)
        .then(res => {
          this.submitLoading = false;
          if (res.errorCode === 0) {
            if (this.isEdit) {
              this.$confirm('保存成功, 是否返回列表?', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
              })
                .then(() => {
                  this.$router.push('/card/list');
                })
                .catch(err => {
                  this.getCardDetail();
                });
            } else {
              this.$tips({ type: 'success', message: '新建卡券成功' });
              this.$router.push('/card/list');
            }
          } else {
            this.$tips({ type: 'error', message: res.message || '保存卡券失败' });
          }
        })
        .catch(err => {
          this.submitLoading = false;
          this.$tips({ type: 'error', message: '保存卡券失败' });
        });
    },
    //门店分组回执方法
    getSelectGroupData(val) {
      this.sendChildData.storeType = val.storeType || 0;
      this.sendChildData.storeGroupIds = val.storeGroupIds || '';
      this.sendChildData.storeIds = val.storeIds || [];
    },
    //检查是否为数字
    checkInputNumber(val, name) {
      this.form[name] = (val.replace(/[^0-9]*/g, '') + '').substr(0, 16);
      if (parseInt(this.form.customCodeEnd) - parseInt(this.form.customCodeBegin) < 0) {
        this.form.customCodeEnd = this.form.customCodeBegin;
        this.$tips({ type: 'warning', message: '自定义结尾号段不能小于初始号段' });
      }
      if (parseInt(this.form.customCodeEnd) - parseInt(this.form.customCodeBegin) + 1 > 100000) {
        this.$tips({ type: 'warning', message: '创建数量不能大于100,000张' });
        // this.form.customCodeEnd  = this.form.customCodeBegin  = 0;
        return;
      }
    },
    //检查是否为字符串
    checkInputString(val, name) {
      this.form[name] = val.replace(/[^a-zA-Z0-9]*/g, '') + '';
    },
    // ------微盟适用商品开始-------
    // 获取第一层数据
    getCategoryList() {
      getCategoryList({
        requestProject: this.requestProject
      }).then(res => {
        // console.log(res);
        this.f1 = res.result.map(v => {
          return {
            title: v.parentName + ' > ' + v.categoryName,
            id: v.categoryId
          };
        });
      });
    },
    // 增加一行
    addLine() {
      if (this.wmloading) {
        return;
      }
      this.goodsList.push({ v1: '', f2: [], v2: '', f3: [], v3: [], list: [] });
    },
    // 删除一行
    delLine(idx) {
      if (this.wmloading) {
        return;
      }
      this.goodsList.splice(idx, 1);
      if (this.goodsList.length === 0) {
        this.goodsList.push({ v1: '', f2: [], v2: '', f3: [], v3: [], list: [] });
      }
    },
    // 获取isCopy状态下的一行数据
    async getLine(idx) {
      if (this.wmloading) {
        return;
      }
      // 锁定不允许增加删除行影响index
      this.wmloading = true;
      // 获取第二层数据
      const res_f2 = await getPropertyList({
        requestProject: this.requestProject,
        categoryId: this.goodsList[idx].v1
      });
      this.goodsList[idx].f2 = res_f2.result.map(v => {
        return {
          title: v.propertyName,
          id: v.propertyId,
          outPropertyId: v.outPropertyId
        };
      });
      // 获取第三层数据
      const res_f3 = await getPropertyValueList({
        requestProject: this.requestProject,
        propertyId: this.goodsList[idx].v2
      });
      this.goodsList[idx].f3 = res_f3.result.map(v => {
        return {
          title: v.valueName,
          id: v.valueId,
          outValueId: v.outValueId
        };
      });
      // 去除isCopy，loading
      this.wmloading = false;
      this.goodsList[idx].isCopy = undefined;
    },
    // 第一层改变 获取第二层数据
    handleF1Change(v, idx) {
      if (this.wmloading) {
        return;
      }
      // 把isCopy属性去除
      if (this.isCopy && this.goodsList[idx].isCopy) {
        this.goodsList[idx].isCopy = undefined;
      }
      this.goodsList[idx].v2 = '';
      this.goodsList[idx].f2 = [];
      this.goodsList[idx].v3 = [];
      this.goodsList[idx].f3 = [];
      this.goodsList[idx].v3name = [];
      if (v) {
        this.goodsList[idx].v1name = this.f1.find((value, index, array) => value.id === v).title;
        getPropertyList({
          requestProject: this.requestProject,
          categoryId: this.goodsList[idx].v1
        }).then(res => {
          this.goodsList[idx].f2 = res.result.map(v => {
            return {
              title: v.propertyName,
              id: v.propertyId,
              outPropertyId: v.outPropertyId
            };
          });
        });
      } else {
        this.goodsList[idx].v1name = '';
      }
    },
    // 第二层改变 获取第三层数据
    handleF2Change(v, idx) {
      if (this.wmloading) {
        return;
      }
      this.goodsList[idx].v3 = [];
      this.goodsList[idx].f3 = [];
      this.goodsList[idx].v3name = [];
      if (v) {
        this.goodsList[idx].v2name = this.goodsList[idx].f2.find((value, index, array) => value.id === v).title;
        getPropertyValueList({
          requestProject: this.requestProject,
          propertyId: this.goodsList[idx].v2
        }).then(res => {
          this.goodsList[idx].f3 = res.result.map(v => {
            return {
              title: v.valueName,
              id: v.valueId,
              outValueId: v.outValueId
            };
          });
        });
      } else {
        this.goodsList[idx].v2name = '';
      }
    },
    // 校验&&组合数据
    handleCombine() {
      if (this.wmloading) {
        return;
      }
      return new Promise((resolve, reject) => {
        let arr_f2 = [];
        console.log(this.goodsList);
        if (this.goodsList.length === 1 && this.goodsList[0].v1 === '' && this.goodsList[0].v2 === '' && this.goodsList[0].v3.length === 0) {
          resolve('empty');
        }
        // 判断是否未填满
        for (let i = 0, len = this.goodsList.length; i < len; i++) {
          if (this.goodsList[i].v1 === '' || this.goodsList[i].v2 === '' || this.goodsList[i].v3.length === 0) {
            reject(new Error('微盟适用商品填写不完整'));
          }
          arr_f2.push(this.goodsList[i].v2);
        }
        // 判断第二层是否有重复
        if (arr_f2.length !== [...new Set(arr_f2)].length) {
          reject(new Error('微盟适用商品参数重复'));
        }
        resolve();
      })
        .then(res => {
          if (res === 'empty') return 1;
          return this.goodsList.map(v => {
            let outPropertyId = ''; // 寻找 outPropertyId_outValueId
            for (let ii = 0, lenn = v.f2.length; ii < lenn; ii++) {
              if (v.f2[ii].id === v.v2) {
                outPropertyId += v.f2[ii].outPropertyId + '_';
                break;
              }
            }

            // 第三层映射 push键值对
            const propValues = v.v3.map(y => {
              let idx = -1;
              for (let i = 0, len = v.f3.length; i < len; i++) {
                if (v.f3[i].id === y) {
                  idx = i;
                  break;
                }
              }
              return {
                valueId: v.f3[idx].id,
                valueName: v.f3[idx].title,
                relationIds: outPropertyId + v.f3[idx].outValueId
              };
            });
            v.v3name = propValues;
            return {
              categoryId: v.v1,
              categoryName: v.v1name,
              propId: v.v2,
              propName: v.v2name,
              propValues
            };
          });
        })
        .catch(err => {
          this.$tips({ type: 'warning', message: err.message });
          return false;
        });
    }
    // ------微盟适用商品结束-------
  }
};
