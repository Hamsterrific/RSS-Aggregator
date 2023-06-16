import onChange from 'on-change';

export default (elements, i18n, initialState) => {
    const renderForm = (state) => {
        const { form, input } = elements;
        if (state.form.valid) {
            input.classList.remove('is-invalid');
        } else {
            input.classList.add('is-invalid');
        };
        if (state.form.submitted) {
            form.reset();
            input.focus();
        }
    };

    const renderFeedback = (state) => {
        const { feedback } = elements;
        if (state.feedback.valid) {
            feedback.classList.remove('text-danger');
            feedback.classList.add('text-success');
          } else {
            feedback.classList.remove('text-success');
            feedback.classList.add('text-danger');
          }
          feedback.textContent = state.feedback.message;
    };

    const renderFeeds = (state) => {
      const listGroup = document.querySelector('.feeds .card .list-group');
      state.feeds.forEach((feed) => {
        const item = document.createElement('li');
        item.classList.add('list-group-item', 'border-0', 'border-end-0');
        listGroup.appendChild(item);
        const itemTitle = document.createElement('h3');
        itemTitle.classList.add('h6', 'm-0');
        itemTitle.textContent = feed.title;
        item.appendChild(itemTitle);
        const itemDesc = document.createElement('p');
        itemDesc.classList.add('m-0', 'small-text-black-50');
        itemDesc.textContent = feed.description;
        item.appendChild(itemDesc);
      });
    };

    const renderPosts = (state) => {
      const listGroup = document.querySelector('.posts .card .list-group');
      state.posts.forEach((post) => {
        const { title, link, id } = post;
        const item = document.createElement('li');
        item.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
        listGroup.appendChild(item);
        const itemLink = document.createElement('a');
        const button = document.createElement('button');
        item.append(itemLink, button);
        itemLink.outerHTML = `<a href="${link}" data-id="${id}" target="_blank" rel="noopenernoreferrer">${title}</a>`;
        itemLink.classList.add('fw-bold');
        button.outerHTML = `<button type="button" data-id="${id}" data-bs-toggle="modal" data-bs-target="#modal">${i18n.t('view')}</button>`;
        button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      })
    };
    
    const renderContainer = (state, type) => {
      const parent = document.querySelector(`.${type}`);
      parent.innerHTML = '';
      const card = document.createElement('div');
      card.classList.add('card', 'border-0');
      parent.appendChild(card);
      const cardBody = document.createElement('div');
      cardBody.classList.add('card-body');
      card.appendChild(cardBody);
      const cardTitle = document.createElement('h2');
      cardTitle.classList.add('card-title', 'h4');
      cardTitle.textContent = i18n.t(type);
      card.appendChild(cardTitle);
      const listGroup = document.createElement('ul');
      listGroup.classList.add('list-group', 'border-0', 'rounded-0');
      card.appendChild(listGroup);
      switch(type) {
        case 'feeds':
          renderFeeds(state);
          break;
        case 'posts':
          renderPosts(state);
          break;
        default:
          break;
      }
    }

    const state = onChange(initialState, (path) => {
        switch (path) {
          case 'form.valid':
          case 'form.submitted':
            renderForm(state);
            break;
          case 'feedback.message':
            renderFeedback(state);
            break;
          case 'feeds':
            renderContainer(state, 'feeds');
            break;
          case 'posts':
            renderContainer(state, 'posts');
            break;
          default:
            break;
        }
      });
    
      return state;
};