<template>
  <div class="container grid-lg container-root d-flex flex-column p-2">
    <header class="navbar">
      <section class="navbar-section">
        <h1>WallPainter</h1>
      </section>
      <section class="navbar-section">
        <div class="d-flex">
          <label class="mr-1">Source:</label>
          <div class="form-autocomplete">
            <div class="form-autocomplete-input form-input" @click="showSourcePanel = !showSourcePanel">
              <div v-if="!activeSources.length" class="text-gray">all</div>
              <div class="label label-ghost label-xs image-tag" v-for="item in activeSources">
                {{item.source}}
                <a class="btn btn-clear" @click.prevent="onToggleSource(item)"></a>
              </div>
            </div>
            <ul class="menu" v-show="showSourcePanel">
              <li class="menu-item" v-for="item in store.sources" :class="{ active: item.active }">
                <a href="#" v-text="item.source" @click.prevent="onToggleSource(item)"></a>
              </li>
            </ul>
          </div>
        </div>
        <div class="d-flex ml-2">
          <label class="mr-1">Status:</label>
          <select class="form-select select-sm" v-model="store.search.where.status">
            <option value="">all</option>
            <option value="0">enabled</option>
            <option value="1">disabled</option>
          </select>
        </div>
        <div class="ml-2">
          <i class="fa fa-refresh btn-icon" @click="onRefresh" />
        </div>
      </section>
    </header>
    <image-list @setSource="onSetSource" />
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
      showSourcePanel: false,
    };
  },
  watch: {
    'store.search.where.status': 'onRefresh',
    activeSources: 'onRefresh',
  },
  computed: {
    activeSources() {
      return this.store.sources.filter(({ active }) => active);
    },
  },
  methods: {
    onRefresh: updateList,
    onToggleSource(item) {
      item.active = !item.active;
    },
    onSetSource(source) {
      this.store.sources.forEach(item => {
        item.active = item.source === source;
      });
    },
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
.h-100 {
  height: 100%;
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
.form-autocomplete-input {
  min-width: 8em;
}
</style>
