<template>
  <div class="container grid-lg container-root d-flex flex-column p-2">
    <header class="navbar">
      <section class="navbar-section">
        <h1>WallPainter</h1>
      </section>
      <section class="navbar-section">
        <div class="mr-2 d-flex">
          <label class="mr-1">Status</label>
          <select class="form-select select-sm" v-model="store.search.where.status">
            <option value="">all</option>
            <option value="0">enabled</option>
            <option value="1">disabled</option>
          </select>
        </div>
        <i class="fa fa-refresh btn-icon" @click="onRefresh" />
      </section>
    </header>
    <image-list />
    <footer class="mt-2 text-gray">
      Designed and built with <span class="text-error">&hearts;</span> by Gerald
    </footer>
  </div>
</template>

<script>
import { store } from './store';
import { updateList } from './service';
import ImageList from './image-list';

export default {
  components: {
    ImageList,
  },
  data() {
    return {
      store,
    };
  },
  watch: {
    'store.search.where.status': 'onRefresh',
  },
  methods: {
    onRefresh: updateList,
  },
};
</script>

<style>
.container-root {
  height: 100vh;
  > header {
    height: 50px;
  }
}
.flex-column {
  flex-direction: column;
}
.flex-auto {
  flex: auto;
  .flex-column > & {
    height: 0;
  }
  :not(.flex-column) > & {
    width: 0;
  }
}
.label-ghost {
  color: #5755d9;
  border: 1px solid currentColor;
  background: none;
}
.label-xs {
  padding: .1rem .2rem;
  font-size: 12px;
}
.btn-icon {
  cursor: pointer;
  opacity: .8;
  &.disabled {
    opacity: .25;
  }
  &:not(.disabled):hover {
    opacity: 1;
  }
}
</style>
