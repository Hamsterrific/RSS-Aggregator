import onChange from 'on-change';
import i18next from 'i18next';

export default (elements, i18n, initialState) => {
  const renderForm = (state) => {
    const { input, feedback } = elements;
    if (!state.form.isValid || state.loadingProcess.status === 'failed') {
      input.classList.add('is-invalid');
      feedback.classList.remove('text-success');
      feedback.classList.add('text-danger');
    } else {
      input.classList.remove('is-invalid');
      feedback.classList.remove('text-danger');
      feedback.classList.add('text-success');
    }
    feedback.textContent = i18next.t(state.form.error);
  };

  const createCard = (type) => {
    const card = document.createElement('div');
    card.classList.add('card', 'border-0');
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title', 'h4');
    cardTitle.textContent = i18n.t(type);
    card.append(cardBody, cardTitle);
    return card;
  };

  const renderFeeds = (state) => {
    const parent = elements.feeds;
    parent.innerHTML = '';
    const card = createCard('feeds');
    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group', 'border-0', 'rounded-0');
    state.feeds.forEach((item) => {
      const feed = document.createElement('li');
      const title = document.createElement('h3');
      const description = document.createElement('p');

      feed.classList.add('list-group-item', 'border-0', 'border-end-0');
      title.classList.add('h6', 'm-0');
      description.classList.add('m-0', 'small-text-black-50');

      title.textContent = item.title;
      description.textContent = item.description;

      listGroup.appendChild(feed);
      feed.appendChild(title);
      feed.appendChild(description);
    });
    parent.append(card);
    card.append(listGroup);
  };

  const renderPosts = (state) => {
    const parent = elements.posts;
    parent.innerHTML = '';
    const card = createCard('posts');
    const listGroup = document.createElement('ul');
    listGroup.classList.add('list-group', 'border-0', 'rounded-0');
    state.posts.forEach((post) => {
      const { title, link, id } = post;
      const item = document.createElement('li');
      item.classList.add(
        'list-group-item',
        'd-flex',
        'justify-content-between',
        'align-items-start',
        'border-0',
        'border-end-0',
      );
      const itemLink = document.createElement('a');
      itemLink.setAttribute('target', '_blank');
      itemLink.setAttribute('rel', 'noopener noreferrer');
      itemLink.dataset.id = id;
      itemLink.href = link;
      itemLink.textContent = title;
      if (state.viewedPosts.has(id)) {
        itemLink.classList.remove('fw-bold');
        itemLink.classList.add('fw-normal', 'link-secondary');
      } else {
        itemLink.classList.add('fw-bold');
      }

      const button = document.createElement('button');
      button.setAttribute('type', 'button');
      button.setAttribute('data-id', id);
      button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
      button.setAttribute('data-bs-toggle', 'modal');
      button.setAttribute('data-bs-target', '#modal');
      button.textContent = i18n.t('view');
      listGroup.appendChild(item);
      item.append(itemLink, button);
    });
    parent.append(card);
    card.append(listGroup);
  };

  const renderModal = (state) => {
    const modalTitle = elements.modal.querySelector('.modal-title');
    const modalBody = elements.modal.querySelector('.modal-body');
    const modalLink = elements.modal.querySelector('.full-article');
    const id = state.ui.activePost;
    const { title, link, description } = state.posts.find((post) => post.id === id);
    modalTitle.textContent = title;
    modalBody.textContent = description;
    modalLink.href = link;
  };

  const handleLoadingProcess = (state) => {
    const {
      form, feedback, input, submit,
    } = elements;

    switch (state.loadingProcess.status) {
      case 'loading':
        feedback.textContent = '';
        submit.setAttribute('disabled', '');
        input.setAttribute('disabled', '');
        break;
      case 'success':
        renderForm(state);
        feedback.classList.replace('text-danger', 'text-success');
        feedback.textContent = i18n.t('loadSuccess');
        submit.removeAttribute('disabled');
        input.removeAttribute('disabled');
        elements.input.focus();
        form.reset();
        break;
      case 'failed':
        renderForm(state);
        feedback.classList.replace('text-success', 'text-danger');
        feedback.textContent = i18next.t(`errors.${state.loadingProcess.error}`);
        submit.removeAttribute('disabled');
        input.removeAttribute('disabled');
        elements.input.focus();
        form.reset();
        break;
      default:
        break;
    }
  };

  const state = onChange(initialState, (path) => {
    switch (path) {
      case 'form':
        renderForm(state);
        break;
      case 'loadingProcess':
        handleLoadingProcess(state);
        break;
      case 'feeds':
        renderFeeds(state);
        break;
      case 'viewedPosts':
      case 'posts':
        renderPosts(state);
        break;
      case 'ui.activePost':
        renderModal(state);
        break;
      default:
        break;
    }
  });

  return state;
};
