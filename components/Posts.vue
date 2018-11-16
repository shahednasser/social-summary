<template>
  <div class="container mt-5" v-if="posts.length > 0">
    <b-card-group class="w-100" columns>
      <b-card v-for="(post, index) in posts"
              :key="index"
              :img-src="post.img"
              img-top
              img-fluid
              :class="[{slow: index != 0}, 'animated', 'slideInUp']">
        <b-card-body>
          <p class="card-text">
            {{ post.caption }}
          </p>
          <div class="text-right">
            <a class="card-link" :href="post.url">
              <b-img right v-bind:src="'/images/' + post.type + '.svg'" />
            </a>
          </div>
        </b-card-body>
      </b-card>
    </b-card-group>
  </div>
</template>

<script>
export default {
  props: ['posts'],
  methods: {
    created(){
      console.log("created", this.posts);
    },
    beforeUpdate(){
      console.log("gonna update");
    }
  }
}
</script>

<style>
  .posts-grid {
    width: 100%;
  }
</style>
