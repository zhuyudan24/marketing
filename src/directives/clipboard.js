/**
 * v-clipboard 剪切板
 */

export default {
  bind(el, binding, vnode, oldVnode) {
    let val = '';
    el.addEventListener('click', function() {
      val = binding.value;
      const input = document.createElement('input');
      el.appendChild(input);
      input.value = val;
      input.select();
      document.execCommand('Copy');
      el.__vue__.$tips({ type: 'success', message: '复制链接成功' });
      input.parentNode.removeChild(input);
    });
  }
};
