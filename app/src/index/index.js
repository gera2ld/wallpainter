import Vue from 'vue';
import 'spectre.css';
import 'font-awesome/css/font-awesome.css';
import App from './app';
import { updateList } from './service';

const root = document.createElement('div');
document.body.append(root);
new Vue({
  render: h => h(App),
}).$mount(root);

updateList();
