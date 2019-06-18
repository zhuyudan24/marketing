<template>
  <el-form ref="form" :model="form" :rules="rules" label-width="120px" class="ptyx-add" v-loading="loading" element-loading-text="拼命加载中">
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">游戏内容</h3>
      <el-form-item label="游戏名称" prop="gameName" class="width50">
        <dm-input v-model="form.gameName" class="w400" :disabled="isInfo" :maxlength="25"></dm-input>
      </el-form-item>
      <el-form-item label="游戏时间" prop="dateTime" class="width50">
        <el-date-picker class="w400" :disabled="isInfo" v-model="form.dateTime" :picker-options="pickerOptions" type="datetimerange" :default-time="['00:00:00', '23:59:59']" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期"> </el-date-picker>
      </el-form-item>
      <el-form-item label="游戏说明" prop="gameIntroduction">
        <dm-input type="textarea" class="w400" :rows="4" v-model="form.gameIntroduction" :disabled="isInfo" :maxlength="200"></dm-input>
      </el-form-item>
      <el-form-item label="每次游戏消耗" prop="usedValue" class="width50"> <el-input-number controls-position="right" v-model="form.usedValue" :precision="0" :min="1" class="w300" placeholder="请输入正整数" @blur="nonnegative(form.usedValue)" :disabled="isInfo"> </el-input-number> 体力 </el-form-item>
      <el-form-item label="无体力可使用" prop="usedIntegral" class="width50"> <el-input-number controls-position="right" v-model="form.usedIntegral" :precision="0" :min="1" class="w300" placeholder="请输入正整数" @blur="nonnegative(form.usedIntegral)" :disabled="isInfo"> </el-input-number> 积分 </el-form-item>
      <el-form-item label="奖品设置" class="pt20">
        <p class="gray fz13">用户按游戏得分由高到低依次获得奖项。</p>
        <el-table tooltipEffect="light" :data="tableList" style="width: 100%">
          <el-table-column prop="awardName" label="奖项" align="left" width="90">
            <template slot-scope="scope">
              {{ (scope.$index + 1) | numberToChinese }}等奖
            </template>
          </el-table-column>
          <el-table-column prop="winnerCount" label="奖品数量" align="left" width="220">
            <template slot-scope="scope">
              <el-input-number controls-position="right" v-model="scope.row.winnerCount" :precision="0" :min="1" size="small" class="w150" :disabled="isInfo"></el-input-number> 个
            </template>
          </el-table-column>
          <el-table-column prop="prizeName" label="商品名称" align="left" :min-width="180">
            <template slot-scope="scope">
              <dm-input v-model="scope.row.prizeName" size="small" :disabled="isInfo" :maxlength="15"></dm-input>
            </template>
          </el-table-column>
          <el-table-column prop="prizeImgFieldCode" label="商品图片(150*150)" align="center" :min-width="100">
            <template slot-scope="scope">
              <dm-upload-avatar :model.sync="scope.row.prizeImg" label="上传图片" width="40" height="40" tips="" class-name="block-center" :disabled="isInfo"></dm-upload-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="date" label="操作" align="left" width="60">
            <template slot-scope="scope">
              <el-button type="text" v-if="scope.$index > 2" @click="delItem(scope.$index)" :disabled="isInfo">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <div v-if="tableList.length < 10 && !isInfo" class="dm-button--add" @click="addPrice">
          <i class="el-icon-plus">添加奖品</i>
        </div>
      </el-form-item>
    </section>
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">页面设置</h3>
      <el-form-item label="品牌logo" class="width50 is-required">
        <dm-upload-avatar :model.sync="form.logoImg" label="上传图片" width="80" height="80" tips="请上传高度为85px的PNG透明背景图片" :disabled="isInfo"></dm-upload-avatar>
      </el-form-item>
      <el-form-item label="选择拼图" prop="puzzleImg" class="width50 is-required">
        <dm-upload-avatar :model.sync="form.puzzleImg" label="上传图片" tips="图片建议尺寸：510px*680px" :disabled="isInfo"></dm-upload-avatar>
      </el-form-item>
      <el-form-item label="预设风格">
        <el-radio-group v-model="form.skinType" @change="changeDefaultSkin">
          <el-radio :label="0">幻科技</el-radio>
          <el-radio :label="1">卡通</el-radio>
          <el-radio :label="2">简约</el-radio>
        </el-radio-group>
        <el-button class="ml100" type="text" @click="downloadPtyxSkinPsd">模板源文件下载<i class="iconfont icon-xinxixianshi gray fz14 pl10"></i></el-button>
      </el-form-item>
      <ptyx-skin ref="ptyxSkin" :accessGame="accessGame" :startGame="startGame" :shareGame="shareGame" :skinType="form.skinType"></ptyx-skin>
    </section>

    <!-- 游戏背景音乐设置 -->
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">游戏背景音乐设置</h3>
      <el-form-item label="游戏背景音乐">
        <el-switch v-model="form.musicFlag" :active-value="1" :inactive-value="0"></el-switch>
      </el-form-item>
      <el-form-item label="默认播放" v-if="form.musicFlag">
        <el-switch v-model="form.musicAutoPlay" :active-value="1" :inactive-value="0"></el-switch>
      </el-form-item>
      <el-form-item label="音乐设置" v-if="form.musicFlag">
        <el-radio-group v-model="form.musicType">
          <el-radio :label="0">预设</el-radio>
          <el-radio :label="1">自定义</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="预设音乐选择" v-if="form.musicFlag && !form.musicType">
        <ul>
          <li v-for="(v, i) in gameMusicOptions" :key="i">
            <el-radio v-model="form.gameMusicId" class="w100" :label="v.gameMusicSystemId">{{ v.musicName }}</el-radio>
            <i class="iconfont vertical-middle cursor-pointer" :class="v.isPlay ? 'icon-xinxixianshi1' : 'icon-xinxixianshi2'" @click="playMusic(i)"></i>
          </li>
        </ul>
      </el-form-item>
      <el-form-item label="自定义音乐上传" v-if="form.musicFlag && form.musicType">
        <audio-upload tips="只能上传mp3文件，且大小不超过3MB，时长不超过90s" @sendAduioList="setAudioList"></audio-upload>
        <div v-if="customMusic.name">
          <span>{{ customMusic.name }}</span>
          <i class="iconfont vertical-middle cursor-pointer" :class="customMusic.isPlay ? 'icon-xinxixianshi1' : 'icon-xinxixianshi2'" @click="playCustomMusic"></i>
        </div>
      </el-form-item>
    </section>
    <!-- 分享设置 -->
    <dm-share :form="form"></dm-share>
    <!-- 参与门槛 -->
    <dm-threshold :form="form" :isAdd="isAdd" :thresholdData="thresholdData" ref="threshold"></dm-threshold>
    <div class="btn-wrap_fixed" :class="{ on: asideShow }">
      <el-button type="primary" @click="savePtyx('form')" v-if="!isInfo">保 存</el-button>
      <el-button @click="$router.go(-1)">返 回</el-button>
    </div>
  </el-form>
