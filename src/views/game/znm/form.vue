<template>
  <el-form ref="form" :model="form" :rules="rules" label-width="100px" class="ptyx-add" v-loading="loading" loading-text="加载中">
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">游戏内容</h3>
      <el-form-item label="游戏名称" prop="gameName" class="width50">
        <dm-input v-model="form.gameName" class="w400" :maxlength="25"></dm-input>
      </el-form-item>
      <el-form-item label="LOGO上传" prop="logoImg" class="width50">
        <dm-upload-avatar :model.sync="form.logoImg" width="auto" label="上传图片" tips=" 请上传高度为80px的PNG透明背景图片"></dm-upload-avatar>
      </el-form-item>
      <el-form-item label="次数限制" prop="attendLimitCounts" class="width50">
        <el-input-number controls-position="right" v-model="form.attendLimitCounts" :precision="0" :min="1" :max="9999" class="w150" size="small"></el-input-number>
      </el-form-item>
      <el-form-item label="游戏时间" prop="dateTime" class="width50">
        <el-date-picker :picker-options="pickerOptions" :default-time="['00:00:00', '23:59:59']" class="w400" v-model="form.dateTime" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item label="游戏说明" prop="gameIntroduction" class="width50">
        <dm-input class="w400" type="textarea" :rows="4" v-model="form.gameIntroduction" :maxlength="200"></dm-input>
      </el-form-item>
    </section>
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">奖项设置</h3>
      <el-form-item label="首次奖项设置" class="width50">
        <el-button @click="showCard('firstStrategy')">{{ firstStrategy.cardName || '卡券选择' }}</el-button>
      </el-form-item>
      <el-form-item label="首次特殊策略" class="el-form-item__margin-top14">
        <el-table tooltipEffect="light" :data="tableList" style="width: 100%" v-loading="tableLoading">
          <el-table-column prop="strategyName" label="策略名称" align="left"></el-table-column>
          <el-table-column prop="proTitle" label="卡券名称" align="left">
            <template slot-scope="scope">
              <p>{{ scope.row.proTitle }}</p>
              <p class="fz12 gray">{{ scope.row.proSubName }}</p>
            </template>
          </el-table-column>
          <el-table-column prop="prizeName" label="移动" align="left" width="180">
            <template slot-scope="scope">
              <i class="el-icon-upload2 cursor" :class="scope.$index === 0 ? 'cursor-nodrop gray' : 'cursor blue'" @click="sortGame(scope.row.gamePrizeStrategyId, 1, scope.$index === 0)"></i>
              <i class="el-icon-download cursor" :class="scope.$index === tableList.length - 1 ? 'cursor-nodrop gray' : 'cursor blue'" @click="sortGame(scope.row.gamePrizeStrategyId, 4, scope.$index === tableList.length - 1)"></i>
              <i class="el-icon-sort-up cursor" :class="scope.$index === 0 ? 'cursor-nodrop gray' : 'cursor blue'" @click="sortGame(scope.row.gamePrizeStrategyId, 2, scope.$index === 0)"></i>
              &nbsp;
              <i class="el-icon-sort-down cursor" :class="scope.$index === tableList.length - 1 ? 'cursor-nodrop gray' : 'cursor blue'" @click="sortGame(scope.row.gamePrizeStrategyId, 3, scope.$index === tableList.length - 1)"></i>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="left" width="120">
            <template slot-scope="scope">
              <el-button type="text" @click="editStrategy(scope.row.gamePrizeStrategyId)">编辑</el-button>
              <dm-delete @confirm="delItem(scope.row)" tips="是否删除该策略?">
                <el-button type="text">删除</el-button>
              </dm-delete>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="tableList.length < 10" class="dm-button--add" @click="addStrategy('')">
          <i class="el-icon-plus">新增策略</i>
        </div>
      </el-form-item>
      <el-form-item label="后续奖项设置" class="width50">
        <el-button @click="showCard('lastStrategy')">{{ lastStrategy.cardName || '卡券选择' }}</el-button>
      </el-form-item>
    </section>
    <!-- 分享设置 -->
    <dm-share :form="form"></dm-share>
    <!-- 参与门槛 -->
    <dm-threshold :form="form" :isAdd="isAdd" :thresholdData="thresholdData" ref="threshold"></dm-threshold>
    <div class="btn-wrap_fixed" :class="{ on: asideShow }">
      <el-button type="primary" @click="znmSave('form')" v-if="!isInfo">保 存</el-button>
      <el-button @click="$router.go(-1)">返 回</el-button>
    </div>
    <vue-gic-card :showCardDialog="showCardDialog" :cardLimit="3" @selectCard="selectCard"></vue-gic-card>
    <strategy :show.sync="strategyShow" :dataId="gamePrizeStrategyId" :gameActivityId="form.gameActivityId" :cardObj="dialogStrategy" @get-data="showCard" @refresh="znmStrategyList"></strategy>
  </el-form>
