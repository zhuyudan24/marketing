<template>
  <section>
    <!-- 渠道分析 -->
    <div class="dm-form__wrap" v-if="$route.meta.type !== 'shelf'">
      <h3 class="dm-title__label">
        <span class="card-chart__title">渠道分析</span>
        <el-date-picker class="fr ml5 mr20" v-model="dateTime2" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="cardChannelAnalysis"></el-date-picker>
      </h3>
      <el-table tooltipEffect="light" :data="tableList" style="width:100%" v-loading="loading">
        <el-table-column v-for="(v, i) in tableHeader" :key="i" :align="v.align" :width="v.width" :min-width="v.minWidth" :prop="v.prop" :label="v.label" :formatter="v.formatter"></el-table-column>
      </el-table>
    </div>
    <!-- 卡券报表趋势分析 -->
    <div class="dm-form__wrap">
      <h3 class="dm-title__label clearfix">
        <span class="card-chart__title">卡券报表趋势分析</span>
        <el-date-picker class="fr ml5 mr20" v-model="dateTime" type="daterange" range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" @change="cardTrendEchart"></el-date-picker>
        <el-select class="fr w200" v-model="chartParams.kpiName" placeholder="选择状态" @change="cardTrendEchart">
          <el-option v-for="(v, i) in kpiNameOptions" :key="i" :label="v.label" :value="v.value"></el-option>
        </el-select>
      </h3>
      <div id="mountNode" ref="mountNode" v-show="list.length"></div>
      <div class="chart--nodata" v-show="!list.length"></div>
    </div>
  </section>
