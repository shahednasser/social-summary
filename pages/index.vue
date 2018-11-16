<template>
  <section class="container">
    <div :class="['logo-container', {move}]">
      <logo/>
      <search-form v-on:updatePosts="updatePosts" />
    </div>
    <posts v-bind:posts="posts" />
  </section>
</template>

<script>
import Logo from '~/components/Logo.vue'
import SearchForm from '~/components/SearchForm.vue'
import Posts from '~/components/Posts.vue'

export default {
  components: {
    Logo,
    SearchForm,
    Posts
  },
  data(){
    return {posts: [], move: false}
  },
  methods: {
    updatePosts(posts) {
      if(this.posts.length == 0){
        this.move = true;
      }
      let self = this;
      setTimeout(function(){
        self.posts = posts
        self.move = false;
        self.$nuxt.$loading.finish()
      }, 400);
    }
  }
}
</script>

<style>
.container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

section.container {
  flex-direction: column;
}

.title {
  font-family: 'Quicksand', 'Source Sans Pro', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  display: block;
  font-weight: 300;
  font-size: 100px;
  color: #35495e;
  letter-spacing: 1px;
}

.subtitle {
  font-weight: 300;
  font-size: 42px;
  color: #526488;
  word-spacing: 5px;
  padding-bottom: 15px;
}

.links {
  padding-top: 15px;
}

.move {
  animation: moveAnimation .5s;
}

@keyframes moveAnimation {
  100% {transform: translateY(calc(63vh - 100vh));}
}
</style>
