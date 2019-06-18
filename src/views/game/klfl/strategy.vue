<template>
  <el-dialog title="首次获奖策略管理" :visible.sync="show" width="1000px" :before-close="close" v-loading="loading">
    <el-form ref="form" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="策略名称" prop="strategyName">
        <el-input v-model="form.strategyName" class="w300"></el-input>
      </el-form-item>
      <el-form-item label="奖品设置" prop="prizeReferType">
        <el-select class="w300" v-model="form.prizeReferType" placeholder="请选择" @change="cardCheck">
          <el-option v-for="v in prizeReferTypeOptions" :key="v.value" :label="v.label" :value="v.value"></el-option>
        </el-select>
        <span v-if="form.prizeReferType === 3" class="fz12 gray">已选中：{{ prizeSetInfo.proGiftName }}</span>
        <span v-if="form.prizeReferType === 2" class="fz12 gray">已选中：{{ cardObj.cardName }}</span>
      </el-form-item>
      <el-form-item label="积分设置" v-if="form.prizeReferType === 1">
        <el-input-number :precision="0" :min="0" v-model="form.prizeIntegral" placeholder="请输入积分" class="w300"></el-input-number>
      </el-form-item>
      <el-form-item label="奖品数量" prop="prizeCount" v-if="strategyType === 'edit'"> {{ form.prizeCount }} <i class="el-icon-edit blue" @click="calculateShow = true"></i> （已领取{{ form.prizeCount - form.prizeStock }}件） </el-form-item>
      <el-form-item label="奖品数量" prop="prizeCount" v-if="strategyType === 'add'">
        <el-input-number :precision="0" :min="0" v-model="form.prizeStock" placeholder="请输入奖品数量" class="w300"></el-input-number>
      </el-form-item>
      <vue-gic-people v-if="peopleFilterReRender" :projectName="projectName" :isAdd="false" :triggerReset="true" :useId="useId" :hasSearchData="hasSearchData" :sceneValue="sceneValue" ref="peopleFilter" @findFilter="findFilter" @getBackData="getBackData" @editHide="editHide" @editShow="editShow" @hideBtn="hideBtn" />
      <div class="gic-people--button" v-show="toggleTag">
        <el-button size="small" type="primary" @click="getData">确 定</el-button>
        <el-button size="small" @click="cancelFilter">取 消</el-button>
      </div>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="close">关 闭</el-button>
      <el-button type="primary" @click="submit('form')">保 存</el-button>
    </span>
    <prize-set ref="gift" :info.sync="prizeSetInfo" :show.sync="prizeSetShow"></prize-set>
    <calculate :show.sync="calculateShow" :prizeId="dataId" :prizeReferId="form.prizeReferType === 2 ? cardObj.coupCardId : form.proGiftId" :prizeReferType="form.prizeReferType" :totalCount="parseInt(form.prizeCount)" @countRefresh="countRefresh"></calculate>
  </el-dialog>
</template>
<script>
import { klflStrategy, klflStrategySave, saveGift } from '@/service/api/gameApi.js';
import { resetParams } from '@/utils/index.js';
import calculate from '@/components/calculate';
import prizeSet from './prizeSet';

