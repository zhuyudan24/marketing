<template>
  <section class="eval-charts">
    <div class="dm-form__wrap">
      <store-group width="240" class="pr5" :model="storeGroupData" @commit-store="getStoreGroup"></store-group>
      <span class="pl10 danger-color">*以下数据取自近180天</span>
    </div>
    <div class="dm-form__wrap">
      <h3 class="dm-title__label">
        评价趋势
        <el-button style="float: right;padding: 0px 32px;" type="text" @click="preTrend">详情</el-button>
      </h3>
      <div id="mountNode" ref="mountNode" v-show="list.length"></div>
      <div class="chart--nodata" v-show="!list.length"></div>
    </div>
    <div class="dm-form__wrap">
      <div slot="header">
        <h3 class="dm-title__label">
          各项评分概况
          <el-button style="float: right;padding: 0px 32px;" type="text" @click="preDetail">详情</el-button>
        </h3>
      </div>
      <div class="rate-wrap">
        <div class="rate-item" :class="{ pb20: index !== 2 }" v-for="(item, index) in rate" :key="index">
          <div class="rate-top">
            <span class="pr10">{{ item.name }} （共{{ item.sum }}人）</span>
            <span class="fz18 bold"> {{ Number(item.score / item.sum).toFixed(2) }}分</span>
          </div>
          <ul class="rate-bottom gray-bg">
            <li v-for="(v, i) in item.list" :key="i">
              <el-rate class="inline-block" v-model="v.socre" disabled></el-rate>
              <span class="rate-text">{{ v.socre * 2 }}分</span>
              <div class="progress" :style="{ width: (v.count / item.sum) * 100 + 'px' }"></div>
              <span class="progress-text fz12 vertical-middle pl5"> {{ Number((v.count * 100) / item.sum).toFixed(2) }}%</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div>
      <div class="charts-half">
        <h3 class="dm-title__label--outer">正面快评使用统计</h3>
        <div id="mountNodePieGood" ref="mountNodePieGood" v-show="goodList.length"></div>
        <div class="chart--nodata mt100" v-show="!goodList.length"></div>
      </div>
      <div class="charts-half">
        <h3 class="dm-title__label--outer">负面快评使用统计</h3>
        <div id="mountNodePieBad" ref="mountNodePieBad" v-show="badList.length"></div>
        <div class="chart--nodata mt100" v-show="!badList.length"></div>
      </div>
    </div>
    <detail :show.sync="detailShow" :id="groupId"></detail>
    <scoredetail :show.sync="scoredetailShow" :id="groupId"></scoredetail>
  </section>
