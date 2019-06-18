<template>
  <div>
    <span :sendSync="sendSync" :autoStart="autoStart" :defaultVal="defaultVal">{{ countString }}</span>
  </div>
</template>

<script>
export default {
  name: 'time-count',
  data() {
    return {
      isStart: false,
      globalTimer: null, //获取setInterval对象值
      countString: '0秒', //用来显示时间
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
      millisecond: 0,
      countVal: this.defaultVal, //获取初始值
      pauseTime: 0,
      nowDate: Date.now()
    };
  },
  watch: {
    countString: {
      deep: true,
      handler(val, oldVal) {
        if (this.needSendSunc) {
          this.passToParent(val);
        }
      }
    },
    needSendSunc: {
      deep: true,
      handler(val) {
        if (val) {
          this.passToParent(this.countString);
        }
      }
    }
  },
  props: {
    sendSync: {
      type: Boolean,
      default: false
    },
    autoStart: {
      type: Boolean,
      default: false
    },
    defaultVal: {
      type: Number,
      default: 0
    }
  },
  mounted() {
    if (this.autoStart) {
      this.startCountFn();
    }
  },
  computed: {
    needSendSunc() {
      return this.sendSync;
    }
  },
  created() {
    this.$on('startCount', function() {
      this.startCountFn();
    });
    this.$on('stopCount', function() {
      this.stopCountFn();
    });
  },
  methods: {
    counterFn(counterTime) {
      let nowDate = new Date().getTime();
      let num = 0;
      if (this.pauseTime <= 0) {
        num = counterTime - nowDate; //计算时间毫秒差
      } else {
        this.pauseTime = this.pauseTime + 10;
        num = counterTime - this.pauseTime; //计算时间毫秒差
      }
      if (num <= 0) {
        this.stopCountFn();
        this.$nextTick(_ => {
          this.countString = '';
        });
      }
      let leave1 = num % (24 * 3600 * 1000); //计算天数后剩余的毫秒数
      let leave2 = leave1 % (3600 * 1000); //计算小时数后剩余的毫秒数
      let leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
      this.day = Math.floor(num / (24 * 3600 * 1000)); //计算相差天数
      this.hour = Math.floor(leave1 / (3600 * 1000)); //计算相差小时
      this.minute = Math.floor(leave2 / (60 * 1000)); //计算相差分钟
      this.second = Math.round(leave3 / 1000); //计算相差秒
      if (this.day > 0) {
        this.countString = `${this.day}天 ${this.hour}小时 ${this.minute}分 ${this.second}秒`;
      } else if (this.hour > 0) {
        this.countString = `${this.hour}小时 ${this.minute}分 ${this.second}秒`;
      } else if (this.minute > 0) {
        this.countString = `${this.minute}分 ${this.second}秒`;
      } else {
        this.countString = `${this.second}秒`;
      }
    },
    startCountFn() {
      if (!this.isStart) {
        this.countVal = this.countVal ? this.countVal : new Date().getTime();
        let timer = setInterval(_ => {
          this.counterFn(this.countVal);
        }, 1000);
        this.globalTimer = timer;
        this.isStart = true;
      }
    },
    stopCountFn() {
      if (this.isStart) {
        window.clearInterval(this.globalTimer);
        this.globalTimer = null;
        this.isStart = false;
        this.pauseTime = new Date().getTime();
      }
    },
    passToParent(data) {
      this.$emit('getDataFromChild', data);
    }
  },
  beforeDestroy() {
    this.stopCountFn();
  }
};
</script>
