require('dotenv').config()
const app = require('express')();
const axios = require('axios');
const cors = require('cors');
const OAuth   = require('oauth-1.0a');
const crypto  = require('crypto');
const _ = require('lodash');

app.use(cors());

const port = 3001;

function getTwitterPosts(keyword){
  const oauth = OAuth({
    consumer: {
      key: process.env.TWITTER_API_KEY,
      secret: process.env.TWITTER_API_SECRET
    },
    signature_method: 'HMAC-SHA1',
    hash_function(base_string, key) {
      return crypto.createHmac('sha1', key).update(base_string).digest('base64');
    }
  });
  const token = {
    key: process.env.TWITTER_ACCESS_TOKEN,
    secret: process.env.TWITTER_ACCESS_SECRET
  };
  const request_data = {
    url: encodeURI('https://api.twitter.com/1.1/search/tweets.json?q=' + keyword +
          '&result_type=popular'),
    method: 'GET',
  };

  let request = axios.create({headers: oauth.toHeader(oauth.authorize(request_data, token))});

  return request.get(request_data.url).then(function(response){
    let posts = [];
    let statuses = response.data.statuses;
    for (status of statuses) {
      if(status.possibly_sensitive){
        continue;
      }
      let date = new Date(status.created_at);
      let url = "https://twitter.com/" + status.user.screen_name + "/status/" +
                  status.id_str;
      let p = {
        caption: status.text,
        img: status.entities.media && status.entities.media.length ?
              status.entities.media[0].media_url : null,
        timestamp: date.getTime(),
        type: 'twitter',
        url: url
      };
      posts.push(p);
    }

    return posts;
  });
}

function getInstagramPosts(keyword){
  keyword = _.replace(keyword, " ", "");
  return axios.get(
      encodeURI('https://www.instagram.com/explore/tags/' + keyword + '/?__a=1')
    )
    .then(function(response) {
      let posts = [];
      let instagramPosts = response.data.graphql.hashtag.edge_hashtag_to_media.edges
      for (let post of instagramPosts) {
        let edges = post.node.edge_media_to_caption.edges;
        let p = {
          caption: edges.length ? edges[0].node.text : "",
          img: post.node.display_url,
          timestamp: post.node.taken_at_timestamp,
          type: 'instagram',
          url: edges.length ? 'https://instagram.com/p/' + post.node.shortcode : '',
        }
        posts.push(p);
      }
      return posts;
    });
}

function getPinterestPosts(keyword){
  return axios.get('https://www.googleapis.com/customsearch/v1?key=' +
                    process.env.GOOGLE_KEY + "&cx=" + process.env.GOOGLE_CX +
                  "&q=" + keyword)
              .then(function(response){
                let posts = [];
                for (post of response.data.items) {
                  let metatags = post.pagemap.metatags[0];
                  let p = {
                    caption: metatags.hasOwnProperty("og:description") ?
                              metatags["og:description"] : '',
                    img: metatags.hasOwnProperty("og:image") ?
                              metatags["og:image"] : '',
                    timestamp: null,
                    type: 'pinterest',
                    url: metatags.hasOwnProperty("og:url") ?
                              metatags["og:url"] : ''
                  };
                  posts.push(p);
                }
                return posts;
              });
}

function getTumblrPosts(keyword){
  return axios.get('https://api.tumblr.com/v2/tagged?tag=' + keyword + '&filter=text&api_key=' + process.env.TUMBLR_KEY)
                .then(function(response){
                  let results = response.data.response,
                      posts = [];
                  for (post of results) {
                    let p = {
                      caption: post.type == "text" ? post.body : (post.hasOwnProperty('caption') ? post.caption : post.summary),
                      img: post.type == "photo" ? post.photos[0].original_size.url : null,
                      timestamp: post.timestamp,
                      type: 'tumblr',
                      url: post.post_url
                    };
                    posts.push(p);
                  }
                  return posts;
                });
}

app.get('/test/:keyword', async (req, res) => {
  let keyword = req.params.keyword
  await axios.all([getTumblrPosts(keyword)])
        .then(axios.spread(function(posts){
          return res.json({posts});
        }))
        .catch(function(err){
          let statusCode = 500;
          if(err.response){
            statusCode = err.response.status;
          }
          return res.status(statusCode).json({error: err.message});
        });
});

app.get('/getPosts/:keyword', async (req, res) => {
  let keyword = req.params.keyword
  await axios.all([getInstagramPosts(keyword), getTwitterPosts(keyword),
                    getPinterestPosts(keyword), getTumblrPosts(keyword)])
        .then(axios.spread(function(instagramPosts, twitterPosts,
                                    pinterestPosts, tumblrPosts){
          let posts = [...instagramPosts, ...twitterPosts, ...pinterestPosts, ...tumblrPosts];
          posts = _.shuffle(posts);
          return res.json({posts});
        }))
        .catch(function(err){
          let statusCode = 500;
          if(err.response){
            statusCode = err.response.status;
          }
          return res.status(statusCode).json({error: err.message});
        });
});

app.listen(port, function(){
  console.log("listening");
});
