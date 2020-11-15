import Vue from 'vue';
import 'spectre.css';
import 'font-awesome/css/font-awesome.css';
import App from './app.vue';
import { initialize } from './service';

async function main() {
  await initialize();
  const vm = new Vue({
    render: h => h(App),
  }).$mount();
  document.body.append(vm.$el);
}

main();
