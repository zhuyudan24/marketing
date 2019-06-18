<template>
  <section class="dm-wrap">
    <div class="step-wrap">
      <div class="step">
        <el-steps class="step-inner" :active="step" finish-status="success">
          <el-step title="充值"></el-step>
          <el-step title="支付"></el-step>
          <el-step title="状态"></el-step>
        </el-steps>
      </div>
    </div>
    <article v-if="step === 0">
      <div class="step0-box">
        <div>
          <span class="fz14 w80 inline-block text-right">余额</span>
          <span class="inline-block ml10">￥{{ balance.toFixed(2) }}</span>
        </div>
        <div class="pt20">
          <span class="fz14 w80 inline-block text-right">充值金额</span>
          <el-input-number controls-position="right" class="w200 ml10" v-model="count" :precision="0" :min="100" :max="10000000" placeholder="填写大于100的整数"></el-input-number>
        </div>
        <div class="pt20">
          <span class="fz14 w80 inline-block text-right">充值方式</span>
          <img width="120" height="26" class="wechat-icon inline-block ml10 vertical-middle border1 border-radius__default" src="../../assets/img/bank_weui.png" />
        </div>
        <div class="wechat-btn pt20">
          <el-button type="primary" @click="toStep1">下一步</el-button>
        </div>
      </div>
      <div class="step0-tips">
        <p class="fz12 gray line-height2">1、我们提供在线充值服务（目前仅支持微信）</p>
        <p class="fz12 gray line-height2">2、请尽量保障账户余额大于您日常使用的额度，避免因余额不足导致业务中断</p>
        <p class="fz12 gray line-height2">3、若未能及时充值或其他问题，请联系客户经理或客服人员</p>
        <p class="fz12 gray line-height2">4、各项服务单价：短信验证码{{ allUnitFee.smsfee }}元/条，语音验证码{{ allUnitFee.voiceIfee }}元/条，双向呼叫{{ allUnitFee.callfee }}元/分钟</p>
        <p class="fz12 gray line-height2">5、通话录音存储收费标准：「三个月{{ allUnitFee.storageThreeFee }}元/分钟」「六个月{{ allUnitFee.storageSixFee }}元/分钟」「十二个月{{ allUnitFee.storageTwelveFee }}元/分钟」，不满一分钟按一分钟收费</p>
      </div>
    </article>
    <article v-if="step === 1">
      <div class="mt20 mb20">
        <div class="clearfix qrcode-wrap">
          <div class="fz16 pt20 pb20">
            付款金额：<span class="fz20">￥{{ parseInt(count).toFixed(2) }}</span>
          </div>
          <div class="text-center left">
            <div class="inline-block" v-loading="loading">
              <vue-qr class="qrcode" :logoSrc="wexinLogo" :text="qcText" :size="216" :margin="0" :logoMargin="10"></vue-qr>
              <div class="qrcode-tips">
                <i class="iconfont icon-saomiao place-font-color"></i>
                <span class="fz14">打开手机微信扫一扫继续付款</span>
              </div>
            </div>
            <p class="blue pt10" @click="rechargeStep2">已支付但没反应？试试刷新页面</p>
          </div>
          <!-- <div class="fr width50 text-center">
          <img src="../../assets/img/recharge_phone.png" alt="" srcset="">
          <p>打开微信，选择发现，点击扫一扫，扫描左侧二维码完成支付</p>
        </div> -->
          <el-button @click="step = 0">上一步</el-button>
        </div>
      </div>
    </article>
    <article v-if="step === 2">
      <div class="success-wrap">
        <i class="success-color el-icon-success success-icon"></i>
        <p>支付成功！</p>
        <el-button @click="$router.go(-1)">手动返回</el-button>
        <span class="fz13 pl20">5S后自动返回</span>
      </div>
    </article>
  </section>
</template>
<script>
import { rechargeStep0, rechargeStep1, rechargeStep2, getAccountStateInfo } from '@/service/api/rechargeApi.js';
import VueQr from 'vue-qr';