</template>
<script>
import { cardChannelAnalysis, cardTrendEchart } from '@/service/api/cardApi.js';
import { formatDateTimeByType } from '@/utils/index.js';
import VeLine from 'v-charts/lib/line.common';
import G2 from '@antv/g2';
export default {
  name: 'card-analysis',
  data() {
    this.chartSettings = {
      xAxisType: 'time'
    };
    return {
      formatDateTimeByType,
      dateTime: [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()],
      dateTime2: [Date.now() - 30 * 24 * 60 * 60 * 1000, Date.now()],
      loading: false,
      tableList: [],
      chartData: {
        columns: [],
        rows: []
      },
      listParams: {
        type: ''
      },
      kpiNameOptions: [{ label: '领取次数', value: 'card-puton1' }, { label: '使用次数', value: 'card-puton2' }, { label: '销售额', value: 'card-puton3' }],
      tableHeader: [
        { label: '渠道名称', prop: 'receiveName', align: 'left', minWidth: '200' },
        {
          label: '投放人次',
          prop: 'issuingQuantity',
          align: 'left',
          width: '100',
          formatter(row) {
            return row.receiveCode === 'RECEIVE_005' ? '-' : row.issuingQuantity;
          }
        },
        {
          label: '领取率',
          prop: 'receiveName',
          align: 'left',
          width: '100',
          formatter(row) {
            return row.receiveCode === 'RECEIVE_005' ? '-' : ((row.getedQuantity * 100) / (row.issuingQuantity === 0 ? 1 : row.issuingQuantity)).toFixed(2) + '%';
          }
        },
        { label: '领取数量', prop: 'getedQuantity', align: 'left', width: '100' },
        { label: '使用数量', prop: 'usageQuantity', align: 'left', width: '100' },
        {
          label: '核销率',
          prop: 'receiveName',
          align: 'left',
          width: '100',
          formatter(row) {
            return ((row.usageQuantity * 100) / (row.getedQuantity === 0 ? 1 : row.getedQuantity)).toFixed(2) + '%';
          }
        },
        { label: '销售额', prop: 'saleAmount', align: 'left', width: '100' }
      ],
      chartParams: {
        kpiName: 'card-puton1',
        cardId: this.$route.params.id,
        beginTime: '',
        endTime: '',
        day: 1
      },
      list: []
    };
  },
  components: {
    [VeLine.name]: VeLine
  },
  created() {
    if (this.$route.meta.type === 'shelf') {
      this.chartParams = {
        kpiName: 'shelf-cards1',
        shelfId: this.$route.params.id,
        beginTime: '',
        endTime: ''
      };
      this.kpiNameOptions = [{ label: '领取次数', value: 'shelf-cards1' }, { label: '使用次数', value: 'shelf-cards2' }, { label: '销售额', value: 'shelf-cards3' }];
      this.cardTrendEchart();
      this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '卡券营销', path: '' }, { name: '卡券展架', path: '/card/shelf' }, { name: '卡券展架报表', path: '' }]);
    } else {
      this.chartParams = {
        kpiName: 'card-puton1',
        cardId: this.$route.params.id,
        beginTime: '',
        endTime: '',
        day: 1
      };
      (this.kpiNameOptions = [{ label: '领取次数', value: 'card-puton1' }, { label: '使用次数', value: 'card-puton2' }, { label: '销售额', value: 'card-puton3' }]), this.cardChannelAnalysis();
      this.cardTrendEchart();
      this.$store.commit('mutations_breadcrumb', [{ name: '营销管理', path: '' }, { name: '卡券营销', path: '' }, { name: '卡券库', path: '/card/list' }, { name: '卡券报表', path: '' }]);
    }
  },
  methods: {
    //加载列表
    async cardChannelAnalysis() {
      let params = {
        coupCardId: this.$route.params.id,
        beginTime: '',
        endTime: ''
      };
      if (this.dateTime2) {
        params.beginTime = formatDateTimeByType(this.dateTime2[0], 'yyyy-MM-dd');
        params.endTime = formatDateTimeByType(this.dateTime2[1], 'yyyy-MM-dd');
      } else {
        params.beginTime = '';
        params.endTime = '';
      }
      this.loading = true;
      try {
        let resList = await cardChannelAnalysis(params);
        if (resList.errorCode === 0 && resList.result) {
          this.tableList = resList.result;
        } else {
          this.tableList = [];
        }
      } catch (err) {}
      this.loading = false;
    },
    //加载图表
    async cardTrendEchart() {
      if (this.dateTime) {
        this.chartParams.beginTime = formatDateTimeByType(this.dateTime[0], 'yyyy-MM-dd');
        this.chartParams.endTime = formatDateTimeByType(this.dateTime[1], 'yyyy-MM-dd');
      } else {
        this.chartParams.beginTime = '';
        this.chartParams.endTime = '';
      }
      try {
        let res = await cardTrendEchart(this.chartParams);
        if (res.errorCode === 0 && res.result) {
          let result = JSON.parse(res.result);
          let series = result.series;
          let xAxisType = result.xaxisData;
          let list = [];
          series.map((v, i) => {
            v.data.map((w, j) => {
              list.push({
                day: xAxisType[j],
                name: v.name,
                temperature: parseInt(w.value)
              });
            });
          });
          const mountNode = this.$refs.mountNode;

          const childs = Array.from(mountNode.childNodes);
          childs.map(v => {
            mountNode.removeChild(v);
          });
          this.list = list;
          this.$nextTick(_ => {
            this.initCharts(list);
          });
        }
      } catch (err) {
        console.log(err);
      }
    },
    // 画图方法
    initCharts(data) {
      var chart = new G2.Chart({
        container: 'mountNode',
        forceFit: true,
        height: 400
      });
      chart.source(data, {
        day: {
          range: [0, 1]
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
            val = Number(val);
            if (val % 1 === 0) {
              return val + '人次';
            } else {
              return '';
            }
          }
        }
      });
      chart
        .line()
        .position('day*temperature')
        .color('name');
      chart
        .point()
        .position('day*temperature')
        .color('name')
        .size(4)
        .shape('circle')
        .style({
          stroke: '#fff',
          lineWidth: 1
        });
      chart.render();
    }
  }
};
</script>

<style lang="scss" scoped>
.card-chart__title {
  display: inline-block;
  vertical-align: middle;
  padding-top: 13px;
  font-weight: 700;
}
</style>
