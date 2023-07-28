/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import customValidationMsg from './locales/custom_validation_msg.js';
import watch from './view.js';
import resources from './locales/index.js';
import parseRss from './rss.js';

const defaultLang = 'ru';

const extractUrls = (state) => {
  const urls = state.feeds.map((feed) => feed.url);
  return urls;
};

const validate = (url, urls) => {
  const schema = yup.string().url().notOneOf(urls).required();
  return schema
    .validate(url)
    .then(() => null)
    .catch((error) => error.message);
};

const createProxyUrl = (url) => {
  const proxyUrl = new URL('get', 'https://allorigins.hexlet.app');
  proxyUrl.searchParams.set('disableCache', true);
  proxyUrl.searchParams.set('url', url);
  return proxyUrl.href;
};

const processPosts = (rss) => {
  const items = rss.querySelectorAll('item');
  const posts = [];
  items.forEach((item) => {
    const title = item.querySelector('title').textContent;
    const description = item.querySelector('description').textContent;
    const link = item.querySelector('link').textContent;
    const id = item.querySelector('guid').textContent;
    posts.push({
      title,
      description,
      link,
      id,
    });
  });
  return posts;
};

const processFeed = (rss, url) => {
  const feed = rss.querySelector('channel');
  const title = feed.querySelector('title').textContent;
  const description = feed.querySelector('description').textContent;
  return { title, description, url };
};

const getRss = (url, state) => {
  const proxyUrl = createProxyUrl(url);
  return axios
    .get(proxyUrl)
    .then((response) => {
      const { data } = response;
      const rss = parseRss(data.contents);
      const feed = processFeed(rss, url);
      const posts = processPosts(rss);
      state.loadingProcess.status = 'success';
      state.feeds.push(feed);
      state.posts.push(...posts);
    })
    .catch(({ message }) => {
      switch (message) {
        case 'Network Error':
          state.loadingProcess.error = 'networkError';
          break;
        case 'parseError':
          state.loadingProcess.error = 'parseError';
          break;
        default:
          state.loadingProcess.error = 'unknownError';
      }
      state.loadingProcess.status = 'failed';
    });
};

const updateRss = (time, state) => {
  setTimeout(() => {
    const urls = extractUrls(state);
    const newRss = urls.map((url) => getRss({ urls: [url] }));
    const oldPosts = state.posts;
    Promise.all(newRss).then((item) => {
      const newPosts = item.map(({ rss }) => processPosts(rss));
      const uniquePosts = newPosts
        .flat()
        .filter((newPost) => !oldPosts.some((oldPost) => oldPost.id === newPost.id));
      if (uniquePosts.length > 0) {
        state.posts = [...uniquePosts, ...state.posts];
      }
    });
    updateRss(time, state);
  }, time);
};

const loadRss = (url, state) => {
  state.loadingProcess.status = 'loading';
  getRss(url, state);
  state.loadingProcess.status = 'idle';
};

export default () => {
  const elements = {
    form: document.querySelector('.rss-form'),
    submit: document.querySelector('button[type="submit"]'),
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
    modal: document.querySelector('#modal'),
  };
  const initState = {
    form: {
      isValid: true,
      error: '',
    },
    loadingProcess: {
      state: 'idle',
      error: '',
    },
    ui: {
      activePost: '',
    },
    posts: [],
    feeds: [],
    viewedPosts: new Set(),
  };
  i18next
    .init({
      debug: false,
      lng: defaultLang,
      resources,
    })
    .then(() => {
      yup.setLocale(customValidationMsg);
      const watchedState = watch(elements, i18next, initState);
      const urls = extractUrls(watchedState);
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        validate(url, urls).then((error) => {
          if (error) {
            watchedState.form.isValid = false;
            watchedState.form.error = error;
            return;
          }
          watchedState.form = { isValid: true, error: '' };
          loadRss(url, watchedState);
        });
      });

      elements.posts.addEventListener('click', (e) => {
        if (e.target.tagName === 'BUTTON') {
          watchedState.ui.activePost = e.target.dataset.id;
          watchedState.viewedPosts.add(e.target.dataset.id);
        }
        if (e.target.tagName === 'A') {
          watchedState.viewedPosts.add(e.target.dataset.id);
        }
      });
      if (urls.length > 0) updateRss(5000, watchedState);
    });
};
