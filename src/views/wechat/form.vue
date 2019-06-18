<template>
  <div v-loading="loading">
    <section class="dm-form__wrap">
      <div class="mb20">
        <span class="dm-input_label">营销场景：</span>
        <span v-if="isEdit || isInfo">{{ info.sceneSettingName }}</span>
        <el-select v-else class="w250" size="small" v-model="info.sceneSettingId" :disabled="isEdit || isInfo" placeholder="选择营销场景">
          <el-option v-for="item in sceneSettingIdOptions" :key="item.sceneSettingId" :label="item.sceneName" :value="item.sceneSettingId"></el-option>
        </el-select>
      </div>
      <div>
        <span class="dm-input_label">发送时间：</span>
        <el-select class="w250" v-model="info.sendType" :disabled="isInfo">
          <el-option v-for="(v, i) in sendTypeOptions" :key="i" :value="v.value" :label="v.label"></el-option>
        </el-select>
        <el-date-picker class="w250" :disabled="isInfo" v-if="info.sendType" v-model="info.sendTime" type="datetime" placeholder="选择日期时间" align="right" :picker-options="pickerOptions"></el-date-picker>
      </div>
    </section>
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">
        会员设置
        <span class="fz13 gray">默认筛选当前关注公众号会员</span>
      </h3>

      <div class="pt10 pb20">
        <span class="dm-input_label">选择会员：</span>
        <el-radio v-model="info.memberType" :disabled="isInfo" :label="0">会员筛选</el-radio>
        <el-radio v-model="info.memberType" :disabled="isInfo" :label="1">指定会员</el-radio>
        <el-radio v-model="info.memberType" :disabled="isInfo" :label="2">会员分组</el-radio>
      </div>
      <div v-show="info.memberType === 0">
        <vue-gic-people :projectName="projectName" :isAdd="isAdd" :triggerReset="true" :useId="useId" :hasSearchData="hasSearchData" :sceneValue="sceneValue" ref="peopleFilter" @findFilter="findFilter" @getBackData="getBackData" @editHide="editHide" @editShow="editShow" @hideBtn="hideBtn" />
        <div class="gic-people--button" v-show="toggleTag">
          <el-button size="small" type="primary" @click="getData">确 定</el-button>
          <el-button size="small" @click="cancelFilter">取 消</el-button>
        </div>
      </div>
      <vue-gic-confirm-people v-show="info.memberType === 1" sendType="wechat" @get-data="getConfirmData" :list="memberList"></vue-gic-confirm-people>
      <vue-gic-member-group v-if="info.memberType === 2" :defaltSelected="defaltSelected" :height="500" :projectName="projectName" :headerList="headerList" @handleDataTransferred="handleDataTransferred" @handleDataLeft="handleDataLeft"></vue-gic-member-group>
    </section>
    <section class="dm-form__wrap" v-if="$route.meta.type !== 'imgText'">
      <h3 class="dm-title__label">群发内容设置</h3>
      <span class="dm-input_label">群发类型：</span>
      <el-radio-group v-model="info.contentType">
        <el-radio :label="0" :disabled="isInfo">图文</el-radio>
        <el-radio :label="1" :disabled="isInfo">文本</el-radio>
        <el-radio :label="2" :disabled="isInfo">图片</el-radio>
      </el-radio-group>
      <div class="pt20">
        <div v-show="info.contentType === 0" style="padding:15px; border:1px solid #DCDFE6;border-radius:2px;">
          <dm-img-text @get-data="getImgTextData" :radioShow="true" :auto="false" :imageTextId="info.imageTextId" :activeId="info.imageTextWechatId"></dm-img-text>
        </div>
        <dm-img-box v-show="info.contentType === 2" :mediaId="info.mediaId" @get-data="getImgData"></dm-img-box>
        <div v-show="info.contentType === 1">
          <!-- <wxText :msgText="info.content" @listenWxText="getWxText"></wxText> -->
          <wx-text :showWxApp="false" :appendToBody="true" :value.sync="info.content" :urlType.sync="info.urlType" :jumpUrlInfo.sync="info.jumpUrlInfo" :isSupportVar="false" ref="wxText"></wx-text>
        </div>
      </div>
    </section>
    <section class="dm-form__wrap" v-if="$route.meta.type === 'imgText'">
      <h3 class="fz16 pb20">群发内容设置</h3>
      <el-table tooltipEffect="light" :data="currentImgText.itemList" style="width: 100%">
        <el-table-column prop="qcloudImageUrl" label="封面图" width="180">
          <template slot-scope="scope">
            <img :src="scope.row.qcloudImageUrl" height="80" width="auto" alt="" />
          </template>
        </el-table-column>
        <el-table-column :show-overflow-tooltip="true" prop="titleName" label="图文标题" minWidth="180"></el-table-column>
        <el-table-column prop="authorName" width="100" label="作者"></el-table-column>
        <el-table-column :show-overflow-tooltip="true" prop="remark" minWidth="180" label="备注"></el-table-column>
        <el-table-column prop="updateTime" width="140" label="更新时间">
          <template slot-scope="scope">
            {{ formatDateTimeByType(scope.row.updateTime, 'yyyy-MM-dd-HH-mm', true).y }} <br />
            {{ formatDateTimeByType(scope.row.updateTime, 'yyyy-MM-dd-HH-mm', true).h }}
          </template>
        </el-table-column>
      </el-table>
    </section>
    <div class="btn-wrap_fixed" :class="{ on: asideShow }">
      <el-button type="primary" @click="submit" v-if="!isInfo">提 交</el-button>
      <el-button @click="$router.go(-1)">返 回</el-button>
    </div>
  </div>