export default {
  props: {
    show: {
      type: Boolean,
      default: false
    },
    dataId: {
      type: String,
      default: ''
    },
    gameActivityId: {
      type: String,
      default: ''
    },
    strategyType: {
      type: String,
      default: 'add'
    },
    cardObj: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  watch: {
    show(val) {
      if (val) {
        this.klflStrategy();
      } else {
        this.cardObj = {};
      }
    },
    prizeSetInfo: {
      handler(val) {
        console.log(val);
      },
      deep: true
    }
  },
  components: {
    calculate,
    prizeSet
  },
  data() {
    return {
      count: 0,
      calculate: true,
      loading: false,
      form: {
        strategyName: '',
        prizeReferId: '',
        cardStatus: -1,
        prizeReferType: 1,
        prizeCount: 0,
        prizeStock: 0,
        prizeIntegral: 0,
        prizeImage: { imgUrl: '', code: '' },
        giftName: '',
        proGiftId: ''
      },
      rules: {
        strategyName: { required: true, message: '请填写策略名称', trigger: 'blur' },
        prizeReferType: { required: true, message: '请选择奖品类型', trigger: 'blur' },
        prizeCount: { required: true, message: '请填写奖品数量', trigger: 'blur' }
      },
      gradeList: [],
      showCardDialog: false,
      cardLimit: 1, //卡券限制类型 1-限制领取1张的卡券 2- 限制领取 1~100的卡券 3-限制领取>=100 的卡券
      cardType: null, //卡券类型集合（0：抵金券，1：折扣券，2：兑换券）null-为全部类型 逗号分隔
      prizeReferTypeOptions: [{ value: 1, label: '积分' }, { value: 2, label: '卡券' }, { value: 3, label: '礼品' }],
      calculateShow: false,
      //设置为奖品
      prizeSetInfo: {
        prizeImage: { imgUrl: '', code: '' },
        proGiftId: '',
        giftStock: '',
        proGiftName: ''
      },
      prizeSetShow: false,
      peopleFilterReRender: false,
      // 人群筛选器可传参数
      projectName: '', // 当前项目名
      sceneValue: 'member', // 场景值
      useId: '', // 模板id
      hasSearchData: '', // 当前页回显的数据(接口返回)
      toggleTag: true, // 控制按钮显示的参数,仅供参考,可自行修改
      getSaveData: ''
    };
  },
  methods: {
    cardCheck() {
      if (this.form.prizeReferType === 2) {
        this.$emit('set-data', 'strategyDialog');
      } else if (this.form.prizeReferType === 3) {
        this.prizeSetShow = true;
      }
    },
    countRefresh(val) {
      this.form.prizeStock = val.calc ? parseInt(this.form.prizeStock) + parseInt(val.num) : parseInt(this.form.prizeStock) - parseInt(val.num);
      this.form.prizeCount = val.calc ? parseInt(this.form.prizeCount) + parseInt(val.num) : parseInt(this.form.prizeCount) - parseInt(val.num);
    },
    async klflStrategy() {
      this.loading = true;
      let res = await klflStrategy({ gamePrizeStrategyId: this.dataId || '' });
      this.loading = false;
      console.log(res);
      this.gradeList = res.result.gradeList;
      const strategy = res.result.dto;
      this.useId = res.result.searchId;
      this.peopleFilterReRender = false;
      this.$nextTick(_ => {
        this.peopleFilterReRender = true;
      });
      if (strategy) {
        this.form.strategyName = strategy.strategyName;
        this.form.gamePrizeStrategyId = strategy.gamePrizeStrategyId;
        this.form.gameActivityId = strategy.gameActivityId;
        this.form.prizeReferId = strategy.prizeReferId;
        this.form.prizeReferType = strategy.prizeReferType;
        this.form.prizeIntegral = strategy.prizeIntegral;
        this.form.strategyType = strategy.strategyType;
        this.form.prizeStock = strategy.prizeStock;
        this.form.prizeCount = strategy.prizeCount;
        this.form.status = strategy.status;
        this.cardObj.cardName = strategy.proTitle;
        this.cardObj.coupCardId = strategy.prizeReferId;
        this.form.crowdFilter = strategy.crowdFilter;
        this.hasSearchData = strategy.crowdFilter;
        if (strategy.proGift) {
          this.prizeSetInfo = {
            prizeImage: { imgUrl: '', code: '' },
            proGiftId: strategy.proGift.proGiftId,
            giftStock: strategy.proGift.giftStock,
            proGiftName: strategy.proGift.giftName
          };
        }
        if (strategy.proGift) {
          this.form.prizeImage = {
            imgUrl: '',
            code: ''
          };
          this.form.proGiftId = strategy.proGift.proGiftId;
          this.form.giftName = strategy.proGift.giftName;
          this.form.prizeStock = strategy.proGift.giftStock;
        }
      } else {
        resetParams(this.form);
        this.form.prizeReferType = 1;
        this.hasSearchData = '';
        this.form.crowdFilter = '';
        this.getSaveData = '';
      }
    },
    close() {
      this.$refs.gift.clear();
      this.$emit('update:show', false);
    },
    submit(formName) {
      if (!this.cardObj.coupCardId && this.form.prizeReferType === 2) {
        this.$tips({ type: 'warning', message: '请选择卡券' });
        return;
      }
      if (this.form.prizeReferType === 3 && !this.prizeSetInfo.proGiftId) {
        this.$tips({ type: 'warning', message: '请选择礼品' });
        return;
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          let data = {
            gamePrizeStrategyId: this.form.gamePrizeStrategyId,
            gameActivityId: this.form.gameActivityId || this.$route.params.id || this.gameActivityId,
            strategyName: this.form.strategyName,
            prizeReferId: this.form.prizeReferType === 2 ? this.cardObj.coupCardId : this.form.prizeReferType === 3 ? this.prizeSetInfo.proGiftId : null,
            prizeReferType: this.form.prizeReferType,
            prizeStock: this.form.prizeStock,
            prizeCount: this.form.prizeStock,
            prizeIntegral: this.form.prizeIntegral,
            strategyType: '2',
            status: this.form.status,
            crowdFilter: this.form.crowdFilter,
            searchJson: this.getSaveData
          };
          // 新增且prizeReferType=3(礼品)时，在提交之前把奖品数量update给礼品
          if (this.form.gamePrizeStrategyId === undefined && this.form.prizeReferType === 3) {
            saveGift({
              giftName: this.prizeSetInfo.proGiftName,
              mainPicUrl: this.prizeSetInfo.prizeImage.imgUrl || '',
              mainPicFieldCode: this.prizeSetInfo.prizeImage.code || '',
              proGiftId: this.prizeSetInfo.proGiftId,
              giftStock: this.form.prizeStock
            }).then(() => {
              this.handleKlflStrategySave(data);
            });
          } else {
            this.handleKlflStrategySave(data);
          }
        } else {
          this.$tips({ type: 'warning', message: '表单填写不完整' });
          return false;
        }
      });
    },
    handleKlflStrategySave(data) {
      klflStrategySave(data).then(res => {
        this.$refs.gift.clear();
        this.$tips({ type: 'success', message: '操作成功' });
        this.$emit('update:show', false);
        this.$emit('refesh');
      });
    },
    /** ----------人群筛选器的方法----------- */
    //获取指定会员
    getData() {
      this.$refs.peopleFilter.confirmSet();
    },
    // 子组件触发父组件事件,返回过滤条件数据
    findFilter(value) {
      console.log(value);
      this.form.crowdFilter = value;
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
      // alert(1)
      this.toggleTag = false;
      this.saveTag = false;
    }
  }
};
</script>