</template>
<script>
import G2 from '@antv/g2';
import storeGroup from '@/components/storeGroup';
import { evaluateOverviewEchart } from '@/service/api/evaluationApi.js';
import detail from './detail';
import scoredetail from './scoredetail';
export default {
  components: {
    storeGroup,
    detail,
    scoredetail
  },
  data() {
    return {
      list: [],
      goodList: [],
      badList: [],
      rate: [{ name: '服务态度评分', list: [], score: 0, sum: 1 }, { name: '专业程度评分', list: [], score: 0, sum: 1 }, { name: '门店环境评分', list: [], score: 0, sum: 1 }],
      detailShow: false,
      scoredetailShow: false,
      groupId: '',
      storeGroupData: {}
    };
  },
  created() {
    this.$store.commit('mutations_breadcrumb', [{ name: '企业管理', path: '' }, { name: '服务监督', path: '/evaluation' }, { name: '评价概览', path: '' }]);
    this.evaluateOverviewEchart(1);
    this.evaluateOverviewEchart(2);
    this.evaluateOverviewEchart(3);
  },
  methods: {
    getStoreGroup(val) {
      this.evaluateOverviewEchart(1, val.storeGroupId);
      this.evaluateOverviewEchart(2, val.storeGroupId);
      this.evaluateOverviewEchart(3, val.storeGroupId);
    },
    async evaluateOverviewEchart(type = 1, id = '') {
      let res = await evaluateOverviewEchart({ currentStoreGroupId: id, chartType: type });
      if (type === 1) {
        const result = res.result;
        let list = [];
        result.sundayList.map((v, i) => {
          list.push({ day: v, name: '订单总数', temperature: result.yDataorders[i] });
          list.push({ day: v, name: '评价总数', temperature: result.yDataevaluate[i] });
          list.push({ day: v, name: '好评总数', temperature: result.yDatagood[i] });
        });
        list.sort((a, b) => {
          return a.temperature - b.temperature;
        });
        //先清空原先图表
        const mountNode = this.$refs.mountNode;
        const mountNodeChilds = Array.from(mountNode.childNodes);
        mountNodeChilds.map(v => {
          mountNode.removeChild(v);
        });
        this.list = list;
        list = list.sort((a, b) => {
          return a.temperature - b.temperature;
        });
        console.log(list);
        this.$nextTick(_ => {
          this.initCharts(list, 'mountNode');
        });
      }
      if (type === 2) {
        const scoreList = res.result.evaluateScoreList;
        let fwtdScore = 0;
        let fwtdCount2 = 0;
        let fwtdCount4 = 0;
        let fwtdCount6 = 0;
        let fwtdCount8 = 0;
        let fwtdCount10 = 0;
        let fwtdSum = 1;
        let zycdScore = 0;
        let zycdSum = 1;
        let zycdCount2 = 0;
        let zycdCount4 = 0;
        let zycdCount6 = 0;
        let zycdCount8 = 0;
        let zycdCount10 = 0;
        let mdhjScore = 0;
        let mdhjSum = 1;
        let mdhjCount2 = 0;
        let mdhjCount4 = 0;
        let mdhjCount6 = 0;
        let mdhjCount8 = 0;
        let mdhjCount10 = 0;
        scoreList.map((v, i) => {
          if (i == 0) {
            fwtdSum = 0;
            zycdSum = 0;
            mdhjSum = 0;
          }
          let name = scoreList[i][0];
          let count = scoreList[i][2];
          let score = scoreList[i][1];
          if (name.indexOf('service') != -1) {
            fwtdSum += count;
            fwtdScore += score * count;
            if (parseInt(score) == 2) {
              fwtdCount2 = count;
            }
            if (parseInt(score) == 4) {
              fwtdCount4 = count;
            }
            if (parseInt(score) == 6) {
              fwtdCount6 = count;
            }
            if (parseInt(score) == 8) {
              fwtdCount8 = count;
            }
            if (parseInt(score) == 10) {
              fwtdCount10 = count;
            }
          }
          if (name.indexOf('major') != -1) {
            zycdSum += count;
            zycdScore += score * count;
            if (parseInt(score) == 2) {
              zycdCount2 = count;
            }
            if (parseInt(score) == 4) {
              zycdCount4 = count;
            }
            if (parseInt(score) == 6) {
              zycdCount6 = count;
            }
            if (parseInt(score) == 8) {
              zycdCount8 = count;
            }
            if (parseInt(score) == 10) {
              zycdCount10 = count;
            }
          }
          if (name.indexOf('store') != -1) {
            mdhjSum += count;
            mdhjScore += score * count;
            if (parseInt(score) == 2) {
              mdhjCount2 = count;
            }
            if (parseInt(score) == 4) {
              mdhjCount4 = count;
            }
            if (parseInt(score) == 6) {
              mdhjCount6 = count;
            }
            if (parseInt(score) == 8) {
              mdhjCount8 = count;
            }
            if (parseInt(score) == 10) {
              mdhjCount10 = count;
            }
          }
        });
        this.rate[0].name = '服务态度评分';
        this.rate[0].score = fwtdScore;
        this.rate[0].sum = fwtdSum;
        this.rate[0].list = [{ socre: 1, count: fwtdCount2 }, { socre: 2, count: fwtdCount4 }, { socre: 3, count: fwtdCount6 }, { socre: 4, count: fwtdCount8 }, { socre: 5, count: fwtdCount10 }];

        this.rate[1].name = '专业程度评分';
        this.rate[1].score = zycdScore;
        this.rate[1].sum = zycdSum;
        this.rate[1].list = [{ socre: 1, count: zycdCount2 }, { socre: 2, count: zycdCount4 }, { socre: 3, count: zycdCount6 }, { socre: 4, count: zycdCount8 }, { socre: 5, count: zycdCount10 }];

        this.rate[2].name = '门店环境评分';
        this.rate[2].score = mdhjScore;
        this.rate[2].sum = mdhjSum;
        this.rate[2].list = [{ socre: 1, count: mdhjCount2 }, { socre: 2, count: mdhjCount4 }, { socre: 3, count: mdhjCount6 }, { socre: 4, count: mdhjCount8 }, { socre: 5, count: mdhjCount10 }];
      }
      if (type === 3) {
        const goodTagList = res.result.goodTagList;
        const badTagList = res.result.badTagList;
        //正面快评生成
        let goodList = [];
        const goodTotal = goodTagList.map(v => v[0]).reduce((total, num) => total + num);
        goodTagList.map((v, i) => {
          goodList.push({ item: v[1], count: parseInt(v[0]), percent: parseFloat((v[0] / goodTotal).toFixed(2)) });
        });
        this.goodList = goodList;
        //先清空原先图表
        const mountNodePieGood = this.$refs.mountNodePieGood;
        const goodChilds = Array.from(mountNodePieGood.childNodes);
        goodChilds.map(v => {
          mountNodePieGood.removeChild(v);
        });
        this.goodList = goodList;
        this.$nextTick(_ => {
          this.initPieChart(goodList, 'mountNodePieGood');
        });

        //负面快评生成
        let badList = [];
        const badTotal = badTagList.map(v => v[0]).reduce((total, num) => total + num);
        badTagList.map((v, i) => {
          badList.push({ item: v[1], count: parseInt(v[0]), percent: parseFloat((v[0] / badTotal).toFixed(2)) });
        });
        this.badList = badList;
        //先清空原先图表
        const mountNodePieBad = this.$refs.mountNodePieBad;
        const badChilds = Array.from(mountNodePieBad.childNodes);
        badChilds.map(v => {
          mountNodePieBad.removeChild(v);
        });
        this.badList = badList;
        this.$nextTick(_ => {
          this.initPieChart(badList, 'mountNodePieBad');
        });
      }
    },
    preTrend() {
      this.detailShow = true;
    },
    preDetail() {
      this.scoredetailShow = true;
    },
    //生成饼图
    initPieChart(data, nodeName) {
      console.log(data);
      let chart = new G2.Chart({
        container: nodeName,
        forceFit: true,
        height: 400
      });
      chart.source(data, {
        percent: {
          formatter: function formatter(val) {
            val = (val * 100).toFixed(2) + '%';
            return val;
          }
        }
      });
      chart.coord('theta', {
        radius: 0.75,
        innerRadius: 0.6
      });
      chart.tooltip({
        showTitle: false,
        itemTpl: '<li><span style="background-color:{color};" class="g2-tooltip-marker"></span>{name}: {value}</li>'
      });
      chart.on('click', ev => {
        if (nodeName === 'mountNodePieBad') {
          this.$router.push('/evaluation/bad/' + ev.data._origin.item);
        }
      });
      // 辅助文本
      chart.guide().html({
        position: ['50%', '50%'],
        html: `<div style="color:#8c8c8c;font-size: 14px;text-align: center;width: 10em;">${nodeName === 'mountNodePieGood' ? '正面快评' : '负面快评'}</div>`,
        alignX: 'middle',
        alignY: 'middle'
      });

      chart
        .intervalStack()
        .position('percent')
        .color('item')
        .label('percent', {
          formatter: function formatter(val, item) {
            return item.point.item + ': ' + val;
          }
        })
        .tooltip('item*percent', function(item, percent) {
          percent = percent * 100 + '%';
          return {
            name: item,
            value: percent
          };
        })
        .style({
          lineWidth: 1,
          stroke: '#fff'
        });
      chart.render();
    },
    //生成折线图
    initCharts(data, nodeName) {
      let chart = new G2.Chart({
        container: nodeName,
        forceFit: true,
        height: 400,
        padding: { top: 20, right: 0, bottom: 60, left: 40 }
      });
      chart.source(data, {
        day: {
          range: [0, 1],
          alias: '日期'
        },
        temperature: {
          tickCount: 10
        }
      });
      chart.tooltip({
        crosshairs: {
          type: 'line'
        }
      });
      chart.axis('temperature', {
        label: {
          formatter: function formatter(val) {
            return val;
          }
        },
        offset: 1,
        subTickCount: 20,
        subTickLine: {
          subTickCount: 20,
          lineWidth: 1, // 次刻度线宽
          stroke: '#ddd', // 次刻度线颜色
          strokeOpacity: 0.5, // 次刻度线颜色的透明度
          length: 3 // 次刻度线的长度，可以为负值（表示反方向渲染）
        }
      });
      chart
        .area()
        .position('day*temperature')
        .color('name', ['#8543e0', '#1890ff', '#13c2c2'])
        .shape('smooth');
      chart
        .line()
        .position('day*temperature')
        .color('name', ['#8543e0', '#1890ff', '#13c2c2'])
        .size(2)
        .shape('smooth');
      chart.render();
    }
  }
};
</script>
<style lang="scss" scoped>
.eval-charts {
  position: relative;
  .eval-tips {
    position: absolute;
  }
  .progress {
    height: 10px;
    background: #f49f71;
    display: inline-block;
    vertical-align: middle;
    border-radius: 3px;
  }
  .progress-text {
    color: #f49f71;
  }
  .rate-wrap {
    display: flex;
    justify-content: space-around;
    width: 100%;
  }
  .rate-item {
    // width:33%;
    justify-content: space-between;
  }
  .rate-bottom {
    font-size: 12px;
    padding: 20px;
    li {
      line-height: 1.5;
    }
  }
  .rate-top {
    padding: 20px 0;
  }
  .rate-text {
    display: inline-block;
    color: #f55c6c;
    vertical-align: middle;
    width: 30px;
  }
  /deep/ .el-rate__icon {
    font-size: 12px;
    margin-right: 3px;
  }
  /deep/ .el-rate__text {
    font-size: 12px;
  }
}

.choice-store {
  position: absolute;
  top: -54px;
  right: 0px;
}

.tips1 {
  position: absolute;
  top: 200px;
  left: 20%;
}

.tips2 {
  position: absolute;
  top: 200px;
  left: 70%;
}
.charts-half {
  display: inline-block;
  width: calc(50% - 79px);
  padding: 24px;
  margin: 0 10px 0 24px;
  background: #fff;
  vertical-align: top;
  min-height: 460px;
}
.charts-half + .charts-half {
  margin: 0 24px 0 0;
}
</style>
