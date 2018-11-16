<template>
  <b-form
    inline
    @submit.prevent="onSubmit"
    class="search-form" >
    <b-input
      v-model="keyword"
      type="text"
      @keyup.enter="onSubmit"
      placeholder="Enter keyword"
      class="col-sm-8 col-12" />
    <b-button
      type="submit"
      class="search-btn offset-sm-1 col-sm-3 col-12">Search</b-button>
      <small class='text-danger mt-2' v-if="errorText">{{errorText}}</small>
  </b-form>
</template>

<script>

export default {
  data() {
    return { keyword: '', posts: [], errorText: '' }
  },
  methods: {
    async onSubmit(e) {
      if(!this.keyword.length){
        this.errorText = "Keyword is required.";
        return;
      }
      this.errorText = "";
      let self = this;
      this.$nuxt.$loading.start()
      let url = encodeURI(process.env.server.host + ":" + process.env.server.port +
                        '/getPosts/' + this.keyword);
      this.$axios.get(url)
                .then(function(response){
                  self.$emit('updatePosts', response.data.posts);
                })
                .catch(function(err){
                  self.errorText = "An error occured. Please try again later.";
                });
    },
  }
}
</script>

<style>
  .search-form {
    width: 70%;
    margin: 0 auto;
  }

  .search-btn {
    background-color: #ED5435;
    border-color: #ED5435;
  }

  .search-btn:hover, .search-btn:active {
    background-color: #d54b2f !important;
    border-color: #d54b2f !important;
    box-shadow: none !important;
  }

  .search-btn:focus {
    box-shadow: none !important;
  }
</style>
