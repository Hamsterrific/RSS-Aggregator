/* eslint-disable no-param-reassign */
import i18next from 'i18next';
import axios from 'axios';
import * as yup from 'yup';
import { uniqueId } from 'lodash';
import customValidationMsg from './locales/custom_validation_msg.js';
import watch from './view.js';
import resources from './locales/index.js';
import parseRss from './rss.js';

const defaultLang = 'ru';
const updateInterval = 5000;

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

const addUniqueId = (data) => data.map((item) => { item.id = uniqueId(); return item; });

const getRss = (url, state) => {
  const proxyUrl = createProxyUrl(url);
  return axios
    .get(proxyUrl)
    .then((response) => {
      const { data } = response;
      const { title, description, items } = parseRss(data.contents);
      state.loadingProcess.status = 'success';
      const posts = addUniqueId(items);
      state.feeds.push({ title, description, url });
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
  const urls = extractUrls(state);
  const oldPosts = state.posts;

  const axiosRequests = urls.map((url) => {
    const proxyUrl = createProxyUrl(url);
    return axios.get(proxyUrl)
      .then((response) => {
        const { items } = parseRss(response.data.contents);
        return addUniqueId(items);
      });
  });

  Promise.all(axiosRequests)
    .then((newPostsArray) => {
      const newPosts = newPostsArray.flat();
      const uniquePosts = newPosts
        .filter((newPost) => !oldPosts.some((oldPost) => oldPost.id === newPost.id));
      if (uniquePosts.length > 0) {
        state.posts = [...uniquePosts, ...state.posts];
      }
    })
    .catch((error) => {
      console.error(error);
    })
    .finally(() => {
      setTimeout(() => updateRss(time, state), time);
    });
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
      status: 'idle',
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
      elements.form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const url = formData.get('url');
        const urls = extractUrls(watchedState);
        validate(url, urls).then((error) => {
          if (error) {
            watchedState.form = { isValid: false, error };
            return;
          }
          watchedState.form = { isValid: true, error: '' };
          watchedState.loadingProcess.status = 'loading';
          getRss(url, watchedState)
            .then(() => {
              watchedState.loadingProcess.status = 'idle';
            });
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
      updateRss(updateInterval, watchedState);
    });
};
