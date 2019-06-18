<template>
  <script :id="id" type="text/plain"></script>
</template>

<script>
/* eslint-disable */
import { formatDateTimeByType } from '@/utils/index.js';
import config from '@/config';
let baseUrl = window.location.protocol + '//' + window.location.host || '';
// 一个简单的事件订阅发布的实现,取代原始Event对象,提升IE下的兼容性
class LoadEvent {
  constructor() {
    this.listeners = {};
  }
  on(eventName, callback) {
    this.listeners[eventName] === undefined ? (this.listeners[eventName] = []) : '';
    this.listeners[eventName].push(callback);
  }
  emit(eventName) {
    this.listeners[eventName] && this.listeners[eventName].forEach(callback => callback());
  }
}
export default {
  name: 'VueUeditorWrap',
  data() {
    return {
      id:
        'editor' +
        Math.random()
          .toString()
          .slice(-10),
      editor: null,
      defaultConfig: {
        UEDITOR_HOME_URL: './static/UEditor/',
        enableAutoSave: false
      }
    };
  },
  props: {
    value: {
      type: String,
      default: ''
    },
    config: {
      type: Object,
      default: function() {
        return {};
      }
    },
    myInit: {
      type: Function,
      default: function() {
        return () => {};
      }
    },
    destroy: Boolean
  },
  computed: {
    mixedConfig() {
      return Object.assign({}, this.defaultConfig, this.config);
    }
  },
  methods: {
    registerButton: ({ name, icon, tip, handler, UE = window.UE }) => {
      UE.registerUI(name, (editor, name) => {
        editor.registerCommand(name, {
          execCommand: () => {
            handler(editor, name);
          }
        });
        const btn = new UE.ui.Button({
          name,
          title: tip,
          cssRules: `background-image: url(${icon}) !important;background-size: cover;`,
          onclick() {
            editor.execCommand(name);
          }
        });
        editor.addListener('selectionchange', () => {
          const state = editor.queryCommandState(name);
          if (state === -1) {
            btn.setDisabled(true);
            btn.setChecked(false);
          } else {
            btn.setDisabled(false);
            btn.setChecked(state);
          }
        });
        return btn;
      });
    },
    registerPlugin: (name, callback, UE = window.UE) => {
      UE.plugin.register(name, callback);
    },

    // 实例化编辑器之前-JS依赖检测
    _beforeInitEditor(value) {
      // 准确判断ueditor.config.js和ueditor.all.js均已加载 仅加载完ueditor.config.js时UE对象和UEDITOR_CONFIG对象也存在,仅加载完ueditor.all.js时UEDITOR_CONFIG对象也存在,但为空对象
      !!window.UE && !!window.UEDITOR_CONFIG && Object.keys(window.UEDITOR_CONFIG).length !== 0 && !!window.UE.getEditor ? this._initEditor(value) : this._loadScripts().then(() => this._initEditor(value));
    },
    // 实例化编辑器
    _initEditor(value) {
      this.$nextTick(() => {
        this.myInit();
        // 没有按官网示例那样链式调用ready方法的原因在于需要拿到getEditor返回的实例
        this.editor = window.UE.getEditor(this.id, this.mixedConfig);
        this.editor.addListener('ready', () => {
          this.$emit('ready', this.editor);
          this.editor.setContent(value);
          this.editor.addListener('contentChange', () => {
            this.$emit('input', this.editor.getContent());
          });
        });
        //视频
        this.registerPlugin('mpvideo', function() {
          this.ready(() => {
            this.window.addEventListener('message', evt => {
              if (evt.data.type === 'mpvideo-iframe-play-event') {
                this.fireEvent('mpvideo-iframe-play', evt.data.payload);
              }
            });
          });
          return {
            outputRule(root) {
              root.getNodesByTagName('iframe').forEach(node => {
                if (node.getAttr('data-is-mpvideo') === undefined) return;
                let newNode = new UE.uNode({
                  type: 'element',
                  tagName: 'iframe',
                  attrs: {
                    'data-vidtype': '2',
                    class: 'video_iframe',
                    allowfullscreen: '',
                    frameborder: '0',
                    'data-src': `https://v.qq.com/iframe/preview.html?vid=${node.getAttr('data-vid')}&amp;width=500&amp;height=375&amp;auto=0`
                  }
                });
                node.parentNode.replaceChild(newNode, node);
              });
            },
            inputRule(root) {
              root.getNodesByTagName('iframe').forEach(node => {
                if (node.getAttr('class') !== 'video_iframe') return;
                let ratio = 280 / 496;
                let html = `<iframe class="video" frameborder="0" data-is-mpvideo data-vid="${vid}" scrolling="no" style="width: calc(100vw - 180px); height: calc(${100 * ratio}vw - ${180 * ratio}px);" src="https://v.qq.com/iframe/preview.html?vid=${vid}&origin=${encodeURIComponent('*')}"></iframe>`;
                let newNode = new UE.uNode.createElement(html);
                node.parentNode.replaceChild(newNode, node);
              });
            },
            commands: {
              insertmpvideo: {
                execCommand(cmd, vid) {
                  let ratio = 280 / 496;
                  let html = `<iframe class="video" frameborder="0" scrolling="no" data-is-mpvideo data-vid="${vid}" style="width: calc(100vw - 180px); height: calc(${100 * ratio}vw - ${180 * ratio}px);" src="https://v.qq.com/iframe/preview.html?vid=${vid}&origin=${encodeURIComponent('*')}"></iframe>`;
                  this.execCommand('inserthtml', html);
                }
              }
            }
          };
        });
        //卡券
        this.registerPlugin('mpcard', function() {
          return {
            outputRule(root) {
              root.getNodesByTagName('iframe').forEach(node => {
                if (node.getAttr('data-is-cardticket') === undefined) return;
                let cardticketString = node.getAttr('data-cardticket');
                let cardticket = JSON.parse(unescape(cardticketString));
                let html = '';
                html += `<div class="coupon-card-type-flag" data-is-cardticket data-cardticket="${cardticketString}" style="border-radius: 5px; border: 1px solid #e7e7eb; width: auto ;box-sizing: border-box;">`;
                html += `<div style="padding: 21px 13px 21px 13px; height: 102px; background-color: ${cardticket.cardColor || '#63b359'}; font-size: 18px; border-radius: 3px 3px 0 0; color: #fff; font-weight: normal; box-sizing: border-box;">`;
                html += '<div style="display: inline-block; width: 60px; height: 60px; border-radius: 100%; padding-top: 0; margin-top: 0; margin-right: 10px;">';
                html += `<img src="${cardticket.logo}"  data-src="${cardticket.logo}" style="border-radius: 100%; width: 60px; height: 60px; display: block; vertical-align: top;">`;
                html += '</div>';
                html += '<div style="display: inline-block; vertical-align: top;">';
                html += `<h4 style="font-weight: normal; margin: 0;font-size: 18px;line-height: 28px;">${cardticket.cardName}</h4>`;

                if (cardticket.cardEffectiveMode) {
                  html += `<p style="font-size: 12px; color:white;">领取后${cardticket.startDay} - ${cardticket.startDay + cardticket.limitDay}天</p>`;
                } else {
                  html += `<p style="font-size: 12px; color:white;">${formatDateTimeByType(cardticket.beginDate, 'yyyy-MM-dd')} 至 ${formatDateTimeByType(cardticket.endDate, 'yyyy-MM-dd')}</p>`;
                }

                html += '</div>';
                html += '</div>';
                html += '<p style="border-radius: 0 0 3px 3px; padding: 13px; color: #8d8d8d; text-align: center;">';
                html += `<a href="https://open.weixin.qq.com/connect/oauth2/authorize?appid=${cardticket.appkey}&redirect_uri=${cardticket.fwhHost}/to_coupon?cardId=${cardticket.wechatCardId}&outerId=002&response_type=code&scope=snsapi_base&state=1&component_appid=${cardticket.componentAppid}#wechat_redirect" style="font-size: 14px; border-radius: 3px; padding: 8px 20px; height: 32px; line-height: 14px; color: #fff; border: 1px solid #63b359; background-color: #63b359; text-decoration: none; cursor: pointer;">领取卡券</a>`;
                html += '</p>';
                html += '</div>';
                let newNode = new UE.uNode.createElement(html);
                node.parentNode.replaceChild(newNode, node);
              });
            },
            inputRule(root) {
              root.getNodesByTagName('div').forEach(node => {
                if (node.getAttr('class') !== 'coupon-card-type-flag') return;
                let cardticketString = node.getAttr('data-cardticket');
                let item = cardticketString ? JSON.parse(unescape(cardticketString)) : {};
                let html = `<iframe class="cardticket" frameborder="0" scrolling="no" data-is-cardticket data-cardticket="${escape(JSON.stringify(item))}" src="${baseUrl}/gicweb/load_wechat_image_rich_coupon_page?coupCardId=${item.coupCardId}&appkey=${item.appkey}&enterpriseId=${item.enterpriseId}"></iframe>`;
                // eslint-disable-next-line
                let newNode = new UE.uNode.createElement(html);
                node.parentNode.replaceChild(newNode, node);
              });
            },
            commands: {
              insertcardticket: {
                execCommand(cmd, item) {
                  let enterprise = JSON.parse(sessionStorage.getItem('enterprise') || '{}');
                  item.appkey = enterprise.appkey || '';
                  item.enterpriseId = enterprise.enterpriseId || '';
                  item.logo = enterprise.qcloudImageUrl || '';
                  item.componentAppid = sessionStorage.getItem('componentAppid') || 'wxa99d363814a5b73b';
                  item.fwhHost = sessionStorage.getItem('fwhHost') || '';
                  let html = `<iframe class="cardticket"  frameborder="0" scrolling="no" data-is-cardticket data-cardticket="${escape(JSON.stringify(item))}" src="${baseUrl}/gicweb/load_wechat_image_rich_coupon_page?coupCardId=${item.coupCardId}&appkey=${item.appkey}&enterpriseId=${item.enterpriseId}"></iframe>`;
                  this.execCommand('inserthtml', html);
                }
              }
            }
          };
        });
      });
    },
    // 动态添加JS依赖
    _loadScripts() {
      // 确保多个实例同时渲染时不会重复创建SCRIPT标签
      if (window.loadEnv) {
        return new Promise((resolve, reject) => {
          window.loadEnv.on('scriptsLoaded', function() {
            resolve();
          });
        });
      } else {
        window.loadEnv = new LoadEvent();
        return new Promise((resolve, reject) => {
          // 如果在其他地方只引用ueditor.all.min.js，在加载ueditor.config.js之后仍需要重新加载ueditor.all.min.js，所以必须确保ueditor.config.js已加载
          this._loadConfig()
            .then(() => this._loadCore())
            .then(() => {
              window.loadEnv.emit('scriptsLoaded');
              resolve();
            });
        });
      }
    },
    _loadConfig() {
      return new Promise((resolve, reject) => {
        if (!!window.UE && !!window.UEDITOR_CONFIG && Object.keys(window.UEDITOR_CONFIG).length !== 0) {
          resolve();
          return;
        }
        let configScript = document.createElement('script');
        configScript.type = 'text/javascript';
        configScript.src = this.mixedConfig.UEDITOR_HOME_URL + 'ueditor.config.js';
        document.getElementsByTagName('head')[0].appendChild(configScript);
        configScript.onload = function() {
          if (!!window.UE && !!window.UEDITOR_CONFIG && Object.keys(window.UEDITOR_CONFIG).length !== 0) {
            resolve();
          } else {
            console && console.error('加载ueditor.config.js失败,请检查您的配置地址UEDITOR_HOME_URL填写是否正确!');
          }
        };
      });
    },
    _loadCore() {
      return new Promise((resolve, reject) => {
        if (!!window.UE && !!window.UE.getEditor) {
          resolve();
          return;
        }
        let coreScript = document.createElement('script');
        coreScript.type = 'text/javascript';
        coreScript.src = this.mixedConfig.UEDITOR_HOME_URL + 'ueditor.all.min.js';
        document.getElementsByTagName('head')[0].appendChild(coreScript);
        coreScript.onload = function() {
          if (!!window.UE && !!window.UE.getEditor) {
            resolve();
          } else {
            console && console.error('加载ueditor.all.min.js失败,请检查您的配置地址UEDITOR_HOME_URL填写是否正确!');
          }
        };
      });
    },
    // 设置内容
    _setContent(value) {
      value === this.editor.getContent() || this.editor.setContent(value);
    }
  },
  beforeDestroy() {
    if (this.destroy && this.editor && this.editor.destroy) this.editor.destroy();
  },
  // v-model语法糖实现
  watch: {
    value: {
      handler(value) {
        this.editor ? this._setContent(value) : this._beforeInitEditor(value);
      },
      immediate: true
    }
  }
};
</script>
