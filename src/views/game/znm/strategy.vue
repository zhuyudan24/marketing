<template>
  <el-dialog title="首次获奖策略管理" :visible.sync="show" width="1000px" :before-close="close" v-loading="loading">
    <el-form ref="form" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="策略名称" prop="strategyName" class="w400">
        <el-input v-model="form.strategyName"></el-input>
      </el-form-item>
      <el-form-item label="奖券设置" class="w200">
        <el-button type="primary" @click="showCard">{{ cardObj.cardName || '选择卡券' }}</el-button>
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
  </el-dialog>
</template>
<script>
import { znmStrategy, znmStrategySave } from '@/service/api/gameApi.js';
import { resetParams } from '@/utils/index.js';

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
        this.znmStrategy();
      }
    }
  },
  data() {
    return {
      loading: false,
      form: {
        strategyName: '',
        prizeReferId: '',
        cardStatus: -1
      },
      rules: {
        strategyName: { required: true, message: '请填写策略名称', trigger: 'blur' }
      },
      gradeList: [],
      pickerOptions: {
        disabledDate(time) {
          return time.getTime() > Date.now();
        }
      },
      showCardDialog: false,
      // 人群筛选器可传参数
      projectName: '', // 当前项目名
      sceneValue: 'member', // 场景值
      useId: '', // 模板id
      hasSearchData: '', // 当前页回显的数据(接口返回)
      toggleTag: true, // 控制按钮显示的参数,仅供参考,可自行修改
      getSaveData: '',
      peopleFilterReRender: false
    };
  },
  methods: {
    async znmStrategy() {
      this.loading = true;
      let res = await znmStrategy({ gamePrizeStrategyId: this.dataId || '' });
      this.loading = false;
      this.gradeList = res.result.gradeList;
      this.useId = res.result.searchId || '';
      this.peopleFilterReRender = false;
      this.$nextTick(_ => {
        this.peopleFilterReRender = true;
      });
      const strategy = res.result.strategy;
      if (res.result.strategy) {
        this.form.strategyName = strategy.strategyName;
        this.form.gamePrizeStrategyId = strategy.gamePrizeStrategyId;
        this.form.gameActivityId = strategy.gameActivityId;
        this.form.strategyName = strategy.strategyName;
        this.form.prizeReferId = strategy.prizeReferId;
        this.form.prizeReferType = strategy.prizeReferType;
        this.form.prizeStock = strategy.prizeStock;
        this.form.prizeCount = strategy.prizeCount;
        this.form.prizeIntegral = strategy.prizeIntegral;
        this.form.strategyType = strategy.strategyType;
        this.form.status = strategy.status;
        this.cardObj.cardName = strategy.proTitle;
        this.cardObj.coupCardId = strategy.prizeReferId;
        this.form.crowdFilter = strategy.crowdFilter;
        this.hasSearchData = strategy.crowdFilter;
      } else {
        resetParams(this.form);
        this.form.crowdFilter = '';
        this.hasSearchData = '';
        this.getSaveData = '';
        this.cardObj.cardName = '';
        this.cardObj.coupCardId = '';
      }
    },
    close() {
      this.$emit('update:show', false);
    },
    // 显示卡券弹窗
    showCard(type) {
      this.$emit('get-data', 'dialogStrategy');
    },
    // 子组件触发方法
    selectCard(val) {
      // 模拟检查数据
      this.cardObj = val;
      this.showCardDialog = false;
    },
    submit(formName) {
      if (!this.cardObj.coupCardId) {
        this.$tips({ type: 'warning', message: '请选择卡券' });
        return;
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          let data = {
            gamePrizeStrategyId: this.form.gamePrizeStrategyId,
            gameActivityId: this.form.gameActivityId || this.$route.params.id || this.gameActivityId,
            strategyName: this.form.strategyName,
            prizeReferId: this.cardObj.coupCardId,
            prizeReferType: '1',
            prizeStock: 0,
            prizeCount: 0,
            prizeIntegral: 0,
            strategyType: '2',
            status: 1,
            crowdFilter: this.form.crowdFilter,
            searchJson: this.getSaveData
          };
          znmStrategySave(data).then(res => {
            this.$tips({ type: 'success', message: '操作成功' });
            this.$emit('update:show', false);
            this.$emit('refresh');
          });
        } else {
          this.$tips({ type: 'warning', message: '表单提交错误或未填写完整' });
          return false;
        }
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