</template>

<script>
import { znmDetail, znmSave, znmStrategyList, znmStrategySort, znmStrategyDel } from '@/service/api/gameApi.js';
import { numberToChinese, formatDateTimeByType } from '@/utils/index.js';
import dmUploadAvatar from '@/components/upload/avatar';
import strategy from './strategy';
import editAlertMixin from '../common/editAlertMixin.js';
import dmShare from '../common/share.vue';
import dmThreshold from '../common/threshold.vue';
let cardType = 'firstStrategy';
export default {
  mixins: [editAlertMixin],
  data() {
    const that = this;
    return {
      loading: false,
      tableLoading: false,
      // 参与门槛组件传递的数据
      thresholdData: {
        searchParams: '', //  会员筛选
        hasSearchData: '', // 反显数据保存
        getSaveData: '', // 会员筛选回显保存的数据
        useId: '', // 会员筛选filter
        memberGroupIds: '', // 会员分组
        defaltSelected: [] // 会员分组默认穿梭窗已选入数据
      },
      form: {
        gameActivityId: '',
        gameName: '',
        attendLimitCounts: 1,
        logoImg: {
          code: '',
          imgUrl: ''
        },
        dateTime: [],
        gameIntroduction: '',
        // 分享
        shareFlag: 1,
        gameShareSettingId: '',
        shareTitle: '找呀找呀找你马',
        shareTextInfo: '玩游戏，赢大奖~',
        shareImg: {
          code: '',
          imgUrl: require("../common/img/share/znm.png"), // eslint-disable-line
          wxImg: ''
        },
        // 参与门槛
        memberType: 0,
        gameActivityAttendConditionId: '',
        tipTitle: '尚未满足游戏参与条件，请多多努力。',
        tipsImg: {
          imgUrl: require('../common/img/attend/znm.png'), // eslint-disable-line
          code: ''
        }
      },
      rules: {
        gameName: { type: 'string', required: true, message: '游戏标题不能为空', trigger: 'blur' },
        attendLimitCounts: { type: 'number', required: true, message: '游戏次数限制不能为空', trigger: 'blur' },
        logoImg: { type: 'object', required: true, message: 'logo不能为空', trigger: 'blur' },
        dateTime: { type: 'array', required: true, message: '游戏时间不能为空', trigger: 'blur' },
        gameIntroduction: { type: 'string', required: true, message: '游戏说明不能为空', trigger: 'blur' },
        shareImgUrl: { type: 'object', required: true, message: '分享图片不能为空', trigger: 'blur' }
      },
      tableList: [],
      showCardDialog: false,
      strategyShow: false,
      firstStrategy: {},
      lastStrategy: {},
      dialogStrategy: {},
      gamePrizeStrategyId: '',
      isEdit: this.$route.meta.type === 'edit',
      isAdd: this.$route.meta.type === 'add',
      isInfo: this.$route.meta.type === 'info',
      pickerOptions: {
        disabledDate(now) {
          return now.getTime() < Date.now() - 24 * 60 * 60 * 1000 && that.isAdd;
        }
      }
    };
  },
  components: {
    dmUploadAvatar,
    strategy,
    dmShare,
    dmThreshold
  },
  computed: {
    asideShow() {
      return this.$store.state.marketing.asideShow;
    }
  },
  created() {
    if (this.isEdit || this.isInfo) {
      this.znmDetail();
      this.znmStrategyList();
      this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '游戏营销', path: '/game' }, { name: '找你马', path: '/game/znm' }, { name: '找你马详情', path: '' }]);
    } else if (this.isAdd) {
      this.znmDetail(true);
      this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '游戏营销', path: '/game' }, { name: '找你马', path: '/game/znm' }, { name: '找你马新增', path: '' }]);
    }
  },
  methods: {
    addStrategy(val) {
      this.dialogStrategy = {};
      this.strategyShow = true;
      this.gamePrizeStrategyId = '';
    },
    editStrategy(val) {
      this.strategyShow = true;
      this.gamePrizeStrategyId = val;
    },
    //删除策略
    delItem(row) {
      znmStrategyDel({ gamePrizeStrategyId: row.gamePrizeStrategyId }).then(res => {
        if (res.errorCode === 0) {
          this.$tips({ type: 'success', message: '删除成功' });
          this.znmStrategyList();
        } else {
          this.$tips({ type: 'error', message: res.message || '删除失败' });
        }
      });
    },
    //加载策略列表
    async znmStrategyList() {
      this.tableLoading = true;
      try {
        let res = await znmStrategyList({ gameActivityId: this.$route.params.id || this.form.gameActivityId });
        if (res.errorCode === 0) {
          this.tableList = res.result.strategyList || [];
          if (res.result.firstStrategy) {
            this.firstStrategy = {
              coupCardId: res.result.firstStrategy.prizeReferId,
              cardName: res.result.firstStrategy.proTitle
            };
          }
          if (res.result.lastStrategy) {
            this.lastStrategy = {
              coupCardId: res.result.lastStrategy.prizeReferId,
              cardName: res.result.lastStrategy.proTitle
            };
          }
        }
      } catch (err) {
        console.log(err);
      }
      this.tableLoading = false;
    },
    //加载详情
    async znmDetail(isAdd) {
      this.loading = true;
      let res = await znmDetail({ gameActivityId: isAdd ? '' : this.$route.params.id });
      this.loading = false;

      if (typeof res.result === 'string') {
        this.form.gameActivityId = res.result;
        return;
      }
      const gameDetail = res.result.gameDetail;

      this.form = Object.assign(this.form, {
        gameActivityId: gameDetail.gameActivityId,
        gameName: gameDetail.gameName,
        attendLimitCounts: gameDetail.attendLimitCounts,
        logoImg: {
          code: gameDetail.logoImgFieldCode,
          imgUrl: gameDetail.logoImgUrl
        },
        dateTime: [gameDetail.gameStartTime || '', gameDetail.gameEndTime || ''],
        gameIntroduction: gameDetail.gameIntroduction,
        shareFlag: gameDetail.shareFlag || 0
      });
      // 分享
      if (gameDetail.shareFlag === 1) {
        const { shareTitle, shareTextInfo, shareImgFieldCode, shareImgUrl, shareImgUrlWX, gameShareSettingId } = gameDetail.shareSetting;
        this.form = Object.assign(this.form, {
          shareTitle,
          shareTextInfo,
          gameShareSettingId,
          shareImg: {
            code: shareImgFieldCode,
            imgUrl: shareImgUrl,
            wxImg: shareImgUrlWX
          }
        });
      }

      // 参与门槛
      if (gameDetail.attendCondition) {
        const { memberType, tipTitle, tipImageFieldCode, tipImageUrl, searchParams, gameActivityAttendConditionId } = gameDetail.attendCondition;
        this.form = Object.assign(this.form, {
          memberType,
          tipTitle,
          tipsImg: {
            code: tipImageFieldCode,
            imgUrl: tipImageUrl,
            wxImg: ''
          },
          gameActivityAttendConditionId
        });
        if (memberType === 1) {
          // 会员分组
          this.thresholdData.searchParams = searchParams;
          this.thresholdData.hasSearchData = searchParams;
          this.thresholdData.getSaveData = searchParams || ''; // searchJson
          if (res.result.searchId) {
            this.thresholdData.useId = res.result.searchId || '';
            this.thresholdData.hasSearchData = searchParams || '{}';
          }
        } else if (memberType === 2) {
          // 会员筛选
          this.thresholdData.defaltSelected = res.result.tagGroupList || [];
          this.thresholdData.memberGroupIds = searchParams;
        }
      }
    },
    //提交保存
    async znmSave(formName) {
      if (!this.firstStrategy.coupCardId || !this.lastStrategy.coupCardId) {
        this.$tips({ type: 'warning', message: '首次奖项和后续奖不能为空' });
        return;
      }
      if (this.form.memberType === 1 && !this.thresholdData.getSaveData) {
        this.$tips({ type: 'warning', message: '会员筛选不能为空' });
        return;
      }
      if (this.form.memberType === 2 && !this.thresholdData.memberGroupIds) {
        this.$tips({ type: 'warning', message: '会员分组不能为空' });
        return;
      }

      // if (this.form.dateTime[0] < Date.now() && this.isAdd) {
      //   this.$tips({ type: 'warning', message: `开始时间不能小于当前时间` });
      //   return;
      // }

      // 编辑弹窗提示
      if (await this.editAlert()) return;
      if (this.form.memberType === 1) {
        await this.$refs.threshold.triggerPeopleSet();
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          let params = {
            gameName: this.form.gameName, //	是	String	游戏名称
            attendLimitCounts: this.form.attendLimitCounts, // 游戏次数限制
            logoImgUrl: this.form.logoImg.imgUrl, //	是	String	LOGO上传 url
            logoImgFieldCode: this.form.logoImg.code, //	是	String	LOGO上传 code
            gameStartTime: formatDateTimeByType(this.form.dateTime[0], 'yyyy-MM-dd-HH-mm'), //	是	String	开始时间 “2018-05-23 11:00”
            gameEndTime: formatDateTimeByType(this.form.dateTime[1], 'yyyy-MM-dd-HH-mm'), //	是	String	结束时间 2018-06-14 16:00
            gameIntroduction: this.form.gameIntroduction, //	是	string	游戏说明
            firstCouponId: this.firstStrategy.coupCardId, //	是	String	首次奖项设置 load-game-znm-strategy-list 返回的firstStrategy—prizeReferId卡券ID
            strategyIds: this.tableList.map(v => v.gamePrizeStrategyId).join(','), //	否	String	(不是必传)首次特殊策略 load-game-znm-strategy-list strategyList集合—gamePrizeStrategyId 多个用逗号隔开
            lastCouponId: this.lastStrategy.coupCardId, //	是	string	后续奖项设置 load-game-znm-strategy-list 返回的lastStrategy—prizeReferId卡券ID
            shareImgUrl: this.form.shareImg.imgUrl, //	是	string	分享图片 url
            shareImgFieldCode: this.form.shareImg.code, //	是	string	分享图片 code
            shareImgUrlWX: this.form.shareImg.wxImg, //	是	string	分享图片 wx
            shareTitle: this.form.shareTitle, //	是	string	分享标题
            shareTextInfo: this.form.shareTextInfo, //	是	string	分享描述
            shareFlag: this.form.shareFlag || 0
          };
          if (this.isEdit) {
            params.gameActivityId = this.form.gameActivityId; //否	String	游戏主键ID(新增不传—前面回显的NEWxxxxx不用传, 修改必传)
            params.firstStrategyId = this.firstStrategy.gamePrizeStrategyId; //	否	string	(新建不传)首次奖项设置 load-game-znm-strategy-list 返回的firstStrategy—gamePrizeStrategyId
            params.lastStrategyId = this.lastStrategy.gamePrizeStrategyId; //	否	string	(新建不传)后续奖项设置 load-game-znm-strategy-list 返回的lastStrategy—gamePrizeStrategyId
          }

          let shareSetting = {};
          // 游戏分享
          if (this.form.shareFlag) {
            const { shareTitle, shareTextInfo, shareImg, gameShareSettingId } = this.form;
            shareSetting = {
              shareTitle,
              shareTextInfo,
              shareImgUrl: shareImg.imgUrl,
              shareImgFieldCode: shareImg.code,
              shareImgUrlWX: shareImg.wxImg
            };
            if (this.isEdit) {
              shareSetting.GameShareSettingId = gameShareSettingId;
            }
          }
          // attendCondition 参与门槛
          const { memberType, tipTitle, tipsImg } = this.form;
          let attendCondition = {
            memberType: memberType || 0,
            searchJson: memberType === 1 ? this.thresholdData.getSaveData : '',
            searchParams: memberType === 1 ? this.thresholdData.searchParams : this.thresholdData.memberGroupIds,
            tipTitle: tipTitle,
            tipImageUrl: tipsImg.imgUrl || '',
            tipImageFieldCode: tipsImg.code || ''
          };
          if (this.isEdit) {
            attendCondition.gameActivityAttendConditionId = this.form.gameActivityAttendConditionId;
          }

          const postParam = Object.assign(params, {
            attendCondition: JSON.stringify(attendCondition),
            shareSetting: JSON.stringify(shareSetting)
          });

          // console.log(postParam);
          znmSave(postParam).then(res => {
            if (res.errorCode === 0) {
              this.$tips({ type: 'success', message: this.isAdd ? '新增成功' : '编辑成功' });
              if (this.isAdd) {
                this.$router.push('/game/znm');
              } else {
                this.$confirm('操作成功，是否返回列表?', '提示', {
                  confirmButtonText: '返回列表',
                  cancelButtonText: '留在本页',
                  type: 'warning'
                })
                  .then(() => {
                    this.$router.push('/game/znm');
                  })
                  .catch(() => {
                    this.znmDetail();
                    this.znmStrategyList();
                  });
              }
            } else {
              this.$tips({ type: 'error', message: res.message || '操作失败' });
            }
          });
        } else {
          this.$tips({ type: 'warning', message: '表单填写不完整，请检查表单' });
          return false;
        }
      });
    },
    // 显示卡券弹窗
    showCard(type) {
      console.log(type);
      cardType = type;
      this.showCardDialog = true;
    },
    // 子组件触发方法
    selectCard(val) {
      console.log(val);
      if (val && val.cardName) {
        this[cardType] = val;
        console.log(this[cardType]);
      }
      this.showCardDialog = false;
    },
    //策略排序
    sortGame(id, type, flag) {
      if (flag) return;
      znmStrategySort({ sortType: type, gamePrizeStrategyId: id, gamePrizeStrategyIds: this.tableList.map(v => v.gamePrizeStrategyId).join(',') }).then(res => {
        console.log(res);
        this.znmStrategyList();
      });
    }
  },
  filters: {
    numberToChinese(val) {
      return numberToChinese(val);
    }
  }
};
</script>