</template>
<script>
import dmImgText from '@/components/libs/imgTextTemp';
import dmImgBox from '@/components/libs/imgTemp/index-box.vue';
import { formatDateTimeByType } from '@/utils/index.js';
import { checkMessageSendCount } from '@/service/api/messageApi.js';
import { sceneSettingList, sendRecordSaveService, wechatImageTextEdit, getWechatMarketingDetail } from '@/service/api/wechatApi.js';
// import wxText from '@/components/wxText/wxText'
import wxText from '@/components/wx-text/index.vue';

export default {
  name: 'add-record',
  components: {
    dmImgText,
    dmImgBox,
    'wx-text': wxText
  },
  computed: {
    asideShow() {
      return this.$store.state.marketing.asideShow;
    }
  },

  data() {
    return {
      loading: false,
      pickerOptions: {
        disabledDate(val) {
          return Date.now() >= val.getTime() + 24 * 60 * 60 * 1000;
        }
      },
      sendTypeOptions: [{ value: 0, label: '立即发送' }, { value: 1, label: '选择时间发送' }],
      customToolbar: [['link']],
      currentImgText: { itemList: [] },
      formatDateTimeByType,
      sceneSettingIdOptions: [],
      // 人群筛选器可传参数
      sceneValue: 'member', // 场景值
      useId: '', // 模板id
      hasSearchData: '', // 当前页回显的数据(接口返回)
      toggleTag: false, // 控制按钮显示的参数,仅供参考,可自行修改
      getSaveData: '',
      saveTag: false,
      info: {
        sceneSettingId: '',
        sceneSettingName: '',
        searchJson: '',
        sendTime: '',
        sendType: 0,
        memberType: 0,
        contentType: 0,
        openIds: '',
        memberSearchDTO: '',
        memberGroupIds: '',
        imageTextId: '',
        imageTextWechatId: '',
        wechatTextId: '',
        wechatTeletextId: '',
        content: '',
        textNum: 0,
        mediaId: '',
        urlType: 0,
        jumpUrlInfo: { name: '', url: '' }
      },
      memberList: [],
      isEdit: this.$route.meta.type === 'edit',
      isAdd: this.$route.meta.type === 'add',
      isInfo: this.$route.meta.type === 'info',
      imgTextFlag: this.$route.meta.type === 'imgText',
      // 会员分组可传参数
      defaltSelected: [], //  默认穿梭窗已选入数据
      projectName: 'marketing', // 默认是memberTag
      headerList: ['isRealTime', 'latestUpdateTime', 'updateType', 'effectiveStatus', 'effectiveDate'],
      effectiveStatus: 1 // 不传： 所有状态 1： 有效 0： 失效
    };
  },
  created() {
    this.$store.commit(
      'mutations_layoutTips',
      `<div class="layout--tips">
          <i class="el-icon-info"></i>
          微信群发接口限制：高级群发接口的每日调用限制为100次
      </div>
    `
    );
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理' }, { name: '微信营销', path: '' }, { name: '发送记录', path: '/wechat' }, { name: '微信群发', path: '' }]);
    if (this.imgTextFlag) {
      this.wechatImageTextEdit();
      this.sceneSettingList();
    }
    if (this.isEdit || this.isInfo) {
      this.getWechatMarketingDetail();
    }
    if (this.isAdd) {
      this.sceneSettingList();
    }
  },
  beforeDestroy() {
    this.$store.commit('mutations_layoutTips', '');
  },
  methods: {
    async getWechatMarketingDetail() {
      let res = await getWechatMarketingDetail({ wechatTeletextId: this.$route.params.id });
      if (res.errorCode === 0 && res.result.wechatDTO) {
        const result = res.result.wechatDTO;
        this.info.sceneSettingId = result.sceneSettingId;
        this.info.sceneSettingName = result.sceneSettingName;
        this.info.sendTime = result.sendTime;
        this.info.sendType = result.sendType;
        this.info.contentType = result.contentType;
        this.info.memberType = result.memberType;
        this.info.openIds = this.info.memberType === 1 ? res.result.openIds : '';
        this.info.imageTextId = result.imageTextId || '';
        this.info.imageTextWechatId = result.imageTextWechatId || '';
        this.info.wechatTextId = result.wechatTextId || '';
        this.info.content = result.content || '';
        this.info.mediaId = result.mediaId || '';
        this.info.urlType = result.urlType || 0;
        this.info.jumpUrlInfo = (result.jumpUrlInfo && JSON.parse(result.jumpUrlInfo)) || { name: '', url: '' };
        if (res.result.searchId) {
          this.useId = res.result.searchId;
          this.hasSearchData = result.searchParams;
          this.info.memberSearchDTO = result.searchParams;
        } else if (this.info.memberType === 1) {
          this.memberList = res.result.memberList;
        } else if (this.info.memberType === 2) {
          this.defaltSelected = res.result.tagGroupList || [];
        }
      }
    },
    async wechatImageTextEdit() {
      try {
        let res = await wechatImageTextEdit({ imageTextId: this.$route.params.id });
        if (res.errorCode === 0 && res.result.imageText) {
          this.currentImgText = res.result.imageText;
          this.info.imageTextId = res.result.imageText.imageTextId;
          this.info.imageTextWechatId = res.result.imageText.imageTextWechatId;
          this.info.contentType = 0;
        }
      } catch (err) {
        console.log(err);
      }
    },
    async sceneSettingList() {
      let res = await sceneSettingList();
      this.sceneSettingIdOptions = res.result || [];
    },
    //获取图文
    getImgTextData(val) {
      this.info.imageTextId = val.imageTextId;
      this.info.imageTextWechatId = val.imageTextWechatId;
      console.log(val);
    },
    //获取图片id
    getImgData(val) {
      this.info.mediaId = val;
    },
    // 微信文本
    // getWxText(data){
    //   console.log(data)
    //   this.info.textNum = data.textNum;
    //   this.info.content = data.textarea;
    //   this.info.imageMediaId = data.imageMediaId;
    // },
    async submit() {
      // console.log(this.info);
      // // 这里强制获取人群筛选器的配置项
      // await this.$refs.peopleFilter.confirmSet();
      if (!this.info.memberType && this.toggleTag && !this.getSaveData) {
        this.$tips({ type: 'warning', message: '人群筛选未保存条件' });
        return;
      }
      if (this.info.contentType === 0 && !this.info.imageTextId) {
        this.$tips({ type: 'warning', message: '新先选择一个图文' });
        return;
      } else if (this.info.contentType === 1 && !this.info.content) {
        console.log(this.info.content);
        this.$tips({ type: 'warning', message: '请填写文本' });
        return;
      } else if (this.info.contentType === 2 && !this.info.mediaId) {
        this.$tips({ type: 'warning', message: '请选择图片' });
        return;
      }
      if (this.info.memberType === 1 && !this.info.openIds) {
        this.$tips({ type: 'warning', message: '指定会员不能为空' });
        return;
      }
      if (this.info.memberType === 2 && !this.info.memberGroupIds) {
        this.$tips({ type: 'warning', message: '会员分组不能为空' });
        return;
      }
      if (this.info.contentType === 1) {
        this.info.content = this.info.content.replace(/&amp;/g, '&');
        let flag = await this.$refs.wxText.computedTextLength();
        if (!flag) return;
      }
      this.checkMessageSendCount();
    },

    //提交表单验证人数  只有人员筛选需要
    async checkMessageSendCount() {
      if (this.info.memberType === 0 || this.info.memberType === 2) {
        const params = {
          memberSearchDTO: this.info.memberType ? this.info.memberGroupIds : this.info.memberSearchDTO,
          marketingType: 1,
          // 区分人员筛选和会员分组，需要传这个flag
          groupType: this.info.memberType === 0 ? 0 : 1
        };
        const res = await checkMessageSendCount(params);
        if (res.errorCode === 0) {
          this.$confirm(`即将发送${res.result}人，是否发送?`, '提示', {
            confirmButtonText: '确定',
            cancelBUttonText: '取消',
            type: 'warning'
          })
            .then(() => {
              this.sendRecordSaveService();
            })
            .catch(() => {
              // this.$tips({type: 'info',message: '已取消发送'});
            });
        }
      } else {
        this.sendRecordSaveService();
      }
    },
    // 新建或者保存
    sendRecordSaveService() {
      this.$confirm('是否群发微信?', '提示', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        type: 'warning'
      })
        .then(() => {
          this.loading = true;
          let params = {
            sceneSettingId: this.info.sceneSettingId,
            memberType: this.info.memberType,
            contentType: this.info.contentType,
            sendType: this.info.sendType,
            sendTime: this.info.sendTime,
            memberSearchDTO: this.info.memberType ? this.info.memberGroupIds : this.info.memberSearchDTO,
            searchJson: this.getSaveData
          };
          //微信营销主键ID (注意: 新建时null, 修改必传)
          if (this.$route.meta.type === 'edit') {
            params.wechatTeletextId = this.$route.params.id;
          }
          //memberType 0：会员筛选 不传; memberType 1：指定会员, 多个会员memberId由逗号隔开
          if (this.info.memberType) {
            params.openIds = this.info.openIds;
          }
          if (this.info.contentType === 0) {
            params.imageTextId = this.info.imageTextId;
            params.imageTextWechatId = this.info.imageTextWechatId;
          }
          if (this.info.contentType === 1) {
            params.wechatTextId = this.info.wechatTextId;
            params.content = this.info.content;
          }
          if (this.info.contentType === 2) {
            params.mediaId = this.info.mediaId;
          }
          if (this.info.sendType) {
            params.sendTime = formatDateTimeByType(this.info.sendTime, 'yyyy-MM-dd-HH-mm');
          }
          sendRecordSaveService(params)
            .then(res => {
              this.loading = false;
              if (res.errorCode === 0) {
                this.$tips({ type: 'success', message: '操作成功' });
                setTimeout(_ => {
                  this.$router.push('/wechat/record');
                });
              } else {
                this.$tips({ type: 'error', message: '操作失败' });
              }
              console.log(res);
            })
            .catch(err => {
              this.$tips({ type: 'error', message: '操作失败' });
              this.loading = false;
            });
        })
        .catch(() => {
          // this.$tips({type: 'info',message: '已取消提交'});
        });
    },

    /** ----------人群筛选器的方法----------- */
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
    //获取指定会员
    getConfirmData(val) {
      console.log(val);
      this.info.openIds = val;
    },
    handleDataTransferred(data) {
      // 会员分组 情况下 memberSearchDTO 传数组字符串
      if (this.info.memberType === 2) {
        this.info.memberGroupIds = data
          .map(v => v.memberTagGroupId)
          .filter(v => v)
          .join(',');
      }
    },
    handleDataLeft(selectedData, selectionToRemove) {
      console.log(selectedData, selectionToRemove);
    }
  }
};
</script>

<style lang="scss" scoped>
.dm-record_text {
  .gray-bg {
    height: 30px;
    line-height: 30px;
  }
}
.msg-tips {
  height: 84px;
  border: 1px solid #b3d8ff;
  padding: 0 20px;
  background: #ecf5ff;
  &__left {
    i {
      font-size: 36px;
      color: #1890ff;
      line-height: 86px;
    }
  }
  &__center {
    position: relative;
    top: 14px;
    left: 10px;
    line-height: 2;
    h4 {
      font-size: 16px;
      color: #1890ff;
    }
    p {
      color: #606266;
    }
  }
}
</style>
