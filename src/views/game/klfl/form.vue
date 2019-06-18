<template>
  <el-form ref="form" :model="form" :rules="rules" label-width="110px" class="ptyx-add" v-loading="loading" loading-text="加载中">
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">游戏内容</h3>
      <el-form-item label="游戏名称" prop="gameName" class="width50">
        <dm-input v-model="form.gameName" class="w400" :maxlength="10"></dm-input>
      </el-form-item>
      <el-form-item label="游戏背景" class="clearfix">
        <div class="left-bg fl">
          <div class="bg-head gray-bg">示例</div>
          <img :src="currentBg.imageUrl || systemBakImgList[0].imageUrl" />
        </div>
        <div class="right-bg fl">
          <div class="bg-head gray-bg">模板</div>
          <ul class="right-bg-items">
            <li v-for="(v, i) in systemBakImgList" :class="{ active: v.imgFieldCode === currentBg.imgFieldCode }" :key="i" @click="selectBg(v, i)">
              <img :src="v.imageUrl" alt="" />
              <span class="right-tips">{{ i > 2 ? '自定义' : '模板' }}</span>
            </li>
          </ul>
          <dm-upload-img icon="el-icon-upload" @backImg="backImgBg" class="uplaod" :tipsStyle="{ position: 'absolute', top: '-30px', width: '100%', left: '0px' }" :showImg="false" :model.sync="form.bgImg" width="auto" label="上传本地图片" tips=" 背景图片大小不超过1M，尺寸750*1206px"></dm-upload-img>
        </div>
      </el-form-item>
      <el-form-item label="游戏按钮" class="clearfix">
        <div class="left-btn fl">
          <div class="btn-head gray-bg">示例</div>
          <img :src="currentBtn.imageUrl || systemBtnImgList[0].imageUrl" />
        </div>
        <div class="right-btn fl">
          <div class="btn-head gray-bg">模板</div>
          <ul class="right-btn-items">
            <li v-for="(v, i) in systemBtnImgList" :class="{ active: v.imgFieldCode === currentBtn.imgFieldCode }" :key="i" @click="selectBtn(v, i)">
              <img :src="v.imageUrl" alt="" />
              <span class="right-tips">{{ i > 2 ? '自定义' : '模板' }}</span>
            </li>
          </ul>
          <dm-upload-img icon="el-icon-upload" @backImg="backImgBtn" class="uplaod" :tipsStyle="{ position: 'absolute', top: '-30px', width: '100%', left: '0px' }" :showImg="false" :model.sync="form.btnImg" width="auto" label="上传本地图片" tips=" 按钮图片大小不超过1M，尺寸602*100px"></dm-upload-img>
        </div>
      </el-form-item>
      <el-form-item label="游戏时间" prop="dateTime" class="width50">
        <el-date-picker :picker-options="pickerOptions" :default-time="['00:00:00', '23:59:59']" class="w400" v-model="form.dateTime" type="datetimerange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"></el-date-picker>
      </el-form-item>
      <el-form-item label="规则文案色" prop="gameRuleTitleFontColor" class="width50">
        <el-color-picker class="vertical-middle" v-model="form.gameRuleTitleFontColor"></el-color-picker>
        {{ form.gameRuleTitleFontColor }}
      </el-form-item>
      <el-form-item label="规则内容" prop="gameIntroduction" class="width50">
        <dm-input class="w400" type="textarea" :rows="4" v-model="form.gameIntroduction" :maxlength="200"></dm-input>
      </el-form-item>
      <el-form-item label="中奖记录文案色" prop="winRecordTitleFontColor" class="width50">
        <el-color-picker class="vertical-middle" v-model="form.winRecordTitleFontColor"></el-color-picker>
        {{ form.winRecordTitleFontColor }}
      </el-form-item>
      <el-form-item label="报错提示色" prop="errorTipType" class="width50">
        <el-radio v-model="form.errorTipType" :label="1">黑底白字</el-radio>
        <el-radio v-model="form.errorTipType" :label="2">红底白字</el-radio>
      </el-form-item>

      <el-form-item label="口令类型" prop="codeType">
        <div>
          <el-radio :disabled="$route.meta.type === 'edit'" v-model="form.codeType" :label="1">唯一口令</el-radio>
          <el-radio :disabled="$route.meta.type === 'edit'" v-model="form.codeType" :label="2">多口令</el-radio>
          <span v-if="$route.meta.type === 'edit'" class="pl20 fz12 gray">编辑时不能切换口令类型</span>
        </div>
        <div class="kltype-tips gray-bg">
          <p>唯一口令：默认所有奖项的中奖口令均为该口令，一个用户一个口令只能使用一次。</p>
          <p>多口令：各奖项的中奖口令及数量支持单独配置，在中奖口令数量未抢完时，一个用户一个口令只能用一次。</p>
        </div>
        <p v-if="form.codeType == 2" class="fz12 gray">口令限制为4-32个字符且不能含有标点符号，文件最多允许3万行</p>
        <label v-if="form.codeType == 2" class="el-button el-button--primary el-button--medium" :class="{ 'is-disabled': kfFileDisabled }"
          >上传口令文件
          <input type="file" style="display:none;" :disabled="kfFileDisabled" runat="server" ref="uploader" v-uploadfile="this" />
        </label>
        <span v-if="form.codeType == 2" class="pl20 blue" @click="klflDownTemp">下载导入模板示例.csv</span>
      </el-form-item>
      <el-form-item v-if="form.codeType == 1" label="口令内容" prop="singleCode" class="width50" :rules="{ required: true, message: '请输入口令内容', trigger: 'blur' }">
        <dm-input type="text" class="w400" v-model="form.singleCode" :maxlength="23"></dm-input>
      </el-form-item>
      <el-form-item label="口令提示文案色" prop="tipFontColor" class="width50">
        <el-color-picker class="vertical-middle" v-model="form.tipFontColor"></el-color-picker>
        {{ form.tipFontColor }}
      </el-form-item>
      <el-form-item label="口令提示链接" prop="tipUrl" class="width50">
        <dm-input type="text" class="w400" v-model="form.tipUrl" :maxlength="500"></dm-input>
      </el-form-item>
    </section>
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">奖项设置</h3>
      <el-form-item label="首次特殊策略" class="el-form-item__margin-top14">
        <el-table tooltipEffect="light" :data="tableList" style="width: 100%" v-loading="tableLoading">
          <el-table-column prop="strategyName" label="策略名称" align="left"></el-table-column>
          <el-table-column prop="prizeReferType" label="策略类型" align="left" :formatter="formatterPrizeReferType"></el-table-column>
          <el-table-column prop="prizeReferType" label="奖品内容" align="left">
            <template slot-scope="scope">
              {{ formatterPrizeContent(scope.row) }}
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
        <div v-if="tableList.length < 10" class="dm-button--add" @click="editStrategy('')">
          <i class="el-icon-plus">新增策略</i>
        </div>
      </el-form-item>
      <el-form-item label="奖品设置" class="el-form-item__margin-top14">
        <el-table tooltipEffect="light" :data="prizeList" style="width: 100%" v-loading="prizeLoading">
          <el-table-column prop="awardName" label="序号" align="left" width="90">
            <template slot-scope="scope">
              {{ scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column prop="prizeReferType" label="奖品类型" align="left" width="120">
            <template slot-scope="scope">
              <el-select size="small" v-model="scope.row.prizeReferType" placeholder="请选择">
                <el-option v-for="item in prizeReferTypeOptions" :key="item.value" :label="item.label" :value="item.value"></el-option>
              </el-select>
            </template>
          </el-table-column>
          <el-table-column prop="ranprizeIntegralkEnd" label="奖项设置" align="left" :min-width="200">
            <template slot-scope="scope">
              <div v-if="scope.row.prizeReferType === 1"><el-input v-model="scope.row.prizeIntegral" :min="0" type="number" class="w150" size="small"></el-input> 积分</div>
              <el-button v-if="scope.row.prizeReferType === 2" size="small" @click="setPrizeCard(scope.$index)">{{ scope.row.card.cardName || '选择卡券' }}</el-button>
              <div v-if="scope.row.prizeReferType === 3">
                <el-input v-model="scope.row.proGift.giftName" type="text" maxlength="10" placeholder="不超过10个字" class="w150" size="small"></el-input>
                <div class="clearfix">
                  <dm-upload-avatar class="mt10 fl" :model.sync="scope.row.proGift.mainPic" width="40" height="40" label="上传图片" tips="" :labelStyle="{ padding: '9px 15px', fontSize: '12px' }"></dm-upload-avatar>
                  <span class="fl fz12 gray" style="margin: 20px 0 0 10px;">建议尺寸:200*200</span>
                </div>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="prizeName" label="奖品设置(已领取)" align="left" width="200">
            <template slot-scope="scope">
              <div v-if="scope.row.prizeId">{{ scope.row.prizeCount }} <i class="el-icon-edit blue" @click="setPrizeCount(scope.row)"></i> ({{ scope.row.prizeCount - scope.row.prizeStock }})</div>
              <div v-if="!scope.row.prizeId">
                <el-input-number controls-position="right" v-model="scope.row.prizeStock" :precision="0" :min="0" class="w150" size="small"></el-input-number>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="prizeImgFieldCode" label="选择口令（剩余口令数）" align="left" :min-width="180">
            <template slot-scope="scope">
              <el-button size="small" @click="codeSelect(scope.$index)">{{ scope.row.codeId ? scope.row.gameCode + '(' + scope.row.codeStock + ')' : '选择口令' }}</el-button>
            </template>
          </el-table-column>
          <el-table-column prop="date" label="操作" align="left" width="60">
            <template slot-scope="scope">
              <el-button type="text" @click="delPrizeItem(scope.$index)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="tableList.length < 10" class="dm-button--add" @click="addPrize">
          <i class="el-icon-plus">添加奖品</i>
        </div>
      </el-form-item>
    </section>
    <!-- 分享设置 -->
    <dm-share :form="form"></dm-share>
    <!-- 参与门槛 -->
    <dm-threshold :form="form" :isAdd="isAdd" :thresholdData="thresholdData" ref="threshold"></dm-threshold>
    <div class="btn-wrap_fixed" :class="{ on: asideShow }">
      <el-button type="primary" @click="klflSave('form')" v-if="!isInfo">保 存</el-button>
      <el-button @click="$router.go(-1)">返 回</el-button>
    </div>
    <vue-gic-card :showCardDialog="showCardDialog" @selectCard="selectCard" :cardLimit="3" :cardType="null"></vue-gic-card>
    <calculate :show.sync="calculateShow" :totalCount="currentObj.prizeCount" :prizeId="currentObj.prizeId" :prizeReferType="currentObj.prizeReferType" :prizeReferId="currentObj.prizeReferId" :useStrategy="0" @countRefresh="countRefresh"></calculate>
    <strategy :show.sync="strategyShow" :strategyType="strategyType" :dataId="gamePrizeStrategyId" :gameActivityId="form.gameActivityId" :cardObj="strategyDialog" @set-data="setStrategyCard" @refesh="klflStrategyList"></strategy>
    <code-dialog :show.sync="codeDialogShow" :id="form.gameActivityId" @selectedCode="selectedCode"></code-dialog>
  </el-form>
</template>

<script>
import { klflDetail, klflSave, klflStrategyList, klflPrizeList, klflStrategySort, klflStrategyDel, klflDownTemp } from '@/service/api/gameApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import dmUploadImg from '@/components/upload/img';
import dmUploadAvatar from '@/components/upload/avatar';
import strategy from './strategy';
import calculate from '@/components/calculate';
import codeDialog from './codeDialog';
import editAlertMixin from '../common/editAlertMixin.js';
import axios from 'axios';
import config from '@/config';
import dmShare from '../common/share.vue';
import dmThreshold from '../common/threshold.vue';
let result = {};
export default {
  mixins: [editAlertMixin],
  data() {
    const that = this;
    return {
      loading: false,
      tableLoading: false,
      prizeLoading: false,
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
        gameActivityId: this.$route.params.id,
        gameName: '',
        bgImg: {
          code: '',
          imgUrl: ''
        },
        btnImg: {
          code: '',
          imgUrl: ''
        },
        dateTime: [],
        gameIntroduction: '',
        codeType: 1,
        singleCode: '',
        gameActivityCustomId: '',
        gameRuleTitleFontColor: '', // 6.活动规则文案色
        winRecordTitleFontColor: '', // 15.中奖记录文案色
        tipFontColor: '', // 9.口令提示文案色
        errorTipType: 1, // 16.报错提示色 黑底白字: 1;  红底白字: 2
        tipUrl: '',
        // 分享
        shareFlag: 1,
        gameShareSettingId: '',
        shareTitle: '输口令，赢大奖',
        shareTextInfo: 'Hi朋友，送你一个口令福利，手慢无！',
        shareImg: {
          code: '',
          imgUrl: require("../common/img/share/klfl.png"), // eslint-disable-line
          wxImg: ''
        },
        // 参与门槛
        memberType: 0,
        gameActivityAttendConditionId: '',
        tipTitle: '尚未满足游戏参与条件，请多多努力。',
        tipsImg: {
          imgUrl: require('../common/img/attend/klfl.png'), // eslint-disable-line
          code: ''
        }
      },
      rules: {
        gameName: { type: 'string', required: true, message: '游戏标题不能为空', trigger: 'blur' },
        dateTime: { type: 'array', required: true, message: '游戏时间不能为空', trigger: 'blur' },
        gameIntroduction: { type: 'string', required: true, message: '游戏说明不能为空', trigger: 'blur' },
        shareImgUrl: { type: 'object', required: true, message: '分享图片不能为空', trigger: 'blur' },
        shareTitle: { type: 'string', required: true, message: '分享标题不能为空', trigger: 'blur' },
        shareTextInfo: { type: 'string', required: true, message: '分享描叙不能为空', trigger: 'blur' }
      },
      tableList: [],
      prizeIndex: 0,
      showCardDialog: false,
      strategyShow: false,
      strategyType: 'add',
      gamePrizeStrategyId: '',
      prizeList: [{ prizeCount: 0, prizeStock: 0, card: { cardName: '' }, proGift: { mainPicUrl: { code: '', imgUrl: '' } }, codeId: '', gameCode: '', codeStock: '' }],
      prizeReferTypeOptions: [{ value: 1, label: '积分' }, { value: 2, label: '卡券' }, { value: 3, label: '礼品' }],
      systemBakImgList: [{ imageUrl: '' }],
      systemBtnImgList: [{ imageUrl: '' }],
      currentBg: { imageUrl: '' },
      currentBtn: { imageUrl: '' },
      activeBg: 0,
      activeBtn: 0,
      kfFileDisabled: false,
      klerrRadio: '1',
      currentObj: { prizeCount: 0 },
      calculateShow: false,
      codeDialogShow: false,
      codeIndex: 0, //选中的code

      //传到strategy的卡券
      strategyDialog: {},
      isdialogCard: false,
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
  components: {
    dmUploadImg,
    dmUploadAvatar,
    strategy,
    calculate,
    codeDialog,
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
      this.klflDetail();
      this.klflStrategyList();
      this.klflPrizeList();
      this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '游戏营销', path: '' }, { name: '口令福利', path: '/game/klfl' }, { name: '口令福利编辑', path: '' }]);
    } else if (this.isAdd) {
      this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '游戏营销', path: '' }, { name: '口令福利', path: '/game/klfl' }, { name: '口令福利新增', path: '' }]);
      (async () => {
        await this.klflDetail(true);
        await this.klflStrategyList();
      })();
    }
  },
  methods: {
    //code选择
    codeSelect(i) {
      if (this.form.codeType == 1) {
        this.$tips({ type: 'warning', message: '唯一口令无需再次选择' });
        return;
      }
      this.codeIndex = i;
      this.codeDialogShow = true;
    },
    selectedCode(val) {
      console.log(val);
      this.prizeList[this.codeIndex].codeId = val.gameWinCodeId;
      this.prizeList[this.codeIndex].gameCode = val.gameCode;
      this.prizeList[this.codeIndex].codeStock = val.codeStock;
    },
    setPrizeCount(obj) {
      this.currentObj = obj;
      this.calculateShow = true;
    },
    countRefresh(val) {
      console.log(val);
      this.currentObj.prizeStock = this.currentObj.prizeCount = val.calc ? parseInt(this.currentObj.prizeCount) + parseInt(val.num) : parseInt(this.currentObj.prizeCount) - parseInt(val.num);
    },
    selectBg(v, i) {
      this.currentBg = v;
      this.activeBg = i;
    },
    backImgBg(val) {
      if (val.imgUrl) {
        this.systemBakImgList.push({
          imageUrl: val.imgUrl,
          imgFieldCode: val.code
        });
      }
    },
    selectBtn(v, i) {
      this.currentBtn = v;
      this.activeBtn = i;
    },
    backImgBtn(val) {
      if (val.imgUrl) {
        this.systemBtnImgList.push({
          imageUrl: val.imgUrl,
          imgFieldCode: val.code
        });
      }
    },
    setPrizeCard(index) {
      this.prizeIndex = index;
      this.showCardDialog = true;
      this.isdialogCard = false;
    },
    setStrategyCard() {
      this.showCardDialog = true;
      this.isdialogCard = true;
    },
    selectCard(val) {
      if (val) {
        if (this.isdialogCard) {
          this.strategyDialog = val;
        } else {
          console.log(val, this.prizeList);
          this.prizeList[this.prizeIndex].card = val;
        }
      }
      this.showCardDialog = false;
    },
    //移除单个奖品
    delPrizeItem(index) {
      this.prizeList.splice(index, 1);
    },
    //添加奖品
    addPrize() {
      this.prizeList.push({ prizeCount: 0, prizeStock: 0, card: { cardName: '' }, proGift: { mainPicUrl: { code: '', imgUrl: '' } }, codeId: '', gameCode: '', codeStock: '' });
    },
    formatterPrizeReferType(row) {
      const arr = ['x', '积分', '卡券', '礼品'];
      return arr[row.prizeReferType];
    },
    formatterPrizeContent(row) {
      if (row.prizeReferType === 1) {
        return '积分：' + row.prizeIntegral;
      } else if (row.prizeReferType === 2) {
        return '卡券：' + row.proTitle;
      } else if (row.prizeReferType === 3) {
        return '礼品：' + row.proGiftName;
      } else {
        return '--';
      }
    },
    editStrategy(val) {
      this.strategyType = val ? 'edit' : 'add';
      this.strategyShow = true;
      this.gamePrizeStrategyId = val;
    },
    delItem(row) {
      klflStrategyDel({ gamePrizeStrategyId: row.gamePrizeStrategyId }).then(res => {
        if (res.errorCode === 0) {
          this.$tips({ type: 'success', message: '删除成功' });
          this.klflStrategyList();
        } else {
          this.$tips({ type: 'error', message: res.message || '删除失败' });
        }
      });
    },
    //加载策略列表
    klflStrategyList() {
      this.tableLoading = true;
      return new Promise((resolve, reject) => {
        klflStrategyList({ gameActivityId: this.$route.params.id || this.form.gameActivityId })
          .then(res => {
            if (res.result && res.result.strategyList) {
              this.tableList = res.result.strategyList;
            } else {
              this.tableList = [];
            }
            this.tableLoading = false;
          })
          .catch(err => {
            this.tableLoading = false;
          });
      });
    },
    //加载奖项列表
    klflPrizeList() {
      this.prizeLoading = true;
      return new Promise((resolve, reject) => {
        klflPrizeList({ gameActivityId: this.$route.params.id || this.form.gameActivityId })
          .then(res => {
            if (res.result) {
              this.prizeList = res.result;
              this.prizeList.map(v => {
                if (v.prizeReferType === 1) {
                  v.proGift = { mainPic: { imgUrl: '', code: '' } };
                  v.card = { cardName: '', coupCardId: '' };
                } else if (v.prizeReferType === 3) {
                  v.proGift.mainPic = {
                    imgUrl: v.proGift && v.proGift.mainPicUrl,
                    code: v.proGift && v.proGift.mainPicFieldCode
                  };
                  v.card = { cardName: '', coupCardId: '' };
                } else if (v.prizeReferType === 2) {
                  v.proGift = { mainPic: { imgUrl: '', code: '' } };
                  v.card = { cardName: v.card.cardName, coupCardId: v.card.coupCardId };
                }
              });
              console.log(this.prizeList);
            }
            this.prizeLoading = false;
          })
          .catch(err => {
            this.prizeLoading = false;
          });
      });
    },
    //加载详情
    klflDetail(addFlag) {
      this.loading = true;
      return new Promise((resolve, reject) => {
        klflDetail({ gameActivityId: addFlag ? '' : this.$route.params.id })
          .then(res => {
            this.loading = false;
            result = res.result;
            this.systemBakImgList = result.systemBakImgList;
            this.systemBtnImgList = result.systemBtnImgList;
            if (result.game) {
              this.form.gameActivityId = result.game.gameActivityId;
              this.form.gameName = result.game && result.game.gameName;
              this.form.dateTime = result.game && [result.game.gameStartTime || '', result.game.gameEndTime || ''];
              this.form.gameIntroduction = result.game && result.game.gameIntroduction;
              this.form.shareFlag = result.game.shareFlag || 0;

              // 分享
              if (result.game.shareFlag === 1) {
                const { shareTitle, shareTextInfo, shareImgFieldCode, shareImgUrl, shareImgUrlWX, gameShareSettingId } = result.game.shareSetting;
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
              if (result.game.attendCondition) {
                const { memberType, tipTitle, tipImageFieldCode, tipImageUrl, searchParams, gameActivityAttendConditionId } = result.game.attendCondition;
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

              this.form.backgroudImg = {
                imgUrl: result.game.backgroudImgUrl,
                code: result.game.backgroudImgFieldCode
              };
              this.form.codeType = result.game.codeType; // 7.口令类型 唯一口令: 1;  多口令: 2
              this.form.singleCode = result.game.singleCode; // 8.口令内容 codeType = 1显示
              if (result.game.backgroudImgUrl && result.game.backgroudImgFieldCode) {
                if (this.systemBakImgList.map(v => v.imgFieldCode).indexOf(result.game.backgroudImgFieldCode) < 0) {
                  this.systemBakImgList.push({ imgFieldCode: result.game.backgroudImgFieldCode, imageUrl: result.game.backgroudImgUrl });
                }
                this.currentBg = { imgFieldCode: result.game.backgroudImgFieldCode, imageUrl: result.game.backgroudImgUrl };
              }
              if (result.game.buttonImgFieldCode && result.game.buttonImgUrl) {
                if (this.systemBtnImgList.map(v => v.imgFieldCode).indexOf(result.game.buttonImgFieldCode) < 0) {
                  this.systemBtnImgList.push({ imgFieldCode: result.game.buttonImgFieldCode, imageUrl: result.game.buttonImgUrl });
                }
                this.currentBtn = { imgFieldCode: result.game.buttonImgFieldCode, imageUrl: result.game.buttonImgUrl };
              }
              if (result.game.activityCustom) {
                this.form.gameActivityCustomId = result.game.activityCustom.gameActivityCustomId;
                this.form.gameRuleTitleFontColor = result.game.activityCustom.gameRuleTitleFontColor; // 6.活动规则文案色
                this.form.winRecordTitleFontColor = result.game.activityCustom.winRecordTitleFontColor; // 15.中奖记录文案色
                this.form.tipFontColor = result.game.activityCustom.tipFontColor; // 9.口令提示文案色
                this.form.errorTipType = result.game.activityCustom.errorTipType; // 16.报错提示色 黑底白字: 1;  红底白字: 2
                this.form.tipUrl = result.game.activityCustom.tipUrl; // 10.口令提示链接
              }
            } else {
              this.form.gameActivityId = result.tempActivityId;
              console.log(this.form);
            }
          })
          .catch(err => {
            this.loading = false;
          });
      });
    },
    //提交保存
    async klflSave(formName) {
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
            gameName: this.form.gameName,
            backgroudImgUrl: this.currentBg.imageUrl,
            backgroudImgFieldCode: this.currentBg.imgFieldCode,
            buttonImgUrl: this.currentBtn.imageUrl,
            buttonImgFieldCode: this.currentBtn.imgFieldCode,
            gameStartTime: formatDateTimeByType(this.form.dateTime[0], 'yyyy-MM-dd-HH-mm-ss'),
            gameEndTime: formatDateTimeByType(this.form.dateTime[1], 'yyyy-MM-dd-HH-mm-ss'),
            gameIntroduction: this.form.gameIntroduction,
            codeType: this.form.codeType,
            singleCode: this.form.singleCode,
            shareImgUrl: this.form.shareImg.imgUrl,
            shareImgFieldCode: this.form.shareImg.code,
            shareImgUrlWX: this.form.shareImg.wxImg,
            shareTitle: this.form.shareTitle,
            shareTextInfo: this.form.shareTextInfo,
            strategyIds: this.tableList.map(v => v.gamePrizeStrategyId).join(','),
            gameActivityId: this.isEdit ? this.form.gameActivityId : '',
            activityCustom: {
              gameRuleTitleFontColor: this.form.gameRuleTitleFontColor,
              tipUrl: this.form.tipUrl,
              tipFontColor: this.form.tipFontColor,
              winRecordTitleFontColor: this.form.winRecordTitleFontColor,
              errorTipType: this.form.errorTipType,
              gameActivityCustomId: this.form.gameActivityCustomId // get-game-klfl-edit编辑回显的 游戏自定义配置表主键ID
            },
            tempActivityId: this.isAdd ? this.form.gameActivityId : '', // 与上面新建不同, 这个没
            shareFlag: this.form.shareFlag || 0
          };

          // 游戏分享
          let shareSetting = {};
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

          let gameCodePrizeList = [];
          this.prizeList.map((v, i) => {
            if (v.prizeReferType == 1) {
              // 积分
              gameCodePrizeList.push({
                codeId: this.form.codeType == 1 ? '' : v.codeId || '',
                prizeReferType: 1, // 奖品类型: 积分    类型  1: '积分'; 2: '卡券';  3: '礼品'
                prizeIntegral: v.prizeIntegral || '', //     奖项设置  积分数
                prizeSort: i,
                gameActivityId: this.isEdit ? this.form.gameActivityId : '',
                prizeCount: v.prizeId ? v.prizeCount : v.prizeStock, // 奖品设置 数量
                prizeStock: v.prizeStock // 奖品设置 库存数 = 数量
              });
            } else if (v.prizeReferType == 2) {
              // 卡券
              gameCodePrizeList.push({
                codeId: this.form.codeType == 1 ? '' : v.codeId || '', // 口令ID,  唯一口令为null,   多个口令 load-game-code-list中选择的 gameWinCodeId,  多个口令每个只能匹配一个奖项
                prizeReferType: 2, // 奖品类型: 卡券    类型  1: '积分'; 2: '卡券';  3: '礼品'
                prizeIntegral: 0,
                prizeReferId: v.card.coupCardId || '', // 奖项设置 所选卡券主键ID
                prizeSort: i, // 奖品排序
                gameActivityId: this.isEdit ? this.form.gameActivityId : '', // 新建游戏为空
                prizeCount: v.prizeId ? v.prizeCount : v.prizeStock, // 奖品设置 数量
                prizeStock: v.prizeStock // 奖品设置 库存数 = 数量
              });
              console.log(v);
            } else if (v.prizeReferType == 3) {
              // 礼品
              gameCodePrizeList.push({
                codeId: this.form.codeType == 1 ? '' : v.codeId || '',
                prizeReferType: 3, // 奖品类型: 礼品    类型  1: '积分'; 2: '卡券';  3: '礼品'
                prizeIntegral: 0,
                proGift: {
                  giftName: v.proGift.giftName, // 奖项设置 礼品名称
                  mainPicUrl: v.proGift.mainPic ? v.proGift.mainPic.imgUrl : '', // 奖项设置 礼品图片URL
                  mainPicFieldCode: v.proGift.mainPic ? v.proGift.mainPic.code : '', // 奖项设置 礼品图片CODE
                  giftStock: v.proGift.giftStock // 奖品设置 库存数 = 数量
                },
                prizeSort: i,
                gameActivityId: this.isEdit ? this.form.gameActivityId : '',
                prizeCount: v.prizeId ? v.prizeCount : v.prizeStock, // 奖品设置 数量
                prizeStock: v.prizeStock // 奖品设置 库存数 = 数量
              });
            }
          });
          params.gameCodePrizeList = gameCodePrizeList;
          const postParam = {
            reqData: JSON.stringify(params),
            attendCondition: JSON.stringify(attendCondition),
            shareSetting: JSON.stringify(shareSetting)
          };

          klflSave(postParam).then(res => {
            if (res.errorCode === 0) {
              this.$tips({ type: 'success', message: this.isAdd ? '新增成功' : '编辑成功' });
              if (this.isAdd) {
                this.$router.push('/game/klfl');
              } else {
                this.$confirm('操作成功，是否返回列表?', '提示', {
                  confirmButtonText: '返回列表',
                  cancelButtonText: '留在本页',
                  type: 'warning'
                })
                  .then(() => {
                    this.$router.push('/game/klfl');
                  })
                  .catch(() => {
                    this.klflDetail();
                    this.klflStrategyList();
                    this.klflPrizeList();
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
    //策略排序
    sortGame(id, type, flag) {
      if (flag) return;
      klflStrategySort({ sortType: type, gamePrizeStrategyId: id, gamePrizeStrategyIds: this.tableList.map(v => v.gamePrizeStrategyId).join(',') }).then(res => {
        console.log(res);
        this.klflStrategyList();
      });
    },
    klflDownTemp() {
      window.location = klflDownTemp + '?requestProject=gic-web';
    }
  },
  directives: {
    uploadfile: {
      bind(el, binding) {
        el.addEventListener('change', function() {
          binding.value.kfFileDisabled = true;
          let formData = new FormData();
          formData.append('file', el.files[0]);
          formData.append('requestProject', 'gic-web');
          formData.append('gameActivityId', binding.value.$route.params.id || binding.value.form.gameActivityId);
          axios
            .post(config.api + '/api-marketing/import-game-klfl-code', formData)
            .then(res => {
              console.log(res);
              el.value = '';
              if (res.data.response.errorCode === 0) {
                binding.value.$tips({ type: 'success', message: '上传成功' });
              } else {
                binding.value.$tips({ type: 'error', message: res.data.response.message || '上传失败' });
              }
              binding.value.kfFileDisabled = false;
            })
            .catch(error => {
              binding.value.kfFileDisabled = false;
              console.log(error);
              binding.value.$tips({ type: 'error', message: error.data.response.message || '上传失败' });
            });
        });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
@import './form.scss';
</style>