</template>

<script>
import { ptyxDetail, savePtyx, getGameSystemMusic, downloadPtyxSkinPsd } from '@/service/api/gameApi.js';
import { numberToChinese, formatDateTimeByType } from '@/utils/index.js';
import dmUploadAvatar from '@/components/upload/avatar';
import editAlertMixin from '../common/editAlertMixin.js';
import ptyxSkin from './partials/ptyx-skin.vue';
import audioUpload from './partials/audio-upload.vue';
import dmShare from '../common/share.vue';
import dmThreshold from '../common/threshold.vue';
let gameInfo = {};
// 实例化一个全局的music
const music = new Audio();
export default {
  name: 'ptyx-form',
  mixins: [editAlertMixin],
  data() {
    const that = this;
    return {
      // eslint-disable-next-line
      defaultImg: require('../../../assets/img/loaderror.png'),
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
        gameName: '',
        puzzleImg: { imgUrl: '', code: '' }, // puzzleImg，logoImg
        gameIntroduction: '',
        dateTime: [],
        logoImg: { imgUrl: '', code: '' },
        usedValue: '',
        usedIntegral: '',
        //背景音乐设置
        musicFlag: 1,
        musicAutoPlay: 1,
        musicType: 0,
        gameActivityPuzzleAccessId: '',
        gameActivityPuzzleShareId: '',
        gameActivityPuzzleStartId: '',
        // 皮肤模板
        skinType: 0,
        // 分享
        shareFlag: 1,
        gameShareSettingId: '',
        shareTitle: '您的好友邀请你一起来玩拼图游戏~',
        shareTextInfo: '玩游戏，赠送体力，pk好友，赢大奖！',
        shareImg: {
          code: '',
          imgUrl: require("../common/img/share/ptyx.png"), // eslint-disable-line
          wxImg: ''
        },
        // 参与门槛
        memberType: 0,
        gameActivityAttendConditionId: '',
        tipTitle: '尚未满足游戏参与条件，请多多努力。',
        tipsImg: {
          imgUrl: require('../common/img/attend/ptyx.png'), // eslint-disable-line
          code: ''
        }
      },
      rules: {
        gameName: { required: true, message: '请输入游戏名', trigger: 'blur' },
        dateTime: { required: true, type: 'array', message: '请选择游戏时间', trigger: 'blur' },
        gameIntroduction: { required: true, message: '请输入游戏说明', trigger: 'blur' },
        usedValue: { required: true, type: 'number', message: '请输入数值', trigger: 'blur' },
        usedIntegral: { required: true, type: 'number', message: '请输入数值', trigger: 'blur' }
      },
      tableList: [{ awardName: '', winnerCount: 0, prizeName: '', prizeImg: { code: '', imgUrl: '' }, prizeQuantity: '' }, { awardName: '', winnerCount: 0, prizeName: '', prizeImg: { code: '', imgUrl: '' }, prizeQuantity: '' }, { awardName: '', winnerCount: 0, prizeName: '', prizeImg: { code: '', imgUrl: '' }, prizeQuantity: '' }],
      isInfo: this.$route.meta.type === 'query',
      isEdit: this.$route.meta.type === 'edit',
      isAdd: this.$route.meta.type === 'add',
      // 人群筛选器可传参数
      projectName: 'marketing', // 当前项目名，默认是memberTag
      sceneValue: 'member', // 场景值
      useId: '', // 模板id
      hasSearchData: '', // 当前页回显的数据(接口返回)
      toggleTag: false, // 控制按钮显示的参数,仅供参考,可自行修改
      getSaveData: '',
      saveTag: false,
      // 会员分组可传参数
      defaltSelected: [], //  默认穿梭窗已选入数据
      headerList: ['isRealTime', 'latestUpdateTime', 'updateType', 'effectiveStatus', 'effectiveDate'],
      effectiveStatus: 1, // 不传： 所有状态 1： 有效 0： 失效

      // 系统游戏音乐选项
      gameMusicOptions: [],
      customMusic: {},
      attendCondition: {},
      accessGame: {},
      startGame: {},
      shareGame: {},
      pickerOptions: {
        disabledDate(now) {
          return now.getTime() < Date.now() - 24 * 60 * 60 * 1000 && that.isAdd;
        }
      }
    };
  },
  computed: {
    asideShow() {
      return this.$store.state.marketing.asideShow;
    }
  },
  created() {
    if (this.$route.meta.type === 'edit') {
      this.ptyxDetail();
      this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '游戏营销', path: '/game' }, { name: '拼图游戏', path: '/game/ptyx' }, { name: '拼图游戏编辑', path: '' }]);
    } else if (this.$route.meta.type === 'add') {
      this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '游戏营销', path: '/game' }, { name: '拼图游戏', path: '/game/ptyx' }, { name: '拼图游戏新增', path: '' }]);
    }
    if (this.$route.meta.type === 'query') {
      this.ptyxDetail();
      this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '游戏营销', path: '/game' }, { name: '拼图游戏', path: '/game/ptyx' }, { name: '拼图游戏详情', path: '' }]);
    }
    this.getGameSystemMusicList();
  },
  components: {
    dmUploadAvatar,
    // shareCom,
    ptyxSkin,
    audioUpload,
    dmShare,
    dmThreshold
  },
  methods: {
    //添加奖品
    addPrice() {
      this.tableList.push({ awardName: '', winnerCount: 0, prizeName: '', prizeImg: { code: '', imgUrl: '' }, prizeQuantity: '' });
    },
    delItem(index) {
      this.tableList.splice(index, 1);
    },
    //这里用nextTick下个更新执行
    comparePre(index, val) {
      if (this.tableList[index].winnerCount < 0) {
        this.$tips({ type: 'warning', message: '不能为负值' });
        return;
      }
    },
    //获取系统音乐列表
    async getGameSystemMusicList() {
      try {
        let res = await getGameSystemMusic();
        if (res.errorCode === 0) {
          let list = res.result || [];
          this.gameMusicOptions = list.map(v => ({ isPlay: false, ...v }));
          console.log(this.gameMusicOptions);
        }
      } catch (err) {
        this.$tips({ typr: 'error', message: '获取系统预设音乐失败' });
      }
    },
    async ptyxDetail() {
      this.loading = true;
      let res = await ptyxDetail({ gameActivityId: this.$route.params.id });
      this.loading = false;
      gameInfo = res.result.gameInfo;
      this.form = Object.assign(this.form, {
        gameActivityId: gameInfo.gameActivityId,
        gameName: gameInfo.gameName,
        puzzleImg: {
          code: gameInfo.puzzleImgFieldCode,
          imgUrl: gameInfo.puzzleImgUrl
        },
        dateTime: [gameInfo.gameStartTime || '', gameInfo.gameEndTime || ''],
        gameIntroduction: gameInfo.gameIntroduction,

        //页面设置
        logoImg: {
          code: gameInfo.logoImgFieldCode,
          imgUrl: gameInfo.logoImgUrl
        },
        usedValue: gameInfo.usedValue,
        usedIntegral: gameInfo.usedIntegral,
        skinType: gameInfo.skinType || 0,
        musicFlag: gameInfo.musicFlag === null ? 1 : gameInfo.musicFlag,
        musicAutoPlay: gameInfo.musicAutoPlay === null ? 1 : gameInfo.musicAutoPlay,
        musicType: gameInfo.musicType || 0,
        gameMusicId: gameInfo.gameMusicId || '',
        shareFlag: gameInfo.shareFlag || 0
      });
      gameInfo.prizeList.map(v => {
        v.prizeImg = {
          code: v.prizeImgFieldCode,
          imgUrl: v.prizeImgUrl
        };
      });

      // 分享
      if (gameInfo.shareFlag === 1) {
        const { shareTitle, shareTextInfo, shareImgFieldCode, shareImgUrl, shareImgUrlWX, gameShareSettingId } = gameInfo.shareSetting;
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
      if (gameInfo.attendCondition) {
        const { memberType, tipTitle, tipImageFieldCode, tipImageUrl, searchParams, gameActivityAttendConditionId } = gameInfo.attendCondition;
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
      if (gameInfo.accessGame) {
        this.accessGame = gameInfo.accessGame;
        this.form.gameActivityPuzzleAccessId = gameInfo.accessGame.gameActivityPuzzleAccessId;
      }
      if (gameInfo.startGame) {
        this.startGame = gameInfo.startGame;
        this.form.gameActivityPuzzleStartId = gameInfo.startGame.gameActivityPuzzleStartId;
      }
      if (gameInfo.shareGame) {
        this.shareGame = gameInfo.shareGame;
        this.form.gameActivityPuzzleShareId = gameInfo.shareGame.gameActivityPuzzleShareId;
      }
      this.tableList = gameInfo.prizeList.map(v => ({ ...v, winnerCount: v.rankEnd - v.rankBegin + 1 }));

      // this.tableList = gameInfo.prizeList;

      // 自定义背景音乐
      if (this.form.musicType && gameInfo.gameMusic) {
        this.customMusic = {
          code: gameInfo.gameMusic.musicFieldCode || '',
          url: gameInfo.gameMusic.musicUrl || '',
          name: gameInfo.gameMusic.musicName || '',
          isPlay: false
        };
      }
      this.$nextTick(_ => {
        this.$refs.ptyxSkin.init();
      });
    },
    //提交保存
    async savePtyx(formName) {
      let flag = false;
      if (!this.form.puzzleImg.code) {
        this.$tips({ type: 'warning', message: '游戏拼图图片不能为空' });
        flag = true;
      }
      if (!this.form.logoImg.code) {
        this.$tips({ type: 'warning', message: '品牌logo不能为空' });
        flag = true;
      }

      if (this.form.memberType === 1 && !this.thresholdData.getSaveData) {
        this.$tips({ type: 'warning', message: '会员筛选不能为空' });
        return;
      }
      if (this.form.memberType === 2 && !this.thresholdData.memberGroupIds) {
        this.$tips({ type: 'warning', message: '会员分组不能为空' });
        return;
      }

      this.tableList.forEach((v, i) => {
        if (!v.winnerCount || !v.prizeName || !v.prizeImg.code) {
          this.$tips({ type: 'warning', message: '奖品设置区名次、名称、商品图不能为空' });
          flag = true;
        }
      });
      if (flag) return;
      // if (this.form.dateTime[0] < Date.now() && this.isAdd) {
      //   this.$tips({ type: 'warning', message: `开始时间不能小于当前时间` });
      //   return;
      // }

      // 编辑弹窗提示
      if (this.form.memberType === 1) {
        await this.$refs.threshold.triggerPeopleSet();
      }
      this.$refs[formName].validate(valid => {
        if (valid) {
          if (!this.isEdit) {
            gameInfo.activityPuzzleId = '';
          }
          gameInfo.gameActivityId = this.form.gameActivityId || '';
          gameInfo.gameName = this.form.gameName || '';
          gameInfo.puzzleImgFieldCode = this.form.puzzleImg.code || '';
          gameInfo.puzzleImgUrl = this.form.puzzleImg.imgUrl || '';
          gameInfo.startTimeStr = formatDateTimeByType(this.form.dateTime[0], 'yyyy-MM-dd-HH-mm-ss') || '';
          gameInfo.endTimeStr = formatDateTimeByType(this.form.dateTime[1], 'yyyy-MM-dd-HH-mm-ss') || '';
          gameInfo.gameIntroduction = this.form.gameIntroduction || '';
          gameInfo.logoImgFieldCode = this.form.logoImg.code || '';
          gameInfo.logoImgUrl = this.form.logoImg.imgUrl || '';
          gameInfo.usedValue = this.form.usedValue || '';
          gameInfo.usedIntegral = this.form.usedIntegral || '';
          gameInfo.shareFlag = this.form.shareFlag || 0;
          gameInfo.activityStatus = 1;
          gameInfo.skinType = this.form.skinType || 0;
          gameInfo.musicFlag = this.form.musicFlag;
          gameInfo.musicAutoPlay = this.form.musicAutoPlay;
          gameInfo.musicType = this.form.musicType;
          gameInfo.gameMusicId = this.form.gameMusicId || '';

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

          let list = [];
          this.tableList.forEach((v, i) => {
            list.push({
              prizeImgFieldCode: v.prizeImg.code || '',
              prizeImgUrl: v.prizeImg.imgUrl || '',
              winnerCount: v.winnerCount || '',
              awardName: numberToChinese(i + 1) + '等奖',
              prizeType: 1,
              prizeName: v.prizeName || '',
              prizeId: v.prizeId || '',
              prizeQuantity: 0
            });
          });
          gameInfo.prizeList = list;
          // 皮肤的处理
          const skinObj = this.$refs.ptyxSkin.getSkin();
          const accessGame = skinObj.accessGame;
          const shareGame = skinObj.shareGame;
          const startGame = skinObj.startGame;

          if (this.isEdit) {
            accessGame.gameActivityPuzzleAccessId = this.form.gameActivityPuzzleAccessId;
            shareGame.gameActivityPuzzleShareId = this.form.gameActivityPuzzleShareId;
            startGame.gameActivityPuzzleStartId = this.form.gameActivityPuzzleStartId;
          }

          // debugger;
          if (this.isEdit) {
            attendCondition.gameActivityAttendConditionId = this.form.gameActivityAttendConditionId || '';
          }

          const params = {
            gameData: JSON.stringify(gameInfo),
            attendCondition: JSON.stringify(attendCondition),
            accessGame: JSON.stringify(accessGame),
            startGame: JSON.stringify(startGame),
            shareGame: JSON.stringify(shareGame)
          };
          // gameMusic 背景音乐  需要背景音乐且是自定义才传这个json  TODO
          if (this.form.musicFlag === 1 && this.form.musicType === 1) {
            params.gameMusic = JSON.stringify({
              /** 自定义音乐主键ID **/
              gameMusicId: '',
              /** 音乐名称 **/
              musicName: this.customMusic.name,
              /** 音乐链接 **/
              musicUrl: this.customMusic.url,
              musicFieldCode: this.customMusic.code
            });
          }

          const postParams = Object.assign(params, {
            attendCondition: JSON.stringify(attendCondition),
            shareSetting: JSON.stringify(shareSetting)
          });
          savePtyx(postParams).then(res => {
            if (res.errorCode === 0) {
              this.$tips({ type: 'success', message: this.$route.meta.type === 'add' ? '新增成功' : '编辑成功' });
              if (this.$route.meta.type === 'add') {
                this.$router.push('/game/ptyx');
              } else {
                this.$confirm('操作成功，是否返回列表?', '提示', {
                  confirmButtonText: '返回列表',
                  cancelButtonText: '留在本页',
                  type: 'warning'
                })
                  .then(() => {
                    this.$router.push('/game/ptyx');
                  })
                  .catch(() => {
                    this.ptyxDetail(); //先刷新页面
                  });
              }
            } else {
              this.$tips({ type: 'error', message: res.message || '保存失败' });
            }
          });
        } else {
          this.$tips({ type: 'success', message: '表单填写不完整或者不规范' });
          return false;
        }
      });
    },
    //播放音乐
    playMusic(index) {
      let currentMusic = this.gameMusicOptions[index];
      music.src = currentMusic.musicUrl || '';
      this.gameMusicOptions.map((v, i) => {
        if (index === i && currentMusic.isPlay) {
          music.pause();
          v.isPlay = false;
        } else if (index === i && !currentMusic.isPlay) {
          music.play();
          v.isPlay = true;
        } else {
          v.isPlay = false;
        }
      });
    },
    //播放自定义音乐
    playCustomMusic() {
      music.src = this.customMusic.url || '';
      if (this.customMusic.isPlay) {
        music.pause();
        this.customMusic.isPlay = false;
      } else {
        music.play();
        this.customMusic.isPlay = true;
      }
    },
    downloadPtyxSkinPsd() {
      window.location = downloadPtyxSkinPsd;
    },
    //切换默认皮肤
    changeDefaultSkin() {
      this.$refs.ptyxSkin.changeDefaultSkin(this.form.skinType);
    },
    setAudioList(obj) {
      this.customMusic = { ...obj, isPlay: false };
    },
    // 输入正整数
    nonnegative(val) {
      if (val < 0) {
        val = 0;
        this.$tips({ type: 'warning', message: '不能为负值' });
      }
    },
    /**---------人群筛选器的方法------------- */
    getData() {
      this.$refs.peopleFilter.confirmSet();
    },
    // 子组件触发父组件事件,返回过滤条件数据
    findFilter(value) {
      console.log(value);
      this.form.searchParams = value;
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
    numberToChinese(val) {
      return numberToChinese(val);
    }
  },
  destroyed() {
    music.pause();
  }
};
</script>