let timer = null;
let countDown = null;
export default {
  name: 'recharge-do',
  data() {
    return {
      loading: false,
      step: 0,
      balance: 0,
      transactionCode: '',
      allUnitFee: {
        callfee: 0,
        smsfee: 0,
        voiceIfee: 0,
        storageThreeFee: 0,
        storageSixFee: 0,
        storageTwelveFee: 0
      },
      count: 100,
      countDown: 5,
      // eslint-disable-next-line
      wexinLogo: require('../../assets/img/qclogo.png'),
      qcText: ''
    };
  },
  created() {
    this.rechargeStep0();
    this.$store.commit('mutations_breadcrumb', [{ name: '企业管理', path: '' }, { name: '计费中心', path: '/recharge' }, { name: '充值', path: '' }]);
  },
  components: {
    VueQr
  },
  destroyed() {
    clearInterval(timer);
    clearInterval(countDown);
  },
  watch: {
    step(val) {
      if (val !== 1) {
        clearInterval(timer);
      }
    }
  },
  methods: {
    toStep1() {
      this.step = 1;
      this.rechargeStep1();
    },

    //第一步请求
    async rechargeStep0() {
      try {
        let res = await rechargeStep0();
        if (res.errorCode === 0) {
          this.balance = res.result.balance / 100;
          if (this.balance <= 0 && Math.abs(this.balance) > 100) {
            this.count = Math.ceil(Math.abs(this.balance));
          }
          this.transactionCode = res.result.transactionCode;
          Object.assign(this.allUnitFee, res.result.allUnitFee);
          this.allUnitFee.storageThreeFee = Number(this.allUnitFee.storageThreeFee).toFixed(2) || '0.00';
          this.allUnitFee.storageSixFee = Number(this.allUnitFee.storageSixFee).toFixed(2) || '0.00';
          this.allUnitFee.storageTwelveFee = Number(this.allUnitFee.storageTwelveFee).toFixed(2) || '0.00';
        } else {
          this.$tips({ type: 'error', message: '初始化失败' });
        }
      } catch (err) {
        console.log(err);
      }
    },
    async rechargeStep1() {
      this.loading = true;
      try {
        let res = await rechargeStep1({ money: this.count, transactionCode: this.transactionCode });
        if (res.errorCode === 0 && res.result.url) {
          this.qcText = res.result.url;
          this.config = {
            value: 'https://www.baidu.com',
            imagePath: '../../assets/img/logo.jpg',
            filter: 'color'
          };
          timer = setInterval(_ => {
            this.rechargeStep2();
          }, 5000);
        } else {
          this.$tips({ type: 'warning', message: '二维码异常，请稍后再试' });
        }
      } catch (err) {}
      this.loading = false;
    },
    async rechargeStep2() {
      try {
        let res = await rechargeStep2({ transactionCode: this.transactionCode });
        if (res.errorCode === 0 && res.result) {
          clearInterval(timer);
          this.step = 2;
          // 更新账户状态
          this.getAccountStateInfo();
          countDown = setInterval(_ => {
            this.countDown--;
            if (this.countDown === 0) {
              this.$router.go(-1);
            }
          }, 1000);
        }
      } catch (err) {
        console.log(err);
      }
    },
    //获取账户状态
    async getAccountStateInfo() {
      let res = await getAccountStateInfo();
      if (res.errorCode === 0) {
        // 状态存到localStorage中
        localStorage.setItem('accountStatus', res.data.result.status || 1);
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.step-wrap {
  width: calc(100% + 48px);
  height: 100px;
  margin-left: -24px;
  border-bottom: 1px solid #dcdfe6;
  .step {
    width: 100%;
    .step-inner {
      width: 750px;
      margin: 0 auto;
    }
  }
}
.step0-tips {
  // width: 60%;
  margin: 20px auto;
}
.step0-box {
  margin: 50px auto 50px;
  width: 300px;
}
.qrcode-wrap {
  text-align: center;
  .left {
    padding-bottom: 20px;
    .qrcode {
      width: 216px;
      height: 216px;
      padding: 20px;
      border: 1px solid #ddd;
      /deep/ img {
        width: 100%;
        height: 100%;
      }
    }
    .qrcode-tips {
      width: 216px;
      // background: #333;
      padding: 20px;
      border: 1px solid #ddd;
      border-top: none;
      .iconfont {
        font-size: 30px;
        vertical-align: middle;
      }
      span {
        text-align: left;
        color: #333;
        line-height: 1;
        position: relative;
        font-size: 14px;
        width: 134px;
        display: inline-block;
        height: auto;
        vertical-align: middle;
        position: relative;
        top: 0px;
        left: 10px;
      }
    }
  }
}
.success-wrap {
  margin-top: 100px;
  text-align: center;
  p {
    margin: 20px auto 40px;
  }
}
.success-icon {
  font-size: 57px;
}
.wechat-icon {
  padding: 6px 39px;
}
.wechat-btn {
  position: relative;
  left: 92px;
}
</style>
