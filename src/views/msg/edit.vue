<template>
  <el-form v-loading="loading" label-width="100px">
    <section class="dm-form__wrap msg-edit__info">
      <h3 class="dm-title__label">基础信息</h3>
      <el-row :gutter="20">
        <el-col :span="8">
          <span class="primary-font-color">标题：</span><span class="regular-font-color">{{ info.templateName || '--' }}</span>
        </el-col>
        <el-col :span="8">
          <span class="primary-font-color">行业：</span><span class="regular-font-color">{{ info.templateBusiness || '--' }}</span>
        </el-col>
        <el-col :span="8">
          <span class="primary-font-color">触发条件：</span><span class="regular-font-color">{{ info.triggerName || '--' }}</span>
        </el-col>
        <el-col :span="8">
          <span class="primary-font-color">url类型：</span><span class="regular-font-color">{{ info.urlType | filterUrlType }}</span>
        </el-col>
        <el-col :span="8">
          <span class="primary-font-color">类型：</span><span class="regular-font-color">{{ info.typeName || '--' }}</span>
        </el-col>
      </el-row>
    </section>
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">详细内容</h3>
      <div class="msg-edit__content">
        <div class="msg-edit__left">
          <div class="msg-edit__left--inner">
            <el-form-item label="头部文案">
              <el-input type="textarea" :style="'color:' + info.headerColor" v-model="info.headerText" :rows="4" class="w450" :maxlength="200"></el-input>
              <div class="input-suffix clearfix">
                <el-color-picker class="ml10 vertical-middle" v-model="info.headerColor"></el-color-picker>
                <el-button type="text" class="vertical-middle" @click="insetVar('headerText')">插入变量</el-button>
                <span class="gray fz13 fr mr10">{{ info.headerText.length }}/200</span>
              </div>
            </el-form-item>
            <el-form-item :label="v.keyName" v-for="(v, i) in templateKeyDataList" :key="i">
              <div v-if="v.keyName !== '使用渠道：'">
                <span class="vertical-middle">显示接收人{{ v.keyName }}</span>
                <el-color-picker class="ml10 vertical-middle" v-model="v.color"></el-color-picker>
              </div>
              <div v-else>
                <el-input type="textarea" :style="'color:' + v.color" :rows="4" v-model="v.type" class="w450" :maxlength="200"></el-input>
                <div class="input-suffix clearfix">
                  <el-color-picker class="ml10 vertical-middle" v-model="v.color"></el-color-picker>
                  <el-button type="text" class="vertical-middle" @click="insetVar(i)">插入变量</el-button>
                  <span class="gray fz13 fr mr10">{{ v.type.length }}/200</span>
                </div>
              </div>
            </el-form-item>
            <el-form-item label="尾部文案">
              <el-input type="textarea" :style="'color:' + info.remarkColor" v-model="info.remarkText" :rows="4" class="w450" :maxlength="200"></el-input>
              <div class="input-suffix clearfix">
                <el-color-picker class="ml10 vertical-middle" v-model="info.remarkColor"></el-color-picker>
                <el-button type="text" class="vertical-middle" @click="insetVar('remarkText')">插入变量</el-button>
                <span class="gray fz13 fr mr10">{{ info.remarkText.length }}/200</span>
              </div>
            </el-form-item>
          </div>
        </div>
        <div class="msg-edit__right">
          <div class="msg-edit__right--inner">
            <h4 class="pre-templateName">{{ info.templateName }}</h4>
            <p class="fz13 gray pre-updateTime">{{ info.updateTime | filterDate }}</p>
            <p class="pre-header" :style="'color:' + info.headerColor + ';'">{{ info.headerText }}</p>
            <p class="pre-keyName" v-for="(v, i) in templateKeyDataList" :key="i">
              {{ v.keyName }}
              <span :style="`color:${v.color}`">示例文字</span>
            </p>
            <p class="pre-remark" :style="'color:' + info.remarkColor + ';'">{{ info.remarkText }}</p>

            <div class="pre-foot clearfix">
              <span class="fz13 fl ">详情</span>
              <i class="el-icon-arrow-right fr"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="dm-form__wrap">
      <h3 class="dm-title__label">跳转设置 <span class="gray fz13 pl10">同时选择跳转小程序和H5页面，优先跳转小程序页面</span></h3>
      <div class="msg-edit__url">
        <p class="pb20"><el-checkbox v-model="checked2">跳转小程序</el-checkbox></p>
        <div v-if="checked2">
          <div class="pl20 pb20">
            <el-radio v-model="radio2" :label="1">小程序链接</el-radio>
            <span class="pl20">已选择链接：{{ '名称【' + (info.app.name || jumpUrlInfoJson.type2 || '--') + '】' }}{{ '链接【' + (info.app.url || '--') + '】' }}</span>
          </div>
          <!-- 引入链接小工具 -->
          <div v-if="radio2">
            <linktoolspage ref="childlinktoolspage" :isWx="true" :showType="2" @linkSelect="linkSelect" />
          </div>
        </div>
        <p class="pt20 pb20"><el-checkbox v-model="checked1">跳转H5页面</el-checkbox></p>
        <div v-if="checked1">
          <div class="pl20 pb20">
            <el-radio v-model="radio1" :label="1" @change="info.h5 = ''">内部链接</el-radio>
            <el-radio v-model="radio1" :label="2" @change="info.h5 = ''">网址</el-radio>
            <span class="pl20">已选择链接：{{ '名称【' + (jumpUrlInfoJson.type1 || '--') + '】' }}{{ info.h5 || '--' }}</span>
          </div>
          <innerUrl class="ml30 msg-edit__url--inner" v-if="radio1 === 1" @sendRightUrl="getRightUrl" @sendLeftUrl="getLeftUrl" @sendShopData="getShopData" :menuCode="menuCode"></innerUrl>
          <div class="ml30 clearfix" v-if="radio1 === 2">
            <el-input v-model="info.h5" class="w300" @blur="checkUrl"></el-input>
          </div>
        </div>
      </div>
    </section>
    <section class="dm-form__wrap" v-if="info.triggerCode === 'integralexpires'">
      <h3 class="dm-title__label">发送时间配置</h3>
      <el-form-item label="积分即将过期前" label-width="120px"> <el-input-number controls-position="right" v-model="info.remindDay"></el-input-number> 天发送该模板消息提醒。 </el-form-item>
      <el-form-item label="发送时间设置" label-width="120px">
        <el-select v-model="info.sendTime" class="w300">
          <el-option v-for="(v, i) in dayOptions" :key="i" :value="v.value" :label="v.label"></el-option>
        </el-select>
      </el-form-item>
    </section>
    <div class="btn-wrap_fixed" :class="{ on: asideShow }">
      <el-button type="primary" @click="updateTempAdvice">保 存</el-button>
      <el-button @click="$router.go(-1)">返 回</el-button>
    </div>
    <var-dialog :options="options" :show.sync="varShow" @get-data="getVarData"></var-dialog>
  </el-form>
