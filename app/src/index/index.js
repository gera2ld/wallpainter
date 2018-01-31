import Vue from 'vue';
import 'spectre.css';
import 'font-awesome/css/font-awesome.css';
import App from './app';
import { updateList } from './service';

const vm = new Vue({
  render: h => h(App),
}).$mount();
document.body.append(vm.$el);

updateList();
