<template>
  <el-form ref="form" :model="form" label-width="100px" :rules="rules" v-loading="loading" element-loading-text="拼命加载中">
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">游戏内容</h3>
      <el-form-item label="游戏名称" class="width50" prop="gameName">
        <dm-input v-model="form.gameName" class="w400" :disabled="isInfo" :maxlength="25"></dm-input>
      </el-form-item>
      <el-form-item label="游戏时间" class="width50" prop="dateTime">
        <el-date-picker class="w400" v-model="form.dateTime" :disabled="isInfo" :default-time="['00:00:00', '23:59:59']" :picker-options="pickerOptions" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"> </el-date-picker>
      </el-form-item>
      <el-form-item label="皮肤设置">
        <el-radio v-model="form.skinType" :label="1" :disabled="isInfo">黑金</el-radio>
        <el-radio v-model="form.skinType" :label="2" :disabled="isInfo">红色</el-radio>
        <el-radio v-model="form.skinType" :label="3" :disabled="isInfo">霓虹灯</el-radio>
        <el-radio v-model="form.skinType" :label="0" :disabled="isInfo">自定义</el-radio>
        <span class="regular-font-color pl20">
          <b class="blue cursor-pointer" @click="downloadWheelSkinPsd">模板皮肤下载</b>
          <el-popover placement="top-start" width="200" trigger="hover" title="banner图片定制化：" content="下载后修改为需要使用的样式,重新上传banner图的图片">
            <i class="el-icon-question fz16 blue el-popover__reference" slot="reference"></i>
          </el-popover>
        </span>
      </el-form-item>
      <el-form-item label="banner图片" class="width50" prop="gameImage">
        <dm-upload-avatar :model.sync="banner[form.skinType]" :disabled="isInfo" width="220" height="103" label="上传图片" tips="图片建议尺寸：750*350，格式为jpg/png/gif。图片大小不超过1MB，点击图片可重新上传。" :limit="{ type: true, width: 750, height: 350, maxSize: 1 }"></dm-upload-avatar>
      </el-form-item>
      <el-form-item label="背景颜色" prop="background" class="width50" v-if="form.skinType === 0">
        <el-color-picker class="vertical-middle" :disabled="isInfo" v-model="form.background"></el-color-picker>
        {{ form.background }}
      </el-form-item>
      <el-form-item label="游戏说明" class="width50" prop="gameIntroduction">
        <dm-input type="textarea" class="w400" :rows="4" v-model="form.gameIntroduction" :disabled="isInfo" :maxlength="200"></dm-input>
      </el-form-item>
    </section>
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">抽奖机制</h3>
      <el-form-item label="抽奖消耗" class="width50" prop="gameIntegral">
        <el-input-number controls-position="right" class="w400" :min="0" v-model="form.gameIntegral" :precision="0" :disabled="isInfo"></el-input-number> 积分
        <p class="fz12 gray">0表示免费抽奖</p>
      </el-form-item>
      <el-form-item label="中奖几率" class="width50" prop="gameWinningRate"> <el-input-number controls-position="right" class="w400" :min="0" :max="100" :precision="2" v-model="form.gameWinningRate" :disabled="isInfo"></el-input-number> % </el-form-item>
      <el-form-item label="限制抽奖" class="width50" prop="gameLimitDay">
        <el-input-number controls-position="right" :min="-1" class="w400" v-model="form.gameLimitCount" :precision="0" :disabled="isInfo"></el-input-number> 次
        <p class="fz12 gray">
          <el-checkbox class="pl10" v-model="form.gameLimitDay" :disabled="isInfo" :true-label="1" :false-label="0">每天</el-checkbox>
          -1表示限制抽奖次数
        </p>
      </el-form-item>
      <el-form-item label="免费抽奖" class="width50" prop="gameFreeDay">
        <el-input-number controls-position="right" :min="0" class="w400" v-model="form.gameFreeCount" :precision="0" :disabled="isInfo"></el-input-number> 次
        <p class="fz12 gray">
          <el-checkbox class="pl10" v-model="form.gameFreeDay" :disabled="isInfo" :true-label="1" :false-label="0">每天</el-checkbox>
          0表示无免费抽奖次数
        </p>
      </el-form-item>
      <el-form-item label="奖品设置" class="el-form-item__margin-top14">
        <el-table tooltipEffect="light" :data="tableList" style="width: 100%">
          <el-table-column prop="awardName" label="序号" align="left" width="90">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="prizeType" label="奖品类型" align="left" :min-width="150">
            <template slot-scope="scope">
              <el-select size="small" v-model="scope.row.prizeType" class="width50" placeholder="选择奖品类型" :disabled="isInfo" @change="resetCount(scope.$index)">
                <el-option v-for="item in prizeReferTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="ranprizeIntegralkEnd" label="奖项设置" align="left" :min-width="160">
            <template slot-scope="scope">
              <div v-if="scope.row.prizeType === 1"><el-input-number controls-position="right" v-model="scope.row.prizeIntegral" :disabled="isInfo" :min="0" class="width50" size="small"></el-input-number> 积分</div>
              <el-button v-if="scope.row.prizeType === 2" size="small" :disabled="isInfo" @click="setPrizeCard(scope.$index)">{{ scope.row.cardName || '选择卡券' }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="prizeQuantity" label="商品数量" align="left" :min-width="160">
            <template slot-scope="scope" v-if="scope.row.prizeType !== 3">
              <el-input-number controls-position="right" v-model="scope.row.prizeCount" type="number" :min="0" :disabled="isInfo" class="width50" size="small"></el-input-number> 件
            </template>
          </el-table-column>
          <el-table-column prop="date" :render-header="labelTips" align="left" width="100">
            <template slot-scope="scope" v-if="scope.row.prizeType !== 3">
              {{ (totalCount * scope.row.prizeCount || 0).toFixed(2) }}%
            </template>
          </el-table-column>
          <el-table-column prop="date" label="操作" align="left" width="80">
            <template slot-scope="scope">
              <el-button v-if="scope.$index !== 0" type="text" @click="delPrize(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div class="dm-button--add" @click="addPrize">
          <i class="el-icon-plus">新增奖项</i>
        </div>
      </el-form-item>
    </section>
    <!-- 分享设置 -->
    <dm-share :form="form"></dm-share>
    <!-- 参与门槛 -->
    <dm-threshold :form="form" :isAdd="isAdd" :thresholdData="thresholdData" ref="threshold"></dm-threshold>
    <div class="btn-wrap_fixed" :class="{ on: asideShow }">
      <el-button type="primary" @click="saveLottery('form')" v-if="!isInfo">保 存</el-button>
      <el-button @click="$router.go(-1)">返 回</el-button>
    </div>
    <vue-gic-card :showCardDialog="showCardDialog" @selectCard="selectCard" :cardLimit="3" :cardType="null"></vue-gic-card>
  </el-form>
</template>

<script>
import { detailLottery, saveLottery, downloadWheelSkinPsd } from '@/service/api/gameApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import dmUploadAvatar from '@/components/upload/avatar';
import editAlertMixin from '../common/editAlertMixin.js';
import dmShare from '../common/share.vue';
import dmThreshold from '../common/threshold.vue';
export default {
  mixins: [editAlertMixin],
  data() {
    const that = this;
    return {
      loading: false,
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
        gameId: '',
        gameName: '',
        dateTime: [],
        background: '',
        gameIntroduction: '',
        gameIntegral: '',
        gameWinningRate: '',
        gameLimitCount: '',
        gameLimitDay: '',
        gameFreeCount: '',
        gameFreeDay: '',
        skinType: 1,
        // 分享
        memberType: 0,
        shareFlag: 1,
        gameShareSettingId: '',
        shareTitle: '幸运刮刮卡，超级大礼刮出来',
        shareTextInfo: '你敢来！我就敢送！刮刮卡中奖High翻天，奖品都到怀里来',
        shareImg: {
          code: '',
          imgUrl: require("../common/img/share/ggk.png"), // eslint-disable-line
          wxImg: ''
        },
        // 参与门槛
        gameActivityAttendConditionId: '',
        tipTitle: '尚未满足游戏参与条件，请多多努力。',
        tipsImg: {
          imgUrl: require('../common/img/attend/ggk.png'), // eslint-disable-line
          code: ''
        }
      },
      prizeReferTypeOptions: [{ value: 1, label: '积分' }, { value: 2, label: '卡券' }, { value: 3, label: '谢谢参与' }],
      dataTest: {
        code: '',
        url: ''
      },
      // banner背景图url   0:自定义 1:红色 2:黑金 3:霓虹灯
      banner: [
        { skinType: 0, code: '', imgUrl: ''}, // eslint-disable-line
        { skinType: 1, code: '', imgUrl: require('../../../assets/img/2.1.jpg') }, // eslint-disable-line
        { skinType: 2, code: '', imgUrl: require('../../../assets/img/2.2.jpg') }, // eslint-disable-line
        { skinType: 3, code: '', imgUrl: require('../../../assets/img/2.3.jpg') } // eslint-disable-line
      ],
      sortList: [{ label: '奖品1', value: 1 }, { label: '奖品2', value: 2 }, { label: '奖品3', value: 3 }, { label: '奖品4', value: 4 }, { label: '奖品5', value: 5 }, { label: '奖品6', value: 6 }, { label: '奖品7', value: 7 }, { label: '奖品8', value: 8 }, { label: '随机', value: null }],
      tableList: [{ prizeId: '', prizeType: 3, prizeCount: null, prizeIntegral: null, prizeCardId: '', gameId: '', prizeStatus: 0, prizeSort: null, prizeRate: 0, cardName: '', cardType: null, cardDenomination: null, cardImageUrl: '', cardStock: null, wechatCardId: null, winRecordCode: 0, receiveCount: 0 }],
      prizeIndex: 0,
      showCardDialog: false,
      rules: {
        gameName: { type: 'string', required: true, message: '游戏标题不能为空', trigger: 'blur' },
        dateTime: { type: 'array', required: true, message: '游戏时间不能为空', trigger: 'blur' },
        skinType: { type: 'number', required: true, message: '请选择皮肤', trigger: 'blur' },
        gameIntegral: { type: 'number', required: true, message: '请输入消耗积分', trigger: 'blur' },
        gameIntroduction: { type: 'string', required: true, message: '游戏说明不能为空', trigger: 'blur' },
        gameLimitCount: { type: 'number', required: true, message: '限制次数不能为空', trigger: 'blur' },
        gameFreeCount: { type: 'number', required: true, message: '免费次数不能为空', trigger: 'blur' },
        gameWinningRate: { type: 'number', required: true, message: '中奖概率不能为空', trigger: 'blur' }
      },
      isInfo: this.$route.meta.type === 'info',
      isEdit: this.$route.meta.type === 'edit',
      isAdd: this.$route.meta.type === 'add',
      pickerOptions: {
        disabledDate(now) {
          return now.getTime() < Date.now() - 24 * 60 * 60 * 1000 && that.isAdd;
        }
      }
    };
  },
  watch: {
    'form.gameFreeCount'(val) {
      if (this.form.gameLimitCount != -1 && this.form.gameFreeCount > this.form.gameLimitCount) {
        this.$tips({ type: 'warning', message: '免费次数不能大于限制次数' });
      }
    }
  },
  components: {
    dmUploadAvatar,
    dmShare,
    dmThreshold
  },
  created() {
    if (this.isEdit || this.isInfo) {
      this.detailLottery();
      this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '游戏营销', path: '/game' }, { name: '刮刮卡', path: '/game/ggk' }, { name: '刮刮卡详情', path: '' }]);
    } else {
      this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '游戏营销', path: '/game' }, { name: '刮刮卡', path: '/game/ggk' }, { name: '刮刮卡新增', path: '' }]);
    }
  },
  computed: {
    totalCount() {
      let result = 0;
      this.tableList.forEach(v => {
        if (v.prizeCount) {
          result += parseInt(v.prizeCount);
        }
      });
      console.log(result);
      return parseInt(this.form.gameWinningRate) / result;
    },
    asideShow() {
      return this.$store.state.marketing.asideShow;
    }
  },
  methods: {
    // 当奖品为类型3 谢谢参与时 数量置为0
    resetCount(index) {
      this.tableList[index].prizeCount = 0;
    },
    addPrize() {
      this.tableList.push({ prizeId: '', prizeType: 3, prizeCount: null, prizeIntegral: null, prizeCardId: '', gameId: '', prizeStatus: 0, prizeSort: null, prizeRate: 0, cardName: '', cardType: null, cardDenomination: null, cardImageUrl: '', cardStock: null, wechatCardId: null, winRecordCode: 0, receiveCount: 0 });
    },
    delPrize(i) {
      this.tableList.splice(i, 1);
    },
    //选择卡券前置
    setPrizeCard(index) {
      this.prizeIndex = index;
      this.showCardDialog = true;
    },
    //选择卡券后置
    selectCard(val) {
      if (val) {
        this.tableList[this.prizeIndex].prizeCardId = val.coupCardId;
        this.tableList[this.prizeIndex].cardName = val.cardName;
      }
      this.showCardDialog = false;
    },
    async detailLottery() {
      this.loading = true;
      let res = await detailLottery({ gameId: this.$route.params.id, gameType: 2 });
      this.loading = false;
      const gameDetail = res.result.gameDetail;

      this.form = Object.assign(this.form, {
        gameId: gameDetail.gameId,
        gameName: gameDetail.gameName,
        dateTime: [gameDetail.gameStartTime || '', gameDetail.gameEndTime || ''],
        skinType: gameDetail.skinType,
        background: gameDetail.background,
        gameIntroduction: gameDetail.gameIntroduction,
        gameIntegral: gameDetail.gameIntegral || 0,
        gameWinningRate: gameDetail.gameWinningRate || '',
        gameLimitCount: gameDetail.gameLimitCount || '',
        gameLimitDay: gameDetail.gameLimitDay || '',
        gameFreeCount: gameDetail.gameFreeCount || '',
        gameFreeDay: gameDetail.gameFreeDay || '',
        shareFlag: gameDetail.shareFlag || 0
      });
      // if (gameDetail.gameStartTime || gameDetail.gameEndTime) {
      //   this.form.dateTime = [gameDetail.gameStartTime || '', gameDetail.gameEndTime || '']; //2
      // };

      // banner - 默认选中的图片url code
      this.banner[gameDetail.skinType].code = gameDetail.gameImageFieldCode;
      if (gameDetail.gameImageUrl && !gameDetail.gameImageUrl.includes('/static/img')) {
        this.banner[gameDetail.skinType].imgUrl = gameDetail.gameImageUrl;
      }

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

      gameDetail.prizeList.map((v, i) => {
        this.tableList.splice(i, 1, v);
      });
    },
    //提交保存
    async saveLottery(formName) {
      if (this.form.gameLimitCount != -1 && this.form.gameFreeCount > this.form.gameLimitCount) {
        this.$tips({ type: 'warning', message: '免费次数不能大于限制次数' });
        return;
      }
      let flag = false;
      this.tableList.forEach((v, i) => {
        if (v.prizeType === 1 && (!v.prizeIntegral || v.prizeCount < 0)) {
          this.$tips({ type: 'warning', message: `第${i + 1}个奖品未填写` });
          flag = true;
          return;
        }
        if (v.prizeType === 2 && (!v.prizeCardId || v.prizeCount < 0)) {
          this.$tips({ type: 'warning', message: `第${i + 1}个奖品未填写` });
          flag = true;
          return;
        }
      });
      if (flag) return;
      if (this.form.skinType === 0 && this.banner[this.form.skinType].code === '') {
        this.$tips({ type: 'warning', message: `请上传自定义分类的banner图片` });
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
      // 编辑弹窗提示 方法editAlertMixin里
      if (this.form.memberType === 1) {
        await this.$refs.threshold.triggerPeopleSet();
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          let params = {
            gameId: this.form.gameId, // 游戏主键ID (新建传空, 修改必传)
            gameName: this.form.gameName, // 1.游戏名称
            gameStartTimeStr: this.form.dateTime ? formatDateTimeByType(this.form.dateTime[0], 'yyyy-MM-dd-HH-mm-ss') : '', // 2.游戏时间 startDate
            gameEndTimeStr: this.form.dateTime ? formatDateTimeByType(this.form.dateTime[1], 'yyyy-MM-dd-HH-mm-ss') : '', // 2.游戏时间 endDate
            // 新 - 每个类型都可以上传图片
            skinType: this.form.skinType,
            gameImageFieldCode: this.banner[this.form.skinType].code, // 上传skinType对应的banner图片
            gameImageUrl: this.banner[this.form.skinType].imgUrl,

            background: this.form.skinType === 0 ? this.form.background : '', // 4.背景颜色 (skinType!=0为空)
            gameIntroduction: this.form.gameIntroduction, // 5.游戏说明
            gameIntegral: this.form.gameIntegral, // 6.1 抽奖消耗
            gameWinningRate: this.form.gameWinningRate, // 6.2 中奖几率
            gameLimitCount: this.form.gameLimitCount, // 6.3 限制抽奖 次数
            gameLimitDay: this.form.gameLimitDay, // 6.3 限制抽奖 每天的选择  1: 选择; 0: 不选
            gameFreeCount: this.form.gameFreeCount, // 6.4 免费抽奖次数 (免费次数<限制抽奖次数)
            gameFreeDay: this.form.gameFreeDay, // 6.4 免费抽奖 每天的选择  1: 选择; 0: 不选
            gameStatus: this.form.gameStatus,
            gameType: 2, // 活动类型，1：刮刮卡，2：刮刮卡
            shareFlag: this.form.shareFlag || 0
          };

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

          let list = [];
          this.tableList.forEach((v, i) => {
            if (v.prizeType === 1) {
              list.push({
                prizeIntegral: v.prizeIntegral,
                prizeCount: v.prizeCount, // 奖品数量
                prizeRate: 0,
                prizeSort: i + 1, // 排序值
                prizeStatus: 1,
                prizeType: v.prizeType, // 奖品类型  1: 积分;  2: 卡券;  3: 谢谢参与
                receiveCount: 0,
                winRecordCode: 0
              });
            } else if (v.prizeType === 2) {
              list.push({
                prizeCardId: v.prizeCardId, // 奖项设置: 所选卡券的主键ID coupCardId
                prizeCount: v.prizeCount, // 奖品数量
                prizeRate: 0,
                prizeSort: i + 1, // 排序值
                prizeStatus: 1,
                prizeType: v.prizeType, // 奖品类型  1: 积分;  2: 卡券;  3: 谢谢参与
                receiveCount: 0,
                winRecordCode: 0
              });
            } else {
              list.push({
                prizeCount: v.prizeCount, // 奖品数量
                prizeRate: 0,
                prizeSort: i + 1, // 排序值
                prizeStatus: 1,
                prizeType: v.prizeType, // 奖品类型  1: 积分;  2: 卡券;  3: 谢谢参与
                receiveCount: 0,
                winRecordCode: 0
              });
            }
          });
          params.prizeList = list;

          const postParam = {
            gameDetail: JSON.stringify(params),
            attendCondition: JSON.stringify(attendCondition),
            shareSetting: JSON.stringify(shareSetting)
          };

          saveLottery(postParam).then(res => {
            if (res.errorCode === 0) {
              this.$tips({ type: 'success', message: this.isAdd ? '新增成功' : '编辑成功' });
              if (this.isAdd) {
                this.$router.push('/game/ggk');
              } else {
                this.$confirm('操作成功，是否返回列表?', '提示', {
                  confirmButtonText: '返回列表',
                  cancelButtonText: '留在本页',
                  type: 'warning'
                })
                  .then(() => {
                    this.$router.push('/game/ggk');
                  })
                  .catch(() => {
                    this.detailLottery(); //先刷新页面
                  });
              }
            } else {
              this.$tips({ type: 'error', message: res.message || '操作失败' });
            }
          });
        } else {
          this.$tips({ type: 'warning', message: '表单填写不完整' });
          return false;
        }
      });
    },
    // 表格提示
    labelTips(h, { column, $index }) {
      return (
        <el-tooltip class="item" effect="dark" content="中奖几率=奖品总几率*（该奖品数/所有有效的奖品总数）" placement="top-start">
          <span class="fw500">
            中奖几率 <i class="iconfont icon-xinxixianshi minor-font-color fz14" />
          </span>
        </el-tooltip>
      );
    },
    downloadWheelSkinPsd() {
      window.location = downloadWheelSkinPsd;
    }
  }
};
</script>

<style lang="scss" scoped>
.skin-box {
  display: block;
  width: 220px;
  height: 103px;
  &.active {
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.5);
  }
}
</style>