</template>
<script>
import { getTempDetail, listTemplateVariables, updateTempAdvice } from '@/service/api/msgApi.js';
import { formatDateTimeByType, checkUrl } from '@/utils/index.js';
import varDialog from './variables.vue';
import innerUrl from '@/components/innerUrl/innerUrl';
import linktoolspage from '@/components/linktools/linktoolspage.vue';

export default {
  name: 'add-record',
  data() {
    return {
      loading: false,
      color1: '#173177',
      templateKeyDataList: [],
      info: {
        triggerCode: '',
        sendTime: 10,
        sendType: 0,
        remindDay: 3,
        headerColor: '#173177',
        remarkColor: '#173177',
        headerText: '',
        remarkText: '',
        urlType: 0,
        app: {},
        h5: 'http://'
      },
      dayOptions: Array(15)
        .fill()
        .map((v, i) => ({ value: i + 8, label: i + 8 + ':00' })),
      formatDateTimeByType,
      options: [],
      checked1: false,
      checked2: false,
      radio1: 0,
      radio2: 0,
      varShow: false,
      currentTxet: '',

      menuCode: '', // 小程序
      nextcode: '', // 编辑  初始选择的内部链接
      precode: '',
      menuUrlPara: '', // 选择的门店id
      jumpUrlInfoJson: { type1: '', type2: '' }
    };
  },
  components: {
    varDialog,
    linktoolspage,
    innerUrl
  },
  computed: {
    asideShow() {
      return this.$store.state.marketing.asideShow;
    }
  },
  created() {
    this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '模板消息', path: '/msg' }, { name: '模板消息编辑', path: '/msg/edit' }]);
    this.listTemplateVariables();
  },
  watch: {
    'info.urlType'(val) {
      if (this.info.urlType === 1) {
        this.checked1 = true;
        this.checked2 = false;
      } else if (this.info.urlType === 2) {
        this.checked1 = false;
        this.checked2 = true;
      } else if (this.info.urlType === 3) {
        this.checked1 = true;
        this.checked2 = true;
      } else {
        this.checked1 = false;
        this.checked2 = false;
      }
    },
    radio1(val) {
      if (val === 2) {
        this.jumpUrlInfoJson.type1 = '自定义网址';
      }
    }
  },
  methods: {
    async listTemplateVariables() {
      this.loading = true;
      try {
        let res = await listTemplateVariables();
        if (res.errorCode === 0) {
          const result = res.result;
          this.options = Object.keys(result).map(v => ({ label: result[v], value: v }));
        }
        this.getTempDetail();
      } catch (err) {
        console.log(err);
      }
    },
    async getTempDetail() {
      let res = await getTempDetail({ templateId: this.$route.params.id });
      if (res.errorCode === 0) {
        const result = res.result;
        this.templateKeyDataList = result.templateKeyDataList;
        this.templateKeyDataList.map((v, i) => {
          v.type = v.datas ? v.datas.split('#')[0] : '';
          v.color = v.datas ? '#' + (v.datas.split('#')[1] || '173177') : '#173177';
          if (v.keyName === '使用渠道：') {
            this.options.map(w => {
              if (v.type.indexOf(w.value) > -1) {
                v.type = v.type.replace(w.value, w.label);
              }
            });
            v.type = v.type.replace('memberInfo_{12}', '');
            console.log(v.type);
          }

          this.$set(this.templateKeyDataList, i, {
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
        this.info.weixinTemplateId = result.weixinTemplateId;
        this.info.templateName = result.templateName;
        this.info.templateBusiness = result.templateBusiness;
        this.info.triggerName = result.triggerName;
        this.info.urlType = result.urlType;
        this.info.typeName = result.typeName;
        this.info.header = result.header;
        this.info.remark = result.remark;
        this.info.triggerCode = result.triggerCode;
        this.info.headerText = this.info.header ? this.info.header.split('#')[0] : '';
        this.info.headerColor = this.info.header ? '#' + (this.info.header.split('#')[1] || '173177') : '#173177';
        this.info.remarkText = this.info.remark ? this.info.remark.split('#')[0] : '';
        this.info.remarkColor = this.info.remark ? '#' + (this.info.remark.split('#')[1] || '173177') : '#173177';
        this.options.map(v => {
          console.log(this.info.headerText.indexOf(v.value) > -1);
          if (this.info.headerText.indexOf(v.value) > -1) {
            // console.log(new RegExp((v.label+'/g')))
            this.info.headerText = this.info.headerText.replace(v.value, v.label);
          }
          if (this.info.remarkText.indexOf(v.value) > -1) {
            this.info.remarkText = this.info.remarkText.replace(v.value, v.label);
          }
        });
        let jumpUrlArr = result.jumpUrl ? result.jumpUrl.split(',') : [];

        let jumpUrlInfo = {};
        if (result.jumpUrlInfo) {
          jumpUrlInfo = JSON.parse(result.jumpUrlInfo);
          if (this.info.urlType === 1) {
            this.info.h5 = jumpUrlArr[0] || '';
            this.info.app.url = '';
            this.jumpUrlInfoJson.type1 = jumpUrlInfo.type1.name || '';
            if (this.jumpUrlInfoJson.type1 === '自定义网址') {
              this.radio1 = 2;
            } else {
              this.radio1 = 1;
            }
          } else if (this.info.urlType === 2) {
            this.info.h5 = '';
            this.info.app.url = jumpUrlArr[0] || '';
            this.jumpUrlInfoJson.type2 = jumpUrlInfo.type2.name || '';
            if (this.jumpUrlInfoJson.type2) {
              this.radio2 = 1;
            }
          } else if (this.info.urlType === 3) {
            this.info.app.url = jumpUrlArr[1] || '';
            this.info.h5 = jumpUrlArr[0] || '';
            this.jumpUrlInfoJson.type1 = jumpUrlInfo.type1.name || '';
            this.jumpUrlInfoJson.type2 = jumpUrlInfo.type2.name || '';
            if (this.jumpUrlInfoJson.type1 === '自定义网址') {
              this.radio1 = 2;
            } else {
              this.radio1 = 1;
            }
            if (this.jumpUrlInfoJson.type2) {
              this.radio2 = 1;
            }
          }
        }

        // 如果是积分即将过期
        if (this.info.triggerCode === 'integralexpires') {
          this.info.sendTime = parseInt(result.sendTime || 10);
          this.info.sendType = 1;
          this.info.remindDay = result.remindDay;
        }
      }
      this.loading = false;
    },
    insetVar(val) {
      this.varShow = true;
      this.currentTxet = val;
    },
    getVarData(val) {
      console.log(val, this.info[this.currentTxet]);
      if (typeof this.currentTxet === 'number') {
        this.templateKeyDataList[this.currentTxet].type += val;
      }
      this.info[this.currentTxet] += val;
    },
    updateTempAdvice() {
      if (this.checked1 && this.radio1 === 2) {
        this.checkUrl();
      }
      if (this.checked2 && !this.info.app.id && !this.jumpUrlInfoJson.type2) {
        this.$tips({ type: 'warning', message: '小程序链接未选或未保存' });
        return;
      }
      this.$confirm('保存模板消息?', '提示', {
        confirmButtonText: '确定',
        cancelBUttonText: '取消',
        type: 'warning'
      })
        .then(() => {
          const params = {
            templateId: this.$route.params.id,
            weixinTemplateId: this.info.weixinTemplateId
          };
          let header = this.info.headerText;
          let remark = this.info.remarkText;
          this.options.map(v => {
            if (header.indexOf(v.label) > -1) {
              // console.log(new RegExp((v.label+'/g')))
              header = header.replace(v.label, v.value);
            }
            if (remark.indexOf(v.label) > -1) {
              remark = remark.replace(v.label, v.value);
            }
            this.templateKeyDataList.map(w => {
              if (w.keyName === '使用渠道：') {
                if (w.type.indexOf(v.label) > -1) {
                  w.type = w.type.replace(v.label, v.value);
                }
              }
            });
          });
          params.header = header + this.info.headerColor;
          params.remark = remark + this.info.remarkColor;

          this.templateKeyDataList.map(v => {
            v.datas = v.type + v.color;
          });
          params.list = this.templateKeyDataList;

          // 如果是积分即将过期
          if (this.info.triggerCode === 'integralexpires') {
            params.sendTime = this.info.sendTime;
            params.sendType = 1;
            params.remindDay = this.info.remindDay;
          } else {
            params.sendType = 0;
          }

          let jumpUrlInfoJson = {};
          let app = {};
          let h5 = '';
          if (this.checked1 && !this.checked2) {
            jumpUrlInfoJson = {
              type1: this.jumpUrlInfoJson.type1
            };
            h5 = this.info.h5;
            params.urlType = 1;
            if (this.radio1 === 2) {
              jumpUrlInfoJson.type1 = '自定义网址';
            }
          } else if (!this.checked1 && this.checked2) {
            jumpUrlInfoJson = {
              type2: this.jumpUrlInfoJson.type2
            };
            app = this.info.app;
            if (!app.id && this.jumpUrlInfoJson.type2) {
              app = {};
            }
            params.urlType = 2;
          } else if (this.checked1 && this.checked2) {
            jumpUrlInfoJson = {
              type1: this.jumpUrlInfoJson.type1,
              type2: this.jumpUrlInfoJson.type2
            };
            if (this.radio1 === 2) {
              jumpUrlInfoJson.type1 = '自定义网址';
            }
            h5 = this.info.h5;
            app = this.info.app;
            if (!app.id && this.jumpUrlInfoJson.type2) {
              app = {};
            }
            params.urlType = 3;
          } else {
            params.urlType = 0;
          }
          updateTempAdvice({
            templateAdvice: JSON.stringify(params),
            app: app.id ? JSON.stringify(app) : '',
            h5: h5,
            jumpUrlInfoJson: JSON.stringify(jumpUrlInfoJson)
          })
            .then(res => {
              if (res.errorCode === 0) {
                this.$router.go(-1);
                this.$tips({ type: 'warning', message: '提交成功' });
              } else {
                this.$tips({ type: 'error', message: '提交失败' });
              }
            })
            .catch(err => {
              this.$tips({ type: 'error', message: '提交失败' });
            });
        })
        .catch(err => {
          console.log(err);
          this.$tips({ type: 'info', message: '已取消提交' });
        });
    },
    getRightUrl(data) {
      console.log(data);
      this.jumpUrlInfoJson.type1 = data.name;
      this.info.h5 = data.url;
    },
    getLeftUrl(data) {
      console.log(data);
      this.precode = data;
    },
    getShopData(data) {
      // 获取选择的门店id
      console.log(data);
      this.jumpUrlInfoJson.type1 = data.name;
      this.info.h5 = data.url;
    },
    // linktoolspage
    linkSelect(val) {
      // 选择小程序链接的返回值
      console.log(val);
      this.jumpUrlInfoJson.type2 = val.name;
      this.info.app = val;
    },
    checkUrl() {
      if (this.radio1 === 2 && checkUrl(this.info.h5)) {
        this.info.h5 = 'http://www.domain.com';
        return;
      }
    }
  },
  filters: {
    filterUrlType(val) {
      let str = '未选择链接';
      switch (val) {
        case 1:
          str = 'H5链接';
          break;
        case 2:
          str = '小程序链接';
          break;
        case 3:
          str = 'H5链接、小程序链接';
          break;
      }
      return str;
    },
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
.msg-edit {
  &__info {
    /deep/ .el-col {
      padding: 10px 0;
    }
    padding: 20px 0;
    // border-bottom:1px solid #DCDFE6;
  }
  &__content {
    width: 1100px;
  }
  &__left {
    display: inline-block;
    vertical-align: top;
    width: 613px;
    background: #f0f2f5;
    overflow: hidden;
    &--inner {
      background: #fff;
      width: 565px;
      margin: 15px auto;
      padding: 10px;
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
    }
  }
  &__right {
    position: relative;
    display: inline-block;
    width: 409px;
    height: 708px;
    overflow: hidden;
    background: url(../../assets/img/msg-preview.png) no-repeat center;
    background-size: cover;
    vertical-align: top;
    &--inner {
      border: 1px solid #dcdfe6;
      border-radius: 4px;
      background: #fff;
      width: 320px;
      min-height: 100px;
      position: absolute;
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
      }
    }
  }
  &__url {
    padding: 20px 0;
    &--inner {
      padding-bottom: 40px;
    }
  }
}
</style>
